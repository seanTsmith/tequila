/**
 * tequila
 * bootstrap3-panels-interface-stub-panel
 */

// -------------------------------------------------------------------------------------------------------------------
// Panel Handler: stub
// -------------------------------------------------------------------------------------------------------------------

Bootstrap3PanelInterface.prototype.registerStubPanel = function (self, panel, action) {
  var panelBody = panel.panelBody;
  var panelTitle = panel.panelTitle;

  panelBody.innerHTML = '<div class="well-panel">' +
    '<h1>' + action.request.command.name + ' Command</h1>' +
    '<p>This is a stub panel</p>' +
    '</div>';
  return true;
};
