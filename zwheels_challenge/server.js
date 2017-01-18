var express = require("express");
var bp = require("body-parser");
var zwheels = require("./zwheels");

/* server.js */
/* 	Here the app is initialized, and its HTTP routes are
	created. I've set the app as an export so that it can
	be tested in a separate module.

*/
var app = express();
app.use(bp.json());

/* ROUTES */
app.get("/vehicles/:id", zwheels.getVehicleInfo);
app.get("/vehicles/:id/doors", zwheels.getDoorInfo);
app.get("/vehicles/:id/fuel", zwheels.getFuelInfo);
app.get("/vehicles/:id/battery", zwheels.getBatteryInfo);
app.post("/vehicles/:id/engine", zwheels.setEngineState);

module.exports = app;

app.listen(3000);


