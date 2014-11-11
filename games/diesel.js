// Diesel built at Mon 10 Nov 2014 11:59:46 AM EST
/*
	diesel.js
	A simple event based js game engine 
	
	Copyright (c) 2014 Lee Brunjes (lee.brunjes@gmail.com)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.


*/

//the base diesel object must be laoded before we can load items
var diesel = function(){
	this.version="0.7.1";

	//setup slots to store components;
	this.data ={};
	this.events={};
	this.math ={};
	this.mixin={};
	this.proto={};
	this.sprites={};
	this.util = {};

	//engine vars
	this.container = document.getElementsByTagName("body")[0];
	this.mouseX;
	this.mouseY;
	
	this.fpsLimit  =30;
	this.debug =false;
	this.pauseOnBlur = true;
	this.shouldLoop =true;
	this.loopFn =false;

	
	this.lastFrameTime = 1;
	this.frameCount =0;

	this.loading = 0;

	this.timeStarted=0;
	this.lastFrameStart=0;
	this.lastFrameEnd=0;

	this.dataDirectory = "";

	this.font = "monospace";
	this.fontSize = 16;
	
	this.game = false;

	this.nextFrame=false;

	//engine functions that dont require full engine or the dom to be loaded.
	this.init = function(){
		//ensure the browser meets our basic requirements
		this.setCompatability();

		


	};


	//start should not be called until the dom is loaded.
	this.start = function(game){
		console.log("Diesel, starting v"+this.version);

		diesel.timeStarted = new Date();
		diesel.lastFrameEnd = new Date();
		diesel.lastFrameStart = new Date();

		//read url frangments
		diesel.util.url.read();

		diesel.container = document.getElementsByTagName("body")[0];
	
		
		//load vars into the diesel object from core plugins

		diesel.mixin.addMixin(this, diesel.data);
		diesel.mixin.addMixin(this, diesel.events);
		diesel.mixin.addMixin(this, diesel.math);
		diesel.mixin.addMixin(this, diesel.mixin);
		//proto is not loaded becasue they are stubs to build the game object on.
		diesel.mixin.addMixin(this, diesel.sprites);
		diesel.mixin.addMixin(this, diesel.util);


	
		//load the provided game objects
		if(!game){
			console.log("Diesel, warning:",
				" No game specified. Nothing will happen.");	
		}
		else{
			this.game =game;
			//setup where to look for data
			if(game.dataDirectory){
				//add a trailing slash if it is missing.
				if(game.dataDirectory.lastIndexOf('/') != 
					game.dataDirectory.length-1){
					game.dataDirectory = game.dataDirectory +"/";
				}
				this.dataDirectory = game.dataDirectory;
			}

			//load game assests
			if(game.preload){
				for(var i = 0 ; i < game.preload.length;i++){
					this.util.addPreload(game.preload[i]);
				}
			}


			//deal with the game container
			if(game.container && document.getElementById(game.container)){
				diesel.container = document.getElementById(game.container);
			}
			diesel.container.focus();

			//initialize canvas drawing contexts
			if(!game.context){
				console.log("Diesel, Warning:",
					"No contexts in game.context. No Canvas intilized");
			}
			else{
				for( var canvas in game.context){
					game.context[canvas] = diesel.util.createContext(canvas, game.context[canvas]);
				};
			}

			//bind diesel events
			diesel.events.bindEvents({
				"windowblur":diesel.events.windowblur,
				"windowfocus":diesel.events.windowfocus,
				"windowkeyup":diesel.events.windowkeyup,
				"mousemove":diesel.events.mousemove
			});
			//bind game events
			if(game.events){
				diesel.events.bindEvents(game.events);
			}

			diesel.events.raiseEvent("startup");

			diesel.loop();

		}




	};

	this.loop =function(){
		var frameStart = new Date();
		var timePassed = (frameStart - diesel.lastFrameStart)/1000;
		
		//spit out events
		diesel.raiseEvent("draw",timePassed);
		diesel.raiseEvent("update",timePassed);
		
		//Adjust internal counters and timers
		diesel.frameCount++;
		diesel.lastFrameStart = frameStart;
		diesel.lastFrameEnd = new Date();
		diesel.lastFrameTime = diesel.lastFrameEnd -frameStart;
		
		//allow the loop to continue
		if(diesel.shouldLoop){
			diesel.nextFrame =setTimeout(diesel.loop, 
				Math.abs(diesel.util.timeBetweenFrames()  - diesel.lastFrameTime)+1);
		}
		else{
			diesel.nextFrame = false;
		}

	};

	this.setCompatability = function(){
		if(!window.console){
			window.console = {"log":function(args){}};
		}
		if(!window.localStorage){
			console.log("Diesel, No Local Storage. Faking...");
			window.localStorage = {};
		}
	};

	this.init();
};

