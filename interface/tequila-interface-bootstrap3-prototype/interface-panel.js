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
    document.getElementById('homeSlice1').className = "btn btn-primary";
    myInterface.homeSlice(1);
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
      e.dataTransfer.setData('text/html', this.innerHTML); // todo this needs to move entire element!
    }, false);

    newPanel.addEventListener('drop', function (e) {
      // this/e.target is current target element.
      if (e.stopPropagation) {
        e.stopPropagation(); // Stops some browsers from redirecting.
      }
      // Don't do anything if dropping the same column we're dragging.
      if (myInterface.dragSrcEl != this) {
        // Set the source column's HTML to the HTML of the column we dropped on.
        myInterface.dragSrcEl.innerHTML = this.innerHTML;
        this.innerHTML = e.dataTransfer.getData('text/html');
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
  var html;

  if (type == 'home') { // HOME panel

    panelTitle.className = "panel-title";
    // panelTitle.innerHTML = txtTitle;
    panelHeading.appendChild(panelTitle);

    //txtTitle = '<a class="btn btn-primary active" href="#"><i class="fa fa-home fa-2x"></i><br>Home</a>' +
    txtTitle = '' +
      '<a class="btn btn-primary" id="homeSlice1" href="javascript:myInterface.homeSlice(1)"><i class="fa fa-home fa-2x"></i><br>Home</a>' +
      '<a class="btn btn-primary" id="homeSlice2" href="javascript:myInterface.homeSlice(2)"><i class="fa fa-search fa-2x"></i><br>Find</a>' +
      '<a class="btn btn-primary" id="homeSlice3" href="javascript:myInterface.homeSlice(3)"><i class="fa fa-star fa-2x"></i><br>Starred</a>' +
      '<a class="btn btn-primary" id="homeSlice4" href="javascript:myInterface.homeSlice(4)"><i class="fa fa-book fa-2x"></i><br>History</a>' +
      '<a class="btn btn-primary" id="homeSlice5" href="javascript:myInterface.homeSlice(5)"><i class="fa fa-info-circle fa-2x"></i><br>Info</a>';

    var panelHomeButtonGroup = document.createElement("div");
    panelHomeButtonGroup.className = "btn-group btn-group-justified";
    panelHomeButtonGroup.innerHTML = txtTitle;
    panelTitle.appendChild(panelHomeButtonGroup);

    var panelBody;

    panelBody = document.createElement("div");
    panelBody.className = "panel-body ti-shortcut-panel-body";
    panelBody.id = "homePanel1";
    panelBody.innerHTML = '<div align="center" class="">' +

      '<a class="btn btn-success ti-shortcut-button" href="#">' +
      '<i class="fa fa-female fa-2x"></i>' +
      '<div style="white-space: normal; word-wrap: break-word" class="">Sex</div>' +
      '</a>' +
      '<a class="btn btn-danger ti-shortcut-button" href="#">' +
      '<i class="fa fa-coffee fa-2x"></i>' +
      '<div style="white-space: normal; word-wrap: break-word" class="">Drugs</div>' +
      '</a>' +
      '<a class="btn btn-warning ti-shortcut-button" href="#">' +
      '<i class="fa fa-music fa-2x"></i>' +
      '<div style="white-space: normal; word-wrap: break-word" class="">Rock & Roll</div>' +
      '</a>' +
      '<a class="btn btn-info ti-shortcut-button" href="#">' +
      '<i class="fa fa-female fa-2x"></i>' +
      '<div style="white-space: normal; word-wrap: break-word" class="">Sex</div>' +
      '</a>' +
      '<a class="btn btn-info ti-shortcut-button" href="#">' +
      '<i class="fa fa-female fa-2x"></i>' +
      '<div style="white-space: normal; word-wrap: break-word" class="">Sex</div>' +
      '</a>' +
      '<a class="btn btn-info ti-shortcut-button" href="#">' +
      '<i class="fa fa-female fa-2x"></i>' +
      '<div style="white-space: normal; word-wrap: break-word" class="">Sex</div>' +
      '</a>' +
      '<a class="btn btn-info ti-shortcut-button" href="#">' +
      '<i class="fa fa-female fa-2x"></i>' +
      '<div style="white-space: normal; word-wrap: break-word" class="">Sex</div>' +
      '</a>' +
      '<a class="btn btn-info ti-shortcut-button" href="#">' +
      '<i class="fa fa-female fa-2x"></i>' +
      '<div style="white-space: normal; word-wrap: break-word" class="">Sex</div>' +
      '</a>' +
      '<a class="btn btn-info ti-shortcut-button" href="#">' +
      '<i class="fa fa-female fa-2x"></i>' +
      '<div style="white-space: normal; word-wrap: break-word" class="">Sex</div>' +
      '</a>' +
      '<a class="btn btn-info ti-shortcut-button" href="#">' +
      '<i class="fa fa-female fa-2x"></i>' +
      '<div style="white-space: normal; word-wrap: break-word" class="">Sex</div>' +
      '</a>' +

      '</div>';

    newPanel.appendChild(panelBody);

    panelBody = document.createElement("div");
    panelBody.className = "panel-body";
    panelBody.id = "homePanel2";
    panelBody.innerHTML = '<div class="well well-sm well-tight">' +
      '<h1>Find Panel</h1>' +
      '<p>Oh look!</p>' +
      '<p>I have fallen in a well.</p>' +
      '</div>';
    newPanel.appendChild(panelBody);

    panelBody = document.createElement("div");
    panelBody.className = "panel-body";
    panelBody.id = "homePanel3";
    panelBody.innerHTML = '<div class="well well-sm well-tight">' +
      '<h1>Favorites (Starred) Panel</h1>' +
      '<p>Oh look!</p>' +
      '<p>I have fallen in a well.</p>' +
      '</div>';
    newPanel.appendChild(panelBody);

    panelBody = document.createElement("div");
    panelBody.className = "panel-body";
    panelBody.id = "homePanel4";
    panelBody.innerHTML = '<div class="well well-sm well-tight">' +
      '<h1>History Panel</h1>' +
      '<p>Oh look!</p>' +
      '<p>I have fallen in a well.</p>' +
      '</div>';
    newPanel.appendChild(panelBody);

    panelBody = document.createElement("div");
    panelBody.className = "panel-body";
    panelBody.id = "homePanel5";
    panelBody.innerHTML = '<div class="well well-sm well-tight">' +
      '<h1>Info Panel</h1>' +
      '<p>Oh look!</p>' +
      '<p>I have fallen in a well.</p>' +
      '</div>';
    newPanel.appendChild(panelBody);
    myInterface.homeSlice(1);

  } else { // All panels but home ...

    panelContractButton.innerHTML = '<span class="glyphicon glyphicon-chevron-left panel-glyphs pull-right text-muted"></span>';
    panelExpandButton.innerHTML = '<span class="glyphicon glyphicon-chevron-up panel-glyphs pull-right text-muted"></span>';

    panelTitle.className = "panel-title";
    panelTitle.innerHTML = txtTitle;
    panelHeading.appendChild(panelTitle);

    panelContractButton.id = "panelContractButton" + myInterface.eleCount;
    panelContractButton.setAttribute('href', "javascript:myInterface.panelContract(" + myInterface.eleCount + ")");
    panelContractButton.setAttribute('data-toggle', 'tooltip');
    panelContractButton.setAttribute('title', 'Contract Panel');
    panelTitle.appendChild(panelContractButton);

    panelExpandButton.id = "panelExpandButton" + myInterface.eleCount;
    panelExpandButton.setAttribute('href', "javascript:myInterface.panelExpand(" + myInterface.eleCount + ")");
    panelExpandButton.setAttribute('data-toggle', 'tooltip');
    panelExpandButton.setAttribute('title', 'Expand Panel');
    panelTitle.appendChild(panelExpandButton);

    // Close button
    panelCloseButton.innerHTML = '<span class="glyphicon glyphicon-remove panel-glyphs pull-right text-muted"></span>';
    panelCloseButton.setAttribute('href', "javascript:myInterface.panelClose(" + myInterface.eleCount + ")");
    panelCloseButton.setAttribute('data-toggle', 'tooltip');
    panelCloseButton.setAttribute('title', 'Close Panel');
    panelTitle.appendChild(panelCloseButton);

    html = '<div class="well well-sm well-tight"><h1>The <strong>"' + label + '"</strong> Panel</h1>' +
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

  }

  // Scroll to top
  window.scrollTo(0, 0);

  return panelID;

};

// -------------------------------------------------------------------------------------------------------------------
// home Buttons on top
// -------------------------------------------------------------------------------------------------------------------
myInterface.homeSlice = function (num) {
  var hsButton = document.getElementById('homeSlice' + num);
  var wasActive = (hsButton.className == "btn btn-primary active");
  document.getElementById('homeSlice1').className = "btn btn-primary";
  document.getElementById('homeSlice2').className = "btn btn-primary";
  document.getElementById('homeSlice3').className = "btn btn-primary";
  document.getElementById('homeSlice4').className = "btn btn-primary";
  document.getElementById('homeSlice5').className = "btn btn-primary";

  $('#homePanel1').hide();
  $('#homePanel2').hide();
  $('#homePanel3').hide();
  $('#homePanel4').hide();
  $('#homePanel5').hide();

  if (wasActive)
    hsButton.className = "btn btn-primary";
  else {
    hsButton.className = "btn btn-primary active";
    $('#homePanel' + num).show();
  }
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

  // Close Home
  document.getElementById('homeSlice1').className = "btn btn-primary";
  document.getElementById('homeSlice2').className = "btn btn-primary";
  document.getElementById('homeSlice3').className = "btn btn-primary";
  document.getElementById('homeSlice4').className = "btn btn-primary";
  document.getElementById('homeSlice5').className = "btn btn-primary";
  $('#homePanel1').hide();
  $('#homePanel2').hide();
  $('#homePanel3').hide();
  $('#homePanel4').hide();
  $('#homePanel5').hide();

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