/**
 * tequila
 * app
 */

var sample = {};
var app = new Application();
app.set('brand', 'Apollo Prototype');

sample.InitializeStore = function (store, callback) {
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

var f7 = new Framework7Interface({name: 'Framework7Interface'});
app.setInterface(f7);

// About App
var aboutPresentation = new Presentation();
aboutPresentation.set('contents', [
    '####ABOUT TEQUILA\n\n' +
    'Tequila is a distilled beverage made from the blue agave plant, primarily in the area surrounding the city of ' +
    'Tequila, 65 km northwest of Guadalajara, and in the highlands of the north western Mexican state of Jalisco.\n\n' +
    JSON.stringify(bowser, null, '\t')
]);
var aboutCommand = new Command({name: 'About', type: 'Presentation', contents: aboutPresentation});

// App menu
var privateMenu = new Presentation();
privateMenu.set('name', 'Private Menu');
privateMenu.set('contents', [
  aboutCommand
]);

app.setPresentation(privateMenu);

$(document).ready(function () {
  sample.memoryStore = new MemoryStore();
  sample.InitializeStore(sample.memoryStore, function (err) {
    if (err) {
    }
    app.start(function (stuff) {
      console.log('app got stuff: ' + JSON.stringify(stuff));
      if (stuff == 'loadPages') {
        f7.addPageHandler('Sites', 'fa-building-o', app.registerSitesPage);
        f7.addPageHandler('I/Os', 'fa-tasks', app.registerProtoPage);
        f7.addPageHandler('Details', 'fa-tachometer', app.registerProtoPage);
        f7.addPageHandler('Alarms', 'fa-bell-o', app.registerProtoPage);
        f7.addPageHandler('Manual Read', 'fa-pencil-square-o', app.registerProtoPage);
        f7.addPageHandler('Configure', 'fa-cog', app.registerProtoPage);
        f7.addPageHandler('Account', 'fa-user', app.registerProtoPage);
        f7.addPageHandler('Configure', 'fa-cog', app.registerProtoPage);
        f7.addPageHandler('Configure', 'fa-cog', app.registerProtoPage);
        f7.addPageHandler('Configure', 'fa-cog', app.registerProtoPage);
        f7.addPageHandler('Configure', 'fa-cog', app.registerProtoPage);
      }
    });
    f7.selectPage('Sites');
  });
});

app.registerProtoPage = function (self, tab, action) {
  tab.innerHTML = '<div class="content-block-title">Placeholder</div>' +
    '<div class="content-block">' +
    '<p>This page is a placeholder...</p>' +
    '</div>';
};

app.registerSitesPage = function (self, tab, action) {

  var topPart = '<div class="content-block-title">Site List</div><div class="list-block"><ul>';
  var midPart = ''; // set by setInnerHTML
  var botPart = '</ul></div>';

  for (var i = 0; i < MODEL.sites.length; i++) {
    var site = MODEL.sites[i];
    midPart += '<ul><li><a href="#" class="item-link item-content"><div class="item-inner"><div class="item-title">' + MODEL.sites[i].name + '</div></div></a></li></ul>'
  }

  tab.innerHTML = topPart + midPart + botPart;

};





