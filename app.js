
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');

var http = require('http');
var path = require('path');
var app = express();


var doge=require("./dogeapi");


// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}
console.log('BitcoinDark Simple Info Starting');

var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(app.get('port'), function(err, result){
    console.log('Express server listening on port ' + app.get('port'));
});

app.get('/', function(req,res){
	res.render('index');
	});	

app.get('/rosetta', function(req,res){
	res.render('rosetta');
	});	

app.get('/table/:tableID', function(req,res){
	    res.render('table', {tableid: req.params.tableID});
	});	

//Std functions///////////////

app.get('/totalbtcd', function(req, res){
	doge.getinfo(function(err, result){
console.log("err:"+err+" result:"+result);
		if(err)
			res.send(err);
		else{
			var money = result.moneysupply.toString();	
			res.send(money);
		}
	});
});	
	
app.get('/blockcount', function(req,res){
	doge.getinfo(function(err, result){
		if(err)
			res.send(err);
		else{
		var blocks = result.blocks.toString();	
		res.send(blocks);
		}
	});	
});
app.get('/difficulty', function(req,res){
	doge.getDifficulty(function(err, result){
		if(err)
			res.send(err);
		else
			res.send(result);
	});
});	

app.get('/getblockhash/:index', function(req, res){
	doge.getblockhash(parseInt(req.params.index), function(err, hash){
		if(err)
			res.send(err);
		else
			res.send(hash);
	});
});

app.get('/getblock/:hash', function(req, res){
	doge.getblock(req.params.hash, function(err, data){
		if(err)
			res.send(err);
		else
			res.render('block', data);
	});
});


app.get('/gettx/:txid', function(req, res){

	doge.gettransaction(req.params.txid, function(err, data){
		if(err)
			res.send("Error parsing transaction id");
		else
			res.render('tx', data);
	});


});


//SuperNET functions///////////////


app.get('/getpeers', function(req, res){
	doge.SuperNET('{"requestType":"getpeers"}', function(err, data){
		if(err)
			console.log("err: " + err);
		else
			res.render('getpeers',{peers:JSON.parse(data).peers});
	});
});

app.get('/ramstatus', function(req, res){
	doge.SuperNET('{"requestType":"ramstatus", "coin":"BTCD"}', function(err, data){
		if(err)
			console.log("err: " + err);
		else
			res.render('ramstatus', {status: data});
	});
});

app.get('/getaddr/:addr', function(req, res){
	doge.SuperNET('{"requestType":"ramrawind", "type": "addr", "string": "' + req.params.addr + '"}', function(err, data){
		if(err)
			console.log("err: " + err);
		else
			res.render('getaddr', {addr: JSON.stringify(data)});
	});
});

app.get('/getRamtx/:txid', function(req, res){
	doge.SuperNET('{"requestType":"ramrawind", "destip":"127.0.0.1", "port": "14632", "coin":"BTCD", "type": "txid", "string": "' + req.params.txid + '"}', function(err, data){
		if(err)
			console.log("err: " + err);
		else
			res.render('getramtx', {tx: JSON.stringify(data)});
	});
});
var unspent = 0;
app.get('/ramtxlist/:addr/:unspent', function(req, res){
if(req.params.unspent == "true")
    unspent = 1;
else
    unspent = 0;
	doge.SuperNET('{"requestType":"ramtxlist", "coin":"BTCD", "address": "' + req.params.addr + '", "unspent": "' + unspent + '"}', function(err, data){
		if(err)
			console.log("err: " + err);
		else
			res.render('ramtxlist', {txlist: JSON.stringify(data)});
	});
});

app.get('/getramblock/:blocknum', function(req, res){
	doge.SuperNET('{"requestType":"ramblock", "coin":"BTCD", "blocknum": "' + req.params.blocknum + '"}', function(err, data){
		if(err)
			console.log("err: " + err);
		else
			res.render('ramblock', {block: JSON.stringify(data)});
	});
});


