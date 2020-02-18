Mobile.BarcodeMenu = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        hideFoot: true,
        inited: false,
        viewShown: function () {
            SetLanguage();
            var sessionStorage = window.sessionStorage;
            var u = sessionStorage.getItem("username");
            if (u == null) {
                var view = "Login/0";
                var option = { root: true };
                Mobile.app.navigate(view, option);
                return;
            }

            if (this.inited == false) {
                BindData(this, "");
            }

        },
        logOff: function (e) {
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
        }
    };

    return viewModel;

    function BindData(viewModel) {
        try {
            var sessionStorage = window.sessionStorage;
            var u = sessionStorage.getItem("username");
            //var url = serviceURL + "/Api/Asapment/GetUserMenu?UserName=" + u + "&PARENT=" + viewModel.parentFunc();
            var url = serviceURL + "/Api/Barcode/GetUserMenu?UserName=" + u;
            $.ajax({
                type: 'GET',
                url: url,
                cache: false,
                success: function (data, textStatus) {
                    asapmentMenuData = data;
                    BindUI(data);
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    ServerError(xmlHttpRequest.responseText);
                }
            });
        }
        catch (e) {
            ServerError(xmlHttpRequest.responseText);
        }
    };

    function BindUI(data) {
        $("#divMenu").empty();
        var divMenu = $("#divMenu");
        var dataL1 = data.filter(function (e) { return e.PARENT == ""; });
        var desfield = "DES1";
        if (DeviceLang() == "ENG") {
            desfield = "DES2";
        }

        dataL1.forEach(function (d1, i1, a1) {
            var gpid = "gp" + d1.FUNCID;
            var html = "<div id='" + gpid + "' class='MenuGP' />";
            divMenu.append(html);
            var gp = $("#" + gpid);
            var ghid = "gh" + d1.FUNCID;
            html = "<div id='" + ghid + "' class='MenuGH' />";
            gp.append(html);
            var gh = $("#" + ghid);
            var imagesrc = GetIconImage(d1.IMAGEID);
            html = " <img src='" + imagesrc + "'/>";
            gh.append(html);
            html = "<div>" + d1[desfield] + "</div>";
            gh.append(html);
            var tbid = tb + d1.FUNCID;
            html = "<table id='" + tbid + "' class='MenuGCTB' />"
            gp.append(html)
            var tb = $("#" + tbid)[0];

            var dataL2 = data.filter(function (e) { return e.PARENT == d1.FUNCID && e.MTYPE == "FUNC"; });
            var curCell = 1;
            var tr;
            dataL2.forEach(function (d2, i2, a2) {
                if (d2.FUNCTYPE != "1") {
                    if (curCell == 1) {
                        tr = tb.insertRow();
                        var tce = tr.insertCell();
                        tce.innerHTML = "&nbsp;";
                        tce = tr.insertCell();
                        tce.innerHTML = "&nbsp;";
                        tce = tr.insertCell();
                        tce.innerHTML = "&nbsp;";
                        tce = tr.insertCell();
                        tce.innerHTML = "&nbsp;";
                    }
                    var tc = tr.cells[curCell - 1];
                    var img = GetIconImage(d2.IMAGEID);
                    var openView = d2.DEVOBJ;
                    if (d2.DEVPARAM != null && d2.DEVPARAM != "") {
                        openView = openView + "?DEVPARAM=" + d2.DEVPARAM;
                    }
                    var action = "OpenBarcodeView('" + openView+ "')";
                    tc.innerHTML = "<div onclick=\"" + action + "\"><img src='" + img + "' /><div>" + d2[desfield] + "</div></div>";
                    curCell++;
                    if (curCell > 4) {
                        curCell = 1;
                    }
                }
            });

            dataL2.forEach(function (d2, i2, a2) {
                if (d2.FUNCTYPE == "1") {
                    var dataL3 = data.filter(function (e) { return e.PARENT == d2.FUNCID && e.MTYPE == "FUNC" && e.FUNCTYPE != "1" });
                    if (dataL3.length == 0) {
                        return;
                    }

                    var tr = tb.insertRow();
                    var tc = tr.insertCell();
                    tc.colSpan = 4;
                    tc.innerHTML = "<div class='MenuGCTBF'>" + d2[desfield] + "</div>";

                    curCell = 1;
                    dataL3.forEach(function (d3, i3, a3) {
                        if (d3.FUNCTYPE != "1") {
                            if (curCell == 1) {
                                tr = tb.insertRow();
                                var tce = tr.insertCell();
                                tce.innerHTML = "&nbsp;";
                                tce = tr.insertCell();
                                tce.innerHTML = "&nbsp;";
                                tce = tr.insertCell();
                                tce.innerHTML = "&nbsp;";
                                tce = tr.insertCell();
                                tce.innerHTML = "&nbsp;";
                            }
                            var tc = tr.cells[curCell - 1];
                            var img = GetIconImage(d3.IMAGEID);
                            var openView = d2.DEVOBJ;
                            if (d2.DEVPARAM != null && d2.DEVPARAM != "") {
                                openView = openView + "?DEVPARAM=" + d2.DEVPARAM;
                            }
                            var action = "OpenBarcodeView('" + openView + "')";

                            tc.innerHTML = "<div onclick=\"" + action + "\"><img src='" + img + "' /><div>" + d3[desfield] + "</div></div>";
                            curCell++;
                            if (curCell > 4) {
                                curCell = 1;
                            }
                        }
                    });
                }
            });
        });

        viewModel.inited = true;
    }

    function SetLanguage() {
        if (DeviceLang() == "CHS") {
            viewModel.title("功能目录");
        }
        else {
            viewModel.title("Function Menu");

        }
    }
};