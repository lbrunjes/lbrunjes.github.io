/*
 screens




*/
game.screens ={};
game.screens.static = {
	draw:function(ticks){
		
		var ctx = game.context.top;
		ctx.clearRect(0,0, game.width,  game.height);
		for(var x = Math.random() *2; x <  game.width; x+=5){
			for(var y = Math.random() *2; y <  game.height; y+=5){	
				ctx.fillStyle= "rgba(255,255,255,"+Math.random()/25+")";
				ctx.fillRect(x,y,5,5);
			}
		}
		game.context.output3.clearRect(0,0, game.width, game.height);
		game.context.output3.drawImage(output2,0,0, game.width, game.height);
		game.context.output2.clearRect(0,0, game.width, game.height);
		game.context.output2.drawImage(output,0,0, game.width, game.height);
		
		
		game.context.output.clearRect(0,0, game.width, game.height);
		
		
		game.context.output.drawImage(video,0,0, game.width, game.height);
		
		var stuff = game.context.output.getImageData(0,0, game.width, game.height);
		
		//red tint based on movement values
		//console.log(stuff,stuff.data.length);
		for(var i  =0; i < stuff.data.length; i +=4){
			stuff.data[i+1] = stuff.data[i];
			stuff.data[i+2] = stuff.data[i];
			stuff.data[i+3] = 96;
		}
		
		game.context.output.putImageData(stuff,0,0);
	
	}
}
