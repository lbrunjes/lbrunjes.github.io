/*
Guy.pde
the setup for a dude

*/
/*pjs preload s in teh base file="img/pilot.png"*/

class Guard extends Combatant{
/*	int hp;
	int maxHp;
	
	int pctToHit = .25;
*/
	int grit;
	int maxGrit;
	
	int selectedSlot =-1; 
//	string name;
	
	float rot;
	float angle;
	float distance;
	
	float targetAngle;
	float targetDistance;
	float speed;
	bool ignoreCommands = false;	
	
	PImage headshot;
	Guard(string _name,float _angle, float _distance, float _rot, int _hp, int _shoot,  int _grit, int _w, int _a){
		headshot = loadImage("img/pilot.png");
		this();
		team=TEAM_GUARD;
		name = _name;
		angle = _angle;
		distance = _distance;
		hp = _hp;
		maxHp = hp;
		pctToHit = _shoot /100;
		
		grit = _grit / 100;
		maxGrit = grit;
		rot = _rot;
		targetAngle = _angle;
		targetDistance = _distance;
		ignoreCommands = false;
		armor = _a;
		weapon= _w;
	}

	
	void draw(int i ){

	if(isDead){return;}
	
		pushMatrix();
			
			if(ignoreCommands){
				translate(sin(angle)*distance, cos(angle)*distance);
				
			}
			else
			{
				//TODO matke this work by arwdith instead of just arbitary angle
				if(i%2==0){
					translate( sin(CurrentMission.deployAngle + (i/2* GUARD_SPACING ))*CurrentMission.deployStrength * WAGON_MAX_RADIUS,
						 	 cos(CurrentMission.deployAngle + (i/2* GUARD_SPACING ))*CurrentMission.deployStrength * WAGON_MAX_RADIUS);
				}
				else{
					translate( sin(CurrentMission.deployAngle - (i* GUARD_SPACING ))*CurrentMission.deployStrength * WAGON_MAX_RADIUS,
						 	 cos(CurrentMission.deployAngle - (i* GUARD_SPACING ))*CurrentMission.deployStrength * WAGON_MAX_RADIUS);
				}
				
			}
			
			
			
			rotate(TWO_PI - CurrentMission.wagon.rot + rot);			

			
			beginShape();
				vertex(0, PERSON_RADIUS);
				vertex(PERSON_RADIUS/3*2, PERSON_RADIUS/-3);
				vertex(0, PERSON_RADIUS/-4);
				vertex(PERSON_RADIUS/-3*2, PERSON_RADIUS/-3);
				vertex(0, PERSON_RADIUS);
			endShape();
			
		
		popMatrix();
			
		//ellipse(sin(angle)*distance, cos(angle)*distance, PERSON_RADIUS*2,PERSON_RADIUS*2);
		
		
		
	}
	
	void update(int i){
		if(isDead){return;}
		//update our location n case we need it.
		if(i%2==0)
		{
			x = CurrentMission.wagon.x + sin(CurrentMission.deployAngle + (i/2* GUARD_SPACING )) * CurrentMission.deployStrength * WAGON_MAX_RADIUS;
			y = CurrentMission.wagon.y + cos(CurrentMission.deployAngle + (i/2* GUARD_SPACING )) * CurrentMission.deployStrength * WAGON_MAX_RADIUS;
		}
		else{
			x = CurrentMission.wagon.x + sin(CurrentMission.deployAngle - (i* GUARD_SPACING )) * CurrentMission.deployStrength * WAGON_MAX_RADIUS;
			y = CurrentMission.wagon.y + cos(CurrentMission.deployAngle - (i* GUARD_SPACING )) * CurrentMission.deployStrength * WAGON_MAX_RADIUS;
		}
		
		//move to the target angle and distance.
		//Pick out a target;
		//default to the ship nearest teh wagon
		target = CurrentMission.wagon.NearestBandit;
		if(Combat.Weapons[weapon].range < getDistance(CurrentMission.Bandits[target])){
			//get a new target
			int closest = NO_INIT;
			int nearestDist= Combat.Weapons[weapon].range;
			int currDist;
			for(int  j =0; j< CurrentMission.Bandits.length;j++){
				if(!CurrentMission.Bandits[j].isDead){
					currDist = getDistance(CurrentMission.Bandits[j]);
				
					if(currDist <nearestDist){
						closest = j;
					}			
				}
			}
			// if we cant  attack the wagon's target attack teh nearest hostile first.
			target = closest;
			
		}
			
		//can we attack?
		lastShotAgo++;

		if(lastShotAgo  > Combat.Weapons[weapon].rof &&  target >= 0 && !CurrentMission.Bandits[target].isDead && Combat.Weapons[weapon].range >= getDistance(CurrentMission.Bandits[target])){
			//WE  can attack;
			//DO IT
			attack();
			//Show it at a totally different time.!!
			Effects.CreateEffect(x, y, CurrentMission.Bandits[target].x, CurrentMission.Bandits[target].y, 10, EFFECT_BLIP, 0);
			
			lastShotAgo = 0;
		}
		
		
	}

}



