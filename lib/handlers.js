//  Dependencies
var _data = require('./data')
var helpers = require('./helpers')
var config = require('./config')
const stripe = require('stripe')('sk_test_i6MEVCLJRP5i7xUZqNxjZHM800xcDFF5jx')



//  define handlers
var handlers = {}

//  not found handler 
handlers.notFound = function(data, callback) {
    callback(404)
}

// users
handlers.users = function(data,callback){
    acceptableMethods = ['POST','GET','PUT','DELETE']
    if(acceptableMethods.indexOf(data.method) > -1){
      handlers._users[data.method](data,callback)
    } else {
      callback(405, {'error': 'method not allowed'})
    }
};

//  container for the users submethods
handlers._users = {}

//  create a user
//  required data : name, email address, street address
handlers._users.POST = function (data, callback) {
    //  validate required fields
    let name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim(): false
    let email = typeof(data.payload.email) == 'string' ? data.payload.email.trim(): false
    let address = typeof(data.payload.address) == 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim(): false
    let password = typeof(data.payload.password) == 'string' && data.payload.password.length > 5 ? data.payload.password: false
    //  signup process
    if (name && email && address && password) {
        
        _data.read('users', email, (err, data)=>{
            if (err) {
                
                let hashedPassword = helpers.hash(password)

                if (hashedPassword) {
                    
                    const userData = {
                        name: name,
                        email: email,
                        address: address,
                        password: hashedPassword
                    }
    
                    _data.create('users', email, userData, (err)=>{
                        if (!err) {
                            callback(200, {'success message': `A user with ${email} has been created`})
                        } else {
                            callback(400, 'could not create the user')
                        }
                    })

                }   else {
                    callback(500, {'internal error': 'sorry could not hash the users password'})
                }

            }   else {
                callback(403, {'existing user': 'user with this credentials already exists'})
            }
        })
    } else {
        callback(400, {'validation error': 'please fill in the required fields'})
    }
}

//  get user details
//  required data: token
handlers._users.GET = (data, callback) => {
    //  validate token
    let email = typeof(data.payload.email) == 'string' ? data.payload.email.trim(): false
    let token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim(): false

    //  start the process
    if (token && email) {
        _data.read('tokens', email, (err, tokenData)=>{
            if (!err && tokenData) {
                if (token == tokenData.id) {
                    _data.read('users', email, (err, userData)=>{
                        if (!err && userData) {
                            const userAvailableData = {
                                name: userData.name,
                                email: userData.email, 
                                address: userData.address
                            }
                            callback(200, userAvailableData)
                        } else {
                            callback(404, {'user error': 'user not found'})
                        }
                    })
                } else {
                    callback(400, {'token error': 'wrong token'})
                }
            } else {
                callback(404, {'token error':'cant find users token, user might be logged out :('})
            }
        })
    } else {
        callback(400, {'validation error': 'missing or unauthorised type of token'})
    }
}

//  change user details
//  required data: email && token
//  optional data: name, address & password
handlers._users.PUT = (data, callback) => {
    //  field validations
    let email = typeof(data.payload.email.trim()) == 'string' ? data.payload.email.trim(): false
    let token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim(): false

    if (email && token) {
        let name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim(): false
        let address = typeof(data.payload.address) == 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim(): false
        let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 5 ? data.payload.password.trim(): false

        if(name || address || password) {
            _data.read('users', email, (err, userData)=>{
                if(!err && userData) {
                    if (name) {
                        userData.name = name
                    }
                    if (address) {
                        userData.address = address
                    }
                    if (password) {
                        userData.password = helpers.hash(password)
                    }
                    _data.update('users', email, userData, (err)=>{
                        if (!err) {
                            callback(200, {'success message': `user with ${email} has been updated`})
                        }   else {
                            callback(500, {'internal error': 'could not update the user'})
                        }
                    })
                } else {
                    callback(404, {'user error': 'user not found'})
                }
            })
        } else {

        }

    } else {
        callback(400, {'token error': 'token expired/user logged out'})
    }

}

