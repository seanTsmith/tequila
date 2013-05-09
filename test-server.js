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
app.use(connect.directory('../tequila', {icons:true}));
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
io.set('log level', 1);
io.sockets.on('connection', function (socket) {
  socket.on('ackmessage', function (obj,fn) {
    console.log('socket.io ackmessage: ' + obj);
    fn('Ack');
  });
  socket.on('message', function (obj) {
    console.log('socket.io message: ' + obj);
  });
  socket.on('disconnect', function (reason) {
    console.log('socket.io disconnect: ' + reason);
  });

  console.log('connect: '+socket);
//  newConnection(socket);
//  socket.on('disconnect', function (reason) {
//    connectionDropped(this,reason);
//  });
});

//function comlog(msg) {
//  var CurrentDate = new Date();
//  var hours = CurrentDate.getHours();
//  var minutes = CurrentDate.getMinutes();
//  var seconds = CurrentDate.getSeconds();
//  var ms = CurrentDate.getMilliseconds() + 10000 + "";
//  if (minutes <= 9) minutes = "0" + minutes;
//  if (seconds <= 9) seconds = "0" + seconds;
//  var currentTime = hours + ":" + minutes + ":" + seconds + "." + ms.substr(2, 3);
//  if (msg.indexOf("keepAlive") == -1)
//    console.log(currentTime + ' ' + msg);
//}
//function Connection(socket) {
//  this.clientID = '';
//  this.socket = socket;
//  this.closed = false;
//}
//function newConnection(socket) {
//  // find a unused connect, if not then add to connection list and set index to it in socket
//  socket._Connection = -1;
//  for (var i in Connections) {
//    if (socket._Connection<0 && Connections[i].closed)
//      socket._Connection= i;
//  }
//  if (socket._Connection<0)
//    socket._Connection = Connections.push(new Connection(socket))-1;
//  else {
//    Connections[socket._Connection].clientID = '';
//    Connections[socket._Connection].socket = socket;
//    Connections[socket._Connection].closed = false;
//  }
//  console.info('newConnection #'+socket._Connection);
//  socket.on('message', function (obj) {
//    processMessage(socket, obj);
//  });
//}
//function connectionDropped(socket,reason) {
//  Connections[socket._Connection].closed = true;
//  console.error("Connection #" + socket._Connection + " dropped.");
//}
//function broadcastMessage(socket, obj) {
//  comlog('[' + obj.clientID + ']-> ' + JSON.stringify(obj));
//  socket.broadcast.emit('message', obj);
//}
//function sendMessage(socket, obj) {
//  comlog('[' + obj.clientID + ']-> ' + JSON.stringify(obj));
//  socket.emit('message', obj);
//}
//function processMessage(socket, obj) {
//  comlog('[' + obj.clientID + ']<- ' + JSON.stringify(obj));
//  Connections[socket._Connection].clientID = obj.clientID;
//  //console.log('Message #' + socket._Connection + ", clientID:" + Connections[socket._Connection].clientID)
//  switch (obj.command) {
//    case 'keepAlive':
//      if (obj.clientID > 0) { // Tablet ?
//        if (tabletPings[obj.clientID - 1] < 2)
//          tabletPings[obj.clientID - 1]++;
//        sendMessage(socket, {
//          command:'keepAliveAck',
//          clientID:obj.clientID,
//          seqNo:obj.seqNo
//        });
//      } else { // Dealer
//        tabletsAlive = []; // Send alive status of tablets to dealer also
//        for (i in tabletPings) {
//          if (tabletPings[i] > 0) {
//            tabletsAlive.push(Number(i));
//          }
//        }
//        sendMessage(socket, {
//          command:'keepAliveAck',
//          clientID:obj.clientID,
//          tabletsAlive:tabletsAlive,
//          seqNo:obj.seqNo
//        });
//      }
//      break;
//    case 'playerBets':
//      // Foward to client matching playerID
//      for (var i in Connections) {
//        if (Connections[i].clientID == obj.playerID) {
//          sendMessage(Connections[i].socket,{
//            command:'playerBets',
//            clientID:obj.playerID,
//            playerID:obj.playerID,
//            cards:obj.cards
//          });
//        }
//      }
//      break;
//
//    case 'bingoBalls':
//      broadcastMessage(socket, {
//        command:'bingoBalls',
//        clientID:'*',
//        seqNo:obj.seqNo,
//        balls:obj.balls,
//        interimGame:obj.interimGame
//      });
//      break;
//
//    case 'playerDaubs':
//      // Foward to dealer
//      for (var i in Connections) {
//        if (Connections[i].clientID == '0') {
//          sendMessage(Connections[i].socket,{
//            command:'playerDaubs',
//            clientID:'0',
//            seqNo:obj.seqNo,
//            playerID:obj.clientID,
//            daubs:obj.daubs
//          });
//        }
//      }
//      break;
//
//    case 'playerDaubsAck':
//      // Foward to client matching playerID
//      for (var i in Connections) {
//        if (Connections[i].clientID == obj.playerID) {
//          sendMessage(Connections[i].socket,{
//            command:'playerDaubsAck',
//            clientID:obj.playerID,
//            seqNo:obj.seqNo
//          });
//        }
//      }
//      break;
//
//  }
//}
