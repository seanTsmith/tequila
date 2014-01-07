/**
 * tequila
 * session-model
 */
// Model Constructor
var Session = function (args) {
  if (false === (this instanceof Session)) throw new Error('new operator required');
  args = args || {};
  if (!args.attributes) {
    args.attributes = [];
  }
  var userModelID = new Attribute.ModelID(new User());
  args.attributes.push(new Attribute({name: 'userID', type: 'Model', value: userModelID}));
  args.attributes.push(new Attribute({name: 'dateStarted', type: 'Date', value: new Date()}));
  args.attributes.push(new Attribute({name: 'passCode', type: 'String(20)'}));
  args.attributes.push(new Attribute({name: 'active', type: 'Boolean'}));
  args.attributes.push(new Attribute({name: 'ipAddress', type: 'String'}));

  Model.call(this, args);
  this.modelType = "Session";
  this.set('active', false);
};
Session.prototype = T.inheritPrototype(Model.prototype);
/*
 * Methods
 */
Session.prototype.startSession = function (store, userName, password, ip, callBack) {
  if (false === (store instanceof Store)) throw new Error('store required');
  if (typeof userName !== 'string') throw new Error('userName required');
  if (typeof password !== 'string') throw new Error('password required');
  if (typeof ip !== 'string') throw new Error('ip required');
  if (typeof callBack != 'function') throw new Error('callBack required');

  // Find user in store
  var self = this;
  var userModel = new User();
  store.getList(new List(userModel), {name: userName, password: password}, function (list, error) {
    if (error) {
      callBack(error);
      return;
    }
    if (list.length() != 1) {
      callBack(new Error('login not found'));
      return;
    }

    // Make random passCode
    var passCode = "";
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 20; i++)
      passCode += chars.charAt(Math.floor(Math.random() * chars.length));

    // Got user create new session
    list.moveFirst();
    self.set('userID', list.get('id'));
    self.set('active', true);
    self.set('passCode', passCode);
    self.set('ipAddress', ip);
    store.putModel(self, function (model, error) {
      callBack(error, model);
    });
  });
};
Session.prototype.resumeSession = function (store, ip, passCode, callBack) {
  if (false === (store instanceof Store)) throw new Error('store required');
  if (typeof ip !== 'string') throw new Error('ip required');
  if (typeof passCode !== 'string') throw new Error('passCode required');
  if (typeof callBack != 'function') throw new Error('callBack required');

  // Find the session in store
  var self = this;
  store.getList(new List(self), {ipAddress: ip, passCode: passCode}, function (list, error) {
    if (error) {
      callBack(error);
      return;
    }
    if (list.length() != 1) {
      callBack(new Error('session not resumed'));
      return;
    }

    // Get model for session as shitty as this is (TODO a better way)
    list.moveFirst();
    self.set('id', list.get('id'));
    self.set('userID', list.get('userID'));
    self.set('dateStarted', list.get('dateStarted'));
    self.set('passCode', list.get('passCode'));
    self.set('active', list.get('active'));
    self.set('ipAddress', list.get('ipAddress'));
    callBack(error, self);
  });

};
Session.prototype.endSession = function (store, callBack) {
  if (false === (store instanceof Store)) throw new Error('store required');
  if (typeof callBack != 'function') throw new Error('callBack required');

  // If no session ID (never persisted) or is not active then silently return
  if (!this.get('active') || !this.get('id')) {
    callBack(this);
  }
  // Mark inactive and save to store
  this.set('active', false);
  store.putModel(this, function (model, err) {
    callBack(err, model);
  });
}