//  delete user details
//  required data: email && token && password
handlers._users.DELETE = (data, callback) => {
    
    //  validate req fields
    let email = typeof(data.payload.email) == 'string' ? data.payload.email.trim(): false
    let token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim(): false
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 5 ? data.payload.password.trim(): false
    let confirmPassword = typeof(data.payload.confirmPassword) == 'string' && data.payload.confirmPassword.trim().length > 5 ? data.payload.confirmPassword.trim(): false

    if (email && token && password && confirmPassword) {
        if(password == confirmPassword) {
            _data.read('users', email, (err, userData)=>{
                if (!err && userData) {
                    let hashedPassword = helpers.hash(password)
                    if (userData.password == hashedPassword) {
                        _data.delete('users', email, (err)=>{
                            if (!err) {
                                _data.read('tokens', email, (err, tokenData)=>{
                                    if(!err && tokenData.id == token) {
                                        _data.delete('tokens', email, (err)=>{
                                            if (!err) {
                                                callback(200, {'user && token deletion': 'user and associated token deleted'})    
                                            } else {
                                                callback(201, {'user deletion': 'user deleted'})
                                            }
                                        })
                                    }   else  {
                                        callback(200, {'user deletion': 'user deleted'})
                                    }
                                })
                            } else {
                                callback(500, {'user deletion error': ' error occured couldnt delete the user'})
                            }
                        })
                    } else {
                        callback(404, {'wrong password': 'wrong password'})
                    }
                } else {
                    _data.read('tokens', email, (err, tokenData)=>{
                        if (!err && tokenData) {
                            if (tokenData.id == token) {
                                _data.delete('tokens', email, (err)=>{
                                    if (!err) {
                                        callback(403, {'no user but token deleted': 'could not find the user but token deleted successfully'})
                                    } else {
                                        callback(404, {'no user but token found': 'could not find the user but token still exists'})
                                    }
                                })
                            }
                        } else {
                            callback(404, {'no user': 'could not find the user'})
                        }
                    })
                }
            })
        } else {
            callback(400, {'password error': 'passwords not matching'})
        }
    } else {
        callback(400, {'validation error': 'fill in the required fields'})
    }
}

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

//  login and get a token
handlers._tokens.POST = (data, callback) => {
    //  validate inputs
    let email = typeof(data.payload.email) == 'string' ? data.payload.email.trim(): false
    let password = typeof(data.payload.password) == 'string' ? data.payload.password: false

    //  start the signin
    if (email && password) {
        //  check for existing user with that email
        _data.read('users', email, (err, userData)=>{
            if (!err && userData) {
                
                //  hash the password
                let hashedPassword = helpers.hash(password)
                if (hashedPassword) {
                    
                    if (hashedPassword == userData.password) {
                        
                        //  check if there is already a token for the user
                        _data.read('tokens', email, (err, token)=> {
                            if (!err && token) {
                                callback(201, {'already logged': `user with ${email} is already logged in`})
                            } else {
                                //  if valid create a token
                                let tokenId = helpers.createRandomString(20)

                                //  expiry Date
                                let expires = Date.now() + 1000 * 60 * 60 * 3
                                let tokenObject = {
                                    id: tokenId,
                                    expiry_date: expires
                                }

                                //  create a token
                                _data.create('tokens', email, tokenObject, (err)=>{

                                    if (!err) {
                                        callback(200, {'success message': `user ${email} is logged in`})
                                    } else {
                                        callback(500, {'token problem': 'couldnt create '})
                                    }

                                })
                            }
                        })
                        
                    } else {
                        callback(400, {'incorrect password': 'password is incorrect'})
                    }
                    

                } else {
                    callback(500, {'hash problem': 'couldnt hash the problem'})
                }

            } else {
                callback(400, {'wrong email': `couldnt find a user with this email: ${email}`})
            }
        })
    }   else {
        callback(400, {'validation error': 'missing or unauthorised type of fields'})
    }
}

