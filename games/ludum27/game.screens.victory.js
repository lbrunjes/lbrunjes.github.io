/*





*/

game.screens.victory = {
	"score": Math.random() *10000,
	"draw":function(ticks){
		
		game.context.main.fillStyle = "#ffffff";
		game.context.main.globalAlpha = .1;
		game.context.main.fillRect(0,0,game.settings.width,game.settings.height);
		game.context.main.globalAlpha = 1;
		
		var ctx = game.context.foreground;
		game.context.main.drawImage( diesel.imageCache["victory.png"], game.settings.width/4,32);
		ctx.clearRect(0,0,game.settings.width,game.settings.height);
		ctx.fillStyle = "#333333";
		
		ctx.font = game.settings.bigFont;
		var width = ctx.measureText("Score: " + Math.floor(game.screens.victory.score)).width;
		ctx.fillText("Score: " + Math.floor(game.screens.victory.score) , game.settings.width/2 -width/2, game.settings.height/4*3);
		
		ctx.font = game.settings.font;
		width = ctx.measureText("[Click to restart]").width;
	
		ctx.fillText("[Click to restart]" , game.settings.width/2-width/2, game.settings.height- game.settings.fontSize);
	
	},
	"update":function(ticks){
			
	
	},
	"click":function(evt){
		window.location = "";
	}
	
};
