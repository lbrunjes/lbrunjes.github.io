/*
	These are prototype that are super handy but are annoying to 
	keep intermixed with game code. becuase they are long and bascially 
	provide a bunch of core functionality that really wont change game to game.

	Incudes:
	game.objects.base
	game.screens.base
	game.tile.base 

*/
/*
 This is the basis for game obects
*/
game.objects = {};
game.objects.base ={
	/*
	Attributes
	*/
	id:null,
	type:"base",
	x:0,
	y:0,
	w:10,
	h:10,
	team:"none",
	name:"",
	color:"#ffffff",
	selected: false,
	
	/*
	Draw funcs
	*/
	
	draw:function(context){

		context.save();
			context.translate(this.x,this.y);
			context.rotate(this.r)
			context.translate(this.w/-2,this.h/-2);
			context.fillStyle = this.color;
			context.fillRect(0,0,this.w,this.h);
		context.restore();
	},
	"drawDetail":function(context, x, y, w, h){
		var i =2;
		var _t;
		var fill = context.fillStyle;
		context.fillStyle = "rgba(255,255,255,.25)";
		for(key in this){
			_t =typeof this[key]
			if( _t ==="string" || _t ==="number" ){
				i++;
				context.fillText(key + " = "+this[key], x, y + i*game.fontSize);
			}
			
		}
		context.fillStyle = fill;
	},
	
	/*
	Updates are importants
	*/
	
	"update":function(ticks, id){
		if( id && id !=this.id){
			this.id == id;
		}
	},
	
	/*
	Some geometery functions
	*/
	
	"contains":function(x,y){
		return Math.abs(x- this.x) <= this.w/2 &&  Math.abs(y - this.y) <= this.h/2;
	},
	"direction":function(x,y){
		return Math.atan2(this.x - x, this.y -y);
	},
	"distanceSq":function(x,y){
		return Math.pow(this.x - x,2)+Math.pow(this.y - y,2);
	},
	"distance":function(x,y){
		return Math.sqrt(Math.pow(this.x - x,2)+Math.pow(this.y - y,2));
	},
	"manhattanDistance":function(x,y){
		return Math.abs(this.x - x)+Math.abs(this.y - y);
	},
	
	/*
		Events go  here
	*/
	"move": function(ticks, angle, force){
		//move the units intended direction
		this.x -= Math.sin(angle) * ticks *force;
		this.y -= Math.cos(angle) * ticks *force;
		
	},
	"canMove":function(ticks, angle, force){
		if(!ticks || angle ===undefined ||!force){
			return;
		}
		var empty = true,
		x = this.x -Math.sin(angle) * ticks *force,
		y = this.y -Math.cos(angle) * ticks *force,
		
		max = [game.screens.level.current.world[0].length-1,
									game.screens.level.current.world.length-1],
		r = this.clamp(Math.floor((x +this.w/2)/game.screens.level.grid),0,max[0]),
		l = this.clamp(Math.floor((x -this.w/2)/game.screens.level.grid),0,max[0]),
		b =  this.clamp(Math.floor((y +this.h/2 ) /game.screens.level.grid),0,max[1]),
		t =  this.clamp(Math.floor((y -this.h/2 ) /game.screens.level.grid),0,max[1]),
		
		
/*
		console.log("Check", this.type, x,y, r,l,b,t,
					game.screens.level.current.world[b][l],
					game.screens.level.current.world[b][r],
					game.screens.level.current.world[t][l],
					game.screens.level.current.world[t][r]);
*/
		x0 = this.clamp(Math.floor(x/game.screens.level.grid),0,max[0]),
		y0 = this.clamp(Math.floor(y/game.screens.level.grid),0,max[1]);


		if(game.screens.level.current.world[y0][x0] <= 0){
			//the center point is good;
			//check the other points;
			empty = game.screens.level.current.world[b][l] <=0 &&
					game.screens.level.current.world[b][r]  <=0&&
					game.screens.level.current.world[t][l]  <=0&&
					game.screens.level.current.world[t][r]  <=0;
					
			if(this.avoidEdges){
				var edge = l;
				if(this.facing == "right"){
					edge= r;
				}
				b =  this.clamp(Math.floor((y +this.h ) /game.screens.level.grid),0,max[1])
				this.willFall = game.screens.level.current.world[b][r]  <=0;
				
			}
			else{
				this.willFall=false;
			}
		
		}
		else{
			//console.log(this.type,"is stuck at ",x,y, x0,y0, ticks, angle, force);
			empty = false;
		}
		
		
		return empty;
	},
	

	"teleport":function(x,y){
		this.x = x;
		this.y = y;
	},
	"clamp":function(x, small, big){
		return Math.max(Math.min(x,big),small);
	}

}




