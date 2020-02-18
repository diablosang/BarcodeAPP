Mobile.Dash = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        versionChecked: ko.observable(false),
        indicatorVisible: ko.observable(false),
        viewShown: function () {
            SetLanguage();

            try
            {
                if (device.platform != "Android") {
                    window.JPush.resetBadge();
                }
            }
            catch(e)
            {}
            
            viewModel.indicatorVisible(true);
            var sessionStorage = window.sessionStorage;
            var u = sessionStorage.getItem("username");
            if (u == null) {
                var view = "Login/0";
                var option = { root: true };
                Mobile.app.navigate(view, option);
                return;
            }

            BindData(this);
        },
        listOptions: {
            dataSource: [],
            height: "100%",
            grouped: false,
            collapsibleGroups: false,
            scrollingEnabled: false,

            onItemClick: function (e) {
                var data = e.itemData;
                var func = data.FUNCID;
                var group = data.GROUPID;
                var doc = data.DOCID;
                OpenDoc(func, group, doc);
            }
        },
        listNoticeOptions:{
            dataSource: [],
            height: "100%",
            grouped: false,
            scrollingEnabled: false,
            allowItemDeleting:true,
            itemDeleteMode: "slideItem",
            onItemDeleted: function (e) {
                var data = e.itemData;
                var IDNUM = data.IDNUM;
                var MAILTO = data.MAILTO;
                SetNoticeRead(IDNUM, MAILTO);
            },
            onItemClick: function (e) {
                var data = e.itemData;
                var func = data.FUNCID;
                var group = data.GROUPID;
                var doc = data.DOCID;
                var IDNUM = data.IDNUM;
                var MAILTO = data.MAILTO;
                SetNoticeRead(IDNUM,MAILTO);
                OpenDoc(func, group, doc);
            }
        },
        onScrollViewPullingDown: function (e) {
            BindData(this);
            e.component.release();
        },
        galleryOptions: {
            showIndicator:false,
            dataSource: [],
            loop: true,
            animationEnabled: true,
            animationDuration: 400,
            slideshowDelay:5000
        },
        tabOptions: {
            items: [
                { text: SysMsg.todo, icon: "images/todo.png" },
                { text: SysMsg.notice, icon: "images/message.png" },
            ],
            selectedIndex: 0,
            onItemClick: function (e) {
                if (e.itemIndex == 0) {
                    $("#listDash").show();
                    $("#listNotice").hide();
                }
                else {
                    $("#listDash").hide();
                    $("#listNotice").show();
                }
            }
        }
    };
    return viewModel;

    function BindData(viewModel) {
        try {
            var sessionStorage = window.sessionStorage;
            var u = sessionStorage.getItem("username");
            var url = serviceURL + "/Api/Asapment/GetDashData?UserName=" + u;
            $.ajax({
                type: 'GET',
                url: url,
                cache: false,
                success: function (data, textStatus) {
                    $("#listDash").dxList({
                        dataSource: data
                    });
                    viewModel.indicatorVisible(false);
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    viewModel.indicatorVisible(false);
                    ServerError(xmlHttpRequest.responseText);
                }
            });

            if (serverVer >= 3)
            {
                var url2 = serviceURL + "/Api/Asapment/GetNoticeData?UserName=" + u;
                $.ajax({
                    type: 'GET',
                    url: url2,
                    cache: false,
                    success: function (data, textStatus) {
                        $("#listNotice").dxList({
                            dataSource: data
                        });
                    },
                    error: function (xmlHttpRequest, textStatus, errorThrown) {

                    }
                });
            }
            
        }
        catch (e) {
            DevExpress.ui.notify(e.message, "error", 1000);
        }

        //if (serverVer >= 3) {
        //    var url2 = serviceURL + "/Api/Asapment/GetGalleryData?UserName=" + u;
        //    $.ajax({
        //        type: 'GET',
        //        url: url2,
        //        cache: false,
        //        success: function (data, textStatus) {
        //            var serverUrl = serviceURL;
        //            var ds = [];
        //            for (var i = 0; i < data.length; i++) {
        //                var imgurl = serverUrl + "/" + data[i].imgurl;
        //                var img = { imageSrc: imgurl }
        //                ds.push(img);
        //            }
        //            var galDash = $("#galDash").dxGallery("instance");
        //            galDash.option("dataSource", ds);
        //            galDash.option("animationEnabled", true);
        //        },
        //        error: function (xmlHttpRequest, textStatus, errorThrown) {

        //        }
        //    });
        //}
    };

    function OpenDoc(func, group, doc) {
        if (func == null || func == "")
        {
            return;
        }

        var view;
        if (doc == "" || doc == null) {
            view = "FormList?FUNCID=" + func + "@" + group;
        }
        else {
            view = "FormEdit?FUNCID=" + func + "&GROUPID=" + group + "&DOCID=" + doc;
        }
        Mobile.app.navigate(view);
    }

    function SetNoticeRead(IDNUM, MAILTO)
    {
        var sessionStorage = window.sessionStorage;
        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/SetNoticeRead";
        var postData = {
            UserName: u,
            IDNUM: IDNUM,
            MAILTO: MAILTO
        }

        $.ajax({
            type: 'POST',
            url: url,
            data:postData,
            cache: false,
            success: function (data, textStatus) {
                
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function SetLanguage() {
        if (DeviceLang() == "CHS") {
            viewModel.title("待办事项");
        }
        else {
            viewModel.title("To Do List");
        }
    }
};