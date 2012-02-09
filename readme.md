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


Server Authentication Plan:

Node server that talks to some kind of json-holding database, keeping
secure copies of game state. It responds to requests to:
  * create new game given name
    * store game
    * respond with game
  * take secure action given game, action
    * get stored game
    * set allow_secure_moves on game to False
    * take actions from action history of submitted game
    * if states do not match: return failure
    * discard submitted game
    * set all_secure_moves on game to True
    * take requested action
    * if requested action does not succeed: return failure
    * set allow_secure_moves status on game to False
    * store secure copy
    * respond with copy
  * show game status given name
    * get secure game based on name
    * respond with game
  * save game given game
    * like take secure action, but no action to take
    * get stored game
    * set allow_secure_moves on game to False
    * take actions from action history of submitted game
    * if states do not match: return stored game
    * if states match: return 
