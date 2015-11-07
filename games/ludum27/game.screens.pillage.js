/*





*/

game.screens.pillage = {
	
	"locs":{
		"meFace":{x:680,y:128,w:128,h:128},
		"meSecs":{x:660,y:320,w:600,h:240},
		"badFace":{x:472,y:128,w:128,h:128},
		"badSecs":{x:20,y:320,w:600,h:240},
		//"goButton":{x:580,y:620,w:120,h:100},
		"noButton":{x:300,y:620,w:320,h:100},
		"swapButton":{x:660,y:620,w:320,h:100},
		"width":55,
		"gap":4
	},
	"reset":function(){
		this.dropIdx =false;

	},
	"dropIdx":0,
	
	
	
	"draw":function(ticks){
		
		var ctx = game.context.foreground;

		
		game.context.main.fillStyle = "#ffffff";
		game.context.main.globalAlpha = .1;
		game.context.main.fillRect(0,0,game.settings.width,game.settings.height);
		game.context.main.globalAlpha = 1;
		
		var width= game.screens.pillage.locs.width, gap =game.screens.pillage.locs.gap;
		ctx.clearRect(0,0,game.settings.width,game.settings.height);

		ctx.save();
		
		//draw possilbe second
		ctx.translate(game.screens.pillage.locs.badSecs.x,game.screens.pillage.locs.badSecs.y);
		ctx.drawImage(diesel.imageCache[game.opponents[game.duel-1].thisSecond.body],
			0,0,
			game.opponents[game.duel-1].thisSecond.w,game.opponents[game.duel-1].thisSecond.h);
	

		
		ctx.restore();
		ctx.save();

		ctx.translate(game.screens.pillage.locs.meSecs.x,game.screens.pillage.locs.meSecs.y);
		for(pick in game.me.secondDeck){
			if(game.me.secondDeck[pick].used){
				ctx.fillStyle = "#333333";
				ctx.fillRect(0,0,width,width)
			}
			if(pick==this.dropIdx){
				ctx.fillStyle = "#00ff00";
				ctx.fillRect(0,0,width,width)
			}
		
			ctx.drawImage(diesel.imageCache[game.me.secondDeck[pick].body],0,0,width,width*2);
			ctx.translate(width + gap,0);
		}
		ctx.restore();

		//draw bxes for info text		
		
		ctx.clearRect(game.screens.picker.locs.badSecs.x,game.screens.pillage.locs.badSecs.y+width,
							game.screens.picker.locs.badSecs.w,game.screens.pillage.locs.badSecs.h-width);
								
		ctx.clearRect(game.screens.picker.locs.meSecs.x,game.screens.pillage.locs.meSecs.y+width,
							game.screens.picker.locs.meSecs.w,game.screens.pillage.locs.meSecs.h-width);

		
							
								
				
							
		ctx.fillStyle= "#ff0000";
		ctx.fillRect(game.screens.pillage.locs.noButton.x,game.screens.pillage.locs.noButton.y,
							game.screens.pillage.locs.noButton.w,game.screens.pillage.locs.noButton.h);
							
		ctx.fillRect(game.screens.pillage.locs.swapButton.x,game.screens.pillage.locs.swapButton.y,
							game.screens.pillage.locs.swapButton.w,game.screens.pillage.locs.swapButton.h);		
		ctx.fillStyle= "#333333";
		ctx.font = game.settings.bigFont;
		ctx.fillText("NO",game.screens.pillage.locs.noButton.x+16 ,game.screens.pillage.locs.noButton.y + game.screens.pillage.locs.noButton.h-16);
		ctx.fillText("SWAP",game.screens.pillage.locs.swapButton.x+16 ,game.screens.pillage.locs.noButton.y + game.screens.pillage.locs.swapButton.h-16);
		
		
		ctx.font = game.settings.font;
		
		
		if(game.screens.pillage.dropIdx !== false){
			ctx.fillText(game.me.secondDeck[game.screens.pillage.dropIdx].name, 
				game.screens.pillage.locs.meSecs.x,game.screens.pillage.locs.meSecs.y,
				game.screens.pillage.locs.meSecs.w,game.screens.pillage.locs.meSecs.h
			);	
			ctx.fillText(game.me.secondDeck[game.screens.pillage.dropIdx].description, 
				game.screens.pillage.locs.meSecs.x,game.screens.pillage.locs.meSecs.y +width*2 +gap*2,
				game.screens.pillage.locs.meSecs.w,game.screens.pillage.locs.meSecs.h
			);
			ctx.fillText(game.me.secondDeck[game.screens.pillage.dropIdx].effects, 
				game.screens.pillage.locs.meSecs.x,game.screens.pillage.locs.meSecs.y +width*4 +gap*4,
				game.screens.pillage.locs.meSecs.w,game.screens.pillage.locs.meSecs.h
			);
		}
		if(game.opponents[game.duel -1] !== false){
			ctx.fillText(game.opponents[game.duel-1].thisSecond.name, 
				game.screens.pillage.locs.badSecs.x,game.screens.pillage.locs.badSecs.y,
				game.screens.pillage.locs.badSecs.w,game.screens.pillage.locs.badSecs.h
			);		
			ctx.fillText(game.opponents[game.duel-1].thisSecond.description, 
				game.screens.pillage.locs.badSecs.x,game.screens.pillage.locs.badSecs.y +width*2 +gap*2,
				game.screens.pillage.locs.badSecs.w,game.screens.pillage.locs.badSecs.h
			);
			ctx.fillText(game.opponents[game.duel-1].thisSecond.effects, 
				game.screens.pillage.locs.badSecs.x,game.screens.pillage.locs.badSecs.y +width*4 +gap*4,
				game.screens.pillage.locs.badSecs.w,game.screens.pillage.locs.badSecs.h
			);
		}
		
		ctx.fillStyle = "#333333";
		
		ctx.font = game.settings.bigFont;
		ctx.fillText("You Win" , game.settings.width/4, game.settings.height/4);

		ctx.font = game.settings.font;
		ctx.fillText("You can swap one of your 10 seconds for the second you just faced. Would you like to?" , game.settings.width/8, game.settings.height/4 +game.settings.fontSize*2);
		
		ctx.fillText("My 10 seconds:" ,	game.screens.pillage.locs.meFace.x,game.screens.pillage.locs.meFace.y+game.screens.pillage.locs.meFace.h + game.settings.fontSize);
		

		
		
	
	},
	"update":function(ticks){
		if(game.screens.pillage.goTime !== false ){
			game.screens.pillage.goTime-=ticks;
			if( game.screens.pillage.goTime <0.5)
			{
				//select some seconds
				game.me.selectSecond(	game.screens.pillage.meSecondIdx);
				game.opponents[game.duel].chooseSecond();
				//goto the fight scene
			//	game.screens.picker.reset();
				game.settings.screen = "picker";
				
				
			}
		}
	
	},
	"click":function(evt){
	
		
		if(diesel.mouseY >= game.screens.pillage.locs.meSecs.y && 
			diesel.mouseY <= game.screens.pillage.locs.meSecs.y+ game.screens.pillage.locs.meSecs.h &&
			diesel.mouseX >= game.screens.pillage.locs.meSecs.x && 
			diesel.mouseX <= game.screens.pillage.locs.meSecs.x+ game.screens.pillage.locs.meSecs.w){
				
				//change selected second for me
				
			var y=diesel.mouseY - game.screens.pillage.locs.meSecs.y, 
					x = diesel.mouseX - game.screens.pillage.locs.meSecs.x;
					
		
			if (y <= game.screens.pillage.locs.width + game.screens.pillage.locs.gap){
				game.screens.pillage.dropIdx = Math.floor(x/(game.screens.pillage.locs.width + game.screens.pillage.locs.gap));
				
			}
		}
		
		
//did we click no.
		if(diesel.mouseY >= game.screens.pillage.locs.noButton.y && 
			diesel.mouseY <= game.screens.pillage.locs.noButton.y+ game.screens.pillage.locs.noButton.h &&
			diesel.mouseX >= game.screens.pillage.locs.noButton.x && 
			diesel.mouseX <= game.screens.pillage.locs.noButton.x+ game.screens.pillage.locs.noButton.w){
				game.screens.picker.reset();
				game.settings.screen = "picker";
			}
			
		if(diesel.mouseY >= game.screens.pillage.locs.swapButton.y && 
			diesel.mouseY <= game.screens.pillage.locs.swapButton.y+ game.screens.pillage.locs.swapButton.h &&
			diesel.mouseX >= game.screens.pillage.locs.swapButton.x && 
			diesel.mouseX <= game.screens.pillage.locs.swapButton.x+ game.screens.pillage.locs.swapButton.w){
			
				if(game.me.secondDeck[game.screens.pillage.dropIdx]){
					if(game.me.secondDeck[game.screens.pillage.dropIdx].used){
						alert("You cannot drop used seconds");
						return;
					}
					if(confirm("Are you sure you want to swap your "+game.me.secondDeck[game.screens.pillage.dropIdx].name+" second for this "+game.opponents[game.duel-1].thisSecond.name+"?"))
					{
						
						game.me.secondDeck[game.screens.pillage.dropIdx] = game.opponents[game.duel-1].thisSecond;
							game.me.secondDeck[game.screens.pillage.dropIdx].used =false;
					
						game.screens.picker.reset();
					game.settings.screen = "picker";
					}
				}
			}
	}
	
};
