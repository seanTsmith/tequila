/**
 * myInterface.js
 */

myInterface = {};
myInterface.eleCount = 0;

// -------------------------------------------------------------------------------------------------------------------
// Entry point when document ready
// -------------------------------------------------------------------------------------------------------------------
$(document).ready(function () {

  // Create html elements for framework
  myInterface.renderFramework();

  // Remover loading panel
  try {
    var loadingPanel = document.getElementById("loadingPanel");
    loadingPanel.parentNode.removeChild(loadingPanel);
  } catch (e) {
  }

});

// -------------------------------------------------------------------------------------------------------------------
// Render Framework
// -------------------------------------------------------------------------------------------------------------------
myInterface.renderFramework = function () {
  myInterface.renderNavBar();
  myInterface.renderPanel('Panel type default','default');
//  myInterface.renderPanel('Panel type primary','primary');
//  myInterface.renderPanel('Panel type success','success');
//  myInterface.renderPanel('Panel type info','info');
//  myInterface.renderPanel('Panel type warning','warning');
//  myInterface.renderPanel('Panel type danger','danger');
};
