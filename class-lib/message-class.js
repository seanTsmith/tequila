/**
 * tequila
 * message-class
 */
// Message Constructor
function Message(type,contents) {
  if (false === (this instanceof Message)) throw new Error('new operator required');
  if ('undefined' == typeof type) throw new Error('message type required');
  if (!T.contains(T.getMessageTypes(), type)) throw new Error('Invalid message type: ' + type);
  this.type = type;
}
/*
 * Methods
 */
Message.prototype.toString = function () {
  return this.type+ ' Message';
};
