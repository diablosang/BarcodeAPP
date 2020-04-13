window.Mobile = window.Mobile || {};

if (!Array.prototype.find) {
    Array.prototype.find = function (callback) {
        return callback && (this.filter(callback) || [])[0];
    };
}

var serverVer;
var asapmentMenuData;

$(function () {
    var startView = "Login"; 
    var start = "";//"NBI";//"NBIDEBUG";

    DevExpress.devices.current({ platform: "generic" });

    $(document).on("deviceready", function () {
        
        StatusBar.backgroundColorByHexString("#4a7087");

        navigator.splashscreen.hide();
        if (window.devextremeaddon) {
            window.devextremeaddon.setup();
        }
        $(document).on("backbutton", function () {
            DevExpress.processHardwareBackButton();
        });

        var uuid = device.uuid;
        deviceid = uuid;

        //window.JPush.init();
        //window.setTimeout(GetRegistrationID, 1000);

        //if (device.platform != "Android") {
        //    window.JPush.setApplicationIconBadgeNumber(0);
        //}

        try {
            window.open = cordova.InAppBrowser.open;
        }
        catch (e) { }
    });

    function GetRegistrationID() {
        window.JPush.getRegistrationID(function (rid) {
            try {
                if (rid == null || rid == "") {
                    var t1 = window.setTimeout(GetRegistrationID, 1000);
                    return;
                }
                pushChn = rid;
            }
            catch (e) {
                DevExpress.ui.notify(e, "error", 3000);
            }
        });
    }

    function onNavigatingBack(e) {
        if (e.isHardwareButton && !Mobile.app.canBack()) {
            e.cancel = true;
            exitApp();
        }
    }

    function exitApp() {
        switch (DevExpress.devices.real().platform) {
            case "android":
                navigator.app.exitApp();
                break;
            case "win":
                window.external.Notify("DevExpress.ExitApp");
                break;
        }
    }

    if (DeviceLang() == "CHS") {
        Mobile.app = new DevExpress.framework.html.HtmlApplication({
            namespace: Mobile,
            layoutSet: DevExpress.framework.html.layoutSets[Mobile.config.layoutSet],
            navigation: Mobile.config.navigation,
            commandMapping: Mobile.config.commandMapping
        });

        SysMsg = chsMsg;
    }
    else {
        Mobile.app = new DevExpress.framework.html.HtmlApplication({
            namespace: Mobile,
            layoutSet: DevExpress.framework.html.layoutSets[Mobile.config.layoutSet],
            navigation: Mobile.config.navigationEN,
            commandMapping: Mobile.config.commandMapping
        });

        SysMsg = engMsg;
    }
    Mobile.app.router.register(":view", { view: startView});
    Mobile.app.on("navigatingBack", onNavigatingBack);
    Mobile.app.on("viewShown", function (e) {
        var viewModel = e.viewInfo.model;
        if (viewModel.hideLayout == true) {
            $("#layout_header").hide();
            $("#layout_footer").hide();
            $("#layout_viewfooter").hide();
            $("#layout-content").css("bottom", 0);

        }
        else {
            $("#layout_header").show();
            if (viewModel.hideFoot == true) {
                $("#layout_footer").hide();
                $("#layout_viewfooter").hide();
                $("#layout-content").css("bottom", 0);
            }
            else {
                $("#layout_footer").show();
                $("#layout_viewfooter").show();
                $("#layout-content").css("bottom", "68px");
            }
        }
    });

    Mobile.app.navigate();
});

