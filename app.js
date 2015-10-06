
/**
 * Module dependencies.
 */
var pretty = true;

var express = require('express');
var routes = require('./routes');

var http = require('http');
var path = require('path');
var app = express();

var socketio = require("socket.io");
var io;

var prettyui = require("./pretty-ui/server/pretty-ui-server");

var doge=require("./dogeapi");


// all environments
app.set('port', process.env.PORT || 8081);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use("/pretty-ui", express.static(path.join(__dirname, './pretty-ui/client')));
app.use(express.static(path.join(__dirname,'/pretty-ui/client')));

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

prettyui.init(io);


/*
 *
 * Ugly Pangea GUI Routes
 *
*/

app.get('/', function(req,res){
	res.render('index', {
            pretty: pretty
        });
	});	

app.get('/rosetta', function(req,res){
	res.render('rosetta');
	});	

app.get('/cashier', function(req,res){
	res.render('cashier');
	});



app.get('/table/:tableID', function(req,res){
	    res.render('table', {tableid: req.params.tableID});
	});

app.get('/pretty-table/:tableID', function(req, res, next){
    res.render('pretty-table', {root: __dirname});
    //express.static(path.join('./pretty-ui/client/index.html'))(req, res, next);
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


/*
 *
 *  socket.io
 *
*/

io.sockets.on('connection', function(socket){

    socket.on('pangeaLobby', function(data){
        doge.SuperNET('{"plugin":"InstantDEX","method":"orderbook","base":"BTCD","exchange":"pangea","allfields":1}', function(err, data){
            socket.emit('pangeaLobbyRes', data);
        });
    });


    socket.on('pangeaJoin', function(data){
        doge.SuperNET('{"plugin":"InstantDEX","method":"placebid","base":"BTCD","exchange":"pangea","volume":1, "timeout":100}', function(err, data){
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
            });
        }
        else{
            doge.SuperNET('{"plugin":"pangea","method":"turn", "action":"'+action+'"}', function(err, data){
            });
        }

    });

    socket.on('pangeaRosetta', function(data){
        doge.SuperNET('{"plugin":"pangea","method":"rosetta"}', function(err, data){
            socket.emit("pangeaRosettaRes", data);
        });

    });

    socket.on('pangeaRosettaWipCoin', function(data){
        doge.SuperNET('{"plugin":"pangea","method":"rosetta", "coin": "' + data.coin +'", "wip": "' + data.address + '"}', function(err, data){
            socket.emit("pangeaRosettaRes", data);
        });
    });

    socket.on('pangeaRosettaCoin', function(data){
        if(data.coin == "BTCD"){
            doge.dumpprivkey(data.address, function(err, d){
                if(err){
                    socket.emit('pangeaError', {message: err.message});
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


    socket.on('pangeaBuyin', function(data){
        doge.SuperNET( '{"plugin":"pangea","method":"buyin","tableid":"'+data.tableid+'","amount":"'+data.amount+'"}', function(err, data){
            console.log("returned " + JSON.stringify(data));
            socket.emit('pangeaBuyinRes', data);
        });

    });

    socket.on('pangeaRates', function(data){

        doge.SuperNET('{"plugin":"pangea","method":"rates"}', function(err, data){
            socket.emit('pangeaRatesRes', data);
        });

    });


});

    
