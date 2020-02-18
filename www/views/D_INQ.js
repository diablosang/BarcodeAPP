Mobile.D_INQ = function (params) {
    "use strict";

    var viewModel = {
        hideFoot: true,
        msgOption: msgTextEditor,
        formOption: {
            formData: {CODE_BAR:""},
            items: [
                {
                    label: { text: "条码" },
                    dataField: "CODE_BAR",
                    editorOptions: {
                        onKeyDown: function (e) {
                            switch (e.event.keyCode) {
                                //F1
                                case 112: {
                                    e.event.preventDefault();
                                    e.event.stopPropagation();
                                    break;
                                }
                                //Enter
                                case 13: {
                                    BarcodeScan();
                                    break;
                                }
                            }
                        }
                    },
                    colSpan: 1
                },
                {
                    label: { text: "物料" },
                    dataField: "CODE_ITEM",
                    editorType:"dxTextBox",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 1
                },
                {
                    label: { text: "描述" },
                    dataField: "DESC_ITEM",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 1
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
                    itemType: "group",
                    caption: "条码信息",
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
                    colCount:2,
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
        var form = $("#formMain").dxForm("instance");
        form.focus();
        var editor = form.getEditor("CODE_BAR");
        editor.focus();
        var txtMsg = $("#txtMsg").dxTextBox("instance");
        txtMsg.option("value", "请扫描条码");
    }

    function InitBarcode() {
        var form = $("#formMain").dxForm("instance");
        var editor = form.getEditor("CODE_BAR");
        editor.option("value", "");
        editor.focus();
    }

    function BarcodeScan() {
        var txtMsg = $("#txtMsg").dxTextBox("instance");
        txtMsg.focus();

        var form = $("#formMain").dxForm("instance");
        var formData = form.option("formData");
        var barcode = formData.CODE_BAR; 

        var sessionStorage = window.sessionStorage;
        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Barcode/GetBarcodeInfo";
        var postData = {
            userName: u,
            data: barcode
        }

        $.ajax({
            type: 'POST',
            data: postData,
            async: false,
            url: url,
            cache: false,
            success: function (data, textStatus) {
                var formData = data[0];
                formData.LOCINFO = formData.CODE_PLANT + " / " + formData.CODE_WH + " / "
                    + formData.CODE_LOC + " / " + ASGetString(formData.CODE_SHELF);
                formData.LOTINFO = ASGetString(formData.CODE_LOT) + " / " + ASGetString(formData.CODE_REF);
                formData.QYTINFO = ASGetString(formData.QTY) + " / " + ASGetString(formData.QTY_STK);
                formData.TYPEINFO = ASGetString(formData.TYPE_BAR) + " / " + ASGetString(formData.TYPE_BAR_DESC);
                formData.STATUSINFO = ASGetString(formData.STATUS) + " / " + ASGetString(formData.STATUS_DESC);
                formData.QCINFO = ASGetString(formData.TYPE_QC) + " / " + ASGetString(formData.TYPE_QC_DESC);
                form.option("formData", data[0]);
                InitBarcode();
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                ServerError(xmlHttpRequest.responseText);
                InitBarcode();
            }
        });
    }

    return viewModel;
};