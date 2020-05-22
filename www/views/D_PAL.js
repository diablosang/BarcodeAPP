Mobile.D_PAL = function (params) {
    "use strict";

    var viewModel = {
        hideFoot: true,
        fid: "D_PAL",
        se: false,
        seStart: "",
        seEnd: "",
        msgOption: msgTextEditor,
        config: {},
        scanData: [],
        formOption: {
            colCount: 2,
            colCountByScreen: { lg: 2, md: 2, sm: 2, xs: 2 },
            items: [
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
        txtMsg.option("value", "请扫描条码");
        viewModel.se = false;
        viewModel.seStart = "";
        viewModel.seEnd = "";
        viewModel.scanData = [];
        viewModel.modelBarInfo.SetBarInfo({ data: {} });
        form.option("formData", { CODE_SHP: "", CODE_BOX: "", CLOSE: false });
        var postData = {
            fid: viewModel.fid
        }

        PostServer("Barcode/Init", postData, function (result) {
            viewModel.config = result.data;
            InitBarcode();
        });
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
            case 120: {
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
                    case "CODE_SHP": CODE_SHPScan(); break;
                    case "CODE_BOX": CODE_BOXScan(); break;
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

    function BarcodeScan() {
        var txtMsg = $("#txtMsg").dxTextBox("instance");
        txtMsg.focus();
        var form = $("#formMain").dxForm("instance");
        var formData = form.option("formData");
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
                var form = $("#formMain").dxForm("instance");
                var formData = form.option("formData");

                var postData = {
                    fid: viewModel.fid,
                    data: viewModel.scanData
                };

                PostServer("Barcode/Submit", postData, function (result) {
                    var msg = "托盘" + result.data + "扫描成功";
                    InitView();
                    SetMessage(msg, "success");
                });
                InitBarcode();
            }
        });

    }

    return viewModel;
};