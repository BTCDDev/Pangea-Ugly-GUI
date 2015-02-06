cd ../btcd/libjl777
./BitcoinDarkd stop
pkill -15 SuperNET
pkill -15 BitcoinDarkd
sleep 15
./BitcoinDarkd
cd ../../btcd-supernet-explorer
nodejs app.js
