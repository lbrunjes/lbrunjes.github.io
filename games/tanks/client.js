// built at Tue 06 Jan 2015 01:30:01 PM EST
///
//	index.js
///

var client= function(host){
	this.tank=null;
	this.player = null;
	this.level=null;
	this.width =640;
	this.height =240;
	this.waiting=true;


	this.context={"tank":true};
	this.connection = null
	this.messageHost = host ||"ws://housemark.co:9000";

	this.screens = {
		"webclient":{
			"draw":function(){},
			"update":function(){},
			"readNetMessage":function(msg){

				if(msg.message){
					
					if(msg.message.heartbeat){
						///??
					}
					else{
						console.log("message", msg)
					}

					if(msg.message.nextTurn){
						for(var i = 0 ;i < msg.message.nextTurn.tanks.length;i++){
							if(msg.message.nextTurn.tanks[i].player === client.player.name){
								 //TODO let the player know it's their turn.
								 if(msg.message.nextTurn.tanks[i].isActive){

								 }

								 client.tank.health = msg.message.nextTurn.tanks[i].health;

							}
						}
					}

					if(msg.message.newLevel){
						client.waiting =false;
						for(var i = 0 ;i < msg.message.newLevel.tanks.length;i++){
							if(msg.message.newLevel.tanks[i].player=== client.player.name){
								//set the local clien to match
								$("input[name=angle]").val(diesel.degrees(msg.message.newLevel.tanks[i].aim -Math.PI));
								$("input[name=power]").val(msg.message.newLevel.tanks[i].power);
								$("input[name=angle]").change();
								$("input[name=power]").change();
								$("#babyMissile").click();
								client.draw();
								$("#gameControls").show();
								$("#buying").hide();


							}


						}
					}
					if(msg.message.endLevel){
						
						$("#gameControls").hide();
						$("#buying").show();
					}

					if(msg.message.players){
						//TODO check my inventory
						for(var i = 0 ;i < msg.message.players.length;i++){
							if(msg.message.players[i].name === client.player.name){
								client.player.weapons = msg.message.players[i].weapons;
								client.player.cash = msg.message.players[i].cash;
								client.draw();
							}
						}
					}
				}

			},
			"netError":function(data){
				if(data.message =="no such game"){
					$("#game").hide();
					$("#setup").show();
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
			this.player.name = player.name;
			this.player.color = player.color;
		}else{
			console.log("using defaults");
		}

		
		
	};
	this.startup = function(){
		console.log("startup");

		
	}


 	this.draw = function(){
 		client.context.tank.fillStyle = "#000";
 		client.context.tank.fillRect(0,0, client.width, client.height);

 		client.context.tank.save();
 		client.context.tank.translate(client.width/2, client.height/3*2);
 		client.context.tank.scale(4,4);


 		this.tank.draw(diesel.game.context.tank, true);
 		client.context.tank.restore();

 		//draw the aim, power, and health
 		client.context.tank.fillStyle = "#fff";
 		client.context.tank.fillText("AIM:"+Math.round(diesel.degrees(client.tank.aim)), diesel.game.width-75,25);
 		client.context.tank.fillText("POW:"+client.tank.power, diesel.game.width-75,50);
 		client.context.tank.fillText("HLT:"+client.tank.health, diesel.game.width-75,75);
 		client.context.tank.fillText("$$$:"+client.player.cash, diesel.game.width-150,200);

 		//draw how much of each item you have?
 		var x =1;
 		for(var wep in client.player.weapons){
 			var txt= client.player.weapons[wep] + " " + client.weapons[wep].name;

 			if(wep === client.tank.weapon){
 			 txt = "["+txt+"]";
 			}
 			else{
 			txt = " "+txt+" ";	
 			}

 			client.context.tank.fillText(txt, 25, 25 *x);
			x++; 			 

 		}

 		//notifiy the player they have joined but will not enter the game until the next round
 		if(client.waiting){
 			client.context.tank.fillText("You will enter the game when the next round starts", 25, game.height-25);	
 			
 		}


		$("#status").html(
		this.player.name+
		" "+this.network.states[this.connection.readyState]);
		$("#dollas").html( "$"+this.player.cash);;
	};

	




///
//	network.js
///

this.network = {
	states : ["CONNECTING", "Connected", "CLOSING","CLOSED"],
	onOpen :function(){
		console.log("connected to websocket host", client.messageHost);
		client.connection.onmessage = client.network.routeMessage;
		client.connection.onerror = client.network.onError;
		client.connection.onclose = client.network.onClose;


	},
	onError:function(data){

		console.log("network error:", data);
	},
	onClose :function(data){
		
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
		if(diesel.game.screens && 
			diesel.game.screens[diesel.game.activeScreen] &&
			diesel.game.screens[diesel.game.activeScreen].netError ){
			diesel.game.screens[diesel.game.activeScreen].netError(data)
		}
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
		
		var onground= diesel.game.level.collides(this.x, this.y+this.h/2+1);
		


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
			context.fillRect(this.w/16*-5,this.h/-3,this.w/8,this.h/4);
			context.fillRect(this.w/16*-1,this.h/-3,this.w/8,this.h/4);
			context.fillRect(this.w/16 *3,this.h/-3,this.w/8,this.h/4);

			
			
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
		start:1,
		radius:45,
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
		radius:30,
		cost:100,
		name:"Funky Bomb"
	}

};


///
//	end.js
///


this.init();
};
client.prototype = new diesel.proto.game ();
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
		//we need to reinitialize the player per connect attempt mor bad times happen.
		client.player = new client.objects.player();
	
		

		client.player.name = $("input[name=name]").val();
		client.player.color = $("input[name=color]").val();


		
		diesel.events.save("player", client.player);
		client.tank = new client.units.tank(0,0,client.player);
		//connect to the game.
		var code = $("input[name=game]").val();
		if(code.length>0){

			//connect
			var msg= new client.messages.joinGame($("input[name=game]").val().toLowerCase(),
				client.player);
			client.connection.send(msg);

			//hide setup &show game
			$("#setup").hide();
			client.draw();
			$("#game").show();
			$("#status").attr("style", "color:"+client.player.color);



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
		client.draw();
		// validate the request
		if(client.player.weapons[client.tank.weapon] > 0){
			client.player.weapons[client.tank.weapon]--;

			//send the fire command to the server.
			var msg = new client.messages.gameUpdate();
			msg.message = {"fire":client.tank};
			client.connection.send(msg);
		}
		else{
			alert("you are fresh out of " +client.tank.weapon);
			//TODO sound;
		}

		
	});

	$("a.plus").click(function(e){
	
		var inpt = $("input[name="+$(this).closest("label").attr("for")+"]");
		inpt.val(parseInt(inpt.val())+1);
		inpt.change();
		e.preventDefault();
	});
	$("a.minus").click(function(e){
		var inpt = $("input[name="+$(this).closest("label").attr("for")+"]");
		inpt.val(parseInt(inpt.val())-1);
		inpt.change();
		e.preventDefault();
	});


	//add items
	var items = "",buttons= "";;

	for(var wep in client.weapons){
		items += 
		'<div class="item" item="'+wep+'" cost="'+client.weapons[wep].cost+
		'"><a href="#">'+client.weapons[wep].name +'</a> $'+
		client.weapons[wep].cost+'</div>';

		buttons+= '<button id="'+wep+'">'+client.weapons[wep].name+"</button>"

	}


	$("#items").html(items);
	$("#weapons").html(buttons);


	$("#weapons button").click(function(e){
		$("#weapons button").removeClass("selected");
		client.draw();
		var $this = $(this), text = $this.attr("id");
		if(client.player.weapons[text] > 0){
			client.tank.weapon = text;
			
			$this.addClass("selected");
		}
		else{
			
			client.tank.weapon = "babyMissile";
			$("#weapons button:first").addClass("selected");
			
		}

	});



	$("div.item a").click(function(e){
		console.log("xx");
		e.preventDefault();
		//get the item details
		var item = $(this).closest("div.item").attr("item"),
		cost = client.weapons[item].cost;

		// do we have the $$
		if(client.player.cash >= cost){

			//deduct the $$$
			client.player.cash -= cost;

			//add an item to our request
			if(!client.player.weapons[item]){
				client.player.weapons[item] =1;
			}
			else{
				client.player.weapons[item]++;
			}

			//send the request.
			var msg = new client.messages.gameUpdate();
			msg.message = {"buy":item};
			msg.player = client.player;

			client.connection.send(msg);

			client.draw();
		}
		else{
			alert("You ain't got that much cash");
		}

	});


	$("#buying").hide();



	$(window).bind("beforeunload",function(e){
		console.log("closed window");
		client.connection.close();

	});
	
	
});

