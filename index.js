/*
* Primary file for the API
*
*/

// dependencies
const server = require('./lib/server')
const workers = require('./lib/workers')

// declare the app
var app = {}

// init function
app.init = function(){
    // start the server
    server.init()
}

// execute 
app.init()

// export the app
module.exports = app