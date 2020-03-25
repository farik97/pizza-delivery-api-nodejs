/*
* Helpers for various tasks
*
*/

// dependencies
var crypto = require('crypto')
var config = require('./config')
var https = require('https')
var queryString = require('querystring')
// container for all the helpers
var helpers = {}

// create a sha256 hash

helpers.hash = function(str) {
    if (typeof(str) == 'string' && str.length >0){
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
        return hash
    }   else {
        return false
    }
}

// take a string and return object or give an error
helpers.parseJsonToObject = function(str){
    try{
        var obj = JSON.parse(str)
        return obj
    }catch(e){
        return {}
    }
}

// create s tring of random alphanumeric characters of a given length
helpers.createRandomString = function (strLength) {
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength: false
    if(strLength){
        // define the all the possible characters
        var possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789'
        // start the string
        var str = ''
        for (i =1; i <= strLength; i++){
            // get a random character from the possiblecharacters string
            var randomCharacter = possibleChars.charAt(Math.floor(Math.random()* possibleChars.length))
            // append this character to the string
            str += randomCharacter
        }
        return str
    } else {
        return false
    }
}




// export the module
module.exports = helpers