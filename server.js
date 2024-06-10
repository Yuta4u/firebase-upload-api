const express = require("express")
const app = express()
require("dotenv").config()
const bodyParser = require("body-parser")
const serverless = require("serverless-http")
const cors = require("cors")

const { uploadSingle, uploadMultiple } = require("./middleware/multer")
const { getStorage, ref, uploadBytesResumable } = require("firebase/storage")
const { signInWithEmailAndPassword } = require("firebase/auth")
const { auth } = require("./config/firebase.config")

// Set up CORS to allow requests from the specific origin
const corsOptions = {
  origin: "https://asm-inventory.netlify.app",
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))

app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Helper function to upload images to Firebase
async function uploadImageToFirebase(file) {
  const storage = getStorage()
  const dateTime = Date.now()
  const fileName = `images/${dateTime}-${file.originalname}`
  const storageRef = ref(storage, fileName)
  const metadata = {
    contentType: file.mimetype,
  }

  await uploadBytesResumable(storageRef, file.buffer, metadata)
  return fileName
}

// Route to handle single image upload
app.post("/upload-single", uploadSingle, async (req, res) => {
  try {
    await signInWithEmailAndPassword(
      auth,
      process.env.FIREBASE_USER,
      process.env.FIREBASE_AUTH
    )

    const fileName = await uploadImageToFirebase(req.file)
    res.status(200).send({
      status: "SUCCESS",
      imageName: fileName,
    })
  } catch (err) {
    res.status(500).send({
      status: "ERROR",
      message: err.message,
    })
  }
})

// Route to handle multiple image upload
app.post("/upload-multiple", uploadMultiple, async (req, res) => {
  try {
    await signInWithEmailAndPassword(
      auth,
      process.env.FIREBASE_USER,
      process.env.FIREBASE_AUTH
    )

    const fileNames = []
    for (const file of req.files) {
      const fileName = await uploadImageToFirebase(file)
      fileNames.push(fileName)
    }

    res.status(200).send({
      status: "SUCCESS",
      imageNames: fileNames,
    })
  } catch (err) {
    res.status(500).send({
      status: "ERROR",
      message: err.message,
    })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app
module.exports.handler = serverless(app)
