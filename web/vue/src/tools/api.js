// global window.CONFIG

const config = window.CONFIG.api;
var host = `${config.host}:${config.port}${config.path}api/`;

// override for remote hosting...
host = "gekko.or13.io/api/";

// rest API path
if(config.ssl) {
  var restPath = `https://${host}`;
} else {
  var restPath = `http://${host}`;
}
export var restPath;

// ws API path
if(config.ssl) {
  var wsPath = `wss://${host}`;
} else {
  var wsPath = `ws://${host}`;
}
export var wsPath;