//  logout and delete a token
handlers._tokens.DELETE = (data, callback) => {

    //  validate inputs
    let email = typeof(data.payload.email) == 'string' ? data.payload.email.trim(): false
    let token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token: false

    if (email && token) {
        //  check if the user is still logged in
        _data.read('tokens', email, (err, tokenData)=>{
            if (!err && tokenData) {
                //  check for token 
                if (token == tokenData.id) {
                    _data.delete('tokens', email, (err)=>{
                        if (!err) {
                            callback(200, {'logout': `${email} is logged out`})
                        } else {
                            callback(400, {'logout_fail': 'cant logout'})
                        }
                    })
                }   else {
                    callback(400, {'mismatching token': 'token is not matching :('})
                }
            }   else {
                callback(400, {'token problem': 'user already logged out or missing token'})
            }
        })
    }   else {
        callback(400, {'input problems': 'missing or unauthorized fields'})
    }

}

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

//  get the menu
handlers._menu.GET = (data, callback) => {
    //  get the menu items
    _data.read('menu', 'menu', (err, menuData)=>{
        if (!err && menuData) {
            callback(200, menuData)
        }   else {
            callback(500, {'error': 'something went wrong'})
        }
    })
}

//  shopping cart 
handlers.carts = (data, callback) => {
    acceptableMethods = ['POST', 'GET', 'PUT', 'DELETE', 'UNLINK']
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._carts[data.method](data, callback)
    }   else {
        callback(405, {'error': 'method not allowed'})
    }
}

//  container for the carts submethods
handlers._carts = {}

//  create a shopping cart
//  required data: email, token, name of the food
handlers._carts.POST = (data, callback) => {
    //  validate fields
    let email = typeof(data.payload.email) == 'string' ? data.payload.email: false
    let token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim(): false
    let foodName = typeof(data.payload.foodName) == 'string' ? data.payload.foodName.trim(): false

    if (email && token && foodName) {
        _data.read('tokens', email, (err, tokenData)=>{
            if (!err && token == tokenData.id) {
                _data.read('menu', 'menu', (err, foodData)=>{
                    if (!err && foodData) {
                        let item
                        let itemPrice
                        let foodFound = 0
                        for (i=0; i<foodData.length; i++) {
                            if (foodName == foodData[i].name) {
                                item = foodData[i].name
                                itemPrice = foodData[i].price
                                foodFound ++
                                let cartId = helpers.createRandomString(10)
                                let cart = {
                                    id: cartId,
                                    recipient: email,
                                    items: [item],
                                    total: itemPrice
                                }
                                _data.create('carts', cartId, cart, (err)=>{
                                    if (!err) {
                                        callback(200, {'success message': `item is added to the shopping cart, shopping cart:`, cart})
                                    } else {
                                        callback(500, {'internal error': 'couldnt add to the shopping cart'})
                                    }
                                })
                            }
                        }
                        if (foodFound == 0 ) {
                            callback(404, {'food not found': 'sorry the item you requested is not in the menu'})
                        }
                    } else {
                        callback(500, {'internal error': 'cannot read the menu data'})
                    }
                })
            } else {
                callback(404, {'token error': 'unauthorised token'})
            }
        })
    } else {
        callback(400, {'input validation': 'missing fields or unauthorized type of fields'})
    }

}

//  get your shopping cart
//  required data: email, token and cartId
handlers._carts.GET = (data, callback) => {
    //  validate fields
    let email = typeof(data.payload.email) == 'string' ? data.payload.email: false
    let token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim(): false
    let cartId = typeof(data.headers.id) == 'string' && data.headers.id.trim().length == 10 ? data.headers.id.trim(): false

    // //  start the process
    if (email && token && cartId) {
        _data.read('carts', cartId, (err, cartData)=>{
            if (!err && cartData) {
                if (email == cartData.recipient && cartId == cartData.id) {
                    callback(200, {'this is your order': cartData})
                } else {
                    callback(400, {'not your order': 'the shopping cart you are trying to access is not yours'})
                }
            } else {
                callback(404, {'shopping cart not found': 'shopping cart not found or empty'})
            }
        })
    } else {
        callback(400, {'validation error': ''})
    }
}