class Gun extends Combatant{
	public Gun(float _x, float _y){
		team = TEAM_BANDIT;
		armor= 0;
		weapon = WEAPON_YELLOW_LASER;
		lastShotAgo =0;
		target = NO_INIT;
		x= _x;
		y= _y;
		h=32;
		w=32;
		name="A Bandit Sentry Gun";
		maxSpeed =0;
		hp= 7;
	}
	
	void draw(){
		if(isDead){return};
		fill(COLOR_BANDIT_FILL);
		stroke(COLOR_BANDIT_STROKE);
		pushMatrix();
			translate(x-CamX,y-CamY);
			rotate(rot);
			beginShape();
				vertex(w/-2, h/-2);
				vertex(0,h/-4);
				vertex(w/2, h/-2);
				vertex(w/4,0);
				vertex(w/2, h/2);
				vertex(0,h/4)
				vertex(w/-2, h/2);
				vertex(w/-4,0);

			endShape(CLOSE);
		popMatrix();
		
		
		
	}	
	void update(int i){
	
		if(isDead){return;}
		//change our position
		//TODO
		
		
		//Pick out a target; if we dont alreadyt have one. or our target is dead
		if(target ==NO_INIT){
			int closest = NO_INIT;
			int nearestDist= BANDIT_MAX_RANGE;
			int currDist;
			for(int  j =0; j< CurrentMission.Guards.length;j++){
				if(!CurrentMission.Guards[j].isDead){
					currDist = sqrt(pow(CurrentMission.Guards[j].x-x,2)+ pow(CurrentMission.Guards[j].y - y, 2));
				
					if(currDist <nearestDist){
						closest = j;
					}			
				}
			}
			// if we cant find a guard attack the wagon first.
			target = closest;		
				
		}
		else{

			if(target == BANDIT_SHOOTS_WAGON){
				//console.log("chasing wagon", speed, maxSpeed);			
				//At this point chase the Wagon
				rot = atan2(CurrentMission.wagon.x - x,CurrentMission.wagon.y - y);

				//if we get close enough game over.
				if( getDistance(CurrentMission.wagon) <= BANDIT_WAGON_CONTACT_RADIUS){
					speed=0;
					//Show the you lose screen.
					GameState =GS_MISSION_LOSE;
				}
				
			}
			else{
				//Change the target if you killed him
				if(CurrentMission.Guards[target].isDead){
					target = NO_INIT;
				}
				else{
					rot = atan2(CurrentMission.Guards[target].x - x,CurrentMission.Guards[target].y - y);
					
					float targetDistance =getDistance(CurrentMission.Guards[target]);
					
					//if we get close enough stop
					if( targetDistance <= BANDIT_WAGON_CONTACT_RADIUS){
						speed=0;
					
					}
								
					//random chance to get distracted
					if(random()< .1){
						target = NO_INIT;
					}
				}
			}
		}
		
		
		
		lastShotAgo++;
		if(lastShotAgo  > Combat.Weapons[weapon].rof && target >= 0 && targetDistance <= Combat.Weapons[weapon].range){
			//WE can attack;
			lastShotAgo = 0;
			
			attack();
					
			Effects.CreateEffect(x, y, CurrentMission.Guards[target].x,CurrentMission.Guards[target].y, 10, EFFECT_BLIP, 0);
		}
	
	}
}
class Bandit extends Combatant{
	public Bandit(float _x, float _y){
		team = TEAM_BANDIT;
		armor= 0;
		weapon = WEAPON_BANDIT_LASER;
		lastShotAgo =0;
		target = NO_INIT;
		x= _x;
		y= _y;
		h=32;
		w=32;
		name="A Bandit";
		maxSpeed =1;
		hp= 8;
	}
	
