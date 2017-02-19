// This config is used in both the
// frontend as well as the web server.

const CONFIG = {
  api: {
    ssl: false,
    // host: 'localhost',
    host: 'gekko.or13.io',
    port: 80,
    path: '/'
  }
}

if(typeof window === 'undefined')
  module.exports = CONFIG;
else
  window.CONFIG = CONFIG;