//  add to your shopping cart
//  required data: email, token, cartId, foodName
handlers._carts.PUT = (data, callback) => {
    //  validate fields
    let email = typeof(data.payload.email) == 'string' ? data.payload.email: false
    let token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim(): false
    let cartId = typeof(data.headers.id) == 'string' && data.headers.id.trim().length == 10 ? data.headers.id.trim(): false
    let foodName = typeof(data.payload.foodName) == 'string' ? data.payload.foodName.trim(): false

    //  start the process
    if (email && token && cartId && foodName) {
        _data.read('tokens', email, (err, tokenData)=>{
            if (!err && tokenData.id == token) {
                _data.read('carts', cartId, (err, cartData)=>{
                    if (!err && cartData.id == cartId && cartData.recipient == email) {
                        _data.read('menu', 'menu', (err, foodData)=>{
                            if (!err && foodData) {
                                let item
                                let itemPrice
                                let itemFound = 0
                                for ( i=0; i<foodData.length; i++) {
                                    if (foodName == foodData[i].name) {
                                        item = foodData[i].name
                                        itemPrice = foodData[i].price
                                        itemFound ++

                                        cartData.items.push(item)
                                        cartData.total += itemPrice

                                        _data.update('carts', cartId, cartData, (err)=> {
                                            if (!err) {
                                                callback(200, {'success message': 'item added to your shopping cart', cartData})
                                            } else {
                                                callback(500, {'internal error': 'could not add the item to your shopping cart'})
                                            }
                                        })
                                    }
                                }
                                if (itemFound == 0) {
                                    callback(400, {'wrong item': 'requested item is not found in the menu'})
                                }
                            } else {
                                callback(500, {'internal error': 'sorry couldnt read menu, menu not available for now'})
                            }
                        })
                    } else {
                        callback(400, {'no cart': 'sorry you have nothing in your shopping cart'})
                    }
                })
            } else {
                callback(404, {'unauthorised token': 'token unauthorised, probably you have been logged out'})
            }
        })
    } else {
        callback(400, {'validation error': 'missing fields or unauthorised type of fields'})
    }

}

//  delete your an item from your shopping cart
//  required data: email, token, cartId, foodName
handlers._carts.DELETE = (data, callback) => {
    //  validate fields
    let email = typeof(data.payload.email) == 'string' ? data.payload.email: false
    let token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim(): false
    let cartId = typeof(data.headers.id) == 'string' && data.headers.id.trim().length == 10 ? data.headers.id.trim(): false
    let foodName = typeof(data.payload.foodName) == 'string' ? data.payload.foodName.trim(): false

    //  start the process
    if (email && token && cartId && foodName) {
        _data.read('tokens', email, (err, tokenData)=>{
            if (!err && token == tokenData.id) {
                _data.read('carts', cartId, (err, cartData)=>{
                    if (!err && cartData.recipient == email) {
                        _data.read('menu', 'menu', (err, foodData)=>{
                            if (!err && foodData){
                                var itemPrice
                                for (i=0;i<foodData.length;i++) {
                                    if (foodName == foodData[i].name) {
                                        itemPrice = foodData[i].price
                                    }
                                }
                                let foodList = cartData.items
                                if (foodList.includes(foodName) == true) {
                                    foodList.splice(foodList.indexOf(foodName),1)
                                    cartData.items = foodList
                                    cartData.total -= itemPrice
                                    _data.update('carts', cartId, cartData, (err)=>{
                                        if (!err) {
                                            callback(200, {'success message': 'item successfully removed', cartData})
                                        } else {
                                            callback(500, {'internal server error': 'couldnt update the shopping cart', err})
                                        }
                                    })
                                } else {
                                    callback(400, {'foodName error': 'the item is not in the shopping cart anyways :('})
                                }
                            }
                        })
                    } else {
                        callback(400, {'cart id error': 'no shopping cart found :('})
                    }
                })
            } else {
                callback(404, {'token error': 'unauthorised token, you have probably been logged out'})
            }
        })
    } else {
        callback(400, {'validaiton error': 'missing validations'})
    }
}

