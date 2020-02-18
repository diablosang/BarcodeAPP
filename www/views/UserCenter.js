Mobile.UserCenter = function (params) {
    "use strict";

    var viewModel = {
        viewShown: function (e) {
            $("#appver").text(appVer);
            SetLanguage();
        },
        onLogoffClick: function () {
            var sessionStorage = window.sessionStorage;
            var u = sessionStorage.getItem("username");

            if (u == null) {
                return;
            }

            Mobile.app.viewCache.clear();
            sessionStorage.removeItem("username");
            var url = serviceURL + "/Api/Asapment/Logoff?UserName=" + u;
            $.ajax({
                type: 'GET',
                url: url,
                cache: false,
                success: function (data, textStatus) {
                    var view = "Login?auto=0";
                    var option = { root: true };
                    Mobile.app.navigate(view, option);
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    ServerError(xmlHttpRequest.responseText);
                }
            });


            return;
        },
        itemClick: {
            Config:function(){
                Mobile.app.navigate("Config");
            },
            ChangePassword:function(){
                Mobile.app.navigate("ChangePassword");
            },
            MyRole:function(){
                Mobile.app.navigate("MyRole");
            },
            AboutView:function(){
                //Mobile.app.navigate("About");
            },
            NA: function () {
                DevExpress.ui.notify("该功能暂未开放", "info", 2000);
            }
        }
    };

    function SetLanguage() {
        if (DeviceLang() != "CHS") {
            $("#spanChangePwd").text("Change Password");
            $("#spanMyRole").text("My Roles");
            $("#spanCount").text("Statistics");
            $("#spanContact").text("Contacts");
            $("#spanAbout").text("About");
            $("#spanSetting").text("Setting");
        }
    }

    return viewModel;
};