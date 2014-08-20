/**
 * tequila
 * app
 */

var sample = {};
var app = new Application();
app.set('brand', 'SPL Client');

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
        f7.addPageHandler('I/Os', 'fa-tasks', app.registerIOPage);
        f7.addPageHandler('Details', 'fa-tachometer', app.registerDetailPage);
        f7.addPageHandler('Alarms', 'fa-bell-o', app.registerAlarmPage);
        f7.addPageHandler('Manual Entry', 'fa-keyboard-o', app.registerProtoPage);
        f7.addPageHandler('Share', 'fa-share-alt-square', app.registerProtoPage);
        f7.addPageHandler('Historical', 'fa-calendar-o', app.registerProtoPage);
        f7.addPageHandler('Upload', 'fa-cloud', app.registerProtoPage);
        f7.addPageHandler('Background', 'fa-briefcase', app.registerProtoPage);
        f7.addPageHandler('Configure', 'fa-cog', app.registerProtoPage);
      }
    });
    f7.selectPage('More');
  });
});

/*
*
*
 Manual Entry http://fortawesome.github.io/Font-Awesome/icon/keyboard-o
 Share http://fortawesome.github.io/Font-Awesome/icon/share-alt-square
 Historical (Readings)  http://fortawesome.github.io/Font-Awesome/icon/calendar-o
 Upload (All Readings) http://fortawesome.github.io/Font-Awesome/icon/cloud
 Background (of part or plant) http://fortawesome.github.io/Font-Awesome/icon/briefcase

 *
* */

app.registerProtoPage = function (self, tab, action) {
  tab.innerHTML = '<div class="content-block-title">Placeholder</div>' +
    '<div class="content-block">' +
    '<p>This page is a placeholder...</p>' +
    '</div>';
};

app.registerAlarmPage = function (self, tab, action) {
  tab.innerHTML = '<div class="content-block-title">Alarms</div>' +
    '<div class="content-block">' +
    '<p>No Active Alarms</p>' +
    '</div>';
};

app.registerSitesPage = function (self, tab, action) {
  console.log('registerSitesPage');
  var topPart = '<div class="content-block-title">Site List</div><div class="list-block"><ul>';
  var midPart = ''; // set by setInnerHTML
  var botPart = '</ul></div>';
  for (var i = 0; i < MODEL.sites.length; i++) {
    var site = MODEL.sites[i];
    midPart += '<li><a href="#" class="item-link item-content"><div class="item-inner"><div class="item-title">' + site.name + '</div></div></a></li>';
  }
  tab.innerHTML = topPart + midPart + botPart;
};

app.registerIOPage = function (self, tab, action) {
  console.log('registerIOPage');
  var topPart = '<div class="content-block-title">ETX-3010 I/O List</div><div class="list-block"><ul>';
  var midPart = ''; // set by setInnerHTML
  var botPart = '</ul></div>';
  for (var i = 0; i < MODEL.sites[0].ioList.length; i++) {
    var io = MODEL.sites[0].ioList[i];
    midPart += '<li><a href="#" class="item-link item-content"><div class="item-inner">' +
      '<div class="item-title">' + io.label + '</div>' +
      '<div class="item-after">' + io.reading + '</div>' +
      '</div></a></li>';
  }
  tab.innerHTML = topPart + midPart + botPart;
};

app.registerDetailPage = function (self, tab, action) {
  console.log('registerDetailPage');
  var topPart = '<div class="content-block-title">PSV-1-MAB-1-GARRETT DETAILS</div><div class="list-block"><ul>';
  var midPart = ''; // set by setInnerHTML
  var botPart = '</ul></div>';
  var fields = [
    ['Site', 'SITEID', 'text'],
    ['IO Location', 'label', 'text'],
    ['Reading', 'reading', 'text'],
    ['Warn Low', 'loWarn', 'text'],
    ['Fail Low', 'loFail', 'text'],
    ['Warn High', 'hiWarn', 'text'],
    ['Fail High', 'hiFail', 'text'],
    ['Status', 'STATUS', 'text'],
    ['Work Order #', 'WONUM', 'text'],
    ['Owner', 'OWNER', 'text'],
    ['Meter', 'METER', 'text'],
    ['Asset #', 'ASSETNUM', 'text'],
    ['Work Type', 'WORKTYPE', 'text'],
    ['P.M. #', 'PMNUM', 'text'],
    ['J.P. #', 'JPNUM', 'text'],
    ['Parent WO#', 'PARENT_WONUM', 'text']
  ];
  var io = MODEL.sites[0].ioList[0];
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    midPart += '<li><div class="item-content"><div class="item-inner">' +
      '<div class="item-title label">' + field[0] + '</div>' +
      '<div class="item-input"><input readonly type="text" value="' + io[field[1]] + '"></div>' +
      '</div></div></li>';

  }
  tab.innerHTML = topPart + midPart + botPart;
};