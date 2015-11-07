var Duel = Object.create(Drawable);

Duel.goodDude = null;
Duel.badDude = null;
Duel.dist = 100;
Duel.numTicks = 0;

Duel.init = function(goodDude, badDude)
{
	goodDude.reset();
	badDude.reset();
  this.goodDude = goodDude;
  this.badDude = badDude;
  this.goodDudeStart = goodDude.health;
  this.badDudeStart = badDude.health;
}

Duel.randomDude = function()
{
  if (Math.random() > 0.5) { return this.goodDude; }
  else { return this.badDude; }
}

Duel.randomDudePair = function()
{
  firstDude = this.randomDude();
  if (firstDude == this.goodDude) { return [this.goodDude, this.badDude]; }
  else { return [this.badDude, this.goodDude] }
}

Duel.tick = function()
{
  //console.log('tick...')
  // Randomly select who gets to go first this tick
  dudePair = this.randomDudePair();
  dudePair[0].tick(dudePair[1], this)
  dudePair[1].tick(dudePair[0], this)

  this.numTicks++

  if ( this.goodDude.health <= 0 || this.badDude.health <= 0)
  {
    if (this.goodDude.health <= 0)
    { this.winner = this.badDude; }

    else if (this.badDude.health <= 0)
    { this.winner = this.goodDude; }

    else if (this.goodDudeStart-this.goodDude.health > this.badDudeStart-this.badDude.health)
    { this.winner = this.badDude; }
    else if (this.goodDudeStart-this.goodDude.health <= this.badDudeStart-this.badDude.health)
    { this.winner = this.goodDude; }


    if (this.winner == this.goodDude)
    {
      diesel.soundCache['victory.ogg'].play()
      this.badDude.r=95;
    }
    else
    {
      diesel.soundCache['youlose.ogg'].play()
      this.goodDude.r=-95;
    }

    //console.log(this.winner.name + "WINS!!!");
  }


}


