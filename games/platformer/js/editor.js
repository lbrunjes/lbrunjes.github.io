/*
LEVEL EDITOR
*/



game.screens.editor = function(){
	this.grid =32
	this.zoom = 1;
	this.tileGrid = 16;
	this.rehash =true;
	this.selectedI = false;
	this.selectedType = false;
	this.offset = {x:0,y:0};
	
	this.clickZones=[
		{x:160,y:0,w:640,h:800,click:function(){
			var g =(game.screens.editor.grid *game.screens.editor.zoom);
			var x = Math.floor((diesel.mouseX + game.screens.editor.offset.x - 160)/g);
			var y = Math.floor((diesel.mouseY - game.screens.editor.offset.y)/g);
		
		if(x >=0 && y>=0){
		if( y < level.world.length && x < level.world[y].length){
				if(game.screens.editor.selectedType == "world"){
					level.world[y][x] = game.screens.editor.selectedI;
					
				}
				if(game.screens.editor.selectedType == "ent"){
					level.world[y][x] = game.screens.editor.selectedI *-1;
				}
			}
		}}},
		{x:0,y:16,w:160,h:160,click:function(){
			i = Math.floor(diesel.mouseX / game.screens.editor.tileGrid) +
				Math.floor((diesel.mouseY -16) / game.screens.editor.tileGrid) * 10;//10 is based on girdsize 16
			
			console.log(i);
			if( i < diesel.spriteCache["tiles.png"].numAnimations()){
				game.screens.editor.selectedI = i;
				game.screens.editor.selectedType = "world";
			}
			else{
				game.screens.editor.selectedI = i;
				game.screens.editor.selectedType = false;
			}
		}},
		{x:0,y:192,w:160,h:160,click:function(){
			i = Math.floor(diesel.mouseX / game.screens.editor.tileGrid) +
				Math.floor((diesel.mouseY -192) / game.screens.editor.tileGrid) * 10;//10 is based on girdsize 16
				
			console.log(i);
			if( i < diesel.spriteCache["ents.png"].numAnimations()){
				game.screens.editor.selectedI = i;
				game.screens.editor.selectedType = "ent";
			}
			else{
				game.screens.editor.selectedI = i;
				game.screens.editor.selectedType = false;
			}
		}},
		{x:0,y:368,w:160,h:80,click:function(){
			//TODO UNITS;
			if(diesel.mouseY > 384){
				if(diesel.mouseX < 80){
					console.log("units");
					if(diesel.mouseX < 40){
						//add
						var data = prompt("enter a unit.\nformat:\nname,x,y");
						data = data.split(',');
						level.units.push(data);
					}
					else{
						//remove
						var ents ="Entities:\n"
						for(var i = 0; i < level.entities.length; i++){
							ents+= i +": " +level.entities.join(',')+"\n";
						}
						var data = prompt(ents+"enter number to remove");
						level.entities.splice(parseInt(data),1);
					
					}
				}
				else{
					console.log("ents");
					if(diesel.mouseX < 120){
						//add
						var data = prompt("enter a effect.\nformat:\nname,x,y,rotation,text");
						data = data.split(',');
						level.effects.push(data);
					}
					else{
						//remove
						var ents ="Units:\n"
						for(var i = 0; i < level.entities.length; i++){
							ents+= i +": " +level.entities.join(',')+"\n";
						}
						var data = prompt(ents+"enter number to remove");
						level.units.splice(parseInt(data),1);
					}
				}
			}
		}},
		{x:0,y:528,w:160,h:16,click:function(){
			//TODO savebutton;
			console.log("save");
			level.intel = parseInt(document.getElementById("intel").value);
			level.background = document.getElementById("background").value;
			level.music = document.getElementById("music").value;
			level.intel = parseInt(document.getElementById("intel").value);
			level.intro = document.getElementById("intro").value.split("\n");
			document.getElementById("output").innerText = JSON.stringify(level);
		}},
		{x:0,y:544,w:160,h:16,click:function(){
			// zoom;
			console.log("zoom")
			game.screens.editor.zoom = diesel.mouseX /160;
		}},
		{x:0,y:560,w:160,h:16,click:function(){
			// hotiz scrool;
			console.log("horiz")
			game.screens.editor.offset.x = diesel.mouseX /160 * level.world[0].length *game.screens.editor.grid;;
		}},
		{x:0,y:576,w:160,h:16,click:function(){
			// vert scroll;
			console.log("vert")
			game.screens.editor.offset.y = diesel.mouseX /160 * level.world.length * game.screens.editor.grid;;
		}},
		{x:0,y:448,w:160,h:16,click:function(){
			// left;
			console.log("left")
			if(diesel.mouseX <=32){
				//remove left edge
				for(var i =0; i <level.world.length; i++){
					level.world[i].splice(0,1);
				}
			}
			if(diesel.mouseX > 128){
				for(var i =0; i <level.world.length; i++){
					level.world[i].splice(0,0,level.world[i][0]);
				}
			}
		}},
		{x:0,y:464,w:160,h:16,click:function(){
			// right;
			console.log("right");
			if(diesel.mouseX <=32){
				//remove left edge
				for(var i =0; i <level.world.length; i++){
					level.world[i].pop();
				}
			}
			if(diesel.mouseX > 128){
				for(var i =0; i <level.world.length; i++){
					level.world[i].push(level.world[i][level.world[i].length-1]);
				}
			}
		}},
		{x:0,y:480,w:160,h:16,click:function(){
			// top;
			console.log("top")
			if(diesel.mouseX <=32){
				//remove top edge
				level.world.splice(0,1);
				
			}
			if(diesel.mouseX > 128){
				//add row at top
				var row = [];
				for (var i = 0 ; i < level.world[0].length; i++){
					row.push(level.world[0][i]);
				}
				level.world.splice(0,0,row);
			}
		}},
		{x:0,y:496,w:160,h:16,click:function(){
			// bottom;
			console.log("bottom")
			if(diesel.mouseX <=32){
				//remove bottom edge
				level.world.pop(0,1);
				
			}
			if(diesel.mouseX > 128){
				//add row at bottom
				var row = [];
				for (var i = 0 ; i < level.world[level.world.length -1].length; i++){
					row.push(level.world[level.world.length -1][i]);
				}
				level.world.push(row);
			}
		}},
		
		
	];
	
	

	this.draw=function(){
		if(this.rehash){
			//draw the panels for ents, squares
			game.context.back.clearRect(0,0,game.width,game.height);
			game.context.back.fillStyle= "#333333";
			game.context.back.fillRect(0,16, 160, 160);
			game.context.back.fillRect(0,192, 160, 160);
			game.context.back.fillRect(0,368, 79, 80);
			game.context.back.fillRect(80,368, 79, 80);
	
			
			game.context.back.fillStyle="#ffffff";
			game.context.back.fillText("world",16,16);
			game.context.back.fillText("entities",16,192);
			game.context.back.fillText("units",0,368);
			game.context.back.fillText("effects",80,368);
			
			game.context.back.fillText("+   -",16,400);
			game.context.back.fillText("+   -",96,400);
					game.context.back.fillText("Show",16,432);
			game.context.back.fillText("Show",96,432);
			game.context.back.fillText("save",16,544);
			game.context.back.fillText("-  Grid zoom   +",0,560);
			game.context.back.fillText("L horiz scroll R",0,576);
			game.context.back.fillText("B vert scroll  T",0,592);
			game.context.back.fillText("-  Left  Edge  +",0,464);
			game.context.back.fillText("-  Right Edge  +",0,480);
			game.context.back.fillText("-    Top Edge  +",0,496);
			game.context.back.fillText("- Bottom Edge +",0,512);
			
			
			var spr =diesel.spriteCache["tiles.png"];
			game.context.back.save();
			game.context.back.translate(0,16);
			
			for(var i =0; i < spr.numAnimations();i++){
				var data = spr.getSprite(i,0);
				game.context.back.drawImage(spr.image,data[0],data[1],data[2],data[3], this.tileGrid *(i %10) + 1,
				this.tileGrid * Math.floor(i /10) +1, this.tileGrid -2, this.tileGrid -2);
				
			}
			game.context.back.translate(0,176);
			
			spr = diesel.spriteCache["ents.png"];
			for(var i =0; i < spr.numAnimations();i++){
				var data = spr.getSprite(i,0);
				game.context.back.drawImage(spr.image,data[0],data[1],data[2],data[3], this.tileGrid *(i %10) + 1,
				this.tileGrid * Math.floor(i /10) +1, this.tileGrid -2,this.tileGrid -2);
			}
			
			game.context.back.restore();
			this.rehash =false;
		}		
		
		game.context.front.clearRect(0,0,game.width,game.height);
		
		
		game.context.front.save();
		game.context.front.translate(160,0);
		game.context.front.translate(this.offset.x * -1, this.offset.y)
		
		//draw the world
		var	grid = this.grid *this.zoom;
		//the checkerboard
		game.context.front.fillStyle= "rgba(255,255,255,.25)";
		for(var _y = 0; _y < level.world.length; _y++){
			for(var _x = 0; _x < level.world[_y].length; _x++){
				if( _y %2 ==0 ){
					if(_x %2 ==0){
						game.context.front.fillRect(_x *grid, _y*grid ,grid,grid);
						
					}
					else{
						game.context.front.clearRect(_x *grid, _y*grid ,grid,grid);
					}
				}
				else{
					if(_x %2 ==0){
						game.context.front.clearRect(_x *grid, _y*grid ,grid,grid);
					}
					else{
						game.context.front.fillRect(_x *grid, _y*grid ,grid,grid);
					}
				}
			}
		}
	for(var _y = 0; _y < level.world.length; _y++){
			for(var _x = 0; _x < level.world[_y].length; _x++){
				
				if(level.world[_y][_x] >0){
						var spr = diesel.spriteCache["tiles.png"];
						var src = spr.getSpriteByIndex( level.world[_y][_x]*spr.frames);
				
				
						game.context.front.drawImage(spr.image, src[0],src[1],src[2],src[3],
							_x *grid, _y*grid ,grid,grid);
				}
				else{
					var spr = diesel.spriteCache["ents.png"];
					var idx = Math.abs(level.world[_y][_x]);
					var src = spr.getSprite(idx, Math.floor(diesel.frameCount/10)%spr.frames );
						game.context.front.drawImage(spr.image, src[0],src[1],src[2],src[3],
							_x *grid, _y*grid ,grid,grid);
				}
				
				game.context.front.fillText(level.world[_y][_x],_x *grid, _y*grid +grid);
			}
		}
		
		game.context.front.restore();
		
		//draw the ui elelemnts
		game.context.front.clearRect(0,0,160, game.height);
		//darw zoom bar
		game.context.front.fillStyle = "#0000ff";
		game.context.front.fillRect(this.zoom * 160, 544, 1,16);
		
		//draw left an right offsets
		game.context.front.fillRect((this.offset.x/this.grid / level.world[0].length) * 160, 560, 1,16);
		game.context.front.fillRect((this.offset.y /this.grid / level.world[0].length) * 160, 576, 1,16);
		
		//draw the mouse index
		game.context.front.fillStyle = "#ffffff";
		if(diesel.mouseX >160){
			var g =(this.grid *this.zoom);
			var x = Math.floor((diesel.mouseX + this.offset.x - 160)/g);
			var y = Math.floor((diesel.mouseY - this.offset.y)/g);
		
			game.context.front.fillText("Mouse: ("+x+","+y+")",0,528);
		
		}
		
		//draw the ent count and the unit count;
		game.context.front.fillText(level.units.length +" items",0, 384);
		game.context.front.fillText(level.effects.length +" items",80, 384);
		

		
		if(this.selectedType){
			game.context.front.strokeStyle="#00ff00";
			var x=this.selectedI % 10 * this.tileGrid,y=0;
			if(this.selectedType == "world"){
				
				y = Math.floor(this.selectedI /10)* this.tileGrid +16;
			}
			if(this.selectedType == "ent"){
				y = Math.floor(this.selectedI /10)* this.tileGrid+192;
			}
			game.context.front.strokeRect(x,y,this.tileGrid, this.tileGrid );
		}	
	}
}
game.screens.editor.prototype = game.screens.base;
game.screens.editor = new game.screens.editor();
