/*
	Perlin Noise in javascript
	2014 LEe brunjes
	on a train in taiwan


*/

var perlin = function(){
	this.g1 = [];
	this.g2 = [];
	this.g3 = [];
	this.p=[];
	this.B =0xff;
	this.BM =this.B-1;
	this.N  = 1337.1337;
	this.NP = 12;
	this.NM =0xfff;
	
	
	
	this.lerp = function(t,a,b){
		return(a + t *(b-a));
	};
	this.s_curve = function(t){
		return( t*t * (3 -2 *t));
	};
	this.init =function(i,b0b1,r0,r1){
		var i,j,k;
		//fill the arrays.
		for(i =0 ; i<this.B;i++){
			this.p.push(i);
			this.g1.push(Math.random());// % (this.B+this.B))-this.B)/this.B);
		
			this.g2.push([0,0]);
			for(j =0 ;j <2; j++){
				this.g2[i][j] = ((Math.random() % (this.B+this.B))-this.B)/this.B;
			}
			this.normalize(this.g2[i]);
			this.g3.push([0,0,0]);
			for(j =0 ;j <3; j++){
				this.g3[i][j] = ((Math.random() % (this.B+this.B))-this.B)/this.B;
			}
			this.normalize(this.g3[i]);
			
		
		}
		//shuffle p[]
		while( i--){
			this.p.sort(Math.random() -.5);
		}
	}
	this.normalize=function(data){
		var s =0;
		for(var i =0; i< data.length;i++){
			s += data[i] * data[i];
		}
		s = 1/Math.sqrt(s);
		for(var i =0; i< data.length;i++){
			data[i] = data[i] *s;
		}
		
	}
	
	
	
	this.noise =function(vec){
		if (typeof(vec) =="number"){
			vec = [vec];
		}
		var objects = [];
		var lastCurve =0;
		
		
		for(var i = 0 ; i <  vec.length;i++){
			var t,bx0,bx1,rx0,rx1, sx, u ,v;
			t= vec[i]+this.N;
			bx0= Math.round(t) & this.BM;
			bx1= (bx0+1) & this.BM;
			rx0 = t%1;
			rx1 = rx0 -1;
			
			sx = this.s_curve(rx0);
			lastCurve =sx;
			u = rx0 * this.g1[this.p[bx0]];
			v = rx1 * this.g1[this.p[bx1]];
			
			var x = this.lerp(sx,u,v);
			console.log(sx,u,v);
			objects.push(x);
		}
		var value = objects[0];
		
		//this is wieghted wrong but its noise so i dont care
		for (var i = 1; i< objects.length; i++){
			value = this.lerp(lastCurve, value, objects[i]);
		}
		console.log(vec, objects, value);
		return Math.abs(value);
		
		
	}
	
	this.init();
}