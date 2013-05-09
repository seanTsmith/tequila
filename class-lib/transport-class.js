/**
 * tequila
 * transport-class
 */
function Transport(location,callBack,self) {
  if (false === (this instanceof Transport)) throw new Error('new operator required');
  if (typeof location != 'string') throw new Error('argument must a url string');
  if (typeof callBack != 'function') throw new Error('argument must a callback');
  var messageTypes = ['connect','disconnect','echo'];
//  callBack('','',new Error('cannot '))

  this.connected = false;
  this.initialConnect = true;
  this.socket = io.connect(location);
  this.socket.on('connect', function () {
    this.connected = true;
    this.initialConnect = false;
    console.log('socket.io connected');
  });
  this.socket.on('error', function (reason) {
    var theReason = reason;
    if (theReason.length<1) theReason = "(unknown)";
    console.error('socket.io error: ' + theReason + '.');
    // If have not ever connected then signal error
    if (!this.initialConnect) {
      callBack('','',new Error('cannot connect'))
    }
  });
  this.socket.on('message', function (obj) {
    console.log('socket.io message: ' + obj );
  });
  this.socket.on('disconnect', function (reason) {
    this.connected = false;
    console.log('Disconnected (' + reason + ').');
  });
}
