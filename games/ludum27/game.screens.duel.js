/*





*/

game.screens.duel = {
	"timePassed":0,
	"lastSecond":-1,
	"reset":function(){
		game.screens.duel.timePassed =0;
		game.screens.duel.lastSecond =-1;

		if(game.duel < game.duels.length){
			game.duels[game.duel].init(game.me, game.opponents[game.duel]);
		}
	},

	"draw":function(ticks){
		
		if(game.duel >= game.duels.length || !game.duels[game.duel]){
			return;
		}
		var ctx = game.context.foreground, main=game.context.main,


		track={x:140,y:180,w:1000,h:360};
		ctx.clearRect(0,0,game.settings.width,game.settings.height);
		main.clearRect(0,0, game.settings.width, game.settings.height);
		ctx.fillStyle= "#333333";
		ctx.font = game.settings.bigFont;
		ctx.fillText("DUEL #"+(game.duel+1),game.settings.width/3,76);
		
		//draw time left
		/*
		var secwidth = ctx.measureText(10 - this.lastSecond).width;
		ctx.fillText(10 - this.lastSecond, game.settings.width/2 - secwidth/2, game.settings.height -16);
*/

		main.save();

		main.translate(1140,440);

    main.font = game.settings.font;
    main.fillStyle = "#333333";
    main.fillText(game.duels[game.duel].goodDude.name, -125,200);

		main.scale(-1,1)


		game.context.main.fillStyle = "#00ff00";
		game.duels[game.duel].goodDude.draw(main);
		main.translate(64,64 + Math.sin(diesel.frameCount/10))
		game.duels[game.duel].goodDude.thisSecond.draw(main);



		main.restore();
		main.save();
		main.translate(340,440);

    main.font = game.settings.font;
    main.fillStyle = "#333333";
    main.fillText(game.duels[game.duel].badDude.name, -100,200);

		game.context.main.fillStyle = "#ff0000";
		game.duels[game.duel].badDude.draw(main);
		main.translate(64,64 +Math.cos(diesel.frameCount/10))
		game.duels[game.duel].badDude.thisSecond.draw(main);
		main.restore();

	},
	"update":function(ticks){

		if(game.duel < game.duels.length){
			game.screens.duel.timePassed+=ticks;
			var thisSecond = Math.floor(game.screens.duel.timePassed);
			if(thisSecond != game.screens.duel.lastSecond){
				game.duels[game.duel].tick();
			}
			game.screens.duel.lastSecond =thisSecond;
			
			var dude =game.duels[game.duel].goodDude;

			if(dude.action == "move"){
				dude.x += ticks * dude.speed*8;
			}
			dude=game.duels[game.duel].badDude;
			if(dude.action == "move"){
				dude.x += ticks * dude.speed *8;

			}

			if(game.duels[game.duel].winner){
				console.log("gf");
				if(game.duels[game.duel].winner == game.me){
					game.duel++;
					game.screens.pillage.reset();
					if(game.duel >= game.duels.length){
						game.settings.screen ="victory";
					}
					else{
						game.settings.screen ="pillage";
					}
				}
				else{
					game.settings.screen ="doom";
				}
			}

			
		}
	},
	"click":function(evt){

	}

};
