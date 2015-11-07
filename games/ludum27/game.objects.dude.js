var HealthBar = Object.create(Drawable);

HealthBar.width = 225
HealthBar.height = 15

HealthBar.draw = function(context, name, x, y, maxHealth, health)
{

  context.save()

  context.fillStyle="#FF0000";
  context.strokeRect(x,y+20,this.width,this.height);
  context.fillRect(x,y+20,this.width*(health/maxHealth),this.height);
  context.restore()
}

var Dude = Object.create(Drawable);

Dude.name = 'You';

Dude.picture = "face.jpg";

Dude.points = 0;



Dude.action = 'idle';

Dude.health = 100;
Dude.maxHealth = 100;

Dude.speed = 10;
Dude.dex = 10;
Dude.aim = 10;
Dude.str = 10;
Dude.focus = 10;
Dude.armor = 10;
Dude.w = 64;

Dude.dist = 0;

Dude.range = 20;
Dude.hasUsedSpy =false;

// Threshold that determines whether dude is using a melee or ranged weapon
Dude.meleeRange = 20;

Dude.secondDeck = [];
Dude.thisSecond = null;

Dude.healthBar = Object.create(HealthBar)

Dude.init = function()
{
  this.bodyParts =
  {
    torso: "man_small_torso.png",
    legs: "man_small_legs.png",
    leftArm: "man_small_arm_l.png",
    rightArm: "man_small_arm_r.png",
    weapon: "sword.png"

  }

  this.effects = [];

  this.resetEvents = [];
  this.attackEvents = [];
  this.tickEvents = [];
}

Dude.getAvailableSeconds = function() { return null; }
Dude.chooseSecond = function() { return null; }

Dude.createSecondDeck = function(secondList) {
  this.secondDeck = secondList;
}

Dude.selectSecond = function(secondIdx) {

  if (this.secondDeck[secondIdx])
    {
      if (!this.secondDeck[secondIdx].used)
        {
          this.thisSecond = this.secondDeck[secondIdx];
          this.secondDeck[secondIdx].used = true;
          this.thisSecond.apply(this);
        }
    else
      {
        console.log('Error: Attempted to select already-used Second.')
      }
    }
  else
    {
      console.log('Error: No second in the deck with index ' + secondIdx +'.')
    }

}

Dude.move = function()
{
  this.dist += this.speed;
  diesel.soundCache['move.ogg'].play()
}

Dude.attack = function(enemyDude)
{
  // Does it connect?

  for (var i = 0; i<this.attackEvents.length; i++)
    {
      this.attackEvents[i](this, enemyDude);
    }

  if (this.getAtkRoll() > enemyDude.getDefRoll())
    {
      // A hit!
      this.action = "attack"
      dmg = enemyDude.takeDamage(this.getDmgRoll())
      this.score += Math.floor(dmg)
      if (this.range <= this.meleeRange)
      {
        Sound.playSound("sword");
      }
      else
      {
        this.atkStartFrame = diesel.frameCount;
        diesel.soundCache['bang.ogg'].play()
      }

    }
  else
    {
      // Boo! Miss!
      this.action = "miss";

      var stache_quotient = 1-(this.focus/10)

      if (enemyDude.bodyParts.mustache && (stache_quotient*Math.random()) > 0.5)
        {
          if (Math.random() > 0.5)
            {
          diesel.soundCache["nice_mustache.ogg"].play()
            }
          else
            {
              diesel.soundCache["nice_mustache2.ogg"].play()
            }

        }

      if (this.range <= this.meleeRange)
      {
        diesel.soundCache['miss.ogg'].play()
      }
      else
      {
        this.atkStartFrame = diesel.frameCount;
        diesel.soundCache['bang.ogg'].play()
      }
    }


}


Dude.getAtkRoll = function()
{
  var seed = DuelMath.getAtkSeed()

  if (this.range <= this.meleeRange)
    {
      // Calculate Atk for melee attack
      return seed + (this.focus + this.dex)/2
    }
  else
    {
      // Calculate Atk for ranged attack
      return seed + (this.focus + this.aim)/2
    }

}

Dude.getDefRoll = function()
{
  var seed = DuelMath.getDefSeed();
  return seed + this.dex;
}

Dude.getDmgRoll = function()
{
  var seed = DuelMath.getDmgSeed();
  if (this.range <= this.meleeRange)
    {
      // Calculate Atk for melee attack
      return seed + this.str
    }
  else
    {
      // Calculate Atk for ranged attack
      return seed + 10
    }
}

Dude.takeDamage = function(damage)
{
  dmg = (damage-this.getDefOffset(damage))

  var ouchMsg = Object.create(Effect);
  ouchMsg.text = "!*$%"
  ouchMsg.x = 0;
  ouchMsg.y = this.y+(this.height/2);
  this.effects.push(ouchMsg);

  diesel.soundCache['ow.ogg'].play()

  this.health -= dmg
  this.score -= dmg
  return dmg
}

Dude.getDefOffset = function(damage)
{
  return Math.random()*this.armor;
}

