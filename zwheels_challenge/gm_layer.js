var request = require("request");

/* GM API Endpoints */
/*  This gm_layer module provides functions to hit all 4 provided 
	GM API endpoints. These functions will be called from the
	zwheels module, and the zwheels module will also provide
	the callback functions to be passed into the functions below.
*/

var gm_url = "[redacted]";

exports.vehicle_info = function vehicle_info(id, callback) {
	request({
			url: gm_url + "getVehicleInfoService", 
			method: "POST",
			json: {
				id: id,
				"responseType": "JSON"
			}
		},
		callback
	);
}

exports.security_info = function security_info(id, callback) {
	request({
			url: gm_url + "getSecurityStatusService", 
			method: "POST",
			json: {
				id: id,
				"responseType": "JSON"
			}
		},
		callback
	);
}

exports.energy_info = function energy_info(id, callback) {
	request({
			url: gm_url + "getEnergyService", 
			method: "POST",
			json: {
				id: id,
				"responseType": "JSON"
			}
		},
		callback
	);
}

exports.engine_control = function engine_control(id, command, callback) {
	request({
			url: gm_url + "actionEngineService", 
			method: "POST",
			json: {
				id: id,
				command: command,
				"responseType": "JSON"
			}
		},
		callback
	);
}

