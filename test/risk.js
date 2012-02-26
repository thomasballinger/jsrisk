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

    na.setCountryState('usa', 'tom', 8);
    na.setCountryState('canada', 'ryan', 4);
    na.setCountryState('mexico', 'tom', 6);

    na.giveReinforcements();
    na.fortifyMovesToMake = na.fortifyMovesAllowed;
    return na;
};

describe('risk', function(){
    describe('basic actions', function(){
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

                //na.getAscii()

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
