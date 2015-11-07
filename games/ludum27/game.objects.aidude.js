var AIDude = Object.create(Dude);


AIDude.chooseSecond = function()
{
  var candidateIdx = Math.floor(Math.random()*10);

  while(this.secondDeck[candidateIdx].used)
    {
      candidateIdx = Math.floor(Math.random()*10);
    }

  this.selectSecond(candidateIdx);
  
  if(candidateIdx ==0){
	this.secondDeck = this.secondDeck.splice(0,3);
  }
  else{
	if(candidateIdx ==9){
		this.secondDeck = this.secondDeck.splice(6 ,3);
	}
	else{
		this.secondDeck = this.secondDeck.splice(candidateIdx -1 ,3);
	}
  }
  
  this.secondDeck = shuffle(this.secondDeck);
}


function shuffle(array) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}