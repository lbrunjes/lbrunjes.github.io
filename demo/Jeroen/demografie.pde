//Data
Table demografieTable;


int aantalrijen;
int gekozenJaar = 2011;
int aantalMax = MIN_INT;
int aantalMin = MAX_INT;
int jaarMax = MIN_INT;
int jaarMin = MAX_INT;
int asStep = 100000;

//Druk
int aantalGrijzeDruk;
int aantalGroeneDruk;
int aantalDruk;

//Variables for Piramide
int plotPiramideX = 40;
int plotPiramideY = 40;
int plotPiramideWidth = 400;
int plotPiramideHeight = 400;
int plotPiramideGutter = 50;
int plotPiramideBarMan = #8CB3D9;
int plotPiramideBarVrouw = #FFB3B3;

void setup()
{
  //Inlezen tabel met demografie data 
  demografieTable = new Table("demografie3.txt");
  aantalrijen = demografieTable.getRowCount();
  
  //Bepalen maximaal aantal om de bar breedte goed te krijgen en gelijk over alle jaren
  for (int row = 0; row < aantalrijen ; row++)
  {
    //Maximaal en minimaal aantal
    int aantal = demografieTable.getInt1(row, 4);
    if (aantal > aantalMax) {
      aantalMax = aantal;
    }
    if (aantal < aantalMin) {
      aantalMin = aantal;
    }
    
    //Maximaal en minimaal jaar
    int jaar = demografieTable.getInt1(row, 3);
    if (jaar > jaarMax) {
      jaarMax = jaar;
    }
    if (jaar < jaarMin) {
      jaarMin = jaar;
    }
    
    jsdata[jaar] = {};
    
   
  }
  
  //Max aantal netjes afronden naar boven
  aantalMax = (ceil((float) aantalMax / 100000)) * 100000; 
  
  
  //process all data into the js table as output data.
  for(var jaar in jsdata)
  {
    for (int j = 5; j <= 100; j +=5)
  	{
    		//store all the data we might need;
    		jsdata[jaar][j]= {
    			 "manAantal":demografieTable.getInt("man_"+jaar+"_"+j,4),
   			"vrouwAantal":demografieTable.getInt("vrouw_"+jaar+"_"+j,4),
  		};
	}
  }
  
  //Canvas
  size(640,500);
}

void draw()
{
  //Settings drawing
  background(255);
  smooth();
  
  //Draw
  drawPiramide();
  //drawDruk(500, 50, (float) aantalGrijzeDruk/aantalDruk*100, #444444);
  //drawDruk(500, 200, (float) aantalGroeneDruk/aantalDruk*100, #A2AB42);
}

