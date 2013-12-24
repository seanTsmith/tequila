/**
 * tequila
 * app
 */

var app = new Application();
app.set('brand', 'tgiCloud');

var b3p = new Bootstrap3PanelInterface();
app.setInterface(b3p);

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
  new Command({name: 'More'}),
  new Command({name: 'Chiken'})
]);
app.setPresentation(menu);

$(document).ready(function () {
  app.start(function (stuff) {
    console.log(JSON.stringify(stuff));
  });
  b3p.mockRequest(new Request('dude'));
});
