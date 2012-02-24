var express = require('express');

var risk = require('./risk');
var util = require('./util');
var database = require('./database')

database.connect()

var app = express.createServer();

app.configure(function(){
    app.use(app.router);
    app.use(express.errorHandler({
        dumpExceptions: true, showStack: true}));
    app.use(express.bodyParser());
});
app.get('/', function(req, res, next){
    database.getAllGameNames(function(names){res.send(names);});
});
app.get('/login', function(){})
// These are basic storage and retrival, for testing only
app.get('/gamestorage/game/:name', function(req, res, next){
    console.log('received request for game '+req.params.name);
    database.getGameByName(req.params.name, function(game){res.send(game);});
});
app.post('/gamestorage/game/:name', function(req, res){
    storeGameByName(req.params.name, req.body)
    res.send(req.body);
});
// These are used for taking user-authorized actions
app.post('/gamelogic/game/:game/')
app.get('/404', function(req, res) {
    res.send('NOT FOUND '+req.url);
});

var createNewBasicGame = function(){
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

var port = 8124
app.listen(port);
console.log('listening at '+port)