void drawPiramide()
{
  //Settings
  fill(255);
  stroke(28);
  
  //titel
  fill(0);
  textAlign(LEFT);
  textSize(20);
  text("Leeftijdsopbouw in Nederland: "+gekozenJaar,plotPiramideX,plotPiramideY-15);
  
  translate(plotPiramideX,plotPiramideY);
  rectMode(CORNERS);
  
  //Berekeningen
  int barHeight = floor(plotPiramideHeight/20);
  int sexWidth = (plotPiramideWidth-plotPiramideGutter)/2;
  
  //Reset druk
  aantalGrijzeDruk = 0;
  aantalGroeneDruk = 0;
  aantalDruk = 0;
  
  //20 leeftijdsgroepen voor zowel man als vrouw tekenen
  noStroke();
  for (int j = 5; j <= 100; j=j+5)
  {
  	/*
    //Ophalen row met index (man_1950_5 of vrouw_2011_100)
    int manAantal = demografieTable.getInt("man_"+gekozenJaar+"_"+j,4);
    int vrouwAantal = demografieTable.getInt("vrouw_"+gekozenJaar+"_"+j,4);
    */
    int manAantal =jsdata[gekozenJaar][j].manAantal;
    int vrouwAantal = jsdata[gekozenJaar][j].vrouwAantal;
    //Druk berekenen
    if (j <= 20) {
      aantalGroeneDruk += manAantal+vrouwAantal;
    }
    else if (j > 20 && j <= 65) {
      aantalDruk += manAantal+vrouwAantal;
    }
    else {
      aantalGrijzeDruk += manAantal+vrouwAantal;
    }

    //Berekenen bar width
    float barWidthMan = map(manAantal,0,aantalMax,0,sexWidth);
    float barWidthVrouw = map(vrouwAantal,0,aantalMax,0,sexWidth);
   
    
    //Check if mouseover and show data of year
    int setTransparent = 0;
   if (mouseX > plotPiramideX && mouseX < plotPiramideX+plotPiramideWidth)  {
      if (mouseY > plotPiramideHeight-((j/5)*barHeight)+plotPiramideY && mouseY < plotPiramideHeight-(((j/5)-1)*barHeight)+plotPiramideY) {
        //text(j+":"+manAantal+vrouwAantal,500,340);
        setTransparent = 1;
      }
    }
    
    //Mannen
    noStroke();
    int transparency = (setTransparent == 1) ? 150 : 255;
    fill(plotPiramideBarMan,transparency);
    rect(sexWidth, plotPiramideHeight-(((j/5)-1)*barHeight), sexWidth-barWidthMan, plotPiramideHeight-(j/5)*barHeight);
    
    //Vrouwen
    fill(plotPiramideBarVrouw,transparency);
    rect(sexWidth+plotPiramideGutter, plotPiramideHeight-((j/5)-1)*barHeight, sexWidth+plotPiramideGutter+barWidthVrouw, plotPiramideHeight-(j/5)*barHeight);
  } 
  
  //As lijnen
  float ruimte = map(asStep,0,aantalMax,0,sexWidth);
  for (int k = 0; k <= (aantalMax/asStep); k++) {
    stroke(#444444);
    line(k*ruimte,plotPiramideHeight,k*ruimte,plotPiramideHeight+5);
    stroke(#aaaaaa);
    line(k*ruimte,0,k*ruimte,plotPiramideHeight);
    stroke(#444444);
    line(sexWidth+plotPiramideGutter+k*ruimte,plotPiramideHeight,sexWidth+plotPiramideGutter+k*ruimte,plotPiramideHeight+5);
    stroke(#aaaaaa);
    line(sexWidth+plotPiramideGutter+k*ruimte,0,sexWidth+plotPiramideGutter+k*ruimte,plotPiramideHeight);
  }
  
  //Teken plotarea, assen, gridlijnen, y-waardes
  stroke(#444444);
  line(0,plotPiramideHeight,sexWidth,plotPiramideHeight);
  line(sexWidth,plotPiramideHeight,sexWidth,0);
  line(sexWidth+plotPiramideGutter,plotPiramideHeight,sexWidth+plotPiramideGutter,0);
  line(sexWidth+plotPiramideGutter,plotPiramideHeight,plotPiramideWidth,plotPiramideHeight);
  
  //Horizontale lijnen
  stroke(#aaaaaa);
  for (int j = 0; j < 20; j++) {
    stroke(#aaaaaa);
    line(sexWidth,j*barHeight,sexWidth+5, j*barHeight);
    line(sexWidth+plotPiramideGutter-5,j*barHeight,sexWidth+plotPiramideGutter, j*barHeight);
    fill(#000000);
    textSize(12);
    textAlign(CENTER);
    text(100-(j*5),plotPiramideWidth/2,j*barHeight+(barHeight/4));
  }
  
  //Control
  fill(#000000);
  textSize(20);
  textAlign(LEFT);
  text('Use square brackets ([ or ]) to choose a year '+floor(frameRate),30,430);
}

void drawDruk(int x, int y, float percentage, int kleur)
{
  //Map van druk
  float mappedPercentage = map(percentage,0,100,0,2*PI);
  
  //Tekenen taart
  noStroke();
  ellipseMode(RADIUS);
  fill(#e6e6e6);
  arc(x, y,60,60,0,2*PI);
  fill(kleur);
  arc(x, y, 60,60,0,mappedPercentage);
  fill(#FFFFFF);
  ellipse(x, y, 30,30);
  
  //Plaats percentage
  fill(#000000);
  textSize(24);
  textAlign(CENTER);
  text(round(percentage)+"%", x , y+9);
}

void keyPressed()
{
  if (key == '[') {
    gekozenJaar--;
    if (gekozenJaar < jaarMin) {
      gekozenJaar = jaarMax;
    }
  }
  else if (key == ']') {
    gekozenJaar++;
    if (gekozenJaar > jaarMax) {
      gekozenJaar = jaarMin;
    }
  }
}  

