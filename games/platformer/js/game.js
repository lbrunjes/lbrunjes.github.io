/*
Times for the game that are instantiated.
so the units, the effects the players
these are not intended to be items for use as prototypes 



*/


/*
THE PLAYER

*/

game.objects.player = function(){
 	this.hspeed =0;
 	this.vspeed =0;
	this.maxSpeed =128;
	this.type="player";
	this.w = 29;
	this.h = 29;
	this.sprite = new diesel.spriteInstance(diesel.spriteCache["player.png"]);
	this.sprite.animation ="walk";
	this.weapon = null;//new game.objects.weapons.scanner();
	
	this.update =function(ticks){
		if(diesel.frameCount% 10 ==0){
			this.sprite.nextFrame();
		}
		if(this.weapon){
			this.weapon.update(ticks);
		}
		//MOVEMENT
		this.hspeed = 0;	
		if(game.keysDown.left){
			this.hspeed = this.maxSpeed ;
			this.facing ="left";

		}
		else{		
			this.hspeed=0;
		}
		
		if(game.keysDown.right){
			this.hspeed = this.maxSpeed ;
			this.facing ="right";
		}
		if(!this.fell && game.keysDown.jump && this.vspeed ==0){
			this.vspeed = this.jumpheight;
		}
	
		if(this.hspeed !=0 && this.canMove(ticks, game[this.facing], this.hspeed)){
			this.move(ticks, game[this.facing], this.hspeed)
		}
		
		//apply gravity if need
		var tiletype= game.screens.level.getGridItem(this.x,this.y);
		
		if(this.falls && this.canMove(ticks, game.down, game.gravity) && (tiletype!=-7 || game.keysDown.use)){
		//	if( ){ ||(tiletype===-7 && !game.keysDown.use)){
				this.move(ticks, game.down, game.gravity);
		//	}
			if(this.vspeed >0){
			 this.vspeed -= ticks  * this.jumpheight/this.jumptime ;
			 	if(this.vspeed < .5 ){
					this.vspeed =0;
				}
			}
	
			this.fell =true;			
		}
		else{
			this.y = Math.floor(this.y)
			this.fell = false;
		}
		//jump force	
		if(this.vspeed >=0 && this.canMove(ticks, game.up, this.vspeed)){	
				this.move(ticks, game.up, this.vspeed)
		}
		else{
		this.vspeed =0;
		}
		
		//Shoosting
		if(game.keysDown.fire && this.weapon && this.weapon.canFire(ticks)){
			this.weapon.fire(ticks, this);
		}
		
		
		//call the entity functions;
		var ent = game.screens.level.getGridItem(this.x,this.y);
		if(ent < 0){
			ent = Math.abs(ent);
			if(game.assets.entities[ent]){
				game.assets.entities[ent](this);
			}
		}
		
		
		//COLLISION;
		for(var i =0; i < game.screens.level.units.length;i++){
			var u = game.screens.level.units[i];
			if(u.contains(this.x ,this.y)&& u.collides){
				diesel.raiseEvent("collision", this, u);
				
			}
			else{
			//SHAKEDOWNS - we cannot 
				if(game.keysDown.use && !ent && u.canShakedown){
					//test two more points left and right so see if we are nearly touchign but not quite.
					if(u.contains(this.x +this.w/2,this.y) ||
						u.contains(this.x -this.w/2,this.y)){
						diesel.raiseEvent("shakedown", this, u);
						u.canShakedown =false;
						game.screens.level.captureIntel(this.x, this.y,true);
						var e = new game.objects.effects.text(this.x, this.y, game.up, "stole intel!");
						e.speed  =10;
						e.loop =true;
						game.screens.level.effects.push(e);
						game.score+= 10;
						
					}
				}
			}
		}
		for(var i =0; i < game.screens.level.effects.length;i++){
			//TODO
		}
		
		

		
		//did we fall out of the world?
		if (this.y > game.screens.level.current.world.length * game.screens.level.grid){
			diesel.raiseEvent("collision", this, null);
		}	
	}
	
	
	this.draw =function(context){
		context.save();
			context.translate(this.x,this.y);
			context.rotate(this.r)
			context.translate(this.w/-2,this.h/-2);
			this.sprite.draw(context);
			if(diesel.frameCount % 5){
			this.sprite.nextFrame();
			}
		context.restore();
	}
}
game.objects.player.prototype = new game.objects.units.base();


/*
Units

*/

/*
Crawler - moves backa dn forth no jumps.
*/
game.objects.units.crawler = function(x,y){
	this.x = x; 
	this.y = y;
	this.color = "#ff0000";
	this.sprite = new diesel.spriteInstance(diesel.spriteCache["crawler.png"]);
	this.sprite.animation ="walk";
	this.type="crawler";
	
	this.draw =function(context){
		context.save();
			context.translate(this.x,this.y);
			context.rotate(this.r)
			context.translate(this.w/-2,this.h/-2);
			this.sprite.draw(context);
		context.restore();
		
		if(diesel.frameCount% 10 ==0){
			this.sprite.nextFrame();
		}
	}
}
game.objects.units.crawler.prototype = new game.objects.units.base();

/*
Floater -like crawler but flies.

*/

game.objects.units.floater = function(x,y){
	this.x = x; 
	this.y = y;
	this.color = "#ff0000";
	this.sprite = new diesel.spriteInstance(diesel.spriteCache["floater.png"]);
	this.sprite.animation ="walk";
	this.type="floater";
	this.falls = false;
	
	this.draw =function(context){
		context.save();
			context.translate(this.x,this.y);
			context.rotate(this.r)
			context.translate(this.w/-2,this.h/-2);
			this.sprite.draw(context);
		context.restore();
		
		if(diesel.frameCount% 10 ==0){
			this.sprite.nextFrame();
		}
	}
}
game.objects.units.floater.prototype = new game.objects.units.base();

