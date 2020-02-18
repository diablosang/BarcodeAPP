Mobile.Config = function (params) {

    var viewModel = {
        title: ko.observable(""),
        hideFoot: true,
        serviceURL: ko.observable(""),
        lookupServiceOption: {
            dataSource: [
                { SERVICE: "http://218.104.52.26/AsapmentWebAPI", DES: "华西化纤ERP正式库" },
                { SERVICE: "http://218.104.52.26/AsapmentWebAPITest", DES: "华西化纤ERP测试库" },
                { SERVICE: "http://localhost:61862", DES: "开发调试" }
            ],
            displayExpr: "DES",
            valueExpr: "SERVICE"
        },
        viewShown: function () {
            SetLanguage();
            var localStorage = window.localStorage;
            var url = localStorage.getItem("serviceurl");

            if (url != null) {
                this.serviceURL(url);
            }
            else {
                url = $("#WebApiServerURL")[0].value;
                this.serviceURL(url);
            }

            if (url != null && url != "") {
                var lookup = $("#lookupService").dxLookup("instance");
                lookup.option("value", url);
            }
           
        },
        onSaveClick: function () {
            var lookup = $("#lookupService").dxLookup("instance");
            var url = lookup.option("value");
            this.serviceURL(url);

            var localStorage = window.localStorage;
            localStorage.setItem("serviceurl", url);
            DevExpress.ui.notify(SysMsg.saveSuccess, "success", 1000);
            Mobile.app.navigate("Login?auto=0");
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
        onScan: function () {
            try {
                ScanBarcode(this);
            }
            catch (e) {
                DevExpress.ui.notify(e, "error", 3000);
            }

        }
    };

    return viewModel;

    function ScanBarcode(viewModel) {
        cordova.plugins.barcodeScanner.scan(
         function (result) {
             if (result.text == null || result.text == "") {
                 return;
             }

             var url = result.text;
             viewModel.serviceURL(url);
             var localStorage = window.localStorage;
             localStorage.setItem("serviceurl", url);
             DevExpress.ui.notify(SysMsg.saveFailed, "success", 1000);
         },
         function (error) {
             DevExpress.ui.notify(SysMsg.scanFailed + error, "error", 3000);
         }
      );
    }

    function SetLanguage() {
        if (DeviceLang() == "CHS") {
            viewModel.title("设置");
            $("#lblAddress").html("服务器地址");
            $("#btnSave").dxButton("instance").option("text", "保存");
            $("#btnScan").dxButton("instance").option("text", "扫描");
        }
        else {
            viewModel.title("Setting");
            $("#lblAddress").html("Service Address");
            $("#btnSave").dxButton("instance").option("text", "Save");
            $("#btnScan").dxButton("instance").option("text", "Scan");
            $("#spanAddress").text("Service Address:");
        }
    }
};