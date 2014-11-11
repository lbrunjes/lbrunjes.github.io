// built at Tue 04 Nov 2014 01:55:56 PM EST
/*
	DIESEL TANKS
	a simple tank game in html5 
	Built using diesel.js
	2014 Lee Brunjes - lee.brunjes@gmail.com

*/
var TANKS_APP_ID="1DC73FAD";
var TANKS_APP_NS="co.housemark.tanks";


if(!diesel){
	alert("diesel tanks can't start wth no engine");
}

var game = function(isServer){

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
	this.isServer = isServer||false;
	this.networkGame = false;
	this.messageHost = "ws:\\housemark.co:9000";

	
	this.players =[];
	this.maxPlayers =2;
	this.localPlayer = null;

	this.width=640;
	this.height=480;

	this.ws = null;

	this.level = null;
	this.round =0;
	this.mouseDown=false;

	this.touches=[];
	this.x;
	this.y;



	this.init = function(){
		//at this point we set variables 
		//our object has not fully loaded yet
		diesel.fpsLimit =30;
		diesel.pauseOnBlur =false;
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		window.scrollMaxX=0;
		window.scrollMaxY=0;
		window.scrollbars.visible = false;
		this.fontSize =32;
		

	}

	this.startup = function(){
		console.log("game startup");

		var body = document.getElementsByTagName("body")[0].getBoundingClientRect(),
		    el = document.getElementById(this.container).getBoundingClientRect();
		this.y = el.top - body.top;
		this.x = el.left - body.left;

		var _player = diesel.load("player");
		if(_player){
			this.localPlayer = new game.objects.player(_player.name, _player.color);
		}
		else{
			this.localPlayer = new game.objects.player();
		}
	
		diesel.registerKey("space",32);

		
		this.ws = new WebSocket(this.messageHost, false);
		this.ws.onopen =function(){
			console.log("connected");
			game.ws.onmessage = game.events.routeMessage;
			game.ws.onerror = function(data){console.log("network error:", data);};
		
			
		}
		this.ws.onclose=function(){
			console.log("connection closed");
		}
		
	}

	this.simulateGame= function(){
		
		diesel.raiseEvent("screenChange", "loading", "gameList");

		
	

	}


	this.init();
}

tankInstance.prototype = new diesel.proto.game();
///
//
///

if(!game.mixin){
	game.mixin = {};

}///
//	game.mixin.gravity
///

