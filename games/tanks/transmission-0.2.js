// transmission built at Tue Nov 25 11:43:39 2014
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

/*
	transmission

	a node based websocekt server for diesel games
	2014 lee brunjes lee.brunjes@gmail.com
	Version 0
	
	uses: https://github.com/einaros/ws
*/


var WebSocket = require("ws"); 
	
	
var transmission = function(port){
	this.version = 0.2;
	this.debug =true;
	this.wss = null;
	this.heartbeatOn = true;
	this.broadcastHeartbeat =false;
	this.nGames = 1;

	this.games={};
	this.players=[];
	this.messages={};
	
	this.heartbeat= null;
	this.heartbeatTimer =1000;

	
	this.init = function(port){
		if(!port){
			port = 9000;
		}
		console.log("starting transmission ",this.version, "\non port:", port);
		if(this.debug){
			console.log("debug mode ON");
		}

		this.bindSocket(port);

		if(this.heartbeatOn){
			console.log("starting heartbeat");
			this.heartbeat = setInterval(function(){

				
				for(var game in transmission.games){
					if(transmission.games[game] && transmission.games[game].heartbeat){
						transmission.games[game].heartbeat();
					}
				}
			
			},this.heartbeatTimer);
		}

	}
	
	this.bindSocket =function(){
		this.wss = new WebSocket.Server({port:9000});

		this.wss.on("connection", function(sckt){
			if(transmission.debug){
				console.log("new connection");
			}
			//assign the user a color and name

			transmission.wss.clients[ transmission.wss.clients.length -1].player={"name":"unknown", color:"#000000"};


			sckt.on("message", function(msg){
				if(transmission.debug){
					console.log("received message:",msg);
				}

				try{
					var data = JSON.parse(msg);
					transmission.routeMessage(data, sckt);
				}
				catch(ex){
					console.log("Error parsing message",ex);
				}
				
			
			});
			sckt.on("close", function(msg){
				console.log("closed connection");
				transmission.drop(msg, this);
			});
		});
		

	};
	
	this.routeMessage = function(jsonMsg, socket){

		//if we ahvea  valid message process it.
		if(jsonMsg && jsonMsg.type && transmission.messages[jsonMsg.type]){
				if(transmission.debug){
					console.log("routing to message", jsonMsg.type);
				}
				transmission.messages[jsonMsg.type](jsonMsg,socket);
			}
		else{
			if(jsonMsg && jsonMsg.game && transmission.games[jsonMsg.game] ){
				if(transmission.debug){
					console.log("routing to game", jsonMsg.game);
				}
				transmission.sendToGame(jsonMsg.game, JSON.stringify(jsonMsg), socket);
					
			}
			else{
				transmission.sendError("unknown message type", socket); 
			}
		}
		

	};
	this.drop = function(msg, sckt){
	
		for(var g in transmission.games){
			if(transmission.games[g] && transmission.games[g].removeUser){
				transmission.games[g].removeUser(msg, sckt);
			}
		}
	};
	
	this.sendToGame=function(gameId, msg, socket){
		if(transmission.debug){
					console.log("sending to Game", gameId, msg);
		}
		
		for(var i = 0 ; i <transmission.wss.clients.length ;i++){

			if(transmission.clients[i].player.game == gameId){
				transmission.clients[i].send(message)
			}
			
		}

	
	};
	
	this.sendError =function(message, socket){
		
		console.log("error:",message);
		

		var error = {
			"type":"error",
			"message": "unknown error"
		};

		if(message){
			error.message = message;
		}
		if(socket){
			socket.send(JSON.stringify(error));
		}
	};

	this.broadcast = function(message){

		if(transmission.debug){
		//	console.log("broadcasting", message);
		}
		for(var i = 0 ; i <transmission.games.length ;i++){
			transmission.games[i].send(message)
		}
	}
	
	this.init(port);
};
	

transmission = new transmission();


///
//	transmission.objects
///

if(!transmission.objects){

	transmission.objects = {};
}

///
//	transmission.objects.message
///

