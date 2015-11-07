/*

Input Manager

*/
import constants.pde
import globals.pde

var temp;


void keyPressed(){
	console.log(keyCode, GameState);
	switch(GameState){
		case GS_INTRO:
			Input.introKey(keyCode);
		break;
		case GS_OFFER:
			Input.offerKey(keyCode);
		break;
		case GS_MISSION:
			Input.missionKey(keyCode);
		break;
		case GS_MISSION_WIN:		
			Input.missionResult(keyCode);
		break;
		case GS_MISSION_LOSE:
			Input.missionResult(keyCode);
		break;
		case GS_MENU:
			Input.menuKey(keyCode);
		break;
		
		default:
			Input.GameState = GS_MENU;
			Input.menuKey(keyCode);
		break;
	}
}

void mouseClicked(){
switch(GameState){
		case GS_INTRO:
			Input.introKey(ENTER);
		break;
		case GS_OFFER:
			Input.offerClick();
		break;
		case GS_MENU:
			Input.menuKey(ENTER);
		break;
		
		case GS_MISSION_WIN:		
			Input.missionResult(ENTER);
		break;
		case GS_MISSION_LOSE:
			Input.missionResult(ENTER);
		break;
		case GS_MISSION:
			Input.missionMouseClicked(keyCode);
		break;
		
		
		default:
			Input.GameState = GS_MENU;
			//Input.menuKey(keyCode);
		break;
	}
}
void mouseDragged(){
switch(GameState){
		case GS_MISSION:
			Input.missionMouseClicked(keyCode);
		break;
		
		default:
			//Input.GameState = GS_MENU;
			//Input.menuKey(keyCode);
		break;
	}
}




public class InputManager{

	void introKey(int keyCode){
		GameState = GS_MENU;
	}

	void menuKey(int keyCode){
		switch(keyCode){
			case UP:
			case LEFT:
				MenuSelected -=1;
				if(MenuSelected <0){
					MenuSelected = MENU_QUIT
				}
			break;
			case DOWN:
			case RIGHT:
				MenuSelected +=1;
				if(MenuSelected >MENU_QUIT){
					MenuSelected = 0
				}
			break;
			
			case ENTER:
			case RETURN:
			case SPACE:
			
				// do teh action selected
			
				if(MissionId < theMissions.length){
					LoadMission = true;
					GameState = GS_OFFER;
				}
				
			
			break; 
			
		}
	}

	void offerKey(int keyCode){
				//TODO check guards
				for(int i =0; i <CurrentMission.Guards.length;i++){
					AllGuards[SelectedGuards[i]].isDead= false;
					AllGuards[SelectedGuards[i]].hp = 					AllGuards[SelectedGuards[i]].maxHp;
					CurrentMission.Guards[i] = AllGuards[SelectedGuards[i]];
					
				}
				GameState = GS_MISSION;
				
	}
	void offerClick(){
		if(mouseY>=600){
			offerKey(ENTER);
		}
		if(mouseX > width/2){
			if(mouseY>=200 &&  mouseY < 600 )
			{
				int slot = floor((mouseY -200)/100);
				int offset = (mouseY -200)%100;
				if(slot > GUARDS_MAX){
					slot = GUARDS_MAX-1;
				}
				
				if(offset < 20){
					//pilot Change
					int next = GUARDS_MAX;;
					bool found = false;
					for(int i = 1; i < GUARDS_MAX; i++){
						found=false;
						for(int j = 0;j < SelectedGuards.length;j++){
							if(SelectedGuards[j] == SelectedGuards[slot] + i){
								found=true;
							}
						}
						if(!found){
							next =i;
							i+=GUARDS_MAX;
						}
						
					}
					SelectedGuards[slot] = (SelectedGuards[slot] + next) % AllGuards.length;
					
				}else
				{
					if(offset < 40){
						//Weapon Change
						AllGuards[SelectedGuards[slot]].weapon = 
							(AllGuards[SelectedGuards[slot]].weapon +1) %  PlayersEnabledWeapons ;
					}
					else
					{
						//Armor
						AllGuards[SelectedGuards[slot]].armor =
							(AllGuards[SelectedGuards[slot]].armor +1)  % PlayersEnabledArmor ;
					}
				}
			}
			
		}
	}

