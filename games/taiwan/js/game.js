/*
This is the base game object that contains all the game data..

*/
var game ={
	container:"game",
	version:"v 1",
	width: 640,
	height: 400,
	fontsize:16,
	font:"16px monospace",	
	ticks:0,
	directions:{
		up:0,
		down: Math.PI,
		left: Math.PI/2,
		right: Math.PI/2*3,
	},
	keys:{
		"left":37, 
		"right":39,
		"up":38,
		"down":40,
		"use":32,
		"sheet":73,
		"item":17
		
		
	},
	keysDown:{
		"left":false, 
		"right":false,
		"up":false,
		"down":false,
		"use":false,
		"sheet":false,
		"item":false
	},
	settings:{
		screen:"menu",
		dataDirectory:"data",
		
	},
	context:{
		back:false,
		main:false,
		vfx:false
	},
	events:{
		"startup":function(){
			document.getElementById(game.container).focus();
			game.objects.player = new game.objects.playerBase();
			var savedhs = game.util.highScores= diesel.load("highScores");
			if(savedhs){
				game.util.highScores = savedhs;
			}
		},
		"draw":function(event){
			game.screens[game.settings.screen].draw(event.args[0]);
		},
		"update":function(event){
			game.ticks++;
			game.screens[game.settings.screen].update(event.args[0]);
			
			if(game.log.length != game.util.loglength){
				var ele = document.getElementById("log");
				
				if(ele){
					
					var logadds = "";
					for(var i = game.util.loglength; i<game.log.length;i++){
						logadds = "<p>"+game.log[i]+"</p>"+logadds;
						console.log(game.log[i]);
					}

					ele.innerHTML = logadds +ele.innerHTML;
				}
				
			}
			game.util.loglength = game.log.length;
			if(game.ticks %100 ==0 && game.ticks -1 != diesel.frameCount){
				console.log("@",game.ticks, diesel.frameCount);
			}
		},
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
		"keydown": function(event){
			for(keyname in game.keys){
				if(event.keyCode == game.keys[keyname]){
					game.keysDown[keyname] =true;
					event.preventDefault();
				}
			}
			if(game.screens[game.settings.screen].keydown){
				game.screens[game.settings.screen].keydown(event);
			}
				
		},
		"keyup":function(event){
			for(keyname in game.keys){
				if(event.keyCode == game.keys[keyname]){
					game.keysDown[keyname] =false;
					event.preventDefault();
				}
			}	
			if(game.screens[game.settings.screen].keyup){
				game.screens[game.settings.screen].keyup(event);
			}
		},
		"upLevelCheck":function(event){
			game.context.vfx.fillStyle = "#ffffff";
			game.context.vfx.fillRect(0,game.height,game.width,game.objects.player.h*-1);
			game.context.vfx.fillStyle = "#000000";
			if(game.screens.inGame.currentLevel >0){
				game.context.vfx.fillText("Press use to go up", 0,game.height);
			}
			else{
				game.context.vfx.fillText("Press use to flee the dungeon.",0,game.height);
			}
		},
		"downLevelCheck":function(event){
			game.context.vfx.fillStyle = "#ffffff";
			game.context.vfx.fillRect(0,game.height,game.width,game.objects.player.h*-1);
			game.context.vfx.fillStyle = "#000000";
			game.context.vfx.fillText("Press use to go down", 0,game.height);
		},
		"downLevel":function(event){
			if(game.screens.inGame.currentLevel +1 == game.screens.inGame.levels.length){
				game.screens.inGame.addLevel(event.x,event.y);
			}
			game.screens.inGame.currentLevel++;
			game.log.push("went down to level "+game.screens.inGame.currentLevel);
			
		},
		"upLevel":function(event){
			if(game.screens.inGame.currentLevel > 0){
				game.screens.inGame.currentLevel--;
				game.log.push("went up to level "+game.screens.inGame.currentLevel);
			}
			else{
				
				if(game.objects.player.hasGoal){
					diesel.raiseEvent("screenChange","inGame","wonGame");
				}
				
			}
		},
		"fountainCheck":function(event){
			if(game.objects.player.health < game.objects.player.healthMax){
			game.context.vfx.fillStyle = "#ffffff";
			game.context.vfx.fillRect(0,game.height,game.width,game.objects.player.h*-1);
			game.context.vfx.fillStyle = "#000000";
			game.context.vfx.fillText("Press use to drink water from the fountain", 0,game.height);
		
			}
			else{
			game.context.vfx.fillStyle = "#ffffff";
			game.context.vfx.fillRect(0,game.height,game.width,game.objects.player.h*-1);
			game.context.vfx.fillStyle = "#000000";
			game.context.vfx.fillText("it's a fountain", 0,game.height);
		
			}
		},
		"fountain":function(event){
			if(game.objects.player.health < game.objects.player.healthMax){
				game.log.push("You drink from the fountain, restoring your health");
				game.objects.player.health = game.objects.player.healthMax;
				
			}
		},
		"collision": function(event){
			//the player has struck a projectile.
			game.objects.player.onCollision(event.args[0]);
			event.args[0].onCollision();
		
			
		},
		"goalCheck":function(event){
			game.context.vfx.fillStyle = "#ffffff";
			game.context.vfx.fillRect(0,game.height,game.width,game.objects.player.h*-1);
			game.context.vfx.fillStyle = "#000000";
			game.context.vfx.fillText("What is this?", 0,game.height);
			game.objects.player.health = game.objects.player.healthMax;
			game.screens.inGame.removeTile(game.objects.player.x, game.objects.player.y,true);
			game.objects.player.hasGoal =true;
			game.log.push("You found it!");
			game.objects.player.score =game.objects.player.score *2;
			
			diesel.raiseEvent("screenChange","inGame", "goal");
		}
		
	},
	objects:{},
	screens:{},
	preload:[],
	util:{
		"loglength":0,
		"highScores":[],
		"getHighScores":function(){
			return game.util.highScores;
		
		},
		"addHighScore":function(initials){
			if(!game.util.highScores){
			game.util.highScores =[];
			}
			var name = game.objects.player.name;
			if(initials){
				name = initials;
			}
			var score = game.objects.player.score;
			var i =0;
			while(i<game.util.highScores.length && game.util.highScores[i].score >=score){
				i++;
			}
			game.util.highScores.splice(i,0,{
				"score":score,
				"name":name,
				"level": game.screens.inGame.currentLevel,
				"goal":game.objects.player.hasGoal});
			
			diesel.save("highScores", game.util.highScores);
			
			
			return i+1;
		}
	},
	state:{
	},
	log:[]
};

