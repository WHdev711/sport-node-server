const express = require("express");
// const bodyParser = require("body-parser"); /* deprecated */
const cors = require("cors");
const axios = require('axios')

var contacts;
axios
  .get('https://api.ps3838.com/v3/sports', { headers: { 'Authorization': 'Basic QklBMDAwMzcxQjpWYXNjb2NhYnJvbjI0' } })
  .then(res => {
    contacts = res.data;
    // console.log(contacts);
  })
  .catch(error => {
    console.error(error)
  });

const app = express();

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));

app.use(express.json());  /* bodyParser.json() is deprecated */

app.use(express.urlencoded({ extended: true }));   /* bodyParser.urlencoded() is deprecated */

// // drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// simple route
app.get("/", (req, res) => {
  return res.json({ message: contacts });
});

require("./app/routes/ps3838.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
