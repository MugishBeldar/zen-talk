const multer = require('multer');

// Configure multer storage (using memory storage in this example)
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;