/**
 * tequila
 * command-test
 */
test.runnerCommand = function () {
  test.heading('Command Class', function () {
    test.paragraph('The command design pattern is implemented with this class.');
    test.xexample('', undefined, function () {
      /* TODO

       PROPERTIES
        name - identifier name for command
        description - more descriptive than name (for menu's)
        type - type of command
        contents - based on type this may contain data
        scope - this can be a model that command applies to or a list
        executionErrors - any truthy value considered an error, this value is considered valid
                          when afterExecute is invoked to determine success of command
        beforeExecute - called after contents prepared but before command executed
                        return true to execute, false to abort command
        validate - called to verify no errors
        afterExecute - called after command is executed and about to terminate
        stepTimeout - will use system setting as default, override to set the default timeout for
                      steps used in procedures

       METHODS
        execute - executes task
        abort - aborts task (override as needed)

       TYPES

        Menu - contents is array of other commands for presentation

        View - presents a model for display and CRUD purposes
          contents is object with following properties:
            model - the model being presented
            ID - the ID of the model being presented - if null then new
            viewModel - points to model used for presentation - if null then model used
            commands - additional commands available

        Dialog - presents a dialog for user interaction
          contents is object with following properties:
            dialogModel - points to model used for presentation
            commands - additional commands available

        Function - contents contains a javascript function

        Procedure - contents array of objects containing commands for execution
          each array element is a "step" (object) with the following properties:
            label - optional label for this step of procedure
            dependencies - array of strings (or single string) corresponding to labels for the
                           step that must be resolved first
            started - set to true when step is started
            complete - set to true when the step is complete
            result - bucket to put any results
            timeout - maximum time given for task in ms - it not defined then value of maxTimeout




       */
    });
  });
};