transmission.objects.message = {
	"type":"",
	"game":"",
	"message":{},
	"player":{},
	"time":new Date()
};


//
// the following messages are created to send over the wire
// by the server.


///
//	transmission.objects.error
///

//sent for server errors
transmission.objects.error = function(message,gameid){
	this.type ="error";
	this.game = gameid;
	this.message = message;
	this.player = {
		name:"server",
		color:"#ff0000"
	};
	this.time = new Date()
};
transmission.objects.error.prototype = transmission.objects.message;

///
//	transmission.objects.broadcast
///

//sent for messages to all clients
transmission.objects.broadcast = function(message,gameid){
	this.type ="broadcast";
	this.game = gameid;
	this.message = message;
	this.player = {
		name:"server",
		color:"#ffffff"
	};
	this.time = new Date();
};
transmission.objects.broadcast.prototype = transmission.objects.message;

///
//	transmission.objects.heartbeat
///

transmission.objects.heartbeat = function(){
	this.type ="heartbeat";
	this.game = null;
	this.message = {};
	this.player = {
		name:"server",
		color:"#ffffff"
	};
	this.time = new Date();
};
transmission.objects.broadcast.prototype = transmission.objects.message;

//sent for messages to all game players
transmission.objects.gameUpdate = function(message,gameid){
	this.type ="gameUpdate";
	this.game = gameid;
	this.message = message;
	this.player = {
		name:"server",
		color:"#ffffff"
	};
	this.time = new Date();
};
transmission.objects.gameUpdate.prototype = transmission.objects.message;




//sent for messages to all clients
transmission.objects.broadcast = function(message,gameid){
	this.type ="broadcast";
	this.game = gameid;
	this.message = message;
	this.player = {
		name:"server",
		color:"#ffffff"
	};
	this.time = new Date();
};
transmission.objects.broadcast.prototype = transmission.objects.message;


//sent for messages to all clients
transmission.objects.playerStateChange = function(message,gameid){
	this.type ="playerStateChange";
	this.game = gameid;
	this.message = message;
	this.player = {
		name:"server",
		color:"#ffffff",
		ready:""
	};
	this.time = new Date();
};
transmission.objects.playerStateChange.prototype = transmission.objects.message;

///
//	transmission.objects.game
///

transmission.objects.game = function(id,type,version){

	this.players=[];
	this.sockets=[];
	
	this.id=id;
	this.serverId=null;
	this.server =null;
	
	this.ips = [];
	
	this.password = null;
	this.active =true;
	this.playerLimit = 10;

	this.type = type||"unknown";
	this.version = version||0.0;
	this.wasEmpty = false;

	this.init=function (){
		
		do{
		this.serverId = Math.floor(Math.random() *0xffff).toString(16);
		}while(transmission.games[this.serverId])
	}
	this.heartbeat =function(){
		//scan for closed sockets
		var allclosed= true;
		for(var i=0 ;i < this.sockets.length ;i++){
			allclosed = this.sockets[i].readyState ==3 && allclosed;
		}
		if(allclosed){
			//bad times.
		}


		// did the server drop? oh crap
		if(!this.server){
			//TODO ?????
		}
		
		
		// is the game emtpy
		if(this.players.length ==0 && this.sockets.length ==0){
			if (this.wasEmpty){
				//if it was empty last time too remove it.
				transmission.games[this.serverId] = null;
			}
			this.wasEmpty = true;
			console.log(this.serverId ," is empty");
		}

		//send a heartbeat
		this.send(new transmission.objects.gameUpdate({"heartbeat":this.players}, this));
	};

	this.send = function(msg){
		
		
		//send to all players
		for(var i =0; i < this.sockets.length;i++){
			if(this.sockets[i])

			this.sockets[i].send(JSON.stringify(msg),function(err){
				if(err){
				//TODO
				}
			});
		}
	}

	this.containsPlayer = function(player){

		var okay = false;

		for(var i = 0; i < this.players.length;i++){
			okay = okay || this.players[i].name == player.name;
		}
		return okay;
		
	}
	this.addPlayer =function(player, socket){
		
		console.log("joining Game", this.id, this.serverId, player.name);


		if(this.players.length >= this.playerLimit){
			transmission.sendError("game is full", socket);
		}
		if(!this.containsPlayer(player)){
			if(player.name =="server"){
				this.server = socket;
			}
			
			this.players.push(player);	
			
			
			this.sockets.push(socket);

			
			var msg = new transmission.objects.gameUpdate({"joined":player}, this);
			

			this.send(msg);
			

			
			

	
		}
		else{
			transmission.sendError("already in the game, change your name?", socket);
		}

	}
	this.removeUser =function(msg, sckt){
		for(var i = 0; i < this.sockets.length;i++){
			if(this.sockets[i]==sckt){
				console.log("dropped",this.players[i].name)
				var msg = new transmission.objects.gameUpdate({"dropped":this.players[i]}, this);
				

				this.sockets.splice(i,1);
				this.players.splice(i,1);

				this.send(msg);

				if(this.server == sckt){
					this.server = null;
					console.log("server dropped from game "+this.serverId);

				}

				if(this.players.length ==0){
					//TODO

				}
			}

		}


	}
	this.updatePlayer =function(player, sckt){
		for (var i = 0 ; i< this.sockets.length ;i++){
			if(this.sockets[i]==sckt){
				this.players[i] = player;

			}

		}

	};
	this.toJSON = function(){
			return {
				"id":this.id,
				"serverId":this.serverId,
				"playerLimit":this.playerLimit,
				"players": this.players.length,
				"password":this.password !=null,
				"version":this.version,
				"type":this.type

			};
	}

	this.init();
};
///
//	transmission.messages
///

