/*
Combat system
*/

import globals.pde
import constants.pde

var tmp;

public class CombatSystem{

	Armor[] Armors;
	Weapon[] Weapons;
	
	CombatSystem(){
	
		Weapons = new Weapons[WEAPON_COUNT];
		Weapons[WEAPON_YELLOW_LASER] = new Weapon("Yellow Laser", 1, 320,64,30);
		Weapons[WEAPON_BLUE_LASER] = new Weapon("Blue Laser", 1, 100,16, 20);
		Weapons[WEAPON_BANDIT_LASER] = new Weapon("Bandit Laser", 1, 90,16, 10);
		Weapons[WEAPON_ASTEROID] = new Weapon("ASTEROID", 60, 32,0, 1);
		//...
		
		Armors = new Armor[ARMOR_COUNT];
		Armors[ARMOR_NONE] = new Armor("No Armor", 0);
		Armors[ARMOR_BASIC] = new Armor("Basic Armor", 1);
		Armors[ARMOR_COOL] = new Armor("Cool Armor", 10);
		//..
	
	}

	bool Hits(int w, int rng, float _hit_pct){
//		console.log("hitchek:",w,rng, _hit_pct,  Weapons[w]);
		bool hit =false;
		
		if(rng <= Weapons[w].range){
			hit= true;
		}/*
		else{
			if(rng <= Weapons[w].range + Weapons[w].falloff && random <= FALLOFF_PCT ){
				hit =true;
			}
			else{
				hit =false;
			}
		}
		
		if(hit && random() >  _hit_pct){
//			console.log("user_error");
			hit =false;
		}
//		console.log("HIT?"+hit);*/
		return hit;
	}
	
	int Damage(int w){
		float rnd =random();
		float dmg = Weapons[w].damage *rnd;
		float margin = Weapons[w].damage * .01;
		if(rnd < margin){
			dmg = Weapons[w].damage * CRITICAL_MULTIPLIER;
		}
		return ceil(dmg);
	}
	
	int Reduction(int w, int a,int dmg){
		//TODO DAMAGE TYPES
		int out= 0;
		if(Armors[a].damageReduction >= dmg){
			out = 1;
		}else{
			if(Weapons[w].damage <= dmg){
				out = dmg - Armors[a].damageReduction
			}
			else{
				//critical
				out =dmg;
			}
		}
		return dmg;
	}
}

public class Weapon{
	string name;
	int damage;
	int range;
	int falloff;
	int rof;
	int effectType=0;
//	color Color;
	
	public Weapon(string _name, int _damage, int _range, int _falloff, int _rof){
		name= _name;
		damage= _damage;
		range=_range;
		falloff = _falloff;
		rof = _rof;
		effectType=0;
		//Color = color(random()*255,random()*255,random()*255, 128);
	}
	
	public void  draw(int x, int y, float r){
		pushMatrix();
			translate(x,y);
			rotate(r);
			rect(-2,-2,4,4);
		popMatrix();
	}

}

public class Armor{
	string name;
	int DamageReduction;
	
	public Armor(string _name, int dr){
		name = _name;
		DamageReduction = dr;
	}	
	
}
