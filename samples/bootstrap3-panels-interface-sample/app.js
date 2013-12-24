/**
 * tequila
 * app
 */

var app = new Application();
app.set('brand', 'Sample App');

var b3p = new Bootstrap3PanelInterface();

app.setInterface(b3p);

$(document).ready(function () {
  app.start(function (stuff) {
    console.log(JSON.stringify(stuff));
  });
  b3p.mockRequest(new Request('dude'));
});

