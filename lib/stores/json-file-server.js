/**
 * tequila
 * json-file-server
 */
JSONFileStore.prototype.onConnect = function (location, callBack) {
  if (typeof location != 'string') throw new Error('argument must a url string');
  if (typeof callBack != 'function') throw new Error('argument must a callback');
  callBack(this, undefined);
};
JSONFileStore.prototype.getModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (!model.attributes[0].value) throw new Error('ID not set');
  if (typeof callBack != "function") throw new Error('callBack required');
  var id = model.get('ID');
  var pathName = 'json-file-store/' + model.modelType;
  var fileName = pathName + '/' + id + '.JSON';
  fs.readFile(fileName, function (err, data) {
    if (err) {
      callBack(model, new Error('model not found in store'));
    } else {
      try {
        var dataJSON = JSON.parse(data);
        for (var name in dataJSON) {
          if (dataJSON.hasOwnProperty(name)) {
            var value = dataJSON[name];
            model.set(name, value);
          }
        }
        callBack(model);
      } catch (err) {
        callBack(model, new Error('JSON.parse ' + err));
      }
    }
  });
};
JSONFileStore.prototype.putModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callBack required');
  var id = model.get('ID');
  var pathName = 'json-file-store/' + model.modelType;
  var fileName = pathName + '/' + id + '.JSON';
  var firstTry = true;
  // If no id then make one
  if (!id) {
    id = "";
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 20; i++)
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    model.set('ID', id);
    fileName = pathName + '/' + id + '.JSON';
    _WriteFile();
  } else {
    // if id given make sure exists already
    fs.exists(fileName, function (exists) {
      if (exists)
        _WriteFile();
      else
        callBack(model, new Error('model not found in store'));
    });
  }
  function _WriteFile() {
    // copy values from model
    model.set('id', id)
    var modelValues = {};
    for (var i = 0; i < model.attributes.length; i++) {
      modelValues[model.attributes[i].name] = model.attributes[i].value;
    }
    fs.writeFile(fileName, JSON.stringify(modelValues, null, 2), function (err) {
      if (err) {
        // Try making model folder if it failed
        if (firstTry) {
          firstTry = false;
          fs.mkdir(pathName, undefined, function (err) {
            if (err) {
              if (err.code == 'EEXIST')
                _WriteFile(); // Race condition means it got created so we good
              else
                callBack(model, err);
            } else {
              _WriteFile();
            }
          });
        } else {
          callBack(model, err);
        }
      } else {
        callBack(model);
      }
    });
  }
};
JSONFileStore.prototype.deleteModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callBack required');
  var id = model.get('ID');
  var pathName = 'json-file-store/' + model.modelType;
  var fileName = pathName + '/' + id + '.JSON';
  fs.exists(fileName, function (exists) {
    if (exists) {
      fs.unlink(fileName, function (err) {
        if (err) {
          callBack(model, err);
        } else {
          model.set('id', undefined);
          callBack(model, undefined);
        }
      });
    } else
      callBack(model, new Error('model not found in store'));
  });

};
JSONFileStore.prototype.getList = function (list, filter, arg3, arg4) {
  var callBack, order;
  if (typeof(arg4) == 'function') {
    callBack = arg4;
    order = arg3;
  } else {
    callBack = arg3;
  }
  if (!(list instanceof List)) throw new Error('argument must be a List');
  if (!(filter instanceof Object)) throw new Error('filter argument must be Object');
  if (typeof callBack != "function") throw new Error('callBack required');
};
