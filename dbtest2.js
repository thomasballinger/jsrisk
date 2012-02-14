var mongo = require("mongodb")
var db = new mongo.Db('risk', new mongo.Server('localhost', 27017, {}), {});
//console.log(db);
db.open(function() {
    db.collection('games', function(err, collection){
        //console.log(err);
        //console.log(collection);
        //console.log(collection.find());
        collection.find({}).toArray(function(err, docs) {
            console.log(docs);
        });
    });
});
