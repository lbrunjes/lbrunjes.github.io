var data = [];
var mapname = "ns2_descent";
var build =240;
var offset = 0;
var windowSize =800;
var rotX =0;
var mouseLastX = 0;
var mouseLastY = 0;


var level = {
	"min":{"x":0,"y":0,"z":0},
	"max":{"x":0,"y":0,"z":0},
	"center":{"x":0,"y":0,"z":0},
	"scale":{"x":1,"y":1,"z":1,"out":1},
	"cam":{"x":1,"y":1,"z":1}
};
var show = {
	"marines":true,
	"aliens":true,
	"color": true,
	"skulk": true,
	"gorge": true,
	"lerk": true,
	"fade": true,
	"onos": true,
	"marine": true,	
	"jetpack": true,
	"exo": true
	
};
var size = {
	"skulk": 3,
	"gorge": 3,
	"lerk": 4,
	"fade": 5,
	"onos": 6,
	"marine":2,	
	"jetpack": 4,
	"exo": 6
	
};

var fillColors = {
	"skulk": 0,
	"gorge": 64,
	"lerk": 128,
	"fade": 192,
	"onos": 256,
	"marine":64,	
	"jetpack": 128,
	"exo": 192
	
};