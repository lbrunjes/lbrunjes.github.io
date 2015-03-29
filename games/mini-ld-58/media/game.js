//built at Sat 28 Mar 2015 10:01:26 PM EDT

var game = function(){

	this.width=window.innerWidth||800;
	this.height = window.innerHeight||600;
	this.container = document;

	this.contexts = {};
	this.screens={};
	this.events = {};
	this.proto={};
	this.objects={}
	this.keys={
		"left1":37, 
		"right1":39,
		"left2":65,
		"right2":68
	};
	this.keysDown={
		"left1":false, 
		"right1":false,
		"left2":false,
		"right2":false	
	};
	
	this.directions = {
		"right"	:0,
		"down":Math.PI/2,
		"left":Math.PI,
		"up":Math.PI/2*3
	};
	

	//
	this.data= {
		sound:{},
		sprite:{},
		level:{},
		units:{},
		loading:0
	};
	this.dataLoaded = false;
	//Loop Vars
	this.shouldLoop = true;
	this.lastLoopAt =0;
	this.loopCount=0;
	this.loopHandle=null;

	//input vars
	this.mouse={x:0,y:0};
	this.keysPressed ={};
	this.lastKeys =[];

	//game vars
	this.paused =false;
	this.activeScreen ="loading";
	this.fontSize = 16;
	this.font ="monospace";

	this.level =null;
	
	


	this.init = function(){
		console.log("game.init");
		this.compatability();

		//replace all screens with instances.
		this.initScreens();

	};

	this.start = function(gamedata){
		console.log("game.start");
		this.initDom();

		///binds game events
		this.initEvents(this.events);


		///draw loading screen
		this.raiseEvent("draw");

		//start drawing now
		this.startLoop();

		//do any final preporcessing we need on teh data.
		this.prepareData(gamedata);
		

	};

//reads the game.event object and binds all of them to the dom and relevant functions
this.initEvents = function(evtObj){
	
	game.container = document.getElementById("container")||document;
	
	var i=0;
	for(var event in  evtObj){
		this.bindEvent(event, evtObj[event], game.container)
		i++;
	}
}


//binds a single event to a dom element.
this.bindEvent= function(eventName, functionRef, domElement){

	if(!eventName && typeOf(functionRef) !="function"){
		console.log("cannot bind ", event, functionRef)
		return;
	}

	var container = domElement || document;
	if(eventName.indexOf("window") === 0){
		//remove the window at the start
		if(game.debug){
			console.log("eventName starts with window ",
				"binding to window instead of container",
				 eventName);
		}
		container  = window;
		eventName = eventName.substring(6)
	}
	
	if(!window.addEventListener){
		container.attachEvent("on"+eventName, functionRef);
	}
	else{
		container.addEventListener(eventName, functionRef, false);
	}
}

//generates a dom event on the container
this.raiseEvent=function(eventName){
	var event;
	if (document.createEvent) {
		event = document.createEvent("HTMLEvents");
		event.initEvent(eventName, true, true);
	} else {
		event = document.createEventObject();
		event.eventType = eventName;
	}
	
	// if( game.debug ){
	// 	console.log("raising event", eventName);
	// }
	
	event.eventName = eventName;
	event.args = [];
	//loop through arguements and 
	for(var i = 1; i<arguments.length;i++){
		event.args.push(arguments[i])
	}
	
	if (document.createEvent) {
		game.container.dispatchEvent(event);
	} else {
		game.container.fireEvent("on" + event.eventType, event);
	}


};this.compatability =function(){

	if(!console || !console.log){
		window.console = {log:function(){}};
	}

	if(!localStorage){
		console.log("WARNING: Your browser does not support saving your game");
	}

};

//ensures the Dom is ready
this.initDom =function(){
	var canvases =["main"];

	for( var i = 0; i < canvases.length ; i++){
		var cvs =canvases[i];
		var el = document.getElementById(cvs);
		if(el.getContext){
			game.contexts[cvs] = el.getContext("2d");	
			el.width = game.width;
			el.height= game.height;
		}
		else{
			console.log("ERROR: canvas could not initialize", cvs);
		}
	}

};

this.initScreens = function(){
	for(scr in this.screens){
		if(scr != "base"){
			this.screens[scr] = new this.screens[scr]();
		}
	}
}

this.prepareData = function(data){
		
	
	for(var spr in data.sprite){
		game.data.loading++;
		game.data.sprite[spr] = new game.sprite(data.sprite[spr]);

	}
	for(var snd in data.sound){
		game.data.loading++;
		game.data.sound[snd] = new game.sound(data.sound[snd]);
	}


	console.log("done adding preloads");
 	game.dataLoaded = game.data.loading ==0 ;
}
this.loadSuccess = function(e){
	game.data.loading--;
	if(game.data.loading <=0){
		game.dataLoaded =true;
	}
}
this.loadFailed = function(e){
	console.log("!ERROR:load failed", e);
	game.data.loading--;	
	if(game.data.loading <=0){
		game.dataLoaded =true;
	}
}
//this function is called to advance teh game
this.loop = function(){
		
	var now = new Date();
	var ticks = (now - game.lastLoopAt)/1000 ;
	game.lastLoopAt =now;
	game.loopCount++;

	if(game.shouldLoop){
		if(!game.paused){
			game.raiseEvent("update",ticks);
		}
		game.raiseEvent("draw");
	}
	else{
		game.stopLoop();
	}
}

//this is called to drop the game loop;
this.stopLoop= function(){
	clearInterval(game.loopHandle);
	console.log("loop stopped");
};

//this is called to cause the game to start looping again.
this.startLoop = function(){
	console.log("loop started");
	game.lastLoopAt = new Date();
	if(!window.gameLoop){
		window.gameLoop = game.loop;
	}
	game.loopHandle = setInterval(window.gameLoop,33);
	console.lo
}

this.math = {
	"toDegrees":function(radians){
		return radians *(180/Math.PI);
	},
	"toRadians":function(degrees){
		return degrees ( Math.PI/180);
	},
	"lerp":function(a, b, c){
		return (b - a)*c + a;
	},
	"clamp":function(val, min ,max){
		return Math.min(Math.max(val, min),max);
	},
	"dot":function(a,b){

		var acc =0;
		if(typeof (a) != typeof (b)){
			console.log("cannot dot",a ,b)
			return acc;
		}

		for( i in a){
			if(typeof(a[i])=="number" 
				&& typeof(b[i])=="number"){
				acc+= a[i] *b[i];
			}
		}

		return acc;
	},
	"tau":Math.PI*2
	

};

this.sprite = function(json){

	this.file =""
	this.tiles =[];
	this.animations ={};
	this.image=null;
	this.info = {};
	this.width = null;
	this.height = null;

	this.drawAnimation =function(context, x,y,w,h, animationName, index){
		var i = this.animations[animationName][index];
		var coords = this.coordsFromIdx(i);
		context.drawImage(this.image, coords.x, coords.y, coords.w, coords.h,
			x,y,w,h)
	};
	

	this.coordsFromIdx = function(i){
		var x = i % this.info.perLine;
		var y = Math.floor(i/this.info.perLine);
		return {
			x:this.info.offsetX + x * this.info.width,
			y:this.info.offsetY + y * this.info.height,
			w:this.info.width,
			h:this.info.height
		} 


	}
	


	


	this.init = function(json){
		this.file = json.file;
		this.info =json.info;
		this.animations = json.animations;

		this.image = new Image();
		this.image.onload = game.loadSuccess;
		this.image.onerror = game.loadFailed;
		this.image.src = "media/"+this.file;
	}
	this.init(json);
};


this.sound = function(json){
	this.file ="";
	this.sound= null;




	

	this.play =function(){
		this.sound.play();
	}
	this.stop = function(){
		this.sound.pause();
		this.sound.fastSeek(0);
	}
	this.seek = function(time){
		this.sound.fastSeek(time);
	}

	this.init = function(json){
		this.file = json.file;

		this.sound = new Audio();
		this.sound.onloadeddata = game.loadSuccess;
		this.sound.onerror = game.loadFailed;
		this.sound.src = "media/"+this.file;
	}


	this.init(json);

};
this.events.bounce = function(e){
	asteroid = e.args[0];
	shield = e.args[1];
	
	asteroid.a = shield.reflectAngle(asteroid.x, asteroid.y, asteroid.a);
	asteroid.speed = asteroid.speed *1.2;
	
	if(shield.type != "shield"){
		asteroid.speed = game.math.clamp( 0, 256, asteroid.speed *1.2);
		shield.speed = shield.speed * 1.2;
		shield.a = asteroid.reflectAngle(shield.x, shield.y, shield.a);
		
	}
	else{
		game.data.sound.blip.play();
	}
	asteroid.move(asteroid.a, asteroid.speed ,0.1);
	

	//TODO create sprite on bounce
}
this.events.collision = function(e){
	asteroid = e.args[0];
	planet = e.args[1];

	asteroid.onCollide(planet);
	planet.onCollide(asteroid);

	//TODO playsound on explosion show spreite.

};

this.events.gameOver =function(e){
	planet = e.args[0];

	game.level.lost.push( planet);

	//TODO Play a sound at game end.

};

this.events.windowkeydown = function(event){
	for(keyname in game.keys){
		if(event.keyCode == game.keys[keyname]){
			game.keysDown[keyname] =true;			
			event.preventDefault();
		}
	}
	if(game.screens[game.activeScreen].keydown){
		game.screens[game.activeScreen].keydown(event);
	}
		
};

this.events.windowkeyup = function(event){
	for(keyname in game.keys){
		if(event.keyCode == game.keys[keyname]){
			game.keysDown[keyname] =false;
			event.preventDefault();
		}
	}	
	if(game.screens[game.activeScreen].keyup){
		game.screens[game.activeScreen].keyup(event);
	}
};

this.events.draw =function(e){
	if(game.screens[game.activeScreen] &&
		game.screens[game.activeScreen].draw){
		game.screens[game.activeScreen].draw(e);
	}
};

this.events.update =function(e){
	if(game.screens[game.activeScreen] &&
		game.screens[game.activeScreen].update){
		game.screens[game.activeScreen].update(e.args[0]||0);
	}
};
this.events.mousemove = function(evt){
	
	var rect = game.container.getBoundingClientRect();
	game.mouse.x = evt.pageX - rect.left - game.container.scrollLeft + window.pageXOffset
	game.mouse.y = evt.pageY - rect.top - game.container.scrollTop + window.pageYOffset;
};

this.events.click=function(evt,x,y){
	if(game.screens[game.activeScreen] &&
			game.screens[game.activeScreen].click){
		game.screens[game.activeScreen].click(evt,x,y);
	}
};
this.events.screenChange=function(event){
	var from = event.args[0], 
		to = event.args[1], 
		transition = event.args[2]|| false;
		
	console.log("screen changed",from, to, transition);

	game.screens[from].close();
	if(transition){
		game.screens[transition].open(from,to);
		game.activeScreen = transition;
	}
	else{
		game.screens[to].open();
		game.activeScreen = to;
	}

};//stop the loop on blur
this.events.windowblur=function(evt){
	
	game.shouldLoop =false;

};

//restart the loop on fucs
this.events.windowfocus=function(evt){
	game.shouldLoop = true;
	game.startLoop();
	
};

this.events.windowresize = function(evt){
	//TODO resize support;
};

this.screens.base = function(){
	this.elements=[];
	//called at load time once
	this.init =function(){

	};
	//called when made active
	this.open = function(){

	};
	//called upon leaving
	this.close =function(){

	}

	this.draw =function(){

	};

	this.update =function(){

	};

	this.click = function(e,x,y){
		var _x = x||game.mouse.x;
		var _y = y||game.mouse.y;
		for(var i =0; i <this.elements.length;i++){
			if(this.elements[i].x < _x
				&& this.elements[i].x + this.elements[i].w > _x 
				&& this.elements[i].y < _y
				&& this.elements[i].y + this.elements[i].h > _y){
					this.elements[i].click(evt,
					 _x- this.elements[i].x,
					 _y- this.elements[i].y);
			}
		}
	}
};

this.screens.attract = function(){
	this.elements=[];
	this.timeSinceOpen =0;
	this.zoomTime = 3;
	this.r = 0;

	this.open = function(){
		this.timeSinceOpen =0;
		game.contexts.main.font =game.fontSize+"px "+ game.font;
		console.log("agg");
	};
		
	this.draw =function(){
		game.contexts.main.clearRect(0,0,game.width,game.height);
		
		game.contexts.main.fillStyle ="#fff";
		
		
		game.contexts.main.fillText("WELCOME TO PLANETARY ORBITAL NERD GARRISON",32,game.width/4);
		
		game.contexts.main.fillText("KEYS:  [LEFT, RIGHT] [A, B]",32,game.width/4+64);
		game.contexts.main.fillText("STANDING ORDERS: TRY NOT TO KILL EVERYONE!",32,game.width/4+96);
		game.contexts.main.fillText("CLICK TO BEGIN",32,game.width/4+128);

		
		//TODO Pretty up atttract screeen
		
	};

	this.update =function(ticks){
		this.timeSinceOpen+=ticks;
		if(this.timeSinceOpen < this.zoomTime){
			this.r = (this.r +.05 )%(Math.PI*2)
		}

	};

	this.click =function(){
		game.raiseEvent("screenChange","attract","inGame","fade");
	}
}
this.screens.attract.prototype = new this.screens.base();

this.screens.fade =function(){
	this.count = 10;
	this.next = null;

	this.open =function(from, to){
		this.count = 10;
		this.next = to;
	}
	this.draw = function(){
		game.contexts.main.fillStyle="rgba(0,0,0,0.5)";
		game.contexts.main.fillRect(0,0,game.width, game.height);
	}
	this.update=function(){
		this.count--;
		if(this.count <-1 && this.next){
			game.raiseEvent("screenChange", "fade", this.next);
		}
	}

	
}
this.screens.fade.prototype = new this.screens.base();

this.screens.inGame =function(){
	
	this.loseTime = 5;
	

	this.open =function(){
		this.loseTime = 5;
		game.level =new game.objects.level();

	}
	this.draw = function(){
		game.contexts.main.clearRect(0,0,game.width, game.height);
		game.level.draw(game.contexts.main);
		game.level.drawShadow(game.contexts.main);


		
		
	}
	this.update=function(ticks){

		if(game.level.lost.length < game.level.numPlanets -1){
			game.level.update(ticks);

		}
		else{
			this.loseTime -= ticks;
			if(this.loseTime <= 0 ){
				game.raiseEvent("screenChange", "inGame", "attract", "fade");
			}
		}

	}

	this.click = function(){
		var p = new game.objects.projectile(game.mouse.x -game.width/2, 
			game.mouse.y - game.height/2,
			game.directions.up);
		game.level.addObject(p);
		
	}

	
}
this.screens.inGame.prototype = new this.screens.base();

this.screens.loading = function(){
	
	
	this.draw =function(){
		game.contexts.main.font =game.fontSize+"px "+ game.font;

		var ctx =game.contexts.main;

		ctx.clearRect(0,0,game.width, game.height);

		ctx.fillStyle= "#fff";

		ctx.fillRect(game.width/4, game.height/2, 
			(game.width/2) * (game.loopCount%16/16),game.fontSize);
		ctx.fillText(game.data.loading+ " remaining", game.width/4, game.height/2+game.fontSize*2); 

	}
	this.update=function(ticks){
		if(game.dataLoaded){
			game.raiseEvent("screenChange", "loading", "attract","fade");
		}
		else{
			console.log("...")
		}
	}
}
this.screens.loading.prototype = new this.screens.base();

this.proto.base = function(){
	//expect teh following to be overridden but im including them for joy
	this.castShadow =true;
	this.hasLights= false;
	
	this.x = 0;
	this.y = 0;
	this.r = 0; //radius
	this.a = 0; //objects angle;

	this.shadowColor = "rgba(0,0,0,0.2)";
	this.mass =1;

	this.init=function(){
	};

	this.move =function(direction, speed, ticks){
		
		this.x += Math.cos(direction)*speed *ticks;
		this.y += Math.sin(direction)*speed *ticks
	};
	this.inside = function(x,y,r){
		r = r ||0;
		return Math.sqrt(Math.pow(this.x - x,2) + Math.pow(this.y-y,2)) < this.r +r;
	}
	this.dist = function(x,y){
		return Math.sqrt(Math.pow(this.x - x,2) + Math.pow(this.y-y,2))
	}
	this.distSq = function(x,y){
		return Math.pow(this.x - x,2) + Math.pow(this.y-y,2);
	}


	this.draw =function(context){
		context.beginPath()
		context.arc(this.x, this.y, this.r, 0, Math.PI *2);
		context.fill();

	};
	this.drawShadow = function(context, lightx, lighty){
		if( !this.castShadow){
			return;
		}
		
		var sun = null;
		if(game.level && game.level.orbitalObjects){
			var sun = game.level.orbitalObjects[0];
		}
		else{
			sun = {x:lightx||game.width/3*2,
				y:lighty||game.width/3*2,
				r: 5};
		}

		
		
		//find two points perpendicular to the light source on the radius.
		var a = Math.atan2(sun.y-this.y, sun.x - this.x);

		var x1 = this.x + Math.cos(a+Math.PI/2) *this.r;
		var y1 = this.y + Math.sin(a+Math.PI/2) *this.r;
		var x2 = this.x + Math.cos(a-Math.PI/2) *this.r;
		var y2 = this.y + Math.sin(a-Math.PI/2) *this.r;

		var sx1 = sun.x + Math.cos(a+Math.PI/2) *sun.r;
		var sy1 = sun.y + Math.sin(a+Math.PI/2) *sun.r;
		var sx2 = sun.x + Math.cos(a-Math.PI/2) *sun.r;
		var sy2 = sun.y + Math.sin(a-Math.PI/2) *sun.r;

		
		var r = this.r/ sun.r *-1;
		var l  = this.dist(sun.x, sun.y)/r;
		
		var cx = this.x + Math.cos(a) *l;
		var cy = this.y + Math.sin(a) *l;
		
		

		//generate a polygon between the edge of teh screen and the cone from the sun.
		context.fillStyle = this.shadowColor;
		context.beginPath();
		context.moveTo(x1,y1);
		context.lineTo(cx,cy);
		context.lineTo(x2,y2);
		context.fill();
	



	};
	this.drawLights =function(context){
		if(!this.hasLights){
			return;
		}

	}

	this.update = function(ticks){

	};

	this.shouldRemove =function(){
		return false;
	};

	this.onCollide =function(orbitalObject){
		this.hasCollided = true;
	}
	this.addForce =function(angle, speed){

	};
	this.reflectAngle = function(x,y,inAngle){
		var a = Math.atan2(this.x-x, this.y-y);
		var plane = a + Math.PI/2;
		var incidence = (inAngle - plane)%game.math.tau;
		var reflectAngle = 	(plane - incidence)%game.math.tau;
		
		if(reflectAngle - a > Math.PI/2){
			reflectAngle+=Math.PI
		}
		
		return reflectAngle;


	};
};



this.proto.planet=function(){

	this.rotationalVelocity = 0.0;
	this.castsShadow =true;
	this.hasLights = true;
	this.atmosphereDepth =32;
	this.mass = 100;
	this.x = 0;
	this.y = 0;
	this.r = 0;
	this.shield = null;
	this.bgColor = "#0f0";
	this.atmoColor = "rgba(1,64,128,0.2)";
	this.orbitX =0;
	this.orbitY =0;
	this.points =10;
	

	this.init =function(x,y,r){
		this.x = x||this.x;
		this.y = y||this.y;
		this.r = r||this.r;

		this.atmosphereDepth = game.math.clamp(this.r/5, 8  ,32);
		//this.mass = this.r *10;
		this.shield = new game.objects.shield(this);
	}


	this.draw =function(context){
		context.save();
		context.translate(this.x,this.y);
		
		context.rotate(this.a);
		//the the planet
		context.fillStyle = this.bgColor;
		context.beginPath()
		context.arc(0, 0, this.r, 0, Math.PI *2);
		context.fill();

		//the cities
		for(var i = 0 ;i< this.cities/length;i++){
			this.cities[i].draw(context);
		}

		//draw teh atmosphere
		context.strokeStyle = this.atmoColor
		context.beginPath()
		context.lineWidth = this.atmosphereDepth;
		context.arc(0, 0, this.r+ this.atmosphereDepth/2, 0, Math.PI *2);
		context.stroke();

		if(this.shield){
			this.shield.draw(context);
		}

		context.restore();
		context.fillStyle = "#fff";
		context.textAlign ="center";
		context.fillText(this.points,this.x, this.y+game.fontSize/2);


	};

	this.update = function(ticks ,j ){
		//this.a = (this.a + this.rotationalVelocity) % game.math.tau;
	
		if(this.shield){
			this.shield.update(ticks, this , j);
		}
		for(var i=0; i < this.cities.length;i++){
			this.cities[i].update(ticks);
		}

		//move around the sun, circlewise
		var a1 = Math.atan2( this.y - this.orbitY, this.x - this.orbitX);
		this.move(a1 + (Math.PI/2),this.rotationalVelocity, ticks)

	};

	this.inAtmosphere = function(x,y){
		 return this.dist(x,y) < this.r + this.atmosphereDepth;
	};
	this.setOrbitalCenter =function(x,y){
		this.orbitX = x ||0;
		this.orbitY = y ||0;
	};

	this.onCollide= function(){
		this.points--;
		// TODO destroy a city
		//TODO  show sprite.
		game.data.sound.crash.play();
		if(this.points ==0){
			game.raiseEvent("gameOver", this);
		}

	}

};
this.proto.planet.prototype = new this.proto.base();


this.proto.shield = function(){
	this.castShadow =true;
	this.hasLights= false;

	this.x = 0;
	this.y = 0;
	this.r = 0; //radius
	this.a = 0; //objects angle;

	this.d = 64;// the thickness;
	this.length = Math.PI/6
	
	this.rotateSpeed = 3;
	this.color ="#fff";
	this.planet= null;

	this.init =function(planet){
		this.x = planet.x;
		this.y = planet.y;
		this.planet = planet;
		this.r = planet.r+ planet.atmosphereDepth *4 ;
		this.a = Math.random() *game.math.tau -Math.PI;
		this.d = planet.atmosphereDepth *2;

	}


	this.draw = function(context){
		context.strokeStyle = this.color
		context.beginPath()
		context.lineWidth = this.d;

		context.arc(0, 0, this.r + this.d/2, this.a - this.length/2, this.a + this.length/2);
		context.stroke();
	}
	this.update= function(ticks, planet, index){
		if(game.keysDown["left"+index]){
			this.a -= this.rotateSpeed *ticks;
		}
		if(game.keysDown["right"+index]){
			this.a += this.rotateSpeed *ticks;
		}
		if(this.a > Math.PI){
			this.a -= game.math.tau;
		}
		if(this.a < Math.PI *-1){
			this.a += game.math.tau;
		}
	}

	this.contains =function(x,y,r){
		
		var dist = this.planet.dist(x,y);
		if(dist >= this.r && dist<= this.r + this.d +r){
			var angle =Math.atan2(y-this.planet.y,x-this.planet.x);
			
			return (angle >= this.a - this.length/2 && 
					angle <= this.a + this.length/2);
		}
		return false;

	};
	this.reflectAngle = function(x,y,inAngle){
		var a = Math.atan2(this.planet.x-x, this.planet.y-y);
		var plane = a + Math.PI/2;
		
		var incidence = (inAngle -plane) % game.math.tau;
		var reflectAngle = 	(plane - incidence)%game.math.tau;
		
		if(Math.abs(reflectAngle - a)%game.math.tau > Math.PI/2*3){
			reflectAngle+=Math.PI
		}
		
		return reflectAngle;


	};
	
	



};
this.proto.shield.prototype = new this.proto.base();

this.proto.level = function(){

	//expect teh following to be overridden but im including them for joy
	this.castShadow =true;
	this.hasLights= false;
	
	this.x = 0;
	this.y = 0;
	this.r = 0; //radius
	this.a = 0; //objects angle;

	this.shadowColor = "rgba(0,0,0,0.2)";

	this.orbitalObjects =[];
	this.starField =[];
	this.lost=[];
	this.numPlanets = 0;

	////
	this.init = function(numPlanets){
		this.w = game.width;
		this.h = game.height;
		this.x = this.w/2;
		this.y = this.h/2;

		numPlanets =2;

		this.numPlanets = 2;

		var slice = Math.min(this.w, this.h)/2/(2+numPlanets);
		//create a sun or more
		

		var s = new game.objects.sun(slice/2);
		this.addObject(s);

		for(var i = 0 ;i < numPlanets;i++){

			var a = Math.random() * Math.PI ;

			var r = Math.ceil(slice/2 * Math.random() + slice/4);
			
			var p = new game.objects.planet(0,0, r/2);

			p.rotationalVelocity = Math.floor(Math.random() * 10) +5;

			if(i %2){
				 p.rotationalVelocity = p.rotationalVelocity *-1
				 a = a *-1
			}
			
			p.move(a, slice * (i+2) , 1);
			//p.setOrbitalCenter(this.x,this.y);
			//Try not to create a  collision 
			this.addObject(p);
			
		}
	}

	this.draw =function(context){
		context.save();
		context.translate(this.x, this.y);

		this.drawStarField();

		for(var i =0; i < this.orbitalObjects.length;i++){
			this.orbitalObjects[i].draw(context);
		}

		for (var l = 0; l< this.lost.length; l++){
			context.fillStyle = "#f00";
			context.save();
			context.translate(this.lost[l].x, this.lost[l].y+ game.fontSize/2);
			context.fillText("LOST", 0,game.fontSize);
			context.scale(7,7);
			context.fillText("X", 0,0);
			context.restore();

		}
		context.restore();
	}

	this.drawShadow =function(context){
		context.save();
		context.translate(this.x, this.y);
		for(var i =0; i < this.orbitalObjects.length;i++){
			this.orbitalObjects[i].drawShadow(context);
		}	
		context.restore();
	}

	this.drawStarField =function(context){

	}

	this.update =function(ticks){

	if(this.orbitalObjects.length < 128 &&
		game.loopCount %3 ==0 &&
		 Math.random() > .25){
		this.addObject(this.generateAsteroid());
	}

	for(var i =0; i < this.orbitalObjects.length;i++){
			this.orbitalObjects[i].update(ticks, i);
			if(this.orbitalObjects[i].shouldRemove()){
				this.orbitalObjects.splice(i,1);
				i--;
			}
		}	
	}

	this.addObject = function(o){
		this.orbitalObjects.push(o);
	}
	this.generateAsteroid = function(){
		var a = Math.random() * game.math.tau;

		var p = new game.objects.projectile(
			Math.sin(a) *game.width/2, 
			Math.cos(a) *game.height/2,
			a +Math.PI + (Math.random() *0.2 - 0.1));
		p.speed  = p.speed *Math.random() +p.speed;
		return p;
	}
}
this.proto.level.prototype= new this.proto.base();
this.proto.projectile = function(){
	this.castShadow =true;
	this.hasLights= false;

	this.x = 0;
	this.y = 0;
	this.r = 16; //radius
	this.a =0; //objects angle;
	this.speed = 0;
	this.hasCollided =false;
	this.movedAway = false;
	
	this.update =function(ticks , index){
		if(this.shouldRemove()){
			return;
		}
		var tests =[this.x, this.y];


		var destX = this.x + Math.cos(this.a)* this.speed *ticks;
		var destY = this.y += Math.sin(this.a)*this.speed *ticks;


		for (var  i  = 0 ; i *2 < this.speed *ticks; i++){
			var pct = i*2 /this.speed *ticks;
			var x = game.math.lerp(this.x, destX, pct);
			var y = game.math.lerp(this.y, destY, pct);
			 tests.push(x);
			 tests.push(y);
		}

		tests.push(destX);
		tests.push(destY);


		var obj;
		for(j = 0 ;j < tests.length; j+=2){
			var x = tests[j];
			var y = tests[j+1];
			this.x = x;
			this.y = y;

			for(var i = 0 ; i < game.level.orbitalObjects.length; i++){
				obj = game.level.orbitalObjects[i];
				
				//colisions checks
				if(obj.type == "planet"|| obj.type =="sun"){

					if(obj.inside(x, y, this.r)){
						i = game.level.orbitalObjects.length;
						j = tests.length;
						game.raiseEvent("collision", this, obj);
						
					}
					else{
						if(obj.shield && obj.shield.contains(x, y, this.r)){
							i = game.level.orbitalObjects.length;
							j = tests.length;
							game.raiseEvent("bounce", this, obj.shield);
							
						}
					}
				}
				else{
					if(index != i && obj.inside(x, y, this.r)){
						i = game.level.orbitalObjects.length;
						j = tests.length;
						game.raiseEvent("bounce", this, obj);
					}
				}

			}
			
		}

		
		

		if( Math.abs(this.x) > game.width || Math.abs(this.y)> game.height ){
			this.movedAway =true;
		}
		if(this.speed > game.height){
			console.log("obver limit"				);
			this.movedAway =true;
		}

	}

	this.draw = function(context){
		context.fillStyle="#999";
		context.beginPath()
		context.arc(this.x, this.y, this.r, 0, Math.PI *2);
		context.fill();
	}
	this.shouldRemove = function(){
		return this.hasCollided || this.movedAway;
	}
	this.collisionCheck =function(x,y){

	}
	

}
this.proto.projectile.prototype = new this.proto.base();
this.proto.sun = function(r){

	this.rotationalVelocity = 0.0;
	this.castsShadow =true;
	this.hasLights = true;
	this.atmosphereDepth =32;
	this.mass = 100;
	this.x = 0;
	this.y = 0;
	this.r = 64;
	this.shield = null;
	this.bgColor = "#ff0";
	this.atmoColor = "rgba(128,96,32,0.2)";
	this.orbitX =0;
	this.orbitY =0;;


	this.init = function(r){
		
		this.r = r||this.r;
		this.atmosphereDepth = Math.min(this.r/3);
		

	}
	this.update =function(ticks){
		this.a = (this.a + this.rotationalVelocity) % game.math.tau;
	}

	this.draw =function(context){
		context.save();
			context.translate(this.x,this.y);
			
			context.rotate(this.a);
			
			

			//draw teh atmosphere
			context.strokeStyle = this.atmoColor
			context.beginPath()
			context.lineWidth = this.atmosphereDepth;
			context.arc(0, 0, this.r+ this.atmosphereDepth/2 *Math.abs( Math.sin(game.loopCount/10)), 0, Math.PI *2);
			context.stroke();

			
			//the the planet
			context.fillStyle = this.bgColor;
			context.beginPath()
			context.arc(0, 0, this.r, 0, Math.PI *2);
			context.fill();


		context.restore();

	};
	this.onCollide = function(){
		//TODO play Sizzle Sound.

	};

}
this.proto.sun.prototype = new this.proto.planet();

this.objects.level = function(numPlanets){

	this.castShadow =false;
	this.hasLights= false;
	
	this.x = 0;
	this.y = 0;
	this.r = 0; //radius
	this.a = 0; //objects angle;

	this.shadowColor = "rgba(0,0,0,0.2)";

	this.orbitalObjects =[];
	this.starField =[];
	this.lost =[];


	this.type= "level";
	var slice =25;
	
	this.numPlanets = 0;


	this.init(numPlanets);
	
}
this.objects.level.prototype = new this.proto.level();
 this.objects.planet = function(x,y,r){
	
	this.a = 0; //objects angle;
	this.rotationalVelocity = 0.0;
	this.castsShadow =true;
	this.hasLights = true;
	this.atmosphereDepth =32;
	this.mass = 2000;
	this.x = x||0;
	this.y = y||0;
	this.r = r||0;
	this.bgColor = "#0f0";
	this.atmoColor = "rgba(32,64,128,0.2)";
	this.points =10;

	this.shield = null;
	this.cities = [];
		this.orbitX =0;
	this.orbitY =0;;
	this.type= "planet";

	this.init(x,y,r);
 }
 this.objects.planet.prototype = new this.proto.planet();
this.objects.projectile = function(x,y,a){
	this.castShadow =true;
	this.hasLights= false;

	this.x = x||0;
	this.y = y||0;
	this.r = 8; //radius
	this.a =a||0; //objects angle;
	this.speed = 64;
	this.type= "projectile";
	this.hasCollided =false;
	this.movedAway = false;
	this.init();
	
}
this.objects.projectile.prototype = new this.proto.projectile();

this.objects.shield =function(planet){
	this.castShadow =true;
	this.hasLights= false;

	this.x = 0;
	this.y = 0;
	this.r = 0; //radius
	this.a = 0; //objects angle;

	this.d = 16;// the thickness;
	this.length = Math.PI/2
	
	this.rotateSpeed = 7;
	this.color ="#fff";
	this.type= "shield";
	this.planet=null;
	
	this.init(planet);
	

}
this.objects.shield.prototype = new this.proto.shield();



this.objects.sun = function(r){
	this.rotationalVelocity = 0.0;
	this.castsShadow =false;
	this.hasLights = true;
	this.atmosphereDepth =32;
	this.mass = 2000;
	this.x = 0;
	this.y = 0;
	this.r = 64;
	this.shield = null;
	this.bgColor = "#ff0";
	this.atmoColor = "rgba(128,96,32,0.2)";
	this.type= "sun";
	this.init(r);
};
this.objects.sun.prototype = new  this.proto.sun();	
	//setup the game object
	this.init();
}
//end 
