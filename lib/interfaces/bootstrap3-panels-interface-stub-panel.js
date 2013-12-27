/**
 * tequila
 * bootstrap3-panels-interface-stub-panel
 */

// -------------------------------------------------------------------------------------------------------------------
// Panel Handler: stub
// -------------------------------------------------------------------------------------------------------------------

Bootstrap3PanelInterface.prototype.registerStubPanel = function (self, panelBody, panelTitle, action) {
  panelBody.innerHTML = '<div class="well-fucking-well">' +
    '<h1>' + action.request.command.name + ' Command</h1>' +
    '<p>This is a stub panel</p>' +
    '</div>';
  return true;
};
