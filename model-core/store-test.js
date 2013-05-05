/**
 * tequila
 * store-test
 */
test.runnerStoreModel = function () {
  test.heading('Store Model', function () {
    test.paragraph('The store class is used for object persistence.');
    test.heading('CONSTRUCTOR', function () {
      test.runnerStoreConstructor(Store);
    });
    test.heading('METHODS', function () {
      test.runnerStoreMethods(Store);
    });
  });
};
test.runnerStoreConstructor = function (SurrogateStoreModel) {
  test.example('objects created should be an instance of Store', true, function () {
    return new SurrogateStoreModel() instanceof Store;
  });
  test.heading('Model tests are applied', function () {
    test.runnerModel(SurrogateStoreModel, true);
  });
};
test.runnerStoreMethods = function (SurrogateStoreModel) {
  var interface = new SurrogateStoreModel().getStoreInterface();
  test.example('getStoreInterface() returns an array of method implementation for the Store.', undefined, function () {
    test.show(interface);
    test.assertion(interface instanceof Object);
    test.assertion(typeof interface['isReady'] == 'boolean');
    test.assertion(typeof interface['canGetModel'] == 'boolean');
    test.assertion(typeof interface['canPutModel'] == 'boolean');
    test.assertion(typeof interface['canDeleteModel'] == 'boolean');
  });
  test.heading('onConnect', function () {
    test.example('must pass url string', Error('argument must a url string'), function () {
      new SurrogateStoreModel().onConnect();
    });
    test.example('must pass callback function', Error('argument must a callback'), function () {
      new SurrogateStoreModel().onConnect("");
    });
    if (interface['isReady']) {
      test.example('onConnect(callback)', test.AsyncResponse(true), function (testNode, returnResponse) {
        new SurrogateStoreModel().onConnect('',function (store,err) {
          if (err) {
            returnResponse(testNode, err);
          } else {
            returnResponse(testNode, store instanceof Store);
          }
        });
      });
    } else {
      test.paragraph('see integration test for ' + new SurrogateStoreModel().modelType);
    }
  });
  test.heading('getModel', function () {
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
        test.example('returns error when model not found', test.AsyncResponse(Error('model not found in store')), function (testNode, returnResponse) {
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
        test.paragraph('skipping tests since model is not ready');
      }
    } else {
      test.example('getModel() is not implemented', Error(new SurrogateStoreModel().modelType + ' does not provide getModel'), function () {
        new SurrogateStoreModel().getModel();
      });
    }
  });
  test.heading('putModel', function () {
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
        test.example('returns error when model not found', test.AsyncResponse(Error('model not found in store')), function (testNode, returnResponse) {
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
        test.example('creates new model when ID is not set', test.AsyncResponse(true), function (testNode, returnResponse) {
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
        test.paragraph('skipping tests since model is not ready');
      }
    } else {
      test.example('putModel() is not implemented', Error('Store does not provide putModel'), function () {
        new SurrogateStoreModel().putModel();
      });
    }
  });
  test.heading('deleteModel', function () {
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
        test.example('returns error when model not found', test.AsyncResponse(Error('model not found in store')), function (testNode, returnResponse) {
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
        test.paragraph('skipping tests since model is not ready');
      }
    } else {
      test.example('deleteModel() is not implemented', Error('Store does not provide deleteModel'), function () {
        new SurrogateStoreModel().deleteModel();
      });
    }
  });
};