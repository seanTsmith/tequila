/**
 * tequila
 * interface-panel.js
 */


// -------------------------------------------------------------------------------------------------------------------
// Home Panel
// -------------------------------------------------------------------------------------------------------------------
myInterface.homePanel = function () {
  if (!myInterface.homePanelID) {
    myInterface.homePanelID = myInterface.renderPanel({label: 'Home', type: 'home', style: 'primary', icon: 'fa-home'});
  } else {
    var num = myInterface.panels[myInterface.homePanelID].eleCount;
    myInterface.panelContract(num);
    myInterface.panelClicked(num);
  }
};

// -------------------------------------------------------------------------------------------------------------------
// Render Panel
// -------------------------------------------------------------------------------------------------------------------
myInterface.lazyInitPanel = function () {
  console.log('myInterface.lazyInitPanel()');

  // Container so bootstrap centers
  if (!myInterface.panelContainer) {
    myInterface.panelContainer = document.createElement("div");
    myInterface.panelContainer.id = "panelContainer";
    myInterface.panelContainer.className = "container";
    document.body.appendChild(myInterface.panelContainer);
  }

  // Keep track of panels by label#
  myInterface.panels = {};

  // Init is done so remember that
  myInterface.lazyInitPanelDone = true;
};


// -------------------------------------------------------------------------------------------------------------------
// Render Panel
// -------------------------------------------------------------------------------------------------------------------
myInterface.renderPanel = function (action) {

  myInterface.lazyInitPanelDone || myInterface.lazyInitPanel();

  action = action || {};
  var label = action.label || 'Panel';
  var style = action.style || 'default';
  var type  = action.type || 'unknown';
  var icon = action.icon || 'fa-question-circle';

  // This will be the panel DOM element
  var newPanel = document.createElement("div");

  // Bump element count and add panel to list
  myInterface.eleCount++;
  var panelID = "panel" + myInterface.eleCount;
  myInterface.panels[panelID] = {
    eleCount: myInterface.eleCount,
    panel: newPanel,
    expanded: true
  };

  // Finish making the DOM panel
  newPanel.className = "panel panel-" + style;
  newPanel.id = panelID;
  if (myInterface.panelContainer.hasChildNodes()) {
    var firstBorn = myInterface.panelContainer.firstChild;
    var lastBorn = firstBorn.nextSibling;
    if (lastBorn)
      myInterface.panelContainer.insertBefore(newPanel, lastBorn);
    else
      myInterface.panelContainer.appendChild(newPanel);
  } else {
    myInterface.panelContainer.appendChild(newPanel);
  }

  var panelHeading = document.createElement("div");
  panelHeading.className = "panel-heading";
  newPanel.appendChild(panelHeading);

  var txtTitle = '<a href="javascript:myInterface.panelClicked(' + myInterface.eleCount + ')"><i class="fa ' + icon + '"></i> ' + label + '</a>';

  var panelTitle = document.createElement("h3");
  panelTitle.className = "panel-title";
  panelTitle.innerHTML = txtTitle;
  panelHeading.appendChild(panelTitle);

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

  if (type != 'home') {
    var panelCloseButton = document.createElement("a");
    panelCloseButton.innerHTML = '<span class="glyphicon glyphicon-remove panel-glyphs pull-right"></span>';
    panelCloseButton.setAttribute('href', "javascript:myInterface.panelClose(" + myInterface.eleCount + ")");
    panelTitle.appendChild(panelCloseButton);
  }

  var html = '<div class="well well-sm"><h1>The <strong>"' + label + '"</strong> Panel</h1>' +
    '<p>This is a panel with no defined type.</p>' +
    '<p>Since you are seeing it it means that there is code to write.  So stop staring at the screen and write' +
    ' some awesome code.</p></div>';

  var panelBody = document.createElement("div");
  panelBody.className = "panel-body";
  panelBody.id = "panelBody" + myInterface.eleCount;
  panelBody.innerHTML = html;
  newPanel.appendChild(panelBody);

  $('#panelExpandButton' + myInterface.eleCount).hide();

  // Close the home panel
  if (myInterface.homePanelID) {
    var num = myInterface.panels[myInterface.homePanelID].eleCount;
    myInterface.panelContract(num);
  }

  return panelID;

};

// -------------------------------------------------------------------------------------------------------------------
// Panel Close
// -------------------------------------------------------------------------------------------------------------------
myInterface.panelClose = function (num) {
  var panelID = 'panel' + num;
  var panel = document.getElementById(panelID);

  try {
    delete myInterface.panels[panelID];
  } catch (e) {
    console.log('error deleting panel:' + panel);
  }

  myInterface.panelContainer.removeChild(panel);
};

// -------------------------------------------------------------------------------------------------------------------
// Panel Clicked
// -------------------------------------------------------------------------------------------------------------------
myInterface.panelClicked = function (num) {
  // This panel
  var panelID = "panel" + num;
  var wasExpanded = myInterface.panels[panelID].expanded;

  // Contract all panels
  for (var p in myInterface.panels) {
    if (myInterface.panels.hasOwnProperty(p)) {
      if (myInterface.panels[p].expanded) {
        myInterface.panelContract(myInterface.panels[p].eleCount);
      }
    }
  }

  // Now show if need
  if (!wasExpanded)
    myInterface.panelExpand(num);
};

// -------------------------------------------------------------------------------------------------------------------
// Panel Expand
// -------------------------------------------------------------------------------------------------------------------
myInterface.panelExpand = function (num) {
  $('#panelBody' + num).show();
  $('#panelExpandButton' + num).hide();
  $('#panelContractButton' + num).show();

  var panelID = "panel" + num;
  myInterface.panels[panelID].expanded=true;
};

// -------------------------------------------------------------------------------------------------------------------
// Panel Contract
// -------------------------------------------------------------------------------------------------------------------
myInterface.panelContract = function (num) {
  $('#panelBody' + num).hide();
  $('#panelExpandButton' + num).show();
  $('#panelContractButton' + num).hide();

  var panelID = "panel" + num;
  myInterface.panels[panelID].expanded=false;
};