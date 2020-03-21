//  Dependencies
let _data = require('./data')
let helpers = require('./helpers')
let config = require('./config')
let menu = require('../.data/menu')

//  define handlers
let handlers = {}

//  not found handler 
handlers.notFound = (data, callback) => {
    callback(404)
}

//  users
handlers.users = (data, callback) => {
    acceptableMethods = ['POST', 'GET', 'PUT', 'DELETE']
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data,callback)
    }   else {
        callback(405, {'error': 'method not allowed'})
    }
}

//  container for the users submethods
handlers._users = {}

//  tokens
handlers.tokens = (data, callback) => {
    acceptableMethods = ['POST', 'DELETE']
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback)
    }   else {
        callback(405, {'error': 'method not allowed'})
    }
}

//  container for the tokens submethods
handlers._tokens = {}

//  menu
handlers.menu = (data, callback) => {
    acceptableMethods = ['GET']
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._menu[data.method](data, callback)
    }   else {
        callback(405, {'error': 'method not allowed'})
    }
}

//  container for the menu submethods
handlers._menu = {}

//  shopping cart 
handlers.carts = (data, callback) => {
    acceptableMethods = ['POST', 'GET', 'PUT', 'DELETE']
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._carts[data.method](data, callback)
    }   else {
        callback(405, {'error': 'method not allowed'})
    }
}

//  container for the carts submethods
handlers._carts = {}

//  orders
handlers.orders = (data, callback) => {
    acceptableMethods= ['POST', 'PUT', 'GET', 'DELETE']
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._orders[data.method](data, callback)
    }   else {
        callback(405, {'error': 'method not allowed'})
    }
}

//  container for orders submethods
handlers._orders = {}