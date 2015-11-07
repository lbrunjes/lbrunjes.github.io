/*





*/

game.screens.picker = {

	"locs":{
		"meFace":{x:680,y:128,w:128,h:128},
		"meSecs":{x:660,y:320,w:600,h:240},
		"badFace":{x:472,y:128,w:128,h:128},
		"badSecs":{x:20,y:320,w:600,h:240},
		"goButton":{x:580,y:620,w:120,h:100},
		"width":55,
		"gap":4
	},

	"meSecondIdx":0,
	"themSecondIdx":false,
	"goTime": false,
	"reset":function(){
		game.screens.picker.meSecondIdx=false;
		game.screens.picker.themSecondIdx=false;
		game.screens.picker.goTime= false;
	},
	"draw":function(ticks){
	

		var ctx = game.context.foreground;
		
		var width= game.screens.picker.locs.width, gap =game.screens.picker.locs.gap;

		ctx.clearRect(0,0,game.settings.width,game.settings.height);

		ctx.save();

			//drw seconds lists
		ctx.font = game.settings.font;
		ctx.translate(game.screens.picker.locs.badSecs.x,game.screens.picker.locs.badSecs.y);
		ctx.fillText("Possible opposing seconds:",0,0);
		for(pick in game.opponents[game.duel].secondDeck){
			if(game.me.hasUsedSpy && game.opponents[game.duel].secondDeck[pick].name==game.opponents[game.duel].thisSecond.name){
				ctx.fillRect(0,0,width,width)
			}
				ctx.drawImage(diesel.imageCache[game.opponents[game.duel].secondDeck[pick].body],0,0,width,width*2);
				ctx.translate(width + gap,0);

		}
		ctx.restore();
		ctx.save();
		
		ctx.translate(game.screens.picker.locs.meSecs.x,game.screens.picker.locs.meSecs.y);
		ctx.font = game.settings.font;
		
		ctx.fillText("Pick your second:",0,0);
		for(pick in game.me.secondDeck){

			if(pick==this.meSecondIdx){
				ctx.fillStyle = "#00ff00";
				ctx.fillRect(0,0,width,width)
			}
			if(game.me.secondDeck[pick].used){
				ctx.fillStyle = "#333333";
				ctx.fillRect(0,0,width,width)
			}
			
			ctx.drawImage(diesel.imageCache[game.me.secondDeck[pick].body],0,0,width,width*2);
			ctx.translate(width + gap,0);
		}
		ctx.restore();



		//draw bxes for info text
		ctx.fillStyle = "#333333";

		ctx.clearRect(game.screens.picker.locs.badSecs.x,game.screens.picker.locs.badSecs.y+width,
							game.screens.picker.locs.badSecs.w,game.screens.picker.locs.badSecs.h-width);

		ctx.clearRect(game.screens.picker.locs.meSecs.x,game.screens.picker.locs.meSecs.y+width,
							game.screens.picker.locs.meSecs.w,game.screens.picker.locs.meSecs.h-width);
		ctx.fill();




		//Go box.
		ctx.fillStyle= "#ff0000";
		ctx.fillRect(game.screens.picker.locs.goButton.x,game.screens.picker.locs.goButton.y,
							game.screens.picker.locs.goButton.w,game.screens.picker.locs.goButton.h);
		ctx.fillStyle= "#333333";
		ctx.font = game.settings.bigFont;
		if(!game.screens.picker.goTime){
			ctx.fillText("GO",game.screens.picker.locs.goButton.x+16 ,game.screens.picker.locs.goButton.y + game.screens.picker.locs.goButton.h-16);
		}
		else{
			var centerw = ctx.measureText(Math.ceil(game.screens.picker.goTime)).width;
			ctx.fillText(Math.ceil(game.screens.picker.goTime), game.screens.picker.locs.goButton.x + (game.screens.picker.locs.goButton.w/2) - (centerw/2),game.screens.picker.locs.goButton.y  + game.screens.picker.locs.goButton.h-32);
		}
		ctx.font = game.settings.font;

		//selected info
		//TODO Picker
		if(game.screens.picker.meSecondIdx !== false){
			ctx.fillText(game.me.secondDeck[game.screens.picker.meSecondIdx].name,
				game.screens.picker.locs.meSecs.x,game.screens.picker.locs.meSecs.y +width +gap*2 + game.settings.fontSize,
				game.screens.picker.locs.meSecs.w,game.screens.picker.locs.meSecs.h
			);
			ctx.fillText(game.me.secondDeck[game.screens.picker.meSecondIdx].description,
				game.screens.picker.locs.meSecs.x,game.screens.picker.locs.meSecs.y +width*2 +gap*2 + game.settings.fontSize,
				game.screens.picker.locs.meSecs.w,game.screens.picker.locs.meSecs.h
			);
			ctx.fillText(game.me.secondDeck[game.screens.picker.meSecondIdx].effects,
				game.screens.picker.locs.meSecs.x,game.screens.picker.locs.meSecs.y +width*4 +gap*4 + game.settings.fontSize,
				game.screens.picker.locs.meSecs.w,game.screens.picker.locs.meSecs.h
			);
		}
		if(game.screens.picker.themSecondIdx !== false){
			ctx.fillText(game.opponents[game.duel].secondDeck[game.screens.picker.themSecondIdx].name,
				game.screens.picker.locs.badSecs.x,game.screens.picker.locs.badSecs.y +width +gap*2 + game.settings.fontSize,
				game.screens.picker.locs.badSecs.w,game.screens.picker.locs.badSecs.h
			);
			ctx.fillText(game.opponents[game.duel].secondDeck[game.screens.picker.themSecondIdx].description,
				game.screens.picker.locs.badSecs.x,game.screens.picker.locs.badSecs.y +width*2 +gap*2 + game.settings.fontSize,
				game.screens.picker.locs.badSecs.w,game.screens.picker.locs.badSecs.h
			);
			ctx.fillText(game.opponents[game.duel].secondDeck[game.screens.picker.themSecondIdx].effects,
				game.screens.picker.locs.badSecs.x,game.screens.picker.locs.badSecs.y +width*4 +gap*4 + game.settings.fontSize,
				game.screens.picker.locs.badSecs.w,game.screens.picker.locs.badSecs.h
			);
		}

		ctx.fillStyle = "#333333";

		ctx.font = game.settings.bigFont;

		var lengthstr = ctx.measureText(game.opponents[game.duel].name).width;



		ctx.fillText(game.opponents[game.duel].name, game.screens.picker.locs.badFace.x+game.screens.picker.locs.badFace.w - lengthstr,game.screens.picker.locs.badFace.y);
		ctx.fillText("YOU",	game.screens.picker.locs.meFace.x,game.screens.picker.locs.meFace.y+game.screens.picker.locs.meFace.h );

		lengthstr =  ctx.measureText("VS").width;
		ctx.fillText("VS" , game.settings.width/2 - lengthstr/2, game.settings.height/4);//TODO FIX THIS WITH MEASURE STRING



	},
	"update":function(ticks){
		if(game.screens.picker.goTime !== false ){
			game.screens.picker.goTime-=ticks;
			if( game.screens.picker.goTime <0.5)
			{
				//select some seconds
				game.me.selectSecond(	game.screens.picker.meSecondIdx);
				//game.opponents[game.duel].chooseSecond();
				//goto the fight scene
				game.screens.duel.reset();
				game.settings.screen = "duel";


			}
		}

	},
	"click":function(evt){

		if(diesel.mouseY >= game.screens.picker.locs.goButton.y &&
			diesel.mouseY <= game.screens.picker.locs.goButton.y+ game.screens.picker.locs.goButton.h &&
			diesel.mouseX >= game.screens.picker.locs.goButton.x &&
			diesel.mouseX <= game.screens.picker.locs.goButton.x+ game.screens.picker.locs.goButton.w){

			if(!game.me.secondDeck[game.screens.picker.meSecondIdx].used && !game.screens.picker.goTime && game.screens.picker.meSecondIdx !== false){
				game.screens.picker.goTime=3;
			}
			else{
				game.screens.picker.goTime =false;
				diesel.soundCache["miss"].play();
			}

		}


		if(diesel.mouseY >= game.screens.picker.locs.badSecs.y &&
				diesel.mouseY <= game.screens.picker.locs.badSecs.y+ game.screens.picker.locs.badSecs.h &&
				diesel.mouseX >= game.screens.picker.locs.badSecs.x &&
				diesel.mouseX <= game.screens.picker.locs.badSecs.x+ game.screens.picker.locs.badSecs.w ){

			//change selected second for baddie
			var y=diesel.mouseY - game.screens.picker.locs.badSecs.y,
				x = diesel.mouseX - game.screens.picker.locs.badSecs.x;

			if (y <= game.screens.picker.locs.width + game.screens.picker.locs.gap){
				game.screens.picker.themSecondIdx = Math.floor(x/(game.screens.picker.locs.width + game.screens.picker.locs.gap));

			}
		}


		if(diesel.mouseY >= game.screens.picker.locs.meSecs.y &&
			diesel.mouseY <= game.screens.picker.locs.meSecs.y+ game.screens.picker.locs.meSecs.h &&
			diesel.mouseX >= game.screens.picker.locs.meSecs.x &&
			diesel.mouseX <= game.screens.picker.locs.meSecs.x+ game.screens.picker.locs.meSecs.w){

				//change selected second for me

			var y=diesel.mouseY - game.screens.picker.locs.meSecs.y,
					x = diesel.mouseX - game.screens.picker.locs.meSecs.x;
			if (y <= game.screens.picker.locs.width + game.screens.picker.locs.gap){
				game.screens.picker.meSecondIdx = Math.floor(x/(game.screens.picker.locs.width + game.screens.picker.locs.gap));
			}
		}



	}

};
