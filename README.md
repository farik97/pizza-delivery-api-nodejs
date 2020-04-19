# pizza-delivery-api-nodejs
This is an API for pizza delivery service /n
Features: /n
Register User /n
Delete User /n 
Edit User /n 
Login User (create token) /n
Logout User (delete token) /n 
Get Menu Items /n 
Add Item to Cart /n
Checkout Cart

# these apis work with integartion with Stripe and Mailgun
Check the config.js file for adding your Stripe and Mailgun account details

You can use localhost:3000/3001 (staging) or localhost:5000/5001 (production)

/(whatever) will give back 404 not found error if we pass a handler which is not found

/users
2.1 POST method: for registering a user
	Required: name(payload), email(payload), 
address(payload), password(payload)
Name should be string
Email should be string
Address should be string
Password should be string and it should be more than 5 characters

2.2 GET method: for getting user details
	Required: email(payload), token(headers)
Email should be string and it should be for a user which exists
Token has to be string and exactly 20 characters and it has to be associated with email for the user

2.3 PUT method: for changing user details
	Required: email(payload), token(headers)
	Optional: name(payload), address(payload), 
password(payload)
Email and token validators are the same like the ones above
One of the three optionals have to be there or else nothing is going to happen by the result of the request

2.4 DELETE method: for deleting a user
	Required: email(payload), token(headers), 
password(payload), confirmPassword(payload)
Email and token and password validations are as stated above
confirmPassword validation is the same as the password validation
Password and confirmPassword have to be equal

/tokens
3.1 POST method: for a user to login
	Required: email(payload) and password(payload)
Validations are the same
A token is created with and expiry date of 3+ hours to your time

3.2 DELETE method: for a user to logout
	Required: email(payload) and token(payload)
Validation are the same as stated in previous methods

/menu
4.1 GET method: for checking out the menu
	Required: email(payload) and token(headers)
Token and email validation is the same as in other methods
Response is the menu.json object which has some pizzas a salad and a desert

/carts
5.1 POST method: to create a shopping cart
	Required: email(payload), token(headers), 
foodName(payload)
Email and token validation is the same 
foodName is the name of the food from the menu.json file if the name is wrong you will get back an error that the food is not from the menu
foodName should be a string

5.2 GET method: to get information on the shopping cart
	Required: email(payload), token(headers) and 
id(headers)
Email and token validation is the same as in previous methods
 id-is the cart id created during the /carts POST method  
id-should be 10 in length and a string

5.3 PUT method: to add something to the shopping cart
	Required: email(payload), token(headers), id(headers), 
foodName(payload)
Email and token and id and foodName validations are the same as stated above

5.4 DELETE method: to delete item from the shopping cart
	Required: email(payload), token(headers), id(headers), 
foodName(payload)
Email, token, id, foodName validations are the same as stated above 

5.5 UNLINK method: to delete the whole shopping cart
	Required: email(payload), token(headers), id(headers)
Email, token and id validations are the same as stated above

/orders
6.1 POST method: to make a payment for a shopping cart
	Required: email(payload), token(headers), id(headers), 
cardNum(payload)
email , token and id validations are the same as stated above
cardNum is the last four digits of the card the user is making the payment with
There are only a set of digits acceptable by stripe so if you use anything else you will receive an error
These last four digits are used for setting the token for payment method that the app sends to stripe
If payment successful then an email is being sent using mailgun
The email receiving this email is set in the config as in Mailgun you can only send emails to the email you are registered with in mailgun, in any other case you receive a 400 error

Stripe card numbers that will be successful: (the main thing is the last four digits for this API in the case of American Express Payments it is the last 5 digits)

Do not forget to change the config.js file for your own configurations of Stripe and Mailgun. VERY IMPORTANT: THE EMAIL WILL BE SENT TO THE MAILGUN EMAIL YOU ARE GONNA WRITE IN YOUR CONFIG.JS FILE.

For checking expiry of the token, token has expiry date of 3hours+ plus from the date it was created, there is background worker working in a short interval to check the expiry and if it has expired the oken gets deleted and you see it in the console.log, if it hasn’t expired you still get a message in the console.log that it hasn’t expired.
