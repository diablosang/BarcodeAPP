Mobile.D_INQP = function (params) {
    "use strict";

    var viewModel = {
        hideFoot: true,
        barcodeOption: {
            onKeyDown: function (e) {
                KeyDown(e);
            }
        },
        msgOption: msgTextEditor,
        tabOptions: {
            items: [
                { text: "条码信息"},
                { text: "物料信息"},
            ],
            selectedIndex: 0,
            onItemClick: function (e) {
                if (e.itemIndex == 0) {
                    $("#gridBar").show();
                    $("#gridItem").hide();
                }
                else {
                    $("#gridBar").hide();
                    $("#gridItem").show();
                }
            }
        },
        formOption: {
            colCount: 2,
            colCountByScreen: { lg: 2, md: 2, sm: 2, xs: 2 },
            items: [
                {
                    label: { text: "托盘号" },
                    dataField: "CODE_BAR",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 2
                },
                {
                    label: { text: "条码" },
                    dataField: "COUNT_BAR",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 1
                },
                {
                    label: { text: "物料" },
                    dataField: "QTY_BAR",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 1
                }
            ],
            onEditorEnterKey: function (e) {

            }
        },
        gridBarOptions: {
            columnAutoWidth: true,
            paging: {
                enabled: false
            },
            selection: {
                mode: "single"
            },
            scrolling: {
                useNative: false
            },
            dateSerializationFormat: "yyyy-MM-dd",
            columns: [
                { dataField: "CODE_BAR", caption: "条码号", allowEditing: false, allowSorting: false }
            ]
        },
        gridItemOptions: {
            columnAutoWidth: true,
            paging: {
                enabled: false
            },
            selection: {
                mode: "single"
            },
            scrolling: {
                useNative: false
            },
            dateSerializationFormat: "yyyy-MM-dd",
            columns: [
                { dataField: "CODE_ITEM", caption: "物料号", allowEditing: false, allowSorting: false },
                { dataField: "COUNT_ITEM", caption: "条码", allowEditing: false, allowSorting: false },
                { dataField: "QTY_ITEM", caption: "数量", allowEditing: false, allowSorting: false }
            ]
        },
        viewShown: function (e) {
            InitView();
        }
    };

    function InitView() {
        var txtMsg = $("#txtMsg").dxTextBox("instance");
        txtMsg.option("value", "请扫描托盘号");
        InitBarcode();
    }

    function KeyDown(e) {
        switch (e.event.keyCode) {
            case 13: {
                BarcodeScan();
                break;
            }
        }
    }

    function InitBarcode() {
        var editor = $("#txtBarcode").dxTextBox("instance");
        editor.option("value", "");
        editor.focus();
    }

    function BarcodeScan() {
        var txtMsg = $("#txtMsg").dxTextBox("instance");
        txtMsg.focus();

        var txtBarcode = $("#txtBarcode").dxTextBox("instance");
        var barcode = txtBarcode.option("value");

        var postData = {
            data: barcode
        }

        PostServer("Barcode/GetPalletInfo", postData, function (result) {
            DisplayInfo(barcode,result.data);
        });

        InitBarcode();
    }

    function DisplayInfo(barcode,data) {
        var formData = { COUNT_BAR: 0, QTY_BAR: 0, CODE_BAR: barcode};
        var gridDataBar = [];
        var gridDataItem = [];
        var curItem = "";
        var qtyBar = new Decimal(0);

        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            formData.COUNT_BAR++;
            var qty = new Decimal(d.QTY);
            qtyBar = qtyBar.plus(qty); 
            var rowBar = {};
            rowBar.CODE_BAR = d.CODE_BAR;
            gridDataBar.push(rowBar);

            if (curItem != d.CODE_ITEM) {
                curItem = d.CODE_ITEM;
                var rowItem = {};
                rowItem.CODE_ITEM = curItem;
                rowItem.COUNT_ITEM = 1;
                rowItem.QTY_ITEM = d.QTY;
              
                gridDataItem.push(rowItem);
            }
            else {
                var rowItem = gridDataItem[gridDataItem.length - 1];
                rowItem.COUNT_ITEM += 1;
                var qtyItem = new Decimal(rowItem.QTY_ITEM);
                qtyItem = qtyItem.plus(qty);
                rowItem.QTY_ITEM = qtyItem.toString();
            }
        }

        formData.QTY_BAR = qtyBar.toString();
        var form = $("#formMain").dxForm("instance");
        var gridBar = $("#gridBar").dxDataGrid("instance");
        var gridItem = $("#gridItem").dxDataGrid("instance");
        form.option("formData", formData);
        gridBar.option("dataSource", gridDataBar);
        gridItem.option("dataSource", gridDataItem);
    }

    return viewModel;
};