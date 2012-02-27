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
            database.storeGame(g, 
				function(){
					throw Error('Name already in database');
					done();
				}, 
				function(){
					database.getGameByName('test', function(game){
						assert.equal(game && game.arbitraryAtt, 'asdf');
						done();
					});
				}
			);
        });
        it('should fail to store a game with a repeat name', function(done){
            var g = createGame('game1', ['tom', 'ryan']);
            g.arbitraryAtt = 'asdf';
			database.storeGame(g, 
				function(){
					assert.ok('correct callback called')
					done();
				}, 
				function(){
					console.log('success callback being called')
					throw Error('Wrong code path taken');
					done();
				}
			);
		});
	});
    describe('#removeGameByName()', function(){
        it('should remove a game from database', function(done){
            database.removeGameByName('game1',
				function(){
					throw Error('Game with Name does not exist');
					done();
				},
				function(){
					database.getAllGameNames(function(list){
						assert.equal(list.length, 2);
						done();
					});
				}
			);
        });
        it('should fail if game name does not exist', function(done){
            database.removeGameByName('test',
				function(){
					assert.ok('correct callback called');
					done();
				},
				function(){
					database.getAllGameNames(function(list){
						throw Error('Wrong code path taken');
						done();
					});
				}
			);
        });
    });
    describe('#updateGame()', function(){
        it('should update a game with arbitrary atts', function(done){
            var g = createGame('game1', ['tom', 'ryan']);
            g.arbitraryAtt = 'asdf';
            database.updateGame(g, 
				function(){
					throw Error('Item to update does not exist');
					done();
				},
				function(obj){
					database.getGameByName('game1', function(game){
						assert.equal(game && game.arbitraryAtt, 'asdf');
						done();
					});
				}
			);
        });
        it('should throw an error if name does not exist', function(done){
            var g = createGame('test', ['tom', 'ryan']);
            database.updateGame(g, 
				function(){
					assert.ok('Item to update does not exist')
					done();
				},
				function(obj){
					Error("Wrong code path taken")
					done();
				}
			);
        });
    });
	describe('#getAllGamesWithPlayer', function(){
		it('should find all games a player is in', function(done){
			database.getAllGamesWithPlayer('tom', function(games){
				assert.equal(games.length, 2);
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

