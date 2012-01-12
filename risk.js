// Risk in javascript
// First project in javascript
// planning for a client/server architecture

var country = function(name, connected_to){
    // variables in constructor signature are private

    // These are private variables that weren't in the constructor signature
    var helper = function(player, num_troops){

        // These are public methods
        return {
            'get_name' : function(){return name},
            'get_troops' : function(){return num_troops;},
            'get_owner' : function(){return player;},
            'get_touching_names' : function(){return connected_to},
            'is_owned_by' : function(in_player){return in_player == player},
            'is_touching' : function(to){
                if (!(typeof to === 'string')){
                    to = to.get_name();
                }
                for (var i = 0; i < connected_to.length; i++){
                    if (connected_to[i] === to){
                        return true;
                    }
                }
                return false;
            },

            'set_state' : function(in_player, in_num_troops){
                player = in_player;
                num_troops = in_num_troops;
            },
            'toString' : function(){
                return '[country '+name+']';
            },
            'get_ascii' : function(){
                return name + ' owned by ' + player + ' with '+ num_troops +
                    '\n    connected to ' + connected_to;
            },
            'jsonify' : function(){
                var j = {
                    'name' : name,
                    'player' : player,
                    'num_troops' : num_troops,
                    'connected_to' : connected_to
                }
                return j;
            },
            'dejasonify' : function(j){
                name = j.name;
                player = j.player;
                num_troops = j.num_troops;
                connected_to = j.connected_to;
            }
        };
    };
    return helper(null, null)
};

