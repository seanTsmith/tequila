/**
 * tequila
 * interface-panel.js
 */

// -------------------------------------------------------------------------------------------------------------------
// Panel Initialization
// -------------------------------------------------------------------------------------------------------------------
myInterface.lazyInitPanel = function () {
  console.log('myInterface.lazyInitPanel()');

  // Container so bootstrap centers
  if (!myInterface.panelContainer) {
    myInterface.panelContainer = document.createElement("div");
    myInterface.panelContainer.id = "panelContainer";
    myInterface.panelContainer.className = "container panel-container";
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
  var type = action.type || 'unknown';
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

  // Drop & Drag from http://www.html5rocks.com/en/tutorials/dnd/basics/#toc-examples
  newPanel.setAttribute('draggable', 'true');
  if (type != 'home') {

    newPanel.addEventListener('dragstart', function (e) {
      this.style.opacity = '0.4';
      myInterface.dragSrcEl = this;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', this.id); // todo this needs to move entire element!
      e.dataTransfer.clearData();
    }, false);

    newPanel.addEventListener('drop', function (e) {
      // this/e.target is current target element.
      if (e.stopPropagation) {
        e.stopPropagation(); // Stops some browsers from redirecting.
      }
      // Only drag if got one and not same is original
      if (myInterface.dragSrcEl && myInterface.dragSrcEl != this) {
        console.log('moving ' + myInterface.dragSrcEl.id + ' to ' + this.id);
        myInterface.dragSrcEl.parentNode.insertBefore(myInterface.dragSrcEl, this);
        myInterface.dragSrcEl = false;
      }
      return false;
    }, false);

    newPanel.addEventListener('dragover', function (e) {
      if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
      }
      e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
      return false;
    }, false);

    newPanel.addEventListener('dragenter', function (e) {
    }, false);

    newPanel.addEventListener('dragleave', function (e) {
    }, false);

    newPanel.addEventListener('dragend', function (e) {
      // Clean up
      myInterface.dragSrcEl = false;
      for (var p in myInterface.panels) {
        if (myInterface.panels.hasOwnProperty(p)) {
          myInterface.panels[p].panel.style.opacity = '1';
        }
      }
    }, false);

  }
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
  panelHeading.className = (type == 'home') ? "panel-heading panel-heading-home" : "panel-heading";
  newPanel.appendChild(panelHeading);

  // Title and icon for heading on panel
  var txtTitle = '<a href="javascript:myInterface.panelClicked(' + myInterface.eleCount + ')"><i class="fa ' + icon + '"></i> ' + label + '</a>';
  var panelContractButton = document.createElement("a");
  var panelExpandButton = document.createElement("a");
  var panelTitle = document.createElement("h3");
  var panelCloseButton = document.createElement("a");
  var html;

  panelTitle.className = "panel-title";
  panelHeading.appendChild(panelTitle);
  panelContractButton.innerHTML = '<span class="glyphicon glyphicon-chevron-left panel-glyphs pull-right text-muted"></span>';
  panelExpandButton.innerHTML = '<span class="glyphicon glyphicon-chevron-up panel-glyphs pull-right text-muted"></span>';

  if (type != 'home') {
    panelTitle.innerHTML = txtTitle;

    // Contract Button
    panelContractButton.id = "panelContractButton" + myInterface.eleCount;
    panelContractButton.setAttribute('href', "javascript:myInterface.panelContract(" + myInterface.eleCount + ")");
    panelContractButton.setAttribute('data-toggle', 'tooltip');
    panelContractButton.setAttribute('title', 'Contract Panel');
    panelTitle.appendChild(panelContractButton);

    // Expand Button
    panelExpandButton.id = "panelExpandButton" + myInterface.eleCount;
    panelExpandButton.setAttribute('href', "javascript:myInterface.panelExpand(" + myInterface.eleCount + ")");
    panelExpandButton.setAttribute('data-toggle', 'tooltip');
    panelExpandButton.setAttribute('title', 'Expand Panel');
    panelTitle.appendChild(panelExpandButton);

    // Contract Button
    panelCloseButton.innerHTML = '<span class="glyphicon glyphicon-remove panel-glyphs pull-right text-muted"></span>';
    panelCloseButton.setAttribute('href', "javascript:myInterface.panelClose(" + myInterface.eleCount + ")");
    panelCloseButton.setAttribute('data-toggle', 'tooltip');
    panelCloseButton.setAttribute('title', 'Close Panel');
    panelTitle.appendChild(panelCloseButton);
  }

  // Panel Body is rendered by handler for type
  var panelBody = document.createElement("div");
  panelBody.className = "panel-body panel-body-" + style;
  panelBody.id = "panelBody" + myInterface.eleCount;
  newPanel.appendChild(panelBody);
  if (!myInterface.invokePanelHandler(type, panelBody, panelTitle)) {
    panelBody.innerHTML = '<div class="well well-sm well-tight"><h1>The <strong>"' + label + '"</strong> Panel</h1>' +
      '<p>This is a panel with no handler for type "' + type + '".</p>' +
      '<p>Since you are seeing it it means that there is code to write.  So stop staring at the screen and write' +
      ' some awesome code.</p></div>';
  }
  $('#panelExpandButton' + myInterface.eleCount).hide();
  myInterface.closeHome();

  // Scroll to top
  window.scrollTo(0, 0);

  return panelID;

};

// -------------------------------------------------------------------------------------------------------------------
// Add Panel Handler
// -------------------------------------------------------------------------------------------------------------------
myInterface.addPanelHandler = function (type, callback) {
  myInterface.panelHandlers.push({type: type, callback: callback});
};

// -------------------------------------------------------------------------------------------------------------------
// Invoke Panel Handler
// -------------------------------------------------------------------------------------------------------------------
myInterface.invokePanelHandler = function (type, panelBody, panelTitle) {
  for (p in myInterface.panelHandlers) {
    if (myInterface.panelHandlers[p].type == type) {
      return myInterface.panelHandlers[p].callback(panelBody, panelTitle);
    }
  }
  return false;
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
  var expandedCount = 0;

  // Contract all panels
  for (var p in myInterface.panels) {
    if (myInterface.panels.hasOwnProperty(p)) {
      if (myInterface.panels[p].expanded) {
        expandedCount++;
        myInterface.panelContract(myInterface.panels[p].eleCount);
      }
    }
  }
  myInterface.closeHome();

  // Now show if need
  if (!wasExpanded || expandedCount != 1)
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
  myInterface.panels[panelID].expanded = true;
};

// -------------------------------------------------------------------------------------------------------------------
// Panel Contract
// -------------------------------------------------------------------------------------------------------------------
myInterface.panelContract = function (num) {
  $('#panelBody' + num).hide();
  $('#panelExpandButton' + num).show();
  $('#panelContractButton' + num).hide();

  var panelID = "panel" + num;
  myInterface.panels[panelID].expanded = false;
};