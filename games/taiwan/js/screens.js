/*
	Screens.js
	2014 Lee Brunjes
	lee.brunjes@gmail.com
	Each of these screens provides render and update consumer for the engine
	as well as input handling.
*/

game.screens.menu = function(){
	this.clickZones = [
		{x:32,y:128,w:256,h:128,"click":function(){
				diesel.raiseEvent("screenChange","menu","inGame");
				

		}},
		{x:352,y:128,w:256,h:128,"click":function(){
				diesel.raiseEvent("screenChange","menu","highScores");
				

		}}
	]
	this.options = [
		"A simple game",
		"Click to start",
		"Keys: ⇦⇩⇧⇨ [space]"

	];
	this.reset = function(){
		game.screens.inGame.levels = [];
		game.screens.inGame.currentLevel= 0;
		game.objects.player = new game.objects.playerBase();
		game.log =[];
		document.getElementById("log").innerHTML ="";
		
	}
	this.draw=function(){
		this.clearAllContexts();
		game.context.main.fillStyle="#aaa";
		game.context.main.strokeStyle="#aaa";
		game.context.main.fillText("The greatest Game:",16,32);
				game.context.main.fillText("Go for it",32,48);
		
		for(var i =0; i < this.clickZones.length;i++){
			game.context.main.strokeRect(this.clickZones[i].x,this.clickZones[i].y,
				this.clickZones[i].w,this.clickZones[i].h);
		}
		
		this.fillTextCenteredX(game.context.main,"Start",game.width/4,192);
		
		this.fillTextCenteredX(game.context.main,"Scores",game.width/4*3,192);
		var __y = game.height/4*3;
		this.fillTextCenteredX(game.context.main, "         [⇧]         ",game.width/2,__y );
		__y+=16;
		this.fillTextCenteredX(game.context.main, "Keys: [⇦][⇩][⇨]      ",game.width/2, __y);
		__y+=16;
		this.fillTextCenteredX(game.context.main, "     [i][space]     ",game.width/2, __y);
		
	};
};
//initialize
game.screens.menu.prototype = game.screens.base;
game.screens.menu = new game.screens.menu();
/*
 IN GAME
*/
game.screens.inGame =function(){
	this.scorePerLevel = 1000;
	this.levels =[];
	this.currentLevel = 0;
	
	this.reset=function(){
		//clear the contextx if needed);
		this.clearAllContexts();
		//ensure we get another level.
		if (this.levels.length < 1){	
			this.addLevel(game.objects.player.x, game.objects.player.y);
		}

		
	};
	
	this.draw = function(context){
		this.clearAllContexts();
		
		
		
		//draw the health bar
		game.context.vfx.fillStyle = "rgba(255,255,255,0.255)";
		game.context.vfx.fillRect(0,0,102,5);
		game.context.vfx.fillText(game.objects.player.score,game.width/2, 16);
		game.context.vfx.fillText("lvl:"+this.currentLevel,game.width-64, 16);
		game.context.vfx.fillStyle = "rgba(255,0,0,0.5)";
		game.context.vfx.fillRect(1,0,100* (game.objects.player.health/game.objects.player.healthMax),4);
		
		
		this.levels[this.currentLevel].draw(game.context.main);
		
		
	};
	this.update= function(ticks){
		game.objects.player.update(ticks);
		this.levels[this.currentLevel].update(ticks,this.currentLevel);
		
		if(game.keysDown.sheet){
			diesel.raiseEvent("screenChange","inGame","sheet");
		}
		
	};
	this.getTileAndUnitData=function(x,y,snap){
	
		var tile = this.getTileData(x,y,snap);
		if(tile == this.levels[this.currentLevel].icon.empty){
			for(var i = 0; i < this.levels[this.currentLevel].units.length;i++){
				if(this.levels[this.currentLevel].units[i].contains(x,y)){
					tile = this.levels[this.currentLevel].units[i].icon;
				}
			}
			if(tile != this.levels[this.currentLevel].icon.empty){
				console.log(tile);
		
				tile = this.levels[this.currentLevel].icon.wall;
			}
		} 

		
		
		return tile;
	};
	
	this.getTileData= function(x,y,snap){
		if (snap){
			x = Math.round(x/this.levels[this.currentLevel].grid.x);
			y = Math.round(y/this.levels[this.currentLevel].grid.y);
		}
		if(x < 0 || y < 0 
			|| y >= this.levels[this.currentLevel].data.length
			|| x >= this.levels[this.currentLevel].data[0].length){
				return this.levels[this.currentLevel].wallIcon;
			}
		
		 var tile =  this.levels[this.currentLevel].data[
			Math.round(y)][
			Math.round(x)]; 
			
		if(tile == this.levels[this.currentLevel].icon.empty){
			//Check the units and players
			var units = this.levels[this.currentLevel].units
			for (var i = 0; i < units.length;i++){
				if(Math.round(units[i].x/this.levels[this.currentLevel].grid.x)== x && 
				Math.round(units[i].y/this.levels[this.currentLevel].grid.y)== y ){
				 tile = units[i].icon;
				}
			}
		}
		return tile;
	};
	this.addLevel =function(x,y){
		diesel.debug=true;
		this.levels.push(new game.objects.level(this.levels.length, x,y));
		game.objects.player.score += this.scorePerLevel;
		diesel.debug=false;
	}
	this.current=function(){
		return this.levels[this.currentLevel];
	}
	this.removeTile= function(x,y,snap){
		this.setTile(this.levels[this.currentLevel].icon.empty,x,y,snap);
	}
	this.setTile = function(icon,x,y,snap){
		if (snap){
			x = Math.round(x/this.levels[this.currentLevel].grid.x);
			y = Math.round(y/this.levels[this.currentLevel].grid.y);
		}
		if(x < 0 || y < 0 
			|| y >= this.levels[this.currentLevel].data.length
			|| x >= this.levels[this.currentLevel].data[0].length){
				return;
		}
		this.levels[this.currentLevel].data[y][x] = icon;
		
	}
}
game.screens.inGame.prototype= game.screens.base;
game.screens.inGame = new game.screens.inGame();



