/**
 * tequila
 * app
 */

var app = new Application();
app.set('brand', 'tequila');

var b3p = new Bootstrap3PanelInterface();
app.setInterface(b3p);

// Create a function command
var funcCommand = new Command({name: 'Function', type: 'Function', contents: function () {
  alert("Hello! I am an alert box!!");
}});

// Create a procedure command
procCommand = new Command({name: 'Procedure', type: 'Procedure', contents: new Procedure()});

// Create sample presentation
var pres = new Presentation();
pres.set('contents', [
  new Attribute({name: 'firstName'}),
  new Attribute({name: 'lastName'}),
  funcCommand
]);
var presCommand = new Command({name: 'Presentation', type: 'Presentation', contents: pres});

// App menu
var menu = new Presentation();
menu.set('name', 'Main Menu');
menu.set('contents', [
  new Command({name: 'Stooges', type: 'Menu', contents: [
    'The Three Stooges',
    '-',
    new Command({name: 'Moe'}),
    new Command({name: 'Larry'}),
    new Command({name: 'Curly'})
  ]}),
  new Command({name: 'Commands', type: 'Menu', contents: [
    'Command Types',
    '-',
    new Command({name: 'Stub', type: 'Stub'}),
    presCommand,
    funcCommand,
    procCommand
  ]})
]);
app.setPresentation(menu);

$(document).ready(function () {
  app.start(function (stuff) {
    console.log('app got stuff: ' + JSON.stringify(stuff));
  });
  b3p.mockRequest(new Request({type: 'Command', command: presCommand}));
});
