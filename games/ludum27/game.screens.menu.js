/*





*/

game.screens.menu = {
	
	"draw":function(ticks){
		game.context.main.fillStyle = "#ffffff";
		game.context.main.globalAlpha = .1;
		game.context.main.fillRect(0,0,game.settings.width,game.settings.height);
		game.context.main.globalAlpha = 1;
		
		var ctx = game.context.foreground;
		ctx.clearRect(0,0,game.settings.width,game.settings.height);
		ctx.fillStyle = "#333333";
		
		ctx.font = game.settings.bigFont;
		ctx.fillText("Ten Seconds" , game.settings.width/3, game.settings.height/3);
		
		ctx.font = game.settings.font;
		ctx.fillText("People Just Don't Seem to like you. Do they?" , game.settings.width/3, game.settings.height/3 + game.settings.fontSize);
		ctx.fillText("[Click to begin]" , game.settings.width/3, game.settings.height/3*2 );
	
	},
	"update":function(ticks){
	
	
	},
	"click":function(evt){
		game.settings.screen = "intro"; //really?
	
	}
	
};