//build the base diesel objects
diesel = new diesel();

///
// diesel.data
///

diesel.data.keyNames =
{
	8:"Backspace",
	9:"Tab",
	13:"Enter",
	16:"Shift",
	17:"Ctrl",
	18:"Alt",
	20:"Caps Lock",
	27:"Escape",
	32:"Space",
	33:"Page Up",
	34:"Page Down",
	35:"End",
	36:"Home",
	37:"Left",
	38:"Up",
	39:"Right",
	40:"Down",
	45:"Insert",
	46:"Delete",
	48:"10",
	49:"1",
	50:"2",
	51:"3",
	52:"4",
	53:"5",
	54:"6",
	55:"7",
	56:"8",
	57:"9",
	112:"F1",
	113:"F2",
	114:"F3",
	115:"F4",
	116:"F5",
	117:"F6",
	118:"F7",
	119:"F8",
	120:"F9",
	121:"F11",
	122:"F11",
	123:"F12",
	144:"Num Lock",
	219:"[",
	220:"|",
	221:"]",
	222:"'"
};

diesel.data.getKeyName = function(keyCode){
	if( diesel.keyNames[keyCode]){
		return diesel. keyNames[keyCode];
	}
	// hope this  is a letter key:)
	return String.fromCharCode(keyCode);
};

diesel.data.directions={
	up: Math.PI,
	down: 0,
	left: Math.PI/2,
	right:Math.PI/2*3
};
///
// Diesel.events
///


//generates a dom event in te container
diesel.events.raiseEvent=function(eventName){
	var event;
	if (document.createEvent) {
		event = document.createEvent("HTMLEvents");
		event.initEvent(eventName, true, true);
	} else {
		event = document.createEventObject();
		event.eventType = eventName;
	}
	
	if( diesel.debug ){
		console.log("raising event", eventName);
	}
	
	event.eventName = eventName;
	event.args = [];
	//loop through arguements and 
	for(var i = 1; i<arguments.length;i++){
		event.args.push(arguments[i])
	}
	
	if (document.createEvent) {
		diesel.container.dispatchEvent(event);
	} else {
		diesel.container.fireEvent("on" + event.eventType, event);
	}


};

diesel.events.bindEvents = function(eventObject){

	//loop throught he object we got and 
	//bind events to the dom from it based on the name given
	// events prefixed with window will bind to the window in all cases
	
	for(event in eventObject){
		if(event && typeof(eventObject[event]) == "function"){
			if(event.indexOf("window") === 0){
				//remove the window at the start
				window.addEventListener(event.substring(6), 
					eventObject[event]);
			}
			else{
				
				diesel.container.addEventListener(event, 
					eventObject[event]);


			}
		}
	}
};

//set the engine x vars
diesel.events.mousemove= function(evt){
	
	var coords = diesel.util.getLocalCoords(evt.pageX, evt.pageY);

	diesel.mouseX = coords.x
	diesel.mouseY = coords.y;
	
};

//save and load events

diesel.events.save = function(name, data){
	if(window.localStorage){
		localStorage[name]= JSON.stringify(data);
		console.log("Diesel, Saved", name);
	}
	else{
		console.log("Diesel:Cannot save, not supported.")
	}
};

diesel.events.load = function(name){
	if(window.localStorage){
		if(localStorage[name]){
			return JSON.parse(localStorage[name]);
		}
		console.log("Diesel: Save not found");
	}
	else{
		console.log("Diesel: Cannot load, Not supported");
	}
	return false;
};

diesel.events.listSaves = function(){
	var saves = [];
	for(save in localStorage){
		saves.push(save);
	}
	return saves;
};

diesel.events.deleteSave = function(name){
	localStorage.removeItem(name);
};

diesel.events.windowblur=function(evt){
	if(diesel.pauseOnBlur){
		diesel.shouldLoop =false;
	}
};

diesel.events.windowfocus=function(evt){
	diesel.shouldLoop = true;
	if(!diesel.nextFrame){
		diesel.lastFrameEnd = new Date();
		diesel.lastFrameStart = new Date();
		diesel.loop();
	}
};

