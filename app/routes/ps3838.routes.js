module.exports = app => {
  const ps3838 = require("../controllers/ps3838.controller.js");

  var router = require("express").Router();

  // Retrieve all Ps3838 Odds by SportIds
  router.get("/", ps3838.GetOdds);

  // Retrieve all Ps3838 fixtures by SportIds
  router.get("/getfixtures", ps3838.GetFixtures);

  app.use('/api/ps3838', router);
};