game.screens.base = {
	//used to store data for use in the click function {x:i,y:i,w:i,h:i,click:fn}
	"clickZones":[],
	//set this to true to have the world update on the screen you are on.
	"updateAssets":false,
	
	//called when the screen is changed
	"reset":function(arg){
		this.clearAllContexts();
	},
	//called to draw teh screen
	"draw":function(ticks){
		var i =1;
		for(canvas in game.context){
			game.context[canvas].fillStyle= "#ffffff";
			game.context[canvas].fillText(canvas, 10, game.fontSize *2*i);
		}
	},
	//called the update the state of the things in the scene
	"update":function(ticks){
		
		if(this.updateAssets && !game.state.paused){
			//update units
		}
	},
	
	/*
	
	EVENTS START HERE
	
	*/
	
	//called when the object is clicked
	"click":function(evt){
		for(i in this.clickZones){
			if(this.clickZones[i].x < diesel.mouseX 
				&& this.clickZones[i].x + this.clickZones[i].w > diesel.mouseX 
				&& this.clickZones[i].y < diesel.mouseY
				&& this.clickZones[i].y + this.clickZones[i].h > diesel.mouseY){
					
					this.clickZones[i].click();
				}
			}
	},
	
	//called when a screen is created.
	"open":function(event){
	
	},
	//called when  screen is closed.
	"close":function(evt){
	
	},
	
	
	/*
	
		HELPER FUNCTIONS BEGIN HERE
	
	*/
		
	
	
	//draws the selected text centred horizontally on a point.
	fillTextCenteredX:function(ctx, text, x,y){
		var len = ctx.measureText(text).width;
		ctx.fillText(text, x -len/2,y);
	},
	//I need to add a menu function 
	//right now im using boxws might be good to do block highlight instead.
	drawMenu:function(ctx, menuTextArray,x,y, w, h, lineh){
		//draw highlight trect
		if(!lineh){
		lineh = game.fontsize;
		}
		
		var fill = ctx.fillStyle;
		var boxY = Math.floor((diesel.mouseY -y)/lineh);
		var inside =false;
		if(diesel.mouseX > x && diesel.mouseX < x+w 
			&& diesel.mouseY >y && diesel.mouseY < y +h){
			ctx.fillRect(x,boxY * lineh +y,w,lineh);
			//? fill it an swap the option
			inside  =true;
		}
		
		//show all the text.
		for(var i =0 ; i <menuTextArray.length; i++){
	
			if(i !=boxY || !inside){
				ctx.fillText(menuTextArray[i], x,y + (i +1)*lineh);
			}
			else{
				ctx.fillStyle= "#000000";
				ctx.fillText(menuTextArray[i], x,y + (i +1)*lineh);
				ctx.fillStyle = fill;
			}
		}
		
		//TODO scroll?
	
	},
	
	//clears all the contexts.
	//handy.
	"clearAllContexts":function(){
		for(canvas in game.context){
			game.context[canvas].clearRect(0,0,game.width, game.height);
		}
	},
	
	"drawClickZones":function(ctx){
		var fill = ctx.fillStyle;
	
		for(i in this.clickZones){
			ctx.fillRect(this.clickZones[i].x,this.clickZones[i].y,this.clickZones[i].w,this.clickZones[i].h);
			ctx.fillStyle = "#000000";
			if(this.clickZones[i].h >=game.fontSize *2){
			ctx.fillText(i, this.clickZones[i].x +this.clickZones[i].w/2,this.clickZones[i].y +this.clickZones[i].h/2);
			
			}
			else{
				ctx.fillText(i, this.clickZones[i].x +this.clickZones[i].w/2,this.clickZones[i].y +this.clickZones[i].h);
			}
			ctx.fillStyle =fill;
		}
	},
}

/*
The unit object
*/
game.objects.units={};

game.objects.units.base = function(){
	this.health = 1;
	this.id = -1;
	this.type="unit";
	this.x = 0;
	this.y = 0;
	this.w = 30;
	this.h = 30;
	this.weapon = null;
	this.sprite = null;
	this.facing = "left";
	this.maxSpeed= 60;
	this.hspeed = this.maxSpeed;

	this.aim = 0;
	this.falls = true;
	this.fell = false;
	this.jumpheight =  game.gravity*2.7;
	this.jumptime =.5;
	this.collides = true;
	this.deathPoints =100;
	this.canShakedown =true;
	this.avoidEdge=false;
	this.willFall =false;


	this.canAttack = function(){
	
	};
	
	this.onDeath =function(){
		game.screens.level.units.splice(this.id, 1);
		game.score += this.deathPoints;
	};
	this.onHit =function(projectile){
		this.health--;
		if (this.health <=0){
			this.onDeath();
		}
	};

	
	this.update= function(ticks, id){
		if( id!= undefined){
			this.id = id;
		}
		//move in a direction
		if(this.hspeed !=0 && this.canMove(ticks, game[this.facing], this.hspeed)){// &&) !(this.avoidEdges && this.willFall)){
			this.move(ticks, game[this.facing], this.hspeed)
		}
		else{
			if(this.facing == "left"){
				this.facing = "right";
			}else{
				this.facing = "left";
			}
		}

		
		//apply gravity if need
		var tiletype= game.screens.level.getGridItem(this.x,this.y);
		if(this.falls && this.canMove(ticks, game.down, game.gravity) && tiletype != -7){
			this.y += game.gravity * ticks;
			if(this.vspeed >0){
			 this.vspeed -= ticks  * this.jumpheight/this.jumptime ;
			 	if(this.vspeed < 0 ){
					this.vspeed =0;
				}
			}
			this.fell =true;			
		}
		else{
			this.fell = false;
			this.y = Math.floor(this.y)
		}
		
		//shoot if needed.
		if(this.weapon){
			//console.log(this.weapon, this.weapon.canFire(ticks));
		
			this.weapon.update(ticks);
			if(this.weapon.canFire(ticks)){
				this.weapon.fire(ticks, this);	
			} 
		}
	};
	

}
game.objects.units.base.prototype = game.objects.base;


