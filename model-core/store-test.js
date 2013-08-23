/**
 * tequila
 * store-test
 */
test.runnerStoreModel = function () {
  test.heading('Store Class', function () {
    test.paragraph('The store class is used for object persistence.');
    test.heading('CONSTRUCTOR', function () {
      test.runnerStoreConstructor(Store);
    });
    test.runnerStoreMethods(Store);
  });
};
test.runnerStoreConstructor = function (SurrogateStoreModel) {
  test.example('objects created should be an instance of Store', true, function () {
    return new SurrogateStoreModel() instanceof Store;
  });
  test.example('should make sure new operator used', Error('new operator required'), function () {
    SurrogateStoreModel();
  });
  test.example('should make sure properties are valid', Error('error creating Store: invalid property: food'), function () {
    new SurrogateStoreModel({food: 'twinkies'});
  });
};
test.runnerStoreMethods = function (SurrogateStoreModel) {
  test.heading('METHODS', function () {
    var interface = new SurrogateStoreModel().getStoreInterface();
    test.example('getStoreInterface() returns an object with interface for the Store.', undefined, function () {
      test.show(interface);
      test.assertion(interface instanceof Object);
      test.assertion(typeof interface['isReady'] == 'boolean'); // don't use until
      test.assertion(typeof interface['canGetModel'] == 'boolean'); // define all allowed methods...
      test.assertion(typeof interface['canPutModel'] == 'boolean');
      test.assertion(typeof interface['canDeleteModel'] == 'boolean');
      test.assertion(typeof interface['canGetList'] == 'boolean');
    });
    test.heading('toString()', function () {
      test.example('should return a description of the Store', "ConvenienceStore: 7-Eleven", function () {
        var cStore = new SurrogateStoreModel();
        test.show(cStore.toString());
        cStore.name = '7-Eleven';
        cStore.storeType = 'ConvenienceStore';
        test.show(cStore.toString());
        return cStore.toString();
      });
    });
    test.heading('onConnect()', function () {
      test.example('must pass url string', Error('argument must a url string'), function () {
        new SurrogateStoreModel().onConnect();
      });
      test.example('must pass callback function', Error('argument must a callback'), function () {
        new SurrogateStoreModel().onConnect("");
      });
      if (interface['isReady']) {
        test.example('return store and undefined error upon successful connection to remote store.', test.asyncResponse(true), function (testNode, returnResponse) {
          new SurrogateStoreModel().onConnect('', function (store, err) {
            if (err) {
              returnResponse(testNode, err);
            } else {
              returnResponse(testNode, store instanceof Store);
            }
          });
        });
      } else {
        test.paragraph('see integration test for ' + new SurrogateStoreModel().storeType);
      }
    });
    test.heading('getModel()', function () {
      if (interface['canGetModel']) {
        test.example('must pass valid model', Error('argument must be a Model'), function () {
          new SurrogateStoreModel().getModel();
        });
        test.example('model must have no validation errors', Error('model has validation errors'), function () {
          var m = new Model();
          m.attributes = null;
          new SurrogateStoreModel().getModel(m);
        });
        test.example('ID attribute must have truthy value', Error('ID not set'), function () {
          new SurrogateStoreModel().getModel(new Model());
        });
        test.example('callback function required', Error('callback required'), function () {
          var m = new Model();
          m.attributes[0].value = 1;
          new SurrogateStoreModel().getModel(m);
        });
        if (interface['isReady']) {
          test.example('returns error when model not found', test.asyncResponse(Error('model not found in store')), function (testNode, returnResponse) {
            var m = new Model();
            m.attributes[0].value = 1;
            new SurrogateStoreModel().getModel(m, function (mod, err) {
              if (err) {
                returnResponse(testNode, err);
              } else {
                returnResponse(testNode, mod);
              }
            });
          });
        } else {
          test.paragraph('skipping tests since store is not ready');
        }
      } else {
        test.example('getModel() is not implemented', Error(new SurrogateStoreModel().storeType + ' does not provide getModel'), function () {
          new SurrogateStoreModel().getModel();
        });
      }
    });
    test.heading('putModel(model)', function () {
      if (interface['canPutModel']) {
        test.example('must pass valid model', Error('argument must be a Model'), function () {
          new SurrogateStoreModel().putModel();
        });
        test.example('model must have no validation errors', Error('model has validation errors'), function () {
          var m = new Model();
          m.attributes = null;
          new SurrogateStoreModel().putModel(m);
        });
        test.example('callback function required', Error('callback required'), function () {
          var m = new Model();
          m.attributes[0].value = 1;
          new SurrogateStoreModel().putModel(m);
        });
        if (interface['isReady']) {
          test.example('returns error when model not found', test.asyncResponse(Error('model not found in store')), function (testNode, returnResponse) {
            var m = new Model();
            m.attributes[0].value = 1;
            new SurrogateStoreModel().putModel(m, function (mod, err) {
              if (err) {
                returnResponse(testNode, err);
              } else {
                returnResponse(testNode, mod);
              }
            });
          });
          test.example('creates new model when ID is not set', test.asyncResponse(true), function (testNode, returnResponse) {
            var m = new Model();
            new SurrogateStoreModel().putModel(m, function (mod, err) {
              if (err) {
                returnResponse(testNode, err);
              } else {
                returnResponse(testNode, mod.get('id') ? true : false);
              }
            });
          });
        } else {
          test.paragraph('skipping tests since store is not ready');
        }
      } else {
        test.example('putModel() is not implemented', Error('Store does not provide putModel'), function () {
          new SurrogateStoreModel().putModel();
        });
      }
    });
    test.heading('deleteModel(model)', function () {
      if (interface['canDeleteModel']) {
        test.example('must pass valid model', Error('argument must be a Model'), function () {
          new SurrogateStoreModel().deleteModel();
        });
        test.example('model must have no validation errors', Error('model has validation errors'), function () {
          var m = new Model();
          m.attributes = null;
          new SurrogateStoreModel().deleteModel(m);
        });
        test.example('callback function required', Error('callback required'), function () {
          var m = new Model();
          m.attributes[0].value = 1;
          new SurrogateStoreModel().deleteModel(m);
        });
        if (interface['isReady']) {
          test.example('returns error when model not found', test.asyncResponse(Error('model not found in store')), function (testNode, returnResponse) {
            var m = new Model();
            m.attributes[0].value = 1;
            new SurrogateStoreModel().deleteModel(m, function (mod, err) {
              if (err) {
                returnResponse(testNode, err);
              } else {
                returnResponse(testNode, mod);
              }
            });
          });
        } else {
          test.paragraph('skipping tests since store is not ready');
        }
      } else {
        test.example('deleteModel() is not implemented', Error('Store does not provide deleteModel'), function () {
          new SurrogateStoreModel().deleteModel();
        });
      }
    });
    test.heading('getList(model, filter, order)', function () {
      test.paragraph('This method will clear and populate the list with collection from store.  ' +
        'The **filter** property can be used to query the store.  ' +
        'The **order** property can specify the sort order of the list.  ' +
        '_See integration test for more info._');
      if (interface['isReady'] && interface['canGetList']) {
        test.example('returns a List populated from store', undefined, function () {
          test.shouldThrow(Error('argument must be a List'),function(){
            new SurrogateStoreModel().getList();
          })
          test.shouldThrow(Error('filter argument must be Object'),function(){
            new SurrogateStoreModel().getList(new List(new Model()));
          })
          test.shouldThrow(Error('callback required'),function(){
            new SurrogateStoreModel().getList(new List(new Model()),[]);
          })
          // See integration tests for examples of usage
        });
      } else {
        test.xexample('returns a List populated from store', Error('Store does not provide getList'), function () {
          return new SurrogateStoreModel().getList();
        });
      }
    });
  });
  test.heading('PROPERTIES', function () {
    test.heading('name', function () {
      test.example('name of store can be set in constructor', 'punchedCards', function () {
        return new SurrogateStoreModel({name: 'punchedCards'}).name;
      });
    });
    test.heading('storeType', function () {
      test.paragraph('storeType defaults to Store Class Name but can be set to suite the app architecture.');
      test.example('storeType can be set in constructor', 'legacyStorage', function () {
        return new SurrogateStoreModel({storeType: 'legacyStorage'}).storeType;
      });
    });
  });
};