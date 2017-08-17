var http = require('http');
var bunyan = require("bunyan");
var url = require('url');
var _ = require('lodash');
var requireTree = require("require-tree");

var createBoard = require('./models/generateBoard.js');
var createBoardElements = require('./models/generateElements.js');

var commandLineArgs = require('command-line-args');
var optionDefinations = [{
        name: 'port',
        alias: 'p',
        type: Number,
        defaultValue: 8976
    },
    {
        name: 'sqrLen',
        alias: 's',
        type: Number,
        defaultValue: 10
    },
    {
        name: 'players',
        alias: 'n',
        type: Number,
        defaultValue: 5
    }
]
var args = commandLineArgs(optionDefinations);
var log = bunyan.createLogger({
  name: 'myapp',
  streams: [
    {
      level: 'debug',
      path: '/var/log/ladder_access.log'            // log INFO and above to stdout 
    },
    {
      level: 'error',
      path: '/var/log/ladder_error.log'  // log ERROR and above to a file 
    }
  ]
});

var server = http.createServer(handler);
server.listen(args.port, "localhost", 1024, function() {
    console.log('Listening at http://0.0.0.0:' + args.port);
});
var dimension = args.sqrLen * args.sqrLen;
var players = {};
var boardObj;
var boardArray;
var finalObj = {};
finalObj["winner"] = "";
var counter = 0;
for (var i = 0; i < args.players; i++) {
    if (!finalObj["player" + i]) {
        finalObj["player" + i] = {}
        finalObj["player" + i]["pos"] = [0, 0];
        finalObj["player" + i]["score"] = 1;
        finalObj["player" + i]["energy"] = parseInt(100 / 3);
    }
        log.debug({
		"message": "player list obj created",
                 "data" : finalObj
                });
}

init();

function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    log.debug("counter before call = " + counter + "for the player = " + args.players)
    var params = url.parse(req.url, true, true).query;
    var dice = parseInt(params.dice);
    log.debug({"dice number" : dice})
    if(params.board){
       var resJson = {
        "boardArray" : boardArray,
        "boardObj" : boardObj
        }
       
       return res.end(JSON.stringify(resJson));
    }
       else if(dice > 6 || dice < 1 || isNaN(dice) || dice===undefined || dice==="" ){
      log.error({
        "err": "Dice value is" + params.dice,
        "message": "Invalid Dice" 

     });
     var ack = {
      "code" : 500,
      "message" : "Dice should be between integer 1 and 6"

      }
     return res.end(JSON.stringify(ack,500));
    } 
    else if(finalObj["winner"] != ""){
	var ack = {
          "code":200,
          "message": "We have got the winner",
          "result" : finalObj
        }
       log.debug({"State of game when winner is found" : finalObj});
       return res.end(JSON.stringify(ack));
    }
    else if(counter == args.players) {
        counter = 0;
     }
    log.debug("Which player has thrown the dice = " + "player" + counter);
    updateScore(finalObj["player" + counter], dice , function(err, data) {

        if (err) {
            log .error({
	    "err" : err,
            "message" : "Failed to update score of player " + player + "" + counter
            });
            res.end(500)
        } else {
            counter++
            log.debug({
	     "state of finalObj is" : finalObj 
           })
            res.end(JSON.stringify(finalObj));
        }

    });
 }