Dude.tick = function(enemyDude, duel)
{
  for (var i = 0; i<this.tickEvents.length; i++)
    {
      this.tickEvents[i](this, enemyDude);
    }
  // Am I close enough to ATTACK!?!? God I hope so.
  if ((duel.dist-(this.dist + this.range)) < enemyDude.dist)
  {
    // Close enough! Git em!
    this.attack(enemyDude);
  }
  else
  {
    this.move();
    this.action = "move";
  }
}

Dude.drawLegs = function(context)
{

  var maxRotation = 1;
  var eccentricity = 2;
  var accel = 0.7;

  context.save();

  if (this.action == "move")
  {
    context.rotate((maxRotation * Math.sin(accel*diesel.frameCount)) *Math.PI/180 );
    context.translate(0, eccentricity * Math.sin(accel*diesel.frameCount))
  }
  context.drawImage(diesel.imageCache[this.bodyParts.legs], this.w/-2,this.h/-2,this.w,this.h);
  context.restore();

}

Dude.drawLeftArm = function(context)
{

  var maxRotation = 10;
  var eccentricity = 2;
  var accel = 0.3;

  context.save();

  if (this.action == "move")
  {
    context.rotate((maxRotation * Math.sin(accel*diesel.frameCount)) *Math.PI/180 );
    context.translate(0, eccentricity * Math.sin(accel*diesel.frameCount))
  }
  context.drawImage(diesel.imageCache[this.bodyParts.leftArm], this.w/-2,this.h/-2,this.w,this.h);

  context.restore();

}

Dude.drawWeapon = function(context)
{
  context.save();




  if (this.bodyParts.weapon == "sword.png")
  {

    if (this.action == "attack")
      {
        var maxRotation = 30;
        var eccentricity = 2;
        var accel = 0.6;
      }
    else if (this.action == "miss")
      {
        var maxRotation = 12;
        var eccentricity = 2;
        var accel = 0.6;
      }
    else
      {
        var maxRotation = 3;
        var eccentricity = 2;
        var accel = 0.4;
      }

    context.translate(27, -3);
    context.rotate(180* Math.PI/180);
    context.rotate((maxRotation * Math.sin(accel*diesel.frameCount)) *Math.PI/180 );
    context.translate(-27, -3);


    context.translate(44,52);
    context.drawImage(diesel.imageCache[this.bodyParts.weapon], this.w/-2,this.h/-2,19,66);
  }

  else if (this.bodyParts.weapon == "gun.png")
    {

      context.translate(27, -3);
      context.rotate(-90* Math.PI/180);
      context.translate(-27, -3);

      context.translate(45,65);

      if (this.atkStartFrame && diesel.frameCount - this.atkStartFrame < 10)
        {
          context.drawImage(diesel.imageCache["gun-fire.png"], this.w/-2,this.h/-2,19,66);
        }
      else
        {
          context.drawImage(diesel.imageCache[this.bodyParts.weapon], this.w/-2,this.h/-2,19,66);
        }

    }


  context.restore();
}

Dude.drawMustache = function(context)
{

  var maxRotation = 5;
  var eccentricity = 0;
  var accel = 0.4;

  context.save();

  if (typeof this.bodyParts.mustache != "undefined")
  {

    var stache_x = (this.w/-2)+30
    var stache_y = (this.h/-2)+35

    context.translate(stache_x, stache_y)
    context.rotate((maxRotation * Math.sin(accel*diesel.frameCount)) *Math.PI/180 );
    context.translate(-stache_x, -stache_y)

    context.translate(0, eccentricity * Math.sin(accel*diesel.frameCount))
    context.drawImage(diesel.imageCache[this.bodyParts.mustache], this.w/-2,this.h/-2,this.w,this.h);
  }

  context.restore();

}

Dude.drawTorso = function(context)
{
  context.drawImage(diesel.imageCache[this.bodyParts.torso], this.w/-2,this.h/-2,this.w,this.h);
  this.drawWeapon(context);
}

Dude.draw = function(context){
  context.save();
	context.translate(this.x,this.y);
	context.rotate(this.r)

  this.drawTorso(context)
	this.drawLegs(context)
  this.drawLeftArm(context)
  this.drawMustache(context)
  context.drawImage(diesel.imageCache[this.bodyParts.rightArm], this.w/-2,this.h/-2,this.w,this.h);


  for (var i=0; i< this.effects.length; i++)
    {
      this.effects[i].draw(context);
    }

  this.healthBar.draw(context, this.name, -(this.x+100), 200, this.maxHealth, this.health);
  context.restore();

}

Dude.chooseDeck = function(secondList)
{
  var randomizedList = shuffle(secondList)
  var secondDeck = []

  for (var i = 0; i < 10; i++)
    {
      secondDeck[i] = Object.create(randomizedList[i]);
    }

  this.createSecondDeck(secondDeck);
}

Dude.reset = function(){
  for (var i = 0; i<this.resetEvents.length; i++)
  {
    this.resetEvents[i](this);
  }

 this.x = 0;
 this.dist = 0;
}





