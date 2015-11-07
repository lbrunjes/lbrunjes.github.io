var game={
	"container":"container",
	"font": "monospace",
	"fontSize":16,
	"width":800,
	"height":400,
	colors:[],
	"settings":{
		dataDirectory:"data/",
		currentScreen:"loading",
		
	},
	"context":{
		"world":"2d",
		"base":"3d",
		"hud":"2d"
	},
	"events":{
		"draw":function(evt){
			if(game.screens[game.settings.currentScreen]  && game.screens[game.settings.currentScreen].draw){
				game.screens[game.settings.currentScreen].draw(evt);
			}

		},
		"update":function(evt){


		},
		"mousedown":function(e){
			game.events.fillRegion(e);

		},
		

		"startup":function(){
			game.fillRegion();



		},
		"fillRegion":function(){
			var all =new Date();			
			//set upa number of colors pt theim in the colors array
			game.colors =[];
			var colors = 10;
			var html ="";
			for(var i = 0;  i< colors;i++){
				game.colors.push({
					r: Math.floor(Math.random()*255),
					g: Math.floor(Math.random()*255),
					b: Math.floor(Math.random()*255),
					a: 255,
					x: Math.floor(Math.random()*64)+32,
					y: Math.floor(Math.random()*64)+32,
					noise: new SimplexNoise()
				});
				
				html += '<li style="color:rgba('+
					game.colors[i].r+','+
					game.colors[i].g+','+
					game.colors[i].b+',1)">Region #'+ i+'</li>';
			}
				
			document.getElementById("list").innerHTML =html;
			var start = new Date();
			var pixels  = game.context.world.getImageData(0, 0, game.width, game.height);
			var grey = 90;
					
			for(var x=0; x<game.width;x++){
				for(var y=0; y < game.height;y++){
					var best = -1;
					var color = "#000";

					//find the biggest color:
					for(var i=0;i <game.colors.length;i++){

						var h = game.colors[i].noise.noise(x/game.colors[i].x,y/game.colors[i].y);
					
					if(h > best){
								best = h;
								
								var idx =(x +y *game.width) *4, boundry =false;
								var upIdx =(x +(y-1) *game.width) *4, boundry =false;
								
								pixels.data[idx]   = game.colors[i].r;
								pixels.data[idx+1] = game.colors[i].g;
								pixels.data[idx+2] = game.colors[i].b;
								pixels.data[idx+3] = 255;

								//draw boundry pixels
								//basicall scan left and up to see if we are a transtition square if we are turn grey.
								// if we were doing this for ralsy we would use direction towards either the palyer or world origin, maybe both snce we would be doing one dot at a time.

								if(x > 0 && 
									(pixels.data[idx]!=pixels.data[idx-4] && pixels.data[idx -4]!=grey) ||
									(pixels.data[idx+1]!=pixels.data[idx-3] && pixels.data[idx -3]!=grey)||
									(pixels.data[idx+2]!=pixels.data[idx-2] && pixels.data[idx -2]!=grey)){
										boundry =true;
									
								}
								if(y > 0 && !boundry &&
									(pixels.data[idx]!=pixels.data[upIdx-4] && pixels.data[upIdx -4]!=grey) ||
									(pixels.data[idx+1]!=pixels.data[upIdx-3] && pixels.data[upIdx -3]!=grey)||
									(pixels.data[idx+2]!=pixels.data[upIdx-2] && pixels.data[upIdx -2]!=grey)){
										boundry =true;
									
								}
								if(boundry){
									pixels.data[idx]   = grey;
									pixels.data[idx+1] = grey;
									pixels.data[idx+2] = grey;
									pixels.data[idx+3] = grey;

								}

							}
					
						
					}
					
				}
			}
			
			game.context.world.putImageData(pixels,0,0);
		
			


			console.log(new Date() - start +" ms doing pixels. "+(new Date() -all) +" ms with colorgen");
		}

	},
	screens:{
		"loading":{


		}

	}
}
