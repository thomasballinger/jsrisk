var risk = require('./risk');
var util = require('./util');
var database = require('./database')


// useful database methods:
//database.getAllGameNames(callback);
//database.getGameByName(name, callback);
//database.updateGame(game, doesNotExistCallback, callback);
//database.removeGameByName(game, doesNotExistCallback, callback);
//database.getAllGamesWithPlayer(player, callback)

// These are used for taking user-authorized actions
// They all require associated user and auth

// Let us assume authentication has already happened, and we are passed a user
// in addition to the other url data.
//
// ActionList does not include player data in this case (usually first list entry)
//
// callbacks passed will take one argument, game or false

exports.makeMove = function(player, gameName, actionList, callback){
	database.getGameByName(gameName, function(game_json){
		var game = new risk.Game(game_json);
		console.log(game.getCountriesOwned());
		callback(game);
	});
};

exports.updateGame = function(player, game, callback){
	callback(game);
};

exports.updateGameAndMakeMove = function(player, game, actionList, callback){
	callback(game);
};

exports.undoLastMove = function(player, gameName, callback){
	callback(game);
};

exports.createGame = function(player, gameName, playerList, callback){
	callback(game);
};

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
