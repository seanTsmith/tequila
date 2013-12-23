/**
 * tequila
 * bootstrap3-panels-interface-panel
 */

// -------------------------------------------------------------------------------------------------------------------
// Panel Initialization
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.lazyInitPanel = function () {
  console.log('this.lazyInitPanel()');

  // Container so bootstrap centers
  if (!this.panelContainer) {
    this.panelContainer = document.createElement("div");
    this.panelContainer.id = "panelContainer";
    this.panelContainer.className = "container panel-container";
    document.body.appendChild(this.panelContainer);
  }

  // Keep track of panels by label#
  this.panels = {};

  // Init is done so remember that
  this.lazyInitPanelDone = true;
};

// -------------------------------------------------------------------------------------------------------------------
// Render Panel
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.renderPanel = function (action) {

  this.lazyInitPanelDone || this.lazyInitPanel();

  action = action || {};
  var label = action.label || 'Panel';
  var style = action.style || 'default';
  var type = action.type || 'unknown';
  var icon = action.icon || 'fa-question-circle';

  // This will be the panel DOM element
  var newPanel = document.createElement("div");

  // Bump element count and add panel to list
  this.eleCount++;
  var panelID = "panel" + this.eleCount;
  this.panels[panelID] = {
    eleCount: this.eleCount,
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
      this.dragSrcEl = this;
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
      if (this.dragSrcEl && this.dragSrcEl != this) {
        console.log('moving ' + this.dragSrcEl.id + ' to ' + this.id);
        this.dragSrcEl.parentNode.insertBefore(this.dragSrcEl, this);
        this.dragSrcEl = false;
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
      this.dragSrcEl = false;
      for (var p in this.panels) {
        if (this.panels.hasOwnProperty(p)) {
          this.panels[p].panel.style.opacity = '1';
        }
      }
    }, false);

  }
  newPanel.id = panelID;
  if (this.panelContainer.hasChildNodes()) {
    var firstBorn = this.panelContainer.firstChild;
    var lastBorn = firstBorn.nextSibling;
    if (lastBorn)
      this.panelContainer.insertBefore(newPanel, lastBorn);
    else
      this.panelContainer.appendChild(newPanel);
  } else {
    this.panelContainer.appendChild(newPanel);
  }

  var panelHeading = document.createElement("div");
  panelHeading.className = (type == 'home') ? "panel-heading panel-heading-home" : "panel-heading";
  newPanel.appendChild(panelHeading);

  // Title and icon for heading on panel
  var txtTitle = '<a href="javascript:this.panelClicked(' + this.eleCount + ')"><i class="fa ' + icon + '"></i> ' + label + '</a>';
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
    panelContractButton.id = "panelContractButton" + this.eleCount;
    panelContractButton.setAttribute('href', "javascript:this.panelContract(" + this.eleCount + ")");
    panelContractButton.setAttribute('data-toggle', 'tooltip');
    panelContractButton.setAttribute('title', 'Contract Panel');
    panelTitle.appendChild(panelContractButton);

    // Expand Button
    panelExpandButton.id = "panelExpandButton" + this.eleCount;
    panelExpandButton.setAttribute('href', "javascript:this.panelExpand(" + this.eleCount + ")");
    panelExpandButton.setAttribute('data-toggle', 'tooltip');
    panelExpandButton.setAttribute('title', 'Expand Panel');
    panelTitle.appendChild(panelExpandButton);

    // Contract Button
    panelCloseButton.innerHTML = '<span class="glyphicon glyphicon-remove panel-glyphs pull-right text-muted"></span>';
    panelCloseButton.setAttribute('href', "javascript:this.panelClose(" + this.eleCount + ")");
    panelCloseButton.setAttribute('data-toggle', 'tooltip');
    panelCloseButton.setAttribute('title', 'Close Panel');
    panelTitle.appendChild(panelCloseButton);

    var theStatus = (this.eleCount - 2) % 6;
    if (theStatus > 0) {
      var panelLabel = document.createElement("span");
      switch (theStatus) {
        case 1:
          panelLabel.innerHTML = 'error';
          panelLabel.className = "label label-danger pull-right";
          break;
        case 2:
          panelLabel.innerHTML = 'changed';
          panelLabel.className = "label label-warning pull-right";
          break;
        case 3:
          panelLabel.innerHTML = 'saved';
          panelLabel.className = "label label-success pull-right";
          break;
        case 4:
          panelLabel.innerHTML = 'new';
          panelLabel.className = "label label-info pull-right";
          break;
        case 5:
          panelLabel.innerHTML = 'view';
          panelLabel.className = "label label-default pull-right";
          break;
      }
      panelTitle.appendChild(panelLabel);
    }
  }

  // Panel Body is rendered by handler for type
  var panelBody = document.createElement("div");
  panelBody.className = "panel-body panel-body-" + style;
  panelBody.id = "panelBody" + this.eleCount;
  newPanel.appendChild(panelBody);
  if (!this.invokePanelHandler(type, panelBody, panelTitle)) {
    panelBody.innerHTML = '<div class="well-fucking-well"><h1>The <strong>"' + label + '"</strong> Panel</h1>' +
      '<p>This is a panel with no handler for type "' + type + '".</p>' +
      '<p>Since you are seeing it it means that there is code to write.  So stop staring at the screen and write' +
      ' some awesome code.</p></div>';
  }
  $('#panelExpandButton' + this.eleCount).hide();
  this.closeHome();

  // Scroll to top
  window.scrollTo(0, 0);

  return panelID;

};

