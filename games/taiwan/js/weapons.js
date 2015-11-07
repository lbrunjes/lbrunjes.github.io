/*
	Weapons for the game
	2014 Lee Brunjes
	lee.brunjes@gmail.com
	Written in a park in taipei

*/

game.objects.weapons.fist = function(){

this.damageMax = 2;
this.damageMin = 1;
this.range = 16;
this.rateOfFire=1;
this.sinceLastFired =0;
this.name ="fist";

}
game.objects.weapons.fist.prototype = new game.objects.weapons.base();

game.objects.weapons.sword = function(){
this.damageMax = 6;
this.damageMin = 1;
this.range = 16;
this.rateOfFire=2;
this.sinceLastFired =0;
this.name ="sword";
}

game.objects.weapons.sword.prototype = new game.objects.weapons.base();

game.objects.weapons.bite = function(){

this.damageMax = 6;
this.damageMin = 3;
this.range = 8;
this.rateOfFire=3;
this.sinceLastFired =0;
this.name ="bite";

}
game.objects.weapons.bite.prototype = new game.objects.weapons.base();

game.objects.weapons.curse = function(){

this.damageMax = 6;
this.damageMin = 3;
this.range = 8;
this.rateOfFire=5;
this.sinceLastFired =0;
this.name ="curse";
this.children=[];
this.childrenMax =3;

this.canFire=function(){
	var base = this.prototype.canFire();
	
	base = base && this.children.length<childrenMax;
	
	return base;
	
}	


}
game.objects.weapons.curse.prototype = new game.objects.weapons.base();