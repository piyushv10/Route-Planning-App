const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes"); // Import routes from routes.js

const cors = require("cors");
const path = require("path");
const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

// app.use(express.static(path.join(__dirname, "client", "build")));

app.use("/", routes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
