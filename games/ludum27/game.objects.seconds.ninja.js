var Ninja = Object.create(Second);

Ninja.name = 'Ninja';
Ninja.body = "ninja.png";
Ninja.apply = function(dude)
{
  dude.dex = dude.dex * 1.2;
  dude.speed = dude.speed * 1.2;
  dude.bodyParts.weapon = "sword.png"
  dude.range = 20;
}
Ninja.description = "Unhittable.";
Ninja.effects = "Increases range ,dexterity, & speed";
Ninja.register()



Marksman = Object.create(Second);
Marksman.name = 'Marksman';
Marksman.body = 'marksman.png';
Marksman.w = 76;
Marksman.apply = function(dude)
{
  dude.bodyParts.weapon = "gun.png"
  dude.range = 60;
}
Marksman.description = "Shooty!"
Marksman.effect = "Gives you the gun";
Marksman.register()

Pirate = Object.create(Second);
Pirate.name = 'Pirate';
Pirate.body = 'pirate.png';
Pirate.w = 131;
Pirate.description = "Like a russian ninja.";
Pirate.effects = "Increases strength, dexterity";
Pirate.apply = function(dude)
{
  dude.str = dude.str * 1.1;
  dude.dex = dude.dex * 1.1;
}
Pirate.register()

Blacksmith = Object.create(Second);
Blacksmith.name = 'Blacksmith';
Blacksmith.body = 'blacksmith.png';
Blacksmith.w = 83;
Blacksmith.apply = function(dude)
{
  dude.armor = dude.armor * 1.1;
}
Blacksmith.description = "Protect yo self.";
Blacksmith.effects ="Increases armor";
Blacksmith.register()

Mustache = Object.create(Second);
Mustache.name = 'Mustache';
Mustache.body = 'mustache.png'
Mustache.apply = function(dude)
{

  dude.bodyParts.mustache = "man_small_mustache.png"
  dude.attackEvents.push(function(dude, enemyDude){enemyDude.focus = enemyDude.focus * .96;})

}

Mustache.description = "Can be very distracting.";
Mustache.effects = "To your enemies";
Mustache.register()


Spy = Object.create(Second);
Spy.name = 'Spy';
Spy.body = 'spy.png';
Spy.description = "Sneaky Sneaky";
Spy.effects = "Shows opponents second";
Spy.apply = function(dude)
{
  dude.hasUsedSpy = true;
}
Spy.register()

Philosopher = Object.create(Second);
Philosopher.name = 'Philosopher';
Philosopher.body = 'philosopher.png';
Philosopher.w = 112;
Philosopher.description = "Cogito ergo sum.";
Philosopher.effects = "Slowly increases your focus";
Philosopher.apply = function(dude)
{
  // Ponder
  dude.tickEvents.push(function(dude, enemy)
                       {dude.focus = dude.focus + ((Math.random())-0.45) ;
                       });
}
Philosopher.register()

Russian = Object.create(Second);
Russian.name = 'Russian';
Russian.apply = function(dude)
{
  dude.str = dude.str * 1.2;
}
Russian.body = 'russian.png';
Russian.description = "Strong like bear.";
Russian.effects = "Increases strength";
Russian.register()

Sensei = Object.create(Second);
Sensei.name = 'Sensei';
Sensei.body = 'sensei.png';
Sensei.apply = function(dude)
{
  dude.focus = dude.focus * 1.2;
}
Sensei.description = "Wax on wax off."
Sensei.effects = "increases focus";
Sensei.register()

Rollerblader = Object.create(Second);
Rollerblader.name = 'Rollerblader';
Rollerblader.body = 'rollerblader.png'
Rollerblader.apply = function(dude)
{
  dude.speed = dude.speed * 1.5;
}
Rollerblader.description = "Dodge bullets in style."
Rollerblader.effects = "Increases speed";
Rollerblader.register()

Scout = Object.create(Ninja);
Scout.name = 'Scout';
Scout.body = 'scout.png';
Scout.apply = function(dude)
{
  dude.aim = dude.aim * 1.4;
}
Scout.description = "See the whites of their eyes.";
Scout.effects = "Increases aim"
Scout.register()

Medic = Object.create(Second);
Medic.name = 'Medic';
Medic.body = 'medic.png';
Medic.apply = function(dude)
{

  dude.resetEvents.push(function(dude){
    dude.health += (dude.maxHealth - dude.health) * 0.85;
  })

}
Medic.description = "FIX IT! FIX IT! FIX IT! FIX IT!";
Medic.effects = "Increases your health";
Medic.register()

Cheerleader = Object.create(Ninja);
Cheerleader.name = 'Cheerleader';
Cheerleader.body = 'cheerleader.png';
Cheerleader.w = 128;
Cheerleader.apply = function(dude)
{

  dude.tickEvents.push(function(dude, enemyDude){
    if (dude.focus < 7) { dude.focus = dude.focus * 2; }
  })

}
Cheerleader.description = "See past the 'stache.";
Cheerleader.effects = "Increases your focus";
Cheerleader.register()