//caches last few keys to allow for keypress combos.
diesel.events.windowkeyup=function(evt){
	
	if(!diesel.lastKeys){
		diesel.lastKeys = [];
	}
	if(!diesel.keyCacheLength){
		diesel.keyCacheLength = 5;
	}
	
	diesel.lastKeys.push(evt.keyCode);

	
	if(diesel.lastKeys.length > diesel.keyCacheLength){
		diesel.lastKeys.splice(0,1);
	}
	
	//this is really important
	if(diesel.lastKeys.length ==5){
	if(diesel.lastKeys[0] == 73 &&
		diesel.lastKeys[1] == 68 &&
		diesel.lastKeys[2] == 68 &&
		diesel.lastKeys[3] == 81 &&
		diesel.lastKeys[4] == 68)
	
		console.log("YOU DIRTY RAT");
	
	}
};
///
// diesel.math
///

diesel.math.clamp = function(val, min, max){
	return Math.min(Math.max(val,min), max);
}


diesel.math.degrees = function(radians){
	return radians * (180/Math.PI);
}

diesel.math.radians = function(degrees){
	return degrees*(Math.PI/180);
}

diesel.math.lerp =function(a,b,c){
	return((b-a)*c)+a;
}
///
// diesel.mixin
///

diesel.mixin.addMixin = function(targetObject, mixin, overide){
	if(diesel.debug){
		console.log("adding", mixin, "to", targetObject);

	}

	if(!mixin){
		return;
	}


	var reservedVars = [
		"prototype",
		"overrideExisting",
	], 
	shouldOverride = mixin.shouldOverride||overide ||false;

	//add the mixin vars to the object.
	for(attr in mixin){
		if(mixin && 
			mixin[attr]&&
			(!targetObject[attr]||shouldOverride)){
			//this is a shallow copy we only care really about functions or you are mixining wrong.
			targetObject[attr] = mixin[attr];
		}
	}
}

///
//	diesel.proto
///

