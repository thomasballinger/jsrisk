var assert = require('chai').assert;
var chai = require('chai');
chai.Assertion.includeStack = true; // defaults to false
var request = require('superagent')

var database = require('../database');
var risk = require('../risk');
var restActions = require('../restActions');
var serveREST = require('../serveREST');
var createGame = require('../util').createGame;
var clearDatabase = require('../util').clearDatabase
var insertGame = require('../util').insertGame


describe('RESTserver', function() {
	var app = undefined;
	var port = 8124
    before(function(done){
		app = serveREST.app
		app.listen(port);
        done();
    });
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
	after(function(done){
		database.collection('games', function(err, collection){
			clearDatabase(collection, done);
		});
	});
	describe('/gamestorage/game/:name', function(){
		it('should return 200 OK and game back', function(done){
			request.get('localhost:'+port+'/gamestorage/game/game1', function(res){
				assert.equal(res.statusCode, '200');
				assert.equal(res.body.name, 'game1');
				console.log(res)
				done();
			});
		});
		it('should return 404 FNF if no game by that name', function(done){
			request.get('localhost:'+port+'/gamestorage/game/game1', function(res){
				assert.equal(res.statusCode, '404');
				assert.equal(res.body.name, 'fakegamename');
				console.log(res)
				done();
			});
		});
	});
});
