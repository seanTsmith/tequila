/**
 * tequila
 * app
 */

var sample = {};
var app = new Application();
app.set('brand', 'tequila');

sample.InitializeStore = function (store, callback) {
  console.log('InitializeStore...');
  var cmd = new Command({name: 'cmdInitializeStore', type: 'Procedure', contents: new Procedure({tasks: [
    function () {
      var self = this;
      var user = new User();
      user.set('name', 'admin');
      user.set('password', 'tequila');
      store.putModel(user, function (model, error) {
        if (error) throw error;
        self.complete();
      });
    } // add more to array here ...
  ]})});
  cmd.onEvent('*', function (event) {
    if (event == 'Error') {
      cmd.gotErrors = true;
      callback(new Error('InitializeStore failed'));
    }
    if (event == 'Completed') {
      if (!cmd.gotErrors)
        callback();
    }
  });
  cmd.execute();
};

var f7 = new Framework7Interface();
app.setInterface(f7);
var publicMenu = new Presentation();
publicMenu.set('name', 'Public Menu');
publicMenu.set('contents', [
//  aboutCommand,
  '-' // separator right justifies remainder
//  loginCommand
]);
app.setPresentation(publicMenu);

$(document).ready(function () {
  sample.memoryStore = new MemoryStore();
  sample.InitializeStore(sample.memoryStore, function (err) {
    if (err) {
//      var con = aboutPresentation.get('contents');
//      con.unshift('-');
//      con.unshift('####' + err);
//      con.unshift('#**ERROR**');
//      aboutPresentation.set('contents', con);
    }
    app.start(function (stuff) {
      console.log('app got stuff: ' + JSON.stringify(stuff));
    });
//    b3p.mockRequest(new Request({type: 'Command', command: aboutCommand}));
  });
});
