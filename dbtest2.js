var database = require('./database.js');
database.connect();
console.log("Just finished initializing client");
database.getAllGameNames(function(names){
    database.getGameByName(function(){})
});
