/**
 * tequila
 * store-test
 */
test.runnerStore = function () {
  test.heading('Store Class', function () {
    test.paragraph('The store class is used for object persistence.');
    test.heading('CONSTRUCTOR', function () {
      test.runnerStoreConstructor(Store);
    });
    test.runnerStoreMethods(Store);
  });
};
test.runnerStoreConstructor = function (SurrogateStore, inheritanceTest) {
  var inheritanceTestWas = T.inheritanceTest;
  T.inheritanceTest = inheritanceTest;
  test.example('objects created should be an instance of Store', true, function () {
    return new SurrogateStore() instanceof Store;
  });
  test.example('should make sure new operator used', Error('new operator required'), function () {
    SurrogateStore();
  });
  test.example('should make sure properties are valid', Error('error creating Store: invalid property: food'), function () {
    new SurrogateStore({food: 'twinkies'});
  });
  T.inheritanceTest = inheritanceTestWas;
};
test.runnerStoreMethods = function (SurrogateStore, inheritanceTest) {
  var inheritanceTestWas = T.inheritanceTest;
  T.inheritanceTest = inheritanceTest;
  test.heading('METHODS', function () {
    var services = new SurrogateStore().getServices();  // TODO change to methods ASAP!!!
    test.example('getServices() returns an object with interface for the Store.', undefined, function () {
      test.show(services);
      test.assertion(services instanceof Object);
      test.assertion(typeof services['isReady'] == 'boolean'); // don't use until
      test.assertion(typeof services['canGetModel'] == 'boolean'); // define all allowed methods...
      test.assertion(typeof services['canPutModel'] == 'boolean');
      test.assertion(typeof services['canDeleteModel'] == 'boolean');
      test.assertion(typeof services['canGetList'] == 'boolean');
    });
    test.heading('toString()', function () {
      test.example('should return a description of the Store', "ConvenienceStore: 7-Eleven", function () {
        var cStore = new SurrogateStore();
        test.show(cStore.toString());
        cStore.name = '7-Eleven';
        cStore.storeType = 'ConvenienceStore';
        test.show(cStore.toString());
        return cStore.toString();
      });
    });
    test.heading('onConnect()', function () {
      test.example('must pass url string', Error('argument must a url string'), function () {
        new SurrogateStore().onConnect();
      });
      test.example('must pass callback function', Error('argument must a callback'), function () {
        new SurrogateStore().onConnect("");
      });
      if (services['isReady']) {
        test.example('return store and undefined error upon successful connection to remote store.', test.asyncResponse(true), function (testNode, returnResponse) {
          new SurrogateStore().onConnect('', function (store, err) {
            if (err) {
              returnResponse(testNode, err);
            } else {
              returnResponse(testNode, store instanceof Store);
            }
          });
        });
      } else {
        test.paragraph('see integration test for ' + new SurrogateStore().storeType);
      }
    });
    test.heading('getModel()', function () {
      if (services['canGetModel']) {
        test.example('must pass valid model', Error('argument must be a Model'), function () {
          new SurrogateStore().getModel();
        });
        test.example('model must have no validation errors', Error('model has validation errors'), function () {
          var m = new Model();
          m.attributes = null;
          new SurrogateStore().getModel(m);
        });
        test.example('ID attribute must have truthy value', Error('ID not set'), function () {
          new SurrogateStore().getModel(new Model());
        });
        test.example('callback function required', Error('callback required'), function () {
          var m = new Model();
          m.attributes[0].value = 1;
          new SurrogateStore().getModel(m);
        });
        if (services['isReady']) {
          test.example('returns error when model not found', test.asyncResponse(Error('model not found in store')), function (testNode, returnResponse) {
            var m = new Model();
            m.attributes[0].value = 1;
            new SurrogateStore().getModel(m, function (mod, err) {
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
        test.example('getModel() is not implemented', Error(new SurrogateStore().storeType + ' does not provide getModel'), function () {
          new SurrogateStore().getModel();
        });
      }
    });
    test.heading('putModel(model)', function () {
      if (services['canPutModel']) {
        test.example('must pass valid model', Error('argument must be a Model'), function () {
          new SurrogateStore().putModel();
        });
        test.example('model must have no validation errors', Error('model has validation errors'), function () {
          var m = new Model();
          m.attributes = null;
          new SurrogateStore().putModel(m);
        });
        test.example('callback function required', Error('callback required'), function () {
          var m = new Model();
          m.attributes[0].value = 1;
          new SurrogateStore().putModel(m);
        });
        if (services['isReady']) {
          test.example('returns error when model not found', test.asyncResponse(Error('model not found in store')), function (testNode, returnResponse) {
            var m = new Model();
            m.attributes[0].value = 1;
            new SurrogateStore().putModel(m, function (mod, err) {
              if (err) {
                returnResponse(testNode, err);
              } else {
                returnResponse(testNode, mod);
              }
            });
          });
          test.example('creates new model when ID is not set', test.asyncResponse(true), function (testNode, returnResponse) {
            var m = new Model();
            new SurrogateStore().putModel(m, function (mod, err) {
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
          new SurrogateStore().putModel();
        });
      }
    });
    test.heading('deleteModel(model)', function () {
      if (services['canDeleteModel']) {
        test.example('must pass valid model', Error('argument must be a Model'), function () {
          new SurrogateStore().deleteModel();
        });
        test.example('model must have no validation errors', Error('model has validation errors'), function () {
          var m = new Model();
          m.attributes = null;
          new SurrogateStore().deleteModel(m);
        });
        test.example('callback function required', Error('callback required'), function () {
          var m = new Model();
          m.attributes[0].value = 1;
          new SurrogateStore().deleteModel(m);
        });
        if (services['isReady']) {
          test.example('returns error when model not found', test.asyncResponse(Error('model not found in store')), function (testNode, returnResponse) {
            var m = new Model();
            m.attributes[0].value = 1;
            new SurrogateStore().deleteModel(m, function (mod, err) {
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
          new SurrogateStore().deleteModel();
        });
      }
    });
    test.heading('getList(model, filter, order)', function () {
      test.paragraph('This method will clear and populate the list with collection from store.  ' +
        'The **filter** property can be used to query the store.  ' +
        'The **order** property can specify the sort order of the list.  ' +
        '_See integration test for more info._');
      if (services['isReady'] && services['canGetList']) {
        test.example('returns a List populated from store', undefined, function () {
          test.shouldThrow(Error('argument must be a List'), function () {
            new SurrogateStore().getList();
          })
          test.shouldThrow(Error('filter argument must be Object'), function () {
            new SurrogateStore().getList(new List(new Model()));
          })
          test.shouldThrow(Error('callback required'), function () {
            new SurrogateStore().getList(new List(new Model()), []);
          })
          // See integration tests for examples of usage
        });
      } else {
        if (services['isReady'] && services['canGetList']) {
          test.example('returns a List populated from store', Error('Store does not provide getList'), function () {
            return new SurrogateStore().getList();
          });
        } else {
          test.xexample('returns a List populated from store', Error('Store does not provide getList'), function () {
            return new SurrogateStore().getList();
          });
        }
      }
    });
  });
  test.heading('PROPERTIES', function () {
    test.heading('name', function () {
      test.example('name of store can be set in constructor', 'punchedCards', function () {
        return new SurrogateStore({name: 'punchedCards'}).name;
      });
    });
    test.heading('storeType', function () {
      test.paragraph('storeType defaults to Store Class Name but can be set to suite the app architecture.');
      test.example('storeType can be set in constructor', 'legacyStorage', function () {
        return new SurrogateStore({storeType: 'legacyStorage'}).storeType;
      });
    });
  });
  T.inheritanceTest = inheritanceTestWas;
};