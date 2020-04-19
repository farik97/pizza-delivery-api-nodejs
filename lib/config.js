/*
* create and export configurations
*/

// container for all the environments
var environments = {};

// staging (default) environment
environments.staging = {
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName': 'staging',
    'hashingSecret': 'suckdeep',
    'stripe': {
        'accountSid': ''
    },
    'mailgun': {
        'domain': '',
        'apiKey': '',
        'userEmail': ''
    }
}

// production  environment
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret': 'suckdeeptoo',
    'stripe': {
        'accountSid': ''
    },
    'mailgun': {
        'domain': '',
        'apiKey': '',
        'userEmail': ''
    }
}

// determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// check if environment exists in config file, if not default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// export the module
module.exports = environmentToExport;



