// built at Mon Nov 24 09:30:03 2014
///
//	cast API
///


/*
the cast object is intended as a mixin for use versus teh main game 
such that we can use the main lib on the clients and the server stuff
 ends up on here.
*/

var TANKS_APP_ID="1DC73FAD";
var TANKS_APP_NS="co.housemark.tanks";

if(!diesel){
	console.log("No Diesel, treads cannot possibly start");
}


var tread =function(){

	this.directions={
		up: Math.PI,
		down: 0,
		left: Math.PI/2,
		right:Math.PI/2*3
	};
	this.messages={};
	this.units={};
	this.context={
		"terrain":"2d",
		"main":"2d",
		"effects":"2d"
	};

	this.fontSize = 32;

	// properties
	this.isServer =true;
	this.networkGame = null;
	this.messageHost = "ws://housemark.co:9000";
		
	this.players =[];
	this.maxPlayers =2;
	this.localPlayer = null;

	this.width=640;
	this.height=480;

	this.ws = null;
	this.cast =null;

	this.level = null;
	this.round =0;
	this.maxRounds = 3;
	this.mouseDown=false;

	this.touches=[];
	this.x;
	this.y;

	this.fontSize= 32;
	this.font ="monospace";

	
	this.activeScreen="setup";

	
	this.everyLevelAddCash = 50;
	this.levelWinnerBonus = 100;

	this.init =function(){
		console.log("initing");
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		window.scrollMaxX=0;
		window.scrollMaxY=0;
		window.scrollbars.visible = false;
				
		
		this.ws = new WebSocket(this.messageHost, false);

		this.ws.onopen = this.connections.webSocket.onOpen;

		this.cast = new this.connections.castApi();
		console.log("done");
	}

	//called if the diesel startup event happens
	this.startup = function(e){
		
		this.sound.instance = new this.sound.system();
		//do not allow the server app to stop even if blurred
		diesel.pauseOnBlur =false;
		diesel.shouldLoop= true;
		

		
		


		//for now we only care about loading and compilation later we will get to drawing things.
	}


///
//	this.objects
///

if(!this.objects){
	this.objects={};
}

this.objects.base = function(){


};
this.objects.base.prototype = new diesel.proto.objectBase();



///
// this.ai
///

if(!this.ai){
	this.ai = {};
}


this.ai.base = function(){
	
	this.chooseTarget=function(){

	};
	
	this.selectWeapon=function(){
	
	};
	
	this.aim=function(){
		console.log("AI not aiming, code issues");
	};
	
	this.fire=function(){
		this.isActive = false;
		this.safetyOff = false;
		diesel.raiseEvent("fire", this);
	};

	this.update =function(){
		console.log("AI not thinking, code issues");
	}

};
///
//	this.ai.misterStupid
///

this.ai.misterStupid = function(){
	this.name ="AI #"+Math.round(Math.random() *100000).toString(16);
	this.isAI ="misterStupid";
	this.shouldOverride = true;
	this.isPlayer =false;
		
	this.update = function(ticks){
		
		if(this.canFall && this.canFall()){
			this.applyGravity();
			//TODO calculate damage
		}
		else{

			if(this.isActive){
				//mister stupoid picks random number and adds it to power
				this.power = Math.random() * this.maxPower;

				//mister stupid takes a rtanomd number and adds it to aim
				this.aim = diesel.clamp( this.aim + Math.random() - .5, this.directions.left, this.directions.right);

				//mister stupid shoots;
				this.fire();
			}
		}

	}

};
this.ai.misterStupid.prototype = this.ai.base();
///
//	tread.connections
///

if(!this.connections){
	this.connections = {};
}
///
//	this.connections.castApi
///

this.connections.castApi = function(){
	this.states = ["?!?", "!!!", "!?!","$#!%"];
	this.cast = window.cast || {};
	this.protocol = "urn:x-cast:co.housemark.dieseltanks";

	this.castReceiverManager =null;
	this.castMessageBus = null;
	this.config = null;

	this.commands = {
		"setGameParams":function(e){
			//We need to set somethings

			//# of wins to victory

			//starting cash ?

			//starting items ?

			//sound on/off

			//bg color?

			//fg color?

			//max players..

		}
	}

	this.init = function(){

		this.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    	this.castMessageBus = this.castReceiverManager.getCastMessageBus(this.protocol,
        cast.receiver.CastMessageBus.MessageType.JSON);

        this.castMessageBus.onMessage = this.onMessage;
        this.castMessageBus.onSenderConnected = this.onSenderConnected;
        this.castMessageBus.onSenderDisconnected = this.onSenderDisconnected;
		this.config = new cast.receiver.CastReceiverManager.Config();
		this.config.statusText = 'Rumbling!!';

		this.config.maxInactivity = 1000* 60 *5;

        this.castReceiverManager.start(this.config);


        console.log("castApi init");
	}

	this.onMessage = function(e){
		console.log("castMessage", e);

		if(this.commands[e.command]){
			this.commands[e.command](e);
		}
		else{
			console.log("invalid command" ,e.command)
		}
	};
	this.onSenderConnected = function(e){
		 console.log('Cast Sender Connected. #' +
          this.castReceiverManager.getSenders().length);

	};
	this.onSenderDisconnected = function(e){
		 console.log('Cast Sender Disconnected. remaining:' +
          this.castReceiverManager.getSenders().length);

		 //kill if we lost connections to the client.
		 if (this.castReceiverManager.getSenders().length == 0 
		 	&& game.activeScreen == "startup"
		 	&& game.players.length <=0) {
	       	console.log("should end here");
	      }

	};


	


	this.init();
};
///
//	this.connections.webSocket
///
this.connections.webSocket = {
	states : ["CONNECTING", "Connected", "CLOSING","CLOSED"],
	onOpen :function(){
		console.log("connected to websocket host", diesel.game.messageHost);
		diesel.game.ws.onmessage = diesel.game.connections.webSocket.routeMessage;
		diesel.game.ws.onerror = diesel.game.connections.webSocket.onError;
		diesel.game.ws.onclose = diesel.game.connections.webSocket.onClose;

		var gameid = diesel.url.args["gameid"]|| "unknown";
		console.log("creating game", gameid)
		
		diesel.game.ws.send(new diesel.game.messages.createGame(gameid));
	},
	onError:function(data){

		console.log("network error:", data);
	},
	onClose :function(){
		
		console.log("network error:", data);
		
	},
	routeMessage:function(MessageEvent){
	var text = MessageEvent.data;
	if(diesel.debug){
		console.log("ws recieved:",text, MessageEvent);
	}	
	var data;
	try{
		data= JSON.parse(text);
		if(diesel.game.messages[data.type]){

			var msg = new diesel.game.messages[data.type]();
			if(msg.process){
				msg.process(data);
			}
			else{
				console.log("unprocessable message", msg);
			}

		}
		else{
			console.log("unknown event", data);
		}
	}
	catch(ex){
		console.log("error parsing message:",ex , data);
		diesel.shouldLoop = false;
	}

}


};///
//	this.effects
///

if(!this.effects){
	this.effects = {};

}///
// this.effects.bullet;
///


this.effects.bullet = function(tank){

	this.x = tank.x + Math.sin(tank.aim) *tank.w ,
	this.y = tank.y + tank.h/2 + Math.cos(tank.aim) *tank.w;
	this.w = 3;
	this.h = 3;
	this.color = tank.color;
	this.angle = tank.aim + Math.PI;
	this.power = tank.power;
	this.isActive =true;
	this.weapon = tank.weapon;
	this.type="bullet";
	this.lastDrew= Math.random()/2;


	
	this.init = function(){
		diesel.addMixin(this, diesel.game.mixin.gravity);

		//remove a bullet from teh players inventroy for shooting.
		for(var i = 0 ;i < diesel.game.players.length;i++){
			if(diesel.game.players[i].name == tank.player){
				diesel.game.players[i].weapons[tank.weapon]--;
			}
		}
	};

	this.draw=function(econtext ,context){
		if(this.lastDrew > .1){ //draw every tenth of a second or so.
			this.lastDrew = 0;
			econtext.save();
				econtext.translate(this.x,this.y);
				econtext.rotate(Math.PI/4);
				econtext.fillStyle = this.color;
				econtext.fillRect(-1, -1,2,2);

			econtext.restore();
		}

		context.fillStyle ="#fff";
		context.fillRect(this.x-1,this.y-1,3,3)

	
	}
	this.update=function(ticks){
		this.lastDrew+=ticks;
		if( this.isActive){

			var oldx = this.x, 
			oldy=this.y,
			_x,
			_y;
			
			this.applyGravity(ticks);
			this.move(ticks, this.angle, this.power);

			var tests =[this.x,this.y];

			// if we are going too fast we need to check more 
			// points than the two we drew at. or bullets go through walls and tanks
			var minDist = 4, 
				dx = Math.abs(this.x - oldx),
				dy = Math.abs(this.y - oldy);
			if( dx>= minDist || dy>=minDist){
				for(var i = 0 ; i< dx+dy;i+=minDist){
					
					tests.push(diesel.lerp(this.x,oldx,i/(dx+dy)));
					tests.push(diesel.lerp(this.y,oldy,i/(dx+dy)));
				}
			}


			
			for(var i = tests.length-2 ; i >=0; i-=2){
				_x = tests[i];
				_y = tests[i+1];

				//did we hit something?
				if(game.screens.server.level.collides(_x, _y)){
					//trigger an explosion.
					this.isActive= false;
					this.x= _x, this.y=_y;
					diesel.raiseEvent("explosion", this);
					
					break;
					
				}
				else{
					//is the bullet still in the screen or above it?
					if(_x < 0 || 
						_x > game.width || 
						_y > game.height){
						//trigger an explosion.
						this.isActive= false;
						
						diesel.raiseEvent("miss", this);
						break;
					}
				}
			}
			
		}	

	};
	
	//bullets should always fall;
	this.canFall=function(){
		return true;
	};
	

	this.init();
};
this.effects.bullet.prototype = new this.objects.base();

///
//	this.effects.explosion
///

this.effects.explosion = function(x,y,weapon){

	this.x = x;
	this.y = y;
	this.radius = 15;
	this.radiusNow= 1;
	this.expand = true;
	this.shade = 128;
	this.speedModifier =50;
	this.isActive =true;
	this.damage = 600;
	this.type="explosion";

	this.init = function(weapon){
		
		if(weapon){
			
			this.radius = weapon.radius||this.radius;
		}
	}
	
	this.draw = function(eContext, context){
		if(this.isActive){
			context.save();
				context.fillStyle="rgba("+Math.round(this.shade)+", 0,0, 1)";
				context.beginPath();
				context.arc(this.x,this.y, this.radiusNow, 0, Math.PI *2);
				context.closePath();
				context.fill();
			context.restore();
			//draw onthe terrain as well.
			
			game.context.terrain.save();
				
				game.context.terrain.fillStyle= game.level.backgroundColor;
				game.context.terrain.beginPath();
				game.context.terrain.arc(this.x,this.y, this.radiusNow, 0, Math.PI *2);
				game.context.terrain.closePath();
				game.context.terrain.fill();
				
			game.context.terrain.restore();

			//flag tghe terrain data as dirty
			game.level.terrainUpdated = true;
		}

	};

	this.update =function(ticks){
		this.shade = (this.shade + 1)%256;
		
		if(this.expand){
			this.radiusNow += ticks * this.speedModifier;
			this.radiusNow = Math.min(this.radius, this.radiusNow);
			if(this.radiusNow >= this.radius){
				this.expand =false;
				
			}
		}
		else{
			this.radiusNow -= ticks * this.speedModifier;
		}
		if(this.radiusNow <= 0){
			this.isActive = false;
			
		}
		//apply damage now
		
		for(var i = 0; i <game.level.tanks.length; i++){
			if(game.level.tanks[i].distance(this.x, this.y)<= this.radiusNow +game.level.tanks[i].w/2){
				game.level.tanks[i].takeDamage(this.damage*ticks);
			}

		}

	};

	this.init(weapon);

}
this.effects.explosion.prototype = new this.objects.base();
///
// this.effects.text.js
///

this.effects.text = function(text,x,y,color,fontDetails){

	this.fontInfo = fontDetails || false;
	this.message = text ||"???";
	this.color = color||"#fff";
	this.x = x || 0;
	this.y = y || 0;
	this.ttl = 3;
	this.isActive = true;
	this.align = "left";
	this.type="text";
	this.after = null;

	this.init = function(){
	
	}

	this.draw = function(eContext, context){
		context.save();
			if(this.fontInfo){
				context.font = this.fontInfo;
			}
			context.fillStyle=this.color;
			context.textAlign = this.align;
			context.fillText(this.message, this.x, this.y)

		context.restore();

	};
	this.update =function(ticks){
		this.ttl -=ticks;
		if(this.ttl <=0){
			this.isActive = false;
			if(this.after){
				this.after();
			}
		}

	}
	this.init();
};
this.effects.text.prototype = new this.objects.base();///
//	this.events
///

if(!this.events){
	this.events = {};
}

///
//	this.events.removeBaseEvents
///

//remove some diesel base events for chromcast
this.events.click= function(){};
this.events.windowkeydown= this.events.click;
this.events.windowkeyup= this.events.click;

///
//	this.events.endLevel
///

this.events.endLevel = function(evt){
	var tanks = evt.args[0],
	ended = evt.args[1],
	message= "A draw, how boring!";


	if(tanks[ended].health >0){
		//last person alive
		//console.log("victory");
		message = tanks[ended].player + " wins!";
	}
	else{
		//console.log("draw");
	}

	//give every player a few dollars.
	for(var i =0; i <  game.players.length; i++){
		if(game.players[i].cash>0){
			game.players[i].cash += game.everyLevelAddCash;
		}
		else{
			game.players[i].cash = game.everyLevelAddCash;
		}
		if(game.players[i].name === tanks[ended].player && tanks[ended].health>0){
			//give the winner a bonus
			game.players[i].cash += game.levelWinnerBonus;

		}
	}
	

	//show  player won message
	var effect = new game.effects.text(message, this.width/2, this.height/2);
	effect.align = "center";
	//change to the next Level or the buy screen
	effect.after = function(){

		if(game.round == game.maxRounds){
			diesel.raiseEvent("screenChange", game.activeScreen, "endRound");
		}else{
			diesel.raiseEvent("screenChange", game.activeScreen, "buying");
		}	
		var msg = new game.messages.gameUpdate();
		msg.message = {
			"endLevel":this.level,
			"players":game.players
	};
		game.ws.send(JSON.stringify(msg));


	};
	game.screens.server.level.effects.push(effect);

};



///
// this.events.explosion
///


this.events.explosion = function(evt){
	var bullet = evt.args[0];


	
	var explosion = new game.effects.explosion(bullet.x, bullet.y,
	 diesel.game.weapons[bullet.weapon]);

	game.sound.instance.startTone(222,300);
				
	game.screens.server.level.effects.push(explosion);

	var numHit =0,tnk;
	for(var i = 0; i < game.level.tanks.length; i++){
		if(explosion.distance(game.level.tanks[i].x,game.level.tanks[i].y) <= explosion.radius){
			numHit++;
		}
		if(game.activePlayer =game.level.tanks[i].player){
			tnk = game.level.tanks[i];
		}
	}

	if(tnk){
		tnk.hits+= numHit;
	}
	

};


///
// this.events.fire
///

this.events.fire = function(evt){
	//ge teh corrds from teh tank 
	var tank = evt.args[0];
	tank.isActive = 0;

	var level = diesel.game.screens.server.level||false;
	
	if(level){

		var numbullets = level.effects.length;
		//remove any text shown.
		for(var i =0 ; i < level.effects.length;i++){
			if(this.level.effects[i].type =="text"){
				numbullets--;
			}
		}
		//generate a projectile add it to the level
		if(numbullets<=0){
			var bullet = new diesel.game.effects.bullet(tank);
			
			level.effects.push(bullet);

			//raise a turn change event.

			//level.nextPlayer();

		}
	}

	//TODO Sound.



};


///
//	this.events.miss
///

this.events.miss = function(evt){
	//change the active player
	console.log("misssed advanced player");
	
	//play a sound
	game.sound.instance.startTone(777,300);

};


///
//  this.messages
///

if(!this.messages){
	this.messages ={};
}

this.messages.base = {
	"type":"info",
	"content":{},
	"player":"unknown",
	parse:function(data){
		console.log(data);
	},
	toString:function(){
		return JSON.stringify(this);
	}
}




// heartbeat from the server
this.messages.heartbeat = function(data){

};
this.messages.heartbeat.prototype = this.messages.base;


//hello message
this.messages.hello = function(player){
	this.type = "hello";
	this.player = player;
	this.message = player;
};
this.messages.hello.prototype = this.messages.base;




// list games on teh server
this.messages.listGames = function(data){
	this.type= "listGames";
	this.content = null;
	this.player = null;
};
this.messages.listGames.prototype = this.messages.base;

//the list of games from the server
this.messages.gameList = function(data){
	this.type= "gameList";
	this.content = {"type":"tanks","version": this.version};;
	this.player = null;
	this.process = function(data){
		this.screens.gameList.networkGames = data.message.games||data.message;
		this.screens.gameList.loading =false;
	};
};
this.messages.gameList.prototype = this.messages.base;



// join a game
this.messages.joinGame = function(gameid, player, isQuick){
	this.type= "joinGame";
	this.game = gameid;
	this.player = player || this.localPlayer;
	this.message = {quick:isQuick||false};

};
this.messages.joinGame.prototype = this.messages.base;

// round start



//create a game
this.messages.createGame = function(gameid){
	this.type= "createGame";
	this.game = gameid;
	this.content = {"type":"tanks","version": this.version};
	this.player =null;

};
this.messages.createGame.prototype = this.messages.base;

//create a game
this.messages.error = function(){
	this.type= "error";
	this.process = function(data){
		console.log("ERROR",data);
		alert(data.message);
	};

};
this.messages.error.prototype = this.messages.base;



//a game sent uppdates
this.messages.gameUpdate = function(){
	this.type= "gameUpdate";
	this.game = diesel.game.networkGame;
	this.process = function(data){
		
		if(!diesel.game.networkGame){
			//we are connected to a game now our first message
			diesel.game.networkGame = data.game;
		}
		//we are in the right screen to parse our net message
		if(diesel.game.screens && 
			diesel.game.screens[diesel.game.activeScreen] &&
			diesel.game.screens[diesel.game.activeScreen].readNetMessage ){
				diesel.game.screens[diesel.game.activeScreen].readNetMessage(data)
		}
		else{
			if(diesel.debug){
				console.log("unable to process message", data);

			}
		}

		
	};

};
this.messages.gameUpdate.prototype = this.messages.base;




///
// this.mixin
///

if(!this.mixin){
	this.mixin = {};
}
///
//	this.mixin.damageable
///

this.mixin.damageable= {
	"health":100,
	"maxHealth":100,
	"shouldOverride":false,
	"takeDamage":function(amount, type){
		if(!type){
			type="generic";
		}
		this.health -= amount;
	//	console.log(amount, this.health);
	},
	"isDead":function(){
		return this.health <=0;
	}

}///
//	this.mixin.gravity
///

this.mixin.gravity = {
	"gravity":100,
	"downSpeed":0.01,
	"terminalVelocity":this.height*2,
	"shouldOverride":false,
	"applyGravity":function(ticks){
		if(this.canFall()){
			//I know it says up it's cool
			this.move(ticks, diesel.directions.up, this.downSpeed);

			if(this.downSpeed < this.terminalVelocity){
				this.downSpeed += this.gravity*ticks;
			}
			else{
				this.downSpeed = this.terminalVelocity;
			}
			
		}
	},
	"canFall":function(ticks){
		//query the level
		
		var onground= diesel.game.screens.server.level.collides(this.x, this.y+1);
		


		return !onground;
	}

}///
//	this.mixin.controlable
///

this.mixin.controlable = {
	"aim":Math.PI,
	"power":200,
	"maxPower":1000,
	"aimRate":1,
	"powerRate":100,
	"shouldOverride":false,
	"readKeys":function(ticks){

		if(game.keysDown.left){
			this.adjustAim(this.aimRate,ticks);
			
		}
		if(game.keysDown.right){
			this.adjustAim(this.aimRate *-1,ticks);
		
		}
		if(game.keysDown.up){
			this.adjustPower(this.powerRate,ticks);
		}
		if(game.keysDown.down){
			this.adjustPower(this.powerRate *-1,ticks);
		}
		if(game.keysDown.space && this.safetyOff && this.isActive){
			this.fire();
		}
	},

	"adjustAim":function(radians, ticks){
		this.aim += radians * ticks;
		this.aim = Math.max(Math.PI/2,Math.min(Math.PI/2*3,this.aim));
	},
	"adjustPower":function(units, ticks){
		this.power += units *ticks;
		this.power = Math.round(Math.max(0,Math.min(this.power,this.maxPower)));
	},
	"fire":function(){
		this.isActive = false;
		this.safetyOff = false;
		diesel.raiseEvent("fire", this);
		this.shotsTaken++;
		
	}
};


///
//	this.objects
///

if(!this.objects){
	this.objects={};
}

this.objects.base = function(){


};
this.objects.base.prototype = new diesel.proto.objectBase();



///
//	this.objects.level
///

this.objects.level = function(players){

	this.w = diesel.game.width;
	this.h = diesel.game.height;
	this.x = 0;
	this.y = 0;
	this.backgroundColor = "#000000";
	this.foregroundColor = "#99aa77";


	this.tanks = [];
	this.effects = [];
	this.terrain =[];
	this.terrainScale =4;


	this.activePlayer = 0;
	this.numTanks = players.length;
	this.ended= false;
	this.stats = {

	};
	this.pixelCache =null;




	this.init= function(){
		console.log("creating level");
		this.generateTerrain();
		
		this.placeTanks();
		game.screens.server.match 

		//TODO update active player;
		this.activePlayer = (game.round % (game.players.length -1))||0;
		game.round++;


		diesel.game.level =this;

		//clear the effect context.
		game.context.effects.clearRect(0,0, game.width-1, game.height);

	};
		
	this.generateTerrain = function(){
		var	keys= [];
		while(keys.length <= 3 || Math.random() < .8){
			keys.push(Math.random() * this.h/2 + this.h/2);
		}
		
		var segment = (this.w/this.terrainScale)/(keys.length -1);
		for(var x = 0 ; x < this.w / this.terrainScale;x++){
			var last = Math.floor(x/segment);


			var alt = diesel.lerp(keys[last],keys[last+1], (x%segment)/segment) ;
			alt += Math.random()*10 - 5;
			alt = diesel.math.clamp(alt, 1, this.h);
			
			this.terrain.push(Math.round(alt));			
		}

	};



	this.placeTanks = function(){
	
		var step = Math.floor(diesel.game.width / (players.length)); 
	
		for(var i = 0; i < players.length; i++){

			var x = diesel.clamp(Math.round(step * (i) + (step *.5) * (Math.random()-.5)),
				step/2, game.width-step/2);
	
			if(players[i].color && players[i].name != "server"){
				this.tanks.push(new diesel.game.units.tank(x, 0, players[i]));
		
			}
			else{
				this.numTanks --;
			}
		}
		
		this.tanks = diesel.shuffle(this.tanks);
		
		///let them fall
		var tnk;
		for(var i =0; i < this.tanks.length; i++ ){
			tnk =this.tanks[i];
			while(tnk.y + tnk.h/2 < this.terrain[Math.floor(tnk.x/this.terrainScale)]){
				this.tanks[i].y++;
			}

		}
	};
	
	this.collides =function(x,y){
		if(x <0 ||y<0||x>this.width){
			return false;
		}
		if(y >=this.height){
			return true;
		}
		var hit =false;
		var pixel = diesel.game.context.terrain.getImageData(x,y,1,1).data;
		var pixelColor = "#"+ pixel[0].toString(16)+
				pixel[1].toString(16)+
				pixel[2].toString(16);
		
		hit = (this.foregroundColor === pixelColor);

		

		if(!hit){
			for(var i =0; i < this.tanks.length;i++){
				hit = hit || this.tanks[i].contains(x,y);
			}
		}
		return hit;
	};

	this.drawTerrain = function(terrain){
		terrain.clearRect(0,0,diesel.game.width -1, diesel.game.height-1);
		var me = game.screens.server.level;

		
		terrain.save();
			terrain.fillStyle=me.backgroundColor;
			terrain.fillRect(0,0,me.w,me.h);
			terrain.fillStyle=me.foregroundColor;
			terrain.beginPath();
			terrain.moveTo(0,me.h -1);
			for(var x = 0; x <me.terrain.length; x++){
				terrain.lineTo(x* me.terrainScale, me.terrain[x]);
			}
			terrain.lineTo(me.w -1, me.h-1);
			terrain.closePath();
			terrain.fill();

			
		terrain.restore();
		
	}
	this.draw = function(context){
		
		context.clearRect(0,0,diesel.game.width -1, diesel.game.height-1);

		for(var i =0; i < this.tanks.length;i++){
			this.tanks[i].draw(context);//draw the visible tank
			this.tanks[i].draw(diesel.game.context.terrain,0,1); //clear terrain behind it.
			//whose turn is it?
			if(i == this.activePlayer){
				context.fillText(this.tanks[i].player, 25,25);
			}
		}

		for(var  i = 0 ; i < this.effects.length; i++){
			this.effects[i].draw(diesel.game.context.effects, context);
		}
	};


	this.update =function(ticks){
		for(var i = 0 ; i < this.tanks.length; i++){

			if(this.activePlayer === i){
				this.tanks[i].isActive =true;
				if(this.tanks[i].isDead()){
					this.nextPlayer();
				}
			}
			else{
				this.tanks[i].isActive = false;
				this.tanks[i].safteyOff = false;
			}
			this.tanks[i].update(ticks);

		};
		for(var  i = 0 ; i < this.effects.length; i++){
			this.effects[i].update(ticks);

			//if we are no longer active draw and 
			if(!this.effects[i].isActive){
				var endTurn =this.effects[i].type !="text" && this.effects.length == 1;

				this.effects.splice(i,1);

				i--;

				if(endTurn){
					this.nextPlayer();
				}
			}
		};
	};

	this.nextPlayer=function(){
		if(this.ended){
			return;
		}
		var start = this.activePlayer,
		next = (this.activePlayer+1)%this.tanks.length;

		var numActive =0;
		for(var i = 0 ; i < this.tanks.length; i++){
			if(this.tanks[i].health> 0){
				numActive++;
			}
		}

		//find the next live tanks
		while(this.tanks[next].health <= 0 && next != start){
			next= (next +1)%this.tanks.length;

		}

		// if we are were we started with either  tie or a win
		// or if we only have one or fewer active tanks
		if(next === start || numActive < 2){
			this.ended =true;
			if(this.tanks[next].health>0){
				this.stats.winner= this.tanks[next].player;
			}
			else{
				this.stats.draw = true;
			}

			for(var i = 0 ;i < this.tanks.length;i++){
				this.stats[this.tanks[i].player+ " Accuracy: "] =
				 Math.round(this.tanks[i].hits / this.tanks[i].shotsTaken*100) + "%";
			}

			diesel.raiseEvent("endLevel", this.tanks, next);
			
		}
		else{
			//in all other cases we can swap players
			this.activePlayer = next;

			//add an effect that shows us this for a few seconds.
			var txt = new game.effects.text(
				"It is now "+this.tanks[next].player + "'s Turn",
				 game.width/2, 50);
			txt.align = "center";
			this.effects.push(txt);

			//TODO play a sound

			//next turn show all clients the world as we know it.
			var msg = new game.messages.gameUpdate();
			msg.message = {"nextTurn":this};
			game.ws.send(JSON.stringify(msg));

		}


	};


	this.toJSON=function(){
		return {
		//	foregroundColor : this.foregroundColor,
		//	backgroundColor : this.backgroundColor,
			tanks:this.tanks,
		//	terrain: this.terrain,
		//	terrainScale: this.terrainScale,
			activePlayer:this.activePlayer||0
		};

	};

	this.init();

};

this.objects.level.prototype = new this.objects.base();
///
//	this.objects.player
///

this.objects.player = function(name, color){
	this.name= name|| "fred";
	this.color = color||"#"+Math.floor(Math.random()*0x999 + 0x666).toString(16);
	//todo icon:[],
	this.cash =100;
	this.alive=true;
	this.isAI = false;
	this.tank = null;
	this.isCastAPI =false;
	this.ready =false;
	
	this.weapons = {};
	this.activeWeapon = null;

	this.init= function(){
		var most=0,wname="none";
		for(var wep in diesel.game.weapons){
			this.weapons[wep] = diesel.game.weapons[wep].start;
			if(this.weapons[wep]> most){
				most = this.weapons[wep];
				wname = wep;
			}

			this.activeWeapon = wname;
		}
	}

	this.init();
};
///
//	this.objects.match
///

this.objects.match = function(players, level){
	
	this.init =function(players){
		

	}
	this.draw = function(context){
		this.level.draw(context);
		
	}
	this.update=function(ticks){
		this.level.update(ticks);
	}


	


	this.init(players);

}///
//	tread.screens
///

if(!this.screens){
	this.screens = {};
}
///
//	cast.screens.endRound
///
/*
shown by the server durring connection.
*/
this.screens.endRound  = function(){
	this.timeToShow = 60;
	this.timer = this.timeToShow;

	this.reset = function(){
		this.timer = this.timeToShow;
	}


	this.draw =function(){
		game.context.effects.clearRect( 0,0, game.width, game.height);
		game.context.effects.fillStyle= "rgba(0, 0, 0, .75)";
		game.context.effects.fillRect( 0,0, game.width, game.height);
		

		// TODO draw the last round stats;
		game.context.effects.strokeStyle= "#fff";
		game.context.effects.strokeRect(50,100, game.width -100, game.height - 150);
		game.context.effects.fillStyle= "#fff";
		var i=1;
		for(var stat in game.level.stats){
			game.context.effects.fillText(stat +" : "+ game.level.stats[stat], 50, 100+25*i);
			i++;
		}
		//show the timer
		game.context.effects.fillStyle= "#fff";
		game.context.effects.fillText( Math.ceil(this.timer) + " seconds to close", 50, 50);
		game.context.effects.fillText( "Thanks for playing, GGs", 50, 75);


		
	}

	this.update =function(ticks){
		this.timer -= ticks;

		if(this.timer <=0 &&game.cast &&game.cast.readyState ==4){
			window.close();
		}
	}

};

this.screens.endRound.prototype =  new diesel.proto.screen();
this.screens.endRound = new this.screens.endRound();
///
//	tread.screens.buying
///
/*
shown by the server durring connection.
*/
this.screens.buying  = function(){
	this.timeToShow = 10;
	this.timer = this.timeToShow;

	this.reset = function(){
		this.timer = this.timeToShow;
	}

	this.draw= function(){
		game.context.effects.clearRect( 0,0, game.width, game.height);
		game.context.effects.fillStyle= "rgba(0, 0, 0, .75)";
		game.context.effects.fillRect( 0,0, game.width, game.height);
		

		// TODO draw the last round stats;
		game.context.effects.strokeStyle= "#fff";
		game.context.effects.strokeRect(50,100, game.width -100, game.height - 150);
		game.context.effects.fillStyle= "#fff";
		var i=1;
		for(var stat in game.level.stats){
			game.context.effects.fillText(stat +" : "+ game.level.stats[stat], 50, 100+25*i);
			i++;
		}

		
		//show the timer
		game.context.effects.fillStyle= "#fff";
		game.context.effects.fillText( Math.ceil(this.timer) + " seconds to the next round", 50, 50);
		game.context.effects.fillText( "Get to buying  stuff if you need it.", 50, 75);


	}	

	this.update =function(ticks){
		this.timer -= ticks;

		if(this.timer <=0){
			diesel.raiseEvent("screenChange", "buying","server");
		}
	}
	this.readNetMessage =function(gameUpdate){
		var msg =gameUpdate.message;
		if(msg){
			if(msg.buy){
				
				for(var i = 0; i < game.players.length; i++){
					if(game.players[i].name == gameUpdate.player.name){

						var cost = game.weapons[msg.buy].cost;
						if(game.players[i].cash >= cost){

							console.log(msg.player.name + " bought " + msg.buy);

							//deduct the $$$
							game.players[i].cash -= cost;

							//add an item to our request
							if(!game.players[i].weapons[item]){
								game.players[i].weapons[item] =1;
							}
							else{
								game.players[i].weapons[item]++;
							}
						}
					}

				}
			}

			//forwarrd the heart beat message.
			if(msg.heartbeat){
				game.screens.setup.readNetMessage(gameUpdate);
			}
		}

	};



};

this.screens.buying.prototype =  new diesel.proto.screen()
this.screens.buying = new this.screens.buying();
///
//	tread.screens.server
///

//the server code.


this.screens.server = function(){
	this.time = 0;
	this.round = 0;
	this.match = null 
	this.level =null;

	this.reset = function(from, to){
		this.level = new game.objects.level(game.players);
		this.round ++;
		this.time = 0;
		this.level.drawTerrain(game.context.terrain);

		var msg = new game.messages.gameUpdate();
		msg.message = {
			"newLevel":this.level,
			"players":game.players
	};
		game.ws.send(JSON.stringify(msg));

		console.log("on level screen");

	};

	this.draw= function(){

		game.screens.server.level.draw(game.context.main);
		game.context.main.fillStyle="#fff";
		game.context.main.fillText("#"+ game.networkGame.serverId, diesel.game.width-100, 25);
		game.context.main.fillText(game.round+"/"+ game.maxRounds, diesel.game.width-75, 50);
		
	};

	this.update =function(ticks){
		game.screens.server.level.update(ticks);
		game.screens.server.time += ticks;
	}
	this.readNetMessage =function(gameUpdate){
		var msg =gameUpdate.message;
		if(diesel.debug){
			console.log("processing message of type:",msg);
		}

		


		//show where they are aiming
		if(msg.aim){
			//TODO validataion
			for(var i = 0; i < game.players.length;i++){
				if(msg.aim.player === this.level.tanks[i].player){
					if(this.level.tanks[i].aim != msg.aim.aim){
						this.level.tanks[i].aim = msg.aim.aim;
						game.sound.instance.startTone(Math.abs(diesel.degrees(msg.aim.aim) )+360,200);
					}
					if(this.level.tanks[i].power != msg.aim.power){
						this.level.tanks[i].power = msg.aim.power;
						game.sound.instance.startTone(msg.aim.power/4 +100,200);
					}
					
					break;
				}
			}
			//TODO sounds
		
		}

		//show the fire effect
		if(msg.fire){
	
		
			if(msg.fire.player === game.level.tanks[game.level.activePlayer].player
				//&& game.level.effects.length === 0
				&& game.level.tanks[game.level.activePlayer].isActive
				&& game.level.tanks[game.level.activePlayer].safetyOff
				){
				//TODO aim
				//TODO power
				
				var aim = diesel.clamp(msg.fire.aim, game.directions.left, game.directions.right),
				power = diesel.clamp(msg.fire.power, 0,game.level.tanks[game.level.activePlayer].maxPower); 


				
				game.level.tanks[game.level.activePlayer].aim = aim;
				game.level.tanks[game.level.activePlayer].power = power;
				game.level.tanks[game.level.activePlayer].weapon = msg.fire.weapon|| "babyMissile";
				
				game.level.tanks[game.level.activePlayer].fire();
				game.sound.instance.startTone(game.level.tanks[game.level.activePlayer].power/game.level.tanks[game.level.activePlayer].aim,50);
			}
			else{
				console.log("invalid fire command from ", msg.fire.player, msg.fire);
			}
		}

		if(msg.dropped){
			for(var i = 0; diesel.game.players.length; i++){
					if(game.players[i].name === msg.message.dropped.name){

						game.players.splice(i,1);
					
						for(var j = 0; j < game.level.tanks.length; j++){
							if(game.level.tanks[j].player === msg.dropped.player.name){

							
								//insert an ai  in the slot
								diesel.addMixin(game.level.tanks[j], game.ai.misterStupid, true);

								// notifiy the players
								var eff = new game.effects.text(msg.dropped.player.name+" dropped. Replaced with AI", game.width/3,50,"#fff");
								game.level.effects.push(eff);
							}

						}

						

					}
				}
			

		}
	



		



	}


};
this.screens.server.prototype = new diesel.proto.screen()
this.screens.server = new this.screens.server();
///
//	tread.screens.setup
///
/*
shown by the server durring connection.
*/
this.screens.setup  = function(){
	this.countdownTime = 1;
	this.CountDownRemaining = 0;
	this.allReady = false;
	this.addressOfCLient = "lbrunjes.github.io/game/tanks";

	this.draw= function(){
		var me = diesel.game;
		me.context.main.fillStyle= "#000";
		me.context.main.fillRect(0,0, me.width, me.height);

		me.context.main.fillStyle= "#fff";
		me.context.main.fillText("Hello there...", 25,25);

		
		
		me.context.main.fillStyle= "#fff";
		if(diesel.debug){
			me.context.main.fillText("web Socket...", 25,75);
			if(me.ws.readyState ===1 ){
				me.context.main.fillStyle= "#0f0";
			}
			else{
				me.context.main.fillStyle= "#f00";
			}
			me.context.main.fillText(me.connections.webSocket.states[diesel.game.ws.readyState] || "?!", 300,75);

			

			me.context.main.fillStyle= "#fff";
			me.context.main.fillText("Cast API...", 25,100);
			if(me.cast.readyState ===1 ){
				me.context.main.fillStyle= "#0f0";
			}
			else{
				me.context.main.fillStyle= "#f00";
			}
			me.context.main.fillText(me.cast.states[me.cast.readyState], 300,100);
		}
		else
		{
			me.context.main.fillText("Welcome to Diesel Tanks", 25,75);
		}

		//show connected players with color and ready state.
		me.context.main.fillStyle = "#fff";
		//server is not a player thus all the ones
		me.context.main.fillText("Connected Players ("+Math.max(me.players.length -1,0)+"/"+me.maxPlayers+")" , 25,150);

		for(var i = 1 ; i<me.players.length;i++){
			me.context.main.fillStyle = "#fff";
			if(me.players[i].ready){
				me.context.main.fillText("&reg;", 0, 150 + 25*i);	
			}
			me.context.main.fillText(me.players[i].name, 50, 150 + 25*i);			
			me.context.main.fillStyle = me.players[i].color || "#fff";
			me.context.main.fillRect( 25, 125 + 25*i, 25,25);	
			
		}


		//if we are all connected and ready simply start a count down to play
			me.context.main.fillStyle= "#fff";
		if(this.allReady &&me.players.length>2){
			me.context.main.fillText("starting in "+Math.ceil(this.CountDownRemaining), 25, me.height-50);
		}
		else{
			me.context.main.fillText("Waiting for players", 25, me.height-50);	
		}
		if(me.networkGame){
			me.context.main.fillText("Game Code:"+ me.networkGame.serverId, 25, me.height-85);
			me.context.main.fillText("Go here to play: "+this.addressOfCLient, 25, me.height-125);		
		}

	};

	this.update= function(ticks){
		
		//is everyone ready?
		var readyNow =false;

		//loop though players
		if(diesel.game.players.length >= diesel.game.maxPlayers +1){ //the first player is the server
			// var ready = true;
			// for(var i = 0;i < diesel.game.players.length;i++){
			// 	ready = ready && diesel.game.players[i].ready;
			// }
			// readyNow = ready;
			readyNow =true;

		}

		//did we lose any one?
		
		if(readyNow && !this.allReady){
			this.CountDownRemaining = this.countdownTime;
		}
		this.allReady = readyNow;

		//count down
		this.CountDownRemaining -= ticks;

		//start if the count down is less

		if((this.CountDownRemaining < 0 && this.allReady)){
			diesel.raiseEvent("screenChange","setup","server", null);
		}
	

	};

	this.readNetMessage = function(msg){
		
		//this screen only cares about heart beats
		if(msg && msg.message){

			if(msg.message.heartbeat){
				var players = msg.message.heartbeat;

				//this is an array of players.
				for(var i = 0; i < players.length;i++){
					if(diesel.game.players[i]){
						if(diesel.game.players[i].name != players[i].name){
							var p = new diesel.game.objects.player(players[i].name,players[i].color);
							diesel.game.players[i] = p;
						}
					}
					else{
						var p = new diesel.game.objects.player(players[i].name,players[i].color);
						diesel.game.players.push(p);
					}

				}
			}


			if(msg.message.dropped){
				//remove teh player from the players list
				for(var i = 0; diesel.game.players.length; i++){
					if(game.players[i].name === msg.message.dropped.name){

						game.players.splice(i,1);

					}
				}

			}


		}

	};


};

this.screens.setup.prototype =  new diesel.proto.screen()
this.screens.setup = new this.screens.setup ();
///
// game.sound
///
// an oscillator based sound system
this.sound = {};

this.sound.system= function(){
	this.context =  null;
	this.oscillator= null,
	this.gain = null;
	this.enabled = false;


	this.init = function(){
		this.context = new window.AudioContext();

		this.oscillator = this.context.createOscillator();
		this.oscillator.frequency.value=0;

		this.oscillator.start(0.5);
	}

	this.startTone = function(frequency, end){
		if(this.enabled){
			var now = this.context.currentTime;
			this.oscillator.frequency.setValueAtTime(frequency,now);
			this.oscillator.connect(this.context.destination);

			if(end){
				setTimeout(game.sound.instance.endTone,end);
			}
		}


	};



	this.endTone = function(){
		var now = game.sound.instance.context.currentTime;
		game.sound.instance.oscillator.frequency.setValueAtTime(0,now);
		game.sound.instance.oscillator.disconnect();
	};

	this.playSound = function(soundFile){
		if(enabled){
			//plays a cached diesel sound
			
			if(diesel.soundCache[soundFile]){
				diesel.soundCache[soundFile].play();
			}
		}
	}

 this.init();
};



///
// game.units.base
///
if(!this.units){

	this.units = {};
}
this.units.base = function(){
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.w=16;
	this.h=16
	this.d=16;
	this.player =  null;
	this.color = "#333333";


	
}
this.units.base.prototype = new diesel.proto.objectBase();
///
//	this.units.tank
///

this.units.tank = function(x,y,player){
	this.x = x ||0;
	this.y = y||0;
	this.z = 0;
	this.w=16;
	this.h=8
	this.d=16;
	this.aim = Math.PI;
	this.power = 200;
	this.maxPower =1000;
	this.isPlayer = true;
	this.isActive = false;
	this.safetyOff = false;
	this.weapon = "babyMissile";
	this.shotsTaken = 0;
	this.hits =0;


	this.init = function(player){
		this.maxHealth =100;
		this.health =this.maxHealth;
		
		// diesel.addMixin(this, diesel.game.mixin.hoverable);
		diesel.mixin.addMixin(this, diesel.game.mixin.damageable);
		diesel.mixin.addMixin(this, diesel.game.mixin.gravity);
		diesel.mixin.addMixin(this,  diesel.game.mixin.controlable);
		this.weapon = player.activeWeapon;
		
	


		if(player){
			this.player = player.name|| null;
			this.color = player.color;

			diesel.mixin.addMixin(this, player,true);	
		}
	}


	//functions
	
	this.canMove =function(ticks, direction, pulse){
		
	}

	this.draw =function(context, useorigin, world){
		if(world){
			context.fillStyle = diesel.game.screens.server.level.backgroundColor;
			context.strokeStyle = context.fillStyle;
		}
		else{
			if(!this.isDead()){
				context.fillStyle= this.color;
				context.strokeStyle= this.color;
			}
			else{
				context.fillStyle= "#333";
				context.strokeStyle= "#333";
				
			}
		}
		context.save();

			if(!useorigin){
				context.translate(this.x , this.y + this.h/2);
			}
		
			context.beginPath();
			context.arc(0,0,this.w/2,0, Math.PI,true);
			context.fill();
			//draw gun barrel
			context.moveTo(0,-1);
			context.lineTo(Math.sin(this.aim) *this.w,
				 Math.cos(this.aim) *this.w);
			context.stroke();
			context.closePath();

			context.fillStyle = "#000";
			//windows are cool.
			context.fillRect(this.w/-4-1,this.h/-3,2,2);
			context.fillRect(-1,this.h/-3,2,2);
			context.fillRect(this.w/4-1,this.h/-3,2,2);

			
			
		context.restore();

		// if(this.isActive && !useorigin){
		// 		context.textAlign = "left";
		// 		context.fillText("angle: "+ (Math.round(diesel.degrees(this.aim)) -90),
		// 		 game.fontSize,game.fontSize);
		// 		context.fillText("power: "+this.power, game.fontSize,game.fontSize*2);
		// 		context.fillText("health: "+Math.ceil(this.health), game.fontSize, game.fontSize*3);
		// }

		

	};

	this.update = function(ticks){
		
		this.applyGravity(ticks);


		if(this.isActive){
			if(this.isDead()){
				this.isActive =false;
			}
			else{
				if(game.screens.server.level.effects.length == 0){
					this.safetyOff = true;
				}
				else{
					this.safetyOff =false;
				}
			}
		}
	}
	this.toJSON= function(){
		return {
			"x":this.x,
			"y":this.y,
			//"z":0,
			"w":this.w,
			"h":this.h,
			//"d":16,
			"aim":this.aim,
			"power":this.power,
			//"maxPower":1000,
			//"isPlayer":true,
			"isActive":this.isActive,
			"safetyOff":this.safetyOff,
			//"maxHealth":100,
			"health":this.health,
			//"shouldOverride":true,
			"player":this.player,
			"color":this.color,
			//"aimRate":1,
			//"powerRate":100}
			"weapon":this.weapon

		};
	};
	this.init(player);
}

this.units.tank.prototype = new this.units.base();

///
//	game.weapons
///

this.weapons = {

	babyMissile:{
		start:99,
		radius:15,
		cost:0,
		name:"Baby Missile"
	},
	missile:{
		start:5,
		radius:30,
		cost:50,
		name:"Missile"
	},
	bigMissile:{
		start:3,
		radius:45,
		cost:100,
		name:"Big Missile"
	},
	nuke:{
		start:1,
		radius:500,
		cost:500,
		name:"Nuke"	
	}

};


////
// END
////
 this.init();

};
tread.prototype= new diesel.proto.game();
var game = new tread();