/*
Game INTRO
*/
game.screens.gameIntro = function(){

this.clickZones=[
		{x:0,y:0,w:game.width,h:game.height,"click":function(){
				game.screens.gameIntro.i++;
				game.screens.gameIntro.lastScreen = 0;
			}
		}

	]

this.reset = function(from, to){
	this.to= to;
	this.i = 0;
	this.clearAllContexts();
}

this.i=0;

this.to;
this.lastScreen =0;
this.screenTime = 5000;

this.draw =function(){
	//TODO DRAW AN INTO instead of a descdning line.
		this.clearAllContexts();
		if(this.screens[this.i]){
			this.drawScreen(game.context.vfx,this.screens[this.i], 32,32,game.width-64, game.height-64,48);
		}
}
this.update= function(ticks){
	
	if(this.i >= this.screens.length){
		diesel.raiseEvent("screenChange","gameIntro", this.to);	
	}
}

this.screens =[
{
	text:[	"This is you:",		"You are seeking solitude",		"Avoid the probing stares ","of other people.","","Certainly don't talk to them.","Definately don't touch them."	],
	sprite:{		name:"player.png",		idx:0	}
}

];

}
game.screens.gameIntro.prototype = game.screens.base;
game.screens.gameIntro= new game.screens.gameIntro();

/*
INVENTROY
*/
game.screens.sheet = function(){
this.clickZones = [];
this.draw =function(){
	this.clearAllContexts();
	var healthpct = game.objects.player.health/ game.objects.player.healthMax;
	if(healthpct> .75){
		game.context.vfx.fillStyle= "#00ff00";
	
	}
	else if(healthpct<.25){
		game.context.vfx.fillStyle= "#ff0000";
	}
	else{
		game.context.vfx.fillStyle= "#ffffff";
	}
	game.context.vfx.fillText(game.objects.player.health + " / "+
		game.objects.player.healthMax,128,48);
	
	game.context.vfx.fillStyle= "#ffffff";
	game.context.vfx.fillText("Inventory/character sheet.",0,32)
	
	game.context.vfx.fillText("Health(身體): ",0,48);
	game.context.vfx.fillText("Item(项): ",0,64);
	if(game.objects.player.weapon){
		game.context.vfx.fillText(game.objects.player.weapon.name,128,64);
	}
	game.context.vfx.fillText("Inventory(库存):", 0,96);
	
	
	
	//draw the items.
	
	
	
}

this.update = function(){
	if(game.keysDown.sheet){
			diesel.raiseEvent("screenChange","sheet", "inGame");	
	
	}
}

}
game.screens.sheet.prototype = game.screens.base;
game.screens.sheet= new game.screens.sheet();

