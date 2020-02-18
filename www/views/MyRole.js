Mobile.MyRole = function (params) {
    "use strict";

    var viewModel = {
        gridOption: {
            dateSerializationFormat: "yyyy-MM-ddTHH:mm:ss",
            columnAutoWidth: true,
            columns: [
                { dataField: "ROLEID", caption: SysMsg.roleid, allowEditing: false, allowSorting: false },
                { dataField: "DES", caption: SysMsg.des, allowEditing: false, allowSorting: false },
            ],
            selection: {
                mode: "single"
            },
            paging: {
                enabled: false
            }
        },
        viewShown: function (e) {
            BindData();
        }
    };

    function BindData() {
        var sessionStorage = window.sessionStorage;
        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/GetUserRoles";
        var postData = {
            userName:u
        }
        $.ajax({
            type: 'POST',
            url: url,
            data:postData,
            cache: false,
            success: function (data, textStatus) {
                var grid = $("#gridMain").dxDataGrid("instance");
                grid.option("dataSource", data);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    return viewModel;
};