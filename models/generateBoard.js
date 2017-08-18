'use strict';
/**
 * @module models/generateBoard
 * @create 2d array with zig-zag numbers placed as in actual board
 * @author Anjali Tiwari <tiwari.anjali.11ce1045@gmail.com>
 */

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
           return callback(errAck, null)
        } else {
            var json = {
	     "boardArray" : array
            }
           return callback(null,json);
        }

    });
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
    create : create
}
