'use strict';
/**
 * @module models/generateElements
 * @generate co-ordinates of elements in board that is snake,ladder,trampolines and spring
 * @author Anjali Tiwari <tiwari.anjali.11ce1045@gmail.com>
 */
var _ = require('lodash');
var async = require('async');
var obj = {};
var start = [];
var end = [];

function create(n,array,log, callback) {

            var hopElements = ["snake", "ladder", "trampolines", "spring"];
            var count = 0;
            var boardObj = {};
            for (var i = 0; i < hopElements.length; i++) {
                var count = count + n
                generateElements(array, n, n, count, hopElements[i], function(err, resp) {
                    boardObj[hopElements[i]] = resp;
                })

            }
            var json = {
	     "boardObj" : boardObj,
            }
            return callback(null,json);
         
    }

function generateElements(array, rows, cols, count, element,callback) {
    
    var element = {};
    for (var i = count; i <= count + rows; i++) {
        var rand1 = Math.floor(Math.random() * array.length);
        var rand2 = Math.floor(Math.random() * array.length);
        var rand3 = Math.floor(Math.random() * array.length);
        var rand4 = Math.floor(Math.random() * array.length);
        var key = rand1 + ":" + rand2 + ":" + rand3 + ":" + rand4;
        if (!obj[key]) {
            obj[key] = true
           /*check for having unique co-ordinates with placement on board as per game rules*/
            if ((!element[key]) && (rand1 != rand2) && (rand3 != rand4) && (rand1 != rand3) && (rand3 != rand4)) {
                start.push(rand1);
                end.push(rand2);
                element[key] = {};
                if(rand1 < rand3){
                element[key]["start"] = [rand1,rand2];
                 element[key]["end"] =[rand3,rand4];
              } else {
		 element[key]["start"] = [rand3,rand4];
                 element[key]["end"] =[rand1,rand2];

               }
            }
        }
    }
    callback(null, element)
}


module.exports = {
    create:create
}