// the most basic in game unit has a position and a size
diesel.proto.objectBase =  function(){

	//attributes

	this.id=false;
	this.name="base Object";
	this.x=0;
	this.y=0;
	this.z=0;
	this.w=0;
	this.h=0;
	this.d=0;
	this.team="none";
	this.color="#666";
	this.selected=false;

	//functions

	this.draw=function(context){
		context.save();
			context.translate(this.x,this.y);
			context.rotate(this.r)
			context.translate(this.w/-2,this.h/-2);
			context.fillStyle = this.color;
			context.fillRect(0,0,this.w,this.h);
		context.restore();
	};
	
	this.update=function(ticks, id){
		if(!this.id || this.id != id){
			this.id = id;
		}
	};

	//helpers

	this.contains=function(x,y,z){
		if(!z){
			z=this.z;  
		}
		return Math.abs(x- this.x) <= this.w/2 	&&
			Math.abs(y - this.y) <= this.h/2 &&
			Math.abs(z-this.z) <= this.d/2;
		
	};
	this.direction=function(x,y,z){ 
		if(!z){
			return Math.atan2(this.x - x, this.y -y);
		}
		else{
			//TODO 3DSupport
			console.log("direction doesnt support 3d yet");
		}

	};
	this.distance= function(x,y,z){
		if(!z){
			z=this.z;
		}
		return Math.sqrt(Math.pow(this.x - x,2)+
			Math.pow(this.y - y,2)+
			Math.pow(this.z - z,2));

	};
	this.distanceSquared= function(x,y,z){
		if(!z){
			z=this.z;
		}
		return Math.pow(this.x - x,2)+
			Math.pow(this.y - y,2)+
			Math.pow(this.z - z,2);

	};
	this.manhattanDistance=function(x,y,z){
		return Math.abs(this.x - x) +
			Math.abs(this.y - y,2)+
			Math.abs(this.z - z);

	};

	this.move=function(ticks, angle, force){
		this.x -= Math.sin(angle) * ticks *force;
		this.y -= Math.cos(angle) * ticks *force;	
	};
	this.canMove=function(ticks, angle, speed){
		if(!ticks || ticks >1 || angle ===undefined ||!force){
			return false;
		}
		return true;
	};
	this.teleport=function(x,y,z){
		this.x = x;
		this.y = y;
		this.z = z|this.z;

	};
};
diesel.proto.screen = function(){
	//used to store data for use in the click function {x:i,y:i,w:i,h:i,click:fn}
	this.clickZones=[];
	
	//called to draw teh screen
	this.draw=function(ticks){
		
	};

	//called the update the state of the things in the scene
	this.update=function(ticks){

	};
	
	/*
	
	EVENTS START HERE
	
	*/
	
	//called when the object is clicked
	this.click=function(evt,x,y){
		var _x = x||diesel.mouseX,
		_y = y||diesel.mouseY;

		for(i in this.clickZones){
			if(this.clickZones[i].x < _x
				&& this.clickZones[i].x + this.clickZones[i].w > _x 
				&& this.clickZones[i].y < _y
				&& this.clickZones[i].y + this.clickZones[i].h > _y){
					
					this.clickZones[i].click(evt, _x,_y);
				}
			}
	};
	
	//called when a screen is created.
	this.open=function(event){
	
	};
	//called when  screen is closed.
	this.close=function(event){
	
	};
	//called at reset
	this.reset = function(event){

	};
	
	
	
	
	//draws the selected text centred horizontally on a point.
	this.fillTextCentered=function(ctx, text, x,y){
		var len = ctx.measureText(text).width;
		ctx.fillText(text, x -len/2,y);
	};
	
	//remvoes data from all canvases
	this.clearAllContexts=function(){
		for(canvas in diesel.game.context){
			diesel.game.context[canvas].clearRect(0,0,
				diesel.game.width, diesel.game.height);
		}
	};
	
	//highlights the zones in the screen
	this.drawClickZones=function(ctx){
		var fill = ctx.fillStyle;
	
		for(i in this.clickZones){
			ctx.fillRect(this.clickZones[i].x,this.clickZones[i].y,this.clickZones[i].w,this.clickZones[i].h);
			ctx.fillStyle = "#000000";
			if(this.clickZones[i].h >=diesel.fontSize *2){
			ctx.fillText(i, this.clickZones[i].x +this.clickZones[i].w/2,this.clickZones[i].y +this.clickZones[i].h/2);
			
			}
			else{
				ctx.fillText(i, this.clickZones[i].x +this.clickZones[i].w/2,this.clickZones[i].y +this.clickZones[i].h);
			}
			ctx.fillStyle =fill;
		}
	};

	//draw left aligned text in the box
	//overflowing text is removed
	this.drawParagraph=function(ctx, text, x, y, w, h){
		var lines = [], testingLine, last = 0;

		for(var i=0; i < text.length;i++){
			testingLine = text.substring(last, i);
			if(ctx.measureText(testingLine) >= w){
				lines.add(text.substring(last, i-1));
				last = i-1;
			}
		}

		var Y=0;


		for(var i = 0;i <lines.length && Y < h ;i++){
			ctx.fillText(lines[i],x,Y,w);
			Y+= diesel.fontSize;
		}


	};

};

/*
This is a prototype for your game object 
that provides a few basic things like  currently pressed keys
drwing hte current screen,



*/
diesel.proto.game =  function(){
	this.container="container";
	this.version="0.0.1";
	this.ticks=0;
	this.font="monospace";
	this.fontSize=16;
	this.width=640;
	this.height=480;
	this.activeScreen="loading";
	this.dataDirectory="data/";
	
	this.keys={
		"left":37, 
		"right":39,
		"up":38,
		"down":40
	};
	this.keysDown={
		"left":false, 
		"right":false,
		"up":false,
		"down":false	
	};
	this.events={
		"draw":function(event){
			diesel.game.screens[diesel.game.activeScreen].draw(event.args[0]);
		},
		"update":function(event){
			diesel.game.ticks++;
			diesel.game.screens[diesel.game.activeScreen].update(event.args[0]);
		},
		"click":function(evt,x,y){
			if(diesel.game.screens[diesel.game.activeScreen] &&
					diesel.game.screens[diesel.game.activeScreen].click){

				diesel.game.screens[diesel.game.activeScreen].click(evt,x,y);
			}
			
		},
		"windowkeydown": function(event){
			for(keyname in diesel.game.keys){
				if(event.keyCode == diesel.game.keys[keyname]){
					diesel.game.keysDown[keyname] =true;
					event.preventDefault();
				}
			}
			if(diesel.game.screens[diesel.game.activeScreen].keydown){
				diesel.game.screens[diesel.game.activeScreen].keydown(event);
			}
				
		},
		"windowkeyup":function(event){
			for(keyname in diesel.game.keys){
				if(event.keyCode == diesel.game.keys[keyname]){
					diesel.game.keysDown[keyname] =false;
					event.preventDefault();
				}
			}	
			if(diesel.game.screens[diesel.game.activeScreen].keyup){
				diesel.game.screens[diesel.game.activeScreen].keyup(event);
			}
		},
		"screenChange":function(event){
			var from = event.args[0], 
				to = event.args[1], 
				transition = event.args[2]|| false;
			console.log("screen changed",from, to, transition);

			diesel.game.screens[from].close();
			if(transition){
				diesel.game.screens[transition].reset(from, to);
				diesel.game.screens[transition].open();
				diesel.game.activeScreen = transition;
			}
			else{
				diesel.game.screens[to].reset();
				diesel.game.screens[to].open();
				diesel.game.activeScreen = to;
			}
		
		},
		"startup":function(evt){

			if(diesel.game.startup){
				diesel.game.startup();
				console.log("diesel, starting up the game");
			}
			else{
				console.log("no startup found");
			}
		}

	};
	this.screens={};
	this.context={};
	this.objects={};
};

