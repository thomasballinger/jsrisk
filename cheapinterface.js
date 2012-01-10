// cheap interface using the suggest capabilities

this.interface_buttons = [];

var create_button = function(label, action){
    var button = document.createElement('input');
    button.setAttribute("type", "button");
    button.setAttribute("name", "namehere");
    button.setAttribute("value", label);
    button.onclick = action;
    button.setAttribute("onclick", this.onclick)
    var span = document.getElementById("spanForStuff");
    var header = document.getElementById("header");
    document.body.insertBefore(button, span);
    span.appendChild(button);
}

var create_buttons_for_next = function(){
    var responses = na.suggest_action(arg_array);
    var make_callback = function(arg){
        var args = [];
        for (var i = 0; i < arg_array.length; i++){
            args.push(arg_array[i]);
        }
        args.push(arg);
        return function(){
            na.suggest_action(args);
        };
    };
    if (responses === true){
        na.take_action(arg_array);
        arg_array = []
        t(na.get_ascii());
    }else if(responses === undefined){
        return false;
    }else{
        for (var i = 0; i < responses.length; i++){
            var callback = make_callback(responses[i]);
            create_button(responses[i], callback);
        }
    }
};

var arg_array = [];
var start_stuff = function(){
    initialize_risk();
    create_button('asdf', function(){alert('test');});
    create_buttons_for_next();
}
var na = null;
var t = null;
var initialize_risk = function(){
    var output = document.getElementById("output");
    t = function(msg){output.innerHTML = output.innerHTML + '\n' + msg + '\n';};

    t('\n');

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
