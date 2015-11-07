var Second = Object.create(Drawable);

Second.used = false;

Second.w =64

Second.apply = function(dude)
{
}

Second.register = function()
{
  game.seconds.push(this)
}

Second.face = "second.jpg";
Second.body = "medic.png";
Second.description = "I am a second. I should \nprobably be given a \ndescription.";
Second.effects ="";
Second.draw =function(context){
context.save();
	context.translate(this.x,this.y);
	context.rotate(this.r)
	context.drawImage(diesel.imageCache[this.body], this.w/-2,this.h/-2,this.w,this.h);
	context.restore();

}
