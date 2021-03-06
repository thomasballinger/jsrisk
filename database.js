// Module implementing basic database manipulation
// These are trusted commands, no authentication etc happens

var mongo = require('mongodb');

var host = 'localhost';
var port = mongo.Connection.DEFAULT_PORT;

// code based on post by Ralph Edge:
// http://groups.google.com/group/node-mongodb-native/browse_thread/
// thread/1b992ee55b7a007d/ca2b08e43d563a44?lnk=gst&q=mocha#ca2b08e43d563a44

var MAX_RETRIES = 5;
var status = "connecting";
var connection = undefined;
var db = undefined;

var show_retry_message = true;

db = new mongo.Db('risk', new mongo.Server(host, port, {auto_reconnect : true}));
status = 'connecting';
db.open(function(err, conn){
    if (err) throw err;
    connection = conn;
    status = 'connected';
});

var close = function(){
    db.close();
};

exports.collection = function(collectionName, callback, retry){
    if (!retry) {retry = 0;}
    if (status == "connecting"){
        if (retry < MAX_RETRIES){
            setTimeout(function(){
				if (show_retry_message){
					console.log('Retrying mongo query(', retry, ')');
				}
                exports.collection(collectionName, callback, retry + 1);
            }, 50);
        } else {
            console.error('Timeout connecting to mongo(5 retries)');
            process.exit();
        }
    } else {
        connection.collection(collectionName, callback);
    }
};

exports.getAllGameJsonNames = function(callback){
    exports.collection('games', function(err, collection){
        collection.find({}).toArray(function(err, results){
            var names = [];
            var i;
            for (i=0; i<results.length; i++){
                names.push(results[i].name);
            }
            callback(names);
        });
    });
};

exports.getGameJsonByName = function(name, callback){
    exports.collection('games', function(err, collection){
        collection.find({'name':name}).toArray(function(err, results){
			callback(results[0]);
        });
    });
};

exports.storeGameJson = function(game_json, alreadyExistsFailure, callback){
    exports.collection('games', function(err, collection){
        exports.getGameJsonByName(game_json.name, function(savedGame){
            if (savedGame !== undefined){
                alreadyExistsFailure();
            } else {
                collection.insert(game_json, callback);
            }
        });
    });
};

exports.updateGameJson = function(game, doesNotExistFailure, callback){
    exports.collection('games', function(err, collection){
        collection.update({'name':game.name}, game, {safe:true}, function(err){
            if (err) {doesNotExistFailure();}
            else {callback();}
        });
    });
};

exports.removeGameJsonByName = function(name, doesNotExistFailure, callback){
    exports.collection('games', function(err, collection){
        exports.getGameJsonByName(name, function(savedGame){
            if (savedGame === undefined){
                doesNotExistFailure();
            } else {
                collection.remove({'name':name}, callback());
            }
        });
    });
};

exports.getAllGameJsonsWithPlayer = function(player, callback){
    exports.collection('games', function(err, collection){
        collection.find({}).toArray(function(err, results){
            var games = [];
            var i;
            for (i in results){
                var players = results[i].players;
                var j;
                for (j = 0; j < players.length; j++){
                    if (players[j] == player){
                        games.push(results[i]);
                        break;
                    }
                }
            }
            callback(games);
        });
    });
};

if (!module.parent) {
	exports.collection('games', function(err, collection){
		collection.find({}).toArray(function(err, results){
			console.log(results);
		});
	});
    setTimeout(close, 1000);
} else {}
