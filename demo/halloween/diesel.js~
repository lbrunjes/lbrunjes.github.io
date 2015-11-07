/*
	Diesel
	A Simple Html5 Game engine.

	Designed to make the building game about making the game instead of wrangling html.

	Lee Brunjes 2013
	
	Version 0.2
	Last updated: 8/3/2013

	TODO:
	Spritesheets?
	helper function
	resource timeouts for loads/failures?

*/
var diesel={
	"sprite":function(spriteObject){
		this.w = spriteObject.size[0];
		this.h = spriteObject.size[0];
		this.image
		
		this.keys = spriteObject.keys;
		this.lengths = spriteObject.length;
		
		this.getSprite = function(name, frame){
		
		}
		
		this.id = spriteObject.sprite;
		this.image = new Image();
		diesel.preloads++;
		this.image.onload = function(){
			diesel.preloads--;
			if(diesel.preloads<=0){
				diesel.start();
			}
		}
		this.image.src = game.settings.dataDirectory + this.id;
	
	},

	"autoInclude":false,
	"includeUrl":"js",
	"debug":false,
	"started":false,
	"shouldLoop":true,
	"useContainerForEvents":true, //this must be changed before init is called or no dice.

	"fpsLimit": 2,
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
						var snd = new Image();
						snd.id = file.image;
						diesel.imageCache[file.image] = snd;
						diesel.preloads++;
						snd.onload = function(){
							diesel.preloads--;
							if(diesel.preloads<=0){
								diesel.start();
							}
						}
						snd.src=game.settings.dataDirectory+file.image;
					}
				}
				if(file.sound){
					if(!diesel.soundCache[file.sound]){

						var snd = new Audio();
						snd.id = file.sound;
						diesel.soundCache[file.sound] = snd;
						diesel.preloads++;

            snd.addEventListener("loadeddata", function(){

							diesel.preloads--;
							if(diesel.preloads<=0){
								diesel.start();
							}
						});


            snd.src=game.settings.dataDirectory+file.sound;
					}
				}
				if(file.sprite){
					if(!diesel.spriteCache[file.sprites]){
						var spr = new diesel.sprite(file);
						diesel.spriteCache[file.sprite] = spr;
		
					}
				}
			}
		}
		else{
			console.log("Diesel: no preloads");
		}


		//set focus to the game container
		diesel.container = document.getElementById(game.container);
		diesel.container.focus();

		//initialize the canvas(es)
		var i = game.fontsize,canvas_el;
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

		//bind game events
		for(event in game.events){
			if(event){
				if(diesel.useContainerForEvents){
					diesel.container.addEventListener(event, game.events[event]);
				}
				else{
					document.addEventListener(event, game.events[event]);
				}
			}
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
			console.log("No Local Storage. Faking...");
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
		//update
		if(game.screens[game.settings.screen] && game.screens[game.settings.screen].update){
			game.screens[game.settings.screen].update(timePassed)
		}


		diesel.lastFrameEnd = new Date();
		
		//show debug data if 
		diesel.lastFrameTime = diesel.lastFrameEnd -frameStart;
		if(diesel.debug){
			console.log("Last Frame Draw Time:"+diesel.lastFrameTime, 
				"Full Frame Time:"+Math.abs(diesel.timeBetweenFrames()  - diesel.lastFrameTime),
				"FPS:"+diesel.fps(),
				"FPS LIMIT"+ diesel.fpsLimit,
				"FrameCount:" + diesel.frameCount,
				"Mouse:"+diesel.mouseX + "," + diesel.mouseY);
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
	events:{
		mousemove:function(evt){		
			var rect = diesel.container.getBoundingClientRect()
			diesel.mouseX = evt.pageX - rect.left;
			diesel.mouseY = evt.pageY - rect.top;
		},
		windowblur:function(evt){
			//diesel.shouldLoop =false;
		},
		windowfocus:function(evt){
			//diesel.shouldLoop = true;
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
	}


}

//this calls the inti function to start the engine.
document.addEventListener("DOMContentLoaded", diesel.init, false);

