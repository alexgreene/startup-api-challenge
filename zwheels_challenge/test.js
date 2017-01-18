var app = require('./server');
var sc = require('./zwheels');

const assert = require('assert');

var result;

/* TEST VEHICLE INFO ENDPOINT */
var gm_return_info = {
    "vin": {
      "type": "String",
      "value": "123123412412"
    },
    "color": {
      "type": "String",
      "value": "Metallic Silver"
    },
    "fourDoorSedan": {
      "type": "Boolean",
      "value": "True"
    },
    "twoDoorCoupe": {
      "type": "Boolean",
      "value": "False"
    },
    "driveTrain": {
      "type": "String",
      "value": "v8"
    }
};

// What if the VIN is a number, not a string?
gm_return_info.vin.value = 123123412412;
result = sc.logic_for.info(gm_return_info);
console.assert(typeof result.vin === "string");
gm_return_info.vin.value = "123123412412";


// What if both coupe/sedan have been checked?
gm_return_info.fourDoorSedan.value = "True";
gm_return_info.twoDoorCoupe.value = "True";
try {
	result = sc.logic_for.info(gm_return_info);
	console.log("ERROR: both coupe/sedan set to true should have caused an Error.")
} catch(err) {}


// What if neither coupe nor sedan have been checked?
gm_return_info.fourDoorSedan.value = "False";
gm_return_info.twoDoorCoupe.value = "False";
result = sc.logic_for.info(gm_return_info);
console.assert(result.doorCount == null);

// What if both coupe/sedan have null values?
gm_return_info.fourDoorSedan.value = null;
gm_return_info.twoDoorCoupe.value = null;
result = sc.logic_for.info(gm_return_info);
console.assert(result.doorCount == null);

// What if either coupe or sedan has a null value?
gm_return_info.twoDoorCoupe.value = null;
gm_return_info.fourDoorSedan.value = "True";
result = sc.logic_for.info(gm_return_info);
console.assert(result.doorCount == 4);

// What if no color key/value was given?
gm_return_info.color = null;
result = sc.logic_for.info(gm_return_info);
console.assert(result.color == null);



/* TEST SECURITY ENDPOINT */
var gm_return_doors = {
	"doors": {
	  "type": "Array",
	  "values": [
	    {
	      "location": {
	        "type": "String",
	        "value": "frontLeft"
	      },
	      "locked": {
	        "type": "Boolean",
	        "value": "False"
	      }
	    },
	    {
	      "location": {
	        "type": "String",
	        "value": "frontRight"
	      },
	      "locked": {
	        "type": "Boolean",
	        "value": "True"
	      }
	    }
	  ]
	}
};

// What if some of the doors have null locked values?
gm_return_doors.doors.values[0].locked.value = null;
result = sc.logic_for.doors(gm_return_doors);
console.assert(result.length == gm_return_doors.doors.values.length);

// What if all of the doors have null locked values?
gm_return_doors.doors.values[1].locked.value = null;
result = sc.logic_for.doors(gm_return_doors);
console.assert(result.length == gm_return_doors.doors.values.length);

// What if there are no doors?
gm_return_doors.doors.values = [];
result = sc.logic_for.doors(gm_return_doors);
console.assert(result.length == gm_return_doors.doors.values.length);



/* TEST FUEL & BATTERY ENDPOINTS */
var gm_return_energy = {
	"data": {
	  "tankLevel": {
	    "type": "Number",
	    "value": "30"
	  },
	  "batteryLevel": {
	    "type": "Null",
	    "value": "null"
	  }
	}
};

// What if the fuel value is null?
gm_return_energy.data.tankLevel.value = null;
result = sc.logic_for.fuel(gm_return_energy);
console.assert(result.percent == null);
gm_return_energy.data.tankLevel.value = 30;

// What if the fuel value is negative?
gm_return_energy.data.tankLevel.value = -1;
try {
	result = sc.logic_for.fuel(gm_return_energy);
	console.log("ERROR: negative fuel level should have caused an Error.")
} catch(err) {}

// What if the fuel value is greater than 100?
gm_return_energy.data.tankLevel.value = 101;
try {
	result = sc.logic_for.fuel(gm_return_energy);
	console.log("ERROR: overflow fuel level should have caused an Error.")
} catch(err) {}
gm_return_energy.data.tankLevel.value = 76;

// What if the battery value is null?
gm_return_energy.data.batteryLevel.value = null;
result = sc.logic_for.battery(gm_return_energy);
console.assert(result.percent == null);
gm_return_energy.data.batteryLevel.value = 43.5;


// What if the battery value is negative?
gm_return_energy.data.batteryLevel.value = -3;
try {
	result = sc.logic_for.battery(gm_return_energy);
	console.log("ERROR: negative battery level should have caused an Error.")
} catch(err) {}


// What if the battery value is greater than 100?
gm_return_energy.data.batteryLevel.value = 1000;
try {
	result = sc.logic_for.battery(gm_return_energy);
	console.log("ERROR: overflow battery level should have caused an Error.")
} catch(err) {}



/* TEST ENGINE CONTROL ENDPOINT */
var gm_return_engine = {
  "actionResult": {
    "status": "EXECUTED"
  }
}

// What if the engine command failed?
gm_return_engine.actionResult.status = "FAILED";
result = sc.logic_for.engine(gm_return_engine);
console.assert(result.status == 'error');


// What if the engine command succeeded?
gm_return_engine.actionResult.status = "EXECUTED";
result = sc.logic_for.engine(gm_return_engine);
console.assert(result.status == 'success');

console.log("Test suite finished running.")
process.exit();


