/**
 * tequila
 * message-test
 */
test.runnerMessage = function () {
  test.heading('Message Class', function () {
    test.paragraph('Messages are used by Transport to send to host or UI.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Message', true, function () {
        return new Message('Null') instanceof Message;
      });
      test.example('should make sure new operator used', Error('new operator required'), function () {
        Message('Null');
      });
      test.example('first parameter is required', Error('message type required'), function () {
        new Message();
      });
      test.example('first parameter must be valid message type', Error('Invalid message type: http://www.youtube.com/watch?v=2o7V1f7lbk4'), function () {
        test.show(T.getMessageTypes());
        new Message('http://www.youtube.com/watch?v=2o7V1f7lbk4');
      });

    });
    test.heading('METHODS', function () {
      test.heading('toString()', function () {
        test.example('should return a description of the message', 'Null Message', function () {
          return new Message('Null').toString();
        });
      });
    });
  });
};