/**
 * tequila
 * log-test
 */
test.runnerLogModel = function () {
  test.heading('Log Model', function () {
    test.paragraph('Multi purpose log model.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Workspace', true, function () {
        return new Log() instanceof Log;
      });
      test.heading('Model tests are applied', function () {
        test.runnerModel(Log, true);
      });
      test.heading('ATTRIBUTES', function () {
        test.example('following attributes are defined:', undefined, function () {
          var log = new Log('what up'); // default attributes and values
          test.assertion(log.get('id') !== undefined);
          test.assertion(log.get('dateLogged') instanceof Date);
          test.show(log.get('dateLogged'));
          test.assertion(log.get('logType') == 'Text');
          test.assertion(log.get('importance') == 'Info');
          test.assertion(log.get('contents') == 'what up');
        });
      });
      test.heading('LOG TYPES', function () {
        test.example('must be valid', Error('Unknown log type: wood'), function () {
          test.show(T.getLogTypes());
          new Log({logType: 'wood'}); // default attributes and values
        });
        test.example('Delta is simple text message', 'Info: sup', function () {
          return new Log('sup');
        });
        test.example('Text is simple text message', 'Info: (delta)', function () {
          var delta = new Delta(new Attribute.ModelID(new Model()));
          return new Log({logType: 'Delta', contents: delta}).toString();
        });
      });
    });
  });
};
