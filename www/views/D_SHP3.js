Mobile.D_SHP3 = function (params) {
    "use strict";

    var viewModel = {
        hideFoot: true,
        fid: "D_SHP3",
        code_shp: "",
        code_box: "",
        msgOption: msgTextEditor,
        config: {},
        scanData: [],
        issData:[],
        formOption: {
            colCount: 3,
            colCountByScreen: { lg: 3, md: 3, sm: 3, xs: 3 },
            items: [
                {
                    label: { text: "单号" },
                    dataField: "CODE_SHP",
                    editorOptions: {
                        onKeyDown: function (e) {
                            KeyDown("CODE_SHP", e);
                        }
                    },
                    colSpan: 2
                },
                {
                    label: { text: "关闭" },
                    dataField: "CLOSE",
                    editorType:"dxCheckBox",
                    colSpan: 1
                },
                {
                    label: { text: "箱号" },
                    dataField: "CODE_BOX",
                    editorOptions: {
                        onKeyDown: function (e) {
                            KeyDown("CODE_BOX", e);
                        }
                    },
                    colSpan: 3
                },
                {
                    label: { text: "条码" },
                    dataField: "CODE_BAR",
                    editorOptions: {
                        onKeyDown: function (e) {
                            KeyDown("CODE_BAR", e);
                        }
                    },
                    colSpan: 3
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
        txtMsg.option("value", "请扫描箱号");
        viewModel.code_loc = "";
        viewModel.code_shelf = "";
        viewModel.scanData = [];
        viewModel.issData = [];
        viewModel.modelBarInfo.SetBarInfo({ data: {} });
        form.option("formData", { CODE_SHP: "", CODE_BOX: "", CLOSE: false });
        var postData = {
            fid: viewModel.fid
        }

        PostServer("Barcode/Init", postData, function (result) {
            viewModel.config = result.data;
            InitCODE_SHP();
        });
    }

    function InitCODE_SHP() {
        var form = $("#formMain").dxForm("instance");
        var editor = form.getEditor("CODE_SHP");
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

    function CODE_BOXScan() {
        var txtMsg = $("#txtMsg").dxTextBox("instance");
        txtMsg.focus();

        var form = $("#formMain").dxForm("instance");
        var formData = form.option("formData");

        viewModel.code_box = formData.CODE_BOX;
        SetMessage("请扫描条码");
        InitBarcode();
    }

    function CODE_SHPScan() {
        var txtMsg = $("#txtMsg").dxTextBox("instance");
        txtMsg.focus();

        var form = $("#formMain").dxForm("instance");
        var formData = form.option("formData");

        var postData = {
            bartype: "CODE_SHP",
            barcode: formData.CODE_SHP
        };

        PostServer("Barcode/Scan", postData, function (result) {
            viewModel.code_shp = formData.CODE_SHP;
            viewModel.issData = result.data;

            SetMessage("请扫描箱号，没有箱号直接回车");
            var editor = form.getEditor("CODE_BOX");
            editor.option("value", "");
            editor.focus();
        });
    }

    function BarcodeScan() {
        var txtMsg = $("#txtMsg").dxTextBox("instance");
        txtMsg.focus();
        var form = $("#formMain").dxForm("instance");
        var formData = form.option("formData");

        if (viewModel.code_shp == "") {
            SetMessage("请先扫描单号", "error");
            InitBarcode();
            return;
        }

        var barcode = formData.CODE_BAR;

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
            if (findData != null && dataSet.length == 1) {
                viewModel.scanData.pop(findData);
                remove++;
            }
            else {
                if (CheckQTY(data) == false) {
                    SetMessage("条码已扫描的数量超出要求装箱数量", "error");
                    InitBarcode();
                    return 1;
                }

                viewModel.scanData.push(data);
                count++;
            }
        }

        var countInfo = { BAR_CUR: 0, QTY_CUR: 0, BAR_TOT: 0, QTY_TOT: 0 };
        var CODE_ITEM = data.CODE_ITEM;
        for (var i = 0; i < viewModel.scanData.length; i++) {
            var sd = viewModel.scanData[i];
            countInfo.BAR_TOT++;
            countInfo.QTY_TOT += sd.QTY;
            if (sd.CODE_ITEM == CODE_ITEM) {
                countInfo.BAR_CUR++;
                countInfo.QTY_CUR += sd.QTY;
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

    function CheckQTY(data) {
        var qtyScan = data.QTY;
        for (var i = 0; i < viewModel.scanData.length; i++) {
            var sd = viewModel.scanData[i];
            qtyScan += sd.QTY;
        }

        var qtyISS = 0;
        for (var i = 0; i < viewModel.issData.length; i++) {
            var iss = viewModel.issData[i];
            qtyISS += iss.QTY_REQ;
        }

        if (qtyISS > qtyScan) {
            return false;
        }
        else {
            return true;
        }
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
                    CODE_SHP: viewModel.code_shp,
                    CODE_BOX: viewModel.code_box,
                    CLOSE: formData.CLOSE,
                    data: viewModel.scanData
                };

                PostServer("Barcode/Submit", postData, function (result) {
                    var msg = "出库单" + result.data + "提交成功";
                    InitView();
                    SetMessage(msg, "success");
                });
                InitBarcode();
            }
        });

    }

    return viewModel;
};