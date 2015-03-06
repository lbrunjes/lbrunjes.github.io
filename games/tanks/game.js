//built at Fri 06 Mar 2015 02:38:37 PM EST
/*
	DIESEL TANKS
	a simple tank game in html5 
	Built using diesel.js
	2014 Lee Brunjes - lee.brunjes@gmail.com
 
*/
var TANKS_APP_ID="1DC73FAD";
var TANKS_APP_NS="co.housemark.tanks";




var game = function(messageHost, isServer){
	this.colors = ["#f00", "#00f", "#0f0", "#ff0", "#0ff", "#f0f","#ace", "#fae", "#abf", "#48f"]
	
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
	this.messageHost = messageHost || "ws://housemark.co:9000";
	this.messageQueue=[];
	this.ws = null;
	this.cast = null;
	
	this.players =[];
	this.maxPlayers =10;
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

		this.width = Math.max(window.innerWidth,640);
		this.height = Math.max(window.innerHeight,480);
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
		diesel.raiseEvent("resize");

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

		// if(window.location.hash && game.ws.readyState ==1){
		// 	console.log(window.location.hash);

		// 	game.ws.send(new game.messages.joinGame(gameid));
		// }


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
	this.w = 2;
	this.h = 2;
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
			while(game.level.scaleX < 1/this.w){
				this.w++;
				this.h++;
			}

		}
	
	

		
	};

	this.draw=function(econtext ,context){
		if(diesel.frameCount%2){ //draw every tenth of a second or so.
			this.lastDrew = 0;
			econtext.save();
				econtext.translate(this.x,this.y);
				econtext.rotate(Math.PI/4);
				econtext.fillStyle = this.color;

				econtext.fillRect(this.w/-2, this.h/-2,this.w,this.h);

			econtext.restore();
		}

		context.fillStyle ="#fff";
		context.fillRect(-this.w, -this.h,this.w*2,this.h*2);
	
	
	}
	this.update=function(ticks){
		this.t +=ticks;
		this.lastDrew+=ticks;
		if(this.isActive){
			



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
					 _y > game.level.h){

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
						_x > game.level.w
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
			this.radiusNow -= this.speedModifier;
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
	this.speed= 0;
	this.angle = 0;
	this.scale = 1;
	this.scalePerTick = 0;
	this.r = 0;

	this.init = function(){

	
	}

	this.draw = function(eContext, context){
		context.save();
			if(this.fontInfo){
				context.font = this.fontInfo;
			}
			context.fillStyle=this.color;
			context.textAlign = this.align;
			context.save();
			context.translate(this.x, this.y);
			context.rotate(this.r);
			context.scale(this.scale,this.scale);
			context.fillText(this.message, 0,0);
			context.restore();

		context.restore();

	};
	this.update =function(ticks){
		this.ttl -=ticks;
		this.scale+= this.scalePerTick;
		if(this.speed){
			this.move(ticks, this.angle,this.speed );
		}
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
	var choices = ["Bang!","Pow!","Boom!", "Crunch!", "Paff!","pop!","Explode.", "!!!!","Kapow.", "BLAM", "Kablooie"];
	var text = new game.effects.text( choices[Math.floor(Math.random() * choices.length)],
		bullet.x, bullet.y, "#fff");
	text.scalePerTick = 0.2;
	text.align = "center";
	text.ttl = explosion.radius/explosion.speedModifier *2 /diesel.fps() +0.2;
	text.r  = Math.random()-.5;
	game.level.effects.push(text);
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
//	game.events.mousemove
///
//used to allow swiping

this.events.mousemove=function(e){
	if( game.screens[game.activeScreen].mousemove){
		game.screens[game.activeScreen].mousemove(e);
	}
};

this.events.mousedown=function(e){
	game.mouseDown =true
	if( game.screens[game.activeScreen].mousedown){
		game.screens[game.activeScreen].mousedown(e);
	}
};

this.events.mouseup=function(e){
	game.mouseDown =false
	if( game.screens[game.activeScreen].mouseup){
		game.screens[game.activeScreen].mouseup(e);
	}
};
///
//	game.events.touch
///
if(!game.touches){
	game.touches =[];
}

this.events.touchstart=function(e){
	
	for(var i = 0; i < e.changedTouches.length;i++ ){
		var coords = diesel.util.getLocalCoords(e.changedTouches[i].pageX, e.changedTouches[i].pageY);
		game.touches.push({ identifier: e.changedTouches[i].identifier, 
			x: coords.x,
			y: coords.y });
	}
	if( game.screens[game.activeScreen].touchstart){
		game.screens[game.activeScreen].touchstart(e);
		e.preventDefault();
	}
	
};

this.events.touchend=function(e){

	for(var i = 0; i < e.changedTouches.length;i++ ){
		for (var j =0; j <game.touches.length;j++){	
			if(e.changedTouches[i].identifier == game.touches[j].identifier){
				game.touches.splice(j,i);
				return;
			}
		}
	}
	if( game.screens[game.activeScreen].touchend){
		game.screens[game.activeScreen].touchend(e);
		e.preventDefault();
	}

	

};

this.events.touchmove=function(e){

	for(var i = 0; i < e.changedTouches.length;i++ ){
		var coords = diesel.util.getLocalCoords(e.changedTouches[i].pageX,
		 e.changedTouches[i].pageY);
	}

	if( game.screens[game.activeScreen].touchmove){
		game.screens[game.activeScreen].touchmove(e);
		e.preventDefault();
	}

};

// game.events.touchleave=function(e){
// 	game.events.touchend(e);
// };
this.events.windowresize =function(){
		if(game){
			game.width = Math.max(window.innerWidth,640);
			game.height = Math.max(window.innerHeight,480);

			game.fontSize = Math.max( game.height/40, 16);

			for( var ctx in game.context){
				
				// game.context[ctx].width =game.width;
				// game.context[ctx].height =game.height
			
				// var el = document.getElementById(ctx);
				// if(el){
				// 	el.width =game.width;
				// 	el.height =game.height
				// }

				game.context[ctx].font = game.fontSize+"px "+game.font;
				

			}
			
			if(game.level){
				game.level.resize();
			}
		}
	}
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
		
		if(data.createdGame){
			this.networkGame =data.createdGame;
		}
	}
}
this.messages.command_okay.prototype = this.messages.serverCommand;

//all serverside errors
this.messages.error = function(){
	this.process = function(data){
		console.log(data);
		
		game.chat.addMessage({"message":"Error:"+data.message});
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
				game.players[0].color = game.colors[0];
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
			//window.location.hash = data.game;
		}

		while(game.colors.length < game.players.length +1){
			game.colors[i].push("#"+(0x999+Math.random() * 0x666));
		}

		var pl = new game.objects.player(data.message.joined.name,
			 game.colors[game.players.length]);
		
		game.players.push(pl);
		
		

		game.chat.addMessage( {"message":pl.name + " joined the game"});
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
				
				game.chat.addMessage({"message":game.players[i].name + " left the game"});

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

this.messages.chat = function(text){
	this.player = game.localPlayer.name;
	this.type="chat";
	this.message = text||":)";
	this.game = game.networkGame;
	if(this.message.length > 64){
		this.message = this.message.substring(0,64);
	}
	this.process = function(data){
		game.chat.addMessage(data);
	}
	
}


this.messages.chat.prototype = this.messages.gameCommand;		
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
				&& game.localPlayer.name != data.player				
				){
			
				var aim = diesel.clamp(data.aim, game.directions.left, game.directions.right),
				power = diesel.clamp(data.power, 0,game.level.tanks[game.level.activePlayer].maxPower); 


				
				game.level.tanks[game.level.activePlayer].aim = aim;
				game.level.tanks[game.level.activePlayer].power = power;
				game.level.tanks[game.level.activePlayer].weapon = data.weapon|| "babyMissile";
			
				game.level.tanks[game.level.activePlayer].fire();

				game.sound.instance.startTone(game.level.tanks[game.level.activePlayer].power/game.level.tanks[game.level.activePlayer].aim,50);
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
			game.level.tanks[game.level.activePlayer].isActive =true;
			var txt = new game.effects.text(
					"It is now "+game.level.tanks[game.level.activePlayer].player + "'s Turn",
					 game.width/2, 50);
				txt.align = "center";
				game.level.effects.push(txt);
	}
}
this.messages.nextLevel.prototype = this.messages.gameCommand;	

