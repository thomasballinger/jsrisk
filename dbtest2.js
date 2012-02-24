var database = require('./database.js');
database.connect();
console.log("Just finished initializing client");
database.getAllGameNames(function(names){
    console.log(names);
});
database.getAllGameNames(function(names){
    database.getGameByName(names[0], function(x){console.log(x)})
});
