/**
 * Created by _mr_e on 05/10/15.
 */

var supernet = require("../../dogeapi");

module.exports.startTable = function(){
    supernet.SuperNET('{"plugin":"InstantDEX","method":"orderbook","base":"BTCD","exchange":"pangea","allfields":1}', function(err, data){
        console.log(data);
        //socket.emit('pangeaLobbyRes', data);
    });
}