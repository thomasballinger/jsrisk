jsrisk
-----

Todo:

* learn about using the same code for server/client side 
  (since that was the point)
* Object that implements all actions, can be used to play from node cmd line
* Command line interface for playing
  (requires text display function, wrappers for input suggestion)
* Command line implementing secure moves such as attacking separately
  (requiring jsonification, reconstitution, etc)
* Graphical display of map in browser
* Graphical interaction with map in browser

Overall Plan:
Use mongrel2 to route logic requests to node, page requests to brubeck
Ideally requests are somehow routed around
make move
Get /gamelogic/northamerica/attack/12/14/3
Make all stored moves in this game
Post
/gamelogic/northamerica/attack/12/14/3

Server Authentication Plan:

Node server that talks to some kind of json-holding database, keeping
secure copies of game state.
Rest interface: get game json by name, make move
AJAX: make several moves at once from stored javascript
It responds to requests to:
  * create new game given name
    * store game
    * respond with game
  * take unsecure action given name, action
    * get stored game
    * take requested action
    * if requested action does not succeed: return failure, old game
    * add action to action history
    * respond with game
    * store game
  * show game status given name
    * get secure game based on name
    * respond with game
  * take secure action given game, action OR name
    * get stored game
    * set allow_secure_moves on game to False
    * take actions from action history of submitted game
    * if states do not match: return failure
    * discard submitted game
    * set all_secure_moves on game to True
    * take requested action
    * if requested action does not succeed: return failure
    * set allow_secure_moves status on game to False
    * set lastsecurejson to current game, stringify
    * store secure game
    * respond with game
  * save game given game
    * get stored game
    * set allow_secure_moves on game to False
    * take actions from action history of submitted game
       (do not clear history)
    * if states do not match: return stored game
    * if states match: respond with new game 
