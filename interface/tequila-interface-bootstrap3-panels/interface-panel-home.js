/**
 * tequila
 * interface-panel-home
 */

// -------------------------------------------------------------------------------------------------------------------
// Panel Handler: options
// -------------------------------------------------------------------------------------------------------------------
myInterface.addPanelHandler('home', function (panelBody, panelTitle) {

  var newPanel = panelBody.parentNode;

  var txtTitle = '' +
    '<a class="btn btn-primary" id="homeSlice1" href="javascript:myInterface.homeSlice(1)"><i class="fa fa-th fa-2x"></i><span class="hidden-xs">App</span></a>' +
    '<a class="btn btn-primary" id="homeSlice2" href="javascript:myInterface.homeSlice(2)"><i class="fa fa-search fa-2x"></i><span class="hidden-xs">Find</span></a>' +
    '<a class="btn btn-primary" id="homeSlice3" href="javascript:myInterface.homeSlice(3)"><i class="fa fa-bookmark fa-2x"></i><span class="hidden-xs">Bookmarks</span></a>' +
    '<a class="btn btn-primary" id="homeSlice4" href="javascript:myInterface.homeSlice(4)"><i class="fa fa-book fa-2x"></i><span class="hidden-xs">History</span></a>' +
    '<a class="btn btn-primary" id="homeSlice5" href="javascript:myInterface.homeSlice(5)"><i class="fa fa-info-circle fa-2x"></i><span class="hidden-xs">Info</span></a>' +
    '<a class="btn btn-primary" id="homeSlice6" href="javascript:myInterface.homeSlice(6)"><i class="fa fa-ellipsis-horizontal fa-2x"></i><span class="hidden-xs">Show</span></a>';

  var panelHomeButtonGroup = document.createElement("div");
  panelHomeButtonGroup.className = "btn-group btn-group-justified";
  panelHomeButtonGroup.innerHTML = txtTitle;
  panelTitle.appendChild(panelHomeButtonGroup);

  // wtf this is shitty code ...
  panelBody.className = "panel-body panel-body-home";
  panelBody.id = "homePanel1";

  var panelBodyInserts;
  panelBodyInserts = document.createElement("div");
  panelBodyInserts.className = "panel-body panel-body-home-inside";
  panelBodyInserts.id = "homePanel2";
  panelBodyInserts.innerHTML = '<div class="well-fucking-well">' +
    '<h1>Find Panel</h1>' +
    '<p>Oh look!</p>' +
    '<p>I have fallen in a well.</p>' +
    '</div>';
  newPanel.appendChild(panelBodyInserts);

  panelBodyInserts = document.createElement("div");
  panelBodyInserts.className = "panel-body panel-body-home-inside";
  panelBodyInserts.id = "homePanel3";
  panelBodyInserts.innerHTML = '<div class="well-fucking-well">' +
    '<h1>Favorites (Starred) Panel</h1>' +
    '<p>Oh look!</p>' +
    '<p>I have fallen in a well.</p>' +
    '</div>';
  newPanel.appendChild(panelBodyInserts);

  panelBodyInserts = document.createElement("div");
  panelBodyInserts.className = "panel-body panel-body-home-inside";
  panelBodyInserts.id = "homePanel4";
  panelBodyInserts.innerHTML = '<div class="well-fucking-well">' +
    '<h1>History Panel</h1>' +
    '<p>Oh look!</p>' +
    '<p>I have fallen in a well.</p>' +
    '</div>';
  newPanel.appendChild(panelBodyInserts);

  panelBodyInserts = document.createElement("div");
  panelBodyInserts.className = "panel-body panel-body-home-inside";
  panelBodyInserts.id = "homePanel5";
  panelBodyInserts.innerHTML = '<div class="well-fucking-well">' +
    '<h1>Info Panel</h1>' +
    '<p>Oh look!</p>' +
    '<p>I have fallen in a well.</p>' +
    '</div>';
  newPanel.appendChild(panelBodyInserts);

  myInterface.panelToolbar = document.createElement("div");
  myInterface.panelToolbar.className = "panel-footer-home";

  myInterface.panelToolbar.innerHTML = '<div class="btn-group btn-group-justified">' +
    myInterface.toolBar('fa-home', 'Home View') +
    myInterface.toolBar('fa-chevron-circle-left', 'Collapse All Panels') +
    myInterface.toolBar('fa-chevron-circle-up', 'Expand All Panels') +
    myInterface.toolBar('fa-plus-circle', 'Show Active') +
    myInterface.toolBar('fa-minus-circle', 'Close Inactive') +
    myInterface.toolBar('fa-home', 'XXX') +
    myInterface.toolBar('fa-home', 'XXX') +
    myInterface.toolBar('fa-home', 'XXX') +
    myInterface.toolBar('fa-home', 'XXX') +
    myInterface.toolBar('fa-home', 'XXX') +
    '</div>';

  newPanel.appendChild(myInterface.panelToolbar);

  // Home Command
  myInterface.homeSlice(1, true);

  return true;
});

