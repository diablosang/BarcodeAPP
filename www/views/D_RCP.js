Mobile.D_RCP = function (params) {
    "use strict";

    var viewModel = {
        hideFoot: true,
        fid: "D_RCP",
        code_loc: "",
        code_shelf: "",
        se: false,
        seStart:"",
        seEnd:"",
        msgOption: msgTextEditor,
        config: {},
        scanData: [],
        formOption: {
            colCount: 2,
            colCountByScreen: { lg: 2, md: 2, sm: 2, xs: 2 },
            items: [
                {
                    label: { text: "工厂" },
                    dataField: "CODE_PLANT",
                    editorType:"dxSelectBox",
                    editorOptions: {
                        dataSource: [{CODE_PLANT:"HXC"}],
                        displayExpr: "CODE_PLANT",
                        valueExpr:"CODE_PLANT",
                        value: defaultPlant
                    },
                    colSpan: 1
                },
                {
                    label: { text: "日期" },
                    dataField: "DATE_INPUT",
                    editorType: "dxDateBox",
                    editorOptions: {
                        width:"130",
                        displayFormat: "yyyy-MM-dd",
                        pickerType: "calendar",
                        dateSerializationFormat: "yyyy-MM-dd"
                    },
                    colSpan: 1
                },
                {
                    label: { text: "库位" },
                    dataField: "CODE_LOC",
                    editorOptions: {
                        onKeyDown: function (e) {
                            KeyDown("CODE_LOC", e);
                        }
                    },
                    colSpan: 1
                },
                {
                    label: { text: "货架" },
                    dataField: "CODE_SHELF",
                    editorOptions: {
                        onKeyDown: function (e) {
                            KeyDown("CODE_SHELF", e);
                        }
                    },
                    colSpan: 1
                },
                {
                    label: { text: "条码" },
                    dataField: "CODE_BAR",
                    editorOptions: {
                        onKeyDown: function (e) {
                            KeyDown("CODE_BAR", e);
                        }
                    },
                    colSpan: 2
                }
            ]
        },
        modelBarInfo: Mobile.Partial_BarInfo(),
        viewShown: function (e) {
            InitView();
        }
    };

    function InitView() {
        var form = $("#formMain").dxForm("instance");
        form.focus();
        var txtMsg = $("#txtMsg").dxTextBox("instance");
        txtMsg.option("value", "请输入库位");
        viewModel.code_loc = "";
        viewModel.code_shelf = "";
        viewModel.se = false;
        viewModel.seStart = "";
        viewModel.seEnd = "";
        viewModel.scanData = [];
        viewModel.modelBarInfo.SetBarInfo({ data: {} });
        form.option("formData", { CODE_PLANT: defaultPlant, DATE_INPUT: GetDateString2(new Date()) });
        var postData = {
            fid: viewModel.fid
        }

        PostServer("Barcode/Init", postData, function (result) {
            viewModel.config = result.data;

            if (viewModel.config.CODE_LOC != null && viewModel.config.CODE_LOC != "") {
                form.updateData("CODE_LOC", viewModel.config.CODE_LOC);
                LocationScan();
                return;
            }
            else {
                InitLocation();
            }
        });
    }

    function InitLocation() {
        var form = $("#formMain").dxForm("instance");
        var editor = form.getEditor("CODE_LOC");
        editor.option("value", "");
        editor.focus();
    }

    function InitBarcode() {
        var form = $("#formMain").dxForm("instance");
        var editor = form.getEditor("CODE_BAR");
        editor.option("value", "");
        editor.focus();
    }

    function KeyDown(s, e) {
        switch (e.event.keyCode) {
            //F4
            case 115: {
                Submit();
                break;
            }
            //F5
            case 116:
            case 120:{
                viewModel.se = !viewModel.se;
                if (viewModel.se == true) {
                    SetMessage("已开启头尾条码模式，请扫描第一个条码");
                }
                else {
                    SetMessage("已取消头尾条码模式");
                }
                break;
            }
            //F6
            case 117: {
                InitView();
                break;
            }
            //F8
            case 119: {
                Batch();
                break;
            }
            //Enter
            case 13: {
                switch (s) {
                    case "CODE_LOC": LocationScan(); break;
                    case "CODE_SHELF": ShelfScan(); break;
                    case "CODE_BAR": BarcodeScan(); break;
                }
                break;
            }
        }
    }

    function SetMessage(msg, type) {
        var txtMsg = $("#txtMsg").dxTextBox("instance");
        txtMsg.option("value", msg);

        if (type == "success") {
            txtMsg.option("inputAttr", { class: "textBoxMsgSuccess" });
            txtMsg.option("elementAttr", { class: "textBoxMsgSuccess" });
        }
        else if (type == "error") {
            txtMsg.option("inputAttr", { class: "textBoxMsgError" });
            txtMsg.option("elementAttr", { class: "textBoxMsgError" });
        }
        else {
            txtMsg.option("inputAttr", { class: "textBoxMsg" });
            txtMsg.option("elementAttr", { class: "textBoxMsg" });
        }
    }

    function LocationScan() {
        var txtMsg = $("#txtMsg").dxTextBox("instance");
        txtMsg.focus();

        var form = $("#formMain").dxForm("instance");
        var formData = form.option("formData");

        var postData = {
            bartype: "CODE_LOC",
            barcode: formData.CODE_LOC
        };

        PostServer("Barcode/Scan", postData, function (result) {
            viewModel.code_loc = formData.CODE_LOC;

            if (result.data != "") {
                form.updateData("CODE_SHELF", result.data[0].CODE_SHELF);
                viewModel.code_shelf = result.data[0].CODE_SHELF;
            }

            SetMessage("请扫描条码");
        });

        InitBarcode();
    }

    function BarcodeScan() {
        var txtMsg = $("#txtMsg").dxTextBox("instance");
        txtMsg.focus();
        var form = $("#formMain").dxForm("instance");
        var formData = form.option("formData");

        if (viewModel.code_loc == "") {
            SetMessage("请先指定目标库位", "error");
            InitBarcode();
            return;
        }

        var barcode = formData.CODE_BAR;

        if (viewModel.se) {
            if (viewModel.seStart == "") {
                viewModel.seStart = barcode;
                InitBarcode();
                SetMessage("请扫描最后一个条码");
                return;
            }
            else {
                viewModel.seEnd = barcode;
                BatchSE();
                return;
            }
        }


        var postData = {
            bartype: "BARCODE",
            barcode: barcode
        };

        PostServer("Barcode/Scan", postData, function (result) {
            var remove = ProcessData(result.data);
            if (remove > 0) {
                return;
            }

            if (viewModel.config.AUTOBT == "1") {
                Batch();
            }
            else {
                if (viewModel.config.AUTOSUB == "1") {
                    Submit();
                }
            }
        });

        InitBarcode();
    }

    function ProcessData(dataSet) {
        var data;
        var count = 0;
        var remove = 0;
        for (var i = 0; i < dataSet.length; i++) {
            data = dataSet[i];
            var findData = viewModel.scanData.find(function (n) { return n.CODE_BAR == data.CODE_BAR });
            if (findData != null) {
                if (dataSet.length == 1) {
                    var index = viewModel.scanData.indexOf(findData);
                    viewModel.scanData.splice(index, 1);
                    remove++;
                }
            }
            else {
                viewModel.scanData.push(data);
                count++;
            }
        }

        var countInfo = { BAR_CUR: 0, QTY_CUR: 0, BAR_TOT: 0, QTY_TOT: 0 };
        var CODE_ITEM = data.CODE_ITEM;
        for (var i = 0; i < viewModel.scanData.length; i++) {
            var sd = viewModel.scanData[i];
            countInfo.BAR_TOT++;
            var qtyTot = new Decimal(countInfo.QTY_TOT);
            var qty = new Decimal(sd.QTY);
            countInfo.QTY_TOT = qtyTot.plus(qty).toString();
            if (sd.CODE_ITEM == CODE_ITEM) {
                countInfo.BAR_CUR++;
                var qtyCur = new Decimal(countInfo.QTY_CUR);
                countInfo.QTY_CUR = qtyCur.plus(qty).toString();
            }
        }

        viewModel.modelBarInfo.SetBarInfo(data, countInfo);
        if (remove > 0) {
            SetMessage("已取消" + remove + "个条码");
        }
        else {
            SetMessage("已加载" + count + "个条码");
        }

        return remove;
    }

    function Batch() {
        if (viewModel.scanData.length == 0) {
            return;
        }

        var postData = viewModel.scanData[viewModel.scanData.length - 1];
        PostServer("Barcode/Batch", postData,
            function (result) {
                ProcessData(result.data);

                if (viewModel.config.AUTOSUB == "1") {
                    Submit();
                }
            },
            function (result) {
                if (viewModel.config.AUTOBT == "1") {
                    viewModel.scanData.pop(postData);
                }
            }
        );


        InitBarcode();
    }

    function BatchSE() {
        var postData = {
            seStart: viewModel.seStart,
            seEnd: viewModel.seEnd
        };

        PostServer("Barcode/BatchSE", postData,
            function (result) {
                ProcessData(result.data);

                if (viewModel.config.AUTOSUB == "1") {
                    Submit();
                }
            }
        );

        InitBarcode();
        viewModel.seStart = "";
        viewModel.seEnd = "";
        viewModel.se = false;
    }

    function Submit() {
        if (viewModel.scanData.length == 0) {
            return;
        }

        DevExpress.ui.dialog.confirm("您确定要提交吗？").done(function (dialogResult) {
            if (dialogResult) {
                var formData = $("#formMain").dxForm("instance").option("formData");

                var postData = {
                    fid: viewModel.fid,
                    CODE_LOCT: viewModel.code_loc,
                    CODE_SHELFT: viewModel.code_shelf,
                    CODE_PLANT: formData.CODE_PLANT,
                    DATE_INPUT: formData.DATE_INPUT,
                    data: viewModel.scanData
                };

                PostServer("Barcode/Submit", postData, function (result) {
                    var msg = "入库单" + result.data + "提交成功";
                    InitView();
                    SetMessage(msg, "success");
                });
                InitBarcode();
            }
        });
    }


    return viewModel;
};