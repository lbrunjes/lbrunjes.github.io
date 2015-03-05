//built at Thu 05 Mar 2015 03:09:01 PM EST
/*
	DIESEL TANKS
	a simple tank game in html5 
	Built using diesel.js
	2014 Lee Brunjes - lee.brunjes@gmail.com
 
*/
var TANKS_APP_ID="1DC73FAD";
var TANKS_APP_NS="co.housemark.tanks";




var game = function(messageHost, isServer){

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


	// Web Sockets Stuff
	this.messageHost = messageHost || "ws:\\housemark.co:9000";
	this.messageQueue=[];
	this.ws = null;
	this.cast = null;
	
	this.players =[];
	this.maxPlayers =2;
	this.localPlayer = null;

	this.width=640;
	this.height=480;

	this.isServer = isServer||false;
	this.networkGame = false;
	this.networkGames = {};


	this.level = null;
	this.round =0;
	this.maxRounds =3;
	this.mouseDown=false;

	this.touches=[];
	this.x;
	this.y;

	this.fontSize= 32;
	this.font ="monospace";

	
	this.activeScreen="attract";

	
	




	this.init = function(){
		console.log("game init");

		if(!diesel){
			alert("diesel tanks can't start with no engine");
		}

		diesel.fpsLimit =30;
		diesel.pauseOnBlur =true;
		//TODO Pixel denisty for retina.

		this.width = window.innerWidth;
		this.height = window.innerHeight;
		window.scrollMaxX=0;
		window.scrollMaxY=0;
		window.scrollbars.visible = false;

		this.ws = new WebSocket(this.messageHost, false);
		this.ws.onopen = this.connections.webSocket.onOpen;
		this.ws.onclose = this.connections.webSocket.onClose;

		
		//this.cast = new this.connections.castApi();

		this.chat = new this.objects.chat();
		this.form = new this.objects.form();

		this.sound.instance = new this.sound.system();


		
		

	}

	this.startup =function(){
		console.log("game start");

		this.localPlayer = new this.objects.player();
		var player = diesel.events.load("player");
		if(player){
			this.localPlayer.name = player.name;
			this.localPlayer.color = player.color;
		}

		diesel.registerKey("enter",13);
		diesel.registerKey("space",32);
		diesel.registerKey("tab",9)
		diesel.registerKey("backslash", 220);


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
		}
		else{

			if(this.isActive){
				//mister stupoid picks random number and adds it to power
				this.power = Math.random() * this.maxPower;

				//mister stupid takes a rtanomd number and adds it to aim
				this.aim = diesel.clamp( this.aim + Math.random() - .5, diesel.directions.left, 
					diesel.directions.right);

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
this.connections = {};
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
		console.log("connected to websocket host", game.messageHost);
		game.ws.onmessage = game.connections.webSocket.routeMessage;
		game.ws.onerror = game.connections.webSocket.onError;
		game.ws.onclose = game.connections.webSocket.onClose;

		//This might be a terrible idea?
		if(1){
			game.ws.send(new game.messages.listGames());
		}
		
	},
	onError:function(data){

		console.log("network error:", data);
	},
	onClose :function(data){
		
		console.log("network closed:", data);
		game.networkGame = null;
		

		
	},
	routeMessage:function(MessageEvent){
	var text = MessageEvent.data;
	
	var data;
	try{
		data= JSON.parse(text);
		if(game.messages[data.type]){

			var msg = new game.messages[data.type]();
			if(msg.process){
				msg.process(data);
			}
			else{
				console.log("unprocessable message", text, data);
			}

		}
		else{
			console.log("unknown event", data);
		}
	}
	catch(ex){
		console.log("error parsing message:",ex , data);
	}

	},
	"queueMessage":function(message){
		if(game.debug){
			console.log("RX msg:",message);
		}
		game.messageQueue.push(message);
	},
	"processMessageQueue":function(){
		var list = game.messageQueue.splice(0,game.messageQueue.length-1);
		while (list.length > 0){
			var msg = list.splice(0,1)[0];
			game.connections.webSocket.routeMessage(msg);
		}
	}



};///
//	this.effects
///
this.effects = {};///
// this.effects.bullet;
///


this.effects.bullet = function(tank){

	this.x = 0;
	this.y = 0;
	this.w = 3;
	this.h = 3;
	this.color = "#fff";
	this.angle = Math.PI;
	this.power = 200;
	this.isActive =true;
	this.weapon = "missile";
	this.type="bullet";
	this.lastDrew= Math.random()/2;

	this.horz =0;
	this.vert =0;
	this.t =0;
	this.sx=0;
	this.sy=0;
	this.gravity =10;
	this.data = [];
	


	this.onExplode = false;


	
	this.init = function(tank){
		if(tank){
			this.x = tank.x + Math.sin(tank.aim) *tank.w;
			this.y = tank.y + tank.h/2 + Math.cos(tank.aim) *tank.w;
			this.color = tank.color;
			this.angle = tank.aim + Math.PI;
			this.power = tank.power;
			this.weapon = tank.weapon;
			//remove a bullet from teh players inventroy for shooting.
			for(var i = 0 ;i < game.players.length;i++){
				if(game.players[i].name == tank.player){
					game.players[i].weapons[tank.weapon]--;
				}
			}
			this.horz = Math.sin(this.angle)*this.power * -1;
			this.vert = Math.cos(this.angle)*this.power * -1;
			this.sy  = this.y;
			this.sx =this.x;

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

		this.t +=ticks;
		this.lastDrew+=ticks;
		if( this.isActive){

			var oldx = this.x, 
			oldy=this.y,
			_x,
			_y;
			
			this.x = this.t * this.horz + this.sx;
			this.y = this.t* this.vert + Math.pow(this.gravity *this.t, this.t) +this.sy;
		
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

				//did we hit a tank?
				var hit = false;
				for(var j = 0; j <game.level.tanks.length; j++){
						hit = hit || game.level.tanks[j].contains(_x,_y);
				}
			//did we hit something?
				if(	hit ||
					game.level.collides(_x, _y)||
					 _y > game.height){

					//trigger an explosion.
					this.isActive= false;
					this.x= _x, this.y=_y;
					if(this.onExplode){
						this.onExplode();
					}
					if(game.isServer){
						diesel.raiseEvent("explosion", this);
					}
					
					break;
					
				}
				else{
					//is the bullet still in the screen or above it?
					if(_x < 0 || 
						_x > game.width
						){
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

	this.toJSON= function(){
		return{
			x:this.x,
			y:this.y,
			w:this.w,
			h:this.h,
			data:this.data
					
		}
	}
	

	this.init(tank);
};
this.effects.bullet.prototype = new this.objects.base();

///
//	this.effects.explosion
///

this.effects.explosion = function(x,y,weapon, data){

	this.x = x||0;
	this.y = y||0;
	this.radius = 15;
	this.radiusNow= 1;
	this.expand = true;
	this.shade = 128;
	this.speedModifier =50;
	this.isActive =true;
	this.damage = 600;
	this.type="explosion";
	this.hit = [];

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
		this.shade = Math.sin(diesel.frameCount/10)*128 +128;
		
		if(this.expand){
			this.radiusNow += this.speedModifier;
			this.radiusNow = Math.min(this.radius, this.radiusNow);
			if(this.radiusNow >= this.radius){
				this.expand =false;
				this.radiusNow = this.radius;
			}
		}
		else{
			this.radiusNow -= ticks * this.speedModifier;
		}
		if(this.radiusNow <= 0){
			this.isActive = false;
			//apply damage now
			var numHits =0;
			var damage =0;
			for(var i = 0; i <game.level.tanks.length; i++){
				var d = game.level.tanks[i].distance(this.x, this.y);
				if( d<= this.radius){
					var pct = 1-(d/this.radius);
					game.level.tanks[i].takeDamage(this.damage*pct);
					damage += this.damage *pct;
					if(game.level.tanks[i].player != game.activePlayer){
						numHits++;
					}
				}
			}
			if(numHits){
				game.level.addHits(game.level.tanks[game.level.activePlayer].player, numHits);
				game.level.addDamage(game.level.tanks[game.level.activePlayer].player, damage);
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
//	this.events.endLevel
///

this.events.endLevel = function(evt){
	var tanks = evt.args[0],
	ended = evt.args[1],
	message= "A draw, how boring!";

	this.everyLevelAddCash = 50;
	this.levelWinnerBonus = 100;


	if(tanks[ended].health >0){
		//last person alive
		message = tanks[ended].player + " wins!";
	}

	//give every player a few dollars.
	for(var i =0; i <  game.players.length; i++){
		if(game.players[i].cash>0){
			game.players[i].cash += this.everyLevelAddCash;
		}
		else{
			game.players[i].cash = this.everyLevelAddCash;
		}
		if(game.players[i].name === tanks[ended].player && tanks[ended].health>0){
			//give the winner a bonus
			game.players[i].cash += this.levelWinnerBonus;
		}
	}
	

	//show  player won message
	var effect = new game.effects.text(message, this.width/2, this.height/2);
	effect.align = "center";
	//change to the next Level or the buy screen
	effect.after = function(){
		if(game.round >= game.maxRounds){
			diesel.raiseEvent("screenChange", game.activeScreen, "endGame");
			var msg = new game.messages.endGame();
		
				game.ws.send(JSON.stringify(msg));
		}else{
			diesel.raiseEvent("screenChange", game.activeScreen, "buying");
				//TODO send buying message, include stats
				var msg = new game.messages.endLevel();
		
				game.ws.send(JSON.stringify(msg));
		}	
	};
	game.level.effects.push(effect);

};



///
// this.events.explosion
///


this.events.explosion = function(evt){
	var bullet = evt.args[0];


	
	var explosion = new game.effects.explosion(bullet.x, bullet.y,
	 game.weapons[bullet.weapon], bullet.data||[]);

	game.sound.instance.startTone(222,300);
				
	game.level.effects.push(explosion);
	if(game.isServer){
		var msg = JSON.stringify(new game.messages.explosion(bullet.x,bullet.y, bullet.weapon, bullet.data));
		game.ws.send(msg);
	}

};


///
// this.events.fire
///

this.events.fire = function(evt){
	//ge teh corrds from teh tank 
	var tank = evt.args[0];
	tank.isActive = 0;
	var data =null
	if(evt.args.lengh >=2){
		data = evt.args[1]
	}

	var level = game.level||false;
	
	if(level){

		var numbullets = level.effects.length;
		//remove any text shown.
		for(var i =0 ; i < level.effects.length;i++){
			if(level.effects[i].type =="text"){
				numbullets--;
			}
		}
		//generate a projectile add it to the level
		if(numbullets<=0){
			var bullet = null;
			if(!game.effects.bullets[tank.weapon]){
			 	bullet =  new game.effects.bullet(tank);
			}
			else{
				bullet =  new game.effects.bullets[tank.weapon](tank, data);
			}
			
			level.effects.push(bullet);
			if(game.localPlayer.name === tank.player){
				var msg = JSON.stringify(new game.messages.fire(tank.aim, tank.power, tank.weapon));
				game.ws.send(msg)
			}
		}
	}


};


///
//	this.events.miss
///

this.events.miss = function(evt){
	//change the active player
	console.log("misssed advanced player");
	
	//TODO play a sound on miss
	game.sound.instance.startTone(777,300);

};


///
//  this.messages
///

if(!this.messages){
	this.messages ={};
}
/*
These objects must have a process function to be recieved.
*/
this.messages.serverCommand = {
	"command":"info",
	process:function(data){
		console.log(data);
	},
	toString:function(){
		return JSON.stringify(this);
	}
}

this.messages.gameCommand = {
	"type":"info",
	"player":game.localPlayer,
	process:function(data){
		console.log(data);
	},
	toString:function(){
		return JSON.stringify(this);
	}
}





///
// SERVER Commands
///
this.messages.info = function(){
	this.command = "info";
	this.process = function(data){
		console.log(data);
	}
}
this.messages.info.prototype = this.messages.serverCommand;


this.messages.listGames = function(){
	this.command = "listGames";
}
this.messages.listGames.prototype = this.messages.serverCommand;

this.messages.createGame = function(gameid){
	this.command = "createGame";
	this.player = game.localPlayer;
	this.game = gameid;
}
this.messages.createGame.prototype = this.messages.serverCommand;

this.messages.joinGame = function(gameid){
	this.command = "joinGame"
	this.player = game.localPlayer;
	this.game = gameid;
}
this.messages.joinGame.prototype = this.messages.serverCommand;

this.messages.gameInfo = function(gameid){
	this.command = "gameInfo";
	this.game = gameid;
	this.process = function(data){
		console.log(data);
	}
}
this.messages.gameInfo.prototype = this.messages.serverCommand;



///
// server command responses
///

//list of all games on server
this.messages.gameList = function(){
	this.process = function(data){
		game.networkGames = data.message;
	}
}
this.messages.gameList.prototype = this.messages.serverCommand;

//sent command was okay
this.messages.command_okay = function(){
	this.process = function(data){
		game.chat.addMessage(data);
	}
}
this.messages.command_okay.prototype = this.messages.serverCommand;

//all serverside errors
this.messages.error = function(){
	this.process = function(data){
		console.log(data);
		alert(data.message);
		game.chat.addMessage("Error:"+data.message);
		if(game.screens[game.activeScreen].handleError){
			game.screens[game.activeScreen].handleError(data);
		}
	}
}
this.messages.error.prototype = this.messages.serverCommand;


//game info
this.messages.game = function(){
	this.process = function(data){
		game.networkGames[data.id] = data;

		if(game.networkGame == data.id){
			game.players = data.players;

			//assign new host if needed
			if(game.players[0] && game.players[0].name === game.localPlayer.name){
				game.isServer =true;
				diesel.pauseOnBlur =false;
			}
		}
	}
}
this.messages.game.prototype = this.messages.serverCommand;

///
// Game Messages
///
//sent to all player whena  player joins
this.messages.join = function(){
	this.process =function(data){
		
		if(!game.networkGame){
			//we are connected to a game now our first message
			game.networkGame = data.game;
			var msg = new game.messages.gameInfo(data.game);
			game.ws.send(JSON.stringify(msg));
		}

		var pl = new game.objects.player(data.message.joined.name,
			 data.message.joined.color);
		game.players.push(pl);
		
		

		game.chat.addMessage(pl.name + " joined the game");
	}
}
this.messages.join.prototype = this.messages.gameCommand;

//sent to all players when a player leaves
this.messages.part = function(){
	this.game = game.networkGame;
	this.player= game.localPlayer.name;
	this.process = function(data){
		
		//remove teh player from the players list
		for(var i = 0; i< game.players.length; i++){
			if(game.players[i] && 
				game.players[i].name && 
				game.players[i].name === data.player){
				
				game.chat.addMessage(game.players[i].name + " left the game");

				game.players.splice(i,1);
				i--;

			}
		}

		// assign new host if needed
		if(game.players[0] && game.players[0].name === game.localPlayer.name){
			game.isServer =true;
		}
	}
}
this.messages.part.prototype = this.messages.gameCommand;

this.messages.message = function(){
	this.process = function(data){
	
		if(!game.networkGame){
			//we are connected to a game now our first message
			game.networkGame = data.game;
		}

		
	}
}
this.messages.message.prototype = this.messages.gameCommand;




//this should be apassable imitation of tank so it can be passed correctly.
this.messages.aim = function(aim, power){
	this.aim = aim ||0;
	this.power = power || 0;
	this.player = game.localPlayer.name;
	this.game = game.networkGame;
	this.type="aim";
	this.process = function(data){
	
		for(var i = 0; i < game.level.tanks.length;i++){
			if(data.player === game.level.tanks[i].player){
				if(game.level.tanks[i].aim != data.aim){
					game.level.tanks[i].aim = data.aim;
					game.sound.instance.startTone(Math.abs(diesel.degrees(data.aim) )+360,200);
				}
				if(game.level.tanks[i].power != data.power){
					game.level.tanks[i].power = data.power;
					game.sound.instance.startTone(data.power/4 +100,200);
				}
				
				break;
			}
		}
	}
}
this.messages.aim.prototype = this.messages.gameCommand;





this.messages.buy = function(buy){
	this.game = game.networkGame;
	this.player = game.localPlayer.name;
	this.type="buy";
	this.process = function(data){
	
		for(var i = 0; i < game.players.length; i++){
			if(game.players[i].name == data){

				var cost = game.weapons[msg.buy].cost;
				if(game.players[i].cash >= cost){

					console.log(data + " bought " + msg.buy);

					//deduct the $$$
					game.players[i].cash -= cost;

					//add an item to our request
					if(!game.players[i].weapons[msg.buy]){
						game.players[i].weapons[msg.buy] =1;
					}
					else{
						game.players[i].weapons[msg.buy]++;
					}
					//TODO Send Success/Fail Message on buy
					break;
				}

			}
		}
	}
}
this.messages.buy.prototype = this.messages.gameCommand;

//this should be a passible imitation of the bullet code so it can be passed correctly
this.messages.explosion = function(x,y, weapon, data){
	this.x = x||0;
	this.y = y||0;
	this.weapon = weapon || "babyMissile";
	this.data = data|| [];
	this.game = game.networkGame;
	this.type="explosion";
	this.process = function(data){
		if(!game.isServer){
			diesel.raiseEvent("explosion", data);
		}
	}
	
}


this.messages.explosion.prototype = this.messages.gameCommand;		

//this should be  a passible imitation of tank so it can be passed correctly.
this.messages.fire = function(aim, power, weapon, data ){
	this.aim = aim ||0;
	this.power = power || 0;
	this.player = game.localPlayer.name;
	this.game = game.networkGame;
	this.weapon = weapon|| "babyMissile";
	this.data = data;
	this.type="fire";
	this.process = function(data){
	
		if(data.player === game.level.tanks[game.level.activePlayer].player
				//&& game.level.effects.length === 0
				&& game.level.tanks[game.level.activePlayer].isActive
				&& game.level.tanks[game.level.activePlayer].safetyOff
				){
			
				var aim = diesel.clamp(data.aim, game.directions.left, game.directions.right),
				power = diesel.clamp(data.power, 0,game.level.tanks[game.level.activePlayer].maxPower); 


				
				game.level.tanks[game.level.activePlayer].aim = aim;
				game.level.tanks[game.level.activePlayer].power = power;
				game.level.tanks[game.level.activePlayer].weapon = data.weapon|| "babyMissile";
			
				game.level.tanks[game.level.activePlayer].fire();

				game.sound.instance.startTone(game.level.tanks[game.level.activePlayer].power/game.level.tanks[game.level.activePlayer].aim,50);
			}
			else{
				console.log("invalid fire command from ", data.player, data);
			}
	}
}
this.messages.fire.prototype = this.messages.gameCommand;	



		

this.messages.nextLevel = function(level){
	this.level =level;
	this.game = game.networkGame;
	this.type="nextLevel";
	this.process = function(data){
		if(!game.isServer){
			if(!game.level){
				game.level = new game.objects.level();
			}
			game.level.updateFromNet(data.level);
						
			diesel.raiseEvent("screenChange", game.activeScreen, "inGame", null);
		}
		else{
			console.log("server ignoring level message");
		}
			
	}
}
this.messages.nextLevel.prototype = this.messages.gameCommand;		

	

this.messages.nextTurn = function(){
	this.activePlayer =game.level.activePlayer;
	this.game = game.networkGame;
	this.type="nextTurn";
	this.process = function(data){
		
			game.level.activePlayer = data.activePlayer;
	}
}
this.messages.nextLevel.prototype = this.messages.gameCommand;	


this.messages.endLevel = function(){
	this.level =game.level;
	this.game = game.networkGame;
	this.type="endLevel";
	this.process = function(data){
		if(!game.isServer){
			if(!game.level){
				game.level = new game.objects.level();
			}
			game.level.updateFromNet(data.level);
						
			diesel.raiseEvent("screenChange", game.activeScreen, "buying", null);
		}
		else{
			console.log("server ignoring level message");
		}
			
	}
}
this.messages.endLevel.prototype = this.messages.gameCommand;	
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
		
		var onground= game.level.collides(this.x, this.y+this.h/2+1);
		


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
	
	"adjustAim":function(radians, ticks){
		this.aim += radians * ticks;
		if( this.aim > Math.PI/2*3){
			this.aim = Math.PI/2;
		}
		if(this.aim < Math.PI/2){
			this.aim = Math.PI/2*3;
		}
		this.aim = Math.max(Math.PI/2,Math.min(Math.PI/2*3,this.aim));

		var msg = JSON.stringify(new game.messages.aim(this.aim, this.power));
		game.ws.send(msg)
	},
	"adjustPower":function(units, ticks){
		this.power += units *ticks;
		this.power = Math.round(Math.max(0,Math.min(this.power,this.maxPower)));
		var msg = JSON.stringify(new game.messages.aim(this.aim, this.power));
		game.ws.send(msg)
	},
	
	"nextWeapon":function(){
		var keys = Object.keys(game.weapons);
		var i = keys.indexOf(this.weapon);
		i++;
		i = i%keys.length;
		this.weapon = keys[i];
	}
};


///
//	this.mixin.hoverable
///
this.mixin.hoverable = {
	"hoverActive":false,
	"shouldOverride":true,
	"checkHover":function(){
		if(this.contains(diesel.mouseX,diesel.mouseY)){
			this.hoverActive = true;
		}
		else{
			this.hoverActive =false;
		}
	}
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


this.objects.htmlInterface =function(){
	this.element;

	this.show=function(){
		this.element.setAttribute("class", "shown");
		this.htmlviewshowing =true;
	}

	this.hide=function(){
		this.element.setAttribute("class", "hidden");
		this.htmlviewshowing = false;
	}

	this.escapeText = function(text){
		var tmp =document.createElement("div");
			tmp.appendChild(document.createTextNode(text));
			return(tmp.innerHTML);
	}
}//chat.js
this.objects.chat = function(){
	this.messages=[];
	this.chatLength = 100;
	this.htmlviewshowing =false;
	
	this.element = null;
	this.init =function(){
		this.element = document.getElementById("chat");
	}
	//this supports multipl messages per call
	this.addMessage=function(message){
		for(var i =0; i < arguments.length;i++){
			var msg = this.escapeText(arguments[i].toString());

			//TODO BETTER FORMATTING for chat messages

			this.messages.push(msg);
		}

		console.log.apply(console,arguments);

		var trimcount = this.messages.length- this.chatLength;
		if(trimcount>0){
			this.messages.splice(0,trimcount);
		}


		if(this.htmlviewshowing){
			this.setHtml();
		}
	}
	this.sendMessage=function(message){

	};
	this.show=function(){
		this.element.setAttribute("class", "shown");
		this.htmlviewshowing =true;
	},

	this.hide=function(){
		this.element.setAttribute("class", "hidden");
		this.htmlviewshowing = false;
	}
	this.draw= function(context,x,y,w,h){
		
	}

	this.setHtml= function(){
		var html = "";
		for(var i =0 ;i < this.messages.length;i++){
			html = '<p class="chatmessage">'+this.messages[i]+"</p>";
		}
		this.element.innerHTML = html;
	}

	this.init();

};
this.objects.chat.prototype = new this.objects.htmlInterface();

//form.js

this.objects.form= function(){

	this.element = document.getElementById("form");
	this.fields = {};

	this.init=function(){};

	this.getFormData = function(){

	}
	this.setupForm = function(json){
		var fields = {}
		for(var key in json){
			if(typeof(json[key]) =="number"||
				typeof(json[key]) == "string" ||
				typeof(json[key]) == "boolean"
				){
				fields[key] = json[key];
			}
			else{
				console.log(key ,
					"invalid data type for form creation",  
					typeof(key));
			}
		}

		this.fields = fields;

	}
};
this.objects.form.prototype = new this.objects.htmlInterface();


///
//	this.objects.level
///

this.objects.level = function(players){

	this.w = game.width;
	this.h = game.height;
	this.x = 0;
	this.y = 0;
	this.backgroundColor = "#000000";
	this.foregroundColor = "#99aa77";


	this.tanks = [];
	this.effects = [];
	this.terrain =[];
	this.terrainScale =4;


	this.activePlayer = 0;
	this.ended= false;
	this.stats = {};

	this.pixelCache =null;
	this.players= players||[];
	this.numTanks = this.players.length;

	this.scaleX = game.width/this.w;
	this.scaleY = game.height/this.h;


	

	this.resize =function(){
		game.context.terrain.save();
		game.context.terrain.scale(this.scaleX, this.scaleY);
		var terrainPic = game.context.terrain.getImageData(0,0,this.w,this.h);
		game.context.terrain.restore();


		this.scaleX = game.width/this.w;
		this.scaleY = game.height/this.h;


		
		game.context.terrain.save();
		game.context.terrain.scale(this.scaleX, this.scaleY);
		//this image is not scaled?
		game.context.terrain.putImageData(terrainPic, 0,0, 0,0,this.w, this.h);
		game.context.terrain.restore();
	}
	this.updateFromNet= function(data){
		console.log("update from Net", data);
		this.backgroundColor = data.backgroundColor;
		this.foregroundColor = data.foregroundColor;
		this.terrain = data.terrain;
		this.terrainScale = data.terrainScale;
		this.activePlayer = data.activePlayer;
		this.stats = data.stats;


		this.tanks = [];

		//creatw tanks and users from scratch
		for(var i = 0 ; i <  data.tanks.length; i++){
			var t = new game.objects.tank(data.tanks[i].x,
				data.tanks[i].y,{name:data.tanks[i].player,
				 color:data.tanks[i].color});
			console.log(t);
			this.tanks.push(t);
		}


		this.numTanks = data.tanks.length;

		console.log(this);
		this.scaleX = game.width/data.w;
		this.scaleY = game.height/data.h;

		this.w = data.w;
		this.h = data.h;

	

		this.drawTerrain(game.context.terrain);

	}

	this.init= function(){
		console.log("creating level");
		this.generateTerrain();
		game.level =this;

		this.numTanks = this.players.length;
		
		this.drawTerrain(game.context.terrain);
	
		//insert the tanks into the world
		this.placeTanks();
		
		this.activePlayer = (game.round % (game.players.length ))||0;
		game.round++;

		//clear the effect context.
		game.context.effects.clearRect(0,0, game.width-1, game.height);
	};
		
	this.generateTerrain = function(){
		
		while(this.terrain.length < 6  && this.terrain.length < this.w/50|| Math.random() < .75){
			this.terrain.push(Math.round(Math.random() * this.h/2 + this.h/2));
			this.terrain.push(Math.round(Math.random() * this.h/2 + this.h/2));
			this.terrain.push(Math.round(Math.random() * this.h/2 + this.h/2));
		}
		this.terrainScale = this.w/(this.terrain.length -1);

	
	};



	this.placeTanks = function(){
	
		var step = Math.floor(game.width / (this.players.length+1)); 
	
		for(var i = 0; i < this.players.length; i++){

			var x = diesel.clamp(Math.round(step * (i +1 ) + (step *.5) * (Math.random()-.5)),
				step/2, game.width-step/2);
	
			var t = new game.objects.tank(x, 16, this.players[i]);
			console.log(t, t.toJSON())
			this.tanks.push(t);
	
		}
		
		//reorder so that differnet tanks shoot in order each time.
		this.tanks = diesel.shuffle(this.tanks);
		
		
		for(var i = 0; i < this.tanks.length; i++){
			//calculate teh aproximate local maxima
			var index= Math.round(this.tanks[i].x/ this.terrainScale)

			var mx = Math.round(Math.min(Math.min(this.terrain[index], this.terrain[index+1]),
				this.terrain[Math.max(index-1,0)]));

			this.tanks[i].y = mx;

			while(this.tanks[i].canFall()){
				this.tanks[i].applyGravity(.1);
			}

		}

	};
	
	this.collides =function(x,y){
		x = Math.round(x);
		y = Math.round(y);

		if(x <0 ||y<0||x>this.width){
			return false;
		}
		if(y >=this.height){
			return true;
		}
		var hit =false;
		

		var index= Math.round(x/ this.terrainScale)

		var talt = Math.round(Math.min(Math.min(this.terrain[index], this.terrain[index+1]),
				this.terrain[Math.max(index-1,0)]));


		if(y>=talt){
			game.context.terrain.save()
			game.context.terrain.scale(this.scaleX, this.scaleY);
			var pixel = game.context.terrain.getImageData(x,y,1,1).data;
			game.context.terrain.restore();
			var pixelColor = "#"+ pixel[0].toString(16)+
					pixel[1].toString(16)+
					pixel[2].toString(16);

			hit = (this.foregroundColor === pixelColor);
		}
		return hit;
	};

	this.drawTerrain = function(terrain){
		terrain.clearRect(0,0,this.w -1, this.h-1);
		
		
		terrain.save();
			terrain.scale(this.scaleX, this.scaleY);
			terrain.fillStyle=this.backgroundColor;
			terrain.fillRect(0,0,this.w,this.h);
			terrain.fillStyle= this.foregroundColor;
			terrain.beginPath();
			terrain.moveTo(0,this.terrain[0]);
			for(var x = 1; x <this.terrain.length; x+=2){
				//terrain.lineTo(x *this.terrainScale, this.terrain[x]);
				terrain.quadraticCurveTo((x)*this.terrainScale, this.terrain[x], 
					(x+1)* this.terrainScale, this.terrain[x+1]);
			}
			terrain.lineTo(this.w -1, this.h-1);
			terrain.lineTo(0, this.h-1);
			terrain.closePath();
			terrain.fill();

			
		terrain.restore();
		
	}
	this.draw = function(context){
		
		for(var ctx in game.context){
			game.context[ctx].save();
			game.context[ctx].scale(this.scaleX, this.scaleY);
		}

		context.clearRect(0,0,this.w-1, this.h-1);
		
		
		for(var i =0; i < this.tanks.length;i++){
			this.tanks[i].draw(context);//draw the visible tank
			this.tanks[i].draw(game.context.terrain,0,1); //clear terrain behind it.
			//whose turn is it?
			if(i == this.activePlayer){
				context.textAlign="center";
				context.fillText("^"+this.tanks[i].player+"^" ,this.tanks[i].x , this.tanks[i].y + game.fontSize *1.2);
				context.textAlign ="left";
			}
		}

		for(var  i = 0 ; i < this.effects.length; i++){
			this.effects[i].draw(game.context.effects, context);
		}

		for(var ctx in game.context){
			game.context[ctx].restore();
			
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
		if(game.isServer){
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
					this.winner= this.tanks[next].player;
				}
				else{
					this.draw = "Laaaaame!";
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
				console.log("log next trune");

				//TODO play a sound on player change

				//next turn show all clients the world as we know it.
				
					var msg = new game.messages.nextTurn();
					game.ws.send(JSON.stringify(msg));
				}
		}


	};


	this.toJSON=function(){
		
		return {
			foregroundColor : this.foregroundColor,
			backgroundColor : this.backgroundColor,
			tanks:this.tanks,
			terrain: this.terrain,
			terrainScale: this.terrainScale,
			activePlayer:this.activePlayer||0,
			w:game.width,
			h:game.height,
			stats:this.stats
		};

	};
	this.addHits = function(playername, hits){
		hits = hits||0;
		if(!this.stats[playername]){
			this.addToStats(playername);
		};

		this.stats[playername].hits +=hits;

	}
	this.addShot = function(playername, shots){
		shots = shots ||1;
		if(!this.stats["playername"]){
			this.addToStats(playername);
		}
		this.stats[playername].shots += shots;
	}
	this.addDamage = function(playername, damage){
		damage = damage ||0;
		if(!this.stats["playername"]){
			this.addToStats(playername);
		}
		this.stats[playername].damage += damage;	
	}
	this.addToStats=function(player){
		this.stats[player] = {
			"shots":0,
			"hits":0,
			"damage":0
		};

	}

	this.init();

};

this.objects.level.prototype = new this.objects.base();
///
//	this.objects.player
///

this.objects.player = function(name, color){
	this.name= name|| "fred" + Math.random()*1000;
	this.color = color||"#"+Math.floor(Math.random()*0x999 + 0x666).toString(16);
	
	this.cash =100;
	this.alive=true;
	this.isAI = false;
	this.tank = null;
	this.ready =false;
	
	this.weapons = {};
	this.activeWeapon = null;

	this.init= function(){
		var most=0,wname="none";
		for(var wep in game.weapons){
			this.weapons[wep] = game.weapons[wep].start;
			if(this.weapons[wep]> most){
				most = this.weapons[wep];
				wname = wep;
			}

			this.activeWeapon = wname;
		}
	}

	this.toJSON =function(){
		return{
			"name":this.name,
			"color":this.color,
			"cash": this.cash,
			"weapons":this.weapons
			

		};
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

}
///
//	this.objects.tank
///

this.objects.tank = function(x,y,player){
	this.x = x ||0;
	this.y = y||0;
	this.z = 0;
	this.w=32;
	this.h=16
	this.d=32;
	this.aim = Math.PI;
	this.power = 200;
	this.maxPower =1000;
	this.isPlayer = true;
	this.isActive = false;
	this.safetyOff = false;
	this.weapon = "babyMissile";
	this.shotsTaken = 0;
	this.hits =0;
	this.player = null;


	this.init = function(player){
		this.maxHealth =100;
		this.health =this.maxHealth;
		
		// diesel.addMixin(this, game.mixin.hoverable);
		diesel.mixin.addMixin(this, game.mixin.damageable);
		if(game.isServer){
			diesel.mixin.addMixin(this, game.mixin.gravity);
		}
		if(player.name == game.localPlayer.name){
			diesel.mixin.addMixin(this,  game.mixin.controlable);
		}
		//this.weapon = player.activeWeapon;
		
	


		if(player){
			this.player = player.name|| null;
			this.color = player.color;

			//diesel.mixin.addMixin(this, player,true);	
		}
	}


	//functions
	this.fire=function(data){
		this.isActive = false;
		this.safetyOff = false;
		game.level.addShot(this.player,1);
		diesel.raiseEvent("fire", this ,data);
		this.shotsTaken++;
		
	};
	
	this.canMove =function(ticks, direction, pulse){
		
	}

	this.draw =function(context, useorigin, world){
		if(world){
			context.fillStyle = game.level.backgroundColor;
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
			context.fillRect(this.w/16*-5,this.h/-3,this.w/8,this.h/4);
			context.fillRect(this.w/16*-1,this.h/-3,this.w/8,this.h/4);
			context.fillRect(this.w/16 *3,this.h/-3,this.w/8,this.h/4);

			
			
		context.restore();
	};

	this.update = function(ticks){
		
		if(this.isServer){
			this.applyGravity(ticks);
		}
		if(this.isActive){
			if(this.isDead()){
				this.isActive =false;
			}
			else{
				if(game.level.effects.length == 0){
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

this.objects.tank.prototype = new diesel.proto.objectBase()

///
//	tread.screens
///

if(!this.screens){
	this.screens = {};
}
///
//	tread.screens.attract
///
/*
shown by the server durring connection.
*/
this.screens.attract  = function(){
	

	this.clickZones=[
		{	///JOIN GAME
			text: "Join Game",
			x:32,
			y:32,
			w:240,
			h:64,
			click:function(e){
				var gameid = prompt("Enter game code /Id");
				if(gameid){
					game.ws.send(new game.messages.joinGame(gameid));
					diesel.raiseEvent("screenChange", "attract", "setup");
				}
		}},
		{text: "Start Game",
			x:304,
			y:32,
			w:240,
			h:64,
			click:function(e){
				var gamename = prompt("What should your game be called?", game.localPlayer.name+"'s Game")||"Unknown Game";
				game.ws.send(new game.messages.createGame(gamename));
				diesel.raiseEvent("screenChange", "attract", "setup");

		}},
		{text: "Setup Player",
			x:304,
			y:96,
			w:240,
			h:64,
			click:function(e){
				var name = prompt("What shall we call you?", game.localPlayer.name) || game.name;
				if(name){
					game.localPlayer.name = name;
					diesel.events.save("player",game.localPlayer);
				}
		}},
		{text: "Refresh",
			x:32,
			y:96,
			w:240,
			h:64,
			click:function(e){
				if(game.ws.readyState === 1){
					game.ws.send(new game.messages.listGames());
				}		
			}
		},
		{
			x:0,
			y:192,
			w:window.innerWidth,
			h:window.innerHeight - 192,
			click: function(e){
				var y =Math.floor((diesel.mouseY -this.y) /64);

				console.log(y);
				var key = Object.keys(game.networkGames);
				if(key.length >= y  && key[y]){
						game.ws.send(new game.messages.joinGame(key[y]));
						diesel.raiseEvent("screenChange", "attract", "setup");
				}

			}
		}
	];

	this.reset = function(){
		
		if(game.ws.readyState === 1){
			game.ws.send(new game.messages.listGames());
		}

	}

	this.draw= function(){
		//TODO ADD list refresh + click to join to attract screen

		var main = game.context.main;
		main.fillStyle ="#000";
		main.fillRect(0,0,game.width,game.height);

		main.fillStyle="#fff";
		main.strokeStyle="#fff";
		
		for(var i = 0 ;i < this.clickZones.length ; i ++){
			main.strokeRect(this.clickZones[i].x,this.clickZones[i].y
					,this.clickZones[i].w,this.clickZones[i].h);
			if(this.clickZones[i].text){
				main.fillText(this.clickZones[i].text,this.clickZones[i].x,this.clickZones[i].y + 
						this.clickZones[i].h*0.75)
			}
		}


		//draw teh network games?
		main.save();
		main.translate(32, 128);
		
		
		main.fillText("Id Name" , 0,64);
		main.translate(0, 32);

		
		for(var g  in game.networkGames){
			main.translate(0,64);
			
			main.fillText(game.networkGames[g].id +"|"+ game.networkGames[g].name,0,0);
		}
		main.restore();

	}	

	

	
		
	
	



};

this.screens.attract.prototype =  new diesel.proto.screen()
this.screens.attract = new this.screens.attract();

this.screens.endGame = function(){
	this.reset = function(){

	}

	this.draw = function(){
		game.context.effects.clearRect( 0,0, game.width, game.height);
		game.context.effects.fillStyle= "rgba(0, 0, 0, .75)";
		game.context.effects.fillRect( 0,0, game.width, game.height);

		game.context.effects.fillStyle= "#fff";
		
		game.context.effects.fillText( "Thanks for playing, GGs", 50, 75);
		
	}
}
this.screens.endGame.prototype =  new diesel.proto.screen()
this.screens.endGame = new this.screens.endGame();

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
		game.connections.webSocket.processMessageQueue();
		
		this.timer -= ticks;

		if(this.timer <= 0){//} &&game.cast &&game.cast.readyState ==4){
			location.reload();
		}
		// else{
		// 	window.reload();

		// 	//diesel.raiseEvent("screenChange", game.activeScreen, "setup");
		// }
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

		//Check to see if therer is only one non server user left
		if (game.players.length <=2){
			diesel.raiseEvent("screenChange", "buying", "endRound");
		}

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
		for(var player in game.level.stats){
			game.context.effects.fillText(player +" : Shots: "+ game.level.stats[player].shots+
				" Hits: "+ game.level.stats[player].hits+
				" Damage: "+ Math.round(game.level.stats[player].damage),
			 50, 100+25*i);
			i++;
		}

		
		//show the timer
		game.context.effects.fillStyle= "#fff";
		game.context.effects.fillText( Math.ceil(this.timer) + " seconds to the next round", 50, 50);
		game.context.effects.fillText( "You can buy stuff now. Cool, right?", 50, 75);


	}	

	this.update =function(ticks){
		game.connections.webSocket.processMessageQueue();
		
		if(game.isServer){
			this.timer -= ticks;

			if(this.timer <=0){
				diesel.raiseEvent("screenChange", "buying","inGame");
			}
		}
	}
	



};

this.screens.buying.prototype =  new diesel.proto.screen()
this.screens.buying = new this.screens.buying();
///
//	game.screens.inGame
///

this.screens.inGame = function(){
	// the screen that player see while in game
	this.controlsH = game.fontsize *4;
	this.controlsY = -1 * this.controlsH;
	
	this.reset = function(from, to){
	
		if(game.isServer){
			game.level = new game.objects.level(game.players);
			this.round ++;
			this.time = 0;
			game.level.drawTerrain(game.context.terrain);


			var msg = JSON.stringify(new game.messages.nextLevel(game.level));

			game.ws.send(msg);
		}
		game.context.effects.clearRect(0,0,game.width, game.height);

	};

	this.draw= function(){
		//show the slots and players

		game.level.draw(game.context.main);
		game.context.main.fillStyle="#fff";
		game.context.main.fillText("#"+ game.networkGame, game.width-100, 25);
		
		//game.player.draw();

		
		//get the players tank and draw controls if it exists.
		for(var i = 0 ; i < game.level.tanks.length;i++){
			if(game.level.tanks[i].player == game.localPlayer.name){
				this.drawControls(game.context.main, game.level.tanks[i],0, this.controlsY)
			}
		}
		
		
	};
	this.update =function(ticks){
		game.connections.webSocket.processMessageQueue();

		game.level.update(ticks);
		
		if(!game.localPlayer.spectate && game.localPlayer.alive){
			if(this.controlsY < this.controlsH){
				this.controlsY += this.controlsH/10;
			}
		}
		else{
			if(this.controlsY > this.controlsH *-1){
				this.controlsY -= this.controlsH/10;
			}
		}

		var tank =null;
		for(var i = 0 ; i < game.level.tanks.length;i++){
			if(game.level.tanks[i].player == game.localPlayer.name){
				tank =  game.level.tanks[i];
			}
		}
		


		//Handle key presses for your tanks
		if( tank && tank.adjustAim&& game.keysDown){
			//wepaons change
			if(game.keysDown.backslash || game.keysDown.tab){
				tank.nextWeapon();
			}
			var aimDelta = .5;
			//aim
			if(game.keysDown.left){
				tank.adjustAim(aimDelta , ticks);
			}

			if(game.keysDown.right){
				tank.adjustAim(0-aimDelta, ticks)
			}


			//fire
			if(game.keysDown.space || game.keysDown.enter){
				tank.fire();
			}
			else{

			}
			var powerDelta = 200;
			//power
			if(game.keysDown.up){
				tank.adjustPower(powerDelta, ticks)

			}
			if(game.keysDown.down){
				tank.adjustPower(0-powerDelta, ticks);
			}
		}

	
	}

	this.drawControls=  function(context, tank,x ,y){
		this.controlsH = game.fontSize *5;
		if(!tank){
			return;
		}
		context.save();
		//draw the tank
		//tank.draw(context,0,0,true);

		context.translate(0,this.controlsY);
		context.strokeStyle= "#0f0";
		context.strokeRect(0,0,game.level.w,this.controlsH);
		//draw INFO
		context.fillText("POW:"+ tank.power,  32 , game.fontSize * 4);
		context.fillText("AIM:"+ Math.round(diesel.degrees(tank.aim)), 256 , game.fontSize *4);
		context.fillText("HTH:"+ Math.round(tank.health), 512 , game.fontSize * 4);

		context.strokeStyle= "#0f0";
		//draw buttons to press
		//Draw weapons	
		
		for(var wep in game.localPlayer.weapons){
		
			context.fillText(wep.substr(0,4), 0,game.fontSize);
			// TODO draw ICON in controls

			//Count
			context.fillText(game.localPlayer.weapons[wep], 0, game.fontSize *2.5);

			// SELECTION
			if(wep === tank.weapon){
				context.strokeRect(0,0, game.fontSize *4, game.fontSize *3);
			}

			context.translate(game.fontSize *4 ,0);


		}


		context.restore();

		}


}
this.screens.inGame.prototype = new diesel.proto.screen();
this.screens.inGame = new this.screens.inGame();

///
//	tread.screens.server
///

//the server code.


this.screens.server = function(){
	this.time = 0;
	this.round = 0;
	this.match = null 
	

	this.reset = function(from, to){
		game.level = new game.objects.level(game.players);
		this.round ++;
		this.time = 0;
		game.level.drawTerrain(game.context.terrain);


		var msg = JSON.stringify(new game.messages.nextLevel(game.level));
		

		
		game.ws.send(msg);

		console.log("on level screen");

	};

	this.draw= function(){

		game.level.draw(game.context.main);
		game.context.main.fillStyle="#fff";
		game.context.main.fillText("#"+ game.networkGame, game.width-100, 25);
		game.context.main.fillText(game.round+"/"+ game.maxRounds, game.width-75, 50);
		
	};

	this.update =function(ticks){

		game.connections.webSocket.processMessageQueue();

		game.level.update(ticks);
		game.screens.server.time += ticks;
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
	this.countdownTime = 5;
	this.CountDownRemaining = 0;
	this.allReady = false;
	this.addressOfClient = "lbrunjes.github.io/games/tanks";

	this.clickZones=[
	{x:20,y:240,w:640,h:320,
		click:function(e){
			//the users box.
	}},
	{x:20,y:600,w:640,h:240,
		click:function(e){
			//Theseetings box
			if(game.isServer){
				diesel.raiseEvent("screenChange","setup","inGame", null);
			}
		
	}},
	];
	this.reset = function(){
	
	}

	this.open =function(){
	}
	this.close = function(){

	}	
	


	this.draw= function(){
		var main = game.context.main;

		main.fillStyle= "#000";
		main.fillRect(0,0, game.width, game.height);

		main.fillStyle= "#fff";

		//Header
		main.fillText("Diesel TANKS!!!", 25,25);
		
		
		if(game.debug){
			main.fillText("web Socket...", 25,50);
			if(game.ws.readyState ===1 ){
				main.fillStyle= "#0f0";
			}
			else{
				main.fillStyle= "#f00";
			}
			main.fillText(game.connections.webSocket.states[game.ws.readyState] || "?!", 300,50);
		}
	
		main.fillStyle= "#fff";
		if(game.networkGame){
			
			main.fillText("Go here to play: "+this.addressOfClient, 25, 100);		
			main.fillText("Game Code:"+ game.networkGame, 25, 140);
		}
		else{
			main.fillText("not conntected", 25, 100);		
		}
		

		//show connected players with color
		this.drawPlayers(main, 20,240,640,320);

		//drawSettings

		this.drawSetings (main, 20, 600,640,240);
	};
	this.drawSetings = function(context,x,y,w,h){
		context.save();
		context.translate(x,y);
		context.fillStyle ="#000";
		context.fillRect(0,0,w,h);
		context.strokeStyle = "#fff";
		context.strokeRect(0,0,w,h);
		context.fillStyle ="#fff";
		context.fillText("Settings" ,
			game.fontSize,game.fontSize);
		

		if(!game.isServer){
			context.fillText("Rounds:"+ game.maxRounds||"?", game.fontSize,game.fontSize*3);
			context.fillText("Weapons:"+ game.maxRounds||"?", game.fontSize,game.fontSize*4);
		}
		else{
			context.fillStyle = "#fff";
			context.fillText("start", w/4, h/4);
		}
		context.restore();
	}

	this.drawPlayers = function(context,x,y,w,h){
		context.save();
		context.translate(x,y);
		context.fillStyle ="#000";
		context.fillRect(0,0,w,h);
		context.strokeStyle = "#fff";
		context.strokeRect(0,0,w,h);

		context.fillStyle ="#fff";
		context.fillText("Connected Players ("+game.players.length+"/"+game.maxPlayers+")" ,
			game.fontSize,game.fontSize);
		context.save();
		context.translate(game.fontSize, game.fontSize*3);
		for(var i = 0 ; i<game.players.length;i++){
			context.fillStyle ="#fff";
		
			context.fillText(game.players[i].name, 25,  25*i);			
			context.fillStyle = game.players[i].color || "#fff";
			context.fillRect( 0, 25*i -25, 25,25);	
			
		}
		context.restore();
		context.restore();
	}

	this.draw

	this.update= function(ticks){

		game.connections.webSocket.processMessageQueue();
		
		

	};

	this.handleError =function(error){

		switch(error.message){
			case "Already in the game, change your name?":
				diesel.raiseEvent("screenChange", "setup","attract");
			break
			default:
			break;
		}

	}


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
//	game.weapons
///

this.weapons = {

	babyMissile:{
		start:99,
		radius:40,
		cost:0,
		name:"Baby Missile"
	},
	missile:{
		start:5,
		radius:50,
		cost:50,
		name:"Missile"
	},
	bigMissile:{
		start:1,
		radius:70,
		cost:100,
		name:"Big Missile"
	},
	nuke:{
		start:1,
		radius:500,
		cost:500,
		name:"Nuke"	
	},
	funkyBomb:{
		start:5,
		radius:45,
		cost:100,
		name:"Funky Bomb"
	}

};


///
//	index.js
///
this.effects.bullets  ={};



/// custom funky bomb bullet
this.effects.bullets.funkyBomb = function(tank, data){
	
	this.x = 0;
	this.y = 0;
	this.w = 3;
	this.h = 3;
	this.color = "#fff";
	this.angle = Math.PI;
	this.power = 200;
	this.isActive =true;
	this.weapon = "missile";
	this.type="bullet";
	this.lastDrew= Math.random()/2;
	this.pctJump = pctFail||1;
	this.data = [];
	


	this.onExplode = function(){


		if(Math.random() < this.pctJump){
			this.pctJump = this.pctJump *.66;
			this.isActive =true;
			this.aim = diesel.directions.up +Math.random() *3 - 1.5;
			this.power=100*Math.random()+5;
			this.downSpeed = 0;
				
								
		}

			
	};



	this.init(tank);


}
this.effects.bullets.funkyBomb.prototype = new this.effects.bullet();

 this.init();
};
game.prototype = new diesel.proto.game();