	void draw(){
		if(isDead){return};

		fill(COLOR_BANDIT_FILL);
		stroke(COLOR_BANDIT_STROKE);
		pushMatrix();
			translate(x-CamX,y-CamY);
			rotate(rot);
			ellipse(0,0, w/2,h/2);
		popMatrix();
		
		
		
	}	
	void update(int i){
	
		if(isDead){return;}
		//change our position
		//TODO
		
		
		//Pick out a target; if we dont alreadyt have one. or our target is dead
		if(target ==NO_INIT){
			int closest = NO_INIT;
			int nearestDist= BANDIT_MAX_RANGE;
			int currDist;
			for(int  j =0; j< CurrentMission.Guards.length;j++){
				if(!CurrentMission.Guards[j].isDead){
					currDist = sqrt(pow(CurrentMission.Guards[j].x-x,2)+ pow(CurrentMission.Guards[j].y - y, 2));
				
					if(currDist <nearestDist){
						closest = j;
					}			
				}
			}
			// if we cant find a guard attack the wagon first.
			target = closest;
			
			if(target == NO_INIT && sqrt(pow(CurrentMission.wagon.x-x,2)+ pow(CurrentMission.wagon.y - y, 2)) <= BANDIT_MAX_RANGE){
				target = BANDIT_SHOOTS_WAGON;
			}
			
				
		}
		else{

			if(target == BANDIT_SHOOTS_WAGON){
				//At this point chase the Wagon
				rot = atan2(CurrentMission.wagon.x - x,CurrentMission.wagon.y - y);
				if(speed <maxSpeed){
					speed += .1;
				}
				
				x += sin(rot)*speed;
				y += cos(rot)*speed;
				//if we get close enough game over.
				if( getDistance(CurrentMission.wagon) <= BANDIT_WAGON_CONTACT_RADIUS){
					speed=0;
					//Show the you lose screen.
					GameState =GS_MISSION_LOSE;
				}
				
			}
			else{
				//Change the target if you killed him
				if(CurrentMission.Guards[target].isDead){
					target = NO_INIT;
				}
				else{
				
	

					//approach the taregt slwoly
					rot = atan2(CurrentMission.Guards[target].x - x,CurrentMission.Guards[target].y - y);
					if(speed <maxSpeed/2){
						speed += .1;
					}
				
					x += sin(rot)*speed;
					y += cos(rot)*speed;
					
					float targetDistance =sqrt(pow(CurrentMission.Guards[target].x-x,2)+ pow(CurrentMission.Guards[target].y - y, 2));
					
					//if we get close enough stop
					if( targetDistance <= BANDIT_WAGON_CONTACT_RADIUS){
						speed=0;
					
					}
					
					
					//if we are closer to the wagon change targets
					if( targetDistance  > getDistance(CurrentMission.wagon) ){
					 target = BANDIT_SHOOTS_WAGON; 
					}
					
					//random chance to get distracted
					if(random()< .1){
						target = NO_INIT;
					}
					
				}
			}
		}
		
		
		
		lastShotAgo++;
		if(lastShotAgo  > Combat.Weapons[weapon].rof && target >= 0 && targetDistance <= Combat.Weapons[weapon].range){
			//WE can attack;
			lastShotAgo = 0;
			
			attack();
					
			Effects.CreateEffect(x, y, CurrentMission.Guards[target].x,CurrentMission.Guards[target].y, 10, EFFECT_BLIP, 0);
		}
	
	}
}


class Asteroid extends Combatant{
	
	public Asteroid(int _x,int _y, int _w, int _h, float _rot){
	 x=_x;
	 y=_y;
	 w=_w;
	 h=_h
	 rot=_rot;
	 weapon = WEAPON_ASTEROID;
	 armor = ARMOR_COOL;
	 maxHp=25;
	 hp=25;
	 team =TEAM_BANDIT;
	}
	
	void draw(){
		if(isDead){return;}
		fill(COLOR_BANDIT_ASTEROID_FILL);
		stroke(COLOR_BANDIT_ASTEROID_STROKE);
		pushMatrix();
			translate(x-CamX,y-CamY);
			rotate(rot);
			scale(hp/maxHp);
			beginShape();
				vertex(0, h/-2);
				vertex(w/4,h/-4);
				vertex(w/4,0);
				vertex(w/2,h/2);
				vertex(0, h/4);
				vertex(w/-4,h/2);
				vertex(w/-2,h/4);
				vertex(w/-4,0);
				vertex(w/-2,h/-4);
				vertex(0, h/-2);
			endShape();
		popMatrix();
	}
	void update(){
		if(isDead){return;}
		for(var i =0;i< CurrentMission.Guards.length;i++){
			if(getDistance(CurrentMission.Guards[i]) <  Combat.Weapons[weapon].range * hp/maxHp && !CurrentMission.Guards[i].isDead){
				target = i;
				attack();
			}
		}
		
		// Are we touching teh wagon?
		if( getDistance(CurrentMission.wagon) <= BANDIT_WAGON_CONTACT_RADIUS*hp/maxHp){
			speed=0;
			//Show the you lose screen.
			GameState =GS_MISSION_LOSE;
		}
	
	}
}
class Cruiser extends Combatant{
	
