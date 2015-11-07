/*
	stupid search
	2014 Lee Brunjes
	Like A* but dumber and using mostly natvie js objects
	assumes points are in [,] format
	regenerates the points per run.
*/

var StupidSearch =function(grid,start,end,wall){
	//console.log("searching for", start, "to", end);

	//takes a point and reutnrs teh neighbors 
	this.neighbors = function(grid,point){
		var ret = [];
		if(grid[point[0]-1] && grid[point[0]-1][point[1]]){
			ret.push(grid[point[0]-1][point[1]]);
		}
		if(grid[point[0]+1] && grid[point[0]+1][point[1]]){
			ret.push(grid[point[0]+1][point[1]]);
		}
		if(grid[point[0]] && grid[point[0]][point[1]+1]){
			ret.push(grid[point[0]][point[1]+1]);
		}
		if(grid[point[0]] && grid[point[0]][point[1]-1]){
			ret.push(grid[point[0]][point[1]-1]);
		}
		
		return ret;
		
	}
	
	this.mDist = function(start, end){
		return Math.abs(start[0]- end[0] )+Math.abs(start[1] -end[1]); 
	}
	
	var open =[];
	var closed = [];
	
	
	//init the grid to objects

	for(var i = 0; i < grid.length;i++){
		for(var j =0; j<grid[i].length;j++){
			
			
			grid[i][j] = {
				value: grid[i][j],
				h:mDist([i,j], end),
				closed:false,
				visited:false,
				g: grid.length * grid[0].length,
				parent:false,
				point:[i,j]
			
			};
		}
	}
	open.push(grid[start[0]][start[1]]);
	open[0].g=0;
	var lastNode = false;
	var steps = 0;
	
	while(open.length>0 && !lastNode && steps <500){
		var current =open.splice(0,1)[0];
		current.closed =true;
		var nextNodes = neighbors(grid, current.point);
		
	//	console.log("at step:", steps," ", open.length, " nodes remain", current.point, current.h, " next:", nextNodes.length);
		
		steps++;
		for(var j = 0; j < nextNodes.length;j++){
			var next = nextNodes[j];
			if(diesel && diesel.debug){
				game.context.back.fillStyle= "rgba(0,0,255,0.05)";
				game.context.back.fillRect(next.point[1]*16,next.point[0]*16,16,16);
					
			}
			if(!next.visited || next.g > current.g+1 ){
				next.g = current.g + 1;
				next.visited = true;
				next.parent = current;
				next.closed =false;
			}
			if(next.closed || next.value == wall){
				if(diesel && diesel.debug){
				game.context.back.fillStyle= "rgba(255,0,0,0.05)";
				game.context.back.fillRect(next.point[1]*16,next.point[0]*16,16,16);
				continue;
				}
			}
			
			next.closed =true;
			
			if(next.h == 0){
				lastNode =next;
			}
			
			var added = false;
			for(var i = 0; i < open.length && !added; i++){
				if(open[i].h < next.h){
					continue;
				}
				else{
					added =true;
					open.splice(i,0,next);
					break;
				}
			}
			if(!added){
				open.push(next);
			}
		}
	}
	//console.log("exited at:",open.length, lastNode,steps);
	
		
	if(!lastNode){
	//	console.log("no path");
		game.context.back.clearRect(0,0,game.width, game.height);
			
		return [];
	}
	
	var path =[];
	var pl = lastNode.g;
	while(lastNode.parent && path.length <=pl){
		path.push(lastNode.parent.point);
		lastNode= lastNode.parent;
		if(diesel && diesel.debug){
			game.context.back.fillStyle= "rgba(0,255,0,0.01)";
			game.context.back.fillRect(lastNode.point[1]*16,lastNode.point[0]*16,16,16);
		}
	
	}
	return path;
	
}
