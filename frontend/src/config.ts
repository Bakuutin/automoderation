import axios from 'axios';

const config = {};

axios.get('/static/js/config.json')
  .then(function (response) {
    Object.assign(config, response.data, {'debug': !response.data.production});
  });

  export default config