	public Cruiser(int _x,int _y,  float _rot){
	 x=_x;
	 y=_y;
	 w=32;
	 h=64;
	 maxSpeed=.5;
	 speed=0;
	 rot=_rot;
	 weapon = WEAPON_BLUE_LASER;
	 armor = ARMOR_COOL;
	 maxHp=50;
	 hp=50;
	 team =TEAM_BANDIT;
	}
	
	void draw(){
		if(isDead){return;}
		fill(COLOR_BANDIT_FILL);
		stroke(COLOR_BANDIT_STROKE);
		pushMatrix();
			translate(x-CamX,y-CamY);
			rotate(TWO_PI - rot);
			beginShape();
				vertex(w/-8, h/-2);
				vertex(w/8, h/-2);
				vertex(w/8, h/8*-3);
				vertex(w/2, 0);
				vertex(w/8*3, 0);
				vertex(w/4, h/2);
				
				//TODO WING THINGS?
				vertex(w/-4, h/2);	
				vertex(w/-8 *3, 0);
				vertex(w/-2, 0);
				vertex(w/-8, h/8*-3);
				vertex(w/-8, h/-2);
			endShape();
		popMatrix();
	}
	void update(){
		if(isDead){return;}
		rot = getDirection(CurrentMission.wagon);
		
		if(speed <maxSpeed){
			speed += .05;
		}
		move();
		
		for(var i =0;i< CurrentMission.Guards.length;i++){
			if(getDistance(CurrentMission.Guards[i]) <  Combat.Weapons[weapon].range && !CurrentMission.Guards[i].isDead){
				target = i;
				attack();
			}
		}
		
		// Are we touching teh wagon?
		if( getDistance(CurrentMission.wagon) <= BANDIT_WAGON_CONTACT_RADIUS){
			speed=0;
			//Show the you lose screen.
			GameState =GS_MISSION_LOSE;
		}
	
	}
}

/*


THe wagon class is teh ship to defgend


*/
class Wagon extends Renderable{
	
	int NearestBandit =-1;
	
	public Wagon(float _x, float _y){
		x= _x;
		y= _y;
		h= WAGON_H;
		w= WAGON_W;
		speed = 1.0;
		rot=0;
	}
	
	void draw(){
		pushMatrix();
		rotate(TWO_PI-rot);
		beginShape();
			vertex(0, h/-2);
			vertex(w/2, h/-4);
			vertex(w/2, h/2);
			vertex(0, h/4);
			vertex(w/-2, h/2);
			vertex(w/-2, h/-4);
			vertex(0, h/-2);
		endShape();
		popMatrix();
	}
	
	void update(){
		
		if(CurrentMission.waypoints[CurrentMission.nextWP].x > x||
		CurrentMission.waypoints[CurrentMission.nextWP].y > y ||
		(CurrentMission.waypoints[CurrentMission.nextWP].x < x && CurrentMission.waypoints[CurrentMission.nextWP].y < y) ){
			x-=sin(rot)*speed * CurrentMission.throttle;
			y-=cos(rot)*speed * CurrentMission.throttle;	
		}
		else{
			x+=sin(rot)*speed;
			y+=cos(rot)*speed;	
		}
		rot = atan2( x - CurrentMission.waypoints[CurrentMission.nextWP].x, y - CurrentMission.waypoints[CurrentMission.nextWP].y );	
		
		//find teh nearest bandit.
		int nearest=-1;
		float neardist=TARGET_MAX_RANGE;
		float dist=0;
		for(int i = 0 ; i< CurrentMission.Bandits.length;i++){

			dist = sqrt(pow(CurrentMission.Bandits[i].x - x,2)+pow(CurrentMission.Bandits[i].y - y,2));
			if(dist < neardist && !CurrentMission.Bandits[i].isDead){
				nearest = i;
				neardist= dist;
			}
		}		
		NearestBandit = nearest;
	}
}

