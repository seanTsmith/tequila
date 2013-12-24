/**
 * tequila
 * app
 */

var app = new Application();
app.set('brand', 'Sample App');

var b3p = new Bootstrap3PanelInterface();
var menu = new Presentation();
menu.set('name', 'Main Menu');
menu.set('contents', [
  new Command({name: 'Eat'}),
  new Command({name: 'More'}),
  new Command({name: 'Chiken'})
]);


app.setPresentation(menu);
app.setInterface(b3p);

$(document).ready(function () {
  app.start(function (stuff) {
    console.log(JSON.stringify(stuff));
  });
  b3p.mockRequest(new Request('dude'));
});

