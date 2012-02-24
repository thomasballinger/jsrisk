jsrisk
-----

Todo:

* learn some mongodb and get it storing data
* basic REST requests in node - update and retrieve
* Set up authentication for node server and REST requests
  * may want something like everyauth, have to talk to node for every auth
* implement rest of REST queries
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
Use mongrel2 to route logic requests to node, page requests to brubeck.
node will talk to mongodb for storing gamelogic.

Requests routed to node.js
---------------------------
These are just database wrappers - is this even a good idea?
Does this abstraction gain us anything at all?  Should other methods
call these by url, or just call the methods directly?

* `GET /gamestorage/game/northamerica/`
  Responds with game
    * get secure game based on name
    * respond with game
    * this URL should be used to get
* `POST /gamestorage/game/northamerica/`
  Update with json
    * Check for authentication - this should be one of our own
        talking to another of our own - dev secret required
    * this URL should be used by other views to store

These are more interesting, have to implement logic

* `GET /gamelogic/game/northamerica/attack/12/14/3`
  Make this move of any kind
    * get stored game
	* if move is safe:
        * set allow_secure_moves on game to False
        * take requested action
        * if requested action does not succeed: return failure
    * else (move is unsafe)
		* set allow_secure_moves status on game to True
        * take requested action
        * if requested action does not succeed: return failure
        * set lastsecurejson to current game, stringified
		* set allow_secure_moves status on game to False
    * store game
    * respond with game
* `POST /gamelogic/game/northamerica/update`
    * get stored secure game
    * set allow_secure_moves on game to False
    * take all actions in POSTed action history
    * if requested actions do not succeed: return failure
	* store game
	* return True
* `POST /gamelogic/game/northamerica/attack/12/14/3`
  Make all moves stored in this game plus this move
    * get stored secure game
    * set allow_secure_moves on game to False
    * take actions from action history of submitted game on game
    * if states do not match: return failure
    * discard submitted game
    * set all_secure_moves on game to True
    * take requested action
    * if requested action does not succeed: return failure
    * set allow_secure_moves status on game to False
    * set lastsecurejson to current game, stringify
    * store secure game
    * respond with game
* `GET /gamelogic/game/northamerica/undo`
  Responds with game with all moves but the last made
* `GET /gamelogic/newgame/name/northamerica/`
  Responds with new game
    * store game
    * respond with game

Requests routed to Brubeck:
* `/`
  list all games
* `/about`
  static about page
* `/login`
  login? not sure how we are doing authentication
* `game/northamerica/play`
  page where can play game with javascript
