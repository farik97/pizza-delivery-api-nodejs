/*
* Helpers for various tasks
*
*/

// dependencies
var crypto = require('crypto')
var config = require('./config')
var https = require('https')
var queryString = require('querystring')
var request = require('request')
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

// send Stripe order 
helpers.sendOrderStripe = (data, callback) => {
    if (data) {
        let payload = {
            'amount': data.total*100,
            'currency': 'usd',
            'description': 'pizza order',
            'source': data.cardType
        }
        let stringPayload = queryString.stringify(payload)
        let requestDetails = {
            'protocol': 'https:', 
            'hostname': 'api.stripe.com', 
            'method': 'POST',
            'path': '/v1/charges',
            'auth': config.stripe.accountSid,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        }
    
        let req = https.request(requestDetails, (res)=>{
            let status = res.statusCode

            if (status == 200 || status == 201) {
                callback(false)
            } else {
                callback('status code returned was '+ status)
            }
        })
    
        req.on('error', (e)=>{
            callback(e)
        })
    
        req.write(stringPayload)
    
        req.end()    
    } else {
        callback(400, {'error': 'wrong data or no data passed'})
    }
}

// send mail after order is accepted
helpers.sendEmail = (data, callback) => {
    if (data) {
        const orderedItems = data.ordered_items.toString()
        var formData = {
            from: `Mailgun Sandbox <pizza@${config.mailgun.domain}>`,
            to:`${config.mailgun.userEmail}`,
            subject:`New Order! OrderId: ${data.id} for a total of ${data.amount} USD`,
            text:`The client has ordered: ${orderedItems} for a total of ${data.amount} USD. The client email is ${data.user} && the payment status is ${data.payment_status} using a card with last four digits: ${data.cardDetails.fourDigits}`
        }
        var options = {
            url: `https://api.mailgun.net/v3/${config.mailgun.domain}/messages`,
            method:'POST',
            auth: {
                'user': 'api',
                'pass': `${config.mailgun.apiKey}`
            },
            formData: formData
        }
      
        function call(error, response, body) {

            if (!error && response.statusCode == 200 || response.statusCode == 201) {
                callback(false)
            } else {
                callback('status code returned was '+ response.statusCode)
            }
        }
      
        request(options, call);
    
    } else {
        callback(400, {'data error': 'no data passed for sending an email'})
    }      
}

// export the module
module.exports = helpers