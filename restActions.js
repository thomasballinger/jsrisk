var risk = require('./risk');
var util = require('./util');
var database = require('./database')

database.connect()

// useful database methods:
//database.getAllGameNames(callback);
//database.getGameByName(name, callback);
//database.storeGameByName(name, game, callback);

// These are used for taking user-authorized actions
// They all require associated user and auth



var createNewBasicGame = function(){
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

var port = 8124
app.listen(port);
console.log('listening at '+port)
