/*
Fill SVG
Lee Brunjes 2016 lee.brunjes@gmail.com

This fills an svg based on matches between a json doc and the ids of paths.

*/

var fillSVG= function(){

var fillSVG =this;
this.coloring_data = false

//ajax without libraries woo;l
this.get = function(path, success,error){
	httpReq = new window.XMLHttpRequest();
	httpReq.onreadystatechange=function(){
		if(this.readyState == XMLHttpRequest.DONE){
			if(this.status ==200){
				success(this.responseXML);
			}
			else{
				error(this.responseText, this.status);
			}
		}
	}
	httpReq.open("GET", path, true);
	httpReq.send();
};


//loads an img tag's svg into teh dom to allow easier manipulation
this.inlineImgSvg=function(img){
	if(img &&img.src){
		fillSVG.get(img.src, function(responseXML){
			console.log(responseXML);
			var svgs =document.importNode(responseXML.documentElement, true);
			svgs.id = img.id;
			fillSVG.addViewBox(svgs);
			console.log(svgs, img, img.parentNode);
			
			img.parentNode.replaceChild(svgs, img);
			
		}, function(err_text, status){
			console.log("cannot load svg", status);
		});
	}

};


// having a view box allows teh svg to scal easily in CSS we check for one, and then add it if it is missing.
this.addViewBox =function(svg_element){
	if(!svg_element.attributes.viewbox && 
		svg_element.attributes.width &&
		svg_element.attributes.height ){
		//this allows scaling of svg in css
		svg_element.setAttribute("viewbox", "0 0 "+svg_element.attributes.width.value+" "+svg_element.attributes.height.value);
	}
};

this.formatKey=function(element){
	if(!this.coloring_data){
		return;
	}

	var descriptionList = document.createElement("dl");

	for(var i = 0; i < this.coloring_data.channels.length;i++){
		
		var dt = document.createElement("dt");
		dt.style.color =  "rgba("+this.coloring_data.channels[i].color[0]+
			","+this.coloring_data.channels[i].color[1]+
			","+this.coloring_data.channels[i].color[2]+ 
			","+this.coloring_data.channels[i].color[3]+")";
		dt.innerText = "█ "+this.coloring_data.channels[i].value;

		var dd1 = document.createElement("dd");
		dd1.innerText = "color: "+this.coloring_data.channels[i].value +  
		" alpha: "+this.coloring_data.channels[i].alpha ;

		descriptionList.appendChild(dt);
		descriptionList.appendChild(dd1);
	
	}

	element.appendChild(descriptionList);
	
}

//fill color regions;
this.colorRegions=function(data, coloring_data){
	console.log("coloring regions")
	//use default coloring
	if(! coloring_data){
		console.log("default coloring data")
		coloring_data = {
			name:"name", //used to address regions
			channels:[
				{
					value:"republican",//varialbe name FOR COLORS
					alpha:"turnout",
					value_range:[0,100],// this is mapped from 
					alpha_range:[0,100],
					color:[255,0,0,1]
				},
				{
					value:"democrat",//varialbe name FOR COLORS
					alpha:"turnout",
					value_range:[0,100],// this is mapped from 
					alpha_range:[0,100],
					color:[0,0,255,1]
				},
				{
					value:"green",//varialbe name FOR COLORS
					alpha:"turnout",
					value_range:[0,100],// this is mapped from 
					alpha_range:[0,100],
					color:[0,255,0,1]
				},
				{
					value:"libertarian",//varialbe name FOR COLORS
					alpha:"turnout",
					value_range:[0,100],// this is mapped from 
					alpha_range:[0,100],
					color:[255,255,0,1]
				}
			],
			default_color:[128,128,128,1]
			
		};
	}
	
	this.coloring_data = coloring_data
	
	

	var getFillColor= function(dataPoint){

	var colors = [];
	var output = coloring_data.default_color|| [0,0,0,1];

	//read each color and then do an average()
	for(var i = 0; i < coloring_data.channels.length; i++)
	{
		var cnl = coloring_data.channels[i];

		if(dataPoint[cnl.value]){
			//color 
			var color = [0,0,0,0];
			var value = Math.max(Math.min(dataPoint[cnl.value], cnl.value_range[1]),cnl.value_range[0]);
			value = value/(cnl.value_range[1] - cnl.value_range[0]);
	
			color[0] = cnl.color[0]*value;
			color[1] = cnl.color[1]*value;
			color[2] = cnl.color[2]*value;
	
			//adjust alpah values
			if(cnl.alpha && dataPoint[cnl.alpha]){
				var value = Math.max(Math.min(dataPoint[cnl.value], cnl.alpha_range[1]),cnl.alpha_range[0]);
				color[3] = cnl.color[3]*value/(cnl.alpha_range[1] - cnl.alpha_range[0]);
			}
			else{
				//if not alpha var just done worry about tis
				color[3] = cnl.color[3];
			}

			//add color to the mix list;
			colors.push(color);
		}

	}

	//average the colors
	var color = [0,0,0,0];

	for(var i = 0 ; i < colors.length ;i++){
		color[0] += colors[i][0];
		color[1] += colors[i][1];
		color[2] += colors[i][2];
		color[3] += colors[i][3];
	}
	
	if( colors.length>0){
		color[0] = Math.round(color[0]/colors.length);
		color[1] = Math.round(color[1]/colors.length);
		color[2] = Math.round(color[2]/colors.length);
		color[3] = color[3]/colors.length;
		output = color;
	}	

	//format teh output nicely
				

	return "rgba("+output[0]+","+output[1]+","+output[2]+ ","+output[3]+")";
};

	var getStrokeColor=function(dataPoint){
		var output = coloring_data.default_color|| [0,0,0,1];
		var max = -1;

		//read each color and then do an average()
		for(var i = 0; i < coloring_data.channels.length; i++)
		{
			var cnl = coloring_data.channels[i];

			if(dataPoint[cnl.value]){
			 max = Math.max(dataPoint[cnl.value], max);
			 if(max == dataPoint[cnl.value]){
			 	output =cnl.color;
			 }
			}

		}
		return "rgba("+output[0]+","+output[1]+","+output[2]+ ","+output[3]+")";
	}
	//set fill in each region
	for(var key in data){
		var region = document.getElementById(data[key][coloring_data.name]);
		if(region){
			var color = getFillColor(data[key])
			region.style.fill = color;
			region.style.stroke = getStrokeColor(data[key]);
			region.setAttribute("mapData", JSON.stringify(data[key]));;
		}
		else{
			console.log("unknown region:"+data[key][coloring_data.name])
		}
	}
}

};

fillSVG = new fillSVG();