function updateScore(player, dice, callback) {
    log.debug("After adding dice for " + player["score"] + dice + "with dimension = " + dimension);
    player["energy"] = player["energy"] - 1;
    if (player["score"] + dice == dimension && player["energy"] != 0) {
        player["score"] = player["score"] + dice;
        finalObj["winner"] = player
        return callback(null, player)
    }
    if (player["score"] + dice < dimension) {
        player["score"] = player["score"] + dice;
        var pos = getIndexOfK(boardArray, player["score"])
        player["pos"] = pos;
        var type = "";
        var typeStart = "";
        var typeEnd = "";
        for (var j in boardObj) {
            console.log(j, "***************************")
            var key = j
            var data = boardObj[j];
            for (var k in data) {
                console.log(data[k]["start"], "______________", pos, data[k]["start"], data[k]["end"], "---------", data[k]["start"][0] == pos[0], data[k]["start"][1] == pos[1]);
                if (data[k]["start"][0] == pos[0] && data[k]["start"][1] == pos[1] && key != "ladder") {
                    type = key
                    typeStart = data[k]["start"];
                    typeEnd = data[k]["end"];
                    break;
                } else if (data[k]["end"][0] == pos[0] && data[k]["end"][1] == pos[1] && key == "ladder") {
                    type = key
                    typeStart = data[k]["end"];
                    typeEnd = data[k]["start"];
                    break;

                }
            }
           
            if (type != "")
                break;
        }
        if (type != "") {
            log.debug("For player =" + player + "type is = "+ type + "with params = "+  typeStart, typeEnd, player, dice)
            checkHop(type, typeStart, typeEnd, player, dice, function(err, res) {
               if(err){
                log.error({
		  "err" : err,
		  "message" : "Error in updating score of player " + player
		});
                callback(err,null)
                } else {
                log.debug("Updated score for player " + player + "response =" +res)
                callback(null, res)
                }
            });

        } else {
	    log.debug("No elements detected while moving")            
            return callback(null, player)

        }
    } else {
        log.debug("After adding dice to exiting score it goes beyond limit so do not update score for"+ player +"with score" + player["score"] + dice)
        return callback(null, player)
    }
}

function checkHop(type, start, end, player, dice, callback) {
    console.log(boardArray);
    console.log(type, start, end, player, dice, boardArray.indexOf[3, 5]);
    console.log(boardArray[end[0]][end[1]], "**********************");
    switch (type) {

        case "snake":
            player["score"] = boardArray[end[0]][end[1]];
            var pos = getIndexOfK(boardArray, player["score"])
            player["pos"] = pos;
            return callback(null, player)


        case "ladder":
            player["score"] = boardArray[end[0]][end[1]];
            var pos = getIndexOfK(boardArray, player["score"])
            player["pos"] = pos;
            return callback(null, player)

        case "trampolines":
            player["score"] = player["score"] + dice;
            var pos = getIndexOfK(boardArray, player["score"])
            player["pos"] = pos;
            updateForTramSpr(player, dice, function(err, updatedPlayer) {
                if (!err) {
                    player = updatedPlayer
                }
            });
            return callback(null, player)


        case "spring":
            if (player["score"] - dice >= 0) {
                player["score"] = player["score"] - dice;
                player["pos"] = getIndexOfK(boardArray, player["score"]);
            } else {
                player["score"] = 1;
                player["pos"] = [0, 0];
            }
            updateForTramSpr(player, dice, function(err, updatedPlayer) {
                if (!err) {
                    player = updatedPlayer
                }
            })
            return callback(null, player)

    }
}

function updateForTramSpr(player, dice, callback) {
    log.debug("In Function updateForTramSpr for player " + player)
    console.log("in update fro tram or spring", player)
    var pos = player["pos"];
    var type = "";
    var typeStart = "";
    var typeEnd = "";
    for (var j in boardObj) {
        var key = j
        var data = boardObj[j];
        for (var k in data) {
            if (data[k]["start"][0] == pos[0] && data[k]["start"][1] == pos[1] && key != "ladder") {
                type = key
                typeStart = data[k]["start"];
                typeEnd = data[k]["end"];
                break;
            } else if (data[k]["end"][0] == pos[0] && data[k]["end"][1] == pos[1] && key == "ladder") {
                type = key
                typeStart = data[k]["end"];
                typeEnd = data[k]["start"];
                break;

            }

        }
        if (type != "")
            break;
    }
    if (type != "") {
        log.debug("Again call to checkhop from updateForTramSpr for player"+ player)
        checkHop(type, typeStart, typeEnd, player, dice, function(err, res) {
            return callback(null, res)
        });

    } else {
        return callback(null, player)
    }
}

function getIndexOfK(arr, k) {
    for (var i = 0; i < arr.length; i++) {
        var index = arr[i].indexOf(k);
        if (index > -1) {
            return [i, index];
        }
    }
}

function init() {
    createBoard.create(args.sqrLen,log,function(err, resp) {
        if (err) {
           log.error({
		"err" : err,
		"message" : "Failed to create board"
         })
         
        } else {
        boardArray = resp.boardArray;
        createBoardElements.create(args.sqrLen,boardArray,log,function(err, resp) {
                if (err) {
           log.error({
                "err" : err,
                "message" : "Failed to create board"
         });

        } else  {
            boardObj = resp.boardObj;
            console.dir(boardObj,{depth:100})
             }
          });
        }
    })
}
