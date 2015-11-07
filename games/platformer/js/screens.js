/*





*/

game.screens.menu = function(){
	this.clickZones = [
		{x:32,y:32,w:128,h:64,"click":function(){
			var button = Math.floor((diesel.mouseY - 32 )/ 16);
			switch(button){
				case 0:
					game.settings.level =0;
					diesel.raiseEvent("screenChange","menu","level");
				break;
				case 1:
					//TODO load __current
					if(game.settings.inGame){
						game.settings.screen = "level";
						return;
					}
					
					var loaded = diesel.load("__current");
					
					if(loaded && loaded.level <= game.settings.lastLevel){
						game.mans = loaded.mans;
						game.settings.level = loaded.level;
						game.score = loaded.score;
						diesel.raiseEvent("screenChange","menu","level");
					}
					else{
						alert("cannot Continue");
					}
				break;
				case 2:
				
				
					diesel.raiseEvent("screenChange","menu","bindings");
				break;
				case 3:
					diesel.raiseEvent("screenChange","menu","about");
				break;
				default:
					console.log("aaah",button);
				break;
			}
			
			
		}},
	
	]
	this.options = [
		"START",
		"CONTINUE",
		"KEY BINDINGS",
		"ABOUT",
		
	];
	this.draw=function(){
		this.clearAllContexts();
		game.context.main.fillStyle="#ffffff";
		game.context.vfx.fillStyle="#ffffff";
		game.context.main.drawImage(diesel.imageCache["logo.png"], 
			(game.width-265)/2, 128,256,256);
		game.context.main.fillText("MENU:",16,32);
		this.drawMenu(game.context.main, this.options, 32,32, 128,64,16);
		
		this.fillTextCenteredX(game.context.vfx,game.version,game.width/2,420);		
		
	};
;

	

};

game.screens.menu.prototype = game.screens.base;
game.screens.menu = new game.screens.menu();

/*
BINDINGS

*/

game.screens.bindings = function(){

	this.clickZones=[
		{"x":32,"y":32,"w":128,"h":72, "click": function(evt){ 
			game.screens.bindings.active =Math.floor((diesel.mouseY - 32)/16);
			console.log(game.screens.bindings.active);
		}},
		{"x":32,"y":224,"w":128,"h":32, "click": function(evt){ 
			diesel.raiseEvent("screenChange","bindings","menu");
			diesel.save("__keys",game.keys);
		}}

	]
	this.keys =["left","right","jump","use", "fire"]
	this.named=[];
	this.active = false;
	this.active
	this.draw=function(){
		game.context.main.clearRect(0,0,game.width,game.height);
		game.context.main.drawImage(diesel.imageCache["logo.png"], 
			(game.width-265)/2, 128,256,256);

		for(var i =0; i < this.keys.length;i++){
			this.named[i]= diesel.getKeyName(game.keys[this.keys[i]]);
		}
		game.context.main.fillText("Key Bindings:",16,32);
		this.drawMenu(game.context.main, this.keys, 32,32,64,72,16);
		this.drawMenu(game.context.main, this.named, 96,32,64,72,16);
		
		if(this.active !== false){
			game.context.main.fillText("Press a Key for " + this.keys[this.active],
				32,128);
		}
		
		game.context.main.fillText("Back",32,256);
		
	};
	this.update=function(ticks){
	
	};
	
	this.keyup=function(event){
		if(this.active !== false){
			game.keys[this.keys[this.active]] = event.keyCode;
			this.active = false;
		}
	}

};

game.screens.bindings.prototype = game.screens.base;
game.screens.bindings = new game.screens.bindings();

/*
About

*/

