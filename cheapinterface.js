// cheap interface using the suggest capabilities


var createButton = function(label, action, idOfParent){
    var button = document.createElement('input');
    button.setAttribute("type", "button");
    button.setAttribute("name", "namehere");
    button.setAttribute("value", label);
    button.setAttribute("onclick", action);
    var span = document.getElementById(idOfParent);
    document.body.insertBefore(button, span);
    span.appendChild(button);
};

var createButtonsForNextChoice = function(choice){
    var span = document.getElementById("spanForInput");
    len = span.childNodes.length;
    for (var i=0; i<len; i++){
        span.removeChild(span.childNodes[0]);
    }
    var options;
    if (choice === undefined){
        argArray = [];
        if (window.user == na.whoseTurn){
            options = na.suggestAction(argArray);
        } else {
            options = [];
        }
    }else{
        argArray.push(choice);
        if (argArray.length == 1){
            argArray.push(window.user);
        }
        options = na.suggestAction(argArray);
    }
    if (options === true){
        na.takeAction(argArray);
        createButtonsForNextChoice();
        t(na.getAscii());
    } else{
        for (var i = 0; i < options.length; i++){
            createButton(options[i], "createButtonsForNextChoice('"+options[i]+"');", "spanForInput");
        }
    }
};

var argArray = [];
var startStuff = function(){
    initializeRisk();
    createButton('display', "t(na.getAscii());", "spanForLongTerm");
    document.getElementById("spanForLongTerm").removeChild(document.getElementById("start"));
}
var na = null;
var t = null;
var initializeRisk = function(){
    var output = document.getElementById("output");
    t = function(msg){output.innerHTML = output.innerHTML + msg + '\n';};
    window.t = function(msg){output.innerHTML = msg;};

    t('\n');

    na = new Game('North America');

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

    window.user = undefined;
    
    for (var i = 0; i < na.players.length; i++){
        createButton('log in as '+na.players[i], 'window.user = "'+na.players[i]+'"; t("logged in as '+na.players[i]+'"); argArray=[]; createButtonsForNextChoice()', 'spanForChangingPlayer')
    }

    t(na.getAscii());
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
