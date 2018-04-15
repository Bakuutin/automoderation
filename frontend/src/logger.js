import config from './config.js';

const log = function() {
    if(config.debug){
        console.log.apply(console, arguments);
    }
};

export default log
