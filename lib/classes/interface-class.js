/**
 * tequila
 * interface-class
 */
/*
 * Constructor
 */
function Interface(args) {
  if (false === (this instanceof Interface)) throw new Error('new operator required');
  args = args || {};
  args.name = args.name || '(unnamed)';
  args.description = args.description || 'a Interface';
  var i;
  var unusedProperties = T.getInvalidProperties(args, ['name', 'description']);
  var badJooJoo = [];
  for (i = 0; i < unusedProperties.length; i++) badJooJoo.push('invalid property: ' + unusedProperties[i]);
  if (badJooJoo.length > 1)
    throw new Error('error creating Procedure: multiple errors');
  if (badJooJoo.length) throw new Error('error creating Procedure: ' + badJooJoo[0]);
  // default state
  this.startCallback = null;
  this.stopCallback = null;
  this.mocks = [];
  this.mockPending = false;
  // args ok, now copy to object
  for (i in args) this[i] = args[i];
}
/*
 * Methods
 */
Interface.prototype.toString = function () {
  return this.description;
};
Interface.prototype.canMock = function () {
  return false;
};
Interface.prototype.doMock = function () {
  // If no more elements then we are done
  this.mockPending = false;
  if (this.mocks.length < 1)
    return;
  // Get oldest ele and pass to callback if it is set
  var thisMock = this.mocks.shift();
  if (this.startCallback) {
    this.startCallback(thisMock);
  }
  // Invoke for next element (delayed execution)
  this.mockPending = true;
  var self = this;
  setTimeout(function () {
    self.doMock();
  }, 0);
};
Interface.prototype.mockRequest = function (args) {
  if (!(args instanceof Array || args instanceof Command)) throw new Error('missing command parameter');
  if (!(args instanceof Array)) args = [args]; // coerce to array
  var i;
  for (i = 0; i < args.length; i++) {
    if (false === (args[i] instanceof Command)) throw new Error('invalid command parameter');
  }
  // All good stack them
  for (i = 0; i < args.length; i++) {
    this.mocks.push(args[i]);
  }
  // If mock is not pending then start it
  if (!this.mockPending) {
    this.doMock();
  }
};
Interface.prototype.start = function (application, presentation, callBack) {
  if (!(application instanceof Application)) throw new Error('Application required');
  if (!(presentation instanceof Presentation)) throw new Error('Presentation required');
  if (typeof callBack != 'function') throw new Error('callback required');
  this.startCallback = callBack;
};
Interface.prototype.stop = function (callBack) {
  if (typeof callBack != 'function') throw new Error('callback required');
};
Interface.prototype.notify = function (request) {
  if (false === (request instanceof Request)) throw new Error('Request required');
};
Interface.prototype.render = function (presentation, callBack) {
  if (false === (presentation instanceof Presentation)) throw new Error('Presentation object required');
  if (callBack && typeof callBack != 'function') throw new Error('optional second argument must a commandRequest callback function');
};
