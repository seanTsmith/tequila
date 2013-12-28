/**
 * tequila
 * bootstrap3-panels-interface-presentation-panel
 */

// -------------------------------------------------------------------------------------------------------------------
// Panel Handler: presentation
// -------------------------------------------------------------------------------------------------------------------

Bootstrap3PanelInterface.prototype.registerPresentationPanel = function (self, panelBody, panelTitle, action) {

  // Get the presentation contents
  var contents = action.request.command.contents.get('contents');




  panelBody.innerHTML = '<div class="well-fucking-well">' +
    '<h1>' + action.request.command.name + ' Command</h1>' +
    '<p>This is a presentation...</p><br>' +
    '<p>' + JSON.stringify(contents) + '</p>' +
    '</div>';
  return true;
};