if(! transmission.messages){
	transmission.messages = {};

}

//messages are fucntions that parse incoming messages to transmission. 
// game messages are sent to game objects


///
//	transmission.messages.listGames
///


transmission.messages.listGames = function(message, socket){
	var games = transmission.games;
	if(message.content && message.content.type && message.content.version){
		games = [];
		//add games that match
		for(var i = 0 ; i < transmission.games.length;i++){
			if(transmission.games[i].type == message.content.type &&
				transmission.games[i].version == message.content.version){
				games.push(transmission.games[i]);
			}
		}
	}


	var resp = {"type":"gameList","message":games};

	if(transmission.debug){
		console.log(JSON.stringify(resp));
	}

	socket.send(JSON.stringify(resp), function(err){console.log(err);});

};


///
//	transmission.messages.joinGame
///

transmission.messages.joinGame = function(message, socket){
	var player = message.player;
	
	if(message.message.quick){
		//TOODO scan fo thje same ip in existing games and join that game immediately.
	}


	//
	if(message.game && transmission.games[message.game]){
		transmission.games[message.game].addPlayer(message.player,socket);
	}
	else{
		transmission.sendError("no such game", socket);
	}
	
};

///
//	transmission.messages.createGame
///

transmission.messages.createGame = function(message, socket){

	if(message.game){
		console.log("Creating Game:", message.game)
		var game = new transmission.objects.game(message.game, message.content.type, message.content.version, socket);
		//game.display =socket;

		if(!transmission.games[game.serverId]){
			transmission.games[game.serverId] =game;
			transmission.games[game.serverId].addPlayer({name:"server"},socket);
		}
	
	}
	
};

///
//	transmission.messages.gameUpdate
///

transmission.messages.gameUpdate = function(message, socket){

	if(message.game && message.game.serverId && transmission.games[message.game.serverId]){
		transmission.games[message.game.serverId].send(message);
	}
	else{
		if(transmission.debug){
			console.log("no game found for that message");
		}
	}
	

};



///
//	transmission.messages.broadcast
///

transmission.messages.broadcast = function(message){

};


///
//	transmission.messages.playerStateChange
///

//allows rename and recolor

transmission.messages.playerStateChange = function(message, socket){

	if(message.game && message.player){
		transmission.games[message.game.serverId].updatePlayer(message.player, socket);
	}
	

};