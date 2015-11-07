/*

MISSIONS

*/
import globals.pde
import constants.pde
import guy.pde
import renderable.pde

var tmp;

public class Mission{

	int w;
	int h;
	int Id;
	
	float deployAngle = 0.0;
	float deployDistance = 0.96;
	float deployStrength = 0.5;
	float throttle = 0.5;

	int reward;
	int length;

	int rating;
	
	string name;
	string description;

	point[] waypoints;
	int lastWP;
	int nextWP;
	 
	Wagon wagon;
	
	Guard[] Guards;
	Combatants[] Bandits;
	
	
	public Mission(int missionId){
	
		//TODO MAKE THIS JAVA FRIENDLY
		Id= missionId;
//		w = theMissions[missionId].w;
//		h = theMissions[missionId].h;
		reward = theMissions[missionId].reward;
		length = theMissions[missionId].length;
		rating = theMissions[missionId].rating;
		name = theMissions[missionId].name;
		description = theMissions[missionId].description;
		waypoints = new point[theMissions[missionId].waypoints.length];
		lastWP = 0;
		nextWP = 1;
		
		for(var i = 0; i < theMissions[missionId].waypoints.length; i++){
			waypoints[i] = new point(theMissions[missionId].waypoints[i][0],theMissions[missionId].waypoints[i][1]);
			//console.log(theMissions[missionId].waypoints[i][0],theMissions[missionId].waypoints[i][1]);
		}
		
		wagon = new Wagon(waypoints[0].x, waypoints[0].y);
		
		Guards = new Guard[GUARDS_MAX];
		for(int i =0; i <Guards.length;i++){
			Guards[i] = AllGuards[SelectedGuards[i]];
		}
		Bandits = new Bandit[theMissions[missionId].bandits.length];
		for(var i = 0; i < Bandits.length; i++){
			switch(theMissions[missionId].bandits[i][2]){
				case BANDIT_TYPE_ASTEROID:
					Bandits[i] = new Asteroid(theMissions[missionId].bandits[i][0], theMissions[missionId].bandits[i][1], 32, 32, random()*TWO_PI);
				break;
				case BANDIT_TYPE_CRUISER:
					Bandits[i] = new Cruiser(theMissions[missionId].bandits[i][0], theMissions[missionId].bandits[i][1], random()*TWO_PI);
				break;
				case BANDIT_TYPE_GUN:
					Bandits[i] = new Gun(theMissions[missionId].bandits[i][0], theMissions[missionId].bandits[i][1]);
				break;
				
				
				case BANDIT_TYPE_SHIP:
				default:
			
					Bandits[i] = new Bandit(theMissions[missionId].bandits[i][0], theMissions[missionId].bandits[i][1]);
				break;
				
			}
		}
	}
	void draw(){
	//draw teh background;
		
		//center on teh wagon
		CamX = wagon.x;
		CamY = wagon.y;
		
		pushMatrix();
			translate(width/2, height/2);
				
		
			//draw teh wagon path
			strokeWeight(PATH_WEIGHT);
			fill( COLOR_PATH_FILL);
			stroke(COLOR_PATH_STROKE);
			for(int i = 1; i < waypoints.length; i++){
				line(waypoints[i].x -CamX, waypoints[i].y - CamY, waypoints[i-1].x- CamX, waypoints[i-1].y - CamY);
			}
			stroke(COLOR_ACTIVE_PATH_STROKE);
			line(waypoints[lastWP].x -CamX, waypoints[lastWP].y -CamY,  0,  0);		
			strokeWeight(1);
			
			
			//draw their guys/
			fill(COLOR_BANDIT_FILL);
			stroke(COLOR_BANDIT_STROKE);
			for(int i =0; i < Bandits.length;i++){
				Bandits[i].draw();
			}
			
			//draw teh wagon
			fill(COLOR_WAGON_FILL);
			stroke(COLOR_WAGON_STROKE);
			wagon.draw();
			//TODO make this pretty/.
			//show the max distance thew ship can travel
			if(CurrentMission.deployStrength > .9){
				noFill();
				ellipse(0,0,WAGON_MAX_RADIUS*2,WAGON_MAX_RADIUS*2);
			}
			
			//draw your guys
			fill(COLOR_GUARD_FILL);
			stroke(COLOR_GUARD_STROKE);
			for(int i = 0; i <  Guards.length; i++){
				Guards[i].draw(i);
			}
			
			//draw effects
			pushMatrix();
				translate(-CamX, -CamY);
				for(int i =0; i < Effects.instances.length; i++){
					if(Effects.instances[i]&& Effects.instances[i].type){
					Effects.instances[i].draw();
					}
				}
			popMatrix();
			
				
		popMatrix();
		
		//dim the game if paused.
		if(paused){
			fill(0,0,0,128);
			rect(0,0,width,height);
			fill(COLOR_MENU_TEXT);
			textSize(TITLE_SIZE);
			textAlign(CENTER);
			text("PAUSED", width/2,height/2);
		
		}
		
		//Draw the UI;
		textAlign(CENTER);	
		fill(COLOR_UI_FILL);
		stroke(COLOR_UI_STROKE);
		
		fill(COLOR_GUARD_FILL);
		stroke(COLOR_GUARD_STROKE);
		ellipse(UI_BIAS_X, UI_BIAS_Y, UI_BIAS_R*2, UI_BIAS_R*2);
///		rect(UI_SPREAD_X, UI_SPREAD_Y,UI_SPREAD_W, UI_SPREAD_H);


		fill(COLOR_WAGON_FILL);
		stroke(COLOR_WAGON_STROKE);
		rect(UI_THROTTLE_X, UI_THROTTLE_Y,UI_THROTTLE_W, UI_THROTTLE_H);
		
		fill(COLOR_UI_INIDICATOR_FILL);
		stroke(COLOR_UI_INIDICATOR_STROKE);
		
		ellipse(UI_BIAS_X+sin(deployAngle)*(deployStrength * UI_BIAS_R), UI_BIAS_Y+cos(deployAngle)*(deployStrength* UI_BIAS_R), UI_BIAS_I, UI_BIAS_I);
	//	rect( UI_SPREAD_X +(UI_SPREAD_W*deployDistance)+1, UI_SPREAD_Y+1,UI_SPREAD_I, UI_SPREAD_H-2);
		rect(UI_THROTTLE_X+1, UI_THROTTLE_Y+ UI_THROTTLE_H -(UI_THROTTLE_H*throttle-2)-1,UI_THROTTLE_W-2, UI_THROTTLE_H*throttle-2);
		
		rect(UI_PAUSE_X ,UI_PAUSE_Y, UI_PAUSE_W, UI_PAUSE_H);
		rect(UI_PAUSE_X+ UI_PAUSE_W/5, UI_PAUSE_Y + UI_PAUSE_H/6, UI_PAUSE_W/5, UI_PAUSE_H/3*2);
		rect(UI_PAUSE_X+ UI_PAUSE_W/5*3, UI_PAUSE_Y + UI_PAUSE_H/6, UI_PAUSE_W/5, UI_PAUSE_H/3*2);
		
		//DRAW Pilots names and health
		
		int guardWidth=128;
		int guardHeight=32;
		for(int i =0;i < CurrentMission.Guards.length;i++){
			
			
			fill(COLOR_UI_INIDICATOR_FILL);
			stroke(COLOR_UI_INIDICATOR_STROKE);
			beginShape()
				vertex((i*guardWidth), height);
				vertex((i*guardWidth), height - guardHeight + 4);
				vertex((i*guardWidth)+4, height -guardHeight);
				vertex((i*guardWidth)+108, height -guardHeight);
				vertex((i*guardWidth)+112, height - guardHeight +4);
				vertex((i*guardWidth)+112, height);
			endShape();
			
			
			if(!CurrentMission.Guards[i].isDead){
				image(CurrentMission.Guards[i].headshot,  (i*guardWidth)+1,height -guardHeight, 32,32);
				line((i*guardWidth)+34, height -guardHeight, (i*guardWidth)+36, height);
				fill(COLOR_UI_INIDICATOR_FILL);
				stroke(COLOR_UI_INIDICATOR_STROKE);
			
				//rect((i*guardWidth),height - TEXT_SIZE,(i*guardWidth), TEXT_SIZE); 
			
				fill(COLOR_GUARD_FILL);
				noStroke();
			
				rect((i*guardWidth)+40,height - TEXT_SIZE +1, (guardWidth-64) * (CurrentMission.Guards[i].hp/CurrentMission.Guards[i].maxHp), TEXT_SIZE-2); 
			}
			
			text(CurrentMission.Guards[i].name, (i*guardWidth)+64, height - guardHeight+TEXT_SIZE);
		}
	}
	
	
	void update(){
		//console.log("Mission Update");
	
		wagon.update();
			
		//are we at the next waypoint?
		if(wagon.getDistance(waypoints[nextWP].x,waypoints[nextWP].y) <= WAGON_ROUND){
			nextWP = (nextWP+1) %waypoints.length;
			lastWP = (lastWP+1) %waypoints.length;
			
			if(nextWP ==0){
				//Mission Success
				GameState= GS_MISSION_WIN;
				MissionId++;
			 
			 	if(MissionId == theMissions.length){
			 		//Show the game over screen.
			 		//You win!!
			 		//TODO ..
			 	}
			}
		}
		
		for(int i = 0; i <Guards.length; i++){
			Guards[i].update(i);
		}
		for(int i = 0; i <Bandits.length; i++){
			Bandits[i].update(i);
		}
		for(int i =0; i < Effects.instances.length; i++){
			Effects.instances[i].update();
		}

		
		//console.log("Mission Update Ends");

	}
}
