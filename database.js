var mongo = require('mongodb');

var client = undefined;

var connect = function(){
    client = new mongo.Db('risk', new mongo.Server('localhost', 27017, {}), {});
}
var doSomethingWithGames = function(callback){
    client.open(function(err, p_client){
        if (err) {throw err;}
        console.log("about to do something with games in database");
        client.collection('games', callback);
    });
};
var getGameByName = function(callback){
    doSomethingWithGames(function(err, collection){
        collection.find({'name':name}).toArray(function(err, results){
            console.log("game found");
            callback(results[0]);
        });
    });
};
var getAllGameNames = function(callback){
    doSomethingWithGames(function(err, collection){
       collection.find().toArray(function(err, results){
           console.log("games found:");
           var names = [];
           for (i in results){
               names.push(results[i].name)
           }
           callback(names);
       });
    });
};
exports.connect = connect;
exports.getGameByName = getGameByName;
exports.getAllGameNames = getAllGameNames;