/*
 FADE TO RED
*/
game.screens.fadeToRed= function(){

this.frames = 5;
this.reset = function(from, to){
	this.to= to;
	this.i = 0;
}
this.draw= function(){
	game.context.vfx.fillStyle = "rgba(255,0,0,.2)";
	game.context.vfx.fillRect(0,0,game.width, game.height);
}
this.update= function(ticks){
	this.i++;
	
	if (this.i >= this.frames){
		diesel.raiseEvent("screenChange","fadeToRed", this.to);	
	}

}

}
game.screens.fadeToRed.prototype = game.screens.base;
game.screens.fadeToRed= new game.screens.fadeToRed();

//DEAD

game.screens.dead = function(){
	this.rank = false;
	this.i =0;
	this.name =["A","A","A"];
this.clickZones = [
	{x:0,y:0,w:game.width,h:game.height,"click":function(){
				if(this.rank>=0){
					diesel.raiseEvent("screenChange","dead","menu");
				}

			}}];
			
	this.reset=function(){
		this.rank=false;
	}
	
	this.draw= function(){
		
		
		game.context.vfx.fillStyle = "rgba(255,0,0,1)";
		game.context.vfx.fillRect(0,0,game.width, game.height);
		game.context.vfx.fillStyle= "#ffffff";
		var font = game.context.vfx.font;
		game.context.vfx.font = "128px monospace";
		this.fillTextCenteredX(game.context.vfx,"死",game.width/2,game.height/2-64);
		game.context.vfx.font = font;
		game.context.vfx.fillStyle= "#000000";
		this.fillTextCenteredX(game.context.vfx,
			"You are DEAD",game.width/2,game.height/2-32);
		this.fillTextCenteredX(game.context.vfx,
			game.objects.player.score+" points.",game.width/2,game.height/2);
		if(this.rank){
			
			this.fillTextCenteredX(game.context.vfx,
				this.name.join("") +" is the #"+this.rank+" player of all time",
				game.width/2,game.height/2+16);
		
		}
		else{
			this.fillTextCenteredX(game.context.vfx,
				"ENTER YOUR INITALS:"+this.name.join(""),game.width/2,game.height/2+16);
			this.fillTextCenteredX(game.context.vfx,
				"Then press enter",game.width/2,game.height/2+32);
		
		}
	};
	this.keydown =function(event){
		if(!this.rank){
			if(event.keyCode == 13){
				this.rank = game.util.addHighScore(this.name.join(""));
			
			}else{	
				this.name[this.i] = diesel.getKeyName(event.keyCode).substring(0,1);
				this.i = (this.i +1)%this.name.length;
			}
		}else{
			diesel.raiseEvent("screenChange","wonGame","menu");
		}
	
	}
}
game.screens.dead.prototype= game.screens.base;
game.screens.dead = new game.screens.dead();

//GOAL

game.screens.goal = function(){
	this.clickZones = [
		{x:0,y:0,w:game.width,h:game.height,"click":function(){
					diesel.raiseEvent("screenChange","goal","inGame");
					

			}}];

	this.reset=function(){
	
	};
	this.draw= function(){
		game.context.vfx.fillStyle= "rgba(0,0,0,"+diesel.frameCount%100/100+")";
		game.context.vfx.clearRect(0,0,game.width,game.height);
		game.context.vfx.fillRect(0,0,game.width,game.height);
		
		game.context.vfx.fillStyle= "#ffffff";
		var font = game.context.vfx.font;
		game.context.vfx.font = "128px monospace";
		this.fillTextCenteredX(game.context.vfx,"愛",game.width/2,game.height/2-64);
		game.context.vfx.font = font;
		game.context.vfx.fillStyle= "#ffffff";
		this.fillTextCenteredX(game.context.vfx,"You found it",game.width/2,game.height/2-32);
		this.fillTextCenteredX(game.context.vfx,"Now you need to escape the dungeon",game.width/2,game.height/2-16);
		
	};
	this.update =function(ticks){
		
		
	};
	this.keydown=function(event){
		diesel.raiseEvent("screenChange","goal","inGame");
	};
}
game.screens.goal.prototype= game.screens.base;
game.screens.goal = new game.screens.goal();


//WonGame

