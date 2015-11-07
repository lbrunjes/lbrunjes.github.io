/*
Units.js

Units for the game



*/

game.objects.player= function(){

this.x = 64;
this.y= 64;
this.maxspeed = 2*game.screens.level.grid;
this.speed = 0;
this.w = game.screens.level.grid/2;
this.h =game.screens.level.grid/2;
this.sprite=new diesel.spriteInstance(diesel.spriteCache["player.png"]);
this.sprite.animation = 0;
this.item =null;
this.facing = "down";
this.r = game.down;
this.collideTimer = -10;
this.collideImmuneTime = 2000;
this.tooClose = 10* game.screens.level.grid;

this.update= function(ticks){

	if(this.item){
		this.item.update(ticks);
		
	}
	
	//input
	this.speed =0;
	if(game.keysDown.left){
		this.facing = "left";	
		this.speed=this.maxSpeed;
	}	
	if(game.keysDown.right){
		this.facing = "right";
		this.speed=this.maxSpeed;
 	}
 	//move teh character
	if(this.speed >0 && this.canMove(ticks, game[this.facing], this.speed)){
		this.move(ticks, game[this.facing], this.speed);
	}
 	
 	this.speed =0;
	if(game.keysDown.up){
		this.facing = "up";
		this.speed=this.maxSpeed;
	}
	if(game.keysDown.down){
		this.facing = "down";		
		this.speed=this.maxSpeed;
	}
	
	if(this.speed >0 && this.canMove(ticks, game[this.facing], this.speed)){
		this.move(ticks, game[this.facing], this.speed);
	}
	
	this.r = game[this.facing];
	
	//using items
	if(game.keysDown.use &&this.item && this.item.canFire(ticks)){
	 this.item.fire(ticks);
	}
	
	//collision
	if(this.collideTimer >0){
		this.collideTimer -= Math.floor(ticks*1000);	
		this.sprite.animation = "hurt";
	}
	else{
	this.sprite.animation = "walk";
		var alone = 1;
		for(var i =0; i < game.screens.level.units.length;i++){
			var u = game.screens.level.units[i];
			if(this.item.type != u.type){
				if(u.contains(this.x ,this.y)&& u.collides && this.collideTimer <=0){
					diesel.raiseEvent("collision", this, u);
			
				}
				if(this.manhattanDistance(u.x,u.y) <= this.tooClose){
					alone =false;
					//TODO indicate ths problem
					game.context.vfx.beginPath();
					game.context.vfx.strokeStyle = "rgba(255,0,0,"+(1 -(this.manhattanDistance(u.x,u.y) / this.tooClose))+")";
					game.context.vfx.moveTo(this.x, this.y);
					game.context.vfx.lineTo(u.x,u.y);
					game.context.vfx.lineWidth =this.w/2 * (1-(this.manhattanDistance(u.x,u.y) / this.tooClose));
					game.context.vfx.stroke();
				
					game.context.vfx.closePath();
				
					game.context.vfx.clearRect(this.x -this.w/2, this.y - this.h/2 ,this.w, this.h);
					game.context.vfx.clearRect(u.x -u.w/2, u.y - u.h/2 ,u.w, u.h);
				}
			}
		}
		if(alone && (diesel.frameCount%5 ==0)){
			game.score++;
		}
	}
	
	//world ents
	var ent = game.screens.level.getGridEnt(this.x, this.y);
	
	if(ent && game.assets.entities[ent]){
		if(!game.progress[ent]){
			console.log("calling",ent, this);
			game.assets.entities[ent](this);
		}
		else{
			console.log("you have already been to "+ent);
		}
	}

}
this.draw =function(context){
		context.save();
			context.translate(this.x,this.y);

			if(this.facing == "left"){
				context.translate(this.w,this.h *-1);
				context.scale(-1,1);
				this.sprite.draw(context,this.w*2,this.h*2);
		
			}
			else{
				context.translate(this.w*-1,this.h*-1);
				this.sprite.draw(context,this.w*2,this.h*2);
			}
			
		
		context.restore();
		
		if(this.item){
			this.item.draw(game.context.main,this);
		}
		
		if(diesel.frameCount% 10 ==0){
			this.sprite.nextFrame();
		}
		
		
	}



}
game.objects.player.prototype = new game.objects.units.base();