///
//	diesel.sprites
///

diesel.sprites.sprite=function(spriteObject){
	this.w = spriteObject.size[0];
	this.h = spriteObject.size[0];
	
	this.keys = spriteObject.keys;
	this.frames = spriteObject.frames;
	
	this.getSprite = function( name, frame){
		var idx =0;
		if(typeof (name) == "number"  ){
			idx = name *this.frames + frame;
		}
		else{
			if(this.keys[name]!== undefined){
		
				idx = this.keys[name] *this.frames + frame;
			}
		}
		return this.getSpriteByIndex(idx); ;
	}
	this.getSpriteByIndex = function( idx){
		return [this.w * (idx % this.frames),
			this.h * Math.floor(idx / this.frames),
			this.w,this.h] ;
	}
	
	this.id = spriteObject.sprite;
	this.image = new Image();
	this.image.onload = diesel.preloadSuccess;
	this.image.onerror = diesel.preloadError;
	this.image.src = game.settings.dataDirectory + this.id; 
	this.numAnimations = function(){
		return Math.floor(this.image.height/this.h);
	};

};

diesel.sprites.spriteInstance = function(sprite){
	this.frame=0;
	this.frameCount= sprite.frames;
	this.animation="";
	this.sprite = sprite;
	this.draw = function(context, w,h){
	
	if (!w ){
		w =this.sprite.w;
	}
	if(!h){
	 h =this.sprite.h;
	}
		var src = this.sprite.getSprite(this.animation, this.frame);
		context.drawImage(this.sprite.image, 
			src[0],src[1],src[2],src[3],0,0,w,h );
	};
	this.nextFrame =function(){
		this.frame = (this.frame + 1) % this.frameCount;
	};
};
///
// diesel.util
///



diesel.util.timeBetweenFrames= function(){
	if(diesel.fpsLimit > 0 && diesel.fpsLimit <200){
		return 1000/diesel.fpsLimit;
	}
	//hard limit at 200fps
	return 4;

};


diesel.util.getLocalCoords = function(x,y){
	//TODO fix for scrolling/nesting
	var rect = diesel.container.getBoundingClientRect();
	return {
	"x":x - rect.left - diesel.container.scrollLeft + window.pageXOffset,
	"y":y - rect.top - diesel.container.scrollLeft + window.pageYOffset
	};
}

diesel.util.fps =function(){
	if(diesel.lastFrameTime>0){
		return 1000/diesel.lastFrameTime;
	}
	return diesel.fpsLimit;

};

diesel.util.ajax = function(url){
	var xhr = new XMLHttpRequest();
	  
	xhr.open("GET", url,false);
	xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT");

	xhr.send(null);
	if (xhr.status !== 200 && xhr.status !== 0)
	{
		console.log("diesel, Ajax missed", xhr);
		
	}
	else{
		return (xhr.responseText);
	}
};