game.screens.wonGame = function(){
	this.rank = false;

	this.name = ["A","A","A"];
	this.i = 0;
this.clickZones = [
	{x:0,y:0,w:game.width,h:game.height,"click":function(){
				if(this.rank){
					diesel.raiseEvent("screenChange","wonGame","menu");
				}	

			}}];

	this.reset=function(){
		this.rank=false;
	}
	this.draw= function(){
			
		game.context.vfx.fillStyle = "rgba(255,0,0,1)";
		game.context.vfx.fillRect(0,0,game.width, game.height);
		game.context.vfx.fillStyle= "#ffffff";
		var font = game.context.vfx.font;
		game.context.vfx.font = "128px monospace";
		this.fillTextCenteredX(game.context.vfx,"囍",game.width/2,game.height/2-64);
		game.context.vfx.font = font;
		game.context.vfx.fillStyle= "#000000";
		this.fillTextCenteredX(game.context.vfx,"You win!!",game.width/2,game.height/2-32);
		this.fillTextCenteredX(game.context.vfx,game.objects.player.score+" points.",game.width/2,game.height/2);
		if(this.rank){
			this.fillTextCenteredX(game.context.vfx,this.name.join("")+" is the #"+this.rank+" player of all time",game.width/2,game.height/2+16);
		}
		else{
			this.fillTextCenteredX(game.context.vfx,"ENTER YOUR INITALS:"+this.name.join(""),game.width/2,game.height/2+16);
			this.fillTextCenteredX(game.context.vfx,"Then press enter",game.width/2,game.height/2+32);
			
		}
	}
	this.keydown =function(event){
		
		if(!this.rank){
			if(event.keyCode == 13){
				this.rank = game.util.addHighScore(this.name.join(""));
			
			}else{	
				this.name[this.i] = diesel.getKeyName(event.keyCode).substring(0,1);
				this.i = (this.i +1)%this.name.length;
			}
		}else{
			diesel.raiseEvent("screenChange","wonGame","menu");
		}
	
	}
}
game.screens.wonGame.prototype= game.screens.base;
game.screens.wonGame = new game.screens.wonGame();


//HIGH SCORE

game.screens.highScores =function(){
	this.scoreMax =0;
	
	this.clickZones = [
	{x:0,y:0,w:game.width,h:game.height,"click":function(){
			diesel.raiseEvent("screenChange","highScores","menu");
	}}];
	this.draw = function(){
		
		this.clearAllContexts();
		var font = game.context.vfx.font;
		game.context.vfx.font = "32px monospace";
		this.fillTextCenteredX(game.context.vfx,"High Scores", game.width/2,32);
		game.context.vfx.font =font;
		
		
		game.context.vfx.fillStyle = "#ffffff";
		game.context.vfx.fillText("Rank", 0,64);
		game.context.vfx.fillText("Name", 64,64);
		game.context.vfx.fillText("Level", 160,64);
		game.context.vfx.fillText("Score", 256,64);
		if(game.util.highScores){
			for(var i =0; i< game.util.highScores.length && i <20 ;i++){
				if(i==0){
					scoreMax = game.context.vfx.measureText(game.util.highScores[i].score).width;
				}
				space = scoreMax - game.context.vfx.measureText(game.util.highScores[i].score).width
				
				if( i < 9){
					game.context.vfx.fillText(i+1, 9,80 + i *16);
				}
				else{
					game.context.vfx.fillText(i+1, 0,80 + i *16);
				}
				game.context.vfx.fillText(game.util.highScores[i].name.substring(0,8), 64,80 + 16*i);
				game.context.vfx.fillText(game.util.highScores[i].level, 160,80 + 16*i);
				game.context.vfx.fillText(game.util.highScores[i].score, 256+space,80 + 16*i);
				
				if(game.util.highScores[i].goal){
					var fill = game.context.vfx.fillStyle;
					game.context.vfx.fillStyle = "rgba(255,0,0,"+diesel.frameCount/5%10/10+")";
			
			
					game.context.vfx.fillText("♥", 48,80 + 16*i);
					game.context.vfx.fillStyle =fill;
				}
			}
		}
		else{
			console.log("no high scores");
		}
	};
	
	this.keydown=function(event){
		diesel.raiseEvent("screenChange", "highScores", "menu");
	}

}
game.screens.highScores.prototype= game.screens.base;
game.screens.highScores = new game.screens.highScores();
