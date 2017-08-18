Run npm install

Run node main.js -p <port> -s <sqrLen>

Default port is 8976 and sqrLen is 10 that 10*10 board

curl -X POST "http://127.0.0.1:8976/apis/snakeladder/snakeladder?startNew=5" | jq

The above http request from client will initiate a game with 5 players

The response will be a token which will be used in entire game
eg - "KhtsD3QMmpG4d32E"

curl -X POST "http://127.0.0.1:8976/apis/snakeladder/snakeladder?dice=5&token=""KhtsD3QMmpG4d32E""" | jq

The above http request will provide dice count for players in sequence

The response will be a json object representing the state of that game

eg - {
  "counter": 3,
  "winner": false,
  "player0": {
    "pos": [
      9,
      5
    ],
    "score": 6,
    "energy": 28
  },
  "player1": {
    "pos": [
      9,
      9
    ],
    "score": 10,
    "energy": 28
  },
  "player2": {
    "pos": [
      9,
      9
    ],
    "score": 10,
    "energy": 28
  },
  "player3": {
    "pos": [
      9,
      4
    ],
    "score": 5,
    "energy": 29
  },
  "player4": {
    "pos": [
      9,
      4
    ],
    "score": 5,
    "energy": 29
  }
}
