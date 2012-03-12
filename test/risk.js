var assert = require('chai').assert;
var chai = require('chai');

var risk = require('../risk.js');

var getGame = function(){
    var na = new risk.Game({name:'North America'});

    na.players = ['tom', 'ryan'];
    na.whoseTurn = 'tom';
    na.turnPhase = 'reinforce';

    na.addNewCountry('canada', ['usa']);
    na.addNewCountry('usa', ['canada', 'mexico']);
    na.addNewCountry('mexico', ['usa']);

    na.setCountryState('canada', 'ryan', 4);
    na.setCountryState('usa', 'tom', 8);
    na.setCountryState('mexico', 'tom', 6);

    na.giveReinforcements();
    na.fortifyMovesToMake = na.fortifyMovesAllowed;
    return na;
};

describe('risk', function(){
    var game;
    describe('#Country', function(){
        beforeEach(function(done){
            game = getGame();
            done();
        });
        it('should be in risk object, with basic functions working', function(done){
            assert.equal(game.countries.length, 3);
            assert.equal(game.countries[0].isTouching('usa'), true);
            assert.equal(game.countries[0].isOwnedBy('ryan'), true);
            done();
        });
    });
    describe('#GameActions', function(){
        beforeEach(function(done){
            game = getGame();
            done();
        });
        it('should run unsecure action "reinforce"', function(done){
            assert.equal(true, game.takeAction(['reinforce', 'tom', 'usa', 2]));
            done();
        });
        it('should run secure action "attack"', function(done){
            game.allowSecureMoves = true;
            assert.equal(true, game.takeAction(['reinforce', 'tom', 'usa', 2]));
            game.takeAction(['attack', 'tom', 'usa', 'canada', 3])
            assert.notEqual('null', game.lastAttack);
            done();
        });
        it('should run secure action "done"', function(done){
            game.allowSecureMoves = true;
            assert.equal(true, game.takeAction(['reinforce', 'tom', 'usa', 2]));
            game.takeAction(['attack', 'tom', 'usa', 'canada', 3])
            assert.notEqual('null', game.lastAttack);
            game.takeAction(['done', 'tom']);
            assert.equal(game.turnPhase, 'fortify');
            done();
        });
        it('should run unsecure action "fortify"', function(done){
            assert.equal(true, game.takeAction(['reinforce', 'tom', 'usa', 2]));
            game.allowSecureMoves = true;
            game.takeAction(['attack', 'tom', 'usa', 'canada', 3])
            assert.notEqual('null', game.lastAttack);
            game.takeAction(['done', 'tom']);
            game.takeAction(['fortify', 'tom', 'mexico', 'usa', 5]);
            assert.equal(game.turnPhase, 'fortify');
            assert.equal(game.fortifyMovesToMake, 0);
            done();
        });
        it('should advance to next player\'s turn after "done"', function(done){
            game.allowSecureMoves = true;
            assert.equal(true, game.takeAction(['reinforce', 'tom', 'usa', 2]));
            game.takeAction(['attack', 'tom', 'usa', 'canada', 3])
            assert.notEqual('null', game.lastAttack);
            game.takeAction(['done', 'tom']);
            game.takeAction(['fortify', 'tom', 'mexico', 'usa', 5]);
            game.takeAction(['done', 'tom']);
            assert.equal(game.whoseTurn, 'ryan');
            done();
        });
    });
    describe('#takeUnsecureActions()', function(){
        beforeEach(function(done){
            game = getGame();
            done();
        });
        it('should run without error', function(done){
            game.takeUnsecureActions('tom', [
                ['reinforce', 'tom', 'usa', 1],
                ['reinforce', 'tom', 'mexico', 1],
                ]);
            game.allowSecureMoves = true;
            game.takeAction(['attack', 'tom', 'usa', 'canada']);
            game.takeAction(['done', 'tom']);
            game.allowSecureMoves = false;
            game.takeUnsecureActions('tom', [['done', 'tom']]);
            game.allowSecureMoves = true;
            game.takeAction(['done', 'tom']);
            assert.equal(game.whoseTurn, 'ryan');
            done();
        });
        it('should return false for bad moves', function(done){
            var r = game.takeUnsecureActions('tom',[
                ['reinforce', 'tom', 'usa', 1],
                ['reinforce', 'tom', 'mexico', 2],
                ]);
            assert.equal(game.reinforcementsToPlace, 1);
			assert.equal(r, false);
            done();
        });
	});
    describe('#areIdentical()', function(){
        beforeEach(function(done){
            game = getGame();
            done();
        });
        it('should be identical to self', function(done){
            assert.equal(true, risk.Game.areIdentical(game, game));
            done();
        });
        it('should be identical to identical game', function(done){
            var game1 = getGame();
            var game2 = getGame();
            assert.equal(true, risk.Game.areIdentical(game1, game2));
            done();
        });
        it('should be identical to Jsonified then reconstituted self', function(done){
            var reconstituted_game = new risk.Game(JSON.stringify(game));
            assert.equal(true, risk.Game.areIdentical(game, reconstituted_game));
            done();
        });
        it('should find two games with same moves made identical', function(done){
            var game1 = getGame();
            var game2 = getGame();
            game1.takeUnsecureActions('tomb',[
                ['reinforce', 'tom', 'usa', 1],
                ['reinforce', 'tom', 'mexico', 1],
                ]);
            game2.takeUnsecureActions('tomb',[
                ['reinforce', 'tom', 'usa', 1],
                ['reinforce', 'tom', 'mexico', 1],
                ]);
            assert.equal(true, risk.Game.areIdentical(game1, game2));
            done();
        });
    });
    describe('#reconstitution', function(){
        beforeEach(function(done){
            game = getGame();
            done();
        });
        it('should normally have prototype functions', function(done){
            assert.notEqual(game.actions['done'].action, undefined);
            done();
        });
        it('creating game manually should work the same', function(done){
			var g = new risk.Game({name:'stuff'});
            assert.notEqual(g.actions['done'].action, undefined);
            done();
        });
        it('constructor should take an object, and still have prototype functions', function(done){
			var g = new risk.Game({name:'stuff'});
            assert.notEqual(g.actions['done'].action, undefined);
            done();
        });
        it('should be still have prototype functions', function(done){
			var g = new risk.Game(JSON.stringify(game));
            assert.notEqual(g.actions['done'].action, undefined);
            done();
        });
    });
    describe('#actions suggestions', function(){
        it('should run these commands without error', function(done){
            assert.doesNotThrow(function(){

                var na = getGame();
                
                //'Action Suggestions'
                na.suggestAction([])

                //'Fortify Suggestions'
                na.suggestAction(['fortify'])
                na.suggestAction(['fortify', 'tom'])
                na.suggestAction(['fortify', 'tom', 'usa'])
                na.suggestAction(['fortify', 'tom', 'usa', 'mexico'])
                na.suggestAction(['fortify', 'tom', 'usa', 'mexico', 7])

                na.takeAction(['fortify', 'tom', 'usa', 'mexico', 7])

                //'Reinforce Suggestions'
                na.suggestAction(['reinforce'])
                na.suggestAction(['reinforce', 'tom'])
                na.suggestAction(['reinforce', 'tom', 'mexico'])
                na.suggestAction(['reinforce', 'tom', 'mexico', 5])

                na.takeAction(['reinforce', 'tom', 'usa', 4])


                //'attack Suggestions'
                na.suggestAction(['attack'])
                na.suggestAction(['attack', 'tom'])
                na.suggestAction(['attack', 'tom', 'usa'])
                na.suggestAction(['attack', 'tom', 'usa', 'canada'])
                na.suggestAction(['attack', 'tom', 'usa', 'canada', 3])

                na.takeAction(['attack', 'tom', 'usa', 'canada', 3])

                //JSON.stringify(na.jsonify())
                //

                /*
                var reconstituted = game(null, [], []);
                reconstituted.dejsonify(na.jsonify());
                reconstituted.getAscii()
                JSON.stringify(reconstituted.jsonify())
                */
            });
            done();
        });
    });
});
/*
var testSerialization = function(){
    na = getGame();
    t(na);
    new_na = new risk.Game(JSON.parse(JSON.stringify(na)));
    t(new_na);
    t(new_na.takeAction(['reinforce', 'tom', 'usa', 2]));
    t(new_na.takeAction(['done', 'tom']));
    t(new_na);
};
var testClientServerSerialization = function(){
    na = getGame();
    var server_s = JSON.stringify(na);
    var client_g = risk.Game.clientReconstitute(server_s);
    t(client_g.takeAction(['reinforce', 'tom', 'usa', 2]));
    t(client_g.takeAction(['done', 'tom']));
    t(client_g);
    var client_s = JSON.stringify(client_g);
    var server_g = risk.Game.getUpdatedServerGame(client_s, 'tom', server_s);
    t(server_g);
    var new_client_g = risk.Game.clientReconstitute(JSON.stringify(server_g));
    t(new_client_g);
    return;
};
var testCreationAndDisplay = function(){
    var na = getGame();
    t(na);
    t(na.getAscii());
};
//testSerialization();
//testClientServerSerialization();
*/
