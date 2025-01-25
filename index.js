const express = require("express");

const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: "./.env" });
const errorHandler = require("./middleware/errorHandler");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.resolve("./uploads")));

const routes = [
  require("./routes/admin/loginRoute"),
  require("./routes/admin/adminRoute"),
  require("./routes/admin/sliderRoute"),
  require("./routes/web/sliderRoute"),
  require("./routes/admin/faqRoute"),
  require("./routes/web/faqRoute"),
  require("./routes/admin/serviceDetailRoute"),
  require("./routes/web/serviceDetailRoute"),

  require("./routes/admin/queryRoute"),
  require("./routes/web/queryRoute"),
  require("./routes/admin/whyUsRoute"),
  require("./routes/web/whyUsRoute"),
  require("./routes/admin/testimonialRoute"),
  require("./routes/admin/deliveryRoute"),
  require("./routes/web/testimonialRoute"),
  ,
  require("./routes/admin/serviceRoute"),
  require("./routes/web/serviceRoute"),
  require("./routes/admin/contentRoute"),
  require("./routes/web/contentRoute"),
  require("./routes/admin/chatRoute"),
  require("./routes/web/chatRoute"),
  require("./routes/web/trackRoute"),
  require("./routes/web/deliveryRoute"),

  require("./routes/admin/changePasswordRoute"),
  require("./routes/admin/dashboardRoute"),
];

routes.forEach((route) => {
  app.use(route);
});

app.use(errorHandler);
// require("./helper/cron"),
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
