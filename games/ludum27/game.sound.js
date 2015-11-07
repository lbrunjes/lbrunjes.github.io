var Sound = Object.create(null);

Sound.playSound = function(soundType)
{

  if (soundType == 'sword')
    {
      i = Math.random();
      if (i < 0.7) { diesel.soundCache['hack.ogg'].play(); }
      else { diesel.soundCache['stab.ogg'].play() }

    }

}