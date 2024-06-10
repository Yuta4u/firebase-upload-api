const multer = require("multer")
const path = require("path")

// Setup memory storage for multer
const storage = multer.memoryStorage()

// File size limit and file type filter
const limits = { fileSize: 1000000 }
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase())
  const mimeType = fileTypes.test(file.mimetype)

  if (mimeType && extName) {
    return cb(null, true)
  } else {
    cb("Error: Images Only !!!")
  }
}

// Multer configurations
const uploadSingle = multer({ storage, limits, fileFilter }).single("image")
const uploadMultiple = multer({ storage, limits, fileFilter }).array(
  "images",
  12
)

module.exports = { uploadSingle, uploadMultiple }
