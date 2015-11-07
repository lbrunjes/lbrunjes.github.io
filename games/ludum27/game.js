var game={
	"container":"gameContainer",
	"context":{ //canvas contexts
		"background":null,
		"main":null,
		"foreground":null
	},
	"settings":{ //just what it seems like.
		"width":1280,
		"height":720,
		"font": "24pt caviar_dreams,sans-serif",
		"fontSize":24,
		"bigFont":"64pt kingthings,serif",
		"bigFontSize":64,

		"screen":"menu",
		"dataDirectory":"data/"
	},
	"preload":null, //sets up the vairous bits to be loaded before setup is executed.
	//should be  {"image":"foo.png"}, or {"sound":"derp.ogg"}

	"setup":function(){ //called after engine binds things
				game.context.background.drawImage(diesel.imageCache["background.jpg"], 0, 0, game.settings.width, game.settings.height);
	},

	"assets":{ //things to load or reuse multiple places.

	},
	"objects":[	//used for things that might update or draw

	],
	"events":{ //dom events bound by the engine
		"click":function(evt){
			if(game.screens[game.settings.screen] && game.screens[game.settings.screen].click){
				game.screens[game.settings.screen].click(evt);
			}
			else{
			//console.log(evt)
			//example function
			game.context.foreground.fillText("Clicked", diesel.mouseX, diesel.mouseY);
			//stop processing the event here.
			evt.preventDefault();
			}
		},
		"dblclick":null,
		"mousedown":null,
		"mouseup":null,
		"touchstart":null,
		"touchend":null,
		"touchmove":null
	},
	"screens":{},
	"seconds":[],
	"me":{},
	"opponents":[],
	"duels":[],
	"duel":0
};