game.objects.units.band = function(x,y){
this.x  = x;
this.y =y;
this.w = game.screens.level.grid*1.5;
this.h = game.screens.level.grid*1.5;
this.sprite = new diesel.spriteInstance(diesel.spriteCache["band.png"]);
this.sprite.animation = 0;
this.maxSpeed = game.screens.level.grid *2;
this.type="band";

this.draw =function(context){
		context.save();
			context.translate(this.x,this.y);

			if(this.facing == "right"){
				context.translate(this.w/2,this.h/-2);
				context.scale(-1,1);
				this.sprite.draw(context,this.w,this.h);
				context.scale(-1,1);
			}
			else{
				context.translate(this.w/-2,this.h/-2);
				this.sprite.draw(context,this.w,this.h);
			}
		context.restore();
		
		if(diesel.frameCount% 10 ==0){
			this.sprite.nextFrame();
		}
	}

}
game.objects.units.band.prototype = new game.objects.units.base();




game.objects.units.cheer = function(x,y){
this.x  = x;
this.y =y;
this.w = game.screens.level.grid*1.5;
this.h = game.screens.level.grid*1.5;
this.sprite = new diesel.spriteInstance(diesel.spriteCache["cheer.png"]);
this.sprite.animation = 0;
this.facing="down"
this.maxSpeed = game.screens.level.grid * 3;
this.type= "cheer";

this.draw =function(context){
		context.save();
			context.translate(this.x,this.y);

			if(this.facing == "down"){
				context.translate(this.w/-2,this.h/2);
				context.scale(1,-1);
				this.sprite.draw(context,this.w,this.h);
				context.scale(1,-1);
			}
			else{
				context.translate(this.w/-2,this.h/-2);
				this.sprite.draw(context,this.w,this.h);
			}
		context.restore();
		
		if(diesel.frameCount% 10 ==0){
			this.sprite.nextFrame();
		}
	}
this.update= function(ticks, id){
		if( id!= undefined){
			this.id = id;
		}
		//move in a direction
		if(this.canMove(ticks, game[this.facing], this.hspeed)){// &&) !(this.avoidEdges && this.willFall)){
			this.move(ticks, game[this.facing], this.hspeed)
		}
		else{
			if(this.facing == "down"){
				this.facing = "up";
			}else{
				this.facing = "down";
			}
		}		

	};

}
game.objects.units.cheer.prototype = new game.objects.units.base();




game.objects.units.grease = function(x,y){
this.x  = x;
this.y =y;
this.w = game.screens.level.grid*1.5;
this.h = game.screens.level.grid*1.5;
this.sprite = new diesel.spriteInstance(diesel.spriteCache["grease.png"]);
this.sprite.animation = 0;
this.facing="down"
this.maxSpeed = game.screens.level.grid;
this.type="grease";

this.draw =function(context){
		context.save();
			context.translate(this.x,this.y);

			
				if(this.facing == "left"){
					context.translate(this.w/2,this.h/-2);
					context.scale(-1,1);
					this.sprite.draw(context,this.w,this.h);
					context.scale(-1,1);
				}
				else{
					context.translate(this.w/-2,this.h/-2);
					this.sprite.draw(context,this.w,this.h);
				}
			
		context.restore();
		
		if(diesel.frameCount% 10 ==0){
			this.sprite.nextFrame();
		}
	}
this.update= function(ticks, id){
		if( id!= undefined){
			this.id = id;
		}
		//move in a direction
		if(this.canMove(ticks, game[this.facing], this.hspeed)){// &&) !(this.avoidEdges && this.willFall)){
			this.move(ticks, game[this.facing], this.hspeed)
		}
		else{
			var d = Math.floor(Math.random() *4);
			switch(d){
				case 0:
					this.facing = "up";
					break;
				case 1:
					this.facing = "right";
					break;
				case 2:
					this.facing = "down";
					break;
				default:
					this.facing = "left";
					break;
					
			}
			
		}		

	};

}
game.objects.units.grease.prototype = new game.objects.units.base();




