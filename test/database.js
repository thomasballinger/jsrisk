var assert = require('chai').assert;

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

var insertGameJson = function(g, collection, callback){
    collection.insert(JSON.parse(JSON.stringify(g)), function(){callback();});
};

describe('database', function() {
	var setupStuff = 'can happen here';
	beforeEach(function(done){
        database.collection('games', function(err, collection){
            clearDatabase(collection, function(){
                insertGameJson(createGame('game1', ['tom', 'ryan']), collection, function(){
                    insertGameJson(createGame('game2', ['tom', 'israel']), collection, function(){
                        insertGameJson(createGame('game3', ['greg', 'andrew']), collection, done);
                    });
                });
            });
		});
	});
	describe('#getAllGameNames()', function(){
		it('should return all game names', function(done){
			database.getAllGameJsonNames(function(list){
				assert.equal(list.length, 3);
				assert.equal(typeof list[0], 'string');
                done();
			});
		});
	});
	describe('#getGameJsonByName()', function(){
		it('should returns the correct game', function(done){
			database.getGameJsonByName('game1', function(game){
				assert.equal(game.name, 'game1');
				assert.equal(game.players[0], 'tom');
				done();
			});
		});
	});
    describe('#storeGameJson()', function(){
        it('should store a game such that it is retrievable', function(done){
            var g = createGame('test', ['tom', 'ryan']);
            g.arbitraryAtt = 'asdf';
            database.storeGameJson(g.toJson(), 
				function(){
					throw Error('Name already in database');
					done();
				}, 
				function(){
					database.getGameJsonByName('test', function(game){
						assert.equal(game && game.arbitraryAtt, 'asdf');
						done();
					});
				}
			);
        });
        it('should fail to store a game with a repeat name', function(done){
            var g = createGame('game1', ['tom', 'ryan']);
            g.arbitraryAtt = 'asdf';
			database.storeGameJson(g.toJson(), 
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
    describe('#removeGameJsonByName()', function(){
        it('should remove a game from database', function(done){
            database.removeGameJsonByName('game1',
				function(){
					throw Error('Game with Name does not exist');
					done();
				},
				function(){
					database.getAllGameJsonNames(function(list){
						assert.equal(list.length, 2);
						done();
					});
				}
			);
        });
        it('should fail if game name does not exist', function(done){
            database.removeGameJsonByName('test',
				function(){
					assert.ok('correct callback called');
					done();
				},
				function(){
					database.getAllGameJsonNames(function(list){
						throw Error('Wrong code path taken');
						done();
					});
				}
			);
        });
    });
    describe('#updateGameJson()', function(){
        it('should update a game with arbitrary atts', function(done){
            var g = createGame('game1', ['tom', 'ryan']);
            g.arbitraryAtt = 'asdf';
            database.updateGameJson(g.toJson(), 
				function(){
					throw Error('Item to update does not exist');
					done();
				},
				function(obj){
					database.getGameJsonByName('game1', function(game){
						assert.equal(game && game.arbitraryAtt, 'asdf');
						done();
					});
				}
			);
        });
        it('should throw an error if name does not exist', function(done){
            var g = createGame('test', ['tom', 'ryan']);
            database.updateGameJson(g.toJson(), 
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
	describe('#getAllGameJsonsWithPlayer', function(){
		it('should find all games a player is in', function(done){
			database.getAllGameJsonsWithPlayer('tom', function(games){
				assert.equal(games.length, 2);
				done();
			});
		});
	});
});
