
var assert = require('chai').assert;
var chai = require('chai');


var database = require('../database');
var util = require('../util');
var risk = require('../risk');
var restActions = require('../restActions');

var createGame = function(name, players){
    var g = new risk.Game({'name':name});
	g.players = players;

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
	g.whoseTurn = g.players[0]
	return g;
};

var clearDatabase = function(collection, callback){
    collection.remove({}, callback);
};

var insertGame = function(g, collection, callback){
    collection.insert(g, function(){callback();});
};
describe('restActions', function() {
	var setupStuff = 'can happen here';
	beforeEach(function(done){
        database.collection('games', function(err, collection){
            clearDatabase(collection, function(){
                insertGame(createGame('game1', ['tom', 'ryan']), collection, function(){
                    insertGame(createGame('game2', ['tom', 'israel']), collection, function(){
                        insertGame(createGame('game3', ['greg', 'andrew']), collection, done);
                    });
                });
            });
		});
	});
	describe('#makeMove()', function(){
		it('should fail if move is crap', function(done){
			restActions.makeMove('tom', 'game1', ['makeUpAction', 1, 2], function(result){
				assert.equal(false, result);
                done();
			});
		});
	});
});