/*
The base weapon
*/
game.objects.weapons = {};
game.objects.weapons.base =function(){
	this.id = false;
	this.x = 0;
	this.y = 0;
	this.w = 32;
	this.h = 32;
	this.angle = 0;
	this.mouseAim =false;

	this.sinceLastFired =0;
	this.rateOfFire = 1;
	this.sprite = null;
	this.bulletEffect ="bullet";
	this.flashEffect ="flash";
	
	
	this.canFire = function(ticks){
		return this.sinceLastFired  > this.rateOfFire;
	}
	this.getMuzzle=function(shooter){
		//TODO
		if(shooter.facing == game.right){
			return [shooter.x+this.x,shooter.y+this.y];
		}
		else{
			return [shooter.x-this.x,shooter.y+this.y];
		}
		return [0,0];
	};
	
	this.fire= function(ticks, shooter){
		var muzzle = this.getMuzzle(shooter);
		var aim =0;
		if(this.mouseAim){
			aim = shooter.direction(diesel.mouseX, diesel.mouseY);
		}
		else{
			aim = game[shooter.facing];
		}
		//push that bad boy
		if(this.bulletEffect){
			var e =new game.objects.effects[this.bulletEffect](muzzle[0],muzzle[1], aim);
			e.text= this.text;
			game.screens.level.effects.push(e);
		}
		if(this.flashEffect){
			e =new game.objects.effects[this.flashEffect](muzzle[0],muzzle[1], aim);
			e.text= this.text;
			game.screens.level.effects.push(e);
			this.sinceLastFired =0;
		}

	
	}
	this.update =function(ticks){
		this.sinceLastFired +=ticks;
	}
};
game.objects.weapons.base.prototype = game.objects.base;


/*
The base effect
*/
game.objects.effects={};
game.objects.effects.base = function(_x, _y, _angle ){
	this.sprite = null;
	this.team ="player";
	this.speed = 128;
	this.x =_x;
	this.y =_y;
	this.w =8;
	this.h =8;
	this.angle = _angle;
	this.collides = true;
	this.loop =true;
	this.framesPerFrame =1;
	this.frames =0;
	this.maxFrames =10;
	this.type="effect";
	this.collideEffect= "flash";
	this.distanceCull = true;
	
	this.update =function(ticks ,id){
		if(this.collides){	
			if(this.canMove(ticks, this.angle, this.speed)){
				this.move(ticks,this.angle,this.speed);	
			}
			else{
				this.onCollision();
			}
			if(this.team == "player"){
				for(var i =0; i < game.screens.level.units.length;i++){
					var u = game.screens.level.units[i];
					if(u.collides && u.contains(this.x ,this.y)){
						diesel.raiseEvent("effectcollides", this, u);
					}
				}
			}
			else{
				if(game.objects.player.contains(this.x,this.y)){
	
					diesel.raiseEvent("collision", this);
				}
			}
			
		
		}
		else{
			this.move(ticks,this.angle,this.speed);	
		}
		
		//are we off screen popus off the effect stack;
		if(this.distanceCull && game.objects.player.manhattanDistance(this.x,this.y) > game.width/2 + game.height/2){
			game.screens.level.effects.splice(id,1);
		}
		
		//update teh frame count
		if(diesel.frameCount %this.framesPerFrame == 0){
			if(this.sprite){
				this.sprite.nextFrame();
			}
			
			this.frames++;
			
		}
		//if we are not loopeded remove after one time though.
		if(!this.loop){
			if((this.sprite &&this.sprite.frame === 0 && this.frame >=1)||
			 (!this.sprite &&this.frames > this.maxFrames )){
					game.screens.level.effects.splice(id,1);
				
			}
		}
		
	};
	this.onCollision =function(unit){
		game.screens.level.effects.splice(this.id,1);
		if(this.collideEffect){
			game.screens.level.effects.push(new game.objects.effects[this.collideEffect]());
		}
	}
};
game.objects.effects.base.prototype = game.objects.base;

