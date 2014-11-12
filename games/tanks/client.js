// built at Wed 12 Nov 2014 10:41:06 AM EST
///
//	index.js
///

var client= function(host){
	this.tank=null;
	this.player = null;
	this.level=null;
	this.width =640;
	this.height =480;


	this.context={"tank":true};
	this.connection = null
	this.messageHost = host || "ws://housemark.co:9000";

	this.screens = {
		"webclient":{

			"readNetMessage":function(msg){
				if(msg.message){
					console.log(msg.message);
					if(msg.message.heartbeat){
						///??
					}

					if(msg.message.nextTurn){
						for(var i = 0 ;i < msg.message.nextTurn.tanks.length;i++){
							if(msg.message.nextTurn.tanks[i].player=== client.player.name){
								 //TODO let the player know it's their turn.
								 if(msg.message.nextTurn.tanks[i].isActive){

								 }

								 client.tank.health = msg.message.nextTurn.tanks[i].health;

							}
						}
					}

					if(msg.message.newLevel){
						for(var i = 0 ;i < msg.message.newLevel.tanks.length;i++){
							if(msg.message.newLevel.tanks[i].player=== client.player.name){
								//set the local clien to match
								$("input[name=angle]").val(diesel.degrees(msg.message.newLevel.tanks[i].aim -Math.PI));
								$("input[name=power]").val(msg.message.newLevel.tanks[i].power);
								client.draw();
							}
						}

					}
				}

			}
		}
	};
	this.activeScreen = "webclient";
	
	
	this.init = function(){
		console.log("client inited");
		diesel.shouldLoop=false;


		
		this.connection = new WebSocket(this.messageHost);
		this.connection.onopen = this.network.onOpen;

		
		//load data
		this.player = new this.objects.player();
		var player = diesel.events.load("player");
		if(player){
			this.player = player;
		}else{
			console.log("using defaults");
		}
		
		
	};


 	this.draw = function(){
 		client.context.tank.fillStyle = "#000";
 		client.context.tank.fillRect(0,0, client.width, client.height);

 		client.context.tank.save();
 		client.context.tank.translate(client.width/2, client.height/3*2);
 		client.context.tank.scale(2,2);

 		this.tank.draw(diesel.game.context.tank, true);
 		client.context.tank.restore();


		document.getElementById("status").innerHTML = this.network.states[this.connection.readyState];

	};

//load from localstorage in the thing.


///
//	network.js
///

this.network = {
	states : ["CONNECTING", "OPEN", "CLOSING","CLOSED"],
	onOpen :function(){
		console.log("connected to websocket host", client.messageHost);
		client.connection.onmessage = client.network.routeMessage;
		client.connection.onerror = client.network.onError;
		client.connection.onclose = client.network.onClose;


	},
	onError:function(data){

		console.log("network error:", data);
	},
	onClose :function(){
		
		console.log("network closed:", data);

		//TODO RETRY
		
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
this.messages.playerStateChange = function(player, gameid){
	this.type = "playerStateChange";
	this.player = player;

};
this.messages.playerStateChange.prototype = this.messages.base;




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



//create a game
this.messages.gameUpdate = function(){
	this.type= "gameUpdate";
	this.game = diesel.game.networkGame;
	this.process = function(data){
		
		if(!diesel.game.networkGame || data.game != diesel.game.networkGame){
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
			this.move(ticks, Math.PI, this.downSpeed);

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
//	this.objects.player
///

this.objects.player = function(name, color){
	this.name= name|| "fred";
	this.color = color||"#"+Math.floor(Math.random()*4096).toString(16);
	//todo icon:[],
	this.cash =0;
	this.alive=true;
	this.isAI = false;
	this.tank = null;
	this.isCastAPI =false;
	this.ready =false;
	

	this.init= function(){

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


	this.init = function(player){
		this.maxHealth =100;
		this.health =this.maxHealth;
		
		// diesel.addMixin(this, diesel.game.mixin.hoverable);
		diesel.mixin.addMixin(this, diesel.game.mixin.damageable);
		diesel.mixin.addMixin(this, diesel.game.mixin.gravity);
		diesel.mixin.addMixin(this,  diesel.game.mixin.controlable);
		
		
	


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

		};
	};
	this.init(player);
}

this.units.tank.prototype = new this.units.base();

///
//	end.js
///


this.init();
};
client.prototype= diesel.proto.game;
client = new client();///
//	events.js
///
$(document).ready(function(){
	//
	$("input[name=name]").val(client.player.name);
	$("input[name=color]").val(client.player.color);
	$("input[name=game]").val(location.hash.substring(1));
	
	$("#setupForm").submit(function(e){
		console.log("settup submitted");
		e.preventDefault();
		//read the user
		client.player.name = $("input[name=name]").val();
		client.player.color = $("input[name=color]").val();
		
		diesel.events.save("player", client.player);
		client.tank = new client.units.tank(0,0,client.player);
		//connect to the game.
		var code = $("input[name=game]").val();
		if(code.length>0){

			//connect
			var msg= new client.messages.joinGame($("input[name=game]").val(),client.player);
			client.connection.send(msg);

			//hide setup &show game
			//$("#setup").hide();
			client.draw();
			//$("#game").show();

		}	
		
		
		return false;
	});
	$("input[name=ready]").change(function(e){
		client.player.ready = $("input[name=ready]").is(":checked");
		var msg = new client.messages.playerStateChange(client.player, client.networkGame.serverId);
		
		client.connection.send(msg);
	});


	$("input[name=angle]").change(function(e){
		var angle = parseInt($("input[name=angle]").val());

		angle  = Math.max(Math.min(angle,90), -90);
		angle  = angle *-1;

		client.tank.aim = diesel.radians(angle)+Math.PI;
		$("#angledisplay").html(angle);
		client.draw();
		var msg = new client.messages.gameUpdate();
		msg.message = {"aim":client.tank};
		client.connection.send(msg);

	});
	$("input[name=power]").change(function(e){
		var power = parseInt($("input[name=power]").val());
		if (client.tank.mans *10 < power){
			power= client.tank.mans *10;
			$("input[name=power]").val(power);
		}

		client.tank.power = power;
		$("#powerdisplay").html (power);
		client.draw();
		var msg = new client.messages.gameUpdate();
		msg.message = {"aim":client.tank};
		client.connection.send(msg);


	});

	$("#gameControls").submit(function(e){
		e.preventDefault();

		//send the fire command to the server.
		var msg = new client.messages.gameUpdate();
		msg.message = {"fire":client.tank};
		client.connection.send(msg);

		
	});
});

