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
        description - more desciptive than name (for menu's)
        type - type of command
        contents - based on type this may contain data
        scope - this can be a model that command applies to or a list

       METHODS
        execute

       TYPES
        Menu - contents is array of other commands
        View - presents a model for display and CRUD purposes
               contents is object with following properties:
                model -
                view -
                ID -
                commands -
        Dialog
        Procedure

       */
    });
  });
};