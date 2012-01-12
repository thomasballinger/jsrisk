// cheap interface using the suggest capabilities

this.interface_buttons = [];

var create_button = function(label, action){
    var button = document.createElement('input');
    button.setAttribute("type", "button");
    button.setAttribute("name", "namehere");
    button.setAttribute("value", label);
    button.setAttribute("onclick", action);
    var span = document.getElementById("spanForStuff");
    var header = document.getElementById("header");
    document.body.insertBefore(button, span);
    span.appendChild(button);
};

var create_buttons_for_next_choice = function(choice){
    var options;
    if (choice === undefined){
        arg_array = [];
        options = na.suggest_action(arg_array);
    }else{
        arg_array.push(choice);
        options = na.suggest_action(arg_array);
    }
    if (options === true){
        na.take_action(arg_array);
        create_buttons_for_next_choice();
    } else{
        for (var i = 0; i < options.length; i++){
            create_button(options[i], "create_buttons_for_next_choice('"+options[i]+"');");
        }
    }
};

var arg_array = [];
var start_stuff = function(){
    initialize_risk();
    create_button('display', "t(na.get_ascii());");
    create_buttons_for_next_choice();
}
var na = null;
var t = null;
var initialize_risk = function(){
    var output = document.getElementById("output");
    t = function(msg){output.innerHTML = output.innerHTML + msg + '\n';};

    t('\n');

    na = game('North America', [], ['tom', 'ryan']);

    na.add_new_country('canada', ['usa']);
    na.add_new_country('usa', ['canada', 'mexico']);
    na.add_new_country('mexico', ['usa']);

    na.set_country_state('usa', 'tom', 8);
    na.set_country_state('canada', 'ryan', 4);
    na.set_country_state('mexico', 'tom', 6);

    t(na.get_ascii());
};

var test = function(){
	
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
    t(na.suggest_action(['reinforce', 'tom', 'mexico']));
    t(na.suggest_action(['reinforce', 'tom', 'mexico', 5]));

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

    t('finished test');
};
