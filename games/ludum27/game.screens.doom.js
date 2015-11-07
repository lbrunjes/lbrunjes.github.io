/*





*/

game.screens.doom = {
	
	"draw":function(ticks){
		
		
		var ctx = game.context.foreground;
		
		ctx.clearRect(0,0,game.settings.width,game.settings.height);
		/*
		ctx.save();
			ctx.fillStyle = "#ffffff";
			ctx.font = game.settings.bigFont;
			
			ctx.translate(Math.sin(diesel.frameCount/10)*5,Math.cos(diesel.frameCount/10)*5);
			ctx.fillText("Lost!" , game.settings.width/5, game.settings.height/5);		
			ctx.fillStyle = "#ff0000";
			ctx.translate(Math.cos(diesel.frameCount/10)*5,Math.sin(diesel.frameCount/10)*5);
			
			ctx.fillText("Lost!" , game.settings.width/5, game.settings.height/5);		
			ctx.font = game.settings.font;
			
		ctx.restore();
	
		ctx.fillStyle = "#333333";
		
		ctx.font = game.settings.bigFont;
		ctx.fillText("Lost!" , game.settings.width/5, game.settings.height/5);
			*/
		ctx.drawImage( diesel.imageCache["doom.png"], game.settings.width/8,game.settings.height/5);
		
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
