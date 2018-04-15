import ReactGA from 'react-ga';
import axios from 'axios';

const config = {};

axios.get('/static/js/config.json')
  .then(function (response) {
    config['debug'] = !response.data.production;
    ReactGA.initialize(response.data.googleAnalyticsId, {
      debug: config.debug
    });
    ReactGA.pageview(window.location.pathname + window.location.hash);
  });


  export default config
