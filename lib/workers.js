/*
/   background workers for checking token expiry date and deleting tokens
/
*/

const _data = require('./data')

let workers = {}

workers.checkToken = () => {
    _data.list('tokens', (err, tokens)=>{
        if (!err && tokens && tokens.length >0) {
            for (i=0;i<tokens.length;i++) {
                let date = Date.now()
                if (tokens[i].expiry_date < date) {
                    _data.delete('tokens', tokens[i].name, (err)=>{
                        if (!err) {
                            console.log({'token expired':'token expired user logged out'})
                        } else {
                            console.log('couldnt delete')
                        }
                    })
                } else {
                    console.log({'token valid': 'token valid still logged in'})
                }
            }
        } else {
            console.log('nothing to list')
        }
    })
}

// timer to execute the log rotation once per day
workers.checkTokenLoop = () =>{
    setInterval(()=>{
        workers.checkToken()
    },1000*60)
}

// init script
workers.init = () => {
    console.log('\x1b[33m%s\x1b[0m', 'Background workers are running')

    workers.checkToken()

    workers.checkTokenLoop()
}

module.exports = workers