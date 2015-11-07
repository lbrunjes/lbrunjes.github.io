/*
	Diesel
	A Simple Html5 Game engine.

	Designed to make the building game about making the game instead of wrangling html.

	Lee Brunjes 2013
	
	Version 0.3
	Last updated: 15 Nov, 2013

	TODO:
	Spritesheets?
	helper function
	resource timeouts for loads/failures?

*/
var diesel={
	
	"autoInclude":false,
	"includeUrl":"js",
	"debug":false,
	"debugCanvas":false,
	"debugData":[],
	"started":false,
	"shouldLoop":true,
	"pauseOnBlur":false, //we the loop stops on blur
	"useContainerForEvents":false, //this must be changed before init is called or no dice.

	"fpsLimit": 60,
	"lastkeys":[],
	"timeStarted":null,
	"timeBetweenFrames": function(){
		if(diesel.fpsLimit > 0){
		return 1000/diesel.fpsLimit;
		}
		return 4;//hardlimit at 200fps
	},
	"fps":function(){
		if(diesel.lastFrameTime>0){
		return 1000/diesel.lastFrameTime;
		}
		return diesel.fpsLimit;
	},
	"lastFrameTime":0,
	"lastFrameEnd":0,
	"lastFrameStart":0,
	"nextFrame":null,

	"frameCount":0,

	"container"	:null,
	"mouseX":0,
	"mouseY":0,
	"soundCache":{},
	"imageCache":{},
	"spriteCache":{},
	"preloads":0,
	"preloadSuccess":function(){
		diesel.preloads--;
		if(diesel.preloads<=0){
			diesel.start();
		}
	},
	"preloadError":function(evt){
		console.log("ERROR loading a preload, this will likely cause errors later", evt);
		diesel.preloads--;
		if(diesel.preloads<=0){
			diesel.start();
		}
	},
	
	//initializer
	init:function(){
		console.log("Diesel, starting");
		diesel.timeStarted = new Date();
		diesel.lastFrameEnd = new Date();
		diesel.lastFrameStart = new Date();
		
		if(diesel.autoinclude){
			//TODO
			//load the file linked
			
			//parse for links to .js files
			
			//append to head
		}
		if(!game.settings.dataDirectory){
			console.log("Diesel, ERROR no game.settings.dataDirectory using current dir");
			game.settings.dataDirectory = ".";
		}
		//add a trailing slash if it is missing.
		if(game.settings.dataDirectory.lastIndexOf('/') != game.settings.dataDirectory.length-1){
			game.settings.dataDirectory = game.settings.dataDirectory +"/";
		}


		//ensure that some on the stuff we are using exists.
		diesel.setCompatability();
		document.removeEventListener("DOMContentLoaded", diesel.init, false);

		//at some point the game will have some assets to load here.
		if(game.preload){
			var file;
			for(i in game.preload){
				file= game.preload[i];
				if(file.image){
					if(!diesel.imageCache[file.image]){
						var img = new Image();
						img.id = file.image;
						diesel.imageCache[file.image] = img;
						diesel.preloads++;
							
						img.onerror = diesel.preloadError;
						img.onload = diesel.preloadSuccess;
						img.src=game.settings.dataDirectory+file.image;
					}
				}
				if(file.sound){
					if(!diesel.soundCache[file.sound]){

						var snd = new Audio();
						snd.id = file.sound;
						diesel.soundCache[file.sound] = snd;
						diesel.preloads++;

            snd.addEventListener("loadeddata", diesel.preloadError);
						snd.addEventListener("onerror", diesel.preloadError);


            snd.src=game.settings.dataDirectory+file.sound;
					}
				}
				if(file.sprite){
					if(!diesel.spriteCache[file.sprites]){
						diesel.preloads++;
						var spr = new diesel.sprite(file);
						diesel.spriteCache[file.sprite] = spr;
					}
				}
			}
		}
		else{
			console.log("Diesel, no preloads");
		}


		//set focus to the game container
		if(!game.container){
			console.log("game.container is not defined");
		}
		diesel.container = document.getElementById(game.container);
		diesel.container.focus();

		//initialize the canvas(es)
		var i = game.fontsize,canvas_el;
		if(!game.context){
			console.log("Diesel, no context added in game context, using all canvases in the page");
			game.context = {};
			var els= document.getElementsByTagName("canvas");
			for( var i =0 ; i < els.length;i++ ){
				
				if(els[i].id ){
				game.context [els[i].id] = els[i];
				}
			}
		}
		for( var canvas in game.context){
			canvas_el = document.getElementById(canvas)
			
			//create it if it does not exist
			if(!canvas_el){
				canvas_el = document.createElement("canvas");
				canvas_el.id =canvas;
				diesel.container.appendChild(canvas_el);
			}
			
			game.context[canvas] = canvas_el.getContext("2d");

			//TODO preserve aspect ratio
			canvas_el.width = game.width;
			canvas_el.height = game.height;

			//debug data to show init;
			game.context[canvas].font = game.font;
			game.context[canvas].fillText("loaded " +canvas , 0,i);
			i+=game.fontSize;


		}
		
		//setup teh debug pane
		var canvas = document.createElement("canvas");
		canvas.id = "__diesel_debug_canvas";
		canvas.width = game.width;
		canvas.height = game.height;
		diesel.container.appendChild(canvas);
		
		diesel.debugCanvas = canvas.getContext("2d");
		diesel.debugCanvas.font = game.font;
		
		
		if(!game.font){
			console.log("Diesel, No game.font, using defaults");
		}
		if(!game.fontsize){
			console.log("Diesel, No game.fontsize, using defaults");
		}

		//bind game events
		if(game.events){
			for(event in game.events){
				if(event){
					if(diesel.useContainerForEvents){
						diesel.container.addEventListener(event, game.events[event],false);
					}
					else{
						document.addEventListener(event, game.events[event],false);
					}
				}
			}
		}
		else{
			console.log("Diesel, game.events is not defined the game will not get inputs.");
		}

		//bind diesel events
		for(event in diesel.events){
			if(event){
				if(event.indexOf("window")<0){
					diesel.container.addEventListener(event, diesel.events[event]);
				}
				else{
				window.addEventListener(event.substring(6), diesel.events[event]);
				}
			}
		}

		//start if needed
		if(diesel.preloads ==0 && !diesel.started){
				diesel.start();
			}

	},
	
	//call game setup function once things are bound not called if pre loaded.
	"start":function(){
		diesel.started==true;
		
		if(game.setup){
			game.setup();
		}
		else{
			console.log("Diesel, Game has no setup()");
		}

		//start up the loop
		console.log("Diesel, Turning over");
		diesel.loop();
	},
	
	
	//setup some default things and override if they dont exist;
	"setCompatability":function(){
		if(!window.console){
			window.console = {"log":function(){}};
		}
		if(!window.localStorage){
			console.log("Diesel, No Local Storage. Faking...");
			window.localStorage = {};
		}
	},

	//called too run teh game loop.
	loop:function(){

		var frameStart = new Date();
		var timePassed = (frameStart - diesel.lastFrameStart)/1000;
		
		//draw
		if(game.screens[game.settings.screen] && game.screens[game.settings.screen].draw){
				game.screens[game.settings.screen].draw(timePassed)
		}
		else{
			console.log("Diesel, Cannot Draw screen", game.settings.screen);
		}
		//update
		if(game.screens[game.settings.screen] && game.screens[game.settings.screen].update){
			game.screens[game.settings.screen].update(timePassed)
		}
		else{
			console.log("Diesel, Cannot Update screen", game.settings.screen);
		}


		diesel.lastFrameEnd = new Date();
		
		//show debug data if 
		diesel.lastFrameTime = diesel.lastFrameEnd -frameStart;
		diesel.debugData.push({
			"lastFrameTime":diesel.lastFrameTime,
			"waitTime": Math.abs(diesel.timeBetweenFrames()  - diesel.lastFrameTime),
			"fps": diesel.fps(),
			"limit":diesel.fpsLimit,
			"frame": diesel.FrameCount,
			"mouse":[diesel.mouseX, diesel.mouseY]
		});
		if(diesel.debugData.length >50){
			diesel.debugData.splice(0,1);
		}
		diesel.debugCanvas.clearRect(0,0,game.width,game.height);
		if(diesel.debug){
			diesel.debugCanvas.fillStyle = "rgba(22,22,22,.75)";
			diesel.debugCanvas.fillRect(0,0,game.width,game.height);
			diesel.debugCanvas.fillStyle = "#ffffff";
			diesel.debugCanvas.fillText("Diesel, Debug Canvas",16,16);
			
			diesel.debugCanvas.fillText("red bars are total frame time green bars are waiting during the frame.",16,32);
			diesel.debugCanvas.fillText("white line is fps",16,48);
			diesel.debugCanvas.fillText("Frames:"+diesel.frameCount+" Mouse:("+diesel.mouseX+","+diesel.mouseY+") fps limit:"+diesel.fpsLimit,16,64);
			var w = game.width/50;
			for(var i = 0; i < diesel.debugData.length;i++){
				
				diesel.debugCanvas.fillStyle = "#ff0000";
				
				diesel.debugCanvas.fillRect(i*w,game.height- diesel.debugData[i].lastFrameTime, w, diesel.debugData[i].lastFrameTime);
				if(i%10 ==0){
					diesel.debugCanvas.fillText(Math.floor(diesel.debugData[i].lastFrameTime)	, i*w,game.height- diesel.debugData[i].lastFrameTime )
				}
				
				diesel.debugCanvas.fillStyle = "#00ff00";
				diesel.debugCanvas.fillRect(i*w,game.height- diesel.debugData[i].waitTime, w, diesel.debugData[i].waitTime);
				diesel.debugCanvas.fillStyle = "#ffffff";
				if(i%10 ==0){
					diesel.debugCanvas.fillText(Math.floor(diesel.debugData[i].waitTime)	, i*w,game.height- diesel.debugData[i].waitTime+16 )
				}
				
			
				diesel.debugCanvas.fillRect(i*w,256 - diesel.debugData[i].fps , w, 1);
				if(i%10 ==0){
					diesel.debugCanvas.fillText(Math.floor(diesel.debugData[i].fps)	, i*w,256 - diesel.debugData[i].fps )
				}
				
				
			}
			
		}
		
		
		//Adjust interal counters and things
		diesel.frameCount++;
		diesel.lastFrameStart = frameStart;

		if(diesel.shouldLoop){
			diesel.nextFrame =setTimeout(diesel.loop, Math.abs(diesel.timeBetweenFrames()  - diesel.lastFrameTime)+1);
		}
		else{
			diesel.nextFrame = false;
		}
	},
	
	//Events
	events:{
		mousemove:function(evt){		

			var rect = diesel.container.getBoundingClientRect()
			diesel.mouseX = evt.pageX - rect.left - diesel.container.scrollLeft - window.pageXOffset;

			diesel.mouseY = evt.pageY - rect.top - diesel.container.scrollTop -window.pageYOffset;
			
			
    
		},
		windowblur:function(evt){
			if(diesel.pauseOnBlur){
				diesel.shouldLoop =false;
			}
		},
		windowfocus:function(evt){
			diesel.shouldLoop = true;
			if(!diesel.nextFrame){
				diesel.lastFrameEnd = new Date();
				diesel.lastFrameStart = new Date();
				diesel.loop();
			}
		},
		windowkeyup:function(evt){
			diesel.lastkeys.push(evt.keyCode);
			
			if(diesel.lastkeys.length > 5){
				diesel.lastkeys.splice(0,1);
			}
			
			//this is really important
			if(diesel.lastkeys.length ==5){
			if(diesel.lastkeys[0] == 73 &&
				diesel.lastkeys[1] == 68 &&
				diesel.lastkeys[2] == 68 &&
				diesel.lastkeys[3] == 81 &&
				diesel.lastkeys[4] == 68)
			
				console.log("YOU DIRTY RAT");
			
			}
		},
		windowonbeforeunload:function(evt){
			return "navigating away will lose unsaved progress continue?";
		}

	},

	//Save functions
	save:function(name, data){
		if(window.localStorage){
			localStorage[name]= JSON.stringify(data);
			console.log("Diesel, Saved", name);
		}
		else{
			console.log("Diesel:Cannot save, not supported.")
		}
	},
	load:function(name){
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
	},
	listSaves:function(){
		var saves = [];
		for(save in localStorage){
			saves.push(save);
		}
		return saves;
	},
	deleteSave:function(name){
		localStorage.removeItem(name);
	},
	raiseEvent:function(eventName, args){
		var event;
		if (document.createEvent) {
			event = document.createEvent("HTMLEvents");
			event.initEvent(eventName, true, true);
		} else {
			event = document.createEventObject();
			event.eventType = eventName;
		}
		
		event.eventName = eventName;
		event.args = [];
		for(var i =1; i < arguments.length;i++){
			event.args.push(arguments[i]);
		}
		
		if (document.createEvent) {
			diesel.container.dispatchEvent(event);
		} else {
			diesel.container.fireEvent("on" + event.eventType, event);
		}
	},
	raiseEventObject:function(eventName, object){
		var event;
		if (document.createEvent) {
			event = document.createEvent("HTMLEvents");
			event.initEvent(eventName, true, true);
		} else {
			event = document.createEventObject();
			event.eventType = eventName;
		}
		
		event.eventName = eventName;
		
		for(var key in object){
			event[key] = object[key];
		}
		
		if (document.createEvent) {
			diesel.container.dispatchEvent(event);
		} else {
			diesel.container.fireEvent("on" + event.eventType, event);
		}
	},
	
	"ajax":function(url){
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
  },
	
	"sprite":function(spriteObject){
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
	
	},
	"spriteInstance":function(sprite){
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
				context.drawImage(this.sprite.image, src[0],src[1],src[2],src[3],
							0,0,w,h );
		};
		this.nextFrame =function(){
		 this.frame = (this.frame + 1) % this.frameCount;
		};
	},
	"keyNames":{
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
	},
	"getKeyName":function(keyCode){
		if( diesel.keyNames[keyCode]){
			return diesel. keyNames[keyCode];
		}
		// hope this  is a ltter key:)
		return String.fromCharCode(keyCode);
	},
	"simulateKeyUp":function(keyCode){
		diesel.raiseEventObject("keyup",{"keyCode":keyCode});
	},
	"simulateKeyDown":function(keyCode){
		diesel.raiseEventObject("keydown",{"keyCode":keyCode});
	},
	"clamp":function(x, small, big){
		return Math.max(Math.min(x,big),small);
	}


}

//this calls the inti function to start the engine.
document.addEventListener("DOMContentLoaded", diesel.init, false);

