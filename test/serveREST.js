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
var util = require('../util');
var dataEquivalent = require('../dataEquivalent').dataEquivalent


describe('RESTserver', function() {
	var app = undefined;
	var port = 8124
    before(function(done){
		app = serveREST.app
		app.listen(port);
        done();
    });
	describe('without authentication', function(){
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
		describe('GET /gamestorage/game/:name', function(){
			it('should return 200 OK and game back', function(done){
				request.get('localhost:'+port+'/gamestorage/game/game1', function(res){
					assert.equal(res.statusCode, '200');
					assert.equal(res.body.name, 'game1');
					done();
				});
			});
			it('should return 404 for some reason? if no game by that name', function(done){
				request.get('localhost:'+port+'/gamestorage/game/madeupgame', function(res){
					assert.equal(res.statusCode, '404');
					done();
				});
			});
		});
		describe('POST /gamestorage', function(){
			it('should return 200 OK', function(done){
				var game = createGame('testname', ['testuser1', 'testuser2']);
				request.post('localhost:'+port+'/gamestorage')
					.send(game)
					.end(function(res){
						assert.equal(res.statusCode, '200');
						assert.equal(res.text, 'game successfully stored');
						done();
					});
			});
			it('should fail if game name already exists', function(done){
				var game = createGame('game1', ['testuser1', 'testuser2']);
				request.post('localhost:'+port+'/gamestorage')
					.send(game)
					.end(function(res){
						assert.equal(res.text, 'game already exists');
						done();
					});
			});
			it('should be retrievable afterwards', function(done){
				var game = createGame('testname', ['testuser1', 'testuser2']);
				request.post('localhost:'+port+'/gamestorage')
					.send(game)
					.end(function(res){
						request.get('localhost:'+port+'/gamestorage/game/testname')
							.end(function(res){
								assert.equal(res.body.name, 'testname');
								done();
							});
					});
			});
		});
		describe('GET /login', function(){
			it('should return 200 OK and a login page', function(done){
				request.get('localhost:'+port+'/login', function(res){
					assert.equal(res.statusCode, '200');
					done();
				});
			});
		});
		describe('POST /login', function(){
			it('should return 200 OK and a cookie', function(done){
				request.post('localhost:'+port+'/login')
					.type("form")
					.send({'user':'tom'})
					.end(function(res){
						var sessionCookie = res.header['set-cookie'];
						assert.ok(sessionCookie);
						assert.equal(res.statusCode, '200');
						done();
					});
			});
		});
		describe('GET /gamelogic/game/:game/:arg/:arg/:arg...', function(){
			it('should be told to login without a cookie', function(done){
				request.get('localhost:'+port+'/gamelogic/game/game1/reinforce/usa/2')
					.end(function(res){
						assert.equal(res.statusCode, '403');
						done();
					});
			});
		});
	});
	describe('With Authentication', function(){
		var sessionCookie = undefined;
		beforeEach(function(done){
			database.collection('games', function(err, collection){
				clearDatabase(collection, function(){
					insertGame(createGame('game1', ['tom', 'ryan']), collection, done);
				});
			});
		});
		before(function(done){
			request.post('localhost:'+port+'/login')
			    .type('form')
			    .send({'user':'tom'})
			    .end(function(res){
					sessionCookie = res.headers['set-cookie'][0];
					sessionCookie = sessionCookie.slice(0, sessionCookie.indexOf(';'));
					done();
				});
		});
		describe('GET /gamelogic/game/:game', function(){
			it('should succeed in accessing game', function(done){
				request.get('localhost:'+port+'/gamelogic/game/game1')
					.set('Cookie', sessionCookie)
					.end(function(res){
						assert.equal(res.statusCode, '200');
						assert.equal(res.body.name, 'game1');
						done();
					});
			});
		});
		describe('GET /gamelogic/game/:game/:arg/:arg/:arg...', function(){
			it('should succeed in reinforcing', function(done){
				request.get('localhost:'+port+'/gamelogic/game/game1/reinforce/usa/2')
					.set('Cookie', sessionCookie)
					.end(function(res){
						assert.equal(res.statusCode, '200');
						assert.equal(res.body.name, 'game1');
						assert.equal(res.body.turnPhase, 'attack');
						done();
					});
			});
			it('should fail in crap move', function(done){
				request.get('localhost:'+port+'/gamelogic/game/game1/buy/a/parrot')
					.set('Cookie', sessionCookie)
					.end(function(res){
						assert.equal(res.statusCode, '403');
						assert.equal(res.body.name, undefined);
						done();
					});
			});
			it('should fail to reinforce too many', function(done){
				request.get('localhost:'+port+'/gamelogic/game/game1/reinforce/usa/4')
					.set('Cookie', sessionCookie)
					.end(function(res){
						assert.equal(res.statusCode, '403');
						assert.equal(res.body.name, undefined);
						done();
					});
			});

			// TODO: differentiate these next two cases, make them get different responses
			it('should fail if not right user, but in game', function(done){
				request.post('localhost:'+port+'/login')
					.type('form')
					.send({'user':'ryan'})
					.end(function(res){
						var ryanSessionCookie = res.headers['set-cookie'][0];
						ryanSessionCookie = sessionCookie.slice(0, sessionCookie.indexOf(';'));
						request.get('localhost:'+port+'/gamelogic/game/game1/reinforce/usa/4')
							.set('Cookie', ryanSessionCookie)
							.end(function(res){
								assert.equal(res.statusCode, '403');
								assert.equal(res.body.name, undefined);
								done();
							});
					});
			});
			it('should fail if user not in game', function(done){
				request.post('localhost:'+port+'/login')
					.type('form')
					.send({'user':'madeUpUser'})
					.end(function(res){
						var randoSessionCookie = res.headers['set-cookie'][0];
						randoSessionCookie = sessionCookie.slice(0, sessionCookie.indexOf(';'));
						request.get('localhost:'+port+'/gamelogic/game/game1/reinforce/usa/4')
							.set('Cookie', randoSessionCookie)
							.end(function(res){
								assert.equal(res.statusCode, '403');
								assert.equal(res.body.name, undefined);
								done();
							});
					});
			});
			it('should succeed for a whole turn', function(done){
				request.get('localhost:'+port+'/gamelogic/game/game1/reinforce/usa/2')
					.set('Cookie', sessionCookie)
					.end(function(res){
						assert.equal(res.statusCode, '200');
						assert.equal(res.body.turnPhase, 'attack');
						request.get('localhost:'+port+'/gamelogic/game/game1/attack/usa/canada/3')
							.set('Cookie', sessionCookie)
							.end(function(res){
								assert.equal(res.statusCode, '200');
								request.get('localhost:'+port+'/gamelogic/game/game1/done')
									.set('Cookie', sessionCookie)
									.end(function(res){
										assert.equal(res.statusCode, '200');
										assert.equal(res.body.turnPhase, 'fortify');
										request.get('localhost:'+port+'/gamelogic/game/game1/fortify/mexico/usa/2')
											.set('Cookie', sessionCookie)
											.end(function(res){
												assert.equal(res.statusCode, '200');
												assert.equal(res.body.turnPhase, 'fortify');
												request.get('localhost:'+port+'/gamelogic/game/game1/done/')
													.set('Cookie', sessionCookie)
													.end(function(res){
														assert.equal(res.statusCode, '200');
														assert.equal(res.body.whoseTurn, 'ryan');
														done();
													});
											});
									});
							});
					});
			});
			it('should return game with basestate of old game', function(done){
				var identical_game = createGame('game1', ['tom', 'ryan'])
				identical_game.baseStateJson = null;
				request.get('localhost:'+port+'/gamelogic/game/game1/reinforce/usa/2')
					.set('Cookie', sessionCookie)
					.end(function(res){
						assert.equal(res.statusCode, '200');
						assert.equal(res.body.name, 'game1');
						assert.equal(res.body.turnPhase, 'attack');
						assert.equal(dataEquivalent(res.body.baseStateJson, identical_game.toJson()), true);
						done();
					});
			});
			it('should return game with different basestate after attack', function(done){
				var identical_game = createGame('game1', ['tom', 'ryan'])
				identical_game.baseStateJson = null;
				request.get('localhost:'+port+'/gamelogic/game/game1/reinforce/usa/2')
					.set('Cookie', sessionCookie)
					.end(function(res){
						assert.equal(res.statusCode, '200');
						assert.equal(res.body.name, 'game1');
						assert.equal(res.body.turnPhase, 'attack');
						assert.equal(dataEquivalent(res.body.baseStateJson, identical_game.toJson()), true);
						request.get('localhost:'+port+'/gamelogic/game/game1/attack/usa/canada/3')
							.set('Cookie', sessionCookie)
							.end(function(res){
								assert.equal(res.statusCode, '200');
								assert.equal(res.body.name, 'game1');
								assert.equal(res.body.turnPhase, 'attack');
								assert.equal(dataEquivalent(res.body.baseStateJson, identical_game.toJson()), false);
								assert.equal(dataEquivalent(res.body.baseStateJson.countries, res.body.countries), true);
								done();
								});
					});
			});
			it('should return game with basestate of old game', function(done){
				var identical_game = createGame('game1', ['tom', 'ryan'])
				identical_game.baseStateJson = null;
				request.get('localhost:'+port+'/gamelogic/game/game1/reinforce/usa/2')
					.set('Cookie', sessionCookie)
					.end(function(res){
						assert.equal(res.statusCode, '200');
						assert.equal(res.body.name, 'game1');
						assert.equal(res.body.turnPhase, 'attack');
						assert.equal(dataEquivalent(res.body.baseStateJson, identical_game.toJson()), true);
						done();
					});
			});
		});
		describe('POST /gamelogic/game/:game/update', function(){
			it('should succeed updating with reinforce', function(done){
				request.get('localhost:'+port+'/gamelogic/game/game1')
					.set('Cookie', sessionCookie)
					.end(function(res){
						assert.equal(res.statusCode, '200');
						assert.equal(res.body.name, 'game1');
						var game = new risk.Game(res.body);
						game.takeAction(['reinforce', 'tom', 'usa', '2'])
						request.post('localhost:'+port+'/gamelogic/game/game1/update')
							.send(game.toJson())
							.set('Cookie', sessionCookie)
							.end(function(res){
								assert.equal(res.statusCode, '200');
								var game = new risk.Game(res.body);
								assert.equal(game.turnPhase, 'attack');
								done()
							});
					});
			});
			it('should silently fix evil state', function(done){
				request.get('localhost:'+port+'/gamelogic/game/game1')
					.set('Cookie', sessionCookie)
					.end(function(res){
						assert.equal(res.statusCode, '200');
						assert.equal(res.body.name, 'game1');
						var game = new risk.Game(res.body);
						game.getCountry('usa').numTroops = 100;
						game.takeAction(['reinforce', 'tom', 'usa', '2'])
						request.post('localhost:'+port+'/gamelogic/game/game1/update')
							.send(game.toJson())
							.set('Cookie', sessionCookie)
							.end(function(res){
								assert.equal(res.statusCode, '200');
								var game = new risk.Game(res.body);
								assert.equal(game.getCountry('usa').numTroops, 10);
								assert.equal(game.turnPhase, 'attack');
								done()
							});
					});
			});
			it('should fail if illegal move made', function(done){
				request.get('localhost:'+port+'/gamelogic/game/game1')
					.set('Cookie', sessionCookie)
					.end(function(res){
						assert.equal(res.statusCode, '200');
						assert.equal(res.body.name, 'game1');
						var game = new risk.Game(res.body);
						game.reinforcementsToPlace = 100;
						game.takeAction(['reinforce', 'tom', 'usa', '1'])
						game.takeAction(['reinforce', 'tom', 'usa', '40'])
						request.post('localhost:'+port+'/gamelogic/game/game1/update')
							.send(game.toJson())
							.set('Cookie', sessionCookie)
							.end(function(res){
								assert.equal(res.statusCode, '403');
								done()
							});
					});
			});
		});
		describe('POST /gamelogic/game/:game/:arg/:arg/:arg...', function(){
			it('should succeed updating with reinforce, then making attack', function(done){
				request.get('localhost:'+port+'/gamelogic/game/game1')
					.set('Cookie', sessionCookie)
					.end(function(res){
						assert.equal(res.statusCode, '200');
						var game = new risk.Game(res.body);
						game.takeAction(['reinforce', 'tom', 'usa', 2]);
						assert.equal(game.turnPhase, 'attack');
						request.post('localhost:'+port+'/gamelogic/game/game1/attack/usa/canada/3')
							.set('Cookie', sessionCookie)
							.send(game.toJson())
							.end(function(res){
								assert.equal(res.statusCode, '200');
								assert.equal(res.body.name, 'game1');
								assert.notEqual(res.body.lastAttack, null);
								done();
							});
					});
			});
		});
	});
});
