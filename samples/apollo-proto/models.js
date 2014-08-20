/**
 * tequila
 * models
 */

var MODEL = {

  sites: [
    {name: 'ETX-3010'},
    {name: 'SJS-3001'},
    {name: 'Site 3'},
    {name: 'Site 4'},
    {name: 'Site 5'},
    {name: 'Site 6'},
    {name: 'Site 7'},
    {name: 'Site 8'},
    {name: 'Site 9'}
  ]

};

(function () {

  // Create IO From Scott's data
  for (var i = 0; i < DATA.length; i++) {
    var record = DATA[i];
    var site = MODEL.sites[record.SITEID == 'SJS-3001' ? 1 : 0];
    if (!site.ioList)
      site.ioList = [];
    site.ioList.push(
      {
        label: record.LOCATION,
        reading: record.PRESSURE,
        loWarn: record.PRESSURE - (.25 * record.PRESSURE),
        loFail: record.PRESSURE - (.5 * record.PRESSURE),
        hiWarn: record.PRESSURE + (.25 * record.PRESSURE),
        hiFail: record.PRESSURE + (.5 * record.PRESSURE),
        SITEID: record.SITEID,
        STATUS: record.STATUS,
        WONUM: record.WONUM,
        OWNER: record.OWNER,
        LOCATION: record.LOCATION,
        METER: record.METER,
        ASSETNUM: record.ASSETNUM,
        PRESSURE: record.PRESSURE,
        WORKTYPE: record.WORKTYPE,
        PMNUM: record.PMNUM,
        JPNUM: record.JPNUM,
        PARENT_WONUM: record.PARENT_WONUM
      });
  }

  // high 25% high high 50%

  // Fill in rest with junk
  for (var i = 0; i < MODEL.sites.length; i++) {
    var site = MODEL.sites[i];
    if (!site.ioList) {
      site.ioList = [
        {label: 'LABEL1', reading: 264, loWarn: 250, loFail: 225, hiWarn: 275, hiFail: 300},
        {label: 'LABEL2', reading: 262, loWarn: 250, loFail: 225, hiWarn: 275, hiFail: 300},
        {label: 'LABEL3', reading: 264, loWarn: 250, loFail: 225, hiWarn: 275, hiFail: 300},
        {label: 'LABEL4', reading: 266, loWarn: 250, loFail: 225, hiWarn: 275, hiFail: 300},
        {label: 'LABEL5', reading: 261, loWarn: 250, loFail: 225, hiWarn: 275, hiFail: 300},
        {label: 'LABEL6', reading: 268, loWarn: 260, loFail: 245, hiWarn: 275, hiFail: 300},
        {label: 'LABEL7', reading: 256, loWarn: 260, loFail: 245, hiWarn: 275, hiFail: 300},
        {label: 'LABEL8', reading: 242, loWarn: 260, loFail: 245, hiWarn: 275, hiFail: 300},
        {label: 'LABEL9', reading: 234, loWarn: 260, loFail: 245, hiWarn: 275, hiFail: 300}
      ];
    }
  }

})();