﻿Mobile.D_INQ = function (params) {
    "use strict";

    var viewModel = {
        hideFoot: true,
        barcodeOption: {
            onKeyDown: function (e) {
                KeyDown(e);
            }
        },
        msgOption: msgTextEditor,
        formOption: {
            colCount: 2,
            colCountByScreen: { lg: 2, md: 2, sm: 2, xs: 2 },
            items: [
                {
                    label: { text: "条码" },
                    dataField: "CODE_BAR",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 2
                },
                {
                    label: { text: "物料" },
                    dataField: "CODE_ITEM",
                    editorType:"dxTextBox",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 2
                },
                {
                    label: { text: "描述" },
                    dataField: "DESC_ITEM",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 2
                },
                {
                    label: { text: "位置" },
                    dataField: "LOCINFO",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 1
                },
                {
                    label: { text: "批次" },
                    dataField: "LOTINFO",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 1
                },
                {
                    label: { text: "数量" },
                    dataField: "QYTINFO",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 1
                },
                {
                    itemType: "empty"
                },
                {
                    itemType: "group",
                    caption: "条码信息",
                    colCountByScreen: { lg: 2, md: 2, sm: 2, xs: 2 },
                    colSpan:2,
                    items: [
                        {
                            label: { text: "类型" },
                            dataField: "TYPEINFO",
                            editorOptions: formReadOnlyTextEditor,
                            colSpan: 1
                        },
                        {
                            label: { text: "状态" },
                            dataField: "STATUSINFO",
                            editorOptions: formReadOnlyTextEditor,
                            colSpan: 1
                        },
                        {
                            label: { text: "来源" },
                            dataField: "CODE_SOURCE",
                            editorOptions: formReadOnlyTextEditor,
                            colSpan: 1
                        },
                        {
                            label: { text: "版本" },
                            dataField: "VERSION",
                            editorOptions: formReadOnlyTextEditor,
                            colSpan: 1
                        }
                    ]
                },
                {
                    itemType: "group",
                    caption: "质检信息",
                    colCountByScreen: { lg: 2, md: 2, sm: 2, xs: 2 },
                    colSpan: 2,
                    items: [
                        {
                            label: { text: "等级" },
                            dataField: "QCINFO",
                            editorOptions: formReadOnlyTextEditor,
                            colSpan: 2
                        },
                        {
                            label: { text: "日期" },
                            dataField: "DATE_INSP",
                            editorOptions: formReadOnlyTextEditor,
                            colSpan: 1
                        },
                        {
                            label: { text: "质检人" },
                            dataField: "USER_INSP",
                            editorOptions: formReadOnlyTextEditor,
                            colSpan: 1
                        },
                        {
                            label: { text: "结果" },
                            dataField: "RESULT_INSP",
                            editorOptions: formReadOnlyTextEditor,
                            colSpan: 1
                        },
                        {
                            label: { text: "订单" },
                            dataField: "ID_ORD",
                            editorOptions: formReadOnlyTextEditor,
                            colSpan: 1
                        }
                    ]
                }
            ],
            onEditorEnterKey: function (e) {

            }
        },
        viewShown: function (e) {
            InitView();
        }
    };

    function InitView() {
        var txtMsg = $("#txtMsg").dxTextBox("instance");
        txtMsg.option("value", "请扫描条码");
        InitBarcode();
    }

    function KeyDown(e) {
        switch (e.event.keyCode) {
            //F4
            case 115: {
                Submit();
                break;
            }
            //Enter
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

        PostServer("Barcode/GetBarcodeInfo", postData, function (result) {
            DisplayInfo(result.data[0]);
        });

        InitBarcode();
    }

    function DisplayInfo(data) {
        var formData = data;
        var form = $("#formMain").dxForm("instance");
        formData.LOCINFO = formData.CODE_PLANT + " / " + formData.CODE_WH + " / "
            + formData.CODE_LOC + " / " + ASGetString(formData.CODE_SHELF);
        formData.LOTINFO = ASGetString(formData.CODE_LOT) + " / " + ASGetString(formData.CODE_REF);
        formData.QYTINFO = ASGetString(formData.QTY) + " / " + ASGetString(formData.QTY_STK);
        formData.TYPEINFO = ASGetString(formData.TYPE_BAR) + " / " + ASGetString(formData.TYPE_BAR_DESC);
        formData.STATUSINFO = ASGetString(formData.STATUS) + " / " + ASGetString(formData.STATUS_DESC);
        formData.QCINFO = ASGetString(formData.TYPE_QC) + " / " + ASGetString(formData.TYPE_QC_DESC);
        form.option("formData", formData);
    }

    return viewModel;
};