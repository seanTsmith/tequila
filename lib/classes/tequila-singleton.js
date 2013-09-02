/**
 * tequila
 * tequila-singleton.js
 */

var Tequila = (function () {
  var singletonInstance;
  function init() {
    // Private methods and variables
    var version = '0.1.2';
    var attributeTypes = ['ID', 'String', 'Date', 'Boolean', 'Number', 'Model', 'Group', 'Table'];
    var messageTypes = ['Null', 'Connected', 'Error', 'Sent', 'Ping', 'PutModel', 'PutModelAck', 'GetModel', 'GetModelAck', 'DeleteModel', 'DeleteModelAck', 'GetList', 'GetListAck'];
    var commandTypes = ['Stub', 'Menu', 'Presentation', 'Function', 'Procedure'];
    var commandEvents = ['BeforeExecute', 'AfterExecute', 'Error', 'Aborted', 'Completed'];
    var messageHandlers = {};
    return    {
      // Public methods and variables
      getVersion: function () {
        return version;
      },
      isServer: function () {
        return typeof exports !== 'undefined' && this.exports !== exports
      },
      contains: function (a, obj) {
        for (var i = 0; i < a.length; i++) {
          if (a[i] === obj) return true;
        }
        return false;
      },
      getInvalidProperties: function (args, allowedProperties) {
        var props = [];
        for (var property in args) {
          if (!this.contains(allowedProperties, property)) {
            props.push(property);
          }
        }
        return props;
      },
      inheritPrototype: function (p) {
        if (p == null) throw TypeError();
        if (Object.create) return Object.create(p);
        var t = typeof p;
        if (t !== "object" && typeof t !== "function") throw TypeError();
        function f() {
        };
        f.prototype = p;
        return new f();
      },
      getAttributeTypes: function () {
        return attributeTypes;
      },
      getMessageTypes: function () {
        return messageTypes;
      },
      getCommandTypes: function () {
        return commandTypes;
      },
      getCommandEvents: function () {
        return commandEvents;
      },
      setMessageHandler: function (message, handler) {
        messageHandlers[message] = handler;
      },
      hostMessageProcess: function (obj, fn) {
        if (messageHandlers[obj.type]) {
          messageHandlers[obj.type](obj.contents, fn);
        } else {
          console.log('socket.io ackmessage: ' + JSON.stringify(obj));
          fn(true); // todo should this be an error?
        }
      }
    };
  }
  return function () {
    if (!singletonInstance) singletonInstance = init();
    return singletonInstance;
  };
})();
// Library scoped ref to singleton
var T = Tequila();
