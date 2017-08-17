'use strict';
var _ = require('lodash');
var async = require('async');
var obj = {};
var start = [];
var end = [];

function create(n,log, callback) {
    matrix(n, n, function(err, array) {
        if (err) {
            const errAck = {
                "code": 500,
                "message": "failed to create 2d array"
            }
            callback(errAck, null)
        } else {
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
	     "boardArray" : array
            }
            callback(null,json);
        }

    });
}

function generateElements(array, rows, cols, count, element,callback) {
    console.log("----------in generate elements------------", count, element)
    var element = {};
    for (var i = count; i <= count + rows; i++) {
        var rand1 = Math.floor(Math.random() * array.length);
        var rand2 = Math.floor(Math.random() * array.length);
        var rand3 = Math.floor(Math.random() * array.length);
        var rand4 = Math.floor(Math.random() * array.length);
        var key = rand1 + ":" + rand2 + ":" + rand3 + ":" + rand4;
        if (!obj[key]) {
            obj[key] = true
            if ((!element[key]) && (rand1 != rand2) && (rand3 != rand4) ) {
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


function matrix(rows, cols, callback) {

    var arr = [];
    var counter = rows * rows;
    // Creates all lines:
    for (var i = 0; i < rows; i++) {
        // Creates an empty line
        arr.push([]);
        // Adds cols to the empty line:
        arr[i].push(new Array(cols));
        for (var j = 0; j < cols; j++) {
            // Initializes:
            arr[i][j] = counter;
            counter = counter -1;
         }
    if(i%2 != 0) 
    arr[i].reverse();   
 }
    
    callback(null, arr);
}

module.exports = {
    create: create
}
