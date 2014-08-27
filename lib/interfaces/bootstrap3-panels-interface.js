/**
 * tequila
 * bootstrap3-interface
 */
function Bootstrap3PanelInterface(args) {
  if (false === (this instanceof Bootstrap3PanelInterface)) throw new Error('new operator required');
  args = args || {};
  args.name = args.name || '(unnamed)';
  args.description = args.description || 'a Interface';
  var i;
  var unusedProperties = T.getInvalidProperties(args, ['name', 'description']);
  var errorList = [];
  for (i = 0; i < unusedProperties.length; i++) errorList.push('invalid property: ' + unusedProperties[i]);
  if (errorList.length > 1)
    throw new Error('error creating Procedure: multiple errors');
  if (errorList.length) throw new Error('error creating Procedure: ' + errorList[0]);
  // default state
  this.startCallback = null;
  this.stopCallback = null;
  this.mocks = [];
  this.mockPending = false;
  // args ok, now copy to object
  for (i in args) this[i] = args[i];
}
Bootstrap3PanelInterface.prototype = T.inheritPrototype(Interface.prototype);
/*
* Methods
*/
// See bootstrap3-panels-interface-client... stub for server here
Bootstrap3PanelInterface.prototype.start = function (application, presentation, toolbarPresentation, callBack) {
  if (!(application instanceof Application)) throw new Error('Application required');
  if (!(presentation instanceof Presentation)) throw new Error('AppPresentation required');
  if (!(toolbarPresentation instanceof Presentation)) throw new Error('toolbarPresentation required');
  if (typeof callBack != 'function') throw new Error('callBack required');
  throw new Error('Bootstrap3PanelInterface unavailable in server');
};