var game = function(name, countries, players){
	// All logic to run a risk game
    var actions = {
        'fortify' : {
            // soft stuff - what to suggest, info
            description : 'Move troops from one owned country to an adj. one',
            args : ['player', 'from', 'to', 'how_many'],
            should_be_suggested : function(){return true;},
            requires_server : false,
            arg_suggest_functions : [
                function(){return players;},
                function(player){
                    var owned = get_countries_owned(player);
                    var to_suggest = [];
                    for (var i = 0; i < owned.length; i++){
                        if (owned[i].get_troops() > 1){
                            var gobat = get_countries_owned_by_and_touching(player, owned[i].get_name());
                            if (get_countries_owned_by_and_touching(player, owned[i].get_name()).length > 0){
                                to_suggest.push(owned[i].get_name());
                            }
                        }
                    }
                    return to_suggest;
                },
                function(player, from){
                    var results = [];
                    var gobat = get_countries_owned_by_and_touching(player, from);
                    for (var i = 0; i < gobat.length; i++){
                        results.push(gobat[i].get_name());
                    }
                    return results;

                },
                function(player, from, to){
                    var troops = get_country(from).get_troops();
                    var results = [];
                    for (var i = 1; i < troops; i++){
                        results.push(i);
                    }
                    return results;
                },
            ],

            // hard stuff - implementation of the action
            // actions return true or false depending on if they succeed
            action : function(player, from, to, how_many){
                var from_c = get_country(from);
                var to_c = get_country(to);
                if (from_c === undefined){return false;}
                if (to_c === undefined){return false;}
                if (player === undefined){return false;}
                if (how_many === undefined){return false;}
                if (typeof how_many === 'string'){how_many = parseInt(how_many);}
                if (!(from_c.is_owned_by(player) && to_c.is_owned_by(player))){return false;}
                if (how_many > from_c.get_troops() - 1){return false;}
                if (!(from_c.is_touching(to_c.get_name()))){return false;}
                from_c.set_state(player, from_c.get_troops() - how_many);
                to_c.set_state(player, to_c.get_troops() + how_many);
                return true;
            }
        },
        'reinforce' : {
            description : 'add an additional troop to a country you control',
            args : ['player', 'country', 'how_many'],
            should_be_suggested : function(){return true;},
            requires_server : false,
            arg_suggest_functions : [
                function(){return players;},
                function(player){
                    var owned = get_countries_owned(player);
                    var to_suggest = [];
                    for (var i = 0; i < owned.length; i++){
                        to_suggest.push(owned[i].get_name())
                    }
                    return to_suggest;
                },
                function(player, country){
                    var to_suggest = [];
                    for (var i = 1; i < 10; i++){
                        to_suggest.push(i);
                    }
                    return to_suggest;
                }
            ],
            action : function(player, country, how_many){
                var country = get_country(country);
                if (!country.is_owned_by(player)){return false;}
                if (player === undefined){return false;}
                if (country === undefined){return false;}
                if (how_many === undefined){return false;}
                if (typeof how_many == 'string'){how_many = parseInt(how_many);}
                country.set_state(player, country.get_troops() + how_many);
                return true;
            },
        },
        'attack' : {
            description : 'attack a country from an adjacent country you control',
            args : ['player', 'from', 'to', 'how_many'],
            should_be_suggested : function(){return true;},
            requires_server : true,
            arg_suggest_functions : [
                function(){return players;},
                function(player){
                    var owned = get_countries_owned(player);
                    var to_suggest = [];
                    for (var i = 0; i < owned.length; i++){
                        if (owned[i].get_troops() > 1){
                            if (get_countries_not_owned_by_and_touching(player, owned[i].get_name()).length > 0){
                                to_suggest.push(owned[i].get_name());
                            }
                        }
                    }
                    return to_suggest;
                },
                function(player, from){
                    var results = [];
                    var gcnobat = get_countries_not_owned_by_and_touching(player, from);
                    for (var i = 0; i < gcnobat.length; i++){
                        results.push(gcnobat[i].get_name());
                    }
                    return results;

                },
                function(player, from, to){
                    var troops = get_country(from).get_troops();
                    var results = [];
                    for (var i = 1; i < Math.min(troops, 4); i++){
                        results.push(i);
                    }
                    return results;
                },
            ],
            action : function(player, from, to, how_many){
                from = get_country(from);
                to = get_country(to);
                if (!from.is_owned_by(player)){return false;}
                if (to.is_owned_by(player)){return false;}
                if (player === undefined){return false;}
                if (from === undefined){return false;}
                if (to === undefined){return false;}
                if (how_many === undefined){return false;}
                if (typeof how_many === 'string'){how_many = parseInt(how_many);}
                var attacking = how_many;
                var defending = Math.min(to.get_troops(), 2);
                var attack_rolls = [];
                var defend_rolls = [];
                for (var i=0; i < attacking; i++){
                    attack_rolls.push(Math.ceil(Math.random()*6));
                }
                for (var i=0; i < defending; i++){
                    defend_rolls.push(Math.ceil(Math.random()*6));
                }
                attack_rolls.sort(function(x){return -x});
                defend_rolls.sort(function(x){return -x});
                var defenders_lost = 0;
                var attackers_lost = 0;
                if (attack_rolls[0] > defend_rolls[0]){
                    defenders_lost++;
                }else{
                    attackers_lost++;
                }
                if (defending === 2){
                    if (attack_rolls[1] > defend_rolls[1]){
                        defenders_lost++;
                    }else{
                        attackers_lost++;
                    }
                }
                from.set_state(player, from.get_troops() - attackers_lost);
                to.set_state(to.get_owner(), to.get_troops() - defenders_lost);
                if (to.get_troops() === 0){
                    to.set_state(player, attacking - attackers_lost);
                    from.set_state(player, from.get_troops() - attackers);
                }
                return true;
            }
        }
    };
    var get_countries_owned = function(player){
        var countries_owned = [];
        for (var i = 0; i < countries.length; i++){
            if (countries[i].is_owned_by(player)){
                countries_owned.push(countries[i]);
            }
        }
        return countries_owned;
    };
    var get_countries_owned_by_and_touching = function(player, country_name){
        var results = [];
        var country = get_country(country_name);
        var touching = country.get_touching_names();
        for (var i = 0; i < touching.length; i++){
            var test_country = get_country(touching[i])
            if (test_country.is_owned_by(player)){
                results.push(test_country);
            }
        }
        return results;
    }
    var get_countries_not_owned_by_and_touching = function(player, country_name){
        var results = [];
        var country =  get_country(country_name);
        var touching = country.get_touching_names();
        for (var i = 0; i < touching.length; i++){
            var test_country = get_country(touching[i]);
            if (!test_country.is_owned_by(player)){
                results.push(test_country);
            }
        }
        return results;
    }
    var get_country = function(country){
        for (var c in countries){
            if (countries[c].get_name() === country){
                return countries[c];
            }
        }
        throw {
            'name':'country not found!',
            'msg':'get_country function can\'t find country in ' + countries + ' matching string '+country
        };
    }

    // public methods
    return {
        suggest_action : function(arg_array){
            var to_suggest = [];
            if (arg_array === undefined || arg_array.length == 0){
                for (var action in actions){
                    if (actions[action].should_be_suggested()){
                        to_suggest.push(action);
                    }
                }
                return to_suggest;
            } else if (arg_array.length > 0 ){
                action = arg_array[0];
                if (actions[action].arg_suggest_functions.length < arg_array.length){
                    return true;
                };
                return actions[action].arg_suggest_functions[arg_array.length-1].apply(null, arg_array.slice(1));
            } else {
                throw {name: 'Logic Error', message: 'neg length?'};
            }
        },
        take_action : function(arg_array){
            if (arg_array.length < 1){return false;}
            var result = actions[arg_array[0]].action.apply(null, arg_array.slice(1));
            if (result){
                this.action_history.push(arg_array);
                return true;
            } else {
                return false;
            }
        },
        add_new_country : function(name, connected_to_array){
            var new_country = country(name, connected_to_array);
            new_country.set_state(null, 0);
            countries.push(new_country);
        },
        set_country_state : function(name, player, num_troops){
            var c = get_country(name);
            if (c === undefined){return false;}
            return c.set_state(player, num_troops);
        },
        toString : function(){
            return name;
        },
        get_ascii : function(){
            var s = name;
            s = s + '\n countries:';
            for (var i = 0; i < countries.length; i++){
                s = s + '\n  ' + countries[i].get_ascii();
            }
            return s;
        },
        action_history : [],
        base_state_json : {},
        whose_turn : null,
        turn_phase : null,
        jsonify : function(){
            // todo: jsonify method
            var j = {};
            j.action_history = this.action_history;
            j.base_state_json = this.base_state_json;
            j.whose_turn = this.whose_turn;
            j.turn_phase = this.turn_phase;
            j.name = name;
            j.players = players;
            j.countries = [];
            for (var i = 0; i < countries.length; i++){
                j.countries.push(countries[i].jsonify());
            }
            return j;
        },
        dejsonify : function(j){
            this.base_state_json = j
            this.move_history = j.move_history;
            name = j.name;
            countries = [];
            for (var i = 0; i < j.countries.length; i++){
                var c = country();
                c.dejasonify(j.countries[i]);
                countries.push(c);
            }
            players = j.players;
            this.whose_turn = j.whose_turn;
            this.turn_phase = j.turn_phase;
        },
    };
};
