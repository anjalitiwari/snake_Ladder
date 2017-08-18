'use strict';
/**
 * @module models/checkHop
 * @check whether snake,ladder,trampolines or snake is found in board
 * @author Anjali Tiwari <tiwari.anjali.11ce1045@gmail.com>
 */


var updateScore = require('./updateScore.js');
var findCordinates = require('./findCordinates.js');

function checkHop(type, start, end, player, dice,boardArray,boardObj,log,callback) {

    /*switch cases for handling all elements type in board*/

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
            // in this case again verify position after increementing score with dice  thrown
            updateForTramSpr(player,dice,boardArray,boardObj,log, function(err, updatedPlayer) {
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
            // in this case again verify position after decreementing score with dice  thrown
            updateForTramSpr(player, dice,boardArray, boardObj,log,function(err, updatedPlayer) {
                if (!err) {
                    player = updatedPlayer
                }
            })
            return callback(null, player)

    }        
}

/**
 * Check position of landing square
 * @description Check if landing position is snake, ladder,trampolines or spring again
 * @param String player - current player
 * @param Integer dice - dice value
 * @param Array boardArray - 2d board array
 * @param {Object} boardObj - Elements in board
 * @returns {Object} updated player
 */



function updateForTramSpr(player,dice,boardArray,boardObj,log,callback){
  /* call module findCordinates to find the updated position of player in board */
 findCordinates.find(boardObj,player["pos"],function(typeObj){
 if(typeObj["type"] != ""){
 /*Again call checkhop function if updated position matches in boardobj */
 checkHop(typeObj["type"], typeObj["typeStart"], typeObj["typeEnd"], player, dice,boardArray,boardObj,log, function(err, res) {
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

function getIndexOfK(arr, k) {
    for (var i = 0; i < arr.length; i++) {
        var index = arr[i].indexOf(k);
        if (index > -1) {
            return [i, index];
        }
    }
}


module.exports = {
 check:checkHop
}
