// Risk in javascript
// First project in javascript
// planning for a client/server architecture

var Country = function(name, connectedTo){
    this.name = name;
    this.connectedTo = connectedTo;
}

Country.prototype = {
    numTroops : 0,
    player : null,
    isOwnedBy : function(inPlayer){
		return inPlayer === this.player
	},
    isTouching : function(country){
        if (country.name){
            country = country.name;
        }
        var len = this.connectedTo.length;
        for (var i = 0; i < len; i++){
            if (this.connectedTo[i] === country){
                return true;
            }
        }
        return false;
    },
    toString : function(){
        return '[country '+this.name+']';
    },
    getAscii : function(){
        return this.name + ' owned by ' + this.player + ' with '+ this.numTroops +
            '\n    connected to ' + this.connectedTo;
    },
};

var Game = function(name){
    this.name = name;
    this.countries = [];             // array of country objects
    this.players = [];               // array of player names
    this.actionHistory = [];         // array of moves from lastSecureJSON
    this.lastSecureJsonString = null;// stringified object from server
    this.whoseTurn = null;           // player name
    this.turnPhase = null;           // can be 'reinforce', 'attack',
                                     //   'freemove' or 'fortify'
    this.lastAttack = null;          // object describing last attack
};

Game.prototype = {
    actions : {
        'fortify' : {
            // soft stuff - what to suggest, info
            description : 'Move troops from one owned country to an adj. one',
            args : ['player', 'from', 'to', 'howMany'],
            shouldBeSuggested : function(){return true;},
            requiresServer : false,
            argSuggestFunctions : [
                function(){return this.players;},
                function(player){
                    var owned = this.getCountriesOwned(player);
                    var toSuggest = [];
                    for (var i = 0; i < owned.length; i++){
                        if (owned[i].numTroops > 1){
                            var gobat = this.getCountriesOwnedByAndTouching(player, owned[i].name);
                            if (this.getCountriesOwnedByAndTouching(player, owned[i].name).length > 0){
                                toSuggest.push(owned[i].name);
                            }
                        }
                    }
                    return toSuggest;
                },
                function(player, from){
                    var results = [];
                    var gobat = this.getCountriesOwnedByAndTouching(player, from);
                    for (var i = 0; i < gobat.length; i++){
                        results.push(gobat[i].name);
                    }
                    return results;

                },
                function(player, from, to){
                    var troops = this.getCountry(from).numTroops;
                    var results = [];
                    for (var i = 1; i < troops; i++){
                        results.push(i);
                    }
                    return results;
                },
            ],

            // hard stuff - implementation of the action
            // actions return true or false depending on if they succeed
            action : function(player, from, to, howMany){
                var fromC = this.getCountry(from);
                var toC = this.getCountry(to);
                if (fromC === undefined){return false;}
                if (toC === undefined){return false;}
                if (player === undefined){return false;}
                if (howMany === undefined){return false;}
                if (typeof howMany === 'string'){howMany = parseInt(howMany);}
                if (!(fromC.isOwnedBy(player) && toC.isOwnedBy(player))){return false;}
                if (howMany > fromC.numTroops - 1){return false;}
                if (!(fromC.isTouching(toC.name))){return false;}
                fromC.numTroops = fromC.numTroops - howMany;
                toC.numTroops = toC.numTroops + howMany;
                return true;
            }
        },
        'reinforce' : {
            description : 'add an additional troop to a country you control',
            args : ['player', 'country', 'howMany'],
            shouldBeSuggested : function(){return true;},
            requiresServer : false,
            argSuggestFunctions : [
                function(){return this.players;},
                function(player){
                    var owned = this.getCountriesOwned(player);
                    var toSuggest = [];
                    for (var i = 0; i < owned.length; i++){
                        toSuggest.push(owned[i].name)
                    }
                    return toSuggest;
                },
                function(player, country){
                    var toSuggest = [];
                    for (var i = 1; i < 10; i++){
                        toSuggest.push(i);
                    }
                    return toSuggest;
                }
            ],
            action : function(player, country, howMany){
                var country = this.getCountry(country);
                if (!country.isOwnedBy(player)){return false;}
                if (player === undefined){return false;}
                if (country === undefined){return false;}
                if (howMany === undefined){return false;}
                if (typeof howMany == 'string'){howMany = parseInt(howMany);}
                country.numTroops = country.numTroops + howMany;
                return true;
            },
        },
        'attack' : {
            description : 'attack a country from an adjacent country you control',
            args : ['player', 'from', 'to', 'howMany'],
            shouldBeSuggested : function(){return true;},
            requiresServer : true,
            argSuggestFunctions : [
                function(){return this.players;},
                function(player){
                    var owned = this.getCountriesOwned(player);
                    var toSuggest = [];
                    for (var i = 0; i < owned.length; i++){
                        if (owned[i].numTroops > 1){
                            if (this.getCountriesNotOwnedByAndTouching(player, owned[i].name).length > 0){
                                toSuggest.push(owned[i].name);
                            }
                        }
                    }
                    return toSuggest;
                },
                function(player, from){
                    var results = [];
                    var gcnobat = this.getCountriesNotOwnedByAndTouching(player, from);
                    for (var i = 0; i < gcnobat.length; i++){
                        results.push(gcnobat[i].name);
                    }
                    return results;

                },
                function(player, from, to){
                    var troops = this.getCountry(from).numTroops;
                    var results = [];
                    for (var i = 1; i < Math.min(troops, 4); i++){
                        results.push(i);
                    }
                    return results;
                },
            ],
            action : function(player, from, to, howMany){
                from = this.getCountry(from);
                to = this.getCountry(to);
                if (!from.isOwnedBy(player)){return false;}
                if (to.isOwnedBy(player)){return false;}
                if (player === undefined){return false;}
                if (from === undefined){return false;}
                if (to === undefined){return false;}
                if (howMany === undefined){return false;}
                if (typeof howMany === 'string'){howMany = parseInt(howMany);}
                var attacking = howMany;
                var defending = Math.min(to.numTroops, 2);
                var attackRolls = [];
                var defendRolls = [];
                for (var i=0; i < attacking; i++){
                    attackRolls.push(Math.ceil(Math.random()*6));
                }
                for (var i=0; i < defending; i++){
                    defendRolls.push(Math.ceil(Math.random()*6));
                }
                attackRolls.sort(function(x){return -x});
                defendRolls.sort(function(x){return -x});
                var defendersLost = 0;
                var attackersLost = 0;
                if (attackRolls[0] > defendRolls[0]){
                    defendersLost++;
                }else{
                    attackersLost++;
                }
                if (defending === 2){
                    if (attackRolls[1] > defendRolls[1]){
                        defendersLost++;
                    }else{
                        attackersLost++;
                    }
                }
                from.numTroops = from.numTroops - attackersLost;
                to.numTroops = to.numTroops - defendersLost;
                if (to.numTroops === 0){
                    to.player = player;
					to.numTroops = attacking - attackersLost;
					from.numTroops = from.numTroops - attacking;
                }
                this.lastAttack = {
                    from          : from.name,
                    to            : to.name,
                    numAttackers  : attacking,
                    numDeffenders : defending,
                    attackRolls   : attackRolls,
                    defendRolls   : defendRolls,
                    attackersLost : attackersLost,
                    defenderLost  : defendersLost,
                    captured      : (to.numTroops === 0),
                };
                return true;
            },
        },
    },
    getCountriesOwned : function(player){
        var countriesOwned = [];
        for (var i = 0; i < this.countries.length; i++){
            if (this.countries[i].isOwnedBy(player)){
                countriesOwned.push(this.countries[i]);
            }
        }
        return countriesOwned;
    },
    getCountriesOwnedByAndTouching : function(player, countryName){
        var results = [];
        var country = this.getCountry(countryName);
        var touching = country.connectedTo;
        for (var i = 0; i < touching.length; i++){
            var testCountry = this.getCountry(touching[i])
            if (testCountry.isOwnedBy(player)){
                results.push(testCountry);
            }
        }
        return results;
    },
    getCountriesNotOwnedByAndTouching : function(player, countryName){
        var results = [];
        var country =  this.getCountry(countryName);
        var touching = country.connectedTo;
        for (var i = 0; i < touching.length; i++){
            var testCountry = this.getCountry(touching[i]);
            if (!testCountry.isOwnedBy(player)){
                results.push(testCountry);
            }
        }
        return results;
    },
    getCountry : function(country){
        for (var c in this.countries){
            if (this.countries[c].name === country){
                return this.countries[c];
            }
        }
        throw {
            'name':'country not found!',
            'msg':'this.getCountry function can\'t find country in ' + this.countries + ' matching string '+country
        };
    },

    suggestAction : function(argArray){
        var toSuggest = [];
        if (argArray === undefined || argArray.length == 0){
            for (var action in this.actions){
                if (this.actions[action].shouldBeSuggested()){
                    toSuggest.push(action);
                }
            }
            return toSuggest;
        } else if (argArray.length > 0 ){
            action = argArray[0];
            if (this.actions[action].argSuggestFunctions.length < argArray.length){
                return true;
            };
            return this.actions[action].argSuggestFunctions[argArray.length-1].apply(this, argArray.slice(1));
        } else {
            throw {name: 'Logic Error', message: 'neg length?'};
        }
    },
    takeAction : function(argArray){
        if (argArray.length < 1){return false;}
        var result = this.actions[argArray[0]].action.apply(this, argArray.slice(1));
        if (result){
            this.actionHistory.push(argArray);
            return true;
        } else {
            return false;
        }
    },
    addNewCountry : function(name, connectedToArray){
        var newCountry = new Country(name, connectedToArray);
        this.countries.push(newCountry);
    },
    setCountryState : function(name, player, numTroops){
        var c = this.getCountry(name);
        c.player = player
        c.numTroops = numTroops;
    },
    toString : function(){
        return name;
    },
    getAscii : function(){
        var s = name;
        s = s + '\n countries:';
        for (var i = 0; i < this.countries.length; i++){
            s = s + '\n  ' + this.countries[i].getAscii();
        }
        return s;
    },
};
