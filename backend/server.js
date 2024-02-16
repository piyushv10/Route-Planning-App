const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes"); // Import routes from routes.js

const cors = require("cors");

const app = express();
const port = 8080;

app.use(cors());
app.use(bodyParser.json());

app.use("/", routes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
