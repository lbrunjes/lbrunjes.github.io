var Effect = Object.create(Drawable)

Effect.alpha = 0.7;
Effect.text = "";

Effect.draw = function(context){

  if (this.alpha > 0)
    {
    this.y-=0.5;
    this.alpha -= .05;

    context.save();
    //context.scale(2-this.alpha,2-this.alpha);
    context.font = game.settings.font;
    context.globalAlpha = this.alpha;
    context.fillStyle = "#ff0000";
    context.fillText(this.text, this.x, this.y);
    context.restore();
    }
  else
    {
      // Remove this effect from the array
    }

}