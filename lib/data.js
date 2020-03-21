/*
*   Library for storingand editing data
*
*/
var fs = require('fs')
var path = require('path')
var helpers = require('./helpers')

//Contatiner for the module to be exported
var lib = {}


// definte the base dir of the data folder
lib.baseDir = path.join(__dirname, '/../.data/')

lib.create = function (dir, file, data, callback){
    // open the file for writing
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function (err, fileDescriptor){
        if (!err && fileDescriptor){
            // convert into a string
            var stringData = JSON.stringify(data)

            //write file and close it
            fs.writeFile(fileDescriptor, stringData, function (err){
                if (!err){
                    fs.close(fileDescriptor, function (err){
                        if(!err){
                            callback(false)
                        }   else {
                            callback('Error closing new file')
                        }
                    })
                }   else {
                    callback('Error writing to a new file')
                }
            })
        }   else {
            callback('Could not create new file, it may already exist')
        }
    })
}

// read data from a file
lib.read = function (dir, file, callback) {
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', function(err, data){
        if(!err && data){
            var parsedData= helpers.parseJsonToObject(data)
            callback(false, parsedData)
        }   else {
            callback(err, data)
        }
    })
}

// update exisitng file
lib.update = function (dir, file, data, callback){
    // open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', function (err, fileDescriptor){
        if (!err && fileDescriptor) {
            var stringData = JSON.stringify(data)

            fs.truncate(fileDescriptor, function (err){
                if(!err){
                    // write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, function (err){
                        if (!err) {
                            fs.close(fileDescriptor, function(err){
                                if (!err){
                                    callback(false)
                                } else {
                                    callback('there was an error closing the file')
                                }
                            })
                        }   else {
                            callback('error writing the file')
                        }
                    })
                } else {
                    callback('erro truncating file')
                }
            })
        }   else {
            callback('could not open the for updating, it may not exist yer')
        }
    })
}


// deleting a file
lib.delete = function (dir, file, callback) {
    // unlink the file
    fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err){
        if(!err){
            callback(false)
        }   else {
            callback('there was an error deleting the file')
        }
    })
}

// list all the items in a directory
lib.list = (dir, callback) => {
    fs.readdir(lib.baseDir+dir+'/', (err, data)=>{
        if(!err){
            var trimmedFileNames = []
            data.forEach((filename)=>{
                trimmedFileNames.push(filename.replace('.json', ''))
            })
            callback(false, trimmedFileNames)
        } else {
            callback(err, data)
        }
    })
}

module.exports = lib