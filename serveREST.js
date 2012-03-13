var express = require('express');

var risk = require('./risk');
var util = require('./util');
var database = require('./database')
var restActions = require('./restActions')

var app = express.createServer();

app.configure(function(){
    app.use(app.router);
    app.use(express.errorHandler({
        dumpExceptions: true, showStack: true}));
    app.use(express.bodyParser());
});
app.get('/', function(req, res, next){
    database.getAllGameJsonNames(function(names){res.send(names);});
});

// todo
app.get('/login', function(){})

// These are basic storage and retrival, for testing only
// the post one should be disabled later
app.get('/gamestorage/game/:name', function(req, res, next){
    console.log('received request for game '+req.params.name);
    database.getGameJsonByName(req.params.name, function(game){res.send(game);});
});
app.post('/gamestorage/game/:name', function(req, res){
    storeGameByName(req.params.name, req.body)
    res.send(req.body);
});


// These are used for taking user-authorized actions
// They all require associated user and auth


app.get('/gamelogic/game/:game/:action/:args/:go/:here')
//  Make this authenticated move
//    * get stored game
//    * set allow_secure_moves on game to False
//    * take actions from action history of stored game
//    * set allow_secure_moves on game to True
//    * take requested action
//    * if requested action does not succeed: return failure
//    * set allow_secure_moves status on game to False
//    * set lastsecurejson to current game, stringified
//    * store secure game
//    * respond with game

app.post('/gamelogic/game/:game/:action/:args/:go/:here')
//  Make all moves stored in this game plus this move
//    * get stored game
//    * set allow_secure_moves on game to False
//    * take actions from action history of submitted game on stored game
//    * if states do not match: return failure
//    * discard submitted game
//    * set all_secure_moves on game to True
//    * take requested action
//    * if requested action does not succeed: return failure
//    * set allow_secure_moves status on game to False
//    * set lastsecurejson to current game, stringify
//    * store secure game
//    * respond with game

// Responds with game from last secure string
app.get('/gamelogic/game/:game/undo')

// Create new default game
app.get('/gamelogic/game/newgame/name/:name')
//  Responds with new game
//    * store game
//    * respond with game

// Variable number of args go here
app.get('/gamelogic/game/:game/:action/:args/:go/:here')
//  Responds with game with action taken
//    * get stored game
//    * take requested action
//    * if requested action does not succeed: return failure, old game
//    * add action to action history
//    * respond with game
//    * store game

app.post('/gamelogic/game/:game/update')
// make all moves stored in this game (just to see if they work)
//  store it, but don't flush clear move history or update 
//  saved secure state
//
//  * save game given game
//    * get stored game
//    * set allow_secure_moves on game to False
//    * take actions from action history of submitted game
//       (do not clear history)
//    * if states do not match: return stored game
//    * if states match: respond with new game 

app.get('/gamelogic/game/:game/')
// just get for display purposes

app.get('/404', function(req, res) {
    res.send('NOT FOUND '+req.url);
});

if (!module.parent) {
    var port = 8124
    app.listen(port);
    console.log('listening at '+port)
} else {
    exports.app = app;
}
