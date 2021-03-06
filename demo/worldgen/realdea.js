<script type="application/javascript">
			var voronoi = true;
			var delaunay = false;
			var canv = null;
			var colors = [];
			
			function mouseX(e){	return e.clientX - e.target.offsetLeft;}
			function mouseY(e){	return e.clientY - e.target.offsetTop; }
			
			function onLoad()
			{
				canv = document.getElementById("c");
				canv.onmousemove = onMM;
				canv.onclick = onClick;
				c = canv.getContext("2d");
				w = canv.width = window.innerWidth;
				h = canv.height = window.innerHeight;
				points = [];
				v = new Voronoi();
				
				for(i=0; i<10; i++)
				{
					points.push(new Point(Math.random()*w, Math.random()*h));
					colors.push(rndCol());
				}
					
				redraw();
			}
			
			function onMM(e)
			{
				var last = points[points.length-1];
				last.x = mouseX(e);
				last.y = mouseY(e);
				redraw();
			}
			
			function onClick(e)
			{
				var last = points[points.length-1];
				last.x += Math.random();
				last.y += Math.random();
				points.push( new Point(mouseX(e), mouseY(e)));
				colors.push(rndCol());
			}
			function resetPoints()
			{
				points = [points[points.length-1]];
				redraw();
			}
			
			function redraw()
			{
				c.fillStyle = "#ffffff";
				c.fillRect (0, 0, w, h);
				
				v.Compute(points, w, h);
				edges = v.GetEdges();
				cells = v.GetCells();
				
				/*
				for(var i=0; i<cells.length; i++)
				{
					var p = cells[i].vertices;
					if(p.length == 0) continue;
					if(p.length == 4)
					{
						console.log(cells[i].vs);
						console.log(p);
					}
					c.fillStyle = colors[i];
					c.beginPath();
					c.moveTo(p[0].x, p[0].y);
					for(var j=1; j<p.length; j++) c.lineTo(p[j].x, p[j].y);
					c.closePath();
					c.fill();
				}
				*/
								
				if(delaunay)
				{
					c.lineWidth = 3;
					c.strokeStyle = "#888888";
					for(i=0; i<edges.length; i++)
					{
						var e = edges[i];
						c.beginPath();
						c.moveTo(e.left.x, e.left.y);
						c.lineTo(e.right.x, e.right.y);
						c.closePath();
						c.stroke();
					}
				}
				
				if(voronoi)
				{
					c.lineWidth = 5;
					c.strokeStyle = "#000";
					for(i=0; i<edges.length; i++)
					{
						var e = edges[i];
						c.beginPath();
						c.moveTo(e.start.x, e.start.y);
						c.lineTo(e.end.x, e.end.y);
						c.closePath();
						c.stroke();
					}
				}
				
				c.fillStyle = "rgb(255,0,0)";
				for(i=0; i<points.length; i++)
				{
					var p = points[i];
					c.beginPath();
					c.arc(p.x, p.y, 6, 0, Math.PI*2, true);
					c.closePath();
					c.fill();
				}
			}
			function rndCol() {
				var letters = '0123456789ABCDEF'.split('');
				var color = '#';
				for (var i = 0; i < 6; i++ ) {
					color += letters[Math.round(Math.random() * 15)];
				}
				return color;
			}
		</script> 