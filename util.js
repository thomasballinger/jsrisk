var exports;
if (exports){
    Game = require('./risk').Game;
    dataEquivalent = require('./dataEquivalent').dataEquivalent
}
var util = {
    clearDatabase : function(collection, callback){
        collection.remove({}, callback);
    },

    insertGame : function(g, collection, callback){
        collection.insert(g.toJson(), function(){callback();});
    },

    createGame : function(name, players){
        var g = new Game({'name':name});
        g.players = players;
		g.mapImage = '/northamerica.png';

        g.addNewCountry('canada', ['usa'], 50, 20);
        g.addNewCountry('usa', ['canada', 'mexico'], 60, 75);
        g.addNewCountry('mexico', ['usa'], 45, 140);

        // board setup
        g.setCountryState('usa', g.players[0], 8);
        g.setCountryState('canada', g.players[1], 4);
        g.setCountryState('mexico', g.players[0], 6);

        // TODO this should be in a Game method
        // getting ready for first move
        g.whoseTurn = g.players[0];
        g.turnPhase = 'reinforce';
        g.giveReinforcements();
        g.fortifyMovesToMake = g.fortifyMovesAllowed;
        g.baseStateJson = g.toJson();

        return g;
    },
    choose : function(list, n){
        if (n === undefined){n = 1;}
        result = [];
        for (var i = 0; i < n; i++){
            index = Math.floor(Math.random()*list.length);
            result = result.concat(list.splice(index, 1));
        }
        return result;
    },
    createRandomPronounceableWord : function(){
        var getConsonant = function(){return util.choose('b c d f g h j k l m n p r s t v w z'.split(' '));};
        var getVowel = function(){return util.choose('a e i o u y'.split(' '));};
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
    },

    createRandomBasicGame : function(){
        g = new Game({name:util.createRandomPronounceableWord()});
        g.players = util.choose(['ryan', 'tom', 'andrew', 'israel'], 2);
        g.addNewCountry('canada', ['usa'], 20, 20);
        g.addNewCountry('usa', ['canada', 'mexico'], 30, 60);
        g.addNewCountry('mexico', ['usa'], 20, 100);
		g.mapImage = '/maps/default.png';

        // board setup
        g.setCountryState('usa', g.players[0], 8);
        g.setCountryState('canada', g.players[1], 4);
        g.setCountryState('mexico', g.players[0], 6);

        // TODO this should be in a Game method
        // getting ready for first move

        g.whoseTurn = g.players[0];
        g.turnPhase = 'reinforce';
        g.giveReinforcements();
        g.fortifyMovesToMake = g.fortifyMovesAllowed;
        g.baseStateJson = g.toJson();
        return g;
    }
}
//testDataEquivalent();

var exports;
if (exports) {
	exports.createRandomPronounceableWord = util.createRandomPronounceableWord;
	exports.choose = util.choose;
	exports.createGame = util.createGame;
	exports.clearDatabase = util.clearDatabase;
	exports.insertGame = util.insertGame;
	exports.createRandomBasicGame = util.createRandomBasicGame;
}
