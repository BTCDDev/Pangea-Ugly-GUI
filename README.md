This is a pretty bad GUI.

However, it's decentralized poker. Pretty cool.

To Run:

Change the user/password in dogeapi.js to match your rpcuser and rpcpassword in BitcoinDark.conf

git clone git://github.com/jl777/btcd
cd btcd/libjl777
make onetime
make
make btcd
touch SuperNET.conf
Fill out SuperNET.conf like so:
{
    "secret":"randvals",
    "myipaddr": "<ipaddress>",
    "userhome":"/home/<username>",
    "userdir":"/home/<username>"
}

Run Nxt

Run BitcoinDark:
./BitcoinDarkd

Navigate to this folder
node app.js

open your browser at 127.0.0.1:8080

Place a bid
View lobby to see if there are any other bids
Start Game will pick random bids to start a game with, making you the host. 
Update the status to see if there are any games you are in.