//  delete the whole shopping cart in other words clear the whole shopping cart
//  required data: email, token & cartId
handlers._carts.UNLINK = (data, callback) => {
    //  validate fields
    let email = typeof(data.payload.email) == 'string' ? data.payload.email: false
    let token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim(): false
    let cartId = typeof(data.headers.id) == 'string' && data.headers.id.trim().length == 10 ? data.headers.id.trim(): false

    //  start the process
    if (email && token && cartId) {
        _data.read('tokens', email, (err, tokenData)=>{
            if (!err && token == tokenData.id) {
                _data.read('carts', cartId, (err, cartData)=>{
                    if (!err && cartId == cartData.id && email == cartData.recipient) {
                        _data.delete('carts', cartId, (err)=>{
                            if (!err) {
                                callback(200, {'success message': 'shopping cart successfully cleared'})
                            } else {
                                callback(500, {'internal error': 'couldnt delete/clear the shopping cart'})
                            }
                        })
                    } else {
                        callback(404, {'cart error': 'not your shopping cart'})
                    }
                })
            } else {
                callback(404, {'unauthorised token': 'unauthorised token, you are probably logged out'})
            }
        })
    } else {
        callback(400, {'validation error': 'missing fields or unauhtorised type of fields'})
    }
}

//  orders
handlers.orders = (data, callback) => {
    acceptableMethods= ['POST']
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._orders[data.method](data, callback)
    }   else {
        callback(405, {'error': 'method not allowed'})
    }
}

//  container for orders submethods
handlers._orders = {}

//  create your order
//  required data: email, token, cartId
handlers._orders.POST = (data, callback) => {
    //  validate the inputs
    let email = typeof(data.payload.email) == 'string' ? data.payload.email: false
    let token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim(): false
    let cartId = typeof(data.headers.id) == 'string' && data.headers.id.trim().length == 10 ? data.headers.id.trim(): false
    let lastFour = typeof(data.payload.cardNum) == 'string' && data.payload.cardNum.trim().length == 4 ? data.payload.cardNum: false

    //  start the process
    if (email && token && cartId && lastFour) {
        _data.read('tokens', email, (err, tokenData)=>{
            if (!err && token == tokenData.id) {
                _data.read('carts', cartId, (err, cartData)=>{
                    if (!err && email == cartData.recipient) {
                        if (lastFour == "4242") {
                            var cardType = "tok_visa"
                        }
                        if (lastFour == "5556") {
                            var cardType = "tok_visa_debit"
                        }
                        if (lastFour == "4444") {
                            var cardType = "tok_mastercard"
                        }
                        if (lastFour == "8210") {
                            var cardType = "tok_mastercard_debit"
                        }
                        if (lastFour == "5100") {
                            var cardType = "tok_mastercard_prepaid"
                        }
                        if (lastFour == "1117") {
                            var cardType = "tok_discover"
                        }
                        if (lastFour == "0004") {
                            var cardType = "tok_diners"
                        }
                        if (lastFour == "0505") {
                            var cardType = "tok_jcb"
                        }
                        if (lastFour == "0005") {
                            var cardType = "tok_unionpay"
                        }
                        stripe.charges.create({
                            amount: cartData.total*100,
                            currency: "usd",
                            source: cardType,
                            description: "pizza order"
                          }, function(err, charge) {
                            // asynchronously called
                            if (!err) {
                                let orderId = helpers.createRandomString(10)
                                let order = {
                                    id: orderId,
                                    cardDetails: {
                                        fourDigits: lastFour,
                                        payment_method: cardType
                                    },
                                    ordered_items: cartData.items,
                                    user: email,
                                    amount: cartData.total,
                                    payment_status: "success"
                                }
                                _data.create('orders', orderId, order, (err)=>{
                                    if (!err) {
                                        callback(200, {'order success': 'order successfully created'})
                                        //  delete the shopping cart
                                        // _data.delete('carts', cartId, (err)=>{
                                        //     if (!err) {

                                        //     } else {

                                        //     }
                                        // })
                                    } else {
                                        callback(500, {'internal error': 'couldnt create the order'})
                                    }
                                })
                            } else {
                                callback(500, err)
                            }
                          });
                    } else {
                        callback(400, {'cart error': 'error while reading shopping cart, shopping cart might not be yours'})
                    }
                })
            } else {
                callback(401, {'unatuhorised': 'you are not logged in or unauhtorised token'})
            }
        })
    } else {
        callback(400, {'validation error': 'missing or unauthorised type of fields'})
    }
}

module.exports = handlers