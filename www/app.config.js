var appVer = "0.8.2";
var nullDeviceType = "PC";
var asUserList = [];
var pushChn = "";
var deviceid = "";
var serviceURL = "http://218.104.52.26/AsapmentWebAPI";
var debugMode = true;
var getCHNRetry = 0;
var currentUser = "";

//var serviceURL = "http://180.166.252.90:20191/WebAPITest";
//var serviceURL = "http://58.221.237.66:8005/NBIWebAPI";

window.Mobile = $.extend(true, window.Mobile, {
  "config": {
    "layoutSet": "navbar",
    "navigation": [
      {
        "title": "功能",
        "onExecute": "#BarcodeMenu",
        "icon": "menu"
      },
      {
        "title": "我的",
        "onExecute": "#UserCenter",
        "icon": "preferences"
      }
    ],
    "navigationEN": [
      {
        "title": "Menu",
        "onExecute": "#Func",
        "icon": "menu"
      },
      {
        "title": "My",
        "onExecute": "#UserCenter",
        "icon": "preferences"
      }
    ],
    "commandMapping": {
      "generic-header-toolbar": {
        "commands": [
          {
            "id": "btnBKFNew",
            "location": "after"
          },
          {
            "id": "btnLogoff",
            "location": "after"
          },
          {
            "id": "btnScan",
            "location": "after"
          },
          {
            "id": "btnHide",
            "location": "before"
          }
        ]
      }
    }
  }
});