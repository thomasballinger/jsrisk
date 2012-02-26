var assert = require('chai').assert;
var chai = require('chai');
//chai.Assertion.includeStack = true;


var database = require('../database');
var util = require('../util');
var risk = require('../risk');

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
	return g;
};

var clearDatabase = function(collection, callback){
    collection.remove({}, callback);
};

var insertGame = function(g, collection, callback){
    collection.insert(g, function(){callback();});
};

describe('database', function() {
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
	describe('#getAllGameNames()', function(){
		it('should return all game names', function(done){
			database.getAllGameNames(function(list){
				assert.equal(list.length, 3);
				assert.equal(typeof list[0], 'string');
                done();
			});
		});
	});
	describe('#getGameByName()', function(){
		it('should returns the correct game', function(done){
			database.getGameByName('game1', function(game){
				assert.equal(game.name, 'game1');
				assert.equal(game.players[0], 'tom');
				done();
			});
		});
	});
    describe('#storeGame()', function(){
        it('should store a game such that it is retrievable', function(done){
            var g = createGame('test', ['tom', 'ryan']);
            g.arbitraryAtt = 'asdf';
            database.storeGame(g, function(){
                database.getGameByName('test', function(game){
                    assert.equal(game && game.arbitraryAtt, 'asdf');
                    done();
                });
            });
        });
        it('should fail to store a game with a repeat name', function(done){
            var g = createGame('test1', ['tom', 'ryan']);
            assert.throw(database.storeGame(g, function(){}));
            done();
        });
    });
    describe('#removeGameByName()', function(){
        it('should remove a game from database', function(done){
            database.removeGameByName('game1', function(){
                database.getAllGameNames(function(list){
                    assert.equal(list.length, 2);
                    done();
                });
            });
        });
        it('should fail if game name does not exist', function(done){
            assert.throw(database.removeGameByName('test', function(){}));
            done();
        });
    });
    describe('#updateGame()', function(done){
        it('should update a game with arbitrary atts', function(done){
            var g = createGame('game1', ['tom', 'ryan']);
            g.arbitraryAtt = 'asdf';
            database.updateGame(g, function(){
                database.getGameByName('game1', function(game){
                    assert.equal(game && game.arbitraryAtt, 'asfd');
                    done();
                });
            });
        });
        it('should throw an error if name does not exist', function(done){
            var g = createGame('nonexistantGame', ['tom', 'ryan']);
            g.arbitraryAtt = 'asdf';
            assert.throw(database.updateGame(g, function(){}));
            done();
        });
    });
});
				
	//database.insertGame(db, createGame('test1', ['tom', 'ryan']));

	// real tests
	//database.getAllGameNames(db, function(x){console.dir(x);})
	//database.getGameByName(db, function(x){console.dir(x);})
	//setTimeout(function(){db.close();}, 1000);

