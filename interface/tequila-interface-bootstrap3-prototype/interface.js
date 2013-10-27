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
  myInterface.homePanel();
  myInterface.renderPanel({label:'Eat'});
  myInterface.renderPanel({label:'More'});
  myInterface.renderPanel({label:'Chiken'});
};