game.screens.about = function(){

	this.clickZones=[
		{x:0,y:0,w:game.width,h:game.height,"click":function(){
			diesel.raiseEvent("screenChange","about","menu")
			}
		}

	]
	this.draw=function(){
		var about = ["The basic idea:"," 1. get the intel, green "," 2. Make it to the exit, green"," 3. Avoid the bad guys, red","","","click to go back","","Uses:"," Code: Lee Brunjes"," font: Silkscreen by Jason Kottke"];
		this.clearAllContexts();
		game.context.main.drawImage(diesel.imageCache["logo.png"], 
			(game.width-265)/2, 128,256,256);
		game.context.main.fillText("About:",16,32);
		this.drawMenu(game.context.main, about, 32,32,game.width-64,388);
		
		this.fillTextCenteredX(game.context.main,game.version,game.width/2,420);		
		game.context.back.fillStyle="rgba(255,255,255,.125)";
	};
	
	
};

game.screens.about.prototype = game.screens.base;
game.screens.about = new game.screens.about();

/*
Gameover

*/

game.screens.gameover = function(){

	this.clickZones=[
		{x:0,y:0,w:game.width,h:game.height,"click":function(){
			diesel.raiseEvent("screenChange","about","menu")
			}
		}

	]
	this.draw=function(){
		var about = ["Game Over, man","Game Over"];
		this.clearAllContexts();
		game.context.main.drawImage(diesel.imageCache["logo.png"], 
			(game.width-265)/2, 128,256,256);
		this.drawMenu(game.context.main, about, 32,32,game.width-64,388);
		
		};
	
	
};

game.screens.gameover.prototype = game.screens.base;
game.screens.gameover = new game.screens.gameover();

/*
wongame

*/

game.screens.wongame = function(){

	this.clickZones=[
		{x:0,y:0,w:game.width,h:game.height,"click":function(){
			diesel.raiseEvent("screenChange","about","menu")
			}
		}

	]
	this.draw=function(){
		var about = ["Thats it. I ran out of levels at that poins"];
		this.clearAllContexts();
		game.context.main.drawImage(diesel.imageCache["logo.png"], 
			(game.width-265)/2, 128,256,256);
		game.context.main.fillText("GGs:",16,32);
		this.drawMenu(game.context.main, about, 32,32,game.width-64,388);
		
		};
	
	
};

game.screens.wongame.prototype = game.screens.base;
game.screens.wongame = new game.screens.wongame();



