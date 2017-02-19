// global window.CONFIG

const config = window.CONFIG.api;
var host = `${config.host}:${config.port}${config.path}api/`;

// ngrok expects localhost binding, but ui needs to know the tunnel hostname...
if (window.location.hostname !== 'localhost') {
  host = window.location.hostname + '/api/';
}

// rest API path
if (config.ssl) {
  var restPath = `https://${host}`;
} else {
  var restPath = `http://${host}`;
}
export var restPath;

// ws API path
if (config.ssl) {
  var wsPath = `wss://${host}`;
} else {
  var wsPath = `ws://${host}`;
}
export var wsPath;