game.objects.units.prep = function(x,y){
this.x  = x;
this.y =y;
this.w = game.screens.level.grid*.9;
this.h = game.screens.level.grid*.9;
this.sprite = new diesel.spriteInstance(diesel.spriteCache["prep.png"]);
this.sprite.animation = 0;
this.facing="down"
this.maxSpeed = game.screens.level.grid;
this.type="prep";

this.draw =function(context){
		context.save();
			context.translate(this.x,this.y);

			
				if(this.facing == "left"){
					context.translate(this.w/2,this.h/-2);
					context.scale(-1,1);
					this.sprite.draw(context,this.w,this.h);
					context.scale(-1,1);
				}
				else{
					context.translate(this.w/-2,this.h/-2);
					this.sprite.draw(context,this.w,this.h);
				}
			
		context.restore();
		
		if(diesel.frameCount% 10 ==0){
			this.sprite.nextFrame();
		}
	}
this.update= function(ticks, id){
		if( id!= undefined){
			this.id = id;
		}
		//move in a direction
		if(this.canMove(ticks, game[this.facing], this.hspeed)){// &&) !(this.avoidEdges && this.willFall)){
			this.move(ticks, game[this.facing], this.hspeed)
		}
		else{
			if(this.facing == "up"){
				this.facing = "right";
			}
			else{
				if(this.facing =="right"){
					this.facing ="down";
				}
				else{
					if(this.facing =="down"){
					 this.facing = "left"
					}
					else{
						this.facing ="up";
					}
				}
			}

		}	

	};

}
game.objects.units.prep.prototype = new game.objects.units.base();




game.objects.weapons.banana=function(){
this.type="banana";
this.sprite = new diesel.spriteInstance(diesel.spriteCache[this.type+".png"]);
this.sprite.animation ="closed";
this.y= 16;
this.x = 16;

this.update=function(ticks){
	if(game.objects.player.collideTimer <=0){
		this.sprite.animation="open";
	}
};
}
game.objects.weapons.banana.prototype = new  game.objects.weapons.base();





game.objects.weapons.fan=function(){
this.type="fan";
this.sprite = new diesel.spriteInstance(diesel.spriteCache[this.type+".png"]);
this.y= 16;
this.x = 8;
}
game.objects.weapons.fan.prototype = new  game.objects.weapons.base();




game.objects.weapons.headphones=function(){
this.type="headphones";
this.sprite = new diesel.spriteInstance(diesel.spriteCache[this.type+".png"]);
this.y= -8;
game.objects.player.tooClose = game.objects.player.tooClose *.75;
}
game.objects.weapons.headphones.prototype = new  game.objects.weapons.base();




game.objects.weapons.band=function(){
this.type="band";
this.sprite = new diesel.spriteInstance(diesel.spriteCache[this.type+".png"]);
this.y =-16;
}
game.objects.weapons.band.prototype = new  game.objects.weapons.base();



game.objects.weapons.cheer=function(){
this.type="cheer";
this.sprite = new diesel.spriteInstance(diesel.spriteCache[this.type+".png"]);
this.x = -16;
this.y = 16;
}
game.objects.weapons.cheer.prototype = new  game.objects.weapons.base();

game.objects.weapons.grease=function(){
this.type="grease";
this.sprite = new diesel.spriteInstance(diesel.spriteCache[this.type+".png"]);
this.y = -12;
}
game.objects.weapons.grease.prototype = new  game.objects.weapons.base();

game.objects.weapons.prep=function(){
this.type="prep";
this.sprite = new diesel.spriteInstance(diesel.spriteCache[this.type+".png"]);
this.y = 16;
}
game.objects.weapons.prep.prototype = new  game.objects.weapons.base();