/*
LEVEL 

Used to show the actual game screens you know.
*/
game.screens.level = function(){
	this.current =null;
	this.offset={x:0,y:0};
	this.grid =32;
	this.units = [];
	this.effects =[];
	this.intel=0;
	this.started =false;
	this.startFrame =0;
	
	this.clickZones=[
		{x:32,y:32,w:game.width-64,h:game.height-64,click:function(){
			if(!game.screens.level.started){
				game.screens.level.started =true;
				
			}
		}}
	];
	
	this.captureIntel=function(x,y,noswap){
			x= diesel.clamp(x, 0, this.current.world[0].length -1);
			y =diesel.clamp(y,0,this.current.world.length -1);
			if(!noswap){
				this.current.world[y][x] =0;
			}
			this.intel++;
			if(this.intel < this.current.intel){
				game.score+=500;
			}
			else{
				game.score +=1000;
			}
			//TODO effect;	
	}
	this.hackMachine= function(x,y){	
		var h = new game.objects.effects.text(x*this.grid,y *this.grid,game.up,"Hacked");
		h.speed =10;
		h.loop =true;
		h.distanceCull =true;
		this.effects.push(h);
		
		this.current.world[y][x]=0;
		
		x = diesel.clamp(x, 2, this.current.world[0].length -3);
		y = diesel.clamp(y, 2, this.current.world.length -3);
		x = x-2;
		y = y-2;
		
			
		for(var _y =y ; _y < y+5;_y++){
			for(var _x =x ; _x <x +5;_x++){
				if (this.current.world[_y][_x] == -5){
					//console.log(_y,_x);
					this.current.world[_y][_x] = -3;
				}
			}
		}
	
	}

	this.reset=function(){
		this.current=false;
		this.units = [];
		this.effects =[];
		this.intel =0;
		this.started =false;
		this.startFrame = diesel.frameCount;
		

			
		game.util.getLevel(game.settings.level);
		//set eth cameraa tot he start
		for(var _y = 0; _y < this.current.world.length; _y++){
			for(var _x = 0; _x < this.current.world[_y].length; _x++){
				if(this.current.world[_y][_x] == -1){
					this.offset.x = _x *this.grid ;
					this.offset.y =  _y *this.grid;
				}
			}
		}
		//move teh player to the start location.
		game.objects.player.teleport(	this.offset.x +this.grid/2,	this.offset.y+this.grid/2);
		
		//creat the units from the level and store them
		for(var i = 0; i < this.current.units.length;i++){
			var u = this.current.units[i];
			if(game.objects.units[u[0]]){
				this.units.push(new game.objects.units[u[0]]
					(u[1]*this.grid, u[2]*this.grid));
			}
			else{
				console.log("cannot add moster of type",u[0]);
			}
		}
		
		//create effects from teh level
		for(var i = 0; i < this.current.effects.length;i++){
			var e = this.current.effects[i];
			if(game.objects.effects[e[0]]){
				var eff = new game.objects.effects[e[0]]
					(e[1]*this.grid, e[2]*this.grid, e[3],e[4]
						.replace("%use%", diesel.getKeyName(game.keys.use))
						.replace("%jump%", diesel.getKeyName(game.keys.jump))
						.replace("%left%", diesel.getKeyName(game.keys.left))
						.replace("%right%", diesel.getKeyName(game.keys.right))
						.replace("%fire%", diesel.getKeyName(game.keys.fire)));
				eff.loop=true;
				eff.speed =0;
				eff.distanceCull = false;
				this.effects.push(eff);
			}
			else{
				console.log("cannot add effect of type",e[0]);
			}
		}
	}

	this.draw=function(){
		this.clearAllContexts();
		if(!this.current){
			game.context.vfx.fillStyle="#ffffff";
			game.context.vfx.fillText("LOADING ."
				+(diesel.frameCount % 10 ? ".":" ")
				+(diesel.frameCount % 30 ? ".":" ")
				+(diesel.frameCount % 60 ? ".":" "), 50,50)
				return;
		}
		if(!this.started){
			this.drawIntro(game.context.vfx);
		}
		
		//UPDATE OFFSETS for y
		
		this.offset.x = diesel.clamp(game.width/2 - game.objects.player.x,
			-1* (this.current.world[0].length*this.grid) + game.width,
			-1);
		this.offset.y = diesel.clamp(game.height/2 - game.objects.player.y,
			-1 *(this.current.world.length*this.grid) + game.height,	-1);
		
		
		game.context.main.save();
		game.context.vfx.save();
		
		
		//translate all contexts
		game.context.main.translate(this.offset.x, this.offset.y);
		game.context.vfx.translate(this.offset.x, this.offset.y);
		

		//calculate paralax
		var paralax = 0, 
		remaining = diesel.imageCache[this.current.background].width - game.width,
		scroll = game.objects.player.x/ (this.current.world[0].length * this.grid);
		
		if(remaining >0 ){
			paralax = remaining * scroll *-1;
		}
		
		//draw the background 		
		game.context.back.drawImage(diesel.imageCache[this.current.background],
			paralax,0,diesel.imageCache[this.current.background].width, 
			diesel.imageCache[this.current.background].height);
		
		//draw the world		
		for(var _y = 0; _y < this.current.world.length; _y++){
			for(var _x = 0; _x < this.current.world[_y].length; _x++){
				
				if(this.current.world[_y][_x] >0 && 			
					this.isOnScreen(_x*this.grid, _y*this.grid)){
						var spr = diesel.spriteCache["tiles.png"];
						var src = spr.getSpriteByIndex( this.current.world[_y][_x]*spr.frames);
				
				
						game.context.main.drawImage(spr.image, src[0],src[1],src[2],src[3],
							_x *this.grid, _y*this.grid ,this.grid,this.grid);
				}
				else{
					var spr = diesel.spriteCache["ents.png"];
					var idx = Math.abs(this.current.world[_y][_x]);
					var src = spr.getSprite(idx, Math.floor(diesel.frameCount/10)%spr.frames );
						game.context.main.drawImage(spr.image, src[0],src[1],src[2],src[3],
							_x *this.grid, _y*this.grid ,this.grid,this.grid);
				}
			}
		}
		//draw the player
		game.objects.player.draw(game.context.main);
		
		//Draw the units
		for(var i = 0; i < this.units.length;i++){
			if(this.isOnScreen(this.units[i].x,this.units[i].y)){
				this.units[i].draw(game.context.main);
			}
		}
		//Draw the effects
		for(var i = 0; i < this.effects.length;i++){
			if(this.isOnScreen(this.effects[i].x,this.effects[i].y)){
				this.effects[i].draw(game.context.main);
			}
		}
		
		
		game.context.main.restore();
		game.context.vfx.restore();
		
		//GUI
		game.context.vfx.fillText("intel:"+this.intel+"/"+this.current.intel,16,16);
		game.context.vfx.fillText("mans:"+game.mans,16,32);
		game.context.vfx.fillText("score:"+game.score,16,48);
	
	
				
	};
	this.drawIntro =function(context){
		context.fillStyle = "rgba(22,22,22,.5)";
		context.fillRect( 64,64, game.width-128, game.height-128);
		context.fillStyle = "#ffffff";
		context.fillText("click to continue", 64, game.height-64);
		this.drawMenu(context, this.current.intro, 64,64,game.width-128, game.height-128,16)
	}
	
	this.update=function(ticks){
		if(this.started){
			//the player moves first
			game.objects.player.update(ticks);
			
			for(var i = 0; i < this.units.length;i++){
				if(game.objects.player.manhattanDistance(this.units[i].x, this.units[i].y) < (game.width + game.height)){
					this.units[i].update(ticks,i);
				}
			}
			
			for(var i = 0; i < this.effects.length;i++){
				if(game.objects.player.manhattanDistance(this.effects[i].x, this.effects[i].y) < (game.width + game.height)){
			
					this.effects[i].update(ticks,i);
				}
			}
			//do teh sweedish party level
			if(game.settings.level === 8){
				//every fram rate frames
				var frame = diesel.frameCount - this.startFrame;
				if(frame % (diesel.fpsLimit * 3) ==0 && frame >0 ){
					var year = frame /(diesel.fpsLimit * 3);
					if(year < 9){
						game.objects.player.teleport(5 *this.grid, (15 * year + 9)*this.grid );
					}
				}
			}
		}
		
	
	};
	this.isOnScreen= function(x,y){
		//TODO 
		return true;
	};
	
	this.getGridRef=function(x,y){
		return [Math.floor(x/this.grid),Math.floor(y/this.grid) ]
	};
	this.getGridItem=function(x,y){
		y = Math.floor(y/this.grid);
		x = Math.floor(x/this.grid);
		y = Math.max(Math.min(y,this.current.world.length -1),0);
		x = Math.max(Math.min(x,this.current.world[0].length-1),0);
	
		return this.current.world[y][x];
	};
	
	this.keydown = function(event){
		for(keyname in game.keys){
					if(event.keyCode == game.keys[keyname]){
						game.keysDown[keyname] =true;
					}
				}
		};
	this.keyup =function(event){
		for(keyname in game.keys){
			if(event.keyCode == game.keys[keyname]){
				game.keysDown[keyname] =false;
			}
		}
		
		if(event.keyCode ===27){
			game.settings.screen = "menu";
			game.settings.inGame = true;
		}
	};
};

game.screens.level.prototype = game.screens.base;
game.screens.level = new game.screens.level();


/*
Game INTRO
*/
game.screens.gameIntro = function(){
	
//TODO.
/*
Use the duke nukem intro as a basis.
anyway to get amusing random data from somewhere?
*/

}
game.screens.gameIntro.prototype = game.screens.base;
game.screens.gameIntro= new game.screens.gameIntro();

