/*
 * tequila
 * test-runner-node-server
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

console.log(JSON.stringify(T.getVersion()))

// try to create a mongoStore
var mongo = require('mongodb');
var hostStore = new MemoryStore({name: 'Host Test Store'}); // start hoststore with memory
var mongoStore = new MongoStore({name: 'Host Test Store'});
mongoStore.onConnect('http://localhost', function (store, err) {
  if (err) {
    console.warn('mongoStore unavailable (' + err + ')');
  } else {
    console.log('mongoStore connected');
    hostStore = mongoStore; // use mongoDB for hostStore
  }
  console.log(hostStore.name + ' ' + hostStore.storeType);

});

//io.set('log level', 1);
io.set('log', false);
io.on('connection', function (socket) {
  console.log('socket.io connection: ' + socket.id);
  socket.on('ackmessage', function (obj, fn) {
    var pm;
    var msg;
    switch (obj.type) {

      case 'PutModel': // put model in store
        // create proxy for client model
        var ProxyPutModel = function (args) {
          Model.call(this, args);
          this.modelType = obj.contents.modelType;
          this.attributes = [];
          for (var a in obj.contents.attributes) {
            var attrib = new Attribute(obj.contents.attributes[a].name, obj.contents.attributes[a].type);
            if (attrib.name == 'id') { // TODO only If mongo! or refactor mongo to normalize IDs
              if (attrib.value != obj.contents.attributes[a].value)
                attrib.value = mongo.ObjectID.createFromHexString(obj.contents.attributes[a].value);
            } else {
              attrib.value = obj.contents.attributes[a].value;
            }
            this.attributes.push(attrib);
          }
        };
        ProxyPutModel.prototype = T.inheritPrototype(Model.prototype); // Todo this is not a real class object may need to make factory builder
        pm = new ProxyPutModel();
        hostStore.putModel(pm, function (model, error) {
          if (typeof error == 'undefined') {
            msg = new Message('PutModelAck', model);
          } else {
            console.log('ERROR: ' + error + "");
            msg = new Message('PutModelAck', error + "");
          }
          fn(msg);
        }, this);
        break;

      case 'GetModel': // Get model in store
        // create proxy for client model
        var ProxyGetModel = function (args) {
          Model.call(this, args);
          this.modelType = obj.contents.modelType;
          this.attributes = [];
          for (var a in obj.contents.attributes) {
            var attrib = new Attribute(obj.contents.attributes[a].name, obj.contents.attributes[a].type);
            if (attrib.name == 'id') { // TODO only If mongo! or refactor mongo to normalize IDs
              attrib.value = mongo.ObjectID.createFromHexString(obj.contents.attributes[a].value);
            } else {
              attrib.value = obj.contents.attributes[a].value;
            }
            this.attributes.push(attrib);
          }
        };
        ProxyGetModel.prototype = T.inheritPrototype(Model.prototype);
        pm = new ProxyGetModel();
        hostStore.getModel(pm, function (model, error) {
          if (typeof error == 'undefined') {
            msg = new Message('GetModelAck', model);
          } else {
            msg = new Message('GetModelAck', error + "");
          }
          fn(msg);
        }, this);
        break;

      case 'DeleteModel': // Delete model in store
        // create proxy for client model
        var ProxyDeleteModel = function (args) {
          Model.call(this, args);
          this.modelType = obj.contents.modelType;
          this.attributes = [];
          for (var a in obj.contents.attributes) {
            var attrib = new Attribute(obj.contents.attributes[a].name, obj.contents.attributes[a].type);
            if (attrib.name == 'id') { // TODO only If mongo! or refactor mongo to normalize IDs
              attrib.value = mongo.ObjectID.createFromHexString(obj.contents.attributes[a].value);
            } else {
              attrib.value = obj.contents.attributes[a].value;
            }
            this.attributes.push(attrib);
          }
        };
        ProxyDeleteModel.prototype = T.inheritPrototype(Model.prototype);
        pm = new ProxyDeleteModel();
        hostStore.deleteModel(pm, function (model, error) {
          if (typeof error == 'undefined')
            msg = new Message('DeleteModelAck', model);
          else
            msg = new Message('DeleteModelAck', error);
          fn(msg);
        }, this);
        break;

      case 'GetList': // Delete model in store
//        console.log('GetList: ' + JSON.stringify(obj));
        msg = new Message('DeleteModelAck', 'penis');
        fn(msg);
        break;

      default:
        console.log('socket.io ackmessage: ' + JSON.stringify(obj));
        fn(true);
        break;
    }
  });
  socket.on('message', function (obj) {
    console.log('message socket.io message: ' + obj);
  });
  socket.on('disconnect', function (reason) {
    console.log('message socket.io disconnect: ' + reason);
  });
});

io.of('hostStore').on('connection', function (socket) {
  console.log('hostStore socket.io connection: ' + socket.id);
  socket.on('ackmessage', function (obj, fn) {
    console.log('hostStore socket.io ackmessage: ' + obj);
    fn('Ack');
  });
  socket.on('message', function (obj) {
    console.log('hostStore socket.io message: ' + obj);
  });
  socket.on('disconnect', function (reason) {
    console.log('hostStore socket.io disconnect: ' + reason);
  });
});
