jsrisk
-----

Todo:

* Set up authentication for node server and REST requests
  * may want something like everyauth, have to talk to node for every auth
* Learn how to hook up node.js, mongrel2 and brubeck
* Learn some brubeck, do views there

Maybe Todo:

* Write a command line interface for playing to test game
  (requires text display function, wrappers for input suggestion)
* Command line implementing secure moves such as attacking separately
  (requiring jsonification, reconstitution, etc)
* Graphical display of map in browser
* Graphical interaction with map in browser

Overall Plan:
Use mongrel2 to route logic requests to node, page requests to brubeck
Ideally requests are somehow routed around
make move

Requests routed to node.js:

* `GET /gamelogic/game/northamerica/attack/12/14/3`
  Make this authenticated move
    * get stored game
    * set allow_secure_moves on game to False
    * take actions from action history of stored game
    * set allow_secure_moves on game to True
    * take requested action
    * if requested action does not succeed: return failure
    * set allow_secure_moves status on game to False
    * set lastsecurejson to current game, stringified
    * store secure game
    * respond with game
* `POST /gamelogic/game/northamerica/attack/12/14/3`
  Make all moves stored in this game plus this move
    * get stored game
    * set allow_secure_moves on game to False
    * take actions from action history of submitted game on stored game
    * if states do not match: return failure
    * discard submitted game
    * set all_secure_moves on game to True
    * take requested action
    * if requested action does not succeed: return failure
    * set allow_secure_moves status on game to False
    * set lastsecurejson to current game, stringify
    * store secure game
    * respond with game
* `POST /gamelogic/game/northamerica/update`
  Make all moves stored in this game
* `GET /gamelogic/game/northamerica/undo`
  Responds with game from last secure string
* `GET /gamelogic/newgame/name/northamerica/`
  Responds with new game
    * store game
    * respond with game
* `GET /gamelogic/game/northamerica/reinforce/13/2`
  Responds with game with action taken
    * get stored game
    * take requested action
    * if requested action does not succeed: return failure, old game
    * add action to action history
    * respond with game
    * store game
* `GET /gamelogic/game/northamerica/`
  Responds with game
    * get secure game based on name
    * respond with game
* `POST /gamelogic/game/northamerica/update`
  * save game given game
    * get stored game
    * set allow_secure_moves on game to False
    * take actions from action history of submitted game
       (do not clear history)
    * if states do not match: return stored game
    * if states match: respond with new game 

Problem: what if several unauthenticated moves are made, but not saved,
then a rest GET for an authenticated move is made? OH WELL

Requests routed to Brubeck:
* `/`
  list all games
* `/about`
  static about page
* `/login`
  login? not sure how we're doing authentication
* `game/northamerica/play`
  page where can play game with javascript
