
var DuelMath = Object.create(null);


DuelMath.rnd_snd = function() {
	return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
}

DuelMath.rnd = function(mean, stdev) {
	return Math.round(this.rnd_snd()*stdev+mean);
}

DuelMath.getAtkSeed = function()
{
  return this.rnd(2,1.5);
}

DuelMath.getDefSeed = function()
{
  return this.rnd(2,1.5);
}

DuelMath.getDmgSeed = function()
{
  return this.rnd(2,1.5);
}

