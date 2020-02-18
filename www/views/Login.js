Mobile.Login = function (params) {
    var viewModel = {
        hideLayout: true,
        title: ko.observable(""),
        versionChecked: ko.observable(false),
        indicatorVisible: ko.observable(false),
        username: ko.observable(""),
        password: ko.observable(""),
        viewShown: function () {
            SetLanguage();
            var w = $("#inputBox1").width();
            $(".LG_TextBox").width(w - 33);

            var localStorage = window.localStorage;

            var url = localStorage.getItem("serviceurl");
            if (url != null && url != "") {
                serviceURL = url;
            }

            $("#logoImg").attr("src", serviceURL + "/logo.png?v=3");

            var u = localStorage.getItem("username");
            if (u != null) {
                var p = localStorage.getItem("password");
                this.username(u);
                this.password(p);
            }

            if (viewModel.versionChecked() == false) {
                //try {
                //    CheckUpdate();

                //    cordova.getAppVersion.getVersionNumber().then(function (version) {
                //        $("#appver").text("Version: " + version);
                //        CheckUpdate();
                //    });
                //}
                //catch (e) { }

                viewModel.versionChecked(true);
            }

           
            if (params.auto != "0" && this.username() != "") {
                //Logon(this.username(), this.password());
            }
        },
        onLoginClick: function () {
            Logon(this.username(), this.password());
        },
        settingClick: function (e) {
            Mobile.app.navigate("Config");
        }
    };

    return viewModel;

    function CheckUpdate() {
        var ver = appVer;
        var url = serviceURL + "/Api/Debug/CheckAppVersion2?ver=" + ver;
        var currentplatform = DevExpress.devices.real().platform;

        $.ajax({
            type: 'GET',
            url: url,
            cache: false,
            success: function (data, textStatus) {
                var newver = data.NewVersion;
                if (newver != "0") {
                    var closedDialog;
                    var closedDialog = DevExpress.ui.dialog.custom({
                        title: SysMsg.info,
                        message: SysMsg.newVer1 + newver + SysMsg.newVer2,
                        buttons: [{ text: SysMsg.yes, value: true, onClick: function () { return true; } }, { text: SysMsg.no, value: false, onClick: function () { return false; } }]
                    });

                    closedDialog.show().done(function (dialogResult) {
                        if (dialogResult == true) {
                            var apkURL = "";
                            if (currentplatform == 'android') {
                                apkURL = serviceURL + "/App/Mobile.apk";
                                window.open(apkURL, '_system', 'location=yes');
                            }
                            else if (currentplatform == 'ios') {
                                return;
                                //apkURL = "https://itunes.apple.com/us/app/%E4%BC%81%E8%8D%AB%E5%AE%A2%E6%88%B7%E7%AB%AF/id1216043513?mt=8";
                                //window.open(apkURL, '_blank', 'location=yes');
                            }
                            return;
                        }
                    });
                }
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                //ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function SetLanguage() {
        if (DeviceLang() == "CHS") {
            viewModel.title("登录");
            $("#txtUser").dxTextBox("instance").option("placeholder", "请输入用户名");
            $("#txtPwd").dxTextBox("instance").option("placeholder", "请输入密码");
            $("#btnLogin").dxButton("instance").option("text", "登录");
        }
        else {
            viewModel.title("Logon");
            $("#txtUser").dxTextBox("instance").option("placeholder", "Please input user name");
            $("#txtPwd").dxTextBox("instance").option("placeholder", "Please input password");
            $("#btnLogin").dxButton("instance").option("text", "Login");
        }
    }
};

function LogoClicked() {
    $("#layout_header").show();
    $("#layout_footer").show();
    $("#layout_viewfooter").show();
}