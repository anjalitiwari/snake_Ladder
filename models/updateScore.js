'use strict';

var checkHop = require('./checkHop.js');

function updateScore(player, dice, dimension,boardArray,boardObj,log,callback) {
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

        findCordinates(boardObj,pos,function(typeObj){
        if (type != "") {
            log.debug("For player =" + player + "type is = "+ type + "with params = "+  typeStart, typeEnd, player, dice)
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
            log.debug("No elements detected while moving")
            return callback(null, player)
        }
      });
    } else {
        log.debug("After adding dice to exiting score it goes beyond limit so do not update score for"+ player +"with score" + player["score"] + dice)
        return callback(null, player)
    }
}

function findCordinates(boardObj,pos,callback){
    var type = "";
    var typeStart = "";
    var typeEnd = "";
    var co_Obj = {}

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
   var json = {
   "type" : type,
   "typeStart" : typeStart,
   "typeEnd": typeEnd
   }
  return callback(json)

}

module.exports = {
  updateScore:updateScore,
  findCordinates:findCordinates
}
