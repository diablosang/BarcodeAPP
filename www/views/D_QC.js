Mobile.D_QC = function (params) {
    "use strict";

    var viewModel = {
        hideFoot: true,
        fid: "D_QC",
        devParam:"",
        title: ko.observable(""),
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
            this.devParam = params.DEVPARAM;
            if (params.DEVPARAM == "1") {
                this.fid = "D_QC1";
                this.title("合格放行扫描");
            }
            else {
                this.fid = "D_QC2";
                this.title("不良隔离扫描");
            }

            InitView();
        }
    };

    function InitView() {
        var form = $("#formMain").dxForm("instance");
        form.focus();
        var txtMsg = $("#txtMsg").dxTextBox("instance");
        txtMsg.option("value", "请扫描条码");
        viewModel.scanData = [];
        viewModel.modelBarInfo.SetBarInfo({ data: {} });
        form.option("formData", { CODE_SHP: "", CODE_BOX: "", CLOSE: false });
        var postData = {
            fid: viewModel.fid,
            qcResult: viewModel.devParam
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

        var postData = {
            bartype: "BARCODE",
            barcode: barcode
        };

        PostServer("Barcode/Scan", postData, function (result) {
            ProcessData(result.data);
            var msg = "";
            if (viewModel.devParam == "1") {
                msg = "质检合格";
            }
            else {
                msg = "不良隔离";
            }

            SetMessage("条码" + barcode + msg, "success");
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