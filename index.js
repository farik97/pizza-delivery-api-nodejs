/*
* Primary file for the API
*
*/

// dependencies
var server = require('./lib/server')

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