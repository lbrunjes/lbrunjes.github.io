var names={
"firstnames":["Jon","John","Geraldine","Dave","Earl","Cleetus","Fred","Charles","Han","Luke","Will","Betina","Heath","Rich","Alessandro","Max","Alexander","Alex","Ali","Steve","Jimmy","Roger","Victor","Clarence","Rad","Paul","Peter","Yuri","Jesse","Nik","Nick","Ned","Ben","Phillip","Phil","Teddy","Garrett","Shelt","Cliff","Clem","Earl","Cleetus","Jimbob","Jebidiah","Mohammed","Azeem","Sam","David","Pop","Faustus","Jeremy","Jim","Misha","Allan","Geoff","Dark","Autumn","Summer","Ford","Philbert","Clementine","Sho","Scrappy","Scooter","Lil'","Stupid","D'Angleo","Leonard","Kevin","Greg","Brian","rain","Effie","Brunhold","Aaron","Bevis","Charlie","Drake","Emma","Flee","Gunnar","Hattie","Inigo","James","Konstantine","Leigh","Mike","Nero","Oscar","Paco","Q","Randy","Sipar","Tom","URA","Vandal","Wendy","Xerxes","Yolanda","Zeus","Perseus","Toshi","Franco","Danielle","Alesandro","Yusef","Malcom","Sha-Gee","Nerdo","Ben","Arnold","Greta","Yves","Yvette","Pail","Oprah","llen","Squats","Axeton","Max","Wilhelm","Duke","Geraldine","Geronimo","Quincy","Ronald","Ronaldo","Regis","Austin","Daniel","Danielle","ieter","Phillip"],
"lastnames":["Stevens","Smith","Scary","Johnson","de Aluvion von Strumpet","Quislington","Jones","Murphy","Morris","Shifflet","Quincy","Jefferson","Stallings","Koch","Kitch","Parker","McGuire","Bryant","von Krumpetsbach","Blownapart","Gong","Li","Lee","Zhang","Antonov","Abrams","Breeden","Cooperton","Cooper","Nicoll","Heath","Bosingwa","Holt","Grahm","Grimm","Carter","Dunn","Early","Fuchs","Fox","Grant","Herbert","Idaho","James","Lyder","Guez","Manly","Lin","Fontaine","Sejnurb","Klimpt","Barnett","Agger","Skrtel","Ivanovic","Holt","Masterson","Nuttly","O'Connor","Petrovich","Russel","Susa","Trapatoni","Usher","von Wittlesbach","hiting","X","Yearling","Zastrow","DeGrasse","Ratchet","Clank","McLeod","McCreedy","Miller","Mitchell","Beck","Rodruiguez","Smiff","Blue","Creosote","Mayfield","Bueler"],
"nicknames":["The Yellow Dart","Terrible","Terrifying","The Drunk","Big","Turkey","Red","Green","Blue","Yellow","Pippy","Farts","Pappy","Mammy","Esse","Six Fingered","Geezer","Twitch","Skinny","Fats","Skaglick","Lightning","Sexy","Pookie","Chubby","Porker","King","Queen","Joker","Goose","Iceman","Maverick","Caveman","Yeti","Nooblet","Nightingale","The Rifle","Shotgun","Quick Draw","Shitty_Watercolor","Baby Face","Black","The Surf","Mutt","Fancy","Pretty","Muffin","Cookie","Smuggo","Tex","Vinnie","PJ","Lover Boy","Jet","Stealth","Scrappy","Dope","Swabbie","Sieg","Squeeky","Soap","Biddy","Bip","Pip","Jimbo","Smidgen"],
"pseudonyms" : ["Nine Toes","Three Dog","Acton Bell","Baz","Boz","Lazlo Toth","Gulzar","Yulgok","Banksy","IceFrog","Abu Amarr","Grot","Grzegorz","Tito","Lula","Sam Axe","MAXXXXX","Mr. Factor","Mr. Clean","Dr. Pepper","Murdersaurus","Creepy","Mr. Crazypants","Smuggo Smuggins","Holy Devil","Psy","Sting","Lavaman","Black Heart the Formidable","Tore-ant-ula","♛","Burner Black","Confused","Professor Chaos","Duke of Cornwall","The Cavalier","Calf Man","Moxxxie","Scrappy","Flayra","Hobbes","Terrorsaur","Plate-o","Hrothgar","Trogdor the BURNINATOR"],
getRandom:function(){
	var pick = Math.random();
		var name="";
		if(pick< 0.05){
			//pick a pseudonym straight up
			var index =Math.floor(this.pseudonyms.length * Math.random());
			name +=this.pseudonyms[index];
		}
		else{
			if(pick <0.3){
				//pick a nick nickname +surname
				var index =  Math.floor(this.nicknames.length * Math.random());
				name +=this.nicknames[index];
				index =  Math.floor(this.lastnames.length * Math.random());
				name +=" "+this.lastnames[index];
			}
			else{
				if(pick < 0.9){
					//pick a firstnam and surname
					var index =  Math.floor(this.firstnames.length * Math.random());
					name +=this.firstnames[index];
					index =  Math.floor(this.lastnames.length * Math.random());
					name +=" "+this.lastnames[index];
				}
				else{
					// firstname last nuame nick name
					var index =  Math.floor(this.firstnames.length * Math.random());
					name +=this.firstnames[index];
					index =  Math.floor(this.nicknames.length * Math.random());
					name += " \""+this.nicknames[index];
					index =  Math.floor(this.lastnames.length * Math.random());
					name += "\" "+this.lastnames[index];
				}
			}
		}
		return name;

}

}
