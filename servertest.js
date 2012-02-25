var mongo = require('mongodb');
var assert = require('assert')
var database = require('./database.js');

var risk = require('./risk');
var util = require('./util');

var createRandomBasicGame = function(){
    g = new risk.Game({name:util.createRandomPronounceableWord()});
    g.players = util.choose(['ryan', 'tom', 'andrew', 'israel'], 2);
    g.addNewCountry('canada', ['usa']);
    g.addNewCountry('usa', ['canada', 'mexico']);
    g.addNewCountry('mexico', ['usa']);

    // board setup
    g.setCountryState('usa', g.players[0], 8);
    g.setCountryState('canada', g.players[1], 4);
    g.setCountryState('mexico', g.players[0], 6);

    // TODO this should be in a Game method
    // getting ready for first move
    g.giveReinforcements();
    g.fortifyMovesToMake = g.fortifyMovesAllowed;

    return g;
};
var populateTestDatabase = function(callback){
    var db = new mongo.Db('risk', new mongo.Server('localhost', 27017, {}), {});
    db.open(function() {
        // callback for when open call returns
        console.log('open call is running it\'s callback!');
        db.collection('games', function(err,collection) {
            // function to call when request for collection returns
            collection.remove({});
            var i = 0;
            var howMany = 10;
            for (i; i < howMany; i++){
                console.log('inserting game '+i+' of '+howMany);
                collection.insert(createRandomBasicGame(), function(){
                    // function to call when insert returns
                });
            }
            console.log('finished collection callback');
            db.close();
            callback()
            console.log('just closed db');
        });
        console.log('finished open callback');
    });
    console.log('got past db open call');
};


var tests = function(){
    populateTestDatabase(function(){
        console.log("Just finished initializing client");
        database.connect();
        database.getAllGameNames(function(names){
            //console.log(names);
            assert.equal(names.length, 10)
            console.log('* Get game names test passed');
        });
        database.getAllGameNames(function(names){
            database.getGameByName(names[0], function(x){assert.equal(x.name, names[0])})
            console.log('* Get game by name test passed');
        });
        database.getAllGameNames(function(names){
            var game = database.getGameByName(names[0], function(game){
                game.customfield = 'asfd';
                database.updateGameByName(names[0], game, function(){
                    database.getGameByName(names[0], function(new_game){
                        assert.equal(new_game.customfield, 'asfd');
                        console.log('* Update game test passed');
                    });
                });
            });
        });
        console.log('All tests passed!');
    });
};

tests()