this.messages.endGame = function(){
	this.level =game.level;
	this.game = game.networkGame;
	this.type="endGame";
	this.process = function(data){
		if(!game.isServer){
			if(!game.level){
				game.level = new game.objects.level();
			}
			game.level.updateFromNet(data.level);
						
			diesel.raiseEvent("screenChange", game.activeScreen, "endGame", null);
		}
		else{
			console.log("server ignoring endGame message");
		}
			
	}
}
this.messages.endGame.prototype = this.messages.gameCommand;	
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

		if(typeof(message) == "string"){
			message = {"message":message, player:"system"};
		}

		for(var key in message){
			message[key] = this.escapeText(message[key]);
		}
		if(!message.player){
			message.player = "system";
		}

		this.messages.push(message)

		if(game.debug){
			console.log.apply(console,arguments);
		}
		var trimcount = this.messages.length- this.chatLength;
		if(trimcount>0){
			this.messages.splice(0,trimcount);
		}

		if(message.player && message.message){
			//get teh player 
			var p = null;
			if(game.level){
				for(var i=0; i < game.level.tanks.length;i++){
					if(game.level.tanks[i].player == message.player){
						var text = new game.effects.text(message.message,game.level.tanks[i].x,
							game.level.tanks[i].y+ game.fontSize*2, game.level.tanks[i].color);
						text.align ="center";
						text.angle = game.directions.up;
						text.speed = game.fontSize *1.5;
						text.ttl = Math.min(message.message.length *.5, 5);
						text.scalePerTick = 0.05;
						console.log(text);
						game.level.effects.push(text);
					}

				}
			}

			


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
		context.save();
		context.translate(x, y);

		var line = game.fontSize 
		for (var i =1; i *line < h &&  i < this.messages.length; i ++){
			var m =this.messages[this.messages.length -i];
			if(m.player != "system"){
				context.fillText(m.player+":"+m.message, game.fontSize, i *line);
			}
			else{
			context.fillText(m.message, game.fontSize, i *line);	
			}
		}
		context.restore();
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

		if(this.scaleX < this.scaleY){
			this.scaleY = this.scaleX;
		}
		else{
			this.scaleX = this.scaleY;	
		}


		
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


		this.tanks[this.activePlayer].isActive= true;
		
		this.scaleX = game.width/data.w;
		this.scaleY = game.height/data.h;
		
		if(this.scaleX < this.scaleY){
			this.scaleY = this.scaleX;
		}
		else{
			this.scaleX = this.scaleY;	
		}

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
		if(this.tanks.length> this.activePlayer){
			this.tanks[this.activePlayer].isActive = true;
		}
		game.round++;

		//clear the effect context.
		game.context.effects.clearRect(0,0, game.width-1, game.height);
	};
		
	this.generateTerrain = function(){
		
		while(this.terrain.length < 6 || Math.random() < .5){
			this.terrain.push(Math.round(Math.random() * this.h/2 + this.h/4));
			this.terrain.push(Math.round(Math.random() * this.h/2 + this.h/4));
			this.terrain.push(Math.round(Math.random() * this.h/2 + this.h/4));
		}
		this.terrainScale = this.w/(this.terrain.length -1);

	
	};



	this.placeTanks = function(){
	
		var step = Math.floor(game.width / (this.players.length+1)); 
	
		for(var i = 0; i < this.players.length; i++){

			var x = diesel.clamp(Math.round(step * (i +1 ) + (step *.5) * (Math.random()-.5)),
				step/2, game.width-step/2);
	
			var t = new game.objects.tank(x, 16, this.players[i]);
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
	
	this.collides =function(_x,_y){
		x = Math.round(_x);
		y = Math.round(_y);

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


		if(y>=talt && game.isServer){
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
	
		var fired =false;
		for(var i = 0 ; i < this.tanks.length; i++){

			if(this.activePlayer === i){
				if(this.tanks[i].isDead() || !this.tanks[i].isActive){
					fired =true;
				}
			}
			else{
				this.tanks[i].isActive = false;
				this.tanks[i].safteyOff = false;
			}
			this.tanks[i].update(ticks);

		};
		var bullets =0;
		for(var  i = 0 ; i < this.effects.length; i++){
			this.effects[i].update(ticks);

			//if we are no longer active draw and 
			if(!this.effects[i].isActive){
				this.effects.splice(i,1);
				i--;
			}

			if(this.type =="bullet"){
				bullets++;
			}
		};

		if(fired && bullets ==0){
			this.nextPlayer();
		}
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
					this.winner =null;
				}

				diesel.raiseEvent("endLevel", this.tanks, next);
				
			}
			else{
				//in all other cases we can swap players
				this.activePlayer = next;
				this.tanks[this.activePlayer].isActive =true;

				//add an effect that shows us this for a few seconds.
				var txt = new game.effects.text(
					"It is now "+this.tanks[next].player + "'s Turn",
					 game.width/2, 50);
				txt.align = "center";
				this.effects.push(txt);
			
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
	this.name= name|| "INTERNETGuy #" + Math.floor(Math.random()*1000);
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
		if(this.isActive){
			this.isActive = false;
			this.safetyOff = false;
			game.level.addShot(this.player,1);
			diesel.raiseEvent("fire", this ,data);
			this.shotsTaken++;
		}
		
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
			
			this.maxPower = Math.ceil(this.health *10);

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
				var gamename = prompt("What should your game be called?", game.localPlayer.name+"'s Game");
				if(gamename){

					game.ws.send(new game.messages.createGame(gamename));
					diesel.raiseEvent("screenChange", "attract", "setup");
				}

		}},
		{text: "Setup Player",
			x:304,
			y:96,
			w:240,
			h:64,
			click:function(e){
				var name = prompt("What shall we call you?", game.localPlayer.name) || game.name;
				if(name){
					if(name.length > 16){
						name = name.substring(0,16);
					}
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
				var y =Math.floor((diesel.mouseY -this.y) /(game.fontSize*2));

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
		game.context.effects.clearRect(0,0,game.width, game.height);
	
		if(game.ws.readyState === 1){
			game.ws.send(new game.messages.listGames());
		}

	}

	this.draw= function(){
		
		var main = game.context.main;
		main.fillStyle ="#000";
		main.fillRect(0,0,game.width,game.height);

		main.fillStyle="#fff";
		main.strokeStyle="#fff";
		main.textAlign ="center";
		for(var i = 0 ;i < this.clickZones.length ; i ++){
			main.strokeRect(this.clickZones[i].x,this.clickZones[i].y
					,this.clickZones[i].w,this.clickZones[i].h);
			if(this.clickZones[i].text){
				main.fillText(this.clickZones[i].text,
						this.clickZones[i].x + this.clickZones[i].w/2,
						this.clickZones[i].y + this.clickZones[i].h*0.75)
			}
		}
		main.textAlign = "left";


		//draw teh network games?
		main.save();
		main.translate(game.fontSize, 192);
		
		
		main.fillText("Id Name" , 0, game.fontSize/-2);
		

		
		for(var g  in game.networkGames){
			main.translate(0,game.fontSize*2);
			
			main.fillText(game.networkGames[g].id +"|"+ game.networkGames[g].name,0,0);
		}
		main.restore();

		if(game.ws.readyState != 1){
			main.fillStyle ="#f00";
			main.fillText("Connection issues. Please Reload",game.height/2, game.width/4);
		}

	}	

	

	
		
	
	



};

this.screens.attract.prototype =  new diesel.proto.screen()
this.screens.attract = new this.screens.attract();

this.screens.endGame = function(){

	this.clickZones = [
	{	text:"Leave Game",
		x:32,
		y:128,
		w:256,
		h:64,
		click:function(e){
			var msg= game.messages.part();
			game.ws.send(msg);
			diesel.raiseEvent("screenChange", "endGame","attract");
		}
	},
	{
		text:"Play Next Game",
		x:320,
		y:128,
		w:256,
		h:64,
		click:function(e){
			diesel.raiseEvent("screenChange", "endGame","setup");
		}
	}
	]

	this.reset = function(){

	}

	this.draw = function(){
		game.context.effects.clearRect( 0,0, game.width, game.height);
		game.context.effects.fillStyle= "rgba(0, 0, 0, .75)";
		game.context.effects.fillRect( 0,0, game.width, game.height);

		game.context.effects.fillStyle= "#fff";
		game.context.effects.strokeStyle = "#fff";
		
		game.context.effects.textAlign = "center";
		game.context.effects.fillText( "Thanks for playing, GGs", game.width/2, 256);
		
		for(var i = 0 ;i < this.clickZones.length ; i ++){
			game.context.effects.strokeRect(this.clickZones[i].x,this.clickZones[i].y
					,this.clickZones[i].w,this.clickZones[i].h);
			if(this.clickZones[i].text){
				game.context.effects.fillText(this.clickZones[i].text,
						this.clickZones[i].x + this.clickZones[i].w/2,
						this.clickZones[i].y + this.clickZones[i].h*0.75)
			}
		}
		game.context.effects.textAlign = "left;"
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
	this.controlsH = game.fontSize *2;
	this.controlsY = -1 * this.controlsH;
	this.touchAim = true;
	this.mousemove =function(e){
		if(e.which){
			this.click(e);
		}
	};
	this.touchmove =function(e){
		for(var i = 0; i < e.changedTouches.length;i++ ){
		var coords = diesel.util.getLocalCoords(e.changedTouches[i].pageX,
		 e.changedTouches[i].pageY);
		this.clickZones[1].click(null,coords.x, coords.y);
		}	
	};
	this.clickZones = [
		{
			x: 0,
			y: 0,
			w: window.innerWidth,
			h: 64,
			click: function(){
			
				if(diesel.mouseX > game.width - game.fontSize *4 ){
					var text = prompt("chat");
					if(text){
						var msg = JSON.stringify(new game.messages.chat(text));
						game.ws.send(msg);
					}
				}
			}
		},
		{
			x:0,
			y: window.innerHeight -256,
			w: window.innerWidth,
			h: 256,
			click:function(e , x ,y ){
				var center = game.width/2;
				var tank = null;
				x= x ||diesel.mouseX;
				y= y  ||diesel.mouseY;

				for(var i = 0 ; i < game.level.tanks.length;i++){
					if(game.level.tanks[i].player == game.localPlayer.name){
						tank = game.level.tanks[i];
						break;
					}
				}
				if(y> game.height -64 ){
					//Test for  buttons
					if(x > center -192 &&x < center -64){
						game.screens.inGame.touchAim =true;
					}
					if(x < center + 192 && x > center  + 64){
						game.screens.inGame.touchAim =false;
					}
					if(x < center + 64 && x > center  - 64){
						tank.fire();
					}


				}
				else{
					x =x - center;
					y = y - (game.height -64);
					var dist = Math.sqrt(Math.pow(x,2) +Math.pow(y,2));
					if(dist < 256){
						var angle = Math.atan2(-x,-y) ;
						if(dist>128){
							tank.aim = game.directions.left  + angle+ Math.PI/2;
						}
						else{
							tank.power = Math.round((angle+Math.PI/2)/Math.PI *1000);
						}
					}

				}
			}
		}
	];
	
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
		game.context.main.clearRect(0,0,game.width, game.height);


	};

	this.draw= function(){
		game.context.main.clearRect(0,0,game.width,game.height);


		game.level.draw(game.context.main);
		game.context.main.fillStyle="#fff";
		game.context.main.fillText("#"+ game.networkGame, game.width- game.fontSize *10, 25);
		game.context.main.fillText("CHAT", game.width - game.fontSize *4 , game.fontSize * 1.5);

		//game.player.draw();

		
		//get the players tank and draw controls if it exists.
		for(var i = 0 ; i < game.level.tanks.length;i++){
			if(game.level.tanks[i].player == game.localPlayer.name){
				this.drawControls(game.context.main, game.level.tanks[i],0, this.controlsY);
				this.drawTouchControls(game.context.main, game.level.tanks[i]);
			}
		}
		
		
	};
	this.update =function(ticks){
		game.connections.webSocket.processMessageQueue();

		game.level.update(ticks);

		this.clickZones[1].y=game.height -256;
		this.clickZones[1].w= game.width;

		this.controlsH = game.fontSize *2;
		
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
			// if(game.keysDown.backslash || game.keysDown.tab){
			// 	tank.nextWeapon();
			// }
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
		this.controlsH = game.fontSize *2;
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
		context.fillText("POW:"+ tank.power,  game.fontSize , game.fontSize * 1.5);
		context.fillText("AIM:"+ Math.round(diesel.degrees(tank.aim)-180), game.fontSize *8 , game.fontSize *1.5);
		context.fillText("HTH:"+ Math.round(tank.health), game.fontSize *16 , game.fontSize * 1.5);

		if(game.level.tanks[game.level.activePlayer].player  ==game.localPlayer.name){
			context.fillText("YOUR TURN!!", game.fontSize *22 , game.fontSize * 1.5);			
		}
	
		context.strokeStyle= "#0f0";
		//draw buttons to press
		//Draw weapons	
		
		// for(var wep in game.localPlayer.weapons){
		
		// 	context.fillText(wep.substr(0,4), 0,game.fontSize);
		// 	// TODO draw ICON in controls

		// 	//Count
		// 	context.fillText(game.localPlayer.weapons[wep], 0, game.fontSize *2.5);

		// 	// SELECTION
		// 	if(wep === tank.weapon){
		// 		context.strokeRect(0,0, game.fontSize *4, game.fontSize *3);
		// 	}

		// 	context.translate(game.fontSize *4 ,0);


		// }

		context.restore();

	};
	this.drawTouchControls = function(context ,tank){
		///.Touch controls
		context.save();
		context.translate(game.width/2, game.height - 64);
		context.textAlign = "center";
		//fire button
		
		context.fillStyle = "#fff";
		context.fillText("FIRE",0, game.fontSize*1.5)

		//aim/power buttons
		context.fillStyle = tank.color;
		context.strokeStyle = tank.color;
		if(this.touchAim){
			context.fillRect(-192, 0, 128, 64);	
			context.lineWidth =64;
			context.beginPath();
			context.arc(0,0,160, Math.PI/2 - tank.aim , -Math.PI ,true);
			context.stroke();
			context.strokeStyle = "rgba(255,255,255, 0.5)";
			context.beginPath();
			context.arc(0,0,96,0, Math.PI * (tank.power/-1000),true);
			context.stroke();
		}
		else{
			//power
			context.fillRect(64, 0, 128, 64);	
			context.lineWidth =64;
			context.beginPath();
			context.arc(0,0,96,0, Math.PI * (tank.power/-1000),true);
			context.stroke();
			context.strokeStyle = "rgba(255,255,255, 0.5)";
			context.beginPath();
			context.arc(0,0,160, Math.PI/2 - tank.aim , -Math.PI ,true);
			context.stroke();

		}

		context.lineWidth = 1
		context.strokeStyle = "#fff";
		context.fillStyle = "#fff";
		context.strokeRect(-192, 0, 128, 64);
		context.fillText("AIM",-128, game.fontSize*1.5)

		context.strokeRect(64, 0, 128, 64);
		context.fillText("POWER",128, game.fontSize*1.5)

		context.strokeStyle = "#fff";

		context.beginPath();

		context.arc(0,0,64,0, Math.PI,true);
		context.arc(0,0,128,0, Math.PI,true);
		context.arc(0,0,192,0, Math.PI,true);
		context.stroke();

		tank.draw(context, true, false);

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
	{x:20,y:240,w:640,h:384,
		click:function(e){
			//the users box.
			var text = prompt("chat");
				if(text){
					var msg = JSON.stringify(new game.messages.chat(text));
					game.ws.send(msg);
				}
	}},
	{x:20,y:100,w:640,h:69,
		click:function(e){
			//Theseetings box
			if(game.isServer){
				diesel.raiseEvent("screenChange","setup","inGame", null);
			}
		
	}}
	];
	this.reset = function(){
		game.context.effects.clearRect(0,0,game.width, game.height);

	}

	this.draw= function(){
		var main = game.context.main;

		main.fillStyle= "#000";
		main.fillRect(0,0, game.width, game.height);

		main.fillStyle= "#f00";
		if(game.ws.readyState == 1 ){
			main.fillStyle= "#0f0";
		}
		
		main.fillText("o", game.fontSize, game.fontSize);
		main.fillStyle= "#fff";
		main.fillText(game.connections.webSocket.states[game.ws.readyState], game.fontSize *2, game.fontSize);
	
	
		
		if(game.networkGame){
			main.fillText("Game Code:"+ game.networkGame, game.fontSize,  game.fontSize *3);
		}
		else{
			main.fillText("not conntected", game.fontSize, game.fontSize *3);		
		}
		

		//show connected players with color
		this.drawPlayers(main, 20,240,640,game.height - 240);

		//drawSettings
		this.drawSetings (main, 20, 100,640,96);


	};
	this.drawSetings = function(context,x,y,w,h){
		context.save();
		context.translate(x,y);
		context.fillStyle ="#000";
		context.fillRect(0,0,w,h);
		context.strokeStyle = "#fff";
		context.strokeRect(0,0,w,h);
		context.fillStyle ="#fff";
		
		

		if(!game.isServer){
			context.fillText("Settings" ,game.fontSize,game.fontSize);
			context.fillText("Rounds:"+ game.maxRounds||"?", game.fontSize,game.fontSize*3);
			context.fillText("Weapons:"+ game.maxRounds||"?", game.fontSize,game.fontSize*4);
		}
		else{
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
		context.fillText("Chat:  Connected Players ("+game.players.length+"/"+game.maxPlayers+")" ,
		game.fontSize,game.fontSize);
		game.chat.draw(context, 0, game.fontSize*2, w, h - game.fontSize*2);
		context.restore();

	}

	this.draw

	this.update= function(ticks){

		game.connections.webSocket.processMessageQueue();
		
		

	};

	this.handleError =function(error){
		alert(error.message);
		switch(error.message){
			case "Already in the game, change your name?":
				diesel.raiseEvent("screenChange", "setup","attract");
			break
			case "no such game":
				diesel.raiseEvent("screenChange", "setup","attract");
			break;
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
		if(window.AudioContext){
			this.context = new window.AudioContext();

			this.oscillator = this.context.createOscillator();
			this.oscillator.frequency.value=0;

			this.oscillator.start(0.5);
		}
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
