// cheap interface using the suggest capabilities

this.interface_buttons = [];

var create_button = function(label, action){
    var button = document.createElement('input');
    button.setAttribute("type", "button");
    button.setAttribute("name", "namehere");
    button.setAttribute("value", label);
    button.setAttribute("onclick", action)
    var span = document.getElementById("spanForStuff");
    var header = document.getElementById("header");
    document.body.insertBefore(button, span);
    span.appendChild(button);
}


var arg_array = [];
var start_stuff = function(){
    initialize();
    var responses = na.suggest_action();
    create_button('asdf', "alert('test');");
}
var na = null;
var initialize = function(){
    var output = document.getElementById("output");
    document.writeln(output);
    document.writeln(output.innerHTML);
        asdf;
    var t = function(msg){output.innerHTML = output.innerHTML + '\n' + msg + '\n';};

    t();

    na = game('North America', [], ['tomb', 'ryan']);

    na.add_new_country('canada', ['usa']);
    na.add_new_country('usa', ['canada', 'mexico']);
    na.add_new_country('mexico', ['usa']);

    na.set_country_state('usa', 'tom', 8);
    na.set_country_state('canada', 'ryan', 4);
    na.set_country_state('mexico', 'tom', 6);

    t(na.get_ascii());

    t('Action Suggestions');
    t(na.suggest_action([]));
    t('Fortify Suggestions');
    t(na.suggest_action(['fortify']));
    t(na.suggest_action(['fortify', 'tom']));
    t(na.suggest_action(['fortify', 'tom', 'usa']));
    t(na.suggest_action(['fortify', 'tom', 'usa', 'mexico']));
    t(na.suggest_action(['fortify', 'tom', 'usa', 'mexico', 7]));

    t(na.take_action(['fortify', 'tom', 'usa', 'mexico', 7]));

    t('Reinforce Suggestions');
    t(na.suggest_action(['reinforce']));
    t(na.suggest_action(['reinforce', 'tom']));
    t(na.suggest_action(['reinforce', 'tom', 'usa']));
    t(na.suggest_action(['reinforce', 'tom', 'usa', 5]));

    t(na.take_action(['reinforce', 'tom', 'usa', 4]));

    t('attack Suggestions');
    t(na.suggest_action(['attack']));
    t(na.suggest_action(['attack', 'tom']));
    t(na.suggest_action(['attack', 'tom', 'usa']));
    t(na.suggest_action(['attack', 'tom', 'usa', 'canada']));
    t(na.suggest_action(['attack', 'tom', 'usa', 'canada', 3]));

    t(na.take_action(['attack', 'tom', 'usa', 'canada', 3]));



    t(na.get_ascii());

    t(JSON.stringify(na.jsonify()));

    var reconstituted = game(null, [], []);
    t(reconstituted);
    reconstituted.dejsonify(na.jsonify());
    t(reconstituted.get_ascii());
    t(JSON.stringify(reconstituted.jsonify()));

    t('finished');
}
