// node
//

var risk = require('./risk.js');

var t = function(msg){
    console.log(msg);
};

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
var testActions = function(){
    
    t('Action Suggestions');
    t(na.suggestAction([]));

    t('Fortify Suggestions');
    t(na.suggestAction(['fortify']));
    t(na.suggestAction(['fortify', 'tom']));
    t(na.suggestAction(['fortify', 'tom', 'usa']));
    t(na.suggestAction(['fortify', 'tom', 'usa', 'mexico']));
    t(na.suggestAction(['fortify', 'tom', 'usa', 'mexico', 7]));

    t(na.takeAction(['fortify', 'tom', 'usa', 'mexico', 7]));

    t('Reinforce Suggestions');
    t(na.suggestAction(['reinforce']));
    t(na.suggestAction(['reinforce', 'tom']));
    t(na.suggestAction(['reinforce', 'tom', 'mexico']));
    t(na.suggestAction(['reinforce', 'tom', 'mexico', 5]));

    t(na.takeAction(['reinforce', 'tom', 'usa', 4]));

    t('attack Suggestions');
    t(na.suggestAction(['attack']));
    t(na.suggestAction(['attack', 'tom']));
    t(na.suggestAction(['attack', 'tom', 'usa']));
    t(na.suggestAction(['attack', 'tom', 'usa', 'canada']));
    t(na.suggestAction(['attack', 'tom', 'usa', 'canada', 3]));

    t(na.takeAction(['attack', 'tom', 'usa', 'canada', 3]));

    t(na.getAscii());

    t(JSON.stringify(na.jsonify()));

    var reconstituted = game(null, [], []);
    t(reconstituted);
    reconstituted.dejsonify(na.jsonify());
    t(reconstituted.getAscii());
    t(JSON.stringify(reconstituted.jsonify()));

    t('finished test');
};
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
testClientServerSerialization();