// -------------------------------------------------------------------------------------------------------------------
// Add Panel Handler
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.addPanelHandler = function (type, callback) {
  this.panelHandlers.push({type: type, callback: callback});
};

// -------------------------------------------------------------------------------------------------------------------
// Invoke Panel Handler
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.invokePanelHandler = function (type, panelBody, panelTitle) {
  for (p in this.panelHandlers) {
    if (this.panelHandlers[p].type == type) {
      return this.panelHandlers[p].callback(this, panelBody, panelTitle);
    }
  }
  return false;
};

// -------------------------------------------------------------------------------------------------------------------
// Panel Close
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.panelClose = function (num) {
  var panelID = 'panel' + num;
  var panel = document.getElementById(panelID);

  try {
    delete this.panels[panelID];
  } catch (e) {
    console.log('error deleting panel:' + panel);
  }

  this.panelContainer.removeChild(panel);
};

// -------------------------------------------------------------------------------------------------------------------
// Panel Clicked
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.panelClicked = function (num) {
  // This panel
  var panelID = "panel" + num;
  var wasExpanded = this.panels[panelID].expanded;
  var expandedCount = 0;

  // Contract all panels
  for (var p in this.panels) {
    if (this.panels.hasOwnProperty(p)) {
      if (this.panels[p].expanded && p != panelID) {
        expandedCount++;
        this.panelContract(this.panels[p].eleCount);
      }
    }
  }
  this.closeHome();

  // Now show if need
  if (!wasExpanded || expandedCount != 1)
    this.panelExpand(num);
};

// -------------------------------------------------------------------------------------------------------------------
// Panel Expand
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.panelExpand = function (num) {
  $('#panelBody' + num).show(250, 'swing');
  $('#panelExpandButton' + num).hide();
  $('#panelContractButton' + num).show();

  var panelID = "panel" + num;
  this.panels[panelID].expanded = true;
};

// -------------------------------------------------------------------------------------------------------------------
// Panel Contract
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.panelContract = function (num) {
  $('#panelBody' + num).hide(150, 'swing');
  $('#panelExpandButton' + num).show();
  $('#panelContractButton' + num).hide();

  var panelID = "panel" + num;
  this.panels[panelID].expanded = false;
};