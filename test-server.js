/**
 * tequila
 * node-server
 *
 * Right now this is host to unit tests
 *
 */

// Initialize connect
var connect = require('connect');
var app = connect();
app.use(connect.static('../tequila'));
app.use(connect.directory('../tequila', {icons: true}));

//app.use('/js/lib/', connect.static('node_modules/requirejs/'));
//app.use('/node_modules', connect.static('node_modules'));
// Get IP Address

var os = require('os');
var interfaces = os.networkInterfaces();
var addresses = [];
for (k in interfaces) {
  for (k2 in interfaces[k]) {
    var address = interfaces[k][k2];
    if (address.family == 'IPv4' && !address.internal) {
      addresses.push(address.address)
    }
  }
}

// Start up HTTP server (http)
var version = "0.1";
var ServerName = "Test";
var IP = addresses[0];
var Port = 8080;
var http = require('http').createServer(app);
var server = http.listen(Port, function () {
  console.log(ServerName + '\nVersion ' + version + '\nAddress: http://' + IP + ':' + Port);
});

// Start up Socket Server (io)
var Connections = []; // Array of connections
var io = require('socket.io').listen(server);

//io.set('log level', 1);
io.set('log', false);
io.on('connection', function (socket) {
  socket.on('ackmessage', function (obj, fn) {
    console.log('socket.io ackmessage: ' + JSON.stringify(obj));
    fn('Ack');
  });
  socket.on('message', function (obj) {
    console.log('socket.io message: ' + obj);
  });
  socket.on('disconnect', function (reason) {
    console.log('socket.io disconnect: ' + reason);
  });
  console.log('connect: ' + socket);
});

io.of('hostStore').on('connection', function (socket) {
  socket.on('ackmessage', function (obj, fn) {
    console.log('socket.io ackmessage: ' + obj);
    fn('Ack');
  });
  socket.on('message', function (obj) {
    console.log('socket.io message: ' + obj);
  });
  socket.on('disconnect', function (reason) {
    console.log('socket.io disconnect: ' + reason);
  });
  console.log('connect: ' + socket);
});
