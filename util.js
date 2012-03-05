
var dataEquivalent = function(obj1, obj2, pass){
	if (pass === undefined){pass = 'first';}
	if (pass !== 'first' && pass !== 'second'){throw Error();}
    var prop;
    for (prop in obj1){
        //console.log('checking '+prop)
        if (!obj1.hasOwnProperty(prop)){continue;}
        //console.log('  own prop')
        if (obj2[prop] === undefined){return false;}
        //console.log('  obj2 also has')
        if (typeof obj1[prop] === 'object'){
            //console.log('  is object...')
            if (!dataEquivalent(obj1[prop], obj2[prop])){
                return false;
            }
        } else if (typeof obj1[prop] === 'function'){
            //console.log('  is function...')
            if (obj1[prop].toString() != obj2[prop].toString()){
                return false;
            }
        } else {
            if (obj1[prop] != obj2[prop]){
				//console.log('no way to compare: '+obj1+' prop '+prop);
				//console.log('values: '+obj1.prop+' | '+obj2.prop);
				//console.log('and found these to be unequal')
				return false;
			}
        }
    }
	if (pass === 'first'){
		if (!dataEquivalent(obj2, obj1, 'second')){return false;}
		pass === 'second';
		}
    return true;
};

var choose = function(list, n){
    if (n === undefined){n = 1;}
    result = [];
    for (var i = 0; i < n; i++){
        index = Math.floor(Math.random()*list.length);
        result = result.concat(list.splice(index, 1));
    }
    return result;
};
var createRandomPronounceableWord = function(){
    var getConsonant = function(){return choose('b c d f g h j k l m n p r s t v w z'.split(' '));};
    var getVowel = function(){return choose('a e i o u y'.split(' '));};
    maxSyllables = 4;
    frontConsonantChance = 0.5;
    backConsonantChance = 0.5;
    w = '';
    numSyllables = Math.floor(Math.random()*(maxSyllables-1)+1);
    for (var i=0; i<numSyllables; i++){
        s = '';
        if (Math.random() < frontConsonantChance){s = s + getConsonant();}
        s = s + getVowel();
        if (Math.random() < backConsonantChance){s = s + getConsonant();}
        w = w + s;
    }
    return w;
};

var createRandomBasicGame = function(){
    g = new risk.Game({name:util.createRandomPronounceableWord()});
    g.players = util.choose(['ryan', 'tom', 'andrew', 'israel'], 2);
    g.addNewCountry('canada', ['usa']);
    g.addNewCountry('usa', ['canada', 'mexico']);
    g.addNewCountry('mexico', ['usa']);

    // board setup
    g.setCountryState('usa', g.players[0], 8);
    g.setCountryState('canada', g.players[1], 4);
    g.setCountryState('mexico', g.players[0], 6);

    // TODO this should be in a Game method
    // getting ready for first move
    g.giveReinforcements();
    g.fortifyMovesToMake = g.fortifyMovesAllowed;

    return g;
};
//testDataEquivalent();

var exports;
if (exports) {
	exports.dataEquivalent = dataEquivalent;
	exports.createRandomPronounceableWord = createRandomPronounceableWord;
	exports.choose = choose;
}
