var mongo = require('mongodb');
var client = new mongo.Db('risk', new mongo.Server('localhost', 27017, {}), {});

var close = function(){
    client.close();
};
var getGameByName = function(name, callback){
    client.open(function(err, p_client){
		if (err) {throw err;}
        client.collection.find({'name':name}).toArray(function(err, results){
            //console.log("game found");
            callback(results[0]);
        });
    });
};
var getAllGameNames = function(callback){
	client.open(function(err, p_client){
		if (err) {throw err;}
        client.collection('games', function(err, collection){
			collection.find().toArray(function(err, results){
				//console.log("games found:");
				var names = [];
				var i;
				for (i in results){
					names.push(results[i].name);
				}
				callback(names);
				client.close();
			});
        });
    });
};
var updateGameByName = function(name, game, callback){
    doSomethingWithGames(function(err, collection){
        collection.update({'name':name}, game);
        callback();
    });
}
//TODO: need saveGameByName
exports.close = close;
exports.show = function(){console.log(client)};
exports.getGameByName = getGameByName;
exports.getAllGameNames = getAllGameNames;
exports.updateGameByName = updateGameByName;

//console.log('---');
getAllGameNames(function(names){console.dir(names);});
