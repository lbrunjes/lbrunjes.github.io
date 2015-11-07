/*





*/

game.screens.intro = {
	
	"draw":function(ticks){
	
		game.context.main.fillStyle = "#ffffff";
		game.context.main.globalAlpha = .1;
		game.context.main.fillRect(0,0,game.settings.width,game.settings.height);
		game.context.main.globalAlpha = 1;
		
		var ctx = game.context.foreground;
		ctx.clearRect(0,0,game.settings.width,game.settings.height);
		ctx.fillStyle = "#333333";
		
		ctx.font = game.settings.bigFont;
		ctx.fillText("Sonova--" , game.settings.width/3, game.settings.height/3);
		
		ctx.font = game.settings.font;
		ctx.fillText("Apparently it's dueling season." , game.settings.width/3, game.settings.height/3 + game.settings.fontSize);
		ctx.fillText("Your 10 worst enemies have challenged ", game.settings.width/3, game.settings.height/3 + game.settings.fontSize *2.2);
		ctx.fillText("you to 10 10 second duels on the same day. " , game.settings.width/3, game.settings.height/3 + game.settings.fontSize *3.3);
				ctx.fillStyle = "#ff0000";
		ctx.fillText("For Glory!!" , game.settings.width/3, game.settings.height/3 + game.settings.fontSize *5.5);
		
		ctx.fillStyle = "#333333";
		ctx.fillText("Your only hope to survive:" , game.settings.width/3, game.settings.height/3 + game.settings.fontSize *7.7);
		ctx.fillText("Pick Your Seconds carefully" , game.settings.width/3+25, game.settings.height/3 + game.settings.fontSize *8.8);
		ctx.fillText("10 Seconds " , game.settings.width/3+17, game.settings.height/3 + game.settings.fontSize *9.9);
				
		ctx.fillText("[Click to continue]" , game.settings.width/3, game.settings.height/3*2 + game.settings.fontSize*2);
	
	},
	"update":function(ticks){
			
	
	},
	"click":function(evt){
		game.settings.screen = "picker";
	}
	
};
