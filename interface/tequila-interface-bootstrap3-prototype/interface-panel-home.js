/**
 * tequila
 * interface-panel-home
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
// home Buttons on top
// -------------------------------------------------------------------------------------------------------------------
myInterface.homeSlice = function (num) {

  // First reset all home panels and hide
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
      menu.push(['Contacts','fa-group','btn-primary']);
      menu.push(['Customers','fa-user','btn-success']);
      menu.push(['Vendors','fa-truck','btn-danger']);
      menu.push(['Projects','fa-suitcase','btn-primary']);
      menu.push(['Products & Services','fa-gears','btn-warning']);
      menu.push(['Financial','fa-money','btn-info']);
      menu.push(['Organization','fa-sitemap','btn-primary']);
      menu.push(['Options','fa-gear','btn-default']);

      panelBody = document.getElementById("homePanel1");
      html = '<div class="">';
      for (var m in menu) {
        html += '<a class="btn ' + menu[m][2]  + ' ti-shortcut-button" href="javascript:myInterface.navPicked(\'' + menu[m][0] + '\')">';
        html += '<i class="fa ' + menu[m][1]  + ' fa-2x"></i>';
        html += '<div style="white-space: normal; word-wrap: break-word" class="">' + menu[m][0]  + '</div>';
        html += '</a>';
      }
      html += '</div>';
      panelBody.innerHTML = html;

//var html = '<a href="javascript:myInterface.navPicked(\'' + label + '\')">' + icon + label + '</a>';
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

  $('#homePanel' + num).show();

};
