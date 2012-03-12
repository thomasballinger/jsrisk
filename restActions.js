var risk = require('./risk');
var util = require('./util');
var database = require('./database')
var assert = require('assert')


// useful database methods:
//database.getAllGameJsonNames(callback);
//database.getGameJsonByName(name, callback);
//database.updateGameJson(game, doesNotExistCallback, callback);
//database.removeGameJsonByName(game, doesNotExistCallback, callback);
//database.getAllGameJsonsWithPlayer(player, callback)

// These are used for taking user-authorized actions
// They all require associated user and auth

// Let us assume authentication has already happened, and we are passed a user
// in addition to the other url data.
//
// ActionList does not include player data in this case (usually first list entry)
//
// callbacks passed will take one argument, game or false

// 
exports._makeMove = function(player, game, argArray, callback){
    game.allowSecureMoves = false;
    if (game.actions[argArray[0]] === undefined){callback(false); return;}
	if (game.actions[argArray[0]].args.length != argArray.length){callback(false); return;}
    if (game.actions[argArray[0]].isSecure == false){
        argArray.splice(1, 0, player);
        var result = game.takeAction(argArray);
        if (result == false){callback(false); return;}
		callback(game);
    } else if (game.actions[argArray[0]].isSecure == true){
        game.allowSecureMoves = true;
        argArray.splice(1, 0, player);
        var result = game.takeAction(argArray);
        if (result == false){callback(false); return;}
        game.allowSecureMoves = false
        game.lastSecureJsonString = JSON.stringify(game)
        callback(game);
    }
};

exports.getGameAndMakeMove = function(player, gameName, argArray, error, callback){
	database.getGameJsonByName(gameName, function(game_json){
		var game = new risk.Game(game_json);
        exports._makeMove(player, game, argArray, function(result_game){
            if (!result_game){
                error();
				return;
            } else {
				database.updateGameJson(result_game.toJson(), function(){throw new Error();}, function(){
					callback(game);
				});
			}
        });
	});
};

// Authenticated player wants to submit a series of moves
exports.updateGame = function(player, client_game_json, callback){
	database.getGameJsonByName(game.name, function(server_game_json){
		var client_game = Game(client_game_json);
		var server_game = Game(server_game_json);
		assert.equal(server_game.allowSecureMoves, false);
		var moves = client_game.actionHistory;
        var result = server_game.takeUnsecureActions(player, moves);
        if (result){
            database.updateGameJson(game.toJson(), function(){throw Error;}, function(){callback(game);})
        } else {
			callback(false);
		}
	});
};

exports.updateGameAndMakeMove = function(player, client_game_json, argArray, error, callback){
    exports.updateGame(player, client_game_json, function(game){
        if (!game){
            error();
        }
        exports._makeMove(player, game, argArray, function(result_game){
            if (!result_game){
                error();
            }
            callback(result_game);
        });
    });
};

exports.undoLastMove = function(player, gameName, callback){
    callback(false);
};

exports.createGame = function(player, gameName, playerList, callback){
    var g = new risk.Game({name:gameName});
    g.players = playersList
    g.addNewCountry('canada', ['usa']);
    g.addNewCountry('usa', ['canada', 'mexico']);
    g.addNewCountry('mexico', ['usa']);

    // board setup
    g.setCountryState('usa', g.players[0], 8);
    g.setCountryState('canada', g.players[1], 4);
    g.setCountryState('mexico', g.players[0], 6);

    g.whoseTurn = g.players[0]; 
    g.turnPhase = 'reinforce'; 
    g.giveReinforcements(); 
    g.fortifyMovesToMake = g.fortifyMovesAllowed; 

    exports.updateGame()

	callback(false);
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
    g.whoseTurn

    return g;
};
