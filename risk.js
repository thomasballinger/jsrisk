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
    this.reinforcementsToPlace = 0;  // reinforcements to place
    this.fortifyMovesToMake = 0;  // reinforcements to place
    this.fortifyMovesAllowed = 1;
};

Game.prototype = {
    endTurn : function(){
        this.whoseTurn = this.players[(this.players.indexOf(this.whoseTurn) + 1) % this.players.length];
        this.fortifyMovesToMake = this.fortifyMovesAllowed;
        this.giveReinforcements();
    },
    actions : {
        'fortify' : {
            // soft stuff - what to suggest, info
            description : 'Move troops from one owned country to an adj. one',
            args : ['player', 'from', 'to', 'howMany'],
            shouldBeSuggested : function(){
				if (this.turnPhase != 'fortify'){
					return false;
				}
				return true;
			},
            requiresServer : false,
            argSuggestFunctions : [
                function(){return [this.whoseTurn];},
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

                if (this.fortifyMovesToMake < 1){return false;}
                if (this.turnPhase != 'fortify'){return false;}
                if (this.whoseTurn != player){return false;}

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

                this.fortifyMovesToMake = this.fortifyMovesToMake - 1;
                if (this.fortifyMovesToMake < 1){
                    this.endTurn();
                }
                return true;
            }
        },
        'reinforce' : {
            description : 'add an additional troop to a country you control',
            args : ['player', 'country', 'howMany'],
            shouldBeSuggested : function(){
                if (this.turnPhase == 'reinforce'){return true;}
                return false;
            },
            requiresServer : false,
            argSuggestFunctions : [
                function(){return [this.whoseTurn];},
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
                    for (var i = 1; i < this.reinforcementsToPlace+1; i++){
                        toSuggest.push(i);
                    }
                    return toSuggest;
                }
            ],
            action : function(player, country, howMany){
                var country = this.getCountry(country);

                if (this.reinforcementsToPlace < howMany){return false;}
                if (this.turnPhase != 'reinforce'){return false;}
                if (this.whoseTurn != player){return false;}

                if (!country.isOwnedBy(player)){return false;}
                if (player === undefined){return false;}
                if (country === undefined){return false;}
                if (howMany === undefined){return false;}
                if (typeof howMany == 'string'){howMany = parseInt(howMany);}
                country.numTroops = country.numTroops + howMany;

                this.reinforcementsToPlace = this.reinforcementsToPlace - howMany;
                if (this.reinforcementsToPlace < 1){
                    this.turnPhase = 'attack'
                }
                return true;
            },
        },
        'done' : {
            description : 'finish phase without taking any more actions',
            args : ['player'],
            argSuggestFunctions : [
                function(){return [this.whoseTurn];},
			],
            shouldBeSuggested : function(){
                if (this.turnPhase == 'attack'){return true;}
                if (this.turnPhase == 'freemove'){return true;}
                if (this.turnPhase == 'fortify'){return true;}
                if (this.turnPhase == 'reinforce'){return false;}
                return false;
            },
            requiresServer : true,
            action : function(player){
                if (player != this.whoseTurn){return False}
                if (this.turnPhase == 'attack'){
                    this.turnPhase = 'fortify';
                    return true;
                }else if (this.turnPhase == 'fortify'){
                    this.endTurn();
                    return true;
                }else if (this.turnPhase == 'reinforce'){
                    if (this.reinforcementsToPlace > 0){
                        return false;
                    }
                    return true;
                }else if (this.turnPhase == 'freemove'){
                    this.turnPhase == 'attack';
                    return true;
                }
            },
        },
        'attack' : {
            description : 'attack a country from an adjacent country you control',
            args : ['player', 'from', 'to', 'howMany'],
            shouldBeSuggested : function(){
				if (this.turnPhase != 'attack'){return false;}
                var player = this.whoseTurn;
                var owned = this.getCountriesOwned(player);
                for (var i = 0; i < owned.length; i++){
                    if (owned[i].numTroops > 1){
                        if (this.getCountriesNotOwnedByAndTouching(player, owned[i].name).length > 0){
                            return true;
                        }
                    }
                }
                return false;
            },
            requiresServer : true,
            argSuggestFunctions : [
                function(){return [this.whoseTurn];},
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
                if (from.numTroops > 1){
                    this.turnStage = 'freemove';
                }
                return true;
            },
        },
        'freemove' : {
            // soft stuff - what to suggest, info
            description : 'Move troops from attacking country to newly captured country immediately after a successful attack',
            args : ['player', 'howMany'],
            shouldBeSuggested : function(){
                if (this.lastAttack && this.lastAttack.captured){return true;}
                return false;
            },
            requiresServer : false,
            argSuggestFunctions : [
                function(){return [this.whoseTurn];},
                function(player){
                    var troops = this.getCountry(this.lastAttack.from).numTroops;
                    var results = [];
                    for (var i = 1; i < troops; i++){
                        results.push(i);
                    }
                    return results;
                },
            ],

            // hard stuff - implementation of the action
            // actions return true or false depending on if they succeed
            action : function(player, howMany){
                var fromC = this.getCountry(this.lastAttack.from);
                var toC = this.getCountry(this.lastAttack.to);

                if (this.lastAttack === undefined){return false;}
                if (player === undefined){return false;}
                if (howMany === undefined){return false;}

                if (!this.lastAttack.captured){return false;}
                if (fromC.getTroops() < 2){return false;}
                if (this.turnPhase != 'freemove'){return false;}
                if (this.whoseTurn != player){return false;}

                if (typeof howMany === 'string'){howMany = parseInt(howMany);}
                if (!(fromC.isOwnedBy(player) && toC.isOwnedBy(player))){return false;}
                if (howMany > fromC.numTroops - 1){return false;}
                fromC.numTroops = fromC.numTroops - howMany;
                toC.numTroops = toC.numTroops + howMany;

                this.turnPhase = 'attack';
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
                if (this.actions[action].shouldBeSuggested.call(this)){
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
    getPredictedReinforcements : function(player){
        var countries = this.getCountriesOwned(player);
        return countries.length
    },
    giveReinforcements : function(){
        this.reinforcementsToPlace = this.getPredictedReinforcements(this.whoseTurn);
        return true;
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
        return '[Country '+name+']';
    },
    getAscii : function(){
        var s = name;
        s = s + '\n '+this.whoseTurn+"'s turn, "+this.turnPhase+" phase";
		if (this.turnPhase == 'reinforce'){s = s + '\n  troops to place: '+this.reinforcementsToPlace;}
		if (this.turnPhase == 'fortify'){s = s + '\n  fortify moves left: '+this.fortifyMovesToMake;}
        s = s + '\n countries:';
        for (var i = 0; i < this.countries.length; i++){
            s = s + '\n  ' + this.countries[i].getAscii();
        }
        return s;
    },
}
