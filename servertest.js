mongo = require('mongodb');
risk = require('./risk');
util = require('./util');

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
var populateTestDatabase = function(){
    var db = new mongo.Db('risk', new mongo.Server('localhost', 27017, {}), {});
    db.open(function() {
        // callback for when open call returns
        console.log('open call has returned!');
        //db.remove({});
        db.collection('games', function(err,collection) {
            // function to call when request for collection returns
            var i = 0;
            var howMany = 10;
            var addGameToDbAsync = function(){
                if (i >= howMany){return;}
                console.log('inserting game '+i+' of '+howMany);
                collection.insert(createRandomBasicGame(), function(){
                    // function to call when insert returns
                });
                i++;
                //process.nextTick(addGameToDbAsync);
                addGameToDbAsync();
            };
            addGameToDbAsync(10);
            console.log('finished collection callback');
            db.close();
        });
        console.log('finished open callback');
    });
    console.log('done populating database');
};
populateTestDatabase();
