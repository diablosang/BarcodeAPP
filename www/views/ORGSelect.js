Mobile.ORGSelect = function (params) {
    "use strict";

    var viewModel = {
        gridDataWindowOptions: {
            columnAutoWidth: true,
            columns: [
                { dataField: "DEPTDESC", caption: SysMsg.dept, allowEditing: false, allowSorting: false, groupIndex:0 },
                { dataField: "EMPID", caption: SysMsg.userID, allowEditing: false, allowSorting: false },
                { dataField: "EMPNAME", caption: SysMsg.userName, allowEditing: false, allowSorting: false }
            ],
            paging: {
                enabled: false
            },
            selection: {
                mode: "single"
            },
            scrolling: {
                useNative: false
            },
            searchPanel: {
                visible:true
            },
            onSelectionChanged: function (selectedItems) {
                var selection = selectedItems.selectedRowsData[0];
                if (selection == null) {
                    return;
                }

                ProcessSelection(selection);
                return;
            }
        },
        viewShown: function (e) {
            BindData();
        },
        viewHidden: function (e) {
            if (viewModel.keepCache == false) {
                var cache = Mobile.app.viewCache;
                cache.removeView(e.viewInfo.key);
            }
        }
    };

    function ProcessSelection(selection) {
        var sessionStorage = window.sessionStorage;
        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/ORGSelect";
        var postData = {
            userName: u,
            emp: selection.EMPID
        }

        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            cache: false,
            success: function (data, textStatus) {
                var sessionStorage = window.sessionStorage;
                sessionStorage.setItem("viewAction", "orgSelect");
                (new DevExpress.framework.dxCommand({ onExecute: "#_back" })).execute();
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function BindData() {
        try {

            var sessionStorage = window.sessionStorage;
            var u = sessionStorage.getItem("username");
            var postData = {
                userName: u,
            }

            var url = serviceURL + "/Api/Asapment/GetORGData";

            $.ajax({
                type: 'POST',
                url: url,
                data: postData,
                cache: false,
                success: function (data, textStatus) {
                    var grid = $("#gridDataWindow").dxDataGrid("instance");
                    grid.option("dataSource", data);
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    ServerError(xmlHttpRequest.responseText);
                }
            });
        }
        catch (e) {
            DevExpress.ui.notify(e.message, "error", 1000);
        }
    };

    return viewModel;
};