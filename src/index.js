const express = require('express');
require("dotenv").config({path: "../.env"});
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const ErrorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const cors = require('cors');
// const bodyParser = require("body-parser");
const app = express();
const utils = require("./utils");

var swaggerUi = require("swagger-ui-express");
const { swaggerDocument } = require('./docs/swagger');   

// Header function to prevent cors errors
app.use(cors());

// start mongo db
connectDB();

// file upload
app.use(fileupload());

// Route files
const auth = require("./routes/auth");
const user = require("./routes/user");
const communication = require("./routes/communication");
const test = require("./routes/test");
const { protect } = require("./middleware/auth");

/** Body parser */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Mount routers
app.get("/", (req, res) => {
  res.status(200).send({
    status: "success",
    code: "02",
    message: "EXAM APP",
    data: JSON.stringify([]),
  });
});

app.post("/", (req, res) => {
  res.status(200).send({
    status: "success",
    code: "02",
    message: "Exam Application",
    data: JSON.stringify([]),
  });
});

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
app.use("/api/v2/auth", auth);
app.use("/api/v2/user", user);
// app.use("/api/v2/candidate", candidate);
app.use("/api/v2/communication", communication);
app.use("/api/v2/test", test);

app.use(ErrorHandler);
app.use(express.static('public/uploads'));

// catch 404 and forwarding to error handler
app.use(function (req, res) {
  return res.status(404).json({
    status: 'error',
    message: 'Route not found',
    data: null,
  });
});

/*** Development logging middleware */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} on port ${process.env.PORT}`
  );
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);

  /* Close Server and exit process */
  server.close(() => process.exit(1));
});
