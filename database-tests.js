var assert = require('assert');

var database = require('./database');
var util = require('./util');
var risk = require('./risk');

var createGame = function(name, players){
    g = new risk.Game({'name':name});
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
	return g;
}

var clearDatabase = function(callback){
	database.collection('games', function(err, collection){
		collection.remove({}, done);
	});
}

var insertGame = function(g, callback){
	database.collection('games', function(err, collection){
		collection.insert(g, function(){callback});
	});
}

describe('database', function() {
	var setupStuff = 'can happen here';
	beforeEach(function(done){
		clearDatabase(function(){
			insertGame(createGame('game1', ['tom', 'ryan']), function(){
				insertGame(createGame('game2', ['tom', 'israel']), function(){
					insertGame(createGame('game3', ['tom', 'andrew']), done())
				});
			});
		});
	});
	describe('#getAllGameNames()', function(){
		it('should return all game names', function(done){
			database.getAllGameNames(function(){
				assert.equal(list.length, 3);
				assert.equal(typeof list[0], 'string');
			});
		});
	});
	describe('#getGameByName("game1")', function(){
		it('should returns the correct game', function(done){
			database.getGameByName('game1', function(game){
				assert.equal(game.name, 'game1');
				assert.equal(game.players[0], 'tom');
				done();
			});
		});
	});
});
				
	//database.insertGame(db, createGame('test1', ['tom', 'ryan']));

	// real tests
	//database.getAllGameNames(db, function(x){console.dir(x);})
	//database.getGameByName(db, function(x){console.dir(x);})
	//setTimeout(function(){db.close();}, 1000);
