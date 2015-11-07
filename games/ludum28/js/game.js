/*
This is teh base game object taht contains all the game data..

*/
var game ={
	container:"game",
	version:"v 1",
	width: 800,
	height: 600,
	fontsize:32,
	font:"30px daniel, sans-serif",	
	up:0,
	down: Math.PI,
	left: Math.PI/2,
	right: Math.PI/2*3,
	score: 0,
	keys:{
		"left":37, 
		"right":39,
		"up":38,
		"down":40,
		"use":32
		
	},
	keysDown:{
		"left":false, 
		"right":false,
		"up":false,
		"down":false,
		"use":false
	},
	settings:{
		screen:"menu",
		level:"home",
		dataDirectory:"data",
		
	},
	progress:{
		"mall":0,
		"forest":0,
		"stadium":0
	},
	
	hearts:5,
	maxHearts:5,
	
	
	context:{
		back:false,
		main:false,
		vfx:false
	},
	setup:function(){
		document.getElementById(game.container).focus();
		game.objects.player = new game.objects.player();
			
	},
	events:{
		"click":function(evt){
			if(game.screens[game.settings.screen] &&
					game.screens[game.settings.screen].click){

				game.screens[game.settings.screen].click(evt);
			}
			else{
				game.context.vfx.fillText("No Scene: "+game.settings.screen, diesel.mouseX, diesel.mouseY);
				evt.preventDefault();
			}
		},
		"screenChange":function(event){
			var from = event.args[0], to = event.args[1], transition = event.args[2]|| false;
			console.log(from, to, transition);

			game.screens[from].close();
			if(transition){
				game.screens[transition].reset(from, to);
				game.screens[transition].open();
				game.settings.screen = transition;
			}
			else{
				game.screens[to].reset();
				game.screens[to].open();
				game.settings.screen = to;
			}
		
		},
		"keydown":function(event){
//			alert("key"+event.keyCode);
			if(game.screens[game.settings.screen] &&
					game.screens[game.settings.screen].keydown){
				game.screens[game.settings.screen].keydown(event);
			}
		},
		
		"keyup":function(event){
				if(game.screens[game.settings.screen] &&
					game.screens[game.settings.screen].keyup){
				game.screens[game.settings.screen].keyup(event);
			}

		},
		"collision":function(event){
			game.objects.player.collideTimer = game.objects.player.collideImmuneTime;
			if(game.objects.player.item.type != "banana"){ 
				game.hearts--;
				game.score -=500;
				if(game.hearts <=0){
						console.log("gg");
						diesel.raiseEvent("screenChange","level","endGame",false);				
				}
				//TODO trigger sounds
			
			}
			else{
				//TODO banana things
				game.objects.player.item.sprite.animation = "closed";
			}
			
		},
		"levelChange":function(event){
			var from = event.args[0], to = event.args[1], transition = event.args[2] || "levelChange";
			console.log("lvl",from, to, transition);
			
			game.screens.level.prev= from;
			game.settings.level =to;
			
			diesel.raiseEvent("screenChange","level","level",transition);

		
		}
		
	},

	objects:{
		//for 
	},
	screens:{
		// used to draw a screen
	},
	assets:{
		tiles:[],
		entities:{
			"cafe":function(player){
				diesel.raiseEvent("levelChange",game.settings.level, "forest", null);
				
			},		
			"forest":function(player){
				diesel.raiseEvent("levelChange",game.settings.level, "forest", null);
				
			},
			"mall":function(player){
				diesel.raiseEvent("levelChange",game.settings.level, "mall", null);
				
			},
			"stadium":function(player){
				diesel.raiseEvent("levelChange",game.settings.level, "stadium", null);
			
				
			},
			"home":function(player){
				/*	if(! confirm("Go Back?\n\nYou only get one chance at this level.")){
						game.objects.player.y += game.screens.level.grid;
						return;
						
					}*/
					diesel.raiseEvent("levelChange",game.settings.level, "home", null);
					
					var done =true;
					for(var key in game.progress){
						done = done && game.progress[key];
					}
					
					if(done){
						console.log("You have been everywhere man");
						diesel.raiseEvent("screenChange","level","endGame");
					}
									
			},
			4:function(player){
				//				star
				var nearby =0,score = 10000, aloneenough = 3;
				//test to see if you are alone
				//if not adjust score
				for(var i =0 ;i < game.screens.level.units.length;i++){
				 if(game.screens.level.units[i].manhattanDistance(player.x, player.y) < player.tooClose){
				 	nearby++;
				 	if(game.objects.player.item.type != "fan"){
				 		score =score /2;
				 	}
				 	else{
				 		score = score *.75;
				 	}
				 }
				}
				
				if(nearby <= aloneenough){
				 game.score += score;
				 game.progress[game.settings.level] +=score;
				 //TODO Text effect
				}
				
				var loc = game.screens.level.getGridRef(player.x, player.y);
				game.screens.level.current.entities[loc[1]][loc[0]] = 5;
				
				
				
				
				
				
			}
		}
	},
	preload:[
		{"image":"logo.png"},	
		{"sprite":"tiles.png","size":[32,32],"keys":{},"frames":1},
		{"sprite":"ents.png","size":[32,32],"keys":{},"frames":4},
		{"sprite":"hearts.png","size":[64,64],"keys":{"full":0,"empty":1},"frames":4},
		{"sprite":"prep.png","size":[64,64],"keys":{"used":0,"active":0},"frames":1},
		{"sprite":"player.png","size":[64,64],"keys":{"walk":0,"hurt":1},"frames":1},
		{"sprite":"banana.png","size":[64,64],"keys":{"used":0,"active":1},"frames":4},
		{"sprite":"band.png","size":[64,64],"keys":{"used":0,"active":0},"frames":4},
		{"sprite":"cheer.png","size":[64,64],"keys":{"used":0,"active":0},"frames":4},
		{"sprite":"grease.png","size":[64,64],"keys":{"used":0,"active":0},"frames":1},
		{"sprite":"headphones.png","size":[64,64],"keys":{"active":0,"used":0},"frames":1},
		{"sprite":"fan.png","size":[64,64],"keys":{"active":0,"used":1},"frames":4}
		
	],
	util:{
		"getLevel":function(id){
			console.log("loading level", id);
			var lvl =diesel.ajax("level/"+id+".json");
			game.screens.level.current = JSON.parse(lvl);
			},
		
		"ignore":function(e){
			e.preventDefault();
		}
		
		
		
	},
	state:{
	
	}
};

