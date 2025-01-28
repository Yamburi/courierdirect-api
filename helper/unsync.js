const fs = require("fs");

/**
 * Deletes a file if it exists (synchronous version).
 * @param {string} filePath - The path to the file to delete.
 */
const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    } catch (err) {
      console.error(`Failed to delete file: ${filePath}`, err);
    }
  } else {
    console.warn(`File not found: ${filePath}`);
  }
};

module.exports = { deleteFile };
