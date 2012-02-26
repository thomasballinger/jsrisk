
var dataEquivalent = function(a, b){
    var prop;
    for (prop in a){
        //console.log('checking '+prop)
        if (!a.hasOwnProperty(prop)){continue;}
        //console.log('  own prop')
        if (b[prop] == undefined){return false;}
        //console.log('  b also has')
        if (typeof a[prop] === 'object'){
            //console.log('  is object...')
            if (!dataEquivalent(a[prop], b[prop])){
                return false;
            }
        } else if (typeof a[prop] === 'function'){
            //console.log('  is function...')
            if (a[prop].toString() != b[prop].toString()){
                return false;
            }
        } else {
            if (a[prop] != b[prop]){return false;}
        }
    }
    return true;
};

var testDataEquivalent = function(){
    var x = {a:1, b:[2,3,4], c:{d:5, e:{f:6}}};
    var y = {a:1, b:[2,3,4], c:{d:5, e:{f:6}}};
    var bads = [
        {a:2, b:[2,3,4], c:{d:5, e:{f:6}}},
        {b:[2,3,4], c:{d:5, e:{f:6}}},
        {a:1, b:[3,4], c:{d:5, e:{f:6}}},
        {a:1, b:[2,3,4], c:{e:{f:6}}},
        {a:1, b:[2,3,4], c:{d:'dsf', e:{f:6}}},
        {},
    ];
    console.log(dataEquivalent(x, y));
    for (var i = 0; i < bads.length; i++){
        console.log(dataEquivalent(x, bads[i]));
    }
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
