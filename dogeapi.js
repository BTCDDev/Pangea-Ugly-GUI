var dogecoin = require('node-dogecoin')();
dogecoin.auth('user', 'password');

module.exports = dogecoin;

