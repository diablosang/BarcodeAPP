Mobile.Func = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        popGroupVisible: ko.observable(false),
        inited:false,
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
        popupGroupOption:{
            title: "场景",
            showTitle:true,
            visible: this.popGroupVisible,
            onShown: function (e) {
            }
        },
        listGroupOption: {
            onItemClick: function (e) {
                var pop = $("#popGroup").dxPopup("instance");
                pop.hide();
                var fType = e.itemData.FUNCTYPE;
                if (fType == 4 || fType == 5) {
                    OpenPlugInView(e.itemData.FUNCID);
                }
                else {
                    OpenListView(e.itemData.FUNCID);
                }
            }
        }
        //asGroupOption: {
        //    title: SysMsg.selectgroup,
        //    onItemClick: function (e) {
        //        OpenListView(e.itemData.FUNCID);
        //    }
        //}
    };

    return viewModel;

    function BindDataUpper(viewModel) {
        try {
            var sessionStorage = window.sessionStorage;
            var u = sessionStorage.getItem("username");
            var url = serviceURL + "/Api/Asapment/GetUserMenuUpper?UserName=" + u + "&PARENT=" + viewModel.parentFunc();
            $.ajax({
                type: 'GET',
                url: url,
                cache: false,
                success: function (data, textStatus) {
                    viewModel.itemData.store().clear();

                    for (var i = 0; i < data.length; i++) {
                        if (DeviceLang() == "CHS") {
                            data[i].DES = data[i].DES1;
                        }
                        else {
                            data[i].DES = data[i].DES2;
                        }
                        viewModel.itemData.store().insert(data[i]);
                    }
                    viewModel.itemData.load();

                    if(data.length>0)
                    {
                        viewModel.parentFunc(data[0].PARENT);
                    }

                    $("#listFunc").dxList({
                        dataSource: viewModel.itemData
                    });
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    DevExpress.ui.notify(errorThrown, "error", 1000);
                }
            });
        }
        catch (e) {
            DevExpress.ui.notify(e.message, "error", 1000);
        }
    };

    function BindData(viewModel) {
        try {
            var sessionStorage = window.sessionStorage;
            var u = sessionStorage.getItem("username");
            //var url = serviceURL + "/Api/Asapment/GetUserMenu?UserName=" + u + "&PARENT=" + viewModel.parentFunc();
            var url = serviceURL + "/Api/Asapment/GetUserMenu?UserName=" + u + "&PARENT=@ALL";
            $.ajax({
                type: 'GET',
                url: url,
                cache: false,
                success: function (data, textStatus) {
                    asapmentMenuData = data;
                    BindUI(data);
                    //if (data.length == 1 && data[0].MTYPE=="GROUP")
                    //{
                    //    var funcid = data[0].FUNCID;
                    //    var functype = data[0].FUNCTYPE;
                    //    OpenListView(viewModel, funcid, functype);
                    //    viewModel.parentFunc(viewModel.parentOld());
                    //    return;
                    //}

                    
                    //viewModel.itemData.store().clear();

                    //for (var i = 0; i < data.length; i++) {
                    //    if (DeviceLang() == "CHS") {
                    //        data[i].DES = data[i].DES1;
                    //    }
                    //    else {
                    //        data[i].DES = data[i].DES2;
                    //    }
                    //    viewModel.itemData.store().insert(data[i]);
                    //}
                    //viewModel.itemData.load();

                    //$("#listFunc").dxList({
                    //    dataSource: viewModel.itemData
                    //});
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
        var desfield="DES1";
        if(DeviceLang()=="ENG"){
            desfield="DES2";
        }

        dataL1.forEach(function (d1, i1, a1) {
            var gpid = "gp" + d1.FUNCID;
            var html = "<div id='" + gpid + "' class='MenuGP' />";
            divMenu.append(html);
            var gp = $("#" + gpid);
            var ghid = "gh" + d1.FUNCID;
            html="<div id='"+ghid+"' class='MenuGH' />";
            gp.append(html);
            var gh = $("#" + ghid);
            var imagesrc = GetIconImage(d1.IMAGEID);
            html = " <img src='" + imagesrc + "'/>";
            gh.append(html);
            html = "<div>" + d1[desfield] + "</div>";
            gh.append(html);
            var tbid = tb + d1.FUNCID;
            html="<table id='"+tbid+"' class='MenuGCTB' />"
            gp.append(html)
            var tb = $("#" + tbid)[0];

            var dataL2 = data.filter(function (e) { return e.PARENT == d1.FUNCID && e.MTYPE=="FUNC"; });
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
                    var tc = tr.cells[curCell-1];
                    var img = GetIconImage(d2.IMAGEID);
                    var action;
                    if (d2.FUNCTYPE == "5" || d2.FUNCTYPE == "10") {
                        action = "OpenPlugInView('" + d2.FUNCID + "')";
                    }
                    else {
                        var dataGroup = data.filter(function (e) { return e.PARENT == d2.FUNCID && e.MTYPE == "GROUP"; });
                        if (dataGroup.length == 0) {
                            return;
                        }
                        else if (dataGroup.length == 1) {
                            action = "OpenListView('" + dataGroup[0].FUNCID + "')";
                        }
                        else {
                            action = "OpenASGroup('" + d2.FUNCID + "')";
                        }
                    }

                    
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
                    if (dataL3.length == 0){
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
                            var action;
                            if (d3.FUNCTYPE == "5" || d3.FUNCTYPE=="10") {
                                action = "OpenPlugInView('" + d3.FUNCID + "')";
                            }
                            else {
                                var dataGroup = data.filter(function (e) { return e.PARENT == d3.FUNCID && e.MTYPE == "GROUP"; });
                                if (dataGroup.length == 0) {
                                    return;
                                }
                                else if (dataGroup.length == 1) {
                                    action = "OpenListView('" + dataGroup[0].FUNCID + "')";
                                }
                                else {
                                    action = "OpenASGroup('" + d3.FUNCID + "')";
                                }
                            }
                            
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

