/*
Renderable.pde
Anything we can draw;
*/
import constants.pde
import globals.pde

console.log("renderable loading");


public abstract class Combatant extends Renderable{
	int weapon = NO_INIT;
	int armor= NO_INIT;
	int target = NO_INIT;
	int team = NO_INIT;
	int lastShotAgo = NO_INIT;
	bool isDead= false;
	float pctToHit =0.25;
	
	
	void update(){
		
	}
	void attack(){		
		var theTarget;
			
		lastShotAgo = 0;
		switch(team){
			case TEAM_BANDIT:
				if(target >=0)
				theTarget =  CurrentMission.Guards[target];
			break;
			case TEAM_GUARD:
				 theTarget = CurrentMission.Bandits[target];
			break;
			//NEUTRAL;
		}
		//TODO java fix);
		if(theTarget)// != null 
		{
			
			bool _hits = Combat.Hits(weapon, getDistance(theTarget),pctToHit);
			if(_hits){
				int _damage = Combat.Damage(weapon);
			
				int _final = Combat.Reduction(weapon, theTarget.armor, _damage);
				Effects.CreateEffect(" "+_final, theTarget.x-5,theTarget.y-10, theTarget.x+3, theTarget.y-100,.3,0,EFFECT_TEXT);
				
				theTarget.hp = theTarget.hp - _final;
				if(theTarget.hp <=0){
				 theTarget.isDead =true;
				 Effects.CreateEffect(theTarget.x-5,theTarget.y-5, theTarget.x+3, theTarget.y+3,.3,0,EFFECT_EXPLODE);
			 	
				}
				Effects.CreateEffect(x, y, theTarget.x,theTarget.y, 10, EFFECT_BLIP, 0);
		
			}
			else{
					// Effects.CreateEffect("MISS",theTarget.x,theTarget.y, theTarget.x+3, theTarget.y+3,.3,0,EFFECT_TEXT);
					Effects.CreateEffect(x, y, theTarget.x-100*random()+50,theTarget.y+100*random()-50, 10, EFFECT_BLIP, 0);
			}
//			console.log("results",_hits,_damage,_final,weapon)
			
		}
		
	}
	void getTarget(){
	
	}



}


class Renderable extends Location{
	bool isDead =false;
	int hp =50;
	int maxHp =50;
	int pctToHit = .25;
	string name ="Something";

	Renderable(float _x, float _y, float _w, float _h, float _r, float _s){
	this();
	 x = _x;
	 y = _y;
	 w= _w;
	 h=_h;
	 rot = _r;
	 speed = _s;
	 maxSpeed=1;
	}
	
	void draw(){

		pushMatrix();
			translate(x-CamX,y-CamY);
			rotate(rot);
				if(isDead){
					line( w/2,h/2, w/-2,h/-2);
					line(w/-2,h/2, w/2,h/-2);
				}
				ellipse(0,0, w/2,h/2);
		popMatrix();
		
	}
}

class Location{

//	location data
	float x;
	float y;
	int w;
	int h;
	float rot;
	float speed;
	float maxSpeed;

	bool showMe;
	
	float getDistance(Location tgt){
		if(tgt != null)
		return sqrt(pow(x-tgt.x,2)+pow(y-tgt.y,2));
		return -1.0;
	}
	float getDistance(int _x, int _y){
		return sqrt(pow(x - _x ,2)+ pow( y - _y , 2 ));
	}
	float getDirection(Location tgt){
		
		float angle = atan2(x-tgt.x, y-tgt.y);
		
		//TODO atan  onlreturn 0-PI we need to ensure we handle cases of PI_2PI
	
		return angle
	}
	
	float getDirection(int _x, int _y){
		
		float angle = atan2(x- _x, y-_y);
		
		//TODO atan  onlreturn 0-PI we need to ensure we handle cases of PI_2PI
	
		return angle
	}
	void move(){
		x -= sin(rot)*speed;
		y -= cos(rot)*speed;
	}
	
	
}
