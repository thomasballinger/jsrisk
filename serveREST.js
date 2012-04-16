var express = require('express');

var risk = require('./risk');
var util = require('./util');
var database = require('./database');
var restActions = require('./restActions');

var app = express.createServer();

app.configure(function(){
    //app.use(express.errorHandler({
    //    dumpExceptions: true, showStack: true}));
    app.use(express.bodyParser());
	app.use(express.cookieParser('secret'));
	app.use(express.session({secret: "keyboard cat"}));
    app.use(app.router);
});
app.get('/', function(req, res, next){
    database.getAllGameJsonNames(function(names){res.send(names);});
});
app.all('/gamelogic/*', function(req, res, next){
    //console.log('request for /gamelogic/*, therefore requiring authentication!');
    if (req.session === undefined || req.session.user === undefined){
        //console.log(' ...but they weren\'t logged in!')
        res.send('you must login first! <a href="/login"> login </a>', 403);
    } else {
        next();
    }
});

app.get('/login', function(req, res, next){
	//console.log('served login page');
	res.send('<html><form action="/login" method="POST">user name: <input type="text" name="user" /></form></html>');
});
app.post('/login', function(req, res, next){
	req.session.user = req.body.user;
	res.send('<html>Your name is '+req.body.user+'!</html>');
    //console.log('just logged in '+req.body.user);
    //res.redirect('back');
});

// UNTESTED! Unknown how this actually behaves
app.get('/logout', function(req, res, next){
    req.session.user = undefined;
	//console.log('cleared session data field "user"');
	res.send('<html>You are no longer logged in.</html>');
});

// These are basic storage and retrival, for testing only
// the post one should be disabled later
app.get('/gamestorage/game/:name', function(req, res, next){
    //console.log('received request for game '+req.params.name);
    //console.log('made it here');
    database.getGameJsonByName(req.params.name, function(game){
        if (game === undefined){
            //console.log('game "'+req.params.name+'" not found');
            res.send('game not found', 404);
        } else {
            res.send(game);
        }
    });
});
app.post('/gamestorage', function(req, res){
    //console.log('received request to store game');
    database.storeGameJson(req.body,
        function(){
            res.send('game already exists');
        },
        function(){
            res.send('game successfully stored');
        }
    );
});
app.get('/gamestorage/games', function(req, res, next){
    database.getAllGameJsonNames(function(names){res.send(names);});
});

// All actions below are for taking user-authorized actions
// They all require associated user and auth

app.get('/gamelogic/game/:name', function(req, res, next){
    var user = req.session.user;
    //console.log('received request for game '+req.params.name);
    //console.log('from user:', user);
    database.getGameJsonByName(req.params.name, function(game_json){
        if (game_json === undefined){
            //console.log('game "'+req.params.name+'" not found');
            res.send('game not found', 404);
        } else {
            if (game_json.players.indexOf(user) == -1){
                res.send('you are not participating in that game', 401);
            } else {
                res.send(game_json);
            }
        }
    });
});

app.post('/gamelogic/game/:game/update', function(req, res, next){
    var user = req.session.user;
    var gamename = req.params.game;
    var gamejson = req.body;
    if (gamename != gamejson.name){
        consle.log('game name and post data game name do not match');
        res.send('game name and post data game name do not match');
    } else {
        restActions.updateGame(user, gamejson,
            function(game){
                if (game){
                    //console.log('game update succeeded');
                    res.send(game.toJson());
                } else {
                    //console.log('game update failed');
                    res.send('game update failed', 403);
                }
            }
        );
    }
});

var takeAction = function(req, res, next, argArray){
    var user = req.session.user;
    var gamename = req.params.game;
    restActions.getGameAndMakeMove(user, gamename, argArray,
        function(){
            //console.log('move failed');
            res.send('move failed!', 403);
        },
        function(game){
            //console.log('move succeeded');
            res.send(game.toJson());
        }
    );
};
app.get('/gamelogic/game/:game/:arg0/:arg1/:arg2/:arg3', function(req, res, next){
    var argArray = [req.params.arg0, req.params.arg1, req.params.arg2, req.params.arg3];
    takeAction(req, res, next, argArray);
});
app.get('/gamelogic/game/:game/:arg0/:arg1/:arg2', function(req, res, next){
    var argArray = [req.params.arg0, req.params.arg1, req.params.arg2];
    takeAction(req, res, next, argArray);
});
app.get('/gamelogic/game/:game/:arg0/:arg1', function(req, res, next){
    var argArray = [req.params.arg0, req.params.arg1];
    takeAction(req, res, next, argArray);
});
app.get('/gamelogic/game/:game/:arg0', function(req, res, next){
    var argArray = [req.params.arg0];
    takeAction(req, res, next, argArray);
});

var updateAndTakeAction = function(req, res, next, argArray){
    var user = req.session.user;
    var gamename = req.params.game;
	if (gamename != req.body.name){
		//console.log('update url game name does not match post data game name');
		res.send('update url game name does not match post data game name', 400);
	} else {
		restActions.updateGameAndMakeMove(user, req.body, argArray,
			function(){
				//console.log('move failed');
				res.send('move failed!', 403);
			},
			function(game_json){
				//console.log('move succeeded');
				res.send(game_json);
			}
		);
	}
};
app.post('/gamelogic/game/:game/:arg0/:arg1/:arg2/:arg3', function(req, res, next){
    var argArray = [req.params.arg0, req.params.arg1, req.params.arg2, req.params.arg3];
    updateAndTakeAction(req, res, next, argArray);
});
app.post('/gamelogic/game/:game/:arg0/:arg1/:arg2', function(req, res, next){
    var argArray = [req.params.arg0, req.params.arg1, req.params.arg2];
    updateAndTakeAction(req, res, next, argArray);
});
app.post('/gamelogic/game/:game/:arg0/:arg1', function(req, res, next){
    var argArray = [req.params.arg0, req.params.arg1];
    updateAndTakeAction(req, res, next, argArray);
});
app.post('/gamelogic/game/:game/:arg0', function(req, res, next){
    var argArray = [req.params.arg0];
    updateAndTakeAction(req, res, next, argArray);
});

// Responds with game from last secure string
app.get('/gamelogic/game/:game/undo', function(req, res, next){
    res.send('not implemented!', 503);
    //console.log('responding with one less move on queue is not implemented!');
});

// Create new default game
app.post('/gamelogic/game/newgame');
//  Responds with new game
//    * receives json spec describing game structure
//    * fail if game name already exists
//    * store game
//    * respond with game

if (!module.parent) {
    var port = 8124;
    util = require('./util');
    database = require('./database');
    database.collection('games', function(err, collection){
        util.clearDatabase(collection, function(){
            util.insertGame(util.createGame('test', ['tom', 'ryan']), collection, function(){
                util.insertGame(util.createRandomBasicGame(), collection, function(){
                    util.insertGame(util.createRandomBasicGame(), collection, function(){
                        util.insertGame(util.createRandomBasicGame(), collection, function(){
                            util.insertGame(util.createRandomBasicGame(), collection, function(){
                                app.listen(port);
                                console.log('listening at '+port);
                            });
                        });
                    });
                });
            });
        });
    });
} else {
    exports.app = app;
}
