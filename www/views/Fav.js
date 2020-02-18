Mobile.Fav = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
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
        }
    };


    return viewModel;

    function BindData(viewModel) {
        try {
            var sessionStorage = window.sessionStorage;
            var u = sessionStorage.getItem("username");
            var url = serviceURL + "/Api/Asapment/GetUserFav?UserName=" + u;
            $.ajax({
                type: 'GET',
                url: url,
                cache: false,
                success: function (data, textStatus) {
                    BindUI(data, "#tbM1");
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    ServerError(xmlHttpRequest.responseText);
                }
            });

            url = serviceURL + "/Api/Asapment/GetUserFavCount?UserName=" + u;
            $.ajax({
                type: 'GET',
                url: url,
                cache: false,
                success: function (data, textStatus) {
                    var dataR = data.filter(function (e) {
                        return e.CTTYPE == "R";
                    })
                    BindUI(dataR, "#tbM2");

                    var dataM = data.filter(function (e) {
                        return e.CTTYPE == "M";
                    })
                    BindUI(dataR, "#tbM3");
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {

                }
            });
        }
        catch (e) {
            DevExpress.ui.notify(e.message, "error", 1000);
        }
    };

    function BindUI(data,tb) {
        var divFav = $("#divFav");
        var gData = {};
        var curCell=1;
        var tbMenu = $(tb)[0];
        $(tb).empty();
        var tr;
        data.forEach(function (v, i, a) {
            if(curCell==1){
                tr = tbMenu.insertRow();
            }

            var tc = tr.insertCell();
            var img = GetIconImage(v.IMAGEID);
            var desc = "";
            if (v.ITEMDESC != null) {
                desc = v.ITEMDESC;
            }
            else {
                if (DeviceLang() == "CHS") {
                    desc = v.DES1;
                }
                else {
                    desc = v.DES2;
                }
            }

            tc.innerHTML = "<div onclick=\"OpenListView('" + v.ITEMOBJ + "')\"><img src='" + img + "' /><div>" + desc + "</div></div>";

            curCell++;
            if (curCell > 4) {
                curCell = 1;
            }
        });

        viewModel.inited = true;
    }

    function DeleteFav(ITEMID)
    {
        var sessionStorage = window.sessionStorage;
        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/DeleteFavorite?UserName=" + u + "&ITEMID=" + ITEMID;
        $.ajax({
            type: 'GET',
            url: url,
            cache: false,
            success: function (data, textStatus) {
                DevExpress.ui.notify(SysMsg.delSuccess, "success", 1000);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function SetLanguage() {
        if (DeviceLang() == "CHS") {
            viewModel.title("收藏夹");
        }
        else {
            viewModel.title("Favorites");
            $("#spanFav").text("Favorites");
            $("#spanRecent").text("Recently Used");
            $("#spanMost").text("Most Frequently Used");
        }
    }
};