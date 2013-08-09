/**
 * tequila
 * tequila-class.js
 */
var Tequila = (function () {
  var singletonInstance;

  function init() {
    // Private methods and variables
    var version = '0.0.1';
//    function privateMethod() {
//      console.log("I am private");
//    }
//    var privateVariable = "Im also private";
    var attributeTypes = ['ID', 'String', 'Date', 'Boolean', 'Number', 'Model', 'Group', 'Table'];
    var messageTypes = ['Null', 'Connected', 'Error', 'Sent', 'Ping', 'PutModel', 'PutModelAck', 'GetModel', 'GetModelAck', 'DeleteModel', 'DeleteModelAck'];
    return    {
      // Public methods and variables
      getVersion: function () {
        return version;
      },
      isServer: function() {
        return typeof exports !== 'undefined' && this.exports !== exports
      },

    contains: function (a, obj) {
        for (var i = 0; i < a.length; i++) {
          if (a[i] === obj) return true;
        }
        return false;
      },
      getUnusedProperties: function (properties, allowedProperties) {
        var props = [];
        for (var property in properties) {
          if (!this.contains(allowedProperties, property)) {
            props.push(property);
          }
        }
        return props;
      },
      getRegisteredStores: function () {
        return [];
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
      }
    };
  };
  return function () {
    if (!singletonInstance) singletonInstance = init();
    return singletonInstance;
  };
})();
// Library scoped ref to singleton
var T = Tequila();
