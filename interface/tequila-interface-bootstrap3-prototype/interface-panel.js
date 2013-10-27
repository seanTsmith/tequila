/**
 * tequila
 * interface-panel.js
 */

// -------------------------------------------------------------------------------------------------------------------
// Render Panel
// -------------------------------------------------------------------------------------------------------------------
myInterface.renderPanel = function (name, panelType /* default primary success info warning danger */) {

  panelType = panelType || "default";

  myInterface.eleCount++;

  // Container so bootstrap centers
  if (!myInterface.panelContainer) {
    myInterface.panelContainer = document.createElement("div");
    myInterface.panelContainer.id = "panelContainer";
    myInterface.panelContainer.className = "container";
    document.body.appendChild(myInterface.panelContainer);
  }

  var newPanel = document.createElement("div");
  newPanel.className = "panel panel-" + panelType;
  newPanel.id = "panel" + myInterface.eleCount;
  if (myInterface.panelContainer.hasChildNodes()) {
    var firstBorn = myInterface.panelContainer.firstChild;
    myInterface.panelContainer.insertBefore(newPanel, firstBorn);
  } else {
    myInterface.panelContainer.appendChild(newPanel);
  }

  var panelHeading = document.createElement("div");
  panelHeading.className = "panel-heading";
  newPanel.appendChild(panelHeading);

  var panelTitle = document.createElement("h3");
  panelTitle.className = "panel-title";
  panelTitle.innerHTML = name;
  panelHeading.appendChild(panelTitle);

  var panelCloseButton = document.createElement("a");
  panelCloseButton.innerHTML = '<span class="glyphicon glyphicon-remove panel-glyphs pull-right"></span>';
  panelCloseButton.setAttribute('href', "javascript:myInterface.panelClose(" + myInterface.eleCount + ")");
  panelTitle.appendChild(panelCloseButton);

  var panelContractButton = document.createElement("a");
  panelContractButton.id = "panelContractButton" + myInterface.eleCount;
  panelContractButton.innerHTML = '<span class="glyphicon glyphicon-chevron-down panel-glyphs pull-right"></span>';
  panelContractButton.setAttribute('href', "javascript:myInterface.panelContract(" + myInterface.eleCount + ")");
  panelTitle.appendChild(panelContractButton);

  var panelExpandButton = document.createElement("a");
  panelExpandButton.id = "panelExpandButton" + myInterface.eleCount;
  panelExpandButton.innerHTML = '<span class="glyphicon glyphicon-chevron-up panel-glyphs pull-right"></span>';
  panelExpandButton.setAttribute('href', "javascript:myInterface.panelExpand(" + myInterface.eleCount + ")");
  panelTitle.appendChild(panelExpandButton);

  var html = '<h1>Panel</h1>' +
    '<p>This is a panel with no defined type.</p>' +
    '<p>Since you are seeing it it means that there is code to write.  So stop staring at the screen and write' +
    ' some awesome code.</p>';

  var panelBody = document.createElement("div");
  panelBody.className = "panel-body";
  panelBody.id = "panelBody" + myInterface.eleCount;
  panelBody.innerHTML = html;
  newPanel.appendChild(panelBody);

  $('#panelExpandButton' + myInterface.eleCount).hide();

};

// -------------------------------------------------------------------------------------------------------------------
// Panel Close
// -------------------------------------------------------------------------------------------------------------------
myInterface.panelClose = function (num) {
  var panelID = 'panel' + num;
  var panel = document.getElementById(panelID);
  myInterface.panelContainer.removeChild(panel);
};

// -------------------------------------------------------------------------------------------------------------------
// Panel Expand
// -------------------------------------------------------------------------------------------------------------------
myInterface.panelExpand = function (num) {
  $('#panelBody' + num).show();
  $('#panelExpandButton' + num).hide();
  $('#panelContractButton' + num).show();
};
// -------------------------------------------------------------------------------------------------------------------
// Panel Contract
// -------------------------------------------------------------------------------------------------------------------
myInterface.panelContract = function (num) {
  $('#panelBody' + num).hide();
  $('#panelExpandButton' + num).show();
  $('#panelContractButton' + num).hide();
};