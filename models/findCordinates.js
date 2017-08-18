'use strict';
/**
 * @module models/ findCordinates
 * @find coordinates in board that matches position of player
 * @author Anjali Tiwari <tiwari.anjali.11ce1045@gmail.com>
 */
function findCordinates(boardObj,pos,callback){
    var type = "";
    var typeStart = "";
    var typeEnd = "";
    var co_Obj = {}

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
   var json = {
   "type" : type,
   "typeStart" : typeStart,
   "typeEnd": typeEnd
   }
  return callback(json)
}

module.exports={
 find:findCordinates
}