	void missionKey(int keyCode){
	console.log(keyCode);
		switch(keyCode){
			case SPACE:
				paused = !paused;
			break;	
			
			case UP:
				CurrentMission.throttle +=0.05;
				if(CurrentMission.throttle > 1.0){
					CurrentMission.throttle = 1.0;
				}
				
			break;
			
			case DOWN:
				CurrentMission.throttle -=0.05;
				if(CurrentMission.throttle < 0.0){
					CurrentMission.throttle = 0.0;
				}
			break;
			
			case 97://NUM Pad1
				CurrentMission.deployAngle = TWO_PI/8*7;
 			break;
			case 98://NUM Pad2
				CurrentMission.deployAngle = 0;
			break;
			case 99://NUM Pad3
				CurrentMission.deployAngle = TWO_PI/8;
			break;
			
			case 100://NUM Pad4
				CurrentMission.deployAngle = TWO_PI/8*6;
			break;
//			case 101://NUM Pad5
			case 102://NUM Pad6
			CurrentMission.deployAngle = TWO_PI/8 *2;
			break;
			case 103://NUM Pad7
				CurrentMission.deployAngle = TWO_PI/8*5;
			break;
			case 104://NUM Pad8148 
				CurrentMission.deployAngle = TWO_PI/8*4;
			break;
			case 105://NUM Pad9
				CurrentMission.deployAngle = TWO_PI/8*3;
			break;
			
		}
	}

	void missionResult(int keyCode){
		MenuSelected = MENU_NEXT;
		GameState = GS_MENU;
	}
	
	void missionMouseClicked(){

		if(mouseX >= UI_SPREAD_X && 
			mouseX <= UI_SPREAD_X +UI_SPREAD_W &&
			mouseY >= UI_SPREAD_Y &&
			mouseY <= UI_SPREAD_Y +UI_SPREAD_H){
			//	console.log("SPREAD");
				CurrentMission.deployDistance = (mouseX - UI_SPREAD_X) / UI_SPREAD_W;
			
			}
		else		
		if(mouseX >= UI_THROTTLE_X && 
			mouseX <= UI_THROTTLE_X +UI_THROTTLE_W &&
			mouseY >= UI_THROTTLE_Y &&
			mouseY <= UI_THROTTLE_Y +UI_THROTTLE_H){
			//	console.log("Throttle", CurrentMission.throttle );
				CurrentMission.throttle = (UI_THROTTLE_H- (mouseY - UI_THROTTLE_Y)) / UI_THROTTLE_H;
			//	console.log("Throttle", CurrentMission.throttle );
			}
		else
		{
			float dist = sqrt(pow(mouseX - UI_BIAS_X,2)+ pow(mouseY - UI_BIAS_Y,2));
			if(dist <= UI_BIAS_R){
			//	console.log("deploychange", CurrentMission.deployStrength, CurrentMission.deployAngle);
				CurrentMission.deployStrength = dist/UI_BIAS_R;
				CurrentMission.deployAngle = atan2(mouseX - UI_BIAS_X,mouseY - UI_BIAS_Y);
			//	console.log("deploychange", CurrentMission.deployStrength, CurrentMission.deployAngle);
			}
		
		}		
		if( mouseX >= UI_PAUSE_X &&
			mouseX <= UI_PAUSE_X + UI_PAUSE_W &&
			mouseY >= UI_PAUSE_Y &&
			mouseY <= UI_PAUSE_Y + UI_PAUSE_H){
			 paused = !paused;
		}

	//TODO CLick orders to attack.

	//TODO hover seelcts.

		float distFromWagon =sqrt(pow(mouseX -width/2,2)+pow( mouseY -height/2,2));
		
		if(distFromWagon <= WAGON_MAX_RADIUS){
			CurrentMission.deployStrength = distFromWagon / WAGON_MAX_RADIUS;
			CurrentMission.deployAngle = atan2(mouseX - width/2,mouseY - height/2);
		
		}

	}
	

		
	

}

