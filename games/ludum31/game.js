// built at Sun 07 Dec 2014 07:52:50 PM EST
var GAME_VERSION = '0.0.1';

var  gameInstance = function(){

	this.activeScreen = "entireGame";

	this.font = "komika-axis";
	this.fontSize = 32;

	this.width =640;
	this.height = 480;

	this.tickers =[
		"Ϣ",
		"☣",
		"畫",
		"☃",
		//"☭",
		"☮",
		
		"♞",
		"ሜ",
		"இ",
		//"Ꭽ",
		"ฐ"]

	this.stocks = {};

	this.history =[];
	this.historyLength = 200;

	this.context = {
		"main":"2d"
	};

	this.items = {}

	//called at instance creation.
	//the dom is likely not to be  loaded
	//diesel may not exist.
	this.init = function(){
		this.width = window.innerWidth;
		this.height =window.innerHeight;

		if(this.width <1100 || this.height < 600){
			alert("Hey,\n the game runs best at at least 1280x720.\nYou can resize or just hope things dont break.\nThey shouldn't break, but you know how it is.");
		}

	};

	//called at diesel start
	//dom should be loaded
	//diesel should exist
	this.startup = function(){

		diesel.fpsLimit = 60;
		game.screens[game.activeScreen].reset();
        game.user = new game.objects.user(500);

		diesel.raiseEvent("createStocks");
        diesel.raiseEvent("updateStocks");



	};


if(!this.events){
	this.events={};
}

this.events.windowresize = function(){
	game.width = window.innerWidth;
	game.height= window.innerHeight;
}
this.events.createStocks = function() {
    if (!game.stocks) {
        game.stocks = {};
    }
    game.tickers.forEach(function (ticker, index, tickers) {
        game.stocks[ticker] = new game.objects.stock("", ticker, "");
    });
    for(var i = 0; i < game.historyLength;i++){
    	diesel.raiseEvent("updateStocks", 0);		
    }
};
this.events.updateStocks = function(lastUpdateSecs) {

    var currentState = {};

    for (var stockname in game.stocks) {
        var stock = game.stocks[stockname];
        if(stock.getCurrentValue() >0 ){
            stock.update(lastUpdateSecs[0]);
            currentState[stock.ticker] = {
                name: stock.name,
                ticker: stock.ticker,
                imagePath: stock.imagePath,
                currentValue: stock.getCurrentValue(),
                lastChange: stock.getLastChange()
            };
        }
    }

    game.history.splice(0, 0, currentState);
    if (game.history.length >= game.historyLength) {
        game.history.pop();
    }
}
if(this.objects){
	this.objects = {};
}this.objects.stock = function(name, ticker, imagePath){

    var _initialValue = Math.random() * 100+50;
    var _currentValue = _initialValue;
    var _lastChange =0;

	this.name = name;
	this.ticker = ticker;
    this.imagePath = imagePath;
    this.color = "#fff";
    this.updateFunction = null;
    this.updateNum = 15;
    //ticks
    this.possibleUpdaters = [
        function(){return ((Math.random() > 0.5) ? -1 : 1) * diesel.clamp(Math.random() / Math.random(), -50,50)},
        function(){
            this.updateNum+=Math.random() -.5;
            return Math.sin(diesel.frameCount/ this.updateNum)* this.updateNum/5 +( Math.random()* this.updateNum -this.updateNum/2)},
            function(){return Math.sin(diesel.frameCount/ this.updateNum)* this.updateNum/5 +( Math.random()* this.updateNum -this.updateNum/2)},
       function(){return Math.atan2( Math.sin(this.updateNum *diesel.frameCount/10), Math.tan(diesel.frameCount/5)) }
    ];

	this.init= function() {
        this.color = "#"+Math.floor(Math .random() *0x9ff+600).toString(16);
        this.updateNum = 15+25*Math.random();
        this.updateFunction = this.possibleUpdaters[(Math.floor(Math.random()*this.possibleUpdaters.length))];

	};

	this.update = function () {
        if(_currentValue > 0){
            _lastChange = this.updateFunction();
           
        }
        else{
            _lastChange = 0;
            // TODO? what do we do with companies that reach negative stock prices? drop them?

            //possilby remo teh negative money from teh player.
        }


        if(Math.random() < .05){
              this.updateFunction = this.possibleUpdaters[(Math.floor(Math.random()*this.possibleUpdaters.length))];

        }

        _currentValue = _currentValue + _lastChange;
 	};



    this.getCurrentValue = function () {
        return _currentValue;
    };

    this.getInitialValue = function () {
        return _initialValue;
    };

    this.getLastChange = function () {
        return _lastChange;
    };

	this.init();
}
this.objects.user = function (initialCash) {

    var _initialCash = initialCash;
    var _currentCash = initialCash;
    var _assets = {};

    this.getCurrentCash = function () {
        return _currentCash;
    };

    this.getInitialCash = function () {
        return _initialCash;
    };

    this.getGainLoss = function () {
        return _currentCash - _initialCash;
    };

    this.getAssets = function () {
        return _assets;
    };

    this.purchaseStock = function (stock) {
        var cost = stock.currentValue;
        if (_currentCash >= cost && cost >0) {
            if (_assets[stock.ticker]) {
                _assets[stock.ticker] += 1;
                _currentCash -= stock.currentValue;
            } else {
                _assets[stock.ticker] = 1;
            }
            return true;
        }
        return false;
    };

    this.sellStock = function (stock) {
        var ticker = stock.ticker;
        if(stock.currentValue >0){
            if (_assets[ticker] && _assets[ticker] > 0) {
                _currentCash += stock.currentValue;
                _assets[ticker] -= 1;
                return true;
            }
        }
        return false;
    };
};

this.objects.textBalloon =function(text,x,y,time){
	this.x =x;
	this.y =y;
	this.text = text || "!!";
	this.time = time || 10;
	this.scale = 1;
	this.scaleTick = .1;
	this.color = "rgba(255,255,255,.5)";
	this.r =  Math.random();

	this.init =function(){};

	this.draw = function(context){
		context.save();
			context.font = game.fontSize+"px "+game.font;
			context.fillStyle= this.color;
			context.translate(this.x,this.y)
			context.scale(this.scale ,this.scale);
			context.fillText(this.text,0,0);

		context.restore();
	};
	this.update= function(ticks){
		this.time -= ticks;
		this.scale += this.scaleTick;
		 this.x -= Math.sin(this.r) *2;
		 this.y -= Math.cos(this.r) *2;
	};

	this.init();
}

this.objects.messageBalloon= function(text){
	this.x = game.width/2;
	this.y = game.height/2;
	this.r = Math.min(game.height/6, game.width/6);
	this.timeLeft = 1;
	this.scale  =.01;
	this.scaleTick = .05;


	this.text = text;

	this.init = function(text){
		if(!text){
			this.text = [
			"Hello",
			"Buy Low. Sell High!",
			"Watch out for bad stocks",
			"Always pay your broker",
			"[click to start]"
			];
		}
		else{
			if(typeof text != "object"){
				this.text = [text];
			}
			else{
				this.text = text;
			}
		}

	};	

	this.draw=function(context){

		context.save();
		
		var s = Math.sin(diesel.frameCount/30)/10;
		
		context.translate(this.x, this.y);
		context.scale(this.scale, this.scale);
		for(var i =0; i < game.tickers.length;i++){
			context.save();
			context.scale(1+s,1+s)
			context.rotate(diesel.frameCount/50 +i/3*2);
			context.translate(0, -this.r)
			context.fillStyle = game.stocks[game.tickers[i]].color;
			
			context.fillText(game.tickers[i],0,0);
			context.restore();
		}

		// context.fillStyle="rgba(255,255,255,0.5)";
		// context.beginPath();
		// context.arc(0,0,this.r,0,Math.PI*2);
		// context.fill();

		context.fillStyle="#fff";
		context.textAlign = "center";
		context.save();
			context.translate(0, -this.r );
		
			var lineh = (this.r*2)/(this.text.length * 2 +1) ;
			
			context.font = lineh+"px "+game.font;

			
			for(var i =0; i < this.text.length ;i++){
				context.translate(0, lineh*2);
				context.fillText(this.text[i],0,0)
			}
		context.restore();

		context.restore();



	};

	this.update= function(ticks){
		if(this.scale < 2){
			this.scale+=this.scaleTick;
		}
	}
	this.init(text);
}
this.screens = {

};

this.screens.theScreen= function(){

	this.selectedStock = "☃";
	this.buySound =false;
	this.sellSound =false;
	this.errSound = false;
	this.thbbSound =false;

	this.actions = 0;
	this.balloons = [];
	this.timeLeft = 60;
	this.paused =true;
	this.endClickCount = 0;
	this.isBgm = false;
	this.lastZoom = 1;

	this.reset = function(){
		if(!this.buySound){
			this.buySound = document.getElementById("buy");
			this.sellSound = document.getElementById("sell");
			this.errSound = document.getElementById("err");
			this.thbbSound = document.getElementById("thbb");
		}
		
		//show the intro screen
		var b  = new game.objects.messageBalloon();
		this.balloons.push(b);

		//TODO reset stuff
		this.endClickCount =0;
		this.timeLeft = 60;


	}

	this.clickZones = [
		
		{	x:0,
			y:0,
			w:window.innerWidth,
			h:window.innerHeight,
			click:function(){
				if(diesel.mouseX <32 && diesel.mouseY < 32){
					game.screens.entireGame.isBgm  = !game.screens.entireGame.isBgm;

					if(game.screens.entireGame.isBgm){
						var snd = document.getElementById("bgm");
						snd.play()

					}
					else{
						var snd = document.getElementById("bgm");
						
						snd.pause();
					}
				}

				if(game.screens.entireGame.paused){
					if(game.screens.entireGame.timeLeft >0){
						game.screens.entireGame.paused = false;
						game.screens.entireGame.balloons = [];
					}
					else{
						if(Math.abs(diesel.mouseX -game.width /2) + Math.abs(diesel.mouseY - game.height/2) < game.height/3*2 && 
							game.screens.entireGame.timeLeft < -5){
							game.screens.entireGame.endClickCount ++;
							if(game.screens.entireGame.endClickCount >= 2 ){
								location.reload();
							}
						}
					}

				}
				else
				if(diesel.mouseY < game.height/3*2){
					//the buy and sell buttons
					if(diesel.mouseX >game.width/6*5 && 
						diesel.mouseX <game.width
					){

						if(diesel.mouseY < game.height/3){
							game.screens.entireGame.buyCurrentStock();
						}
						else{
							game.screens.entireGame.sellCurrentStock();
						}

					}
					//the next selected stock
					if(diesel.mouseX > game.width/3*2 && 
						diesel.mouseX <game.width/6*5){
							game.screens.entireGame.nextStock();
					}
				}
				else{
									//set teh selected ticker to the one we clicked
					if(diesel.mouseX > game.width/3 && diesel.mouseY < game.width/6*5){
						var step = game.width/3*2/game.tickers.length;
						var i = Math.floor((diesel.mouseX - (game.width/3))/step);
						
						game.screens.entireGame.didAction();
						game.screens.entireGame.selectedStock = game.tickers[i];

						game.screens.entireGame.thbbSound.pause();
						game.screens.entireGame.thbbSound.currentTime = 0;
						game.screens.entireGame.thbbSound.play();


					}	
				}



			}
		},
		


	];

	

	this.draw =function(){

		game.context.main.font = "32px komika-axis";

		game.context.main.clearRect(0,0,game.width, game.height);

		//draw a rect for the graph
		this.drawGraph(game.context.main, game.history, 0,0, game.width/3*2, game.height/3*2);

		//draw buy buttons
		this.drawButtons(game.context.main, game.width/6*5, 0, game.width/6, game.height/3*2);

		//draw current stock
		this.drawStock(game.context.main, this.selectedStock, game.width/3*2, 0, game.width/6,game.height/3*2);

		//draw the bottom chrome
		this.drawChrome(game.context.main, 0,game.height/3*2, game.width, game.height/3);

		if(this.paused){
			game.context.main.fillStyle ="rgba(0,0,0,.75)";

			game.context.main.fillRect(0,0,game.width,game.height);
		}

		for(var i = 0; i <this.balloons.length; i++){
			this.balloons[i].draw(game.context.main);
		}
		this.drawBgm(game.context.main);


	}

	this.drawBgm = function(context){
		context.fillStyle = "#f00";
		if(this.isBgm){
			context.fillStyle = "#0f0";
			context.strokeStyle = "#0f0";


			context.beginPath();
			context.moveTo(14,14);
			context.lineTo(32,6);
			context.stroke();

			context.beginPath();
			context.moveTo(14,16);
			context.lineTo(32,16);
			context.stroke();

			context.beginPath();
			context.moveTo(14,18);
			context.lineTo(32,30);
			context.stroke();

		}

		context.beginPath();
		context.moveTo(2,8)
		context.lineTo(6,8);
		context.lineTo(12,1);
		context.lineTo(12,31);
		context.lineTo(6,24);
		context.lineTo(2,24);
		context.fill();


	}
	this.drawGraph = function(context, hist, x, y, w, h){
		context.fillStyle="#000";
		context.fillRect(x, y ,w ,h );
		context.fillStyle = "#fff";
		context.textAlign = "center";
		
		//TODO adjust location and scaling as needed
		var min = 9999999999;
		var max = -1000000;
		var localmax = {};

		for(var i = 0; i<game.history.length ; i++){
			for(var stock in game.history[i]){
				max = Math.max(game.history[i][stock].currentValue, max);
				min = Math.min(game.history[i][stock].currentValue, min);
				if(!localmax[stock]){
					localmax[stock] = game.history[i][stock].currentValue;
				}
				else{
					localmax[stock] = Math.max(game.history[i][stock].currentValue, localmax[stock]);
				}
			};
		}
		min = Math.max(min, 0);

		var range = Math.ceil(max - min);
		range += 100 -(range %100);

		vertscale = ((h / (range *1.2)) + this.lastZoom)/2;
		this.lastZoom = vertscale;

		context.save();
		
			context.translate(0, h);
			context.scale(1,-1*vertscale );
			context.translate(0,  -min+50 )
		

			//TODO draw scale
			context.textAlign = "left";
			for(var i = 0 ; i < range*2; i+= 50){
					if(i%100){
						context.fillStyle ="rgba(255,255,255,0.5)";
					}
					else{
						context.fillStyle ="rgba(255,255,255,1)";
					}
					
					context.fillRect(0,i,w,1);
					context.save();
					context.translate(0,i);
					context.scale(.5,-.5);
					context.fillText(i,0,0);
					context.restore();
					
			}
			
			var step = w/game.history.length;
			context.textAlign ="right";
			for(var i = 0; i<game.history.length ; i++){
				for(var stock in game.history[i]){
					
					context.strokeStyle= game.stocks[stock].color;
					if(game.history[i][stock].currentValue == localmax[stock]){
						context.save()
						context.translate(w- step * i,
							game.history[i][stock].currentValue );
						context.scale(1,-1);
						context.fillStyle = game.stocks[stock].color;
						context.fillText(stock,0,0)
						context.restore();
					}
					
					
					context.lineWidth = 2/vertscale;
					if(stock == this.selectedStock ){
						context.lineWidth = 5/vertscale;

					}
					
					context.beginPath();
					context.moveTo( w- step * i,
						game.history[i][stock].currentValue);
					context.lineTo(w - step * (i + 1),
						game.history[i][stock].currentValue - game.history[i][stock].lastChange);

					context.stroke();

					
				}
			}
		context.restore();

	}

	///draws teh stock chunk in the top right
	this.drawStock = function(context, stockName, x,y,w,h){
		context.fillStyle = "#222";
		context.fillRect(x, y, w, h);

		
		context.fillStyle = "#000";
		if(diesel.mouseX > x && diesel.mouseY > y && diesel.mouseX < x+w && diesel.mouseY <y +h){
			context.fillStyle = "rgba(255,255,255,.25)";
		}
		context.textAlign = "center";
		var tsize = h/2;
		context.font = tsize+"px monospace";
		context.fillText(this.selectedStock, x+w/2 , y+h/3*2);

		tsize -= 10;
		context.font = tsize+"px monospace";
		if(game.stocks[this.selectedStock].getCurrentValue() <=0){
			context.fillStyle = "#333";
			context.fillText(this.selectedStock, x+w/2 , y+h/3*2);
			context.fillStyle = "#f00";
			context.fillText("X", x+w/2 , y+h/3*2);
			context.font = 32+"px monospace";
			context.fillText("click to change!!!", x+w/2 , y+h/4*3);
	
		}
		else{
			context.fillStyle = game.stocks[this.selectedStock].color;
			context.fillText(this.selectedStock, x+w/2 , y+h/3*2);
	

		}

		
			context.font = game.fontSize+"px "+game.font;
		context.fillStyle ="#fff";
	//	context.fillText("NAME",x+w/2 , y+h/3*2 + game.fontSize *3);
		context.fillText("£: "+Math.round(game.stocks[this.selectedStock].getCurrentValue()*100)/100, 
			x+w/2 , y+h -game.fontSize *1.5);


		context.fillText("±: "+Math.round(game.stocks[this.selectedStock].getLastChange()*100)/100, 
			x+w/2 , y+h - game.fontSize/2);

		context.fillText("Active Stock", x+w/2, y+48);

	}

	///buy and sell buttons
	this.drawButtons=function(context, x, y, w, h){

		game.context.main.font = "32px komika-axis";


		context.fillStyle= "#327337";
		context.fillRect(x,y,w,h/2);
		if(diesel.mouseX > x && diesel.mouseY < h/2){

			context.strokeStyle = "rgba(255,255,255,0.25)";
			context.lineWidth = 5;
			context.strokeRect(x +10,y+10,w -20,h/2-20)
			// context.beginPath();
			// for(var i =0 ; i <h/2;i+=10){
				
			// 	context.moveTo(x+10, i );
			// 	context.lineTo(x+w-20, i);
			// }
			// context.stroke();
			// context.closePath();
			
		
		}

		context.fillStyle= "#D85249";
		context.fillRect(x,y +h/2,w,h/2);
		if(diesel.mouseX > x && diesel.mouseY > h/2 &&diesel.mouseY < h){

			context.strokeStyle = "rgba(255,255,255,0.25)";
			context.lineWidth = 5;
			context.strokeRect(x +10,y+h/2+10,w -20,h/2-20)
		
		}

		context.fillStyle = "#fff";
		context.textAlign = "center";
		context.fillText("BUY "+this.selectedStock, x+w/2, y+h/4);
		context.fillText("SELL "+ this.selectedStock, x+w/2, y+h/4*3);

	}

	//bottom portion;
	this.drawChrome= function(context,x,y,w,h){

		context.fillStyle= "#fff";
		context.fillRect(x,y,w,1);

		context.fillStyle= "#272";
		context.fillRect(x,y,w,h);

		var lineh = h/4;
		var ltext = lineh -16;


		// context.fillStyle= "#000";

		// context.fillRect(x +16,y+16, w/3-32, ltext);
		// context.fillRect(x +16,y +lineh +16, w/3-32, ltext);

		// context.fillRect(x +16,y +lineh *2 +16, w-32, lineh*2 -32);

		context.fillStyle= "#fff";
		context.textAlign = "left";
		context.font = ltext+"px komika-axis";
		context.fillText("CASH:"+Math.round(game.user.getCurrentCash()),x +16,y+ lineh -16 );
		context.fillText("APM:"+this.getAPM(),x +16,y+lineh*2 -16 );
		context.fillText("TIME: "+ Math.max(0,Math.ceil(this.timeLeft)),x +16,y +lineh*3 -16);
		context.fillText("???: "+ Math.round(this.getAPM()/10 +1), x+16, y+lineh*4 -16);
		
		
		context.save();
			context.textAlign = "center";
			context.translate(x + w/3, y+16);
			var step = w/3*2 /game.tickers.length;
			var assets = game.user.getAssets();
			var mouseIn  =-1;
			if(diesel.mouseX > x && 
				diesel.mouseY > y && 
				diesel.mouseX < x+w && 
				diesel.mouseY <y +h){

					mouseIn = Math.floor((diesel.mouseX-w/3)/step);
				}
			
			for(var i = 0 ; i < game.tickers.length;i++){
				if(game.stocks[game.tickers[i]].getCurrentValue() > 0 ){
					context.fillStyle ="#000";
					context.fillRect(i*step, 0, ltext*2, h-32); 
					context.fillStyle= game.stocks[game.tickers[i]].color;
					context.font = 2* ltext+"px komika-axis";
			
					context.fillText(game.tickers[i], i*step +ltext , ltext *2);
					
					context.fillStyle = "#fff";
					context.font = ltext+"px komika-axis";
			
					context.fillText(assets[game.tickers[i]]|| 0, i*step +ltext , h - 48 );
					if(i == mouseIn ){
						context.lineWidth = 5;
						context.strokeStyle = "rgba(255,255,255, 0.5)";
						context.strokeRect(i*step +10,10,  ltext*2 -20, h-52)
					}
					
				}

			}
		context.restore();

	}
	this.getAPM=function(){
		var min  = ( new Date()-diesel. timeStarted )/1000/60;
		return Math.round(this.actions/min);
	}


	this.update =function(ticks){


		for(var i = 0; i <this.balloons.length; i++){
			this.balloons[i].update(ticks);
			if(this.balloons[i].time <=0 ){
				this.balloons.splice(i,1);
				i--;
			}
		}

		if(!this.paused || this.timeLeft<=0){

			this.timeLeft -=ticks;
		}

		if(!this.paused){
			//slow down there buddy
			if(diesel.frameCount %3 ==0){
			diesel.raiseEvent("updateStocks", ticks);
			}
			

			//did we meet end standards?
			var shouldEnd = false;
			//1 stock?
			var validStocks = 0;
			for(var stock in game.stocks){
				if(game.stocks[stock].getCurrentValue()>0){
					validStocks++;
				}
			}
			


			if(!validStocks || this.timeLeft<=0){
				console.log("END THE GAME HERE")

				//calculate score;

				var cash = game.user.getCurrentCash();
				var stock =0;
				var assets = game.user.getAssets();
				for(stk  in assets){
					if(assets[stk]>0){
						stock += assets[stk] *Math.max( game.stocks[stk].getCurrentValue(), 0);
					}
				}

				
				var msg =["Game Over", "your score:",Math.round((cash+stock) * (this.getAPM()/10 +1)),"click+click here"];

				var b = new game.objects.messageBalloon(msg);
				this.balloons.push(b);
				this.paused = true;
				
			}
		}

	};

	this.buyCurrentStock=function(){
		
		if(game.history[0]&&
			game.history[0][this.selectedStock] &&
			game.user.purchaseStock(game.history[0][this.selectedStock])){

			this.didAction();
	
			this.buySound.pause();
			this.buySound.currentTime=0;
			this.buySound.play();


			var ball =new game.objects.textBalloon(this.selectedStock,
			diesel.mouseX, diesel.mouseY,2);
			
			this.balloons.push(ball);

			
		}
		else{
			this.errSound.pause();
			this.errSound.currentTime =0;
			this.errSound.play();
		}
						
	};

	this.sellCurrentStock = function(){
		if(game.history[0]&&
			game.history[0][this.selectedStock] &&
			game.user.sellStock(game.history[0][this.selectedStock])){

			this.didAction();
		

			this.sellSound.pause();
			this.sellSound.currentTime =0;
			this.sellSound.play();

			var ball =new game.objects.textBalloon(
			Math.round(game.stocks[this.selectedStock].getCurrentValue()),
			diesel.mouseX, diesel.mouseY,2);
			if(ball.text > 0){
				ball.text = "+" +ball.text;
			}
			else{
				ball.color = "#fff";
			}
			this.balloons.push(ball);

		}
		else{
			this.errSound.pause();
			this.errSound.currentTime =0;
			this.errSound.play();
		}
		
	};

	this.nextStock =function(){
		// console.log("nextStock", this.selectedStock);
		this.didAction();

		var i = ((game.tickers.indexOf(this.selectedStock)||0)+1)%game.tickers.length;
		var start = i -1;
		while(game.stocks[game.tickers[i]].getCurrentValue()<=0 && i !=start){
			i = (i+1)%game.tickers.length;
		}
		this.selectedStock = game.tickers[i];

		this.thbbSound.pause();
		this.thbbSound.currentTime = 0;
		this.thbbSound.play();

	}

	this.didAction= function(){
		this.actions++;

		this.balloons.push( new game.objects.textBalloon("+1", 128 ,game.height -128, .5));
	}

};
this.screens.theScreen.prototype =  new diesel.proto.screen();

this.screens.entireGame = new this.screens.theScreen();

	//iniitalize the game obeject nbow that good things 
	//have been done to the prototype
	//this file should be the last included
	this.init();

}

gameInstance.prototype = new diesel.proto.game();

var game = new gameInstance();
