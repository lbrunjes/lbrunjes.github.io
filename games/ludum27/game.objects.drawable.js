var Drawable = Object.create(null);

Drawable.x =0;
Drawable.y =0;
Drawable.w =128;
Drawable.h =128;
Drawable.r =0;


Drawable.draw = function(context){
	context.save();
	context.translate(this.x,this.y);
	context.rotate(this.r)
	context.fillRect(this.w/-2,this.h/-2,this.w,this.h);
	context.restore();
}
