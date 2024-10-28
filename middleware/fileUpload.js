const multer = require("multer");
const path = require("path");

const storage = (destination) =>
  multer.diskStorage({
    destination,
    filename: (req, file, callBack) => {
      callBack(null, file.originalname);
    },
  });

const sliderUpload = multer({
  storage: storage(path.join(__dirname, "../uploads/slider")),
  // limits: { fileSize: 1200000 },
});
const whyUsUpload = multer({
  storage: storage(path.join(__dirname, "../uploads/why-us")),
  // limits: { fileSize: 1200000 },
});

const testimonialUpload = multer({
  storage: storage(path.join(__dirname, "../uploads/testimonial")),
  // limits: { fileSize: 1200000 },
});

const serviceUpload = multer({
  storage: storage(path.join(__dirname, "../uploads/service")),
  // limits: { fileSize: 1200000 },
});
const chatUpload = multer({
  storage: storage(path.join(__dirname, "../uploads/chat")),
  // limits: { fileSize: 1200000 },
});

module.exports = {
  sliderUpload,
  whyUsUpload,
  testimonialUpload,
  serviceUpload,
  chatUpload,
};
