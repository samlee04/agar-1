/**
 *
 * Server
 *
 * Proxies requests from agar backend server to modified client.
 * Allows controlling actions in agar via an agent.
 */
var express = require('express');
var WebSocketServer = require('ws').Server;
var AgarBackend = require('./AgarBackend');
var Controller = require('./Controller');
var GameState = require('./GameState');
var renderer = require('./renderer');

var HTTP_PORT = 8888;
var HTTP_OBSERVER_PORT = 8889;
var WEBSOCKET_PORT = 8080;

// Serve static assets.
var app = express();
app.use(express.static('public'));
app.listen(HTTP_PORT);

// Web socket proxy sever.
var wss = new WebSocketServer({port: WEBSOCKET_PORT});
wss.on('connection', function connection(client) {
  console.log('Got websocket connection, initializing game.');

  // Initialize backend, game state, and controller.
  var backend = new AgarBackend();
  backend.setClient(client);
  backend.connect();

  var state = new GameState();
  state.setAgarBackend(backend);

  var controller = new Controller();
  controller.setAgarBackend(backend);

  setTimeout(function() {
    controller.sendInitMessage();
    controller.play();
    move();
  }, 1000);

  function move() {
    var user = state.getUserEntity();
    if (!user) {
      console.log('no user');
      setTimeout(move, 1000);
      return;
    }
    console.log(user.x, user.y);
    controller.move(user.x + 2000, user.y + 2000);
    setTimeout(move, 1000);
  }


  //renderer.loop(state);
});

console.log('Proxy server started on port: ' + HTTP_PORT);