app.get('/ramrichlist/:numwhales', function(req, res){
if(req.params.numwhales <= 200){
	doge.SuperNET('{"requestType":"ramrichlist", "coin":"BTCD", "numwhales": "'+ req.params.numwhales +'"}', function(err, data){
		if(err)
			console.log("err: " + err);
		else
			res.render('ramrichlist', {richlist: JSON.stringify(data)});
	});
}
else
    res.render('ramrichlist', {richlist: "Please specify a number less than 200 for the top addresses"});
});


io.sockets.on('connection', function(socket){

    socket.on('pangeaLobby', function(data){
        doge.SuperNET('{"plugin":"InstantDEX","method":"orderbook","base":"BTCD","exchange":"pangea","allfields":1}', function(err, data){
            console.log("GOT RESPONSE: " + JSON.stringify(err) + JSON.stringify(data));
            socket.emit('pangeaLobbyRes', data);
        });
    });


    socket.on('pangeaJoin', function(data){
        doge.SuperNET('{"plugin":"InstantDEX","method":"placebid","base":"BTCD","exchange":"pangea","volume":1, "timeout":100}', function(err, data){
            console.log("GOT RESPONSE: " + JSON.stringify(err) + JSON.stringify(data));
            socket.emit('pangeaJoinRes', data);

        });
    });



    socket.on('pangeaStatus', function(data){
        if(data.tableid){
            doge.SuperNET('{"plugin":"pangea","method":"status", "tableid": "' + data.tableid + '", "timeout":100}', function(err, data){
                socket.emit('pangeaStatusRes', data);

            });
        }
        else{
            doge.SuperNET('{"plugin":"pangea","method":"status", "timeout":100}', function(err, data){
                socket.emit('pangeaStatusRes', data);

            });
        }
    });


    socket.on('pangeaStart', function(data){
        var d = JSON.stringify(data.data);

        doge.SuperNET(JSON.parse(d), function(err, data){
            socket.emit('pangeaStartRes', data);

        });
    });


    function isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    socket.on('pangeaTurn', function(data){
        var d = data;
        console.log(JSON.stringify(data));
        var action = d.action;
        var amtFlag = 0;
        var amount;
        if(action=="bet" || action=="raise"){
            if(!isNumeric(d.amount)){
                socket.emit('pangeaError', {message: "Amount is not numeric!"});
                return;
            }
            doge.SuperNET('{"plugin":"pangea","method":"turn", "action":"'+action+'", "amount":"'+d.amount+'"}', function(err, data){
                console.log("TURN got: " + JSON.stringify(data));
            });
        }
        else{
            doge.SuperNET('{"plugin":"pangea","method":"turn", "action":"'+action+'"}', function(err, data){
                console.log("TURN got: " + JSON.stringify(data));
            });
        }

    });

    socket.on('pangeaRosetta', function(data){
        doge.SuperNET('{"plugin":"pangea","method":"rosetta"}', function(err, data){
            console.log("Rosetta got err=" + err + " Data=" + JSON.stringify(data));
            socket.emit("pangeaRosettaRes", data);
        });

    });

    socket.on('pangeaRosettaWipCoin', function(data){
        doge.SuperNET('{"plugin":"pangea","method":"rosetta", "coin": "' + data.coin +'", "wip": "' + data.address + '"}', function(err, data){
            socket.emit("pangeaRosettaRes", data);
        });
    });

    socket.on('pangeaRosettaCoin', function(data){
        console.log("querying " + '{"plugin":"pangea","method":"rosetta", "coin": "' + data.coin +'", "addr": "' + data.address + '"}');


        if(data.coin == "BTCD"){
            doge.dumpprivkey(data.address, function(err, d){
                if(err){
                    socket.emit('pangeaError', {message: err.error});
                }
                else{
                doge.SuperNET('{"plugin":"pangea","method":"rosetta", "coin": "' + data.coin +'", "wip": "' + d + '"}', function(err, data){
                    socket.emit("pangeaRosettaRes", data);
                });
                }
            });
        }
        else{
                doge.SuperNET('{"plugin":"pangea","method":"rosetta", "coin": "' + data.coin +'", "addr": "' + data.address + '"}', function(err, data){
                    socket.emit("pangeaRosettaRes", data);
                });
        }



    });



});

    