/*
wnderer - non hostile, has intel


*/

game.objects.units.wanderer = function(x,y){
	this.x = x; 
	this.y = y;
	this.color = "#ff0000";
	this.sprite = new diesel.spriteInstance(diesel.spriteCache["wanderer.png"]);
	this.sprite.animation ="walk";
	this.type= "wanderer";
	this.falls = true;
	this.collides =false;
	
	this.draw =function(context){
		context.save();
			context.translate(this.x,this.y);
			context.rotate(this.r)
			context.translate(this.w/-2,this.h/-2);
			this.sprite.draw(context);
		context.restore();
		
		if(diesel.frameCount% 10 ==0){
			this.sprite.nextFrame();
		}
	}
}
game.objects.units.wanderer.prototype = new game.objects.units.base();

/*
nobody - non hostile, has no intel


*/

game.objects.units.nobody = function(x,y){
	this.x = x; 
	this.y = y;
	this.color = "#ff0000";
	this.sprite = new diesel.spriteInstance(diesel.spriteCache["nobody.png"]);
	this.sprite.animation ="walk";
	this.type= "wanderer";
	this.falls = true;
	this.collides =false;
		this.canShakedown =false;
	
	this.draw =function(context){
		context.save();
			context.translate(this.x,this.y);
			context.rotate(this.r)
			context.translate(this.w/-2,this.h/-2);
			this.sprite.draw(context);
		context.restore();
		
		if(diesel.frameCount% 10 ==0){
			this.sprite.nextFrame();
		}
	}
}
game.objects.units.nobody.prototype = new game.objects.units.base();


/*
Intel is 

*/

game.objects.units.shooter = function(x,y){

	this.x =x;
	this.y= y;
	this.w=32;
	this.h=32;
	this.maxSpeed =30;
	this.sprite = new diesel.spriteInstance(diesel.spriteCache["crawler.png"]);
	this.sprite.animation = "walk";
	this.falls = true;
	this.collides = true;
	//this.avoidEdge =true;
	this.weapon = new game.objects.weapons.ak();
	
	this.draw =function(context){
		context.save();
			context.translate(this.x,this.y);
			context.rotate(this.r)
			context.translate(this.w/-2,this.h/-2);
			this.sprite.draw(context);
		context.restore();
		
		if(diesel.frameCount% 10 ==0){
			this.sprite.nextFrame();
		}
	}

}
game.objects.units.shooter.prototype = new game.objects.units.base();

/*
EFFECTS

*/

/*
textEffect shows test for a time
*/

game.objects.effects.text = function(x,y,angle,text){
	this.x = x;
	this.y = y;
	this.angle = angle;
	this.text ="?";
	if(text){
		this.text = text;
	}
	this.collides = false;
	this.loop =false;
	this.speed = 64;
	this.color = "#ffffff";
	this.framesPerFrame =1;
	this.maxFrames = diesel.fpsLimit;
	this.draw=function(context){
		context.fillStyle= this.color;
		game.screens[game.settings.screen].fillTextCenteredX(context,this.text, this.x,this.y);
	}
	
}
game.objects.effects.text.prototype= new game.objects.effects.base();

/*
bullet effect 
*/


game.objects.effects.bullet = function(x,y,angle){
	this.x = x;
	this.y = y;
	this.angle = angle;
	this.collideEffect = "flash";
	
	this.w =4;
	this.collides = true;
	this.loop =true;
	this.speed = 256;
	this.color = "rgba(255,255,255,0.75)";
	this.framesPerFrame =1;
	this.draw=function(context){
		context.fillStyle= this.color;
		context.beginPath();
		context.arc(this.x,this.y,this.w, 0 , 2*Math.PI ,false);
		context.closePath();
		context.fill();
	}
}
game.objects.effects.bullet.prototype= new game.objects.effects.base();

/*
 a bullet for bad guys
*/
game.objects.effects.badbullet = function(x,y,angle){
	this.team = "badguys";
	this.x = x;
	this.y = y;
	this.angle = angle;
	this.collideEffect = "flash";
	
	this.w =4;
	this.collides = true;
	this.loop =true;
	this.speed = 256;
	this.color = "rgba(255,255,255,0.75)";
	this.framesPerFrame =1;
	this.draw=function(context){
		context.fillStyle= this.color;
		context.beginPath();
		context.arc(this.x,this.y,this.w, 0 , 2*Math.PI ,false);
		context.closePath();
		context.fill();
	}
}
game.objects.effects.badbullet.prototype= new game.objects.effects.base();


/*
bullet effect 
*/


game.objects.effects.flash = function(x,y,angle){
	this.x = x;
	this.y = y;
	this.angle = angle;
	
	this.w =8;
	this.collides = false;
	this.loop =false;
	this.maxFrames =4;
	this.speed = 256;
	this.color = "rgba(255,128,128,0.75)";
	this.framesPerFrame =2;
	this.draw=function(context){
		context.fillStyle= this.color;
		context.beginPath();
		context.arc(this.x,this.y,this.w, 0 , 2*Math.PI ,false);
		context.closePath();
		context.fill();
	}
}
game.objects.effects.flash.prototype= new game.objects.effects.base();

/*
WEAPONS

*/
/*
 scanner - the player weapon
*/

game.objects.weapons.scanner = function(){

}
game.objects.weapons.scanner.prototype = new game.objects.weapons.base();
/*


*/
game.objects.weapons.ak =function(){
	this.bulletEffect = "badbullet";
}
game.objects.weapons.ak.prototype= new game.objects.weapons.base();