// -------------------------------------------------------------------------------------------------------------------
// ToolBar
// -------------------------------------------------------------------------------------------------------------------
myInterface.toolBar = function (icon, tooltip) {
  var click = "javascript:myInterface.toolBarClicked('" + icon + "')";
  if (tooltip)
    return '<a class="btn btn-primary btn-toolbar" href="' + click + '" data-toggle="tooltip" title="' + tooltip + '"><i class="fa ' + icon + ' fa-2x"></i></a>';
  else
    return '<a class="btn btn-primary btn-toolbar" href="' + click + '"><i class="fa ' + icon + ' fa-2x"></i></a>';
};

// -------------------------------------------------------------------------------------------------------------------
// ToolBar
// -------------------------------------------------------------------------------------------------------------------
myInterface.toolBarClicked = function (action) {
  switch (action) {
    case 'fa-home':
      myInterface.homePanel();
      break;
  }
};

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
    myInterface.closeHome();
  }
};

// -------------------------------------------------------------------------------------------------------------------
// home Buttons on top
// -------------------------------------------------------------------------------------------------------------------
myInterface.homeSlice = function (num, quick) {

  if (num == 6) {
    var hp6 = document.getElementById('homeSlice6');
    var tb = $(myInterface.panelToolbar);
    if (tb.is(":visible")) {
      hp6.innerHTML = '<i class="fa fa-ellipsis-horizontal fa-2x"></i><span class="hidden-xs">Show</span>';
      tb.hide();
    } else {
      hp6.innerHTML = '<i class="fa fa-ellipsis-horizontal fa-2x"></i><span class="hidden-xs">Hide</span>';
      tb.show();
    }
    return;
  }

  // First reset all home panels and hide
  var hsButton = document.getElementById('homeSlice' + num);
  var wasActive = (hsButton.className == "btn btn-primary active");
  document.getElementById('homeSlice1').className = "btn btn-primary";
  document.getElementById('homeSlice2').className = "btn btn-primary";
  document.getElementById('homeSlice3').className = "btn btn-primary";
  document.getElementById('homeSlice4').className = "btn btn-primary";
  document.getElementById('homeSlice5').className = "btn btn-primary";
  var anim = 250
  if (quick) anim = 0;
  $('#homePanel1').hide(anim);
  $('#homePanel2').hide(anim);
  $('#homePanel3').hide(anim);
  $('#homePanel4').hide(anim);
  $('#homePanel5').hide(anim);

  // If we clicked on open one then just leave while all closed
  if (wasActive) {
    return;
  }

  // Make clicked button active and
  hsButton.className = "btn btn-primary active";

  // Render panel then display
  var html;
  var panelBody;
  switch (num) {

    case 1: // Home
      var menu = [];
      menu.push(['Contacts', 'fa-group', 'btn-info']);
      menu.push(['Customers', 'fa-user', 'btn-dude']);
      menu.push(['Vendors', 'fa-truck', 'btn-danger']);
      menu.push(['Projects', 'fa-suitcase', 'btn-sweet']);
      menu.push(['Products & Services', 'fa-gears', 'btn-warning']);
      menu.push(['Financial', 'fa-money', 'btn-success']);
      menu.push(['Organization', 'fa-sitemap', 'btn-primary']);
      menu.push(['Options', 'fa-gear', 'btn-default']);

      panelBody = document.getElementById("homePanel1");
      html = '<div class="">';
      for (var m in menu) {
        html += '<a class="btn ' + menu[m][2] + ' ti-shortcut-button" href="javascript:myInterface.navPicked(\'' + menu[m][0] + '\')">';
        html += '<i class="fa ' + menu[m][1] + ' fa-2x"></i>';
        html += '<div style="white-space: normal; word-wrap: break-word" class="">' + menu[m][0] + '</div>';
        html += '</a>';
      }
      html += '</div>';
      panelBody.innerHTML = html;

      break;

    case 2: // Find
      break;

    case 3: // Starred
      break;

    case 4: // History
      break;

    case 5: // Info
      break;

  }

  $('#homePanel' + num).show(250);

};

// -------------------------------------------------------------------------------------------------------------------
// Close Home
// -------------------------------------------------------------------------------------------------------------------
myInterface.closeHome = function () {
  if (myInterface.homePanelID) {
    document.getElementById('homeSlice1').className = "btn btn-primary";
    document.getElementById('homeSlice2').className = "btn btn-primary";
    document.getElementById('homeSlice3').className = "btn btn-primary";
    document.getElementById('homeSlice4').className = "btn btn-primary";
    document.getElementById('homeSlice5').className = "btn btn-primary";
    $('#homePanel1').hide(250);
    $('#homePanel2').hide(250);
    $('#homePanel3').hide(250);
    $('#homePanel4').hide(250);
    $('#homePanel5').hide(250);
  }
};