game.mixin.gravity = {
	"gravity":100,
	"downSpeed":0.01,
	"terminalVelocity":game.height,
	"shouldOverride":false,
	"applyGravity":function(ticks){
		if(this.canFall()){
			//I know it says up it's cool
			this.move(ticks, game.directions.up, this.downSpeed);

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
		
		var onground= game.level.collides(this.x+i, this.y+1);
		


		return onground;
	}

}
///
//	game.mixin.hoverable
///
game.mixin.hoverable = {
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
//	game.mixin.controlable
///

game.mixin.controlable = {
	"aim":game.directions.up,
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
		
	}
};


///
//	game.mixin.damageable
///

game.mixin.damageable= {
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
//	game.mixin.wind
///

game.mixin.wind = {
	"wind":100,
	"delta":0.01,
	"direction":game.directions.left,
	"terminalVelocity":game.width,
	"shouldOverride":false,
	"applyGravity":function(ticks){
		
			this.move(ticks, this.direction, this.delta);

			if(this.delta < this.terminalVelocity){
				this.delta += this.wind*ticks;
			}
			else{
				this.delta = this.terminalVelocity;
			}
			
		
	},
	"canFall":function(ticks){
		//query the level
		var level = game.screens.game.match.level;

		return (this.y < level.y);
	}

}
///
//	game.objects
///

if(!game.objects){
	game.objects={};
}

game.objects.base = function(){


};
game.objects.base.prototype = new diesel.proto.objectBase();


///
//	game.objects.player
///

game.objects.player = function(name, color){
	this.name= name|| "fred";
	this.color = color||"#"+Math.floor(Math.random()*4096).toString(16);
	//todo icon:[],
	this.cash =0;
	this.alive=true;
	this.isAI = false;
	this.tank = null;
	

	this.init= function(){

	}

	this.init();
};
///
//	game.objects.level
///

game.objects.level = function(players){

	this.w = game.width;
	this.h = game.height;
	this.x = 0;
	this.y=0;
	this.backgroundColor = "#000000";
	this.foregroundColor = "#99aa77";


	this.tanks = [];
	this.effects = [];
	this.terrain =[];
	this.terrainScale =4;


	this.activePlayer = game.round % players.length;
	this.numTanks = players.length;




	this.init= function(){

		game.context.effects.clearRect(0,0,game.width,game.height);

		this.generateTerrain();
		
		this.placeTanks();
		game.activePlayer = function(){
			return game.players[this.activePlayer];
		};

	};

	this.generateTerrain = function(){
		var	keys= [];
		while(keys.length <= 3 || Math.random() < .8){
			keys.push(Math.random() * game.height/2 + game.height/2);
		}
		
		var segment = (game.width/this.terrainScale)/(keys.length -1);
		for(var x = 0 ; x < game.width / this.terrainScale;x++){
			var last = Math.floor(x/segment);


			var alt = diesel.lerp(keys[last],keys[last+1], (x%segment)/segment) ;
			alt += Math.random()*10 - 5;
			alt = diesel.math.clamp(alt, 1, game.height);
			
			this.terrain.push(Math.round(alt));

			
			
		}

	};



	this.placeTanks = function(){
		var step = Math.floor(this.w / (players.length +1));

		for(var i = 0; i < this.numTanks; i++){
			var x = Math.round(step * (i + 1) + 100 * Math.random());
			this.tanks.push(new game.units.tank(x, 0, players[i]));
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
		if(x <0 ||y<0||x>game.width){
			return false;
		}
		if(y >=game.height){
			return true;
		}
		var hit =false;
		var pixel = game.context.terrain.getImageData(x,y,1,1).data;
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
		terrain.clearRect(0,0,game.width -1, game.height-1);
		
		terrain.save();
			terrain.fillStyle=this.backgroundColor;
			terrain.fillRect(0,0,this.w,this.h);
			terrain.fillStyle=this.foregroundColor;
			terrain.beginPath();
			terrain.moveTo(0,game.height -1);
			for(var x = 0; x <this.terrain.length; x++){
				terrain.lineTo(x* this.terrainScale, this.terrain[x]);
			}
			terrain.lineTo(game.width -1, game.height-1);
			terrain.closePath();
			terrain.fill();

			
		terrain.restore();
		
	}
	this.draw = function(context){
		
		context.clearRect(0,0,game.width -1, game.height-1);
		for(var i =0; i < this.tanks.length;i++){
			if(i ===this.activePlayer){
				//fak the hover for the active player
				this.tanks[i].hoverActive =true;
			}
			this.tanks[i].draw(context);

		}

		for(var  i = 0 ; i < this.effects.length; i++){
			this.effects[i].draw(game.context.effects, context);
		}
	};


	this.update =function(ticks){
		for(var i = 0 ; i < this.tanks.length; i++){

			if(this.activePlayer === i){
				this.tanks[i].isActive =true;
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
				this.effects.splice(i,1);
				i--;
			}
		};
	};

	this.nextPlayer=function(){

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

		//console.log(start, next, next === start);
		// if we are wereh we started with either  tie or a win
		//or if we only have one or fewer active tanks
		if(next === start || numActive < 2){
			console.log("ending level");
			diesel.raiseEvent("endLevel", this.tanks, next);
			
		}
		else{
			//in all other cases we can swap players
			this.activePlayer = next;

			//add an effect that shows us this for a few seconds.
			var txt = new game.effects.text(
				"It is now "+this.tanks[next].player + "'s Turn",
				 game.width/2, game.height/2);
			txt.align = "center";
			this.effects.push(txt);

			//TODO play a sound

			//next turn show all clients the world as we know it.
			var msg = new game.messages.gameUpdate();
			msg.message = {"newLevel":game.level};
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

game.objects.level.prototype = new game.objects.base();
///
//	game.effects
///

if(!game.effects){
	game.effects = {};

}///
// game.effects.bullet;
///


game.effects.bullet = function(tank){

	this.x = tank.x + Math.sin(tank.aim) *tank.w ,
	this.y = tank.y + tank.h/2 + Math.cos(tank.aim) *tank.w;
	this.w = 3;
	this.h = 3;
	this.color = tank.color;
	this.angle = tank.aim + Math.PI;
	this.power = tank.power;
	this.isActive =true;
	this.weapon = tank.weapon;
	
	this.init = function(){
		diesel.addMixin(this, game.mixin.gravity);
	};

	this.draw=function(context){
		context.save();
			context.translate(this.x,this.y);
			context.rotate(Math.PI/4);
			context.fillStyle = this.color;
			context.fillRect(-1, -1,2,2);

		context.restore();
		game.context.main.fillStyle="#fff";
		game.context.main.fillRect(this.x-1, this.y-1,3,3);
	}
	this.update=function(ticks){
		if( this.isActive){

			var oldx = this.x, oldy=this.y;
			this.applyGravity(ticks);
			this.move(ticks, this.angle, this.power);

			var tests =[this.x,this.y],_x,_y;

			// if we are going too fas we need to chek more points than teh two we drew at.
			var minDist = 1, 
				dx = Math.abs(this.x - oldx),
				dy = Math.abs(this.y - oldy);
			if( dx>= minDist || dy>=minDist){
				for(var i = 0 ; i< dx+dy;i++){
					
					tests.push(diesel.lerp(this.x,oldx,i/(dx+dy)));
					tests.push(diesel.lerp(this.y,oldy,i/(dx+dy)));
				}
			}


			
			for(var i = tests.length-2 ; i >=0; i-=2){
				_x = tests[i];
				_y = tests[i+1];

				//did we hit something?
				if(game.level.collides(_x, _y)){
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
game.effects.bullet.prototype = new game.objects.base();
///
// game.effects.text.js
///

game.effects.text = function(text,x,y,color,fontDetails){

	this.fontInfo = fontDetails || false;
	this.message = text ||"???";
	this.color = color||"#fff";
	this.x = x || 0;
	this.y = y || 0;
	this.ttl = 3;
	this.isActive = true;
	this.align = "left";

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
	this.after = null;
};
game.effects.text.prototype = new game.objects.base();
///
//	game.effects.explosion
///

game.effects.explosion = function(x,y,radius){

	this.x = x;
	this.y = y;
	this.radius = radius|| 5;
	this.radiusNow= 1;
	this.expand = true;
	this.shade = 128;
	this.speedModifier =50;
	this.isActive =true;
	this.damage = 600;
	
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
			game.level.nextPlayer();
		}
		//apply damage now
		
		for(var i = 0; i <game.level.tanks.length; i++){
			if(game.level.tanks[i].distance(this.x, this.y)<= this.radiusNow +game.level.tanks[i].w/2){
				game.level.tanks[i].takeDamage(this.damage*ticks);
			}

		}

};

}
game.effects.explosion.prototype = new game.objects.base();///
//	game.events
///

if(!game.events){
	game.events = {};
}


///
//	game.events.endLevel
///

game.events.endLevel = function(evt){
	var tanks = evt.args[0],
	ended = evt.args[1],
	message= "A draw, how boring!";


	if(tanks[ended].health >0){
		//last person alive
		console.log("victory");
		message = tanks[ended].player + " wins!";
	}
	else{
		console.log("draw");
	}

	//show  player won message
	var effect = new game.effects.text(message, game.width/2, game.height/2);
	effect.align = "center";
	//change to the next Level or the buy screen
	effect.after = function(){

		diesel.raiseEvent("screenChange", game.activeScreen, game.activeScreen);

	};
	game.level.effects.push(effect);

};



///
// game.events.explosion
///


game.events.explosion = function(evt){
	var bullet = evt.args[0];
	//TODO weapon scaling etc
	var explosion = new game.effects.explosion(bullet.x, bullet.y, 15);
	game.level.effects.push(explosion);
	

};


///
// game.events.fire
///

game.events.fire = function(evt){
	//ge teh corrds from teh tank 
	var tank = evt.args[0];
	tank.isActive = 0;

	
	var numbullets = game.level.effects.length;
	// for(var i =0 ; i < game.level.effects.length;i++){
	// 	if()
	// }
	//generate a projectile add it to the level
	//console.log("fire called ", numbullets, " effects");
	if(numbullets===0){
		var bullet = new game.effects.bullet(tank);
		game.level.effects.push(bullet);
	}

	//TODO Sound.



};


///
//	game.events.miss
///

game.events.miss = function(evt){
	//change the active player
	console.log("misssed advanced palyer");
	game.level.nextPlayer();

	//TODO play a sound

};

///
//	game.events.mousemove
///
//used to allow swiping

game.events.mousemove=function(e){
	if( game.screens[game.activeScreen].mousemove){
		game.screens[game.activeScreen].mousemove(e);
	}
};


game.events.mousedown=function(e){
	game.mouseDown =true
	if( game.screens[game.activeScreen].mousedown){
		game.screens[game.activeScreen].mousedown(e);
	}
};

game.events.mouseup=function(e){
	game.mouseDown =false
	if( game.screens[game.activeScreen].mouseup){
		game.screens[game.activeScreen].mouseup(e);
	}
};

///
//	tanks.events.webSocket.js
///


///
// websocket router;
///
game.events.routeMessage= function(MessageEvent){
	var text = MessageEvent.data;

	//console.log("recieved:",text);//, MessageEvent);
	var data;
	try{
		data= JSON.parse(text);
		if(game.messages[data.type]){

			var msg = new game.messages[data.type]();
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




///
//	game.events.touch
///
if(!game.touches){
	game.touches =[];
}

game.events.touchstart=function(e){
	
	for(var i = 0; i < e.changedTouches.length;i++ ){
		var coords = diesel.util.getLocalCoords(e.changedTouches[i].pageX, e.changedTouches[i].pageY);
		game.touches.push({ identifier: e.changedTouches[i].identifier, 
			x: coords.x,
			y: coords.y });
			if( game.screens[game.activeScreen].click){
				game.screens[game.activeScreen].click(e.changedTouches[i],coords.x,coords.y);
			}


	}
	
};

game.events.touchend=function(e){
console.log("touchend")
	for(var i = 0; i < e.changedTouches.length;i++ ){
		for (var j =0; j <game.touches.length;j++){	
			if(e.changedTouches[i].identifier == game.touches[j].identifier){
				game.touches.splice(j,i);
				return;
			}
		}
	}
	

};

// game.events.touchcancel=function(e){
// 	e.preventDefault();
// 	for(var i = 0; i < e.changedTouches.length;i++ ){
// 		for (var j =0; j <game.touches.length;j++){	
// 			if(e.changedTouches[i].identifier == game.touches[j].identifier){
// 				game.touches.splice(j,i);
// 			}
// 		}
// 	}
// 	return false;
// };

game.events.touchmove=function(e){
	
	for(var i = 0; i < e.changedTouches.length;i++ ){
		var coords = diesel.util.getLocalCoords(e.changedTouches[i].pageX,
		 e.changedTouches[i].pageY);

		if( game.screens[game.activeScreen].touchmove){
			game.screens[game.activeScreen].touchmove(e,coords.x, coords.y);
		}
		else{

			if( game.screens[game.activeScreen].click){
				game.screens[game.activeScreen].click(e,coords.x, coords.y);
			}
		}
	}

};

// game.events.touchleave=function(e){
// 	game.events.touchend(e);
// };

///
//  game.messages
///

if(!game.messages){
	game.messages ={};
}

game.messages.base = {
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
game.messages.heartbeat = function(data){

};
game.messages.heartbeat.prototype = game.messages.base;


//hello message
game.messages.hello = function(player){
	this.type = "hello";
	this.player = player;
	this.message = player;
};
game.messages.hello.prototype = game.messages.base;




// list games on teh server
game.messages.listGames = function(data){
	this.type= "listGames";
	this.content = null;
	this.player = null;
};
game.messages.listGames.prototype = game.messages.base;

//the list of games from the server
game.messages.gameList = function(data){
	this.type= "gameList";
	this.content = {"type":"tanks","version": game.version};;
	this.player = null;
	this.process = function(data){
		game.screens.gameList.networkGames = data.message.games||data.message;
		game.screens.gameList.loading =false;
	};
};
game.messages.gameList.prototype = game.messages.base;



// join a game
game.messages.joinGame = function(gameid, isQuick){
	this.type= "joinGame";
	this.game = gameid;
	this.player = game.localPlayer;
	this.message = {quick:isQuick||false};

};
game.messages.joinGame.prototype = game.messages.base;

// round start



//create a game
game.messages.createGame = function(gameid){
	this.type= "createGame";
	this.game = gameid;
	this.content = {"type":"tanks","version": game.version};
	this.player =null;

};
game.messages.createGame.prototype = game.messages.base;

//create a game
game.messages.error = function(){
	this.type= "error";
	this.process = function(data){
		diesel.addMixin(this,data);
		console.log("ERROR",data.message);
		alert(data.message);
	};

};
game.messages.createGame.prototype = game.messages.base;



//create a game
game.messages.gameUpdate = function(){
	this.type= "gameUpdate";
	this.game = game.networkGame;
	this.process = function(data){
		
		diesel.addMixin(this,data);
		if(!game.networkGame){
			//we are connected to a game now our first message
			game.networkGame = data.game;
			if(!game.isServer){
				diesel.raiseEvent("screenChange","gameList","client");
			}
			else{
				diesel.raiseEvent("screenChange","gameList","server");
			}
		}
		//we are in the right screen to parse our net message
		game.screens[game.activeScreen].readNetMessage(this);

		
	};

};
game.messages.createGame.prototype = game.messages.base;




///
//	game.screens
///

if(!game.screens){
	game.screens = {};
}

game.screens.base = function(){


}
game.screens.base.prototype= new diesel.proto.screen();

//all following screens should be instances

game.screens.loading =function(){
	this.dots =0
	this.draw= function(){
	
		var message = ".";
		for(var i = 0; i < this.dots;i++){
			message+=".";
		}
		game.context.main.fillStyle = "#000000";
		game.context.main.fillRect(0,0,game.width, game.height);
		game.context.main.fillStyle = "#ffffff";
		game.context.main.textAlign = "center";
		game.context.main.fillText("LOADING",game.width/2,
		 game.height/2 - game.fontSize);
		game.context.main.fillText(message,game.width/2,
		 game.height/2);
		game.context.main.fillText(diesel.loading+" items",game.width/2,
		 game.height/2 + game.fontSize);
		

	};
	this.update = function(){
		this.dots++;
		this.dots = this.dots%5;

		if(!diesel.loading){
			diesel.raiseEvent("screenChange","loading","menu");

		}
	};
}
game.screens.loading.prototype= new game.screens.base();
game.screens.loading = new game.screens.loading();

///
//	game.screens.buy
///

game.screens.buy = function(){
	
	this.reset = function(from, to){
	

	};

	this.draw= function(){
	
	};
	this.update =function(ticks){
	
	}


};
game.screens.buy.prototype = new game.screens.base();
game.screens.buy = new game.screens.buy();
///
//	game.screens.menu
///

game.screens.menu = function(){
	var i = 0;
	var screens = "";


	this.clickZones=[
	{//name
		x:game.width/4,
		y:game.height/2,
		w:game.width/2,
		h:game.fontSize,
		click:function(evt){
			var name = prompt("Enter your player name:",game.localPlayer.name);
			if(name.length > 0){
				game.localPlayer.name = name;
				diesel.save("player",game.localPlayer);
			}

		}
	},
	{//go
		x:game.width/4,
		y:game.height/4*3,
		w:game.width/2,
		h:game.fontSize,
		click:function(evt){
			diesel.raiseEvent("screenChange","menu","gameList");
		}
	}
	];

	this.reset = function(from, to){
	

	};

	this.draw= function(){
		game.context.main.fillStyle="#000";
		game.context.main.fillRect(0,0,game.width-1, game.height-1);
		game.context.main.fillStyle="#fff";
		game.context.main.textAlign = "left";
		var z;
		game.context.main.fillText("MENU:  Diesel Tanks v"+game.version,0,game.fontSize);
		game.context.main.fillText("This requires web sockets,",0,game.fontSize*3);
		game.context.main.fillText("Get chrome for android on your phone", 0, game.fontSize*4)
		game.context.main.fillText("Chromecast the first player",0,game.fontSize*5);


		game.context.main.strokeStyle="#666";

		for(var i = 0 ; i < this.clickZones.length ;i++){
			game.context.main.strokeRect(this.clickZones[i].x,this.clickZones[i].y,
				this.clickZones[i].w,this.clickZones[i].h)
		}

		var box  =this.clickZones[0];
		game.context.main.textAlign ="center";
		game.context.main.fillText("You are Called:", box.x+box.w/2,box.y);
		game.context.main.fillText(game.localPlayer.name, box.x+box.w/2,box.y+game.fontSize);

		box = this.clickZones[1];

		game.context.main.fillText("Play", box.x+box.w/2,box.y+game.fontSize);		
		game.context.main.textAlign ="left";
		
	
	};
	this.update =function(ticks){
	
	}


};
game.screens.menu.prototype = new game.screens.base();
game.screens.menu = new game.screens.menu();
///
//	game.screens.game
///

//this is the demo screen
game.screens.game = function(){
	this.time = 0;



	

	this.reset = function(from, to){
		game.level = new game.objects.level(game.players);
		game.round ++;
		this.time = 0;


	};

	this.draw= function(){
		game.level.draw(game.context.main);

		game.context.main.fillRect(diesel.mouseX, diesel.mouseY,5,5)

	};
	this.update =function(ticks){
		game.level.update(ticks);
		this.time += ticks;
		

	}
	this.readNetMessage =function(gameUpdate){


	}


};
game.screens.game.prototype = new game.screens.base();
game.screens.game = new game.screens.game();
///
//	game.screens.client
///

game.screens.client = function(){
	this.isZoomed = true;
	this.origin ={x:game.width/2, y:game.height/3*2, w: game.height/4};
	this.arcwidth =32;
	this.playerId = 0;
	this.pct = .2;
	this.isMyTurn =true;
	this.fontSize	=game.height/10;
	this.reset =function(){
		this.fontSize	=game.height/10;

	}
	
	this.clickZones = [
		{ //fire b utton
			x:game.width/2 - 64, 
			y:game.height-96,
			w: 128,
			h: 64,
			click : function(evt){
				
				//send update
				
				var msg = new game.messages.gameUpdate();
				msg.message = {"fire":game.localPlayer.tank};
				game.ws.send(JSON.stringify(msg));

				//todo draw line for this one
				

			}
		},
		{ //power
			x:game.width/6, 
			y:game.height/4*3,
			w: game.width/3*2,
			h: 48,
			click : function(x,y){
				
				var _x = x||diesel.mouseX;
				var _y = y||diesel.mouseY;

				game.localPlayer.tank.safetyOff

				game.screens.client.pct = (_x - game.screens.client.clickZones[1].x)/(game.screens.client.clickZones[1].w);
				var p =  Math.round(game.localPlayer.tank.maxPower * game.screens.client.pct);
				game.localPlayer.tank.power = diesel.clamp(p,0,game.localPlayer.tank.maxPower * (game.localPlayer.tank.health/game.localPlayer.tank.maxHealth));
				var msg = new game.messages.gameUpdate();
				msg.message = {"aim":game.localPlayer.tank};
				game.ws.send(JSON.stringify(msg));


			}
		},
		

		{
			x:0, 
			y:game.height/4,
			w: game.width,
			h: game.height/12 *5,
			click : function(x,y){
				
				var _x = x||diesel.mouseX;
				var _y = y||diesel.mouseY;

				//power down
				
				//check the distance to the origin

				var angle = Math.atan2(_x - game.screens.client.origin.x, 
						_y - game.screens.client.origin.y)
						game.localPlayer.tank.aim =  angle;
				
				
				var msg = new game.messages.gameUpdate();
				msg.message = {"aim":game.localPlayer.tank};
				game.ws.send(JSON.stringify(msg));



			}
		},
		{


		}

	];

	this.draw = function(){

		game.context.main.fillStyle = "#000000";
		game.context.main.fillRect(1,1,game.width-2,game.height-2);
		
		
		//TODO
		if(game.localPlayer.tank){
			//draw the tank.
			this.drawTank(game.context.main);

			//draw the world

			if(!game.localPlayer.tank.isDead()){
				//gui
				this.drawGui(game.context.main);
			}
			else{
				//death message
				this.drawSkull(game.context.main);
			}
		}
		else{
			//TODO! is there a lobby?
			
			this.drawSkull(game.context.main);


		}






	};

	this.update = function(ticks){
		//this.isMyTurn = (game.level.activePlayer || 0) === this.playerId;
	};

	this.drawSkull = function(context){
		//TODO
		context.fillStyle ="#fff";
		context.textAlign="center";
		context.fillText("You're DEAD!",game.width/2, game.height/2);
		context.fillText("Try not to smack talk too much while they finish duking it out",game.width/2, game.height/2 + this.fontSize);
		context.textAlign="left";
	};

	this.drawTank = function(context){
		//draw that tank action!!!
		context.save();
			context.translate(game.width/2,game.height/3*2)
			context.scale(game.width/4/game.localPlayer.tank.w,game.width/4/game.localPlayer.tank.w);
			game.localPlayer.tank.draw(context,true);
		context.restore();

	};


	this.drawGui =function(context){
		var tmp = context.font;
		context.font = this.fontSize+ " "+ game.font;
		
		//show the fire buttons
		if(this.isMyTurn){
			this.drawButton(game.context.main, "Fire", 
					this.clickZones[0].x, this.clickZones[0].y, this.clickZones[0].w,this.clickZones[0].h,
					 game.localPlayer.tank.color, "#fff", game.localPlayer.tank.color);
		}
		
		//power button
		game.context.main.fillStyle = "#444";
		//bg
		game.context.main.fillRect(this.clickZones[1].x, this.clickZones[1].y, 
			this.clickZones[1].w,this.clickZones[1].h);

		//avaialbe power
		game.context.main.fillStyle = "#999";
		var __w= this.clickZones[1].w * (game.localPlayer.tank.health/ game.localPlayer.tank.maxHealth);	
		game.context.main.fillRect(this.clickZones[1].x, this.clickZones[1].y,
		 __w,this.clickZones[1].h);
		

		//actual power
		game.context.main.fillStyle = game.localPlayer.tank.color;
		__w= this.clickZones[1].w * (game.localPlayer.tank.power/ game.localPlayer.tank.maxPower);	
		game.context.main.fillRect(this.clickZones[1].x, this.clickZones[1].y,
		 __w,this.clickZones[1].h)	
		
		game.context.main.strokeStyle =game.localPlayer.tank.color;
		game.context.main.strokeRect(this.clickZones[1].x, this.clickZones[1].y, 
			this.clickZones[1].w,this.clickZones[1].h);

		game.context.main.textAlign = "center";
		game.context.main.fillStyle = "#fff";
		game.context.main.fillText("POWER:"+game.localPlayer.tank.power,this.clickZones[1].x +this.clickZones[1].w/2, this.clickZones[1].y + this.clickZones[1].h -this.fontSize /4);
		


		//draw the arc to aim with.
		context.lineWidth = this.arcwidth;
		context.lineCap = "round";
		context.strokeStyle ="rgba(0,0,192, "+(.5 + Math.sin(diesel.frameCount/33)*.25)+")";
		context.beginPath();
		context.arc(this.origin.x, this.origin.y, game.width/6+32 ,0, Math.PI,true);
		context.stroke();


		context.closePath();
		context.lineWidth = 1;
		context.lineCap = "butt";

		


		context.fillStyle = "#fff";
		context.textAlign = "left";
		

	//	context.fillText("Current Turn:" +game.level.tanks[game.level.activePlayer].player, this.fontSize, this.fontSize);
		context.fillText("aim:"+Math.round(diesel.degrees(game.localPlayer.tank.aim)), this.fontSize, this.fontSize*2);
	//	context.fillText("power:"+ Math.round(game.localPlayer.tank.power), this.fontSize, this.fontSize*3);
		context.fillText("health:"+Math.ceil(game.localPlayer.tank.health), this.fontSize, this.fontSize*4);

		context.font = tmp;

	};

	this.drawButton = function(context,text,x,y,w,h, fill, textfill,  stroke, disabled){
		var f = fill || context.fillStyle;
		var t = textfill || context.strokeStyle;
		var s =  stroke || context.strokeStyle;
		var d = diesel.frameCount%30 /10 +1;


		if(!disabled){
			context.strokeStyle = s;
			context.strokeRect(x -d, y -d, w +2 *d, h +2*d);
		}
		context.fillStyle =f;
		context.fillRect(x,y,w,h);
		context.fillStyle = t;
		context.textAlign= "center";
		context.fillText(text, x +w/2, y+h/2);

	};
	this.readNetMessage =function(gameUpdate){
		var msg =gameUpdate.message;
		//TODO validate message

		//is it a join message
		if(msg.joined){
			if(game.level && game.level.effects){
				var effect = new game.effects.text(msg.joined.name+" joined",
					 this.fontSize, this.fontSize);
				game.level.effects.add(effect);
			}
		}
		
		//the level has changed
		if(msg.newLevel){
			
			if(!game.level)
				{ game.level = new game.objects.level([]);};
			
			diesel.addMixin(game.level, msg.newLevel);

			//find our tank and attach to our player
			for(var t =0 ; t< msg.newLevel.tanks.length;t++){
				if(msg.newLevel.tanks[t].player == game.localPlayer.name){
					console.log("found tank for player");
					game.localPlayer.tank = new game.units.tank(
						msg.newLevel.tanks[t].x,
						msg.newLevel.tanks[t].y,game.localPlayer);
					diesel.addMixin(game.localPlayer.tank,msg.newLevel.tanks[t], true);
					this.playerId = t;
				};
			}
			
		}

		//played is a player was hit
		if(msg.hit){
			game.tank.health -= msg.hit;
			//TODO play a sound

			if(game.tank.isDead()){
				this.drawSkull(game.context.main);
			}

		}
		//played is a player was moved
		if(msg.move){

		}

		//change turn
		if(msg.next){
			game.level.activePlayer = msg.next;
		}

		//ignored messages
		/*
		//show where they are aiming
		if(msg.aim){

		}

		//show the fire effect
		if(msg.fire){

		}
		*/




	};
	this.mousemove =function(evt){
		var coords = diesel.util.getLocalCoords(evt.pageX, evt.pageY);
			game.context.main.beginPath();
			game.context.main.arc(coords.x, coords.y, 4, 0, 2*Math.PI, false);  // a circle at the start
			game.context.main.fillStyle = "#f00";
			game.context.main.fill();
		
			
			this.click(evt,coords.x, coords.y);

		
	};
	this.touchmove =function(evt,x,y){
		
		
			
			//SKIP FIRE
			for(var  j = 1; j < this.clickZones.length;j++){
				if(this.clickZones[j].x< x &&
					this.clickZones[j].x +this.clickZones[j].w > x &&
					this.clickZones[j].y < y &&
					this.clickZones[j].y +this.clickZones[j].h > y){
					this.clickZones[j].click(x,y);
					
				}

			}
		

		
	};
	this.touchend =function(evt,x,y){
		if(this.clickZones[0].x< x &&
					this.clickZones[0].x +this.clickZones[0].w > x &&
					this.clickZones[0].y < y &&
					this.clickZones[0].y +this.clickZones[0].h > y){
					this.clickZones[0].click(x,y);
					
				}

	}
	this.click =function(evt,x,y){

	x = x ||diesel.mouseX;
	y = y ||diesel.mouseY;

	//SKIP FIRE
	for(var  j = 0; j < this.clickZones.length;j++){
		if(this.clickZones[j].x< x &&
			this.clickZones[j].x +this.clickZones[j].w > x &&
			this.clickZones[j].y < y &&
			this.clickZones[j].y +this.clickZones[j].h > y){
			this.clickZones[j].click(x,y);
			
		}

	}



	};


};

game.screens.client.prototype = new game.screens.base();
game.screens.client = new game.screens.client();

///
//	game.screens.server
///

//the server code.


game.screens.server = function(){
	this.time = 0;

	this.reset = function(from, to){
		game.level = new game.objects.level(game.players);
		game.round ++;
		this.time = 0;
		game.level.drawTerrain(game.context.terrain);

		var msg = new game.messages.gameUpdate();
		msg.message = {"newLevel":game.level};
		game.ws.send(JSON.stringify(msg));

	};

	this.draw= function(){
		game.level.draw(game.context.main);

		game.context.main.fillRect(diesel.mouseX, diesel.mouseY,5,5)

	};
	this.update =function(ticks){
		game.level.update(ticks);
		this.time += ticks;
		

	}
	this.readNetMessage =function(gameUpdate){
		var msg =gameUpdate.message;
		//console.log(msg);
		//is it a join message
		if(msg.joined){

			if(game.level &&game.level.effect){
				var effect = new game.effects.text(msg.joined.name+" joined",
					 game.fontSize, game.fontSize);
				game.level.effects.push(effect);
			}
			console.log("joined", gameUpdate);
			game.players.push(msg.joined);

			if(game.level.tanks.length < 2){
				game.screens.server.reset();
			}
			

		}
		if(msg.dropped){
			//setup an AI to take over.
			console.log("dropped", msg.dropped);

			var ai = new game.ai.misterStupid();

			for(var i =0 ; i < game.level.tanks.length; i++){

				if(game.level.tanks[i].player == msg.dropped.name){

						diesel.addMixin(game.level.tanks[i],ai);
						console.log("repalced with an AI");
						
				}

			}
			for(var i =0 ; i < game.players.length; i++){

				if(game.players[i].name == msg.dropped.name){

						diesel.addMixin(game.players[i],ai,true);
					
				}

			}


		}


		//show where they are aiming
		if(msg.aim){
			//TODO validataion
			for(var i = 0; i < game.players.length;i++){
				if(msg.aim.player === game.level.tanks[i].player){
					game.level.tanks[i].aim = msg.aim.aim;
					game.level.tanks[i].power = msg.aim.power;
					break;
				}
			}
			//TODO sounds
		
		}

		//show the fire effect
		if(msg.fire){
			
			if(msg.fire.player === game.level.tanks[game.level.activePlayer].player
				&& game.level.effects.length === 0
				&& game.level.tanks[game.level.activePlayer].isActive
				&& game.level.tanks[game.level.activePlayer].safetyOff
				//TODO aim
				//TODO power
				){
				var aim = diesel.clamp( msg.fire.aim, game.directions.left, game.directions.right),
				power = diesel.clamp(msg.fire.power, 0,game.level.tanks[game.level.activePlayer].maxPower); 
				
				game.level.tanks[game.level.activePlayer].aim = aim;
				game.level.tanks[game.level.activePlayer].power = power;
				
				game.level.tanks[game.level.activePlayer].fire();
			}
			else{
				console.log("invalid fire command from "+ msg.fire.player);
			}
		}
		//show the fire effect
		if(msg.move){
			//TODO
			console.log("move envent");
		}	

		

		//ignored messages
		/*
		if(msg.newLevel){

		}

		//played is a player was hit
		if(msg.hit){

		}
		//change turn
		if(msg.next){

		}

		*/


		



	}


};
game.screens.server.prototype = new game.screens.base();
game.screens.server = new game.screens.server();

///
//	game.screens.gameList
///

game.screens.gameList = function(){

	this.clickZones =[
		
		{	//back
			x:0,
			y:game.fontSize,
			w:game.width/3,
			h:game.fontSize,
			click:function(){
				diesel.raiseEvent("screenChange", "gameList","menu");
			}
		},
		{ //list
			x: game.fontSize*1,
			y: game.fontSize*3,
			w: game.width - game.fontSize*2,
			h: game.height - game.fontSize*2,
			click:function(evt){

				//did we select a game
				
				var i =  Math.floor((diesel.mouseY - game.screens.gameList.clickZones[1].y) / game.fontSize);
				
				if(i===game.screens.gameList.selected){
					//join game
					if(game.screens.gameList.networkGames.length > i){
						if(!game.screens.gameList.networkGames[i].players){
							game.isServer =true;
													
						}

						var netgame = game.screens.gameList.networkGames[i];
						var msg = new game.messages.joinGame(netgame.serverId);
						game.ws.send(msg);
					}
					else{
						selected = null;
					}

				}
				else{
					game.screens.gameList.selected = i;
				}

			}
		},
		{	//refresh
			x:game.width/3*2,
			y:game.fontSize,
			w:game.width/3,
			h:game.fontSize,
			click:function(){
				game.screens.gameList.refresh();

			}
		},
		{	//createGame
			x:game.width/3,
			y:game.fontSize,
			w:game.width/3,
			h:game.fontSize,
			click:function(){
				var name = prompt("what is your game name?");
				var msg = new game.messages.createGame(name);
				game.ws.send(msg);
				game.screens.gameList.refresh();


			}
		},
	];

	this.networkGames = [];
	this.loading = false;
	this.selected = null;

	this.refresh = function(){
		game.ws.send(new game.messages.listGames());
		this.loading = true;
	};
	this.reset =function(){
		this.refresh();

	}

	this.draw =function(){
		game.context.main.fillStyle = "#000";
		game.context.main.fillRect(0,0,game.width -1, game.height-1);
		
		game.context.main.fillStyle="#fff";
		game.context.main.strokeStyle="#666";

		for(var i = 0 ; i < this.clickZones.length ;i++){
			game.context.main.strokeRect(this.clickZones[i].x,this.clickZones[i].y,
				this.clickZones[i].w,this.clickZones[i].h)
		}
		game.context.main.save();

		game.context.main.fillText("back",this.clickZones[0].x,this.clickZones[0].y+game.fontSize);

		game.context.main.fillText("refresh",this.clickZones[2].x,this.clickZones[2].y+game.fontSize);
		game.context.main.fillText("new",this.clickZones[3].x,this.clickZones[3].y+game.fontSize);
		
		game.context.main.translate(this.clickZones[1].x,this.clickZones[1].y)
		var netgame;
		

		for(var i = 0; i<this.networkGames.length;i++){
			netgame = this.networkGames[i];
			game.context.main.translate(0,game.fontSize);
			game.context.main.textAlign = "left";
			game.context.main.fillText(netgame.players +"/"+netgame.playerLimit+" "+netgame.id,game.fontSize,0, this.clickZones[1].w, game.fontSize);
			if( i == this.selected){
				game.context.main.fillText(">",0,0);
			}

		}
		game.context.main.textAlign = "left";
		if(this.loading){
			game.context.main.translate(0,game.fontSize*2);
			game.context.main.fillText("loading",0,0);
		}
		game.context.main.restore();

	};

	



};

game.screens.gameList.prototype = new game.screens.base();
game.screens.gameList = new game.screens.gameList();

///
//	game.screens.player
///

//should allow the player to edit their name, color 

game.screens.player =function(){

}
game.screens.player.prototype= new game.screens.base();
game.screens.player = new game.screens.player();
///
// game.ai
///

if(!game.ai){
	game.ai = {};
}


game.ai.base = function(){
	
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
//	game.ai.misterStupid
///

game.ai.misterStupid = function(){
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
				this.aim = diesel.clamp( this.aim + Math.random() - .5, game.directions.left, game.directions.right);

				//mister stupid shoots;
				this.fire();
			}
		}

	}

};
game.ai.misterStupid.prototype = game.ai.base();

///
// game.units.base
///

game.units.base = function(){
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.w=16;
	this.h=16
	this.d=16;
	this.player =  null;
	this.color = "#333333";


	
}
game.units.base.prototype = new diesel.proto.objectBase();
///
//	game.units.tank
///

game.units.tank = function(x,y,player){
	this.x = x ||0;
	this.y = y||0;
	this.z = 0;
	this.w=16;
	this.h=8
	this.d=16;
	this.aim = game.directions.up;
	this.power = 200;
	this.maxPower =1000;
	this.isPlayer = true;
	this.isActive = false;
	this.safetyOff = false;


	this.maxHealth =100;
	this.health =this.maxHealth;

	diesel.addMixin(this, game.mixin.hoverable);
	diesel.addMixin(this, game.mixin.damageable);
	diesel.addMixin(this, game.mixin.gravity);



	if(player){
		this.player = player.name|| null;
		this.color = player.color;

		if(!player.isAI){
			diesel.addMixin(this, game.mixin.controlable);
		}
		else{
			diesel.addMixin(this, player,true);	
		}
	}



	//functions
	
	this.canMove =function(ticks, direction, pulse){
		
	}

	this.draw =function(context, useorigin){
		if(!this.isDead()){
			context.fillStyle= this.color;
			context.strokeStyle= this.color;
		}
		else{
			context.fillStyle= "#333";
			context.strokeStyle= "#333";
			
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

			if(this.hoverActive && !useorigin){
				context.textAlign="center";
				context.fillText(this.player,0,this.h*2);
				
			}

			context.fillStyle = "#000";
			//windows are cool.
			context.fillRect(this.w/-4-1,this.h/-3,2,2);
			context.fillRect(-1,this.h/-3,2,2);
			context.fillRect(this.w/4-1,this.h/-3,2,2);

			
			
		context.restore();

		if(this.isActive && !useorigin){
				context.textAlign = "left";
				context.fillText("angle: "+ (Math.round(diesel.degrees(this.aim)) -90),
				 game.fontSize,game.fontSize);
				context.fillText("power: "+this.power, game.fontSize,game.fontSize*2);
				context.fillText("health: "+Math.ceil(this.health), game.fontSize, game.fontSize*3);
		}

		//draw the barel inot the world.
		game.context.terrain.save();
		game.context.terrain.translate(this.x,this.y,this.h/2);
		game.context.terrain.strokeStyle = game.level.backgroundColor;
		game.context.terrain.beginPath();
		game.context.terrain.moveTo(0,-1);
		game.context.terrain.lineTo(Math.sin(this.aim) *this.w,
				Math.cos(this.aim) *this.w);
		game.context.terrain.stroke();
		game.context.terrain.closePath();
		game.context.terrain.restore();

	};

	this.update = function(ticks){

		this.checkHover();


		this.applyGravity(ticks);
		


		

		if(this.isActive){
			if(this.isDead()){
				this.isActive =false;
			}
			else{

				if(!this.isAI){
					this.readKeys(ticks);

					//if we are active and the space key is note pressed we can then press tehy key to fire
					if(!game.keysDown.space && 
						game.level.effects.length == 0){
						this.safetyOff = true;
					}
					else{
						this.safetyOff =false;
					}
				}
				else{
					
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

		};
	};
}

game.units.tank.prototype = new game.units.base();

