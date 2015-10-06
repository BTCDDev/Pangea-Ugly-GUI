/**
 * Created by _mr_e on 05/10/15.
 */
var http = require('http');

var supernet = require("./supernet-api");

module.exports.init = function(io){
    io.sockets.on('connection', function(socket){
        console.log("server connected");

        socket.emit("connection");

        //listen for client messages
        socket.on("message", function(message){
            console.log(message);

            var response = JSON.parse(message);

            var action = Object.keys(response.action)[0];
            apiHandlers[action](response.action[action]);
        });
    });
};

function setup(){

}

var apiHandlers = {
    "join": function(parm){

    }
}