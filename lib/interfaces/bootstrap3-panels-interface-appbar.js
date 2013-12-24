/**
 * tequila
 * bootstrap3-panels-interface-appbar
 */

// -------------------------------------------------------------------------------------------------------------------
// Panel Handler: options
// -------------------------------------------------------------------------------------------------------------------
//Bootstrap3PanelInterface.addPanelHandler('home', function (panelBody, panelTitle) {
Bootstrap3PanelInterface.prototype.registerAppBar = function (self, panelBody, panelTitle) {

  var newPanel = panelBody.parentNode;

  var txtTitle = '' +
    '<a class="btn btn-primary" id="homeSlice1" href="javascript:b3p.homeSlice(1)"><i class="fa fa-th fa-2x"></i><span class="hidden-xs">' + app.get('brand') + '</span></a>' +
    '<a class="btn btn-primary" id="homeSlice2" href="javascript:b3p.homeSlice(2)"><i class="fa fa-search fa-2x"></i><span class="hidden-xs">Find</span></a>' +
    '<a class="btn btn-primary" id="homeSlice3" href="javascript:b3p.homeSlice(3)"><i class="fa fa-bookmark fa-2x"></i><span class="hidden-xs">Bookmarks</span></a>' +
    '<a class="btn btn-primary" id="homeSlice4" href="javascript:b3p.homeSlice(4)"><i class="fa fa-book fa-2x"></i><span class="hidden-xs">History</span></a>' +
    '<a class="btn btn-primary" id="homeSlice5" href="javascript:b3p.homeSlice(5)"><i class="fa fa-info-circle fa-2x"></i><span class="hidden-xs">Info</span></a>' +
    '<a class="btn btn-primary" id="homeSlice6" href="javascript:b3p.homeSlice(6)"><i class="fa fa-ellipsis-horizontal fa-2x"></i><span class="hidden-xs">More</span></a>';

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

  self.panelToolbar = document.createElement("div");
  self.panelToolbar.className = "panel-footer-home";

  self.panelToolbar.innerHTML = '<div class="btn-group btn-group-justified">' +
    self.toolBar('fa-home', 'Home View') +
    self.toolBar('fa-chevron-circle-left', 'Collapse All Panels') +
    self.toolBar('fa-chevron-circle-up', 'Expand All Panels') +
    self.toolBar('fa-plus-circle', 'Show Active') +
    self.toolBar('fa-minus-circle', 'Close Inactive') +
    self.toolBar('fa-question', 'This spot is available for hire.') +
    self.toolBar('fa-question', 'This spot is available for hire.') +
    self.toolBar('fa-question', 'This spot is available for hire.') +
    self.toolBar('fa-question', 'This spot is available for hire.') +
    self.toolBar('fa-question', 'This spot is available for hire.') +
    '</div>';

  newPanel.appendChild(self.panelToolbar);
  $(self.panelToolbar).hide();


  // Home Command
  self.homeSlice(1, true);

  return true;
};

// -------------------------------------------------------------------------------------------------------------------
// ToolBar
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.toolBar = function (icon, tooltip) {
  var click = "javascript:b3p.toolBarClicked('" + icon + "')";
  if (tooltip)
    return '<a class="btn btn-primary btn-toolbar" href="' + click + '" data-toggle="tooltip" title="' + tooltip + '"><i class="fa ' + icon + ' fa-2x"></i></a>';
  else
    return '<a class="btn btn-primary btn-toolbar" href="' + click + '"><i class="fa ' + icon + ' fa-2x"></i></a>';
};

// -------------------------------------------------------------------------------------------------------------------
// ToolBar
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.toolBarClicked = function (action) {
  switch (action) {
    case 'fa-home':
      this.homePanel();
      break;
  }
};

// -------------------------------------------------------------------------------------------------------------------
// Home Panel
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.homePanel = function () {
  if (!this.homePanelID) {
    this.homePanelID = this.renderPanel({label: 'Home', type: 'home', style: 'primary', icon: 'fa-home'});
  } else {
    var num = this.panels[this.homePanelID].eleCount;
    this.panelContract(num);
    this.panelClicked(num);
    this.closeHome();
  }
};

// -------------------------------------------------------------------------------------------------------------------
// home Buttons on top
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.homeSlice = function (num, quick) {

  if (num == 6) {
    var hp6 = document.getElementById('homeSlice6');
    var tb = $(this.panelToolbar);
    if (tb.is(":visible")) {
      hp6.innerHTML = '<i class="fa fa-ellipsis-horizontal fa-2x"></i><span class="hidden-xs">More</span>';
      tb.hide();
    } else {
      hp6.innerHTML = '<i class="fa fa-ellipsis-horizontal fa-2x"></i><span class="hidden-xs">Less</span>';
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
//      menu.push(['Contacts', 'fa-group', 'btn-info']);
//      menu.push(['Customers', 'fa-user', 'btn-dude']);
//      menu.push(['Vendors', 'fa-truck', 'btn-danger']);
//      menu.push(['Projects', 'fa-suitcase', 'btn-sweet']);
//      menu.push(['Products & Services', 'fa-gears', 'btn-warning']);
//      menu.push(['Financial', 'fa-money', 'btn-success']);
//      menu.push(['Organization', 'fa-sitemap', 'btn-primary']);
//      menu.push(['System', 'fa-power-off', 'btn-default']);


      // Render commands
      var pres;
      var menuContents = this.presentation.get('contents');
      for (pres in menuContents) {
        menu.push([menuContents[pres].name, 'fa-question', 'btn-default']);
      }


      panelBody = document.getElementById("homePanel1");
      html = '<div class="">';
      for (var m in menu) {
        html += '<a class="btn ' + menu[m][2] + ' ti-shortcut-button" href="javascript:b3p.navPicked(\'' + menu[m][0] + '\')">';
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
Bootstrap3PanelInterface.prototype.closeHome = function () {
  if (this.homePanelID) {
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
