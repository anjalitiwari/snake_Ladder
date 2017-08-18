'use strict';
/**
 * @module models/updateScore
 * @update score of a player as per dice thrown
 * @author Anjali Tiwari <tiwari.anjali.11ce1045@gmail.com>
 */
var checkHop = require('./checkHop.js');
var findCordinates = require('./findCordinates.js');

function updateScore(player, tokenObj, dice, dimension, boardArray, boardObj, log, callback) {

    player["energy"] = player["energy"] - 1; // decreement energy of player on every dice throw

    if (player["energy"] == 0) {
        player["pos"] = [0, 0];
        player["score"] = 1;
        // if energy reaches to zero move back the player to start position
        return callback(null, player)

    } else if (player["score"] + dice == dimension && player["energy"] != 0) {
        // if players score is equal to dimension and energy is still left winner is reached 
        player["score"] = player["score"] + dice;
        tokenObj["winner"] = true;
        return callback(null, player)

    } else if (player["score"] + dice < dimension) {
        player["score"] = player["score"] + dice;
        var pos = getIndexOfK(boardArray, player["score"])
        player["pos"] = pos;

        /* call module findCordinates to find the updated position of player in board */

        findCordinates.find(boardObj, pos, function(typeObj) {
            if (typeObj["type"] != "") {

                log.debug("For player =" + player + "type is = " + typeObj["type"] + "with params = " + typeObj["typeStart"], typeObj["typeEnd"], player, dice)

                /* call module checkhop to find snake,ladder,trampolines or spring in that position */
                checkHop.check(typeObj["type"], typeObj["typeStart"], typeObj["typeEnd"], player, dice, boardArray, boardObj, log, function(err, res) {
                    if (err) {
                        log.error({
                            "err": err,
                            "message": "Error in updating score of player " + player
                        });
                        callback(err, null)
                    } else {
                        log.debug("Updated score for player " + player + "response =" + res)
                        callback(null, res)
                    }
                });

            } else {
                log.debug("No elements detected while moving")
                return callback(null, player)
            }
        });
    } else {
        log.debug("After adding dice to exiting score it goes beyond limit so do not update score for" + player + "with score" + player["score"] + dice)
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


module.exports = {
    update: updateScore,
}
