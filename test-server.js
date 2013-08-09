
var T = require('./tequila');
console.log(T);

/**         *** CUT ABOVE AND REPASTE TEQUILA *** CUT ABOVE AND REPASTE TEQUILA ***
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

var memoryStore = new T.MemoryStore();

//io.set('log level', 1);
io.set('log', false);
io.on('connection', function (socket) {
  socket.on('ackmessage', function (obj, fn) {
    var modelContents = obj.contents;
    var pm;
    var msg;
    switch (obj.type) {
      case 'PutModel': // put model in store
        // create proxy for client model
        var ProxyPutModel = function(args) {
          Model.call(this, args);
          this.modelType = modelContents.modelType;
          for (var a in modelContents.attributes) {
            var attrib = new Attribute(modelContents.attributes[a].name);
            console.log('attrib: ' + JSON.stringify(attrib));
            if (attrib.name!='id') {
              attrib.value = modelContents.attributes[a].value;
              this.attributes.push(attrib);
            }
          }
          console.log('ProxyPutModel: ' + JSON.stringify(this));
        };
        ProxyPutModel.prototype = T.inheritPrototype(Model.prototype);
        pm = new ProxyPutModel();
        memoryStore.putModel(pm,function(model,error) {
          console.log('memoryStore.putModel: ' + JSON.stringify(model));
          msg = new Message('PutModelAck',model);
          fn(msg);
        },this);
        break;

      case 'GetModel': // Get model in store
        // create proxy for client model
        var ProxyGetModel = function(args) {
          Model.call(this, args);
          this.modelType = modelContents.modelType;
          this.attributes = [];
          for (var a in modelContents.attributes) {
            var attrib = new Attribute(modelContents.attributes[a].name,modelContents.attributes[a].type);
            console.log('attrib: ' + JSON.stringify(attrib));
            attrib.value = modelContents.attributes[a].value;
            this.attributes.push(attrib);
          }
          console.log('ProxyGetModel: ' + JSON.stringify(this));
        };
        ProxyGetModel.prototype = T.inheritPrototype(Model.prototype);
        pm = new ProxyGetModel();
        memoryStore.getModel(pm, function(model,error) {
          if (typeof error == 'undefined') {
            msg = new Message('GetModelAck',model);
            console.log('OK memoryStore.GetModel: ' + JSON.stringify(msg));
          } else {
            msg = new Message('GetModelAck',error + "");
            console.log('NG memoryStore.GetModel: ' + JSON.stringify(msg));
          }
          fn(msg);
        },this);
        break;


      case 'DeleteModel': // Delete model in store
        // create proxy for client model
        var ProxyDeleteModel = function(args) {
          Model.call(this, args);
          this.modelType = modelContents.modelType;
          this.attributes = [];
          for (var a in modelContents.attributes) {
            var attrib = new Attribute(modelContents.attributes[a].name,modelContents.attributes[a].type);
            console.log('attrib: ' + JSON.stringify(attrib));
            attrib.value = modelContents.attributes[a].value;
            this.attributes.push(attrib);
          }
          console.log('ProxyDeleteModel: ' + JSON.stringify(this));
        };
        ProxyDeleteModel.prototype = T.inheritPrototype(Model.prototype);
        pm = new ProxyDeleteModel();
        memoryStore.deleteModel(pm, function(model,error) {
          if (typeof error == 'undefined')
            msg = new Message('DeleteModelAck',model);
          else
            msg = new Message('DeleteModelAck',error);
          console.log('memoryStore.DeleteModel: ' + JSON.stringify(msg));
          fn(msg);
        },this);
        break;

      default:
        console.log('socket.io ackmessage: ' + JSON.stringify(obj));
        fn(true);
        break;
    }
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