diesel.util.createContext= function(canvas ,value){
	var canvas_el = document.getElementById(canvas),
	ctx = null;
				
	//create it if it does not exist
	if(!canvas_el){
		canvas_el = document.createElement("canvas");
		canvas_el.id =canvas;
		diesel.container.appendChild(canvas_el);
	}
	if( value !== "3d" && value !== "3D"){
		ctx = canvas_el.getContext("2d");
	}	
	else{
		try{
			ctx = canvas_el.getContext("webgl");
		}
		catch(e){
			console.log("DIESEL, ERROR initializing 3d canvas"+e);
			canvas_el.innerHTML = "Cannot initialize 3d context";
		}
	}
	//TODO preserve aspect ratio
	
	canvas_el.width = diesel.game.width;
	canvas_el.height = diesel.game.height;

	if(!diesel.game.font){
		console.log("Diesel, Warning, No game.font, using defaults");
		diesel.game.font = diesel.font;
	}
	if(!diesel.game.fontSize){
		console.log("Diesel, Warning, No game.fontSize, using defaults");
		diesel.game.fontSize=diesel.fontSize;
	}
	//debug data to show init;
	ctx.font = diesel.game.fontSize+"px "+diesel.game.font ;
	

	

	return ctx;
				
}

diesel.util.registerKey= function(keyName, keyCode){
	if(diesel.data.keyNames[keyName] && diesel.data.keyNames[keyName] != keyCode){
		keyCode = diesel.data.keyNames[keyName];
	}

	diesel.game.keys[keyName] = keyCode;
	diesel.game.keysDown[keyName] = false;
}

diesel.util.shuffle = function(array){
	if(!array){
		return [];
	}
	var temp, j;
	for(var i = array.length -1; i >0 ;i--){
		j= Math.floor(i * Math.random());
		temp = array[j];
		array[j] = array[i];
		array[i] = temp;
	}

	return array;

}

diesel.util.loadSuccess = function(){
	diesel.loading--;
	if(diesel.loading<=0){
		diesel.start();
	}

};

diesel.util.loadError = function(evt){
	console.log("Diesel, ERROR, loading an item.",
			"this will likely cause errors later", evt);
	diesel.loading--;
	if(diesel.loading<=0){
		diesel.start();
	}

};

diesel.util.addLoad = function(file){

	if(file.image){
		if(!diesel.imageCache[file.image]){
			var img = new Image();
			img.id = file.image;
			diesel.imageCache[file.image] = img;
			diesel.loading++;
				
			img.onerror = diesel.preloadError;
			img.onload = diesel.preloadSuccess;
			img.src=diesel.game.dataDirectory+file.image;
		}
	}
	if(file.sound){
		if(!diesel.soundCache[file.sound]){

			var snd = new Audio();
			snd.id = file.sound;
			diesel.soundCache[file.sound] = snd;
			diesel.loading++;

			snd.addEventListener("loadeddata", diesel.preloadError);
			snd.addEventListener("onerror", diesel.preloadError);
			snd.src=diesel.game.dataDirectory+file.sound;
		}
	}
	if(file.sprite){
		if(!diesel.spriteCache[file.sprites]){
			diesel.loading++;
			var spr = new diesel.sprite(file);
			diesel.spriteCache[file.sprite] = spr;
		}
	}
};
///
//	diesel.util.url
///

diesel.util.url = {
	"args":{},
	"hash":window.location.hash,
	"protocol":window.location.protocol,
	"host":window.location.host,
	"path":window.location.pathname,
	"read":function(){
		var equals = null, data, search =window.location.search.substring(1).split('&');
		for(var i=0 ; i < search.length;i++){
			data= search[i];
			equals = search[i].indexOf('=');
			diesel.util.url.args[data.substring(0, equals)] = data.substring(equals + 1);
		}

	}

};
///
//	diesel.sockets.base
///

if(!diesel.sockets){
diesel.sockets ={};
}

diesel.sockets.base = function(url, protocols){

	this.socket = new WebSocket(url, protocols);
	
	this.init = function(){
		this.socket.onerror = this.onerror;
		this.socket.onmessage = this.onmessage;
	};

	this.onmessage = function(data){
		if(diesel.debug){
			console.log("message:", data);
		}
		var msg = JSON.parse(data);
		if(diesel.game &&
			diesel.game.messages[msg.type] &&
			diesel.game.messages[msg.type].receive ){
			diesel.game.messages[msg.type].receive(msg);
		}
		else{
			console.log("message type unknown",msg.type,"discarding", msg);
		}
	};

	this.onerror = function(data){
		if(diesel.debug){
			console.log("network error:", data);
		}

		//TODO

	};

	this.send = function(message){
		this.socket.send(message);

	};

	this.init();


}