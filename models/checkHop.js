'use strict';
var updateScore = require('./updateScore.js');

function checkHop(type, start, end, player, dice,boardArray,boardObj,callback) {
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
            updateForTramSpr(player,dice,boardObj, function(err, updatedPlayer) {
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
            updateForTramSpr(player, dice, boardObj,function(err, updatedPlayer) {
                if (!err) {
                    player = updatedPlayer
                }
            })
            return callback(null, player)

    }
}

function updateForTramSpr(player,dice,boardObj,callback){

 updateScore.findCordinates(boardObj,player["pos"],function(typeObj){
 if(typeObj["type"] != ""){
 checkHop.check(typeObj["type"], typeObj["typeStart"], typeObj["typeEnd"], player, dice, function(err, res) {
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

      callback(null, player)
    }
  });
}

module.exports = {
 check:checkHop
}
