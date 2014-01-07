/**
 * tequila
 * session-test
 */
test.runnerSessionModel = function () {
  test.heading('Session Model', function () {
    test.paragraph('The Session Model represents the Session logged into the system. The library uses this for system' +
      ' access, logging and other functions.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Session', true, function () {
        return new Session() instanceof Session;
      });
      test.heading('Model tests are applied', function () {
        test.runnerModel(Session, true);
      });
    });
    test.heading('ATTRIBUTES', function () {
      test.example('following attributes are defined:', undefined, function () {
        var session = new Session(); // default attributes and values
        test.assertion(session.get('id') === null);
        test.assertion(session.get('userID') instanceof Attribute.ModelID);
        test.assertion(session.get('userID').modelType == 'User');
        test.assertion(session.get('dateStarted') instanceof Date);
        test.assertion(session.get('passCode') === null);
        test.assertion(session.get('ipAddress') === null);
        test.assertion(session.get('active') === false);
      });
    });
    test.heading('METHODS', function () {
      test.heading('startSession()', function () {
        test.paragraph('This method will create a new session record for a user.');
        test.example('parameters are store, user, password, IP and callback', undefined, function () {
          test.shouldThrow(Error('store required'), function () {
            new Session().startSession();
          });
          test.shouldThrow(Error('userName required'), function () {
            new Session().startSession(new Store());
          });
          test.shouldThrow(Error('password required'), function () {
            new Session().startSession(new Store(), 'blow');
          });
          test.shouldThrow(Error('ip required'), function () {
            new Session().startSession(new Store(), 'blow', 'me');
          });
          test.shouldThrow(Error('callBack required'), function () {
            new Session().startSession(new Store(), 'blow', 'me', 'ipman');
          });
        });
      });
      test.heading('resumeSession()', function () {
        test.paragraph('This method will resume an existing session.');
        test.example('parameters are store, IP, passcode and callback', undefined, function () {
          test.shouldThrow(Error('store required'), function () {
            new Session().resumeSession();
          });
          test.shouldThrow(Error('ip required'), function () {
            new Session().resumeSession(new Store());
          });
          test.shouldThrow(Error('passCode required'), function () {
            new Session().resumeSession(new Store(), 'ipman');
          });
          test.shouldThrow(Error('callBack required'), function () {
            new Session().resumeSession(new Store(), 'ipman', '123');
          });
        });
      });
      test.heading('endSession()', function () {
        test.paragraph('Method to end session.');
        test.example('parameters are store and callback - session object should be in memory', undefined, function () {
          test.shouldThrow(Error('store required'), function () {
            new Session().endSession();
          });
          test.shouldThrow(Error('callBack required'), function () {
            new Session().endSession(new Store());
          });
        });

      });

    });
    test.runnerSessionIntegration();
  });
};
