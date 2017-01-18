var gm = require("./gm_layer");

// These are the logic units for each of the endpoints.
// Exported separatedly so they can bu unit tested in 
// the test module.
var logic_for = {
	info: function(data) {
		return {
			"vin": safe_string(data.vin),
			"color": safe(data.color),
			"doorCount": determineDoorCount(
				safe(data.twoDoorCoupe),
				safe(data.fourDoorSedan)
			),
			"driveTrain": safe(data.driveTrain)
		}
	},
	doors: function(data) {
		var doors = [];
		for (i in data.doors.values) {
			doors.push({
				"location": safe(data.doors.values[i].location),
				"locked": toBool( safe(data.doors.values[i].locked) )
			})
		}
		return doors;
	},
	fuel: function(data) {
		var pct = safe(data.data.tankLevel);
		if (pct) pct = parseFloat(pct);

		if (pct < 0 || pct > 100) {
			throw new Error("Fuel level reported beyond 0-100 scale.");
		}
		return {
			"percent": pct, 
		}
	},
	battery: function(data) {
		var pct = safe(data.data.batteryLevel);
		if (pct) pct = parseFloat(pct);

		if (pct < 0 || pct > 100) {
			throw new Error("Battery level reported beyond 0-100 scale.");
		}
		return {
			"percent": pct, 
		}
	}, 
	engine: function(data) {
		return {
			"status": data.actionResult.status == "FAILED" ? "error" : "success"
		}
	}
}

exports.logic_for = logic_for;

// Get basic information about a vehicle.
/*  Returns the following JSON formatted data:
	vin - String
	color - String
	doorCount - number
	drivetrain - String

	NOTE: Values will be null if the data is not available.
*/
exports.getVehicleInfo = function (req, resp) {
	gm.vehicle_info(
		req.params.id, 
		function (error, response, body) {
			try {
				checkGMResponse(error, body, "getVehicleInfoService");
				var info = logic_for.info(body.data);
				resp.json(info);
			} catch (err) {
				resp.status(500).send(err);
			}	
	});
}


// Get the security status of each of the vehicle doors.
/*  Returns a JSON formatted array of objects representing doors, each containing:
	location - String
	locked - Boolean

	NOTE: Values will be null if the data is not available.
*/
exports.getDoorInfo = function(req, resp) {
	gm.security_info(
		req.params.id,
		function (error, response, body) {
			try {
				checkGMResponse(error, body, "getSecurityStatusService");

				var doors = logic_for.doors(body.data);
				resp.json(doors);
			} catch (err) {
				resp.status(500).send(err);
			}	
	});
}


// Get the fuel level of the vehicle.
/*  Returns the following JSON formatted data:
	percent - number 

	NOTE: Values will be null if the data is not available.
*/
exports.getFuelInfo = function(req, resp) {
	gm.energy_info(
		req.params.id, 
		function (error, response, body) {
			try {
				checkGMResponse(error, body, "getEnergyService");

				var percent = logic_for.fuel(body);
				resp.json(percent);
			} catch (err) {
				resp.status(500).send(err);
			}	
	});
}


// Get the battery level of the vehicle.
/*  Returns the following JSON formatted data:
	percent - number
	
	NOTE: Values will be null if the data is not available.
*/
exports.getBatteryInfo = function(req, resp) {
	gm.energy_info(
		req.params.id,
		function (error, response, body) {
			try {
				checkGMResponse(error, body, "getEnergyService");

				var percent = logic_for.battery(body);
				resp.json(percent);
			} catch (err) {
				resp.status(500).send(err);
			}	
	});
}


// Turn the vehicle engine on or off.
/*  Requires the following POST data:
	action - String ("START|STOP")

	Returns the following JSON formatted data:
	status - String
	
	NOTE: Values will be null if the data is not available.
*/
exports.setEngineState = function(req, resp) {
	if (!req.body || !(req.body.action in ["START", "STOP"])) {
		esp.status(400).send("'action' invalid, acceptable options are ['START', 'STOP'].");
	}

	gm.engine_control(
		req.params.id,
		req.body.action + "_VEHICLE",
		function (error, response, body) {
			try {
				checkGMResponse(error, body, "actionEngineService");

				var status = logic_for.engine(body.actionResult);
				resp.json(status);
			} catch (err) {
				resp.status(500).send(err);
			}	
	});
}


/* HELPERS */

// Determine number of doors vehicle has, based on if it is
// a coupe or sedan. If neither, null returned. If both, an
// Error is thrown.
function determineDoorCount(coupe, sedan) {
	if (coupe === sedan) {
		if (coupe === "True") {
			throw new Error("Vehicle has been marked as coupe and sedan simultaneously.");
		}
		return null;
	} 
	else {
		return sedan == "True" ? 4 : 2;
	}
}


// Return a keys value, or null if the key does not exist.
function safe(source) {
	return source ? source.value : null;
}

function safe_string(key) {
	var value = safe(key);
	return value == null ? value : value.toString();
}

// Convert string to boolean, or to null if no true/false match found.
function toBool(str) {
	if (!str) return null;

	var s = str.toLowerCase().trim();
	if (s === "false") return false;
	if (s === "true") return true;
	return null;
}


// Make sure the response from GM API is complete
function checkGMResponse(error, body, queried_service) {
	if (error) throw new Error(error);
	if (!body) throw new Error("No response body found.");
	if (body.status != "200") throw new Error("Non-200 GM Response: " + body.status);

	// Verify that service we've requested data from is
	// the same one we're receiving data back from. 
	if (queried_service != body.service + "Service") {
		throw new Error("Service mismatch.");
	}
}
