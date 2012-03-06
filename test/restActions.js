
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
	g.whoseTurn = g.players[0];
	g.turnPhase = 'reinforce';
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

describe('privateRestActions', function(){
	describe('_makeMove()', function(){
		it('should fail if move is crap', function(done){
			var g = createGame('game', ['tom', 'ryan']);
			restActions._makeMove('tom', g, ['madeUpAction', 1, 2], function(result){
				assert.equal(false, result);
                done();
			});
		});
	});
	describe('_makeMove()', function(){
		it('should fail if wrong number of args provided', function(done){
			var g = createGame('game', ['tom', 'ryan']);
			restActions._makeMove('tom', g, ['fortify', 'mexico', 1], function(result){
				assert.equal(false, result);
                done();
			});
		});
	});
	describe('_makeMove()', function(){
		it('should fail if countries do not exist', function(done){
			var g = createGame('game', ['tom', 'ryan']);
			restActions._makeMove('tom', g, ['reinforce', 'atlantis', 1], function(result){
				assert.equal(false, result);
                done();
			});
		});
	});
	describe('_makeMove()', function(){
		it('should succeed in placing 1 reinforcement', function(done){
			var g = createGame('game', ['tom', 'ryan']);
			restActions._makeMove('tom', g, ['reinforce', 'mexico', 1], function(result){
				assert.equal(result.getCountry('mexico').numTroops, 7);
                done();
			});
		});
	});
	describe('_makeMove()', function(){
		it('should fail in placing 4 reinforcements', function(done){
			var g = createGame('game', ['tom', 'ryan']);
			restActions._makeMove('tom', g, ['fortify', 'mexico', 4], function(result){
				assert.equal(false, result);
                done();
			});
		});
	});
	describe('_makeMove()', function(){
		it('should succeed in placing 2 reinforcements, then attacking', function(done){
			var g = createGame('game', ['tom', 'ryan']);
			restActions._makeMove('tom', g, ['reinforce', 'mexico', 2], function(result){
				assert.notEqual(result, undefined);
				restActions._makeMove('tom', result, ['attack', 'usa', 'canada', 3], function(result2){
					assert.notEqual(result2.lastAttack, null);
					done();
				});
			});
		});
	});
});

/*
describe('publicRestActions', function() {
	var setupStuff = 'can happen here';
	beforeEach(function(done){
		console.log('clearing database so as to put three games in it for one test');
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
	after(function(done){
		console.log('clearing database since done with publicRestActions');
		database.collection('games', function(err, collection){
			console.log('?');
			clearDatabase(collection, function(){console.log('!'); done();});
		});
	});
	describe('#getGameAndMakeMove()', function(){
		it('should fail if move is crap', function(done){
			restActions.getGameAndMakeMove('tom', 'game1', ['reinforce', 'mexico', 4], 
				function(){assert.ok(true); done();},
				function(result){ assert.ok(false); done();}
			)
		});
	});
});
*/
