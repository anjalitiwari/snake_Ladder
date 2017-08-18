'use strict';
/**
 * Snake and ladder with trampolines,springs and much more
 * @author Anjali Tiwari <tiwari.anjali.11ce1045@gmail.com>
 */

var http = require('http');
var bunyan = require("bunyan");
var url = require('url');
var _ = require('lodash');
var requireTree = require("require-tree");
var randtoken = require('rand-token');
var createBoard = require('./models/generateBoard.js');
var createBoardElements = require('./models/generateElements.js');
var updateScore = require('./models/updateScore.js');
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
    }
]
var args = commandLineArgs(optionDefinations);
var log = bunyan.createLogger({
    name: 'myapp',
    streams: [{
            level: 'debug',
            path: '/var/log/ladder_access.log' 
        },
        {
            level: 'error',
            path: '/var/log/ladder_error.log' 
        }
    ]
});

var server = http.createServer(handler);
server.listen(args.port, "localhost", 1024, function() {
    console.log('Listening at http://0.0.0.0:' + args.port);
    console.log("*****************Game is started************************");
});
var dimension = args.sqrLen * args.sqrLen;
var finalObj = {}; // global obj to maintain state of game
var boardObj; // Object to store elements of board
var boardArray; // 2d array that array that represents board

/*initial function call when node is started*/

init();


function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    var params = url.parse(req.url, true, true).query;
    log.debug({
        "params": params
    });
    var dice = parseInt(params.dice);

    if (params.startNew) {
        // create players initial state for a game and provide a token that remains valid till game is ended
        createPlayers(params.startNew, function(token) {
            return res.end(JSON.stringify(token));
        });
    } else if (dice > 6 || dice < 1 || isNaN(dice) || dice === undefined || dice === "") {
        log.error({
            "err": "Dice value is" + params.dice,
            "message": "Invalid Dice"

        });
        var ack = {
            "code": 500,
            "message": "Dice should be between integer 1 and 6"

        }
        return res.end(JSON.stringify(ack, 500));
    } else if (params.token && finalObj[params.token]) {
        if (finalObj[params.token]["counter"] == Object.keys(finalObj[params.token]).length - 2)
            // repeat the players after the last one throws dice
            finalObj[params.token]["counter"] = 0;

        if (finalObj[params.token]["winner"]) {
            var ack = {
                "code": 200,
                "message": "We have got the winner",
                "result": finalObj[params.token]
            }
            log.debug({
                "State of game when winner is found": finalObj[params.token]
            });
            res.end(JSON.stringify(ack));
            delete finalObj[params.token];
        } else {
            var countVal = finalObj[params.token]["counter"];
            // update score of the player belonging to valid token of a game
            updateScore.update(finalObj[params.token]["player" + countVal], finalObj[params.token], dice, dimension, boardArray, boardObj, log, function(err, data) {

                if (err) {
                    log.error({
                        "err": err,
                        "message": "Failed to update score of player " + finalObj[params.token]["player" + counVal] + "" + counVal
                    });
                    res.end(500)
                } else {
                    finalObj[params.token]["counter"] = finalObj[params.token]["counter"] + 1; // increement counter for to associate dice with next player
                    log.debug({
                        "state of finalObj is": finalObj[params.token]
                    })
                    return res.end(JSON.stringify(finalObj[params.token]));
                }

            });
        }
    } else {

        var ack = {
            "code": 500,
            "message": "Token is invalid or game is ended for that token"
        }
        return res.end(JSON.stringify(ack))

    }
}

/**
 * Create Players for a game 
 * @description generate list of players as per numbers requested against a unique token
 * @param Number NUmber of players provided by client in one game
 * @returns token response - token valid for that game
 */

function createPlayers(num, callback) {
    var token = randtoken.generate(16);
    if (!finalObj[token]) {
        finalObj[token] = {};
        finalObj[token]["counter"] = 0;
        finalObj[token]["winner"] = false;
    }
    for (var i = 0; i < num; i++) {
        if (!finalObj[token]["player" + i]) {
            finalObj[token]["player" + i] = {}
            finalObj[token]["player" + i]["pos"] = [0, 0];
            finalObj[token]["player" + i]["score"] = 1;
            finalObj[token]["player" + i]["energy"] = parseInt(100 / 3);
        }
        log.debug({
            "message": "player list obj created",
            "data": finalObj
        });
    }
    log.debug({"finalObj":finalObj});
    callback(token)
}

/**
 * Create Board and Elements that is snake,ladder,spring and trampolines
 * @description generate  Board and Elements as per dimension of 2d array provided by client
 * @param Number length of square board by client
 */

function init() {
    createBoard.create(args.sqrLen, log, function(err, resp) {
        if (err) {
            log.error({
                "err": err,
                "message": "Failed to create board"
            })

        } else {
            boardArray = resp.boardArray;
            createBoardElements.create(args.sqrLen, boardArray, log, function(err, resp) {
                if (err) {
                    log.error({
                        "err": err,
                        "message": "Failed to create board"
                    });

                } else {
                    boardObj = resp.boardObj;
                }
            });
        }
    })
}
