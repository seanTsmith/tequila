/**
 * tequila
 * Request-class
 */
/*
 * Constructor
 */
function Request(args) {
  if (false === (this instanceof Request)) throw new Error('new operator required');
  if (typeof args == 'string') {
    var quickType = args;
    args = {};
    args.type = quickType;
  }
  args = args || {};
  this.type = args.type || null;
  if (!this.type || typeof this.type != 'string') throw new Error('Request type required');
  switch (this.type) {
    case 'Command':
      this.command = args.command || null;
      if (false === (this.command instanceof Command)) throw new Error('command object required');
      break;
  }
}
/*
 * Methods
 */
Request.prototype.toString = function () {
  switch (this.type) {
    case 'Command':
      return this.type + ' Request: ' + this.command;
      break;
    default:
      return this.type + ' Request';
      break;
  }
};
