/*
	Units.js
	2014 Lee Brunjes
	Unit types for the game


*/

game.objects.playerBase= function(){
this.name ="You";
this.healthMax = 10;
this.health = 10;
this.x = 320;
this.y = 200;
this.w = 16;
this.h = 16;
this.item =null;
this.r = game.down;
this.collideTimer = -10;
this.collideImmuneTime = 2000;
this.icon="我";
this.facing = "south";
this.speed = .1;
this.items =[];
this.score = 0;
this.useUp=true;
this.hasGoal=false;
this.vision = 64;
this.tileChecks={
	"上": "upLevelCheck",
	"下": "downLevelCheck",
	"泉": "fountainCheck",
	"愛": "goalCheck"
};
this.tileActions={
	"上": "upLevel",
	"下": "downLevel",
	"泉": "fountain",
	"愛": "goal"
};
this.color= "#ffffff";

this.weapon = new game.objects.weapons.fist();

this.update= function(ticks){
	var moved =false;
	this.lastMoved -=ticks;
	//snap the player to the grid.
	var level = game.screens.inGame.current();
	if(this.x % level.grid.x !==0){
		this.x  = Math.round(this.x/level.grid.x)*level.grid.x;
	}
	if(this.y % level.grid.y !==0){
		this.y  = Math.round(this.y/level.grid.y)*level.grid.y;
	}
	//are we pushing a movement key?
	
	for(var direction in game.directions){
		if(game.keysDown[direction] &&
			this.canMove(ticks, game.directions[direction], this.speed))
		{
			this.move(ticks, game.directions[direction], this.speed);
			moved = direction;
			facing = moved;
		}	
	}
	
	//check our location for stuff to do.
	var tile = game.screens.inGame.getTileData(this.x, this.y, true);
	if(tile !=" "){
		for(var events in this.tileChecks){  
			if(tile == events){
				diesel.raiseEvent(this.tileChecks[events]);
			}
		}
	}
	
	//are we using a tile?
	if(game.keysDown.use && this.tileActions[tile] && this.useUp){
		diesel.raiseEventObject(this.tileActions[tile],{x:this.x, y:this.y});
		this.useUp =false;
	}
	
	if(!game.keysDown.use){
		this.useUp =true;
	}
	//check out weapon
	if(this.weapon){
		this.weapon.update(ticks);
		
		if(game.keysDown.item && this.weapong.canFire()){
			this.weapon.fire(ticks, this);
			game.log.push("You use "+ this.weapon.name);
		}
	}
	
	
	//are we dead?
	if(this.health <=0){
		game.log.push("You Died");
		diesel.raiseEvent("screenChange","inGame","dead","fadeToRed");
	}
}

this.dropItem=function(index){
	if(index >== 0 && index < this.items.length){
		var item = this.items.splice(index,0);
		item.x =this.x;
		item.y =this.y;
		game.screens.inGame.current().units.push(item);
	}
}

}
game.objects.playerBase.prototype = new game.objects.units.base();


game.objects.monster = function(x,y){
	this.icon ="妖";
	this.name ="monster";
	this.x = x;
	this.y = y;
	this.weapon =new game.objects.weapons.sword();
}
game.objects.monster.prototype = new game.objects.units.base();

game.objects.dog = function(x,y){
	this.icon ="狗";
	this.name ="dog";
	this.x = x;
	this.y = y;
	this.weapon =new game.objects.weapons.bite();
}
game.objects.dog.prototype = new game.objects.units.base();

game.objects.fly = function(x,y){
	this.icon ="蒼";
	this.name ="fly";
	this.x = x;
	this.y = y;
	this.weapon =new game.objects.weapons.bite();
}
game.objects.fly.prototype = new game.objects.units.base();


game.objects.witch = function(x,y){
	this.icon ="巫";
	this.name ="witch";
	this.x = x;
	this.y = y;
	this.weapon = new game.objects.weapons.curse();
	
	//todo rewrite update function;
	this.update= function(ticks, id){
		if( id!= undefined){
			this.id = id;
		}
		
	
		//move in a direction toward the player
		var playerY = this.y - game.objects.player.y;
		var playerX = this.x - game.objects.player.x;
		var vert = Math.abs(playerY) > Math.abs(playerX);
		var dist = Math.abs(playerY) + Math.abs(playerX)
		
		//TODO real path finding
		if(vert){
			if(playerY > 0){
				this.facing = "up";
			}
			else{
				this.facing = "down"
			}
		}
		else{
			if(playerX < 0){
				this.facing = "right";
			}
			else{
				this.facing = "left"
			}
			
		}
		
		this.lastMoved -= ticks;
		
		//moving requires a can move check doing it twice is dumb
		if(dist >0){
			this.move(ticks, this.facing, this.speed);
		}	
		
		//shoot if needed.
		if(this.weapon){
			//console.log(this.weapon, this.weapon.canFire(ticks));
			
			this.weapon.update(ticks);
			if(this.weapon.canFire(ticks) && dist < this.weapon.range ){
				this.weapon.fire(ticks, this, game.objects.player);	
				game.log.push(this.name + " attacks with " +this.weapon.name);
			} 
		}
	};
	
}
game.objects.witch.prototype = new game.objects.units.base();

game.objects.boar = function(x,y){
	this.icon = "彘";
	this.name = "boar";
	this.x = x;
	this.y = y;
	this.weapon = new game.objects.weapons.bite();
	
	//boars are stationary
	this.update= function(ticks, id){
		if( id!= undefined){
			this.id = id;
		}
		
	
		//move in a direction toward the player
		var playerY = this.y - game.objects.player.y;
		var playerX = this.x - game.objects.player.x;
		var vert = Math.abs(playerY) > Math.abs(playerX);
		var dist = Math.abs(playerY) + Math.abs(playerX)
		
		
		
		this.lastMoved -= ticks;
		
		//moving requires a can move check doing it twice is dumb
		if(dist < game.objects.player.visible -1){
			this.move(ticks, this.facing, this.speed);
		}	
		
		//shoot if needed.
		if(this.weapon){
			//console.log(this.weapon, this.weapon.canFire(ticks));
			
			this.weapon.update(ticks);
			if(this.weapon.canFire(ticks) && dist < this.weapon.range ){
				this.weapon.fire(ticks, this, game.objects.player);	
				game.log.push(this.name + " attacks with " +this.weapon.name);
			} 
		}
	};
	
}
game.objects.boar.prototype= new game.objects.units.base();