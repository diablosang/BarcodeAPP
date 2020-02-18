Mobile.FormEdit = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        comment: ko.observable(""),
        commentButton: ko.observable(""),
        indicatorVisible: ko.observable(false),
        commentVisible: ko.observable(false),
        winbox: {},
        keepCache: false,
        clickTrigger: true,
        eventTrigger: true,
        attachType: "",
        attachField: "",
        viewShown: function () {
            if (viewModel.keepCache == true) {
                viewModel.keepCache = false;
                var viewAction = sessionStorage.getItem("viewAction");
                if (viewAction != null) {
                    sessionStorage.removeItem("viewAction");
                    if (viewAction == "refreshRow") {
                        RefreshData();
                    }

                    if (viewAction == "dataWindow") {
                        UpdateDataWindow();
                    }

                    if (viewAction == "orgSelect") {
                        ContinueZB();
                    }
                }
                return;
            }

            try {
                GetWinbox(this, params);
            }
            catch (e) {
                DevExpress.ui.notify("该单据未包含明细信息", "error", 1000);
            }
        },
        viewHidden: function (e) {
            if (viewModel.keepCache == false) {
                var cache = Mobile.app.viewCache;
                cache.removeView(e.viewInfo.key);
            }
        },
        toolBarOption: {
            items: [],
            onItemClick: function (e) {
                if (e.itemData.needComment == "1") {
                    var popComment = $("#popComment").dxPopup("instance");
                    popComment.show();
                    this.commentVisible(true);
                    this.comment(e.itemData.options.text);
                    this.commentButton(e.itemData.name);
                }
                else {
                    if (e.itemData.name == "wfhist") {
                        OpenWFHist();
                        return;
                    }

                    if (e.itemData.name == "recall") {
                        var dialog = DevExpress.ui.dialog.custom({
                            title: SysMsg.info,
                            message: SysMsg.dialogRecall,
                            buttons: [{ text: SysMsg.yes, value: true, onClick: function () { return true; } }, { text: SysMsg.no, value: false, onClick: function () { return false; } }]
                        });

                        dialog.show().done(function (dialogResult) {
                            if (dialogResult == true) {
                                ButtonClick("BMAINBLOCK", e.itemData.name, "", params);
                            }
                        });
                        return;
                    }

                    if (e.itemData.EXTPROP != null) {
                        if (e.itemData.EXTPROP.RUNAT == "DEVICE") {
                            ButtonClickDevice(e.itemData);
                            return;
                        }
                    }

                    ButtonClick("BMAINBLOCK", e.itemData.name, "", params);
                }
            }
        },
        gridWFHistOption: {
            dateSerializationFormat: "yyyy-MM-ddTHH:mm:ss",
            columnAutoWidth: true,
            columns: [
                {
                    dataField: "CREUSR", caption: SysMsg.wfCREUSR, allowEditing: false, allowSorting: false, lookup: {
                        dataSource: asUserList,
                        displayExpr: "IDNUM",
                        valueExpr:"DES"
                    }
                },
                { dataField: "CREDAT", caption: SysMsg.wfCREDAT, allowEditing: false, allowSorting: false, dataType: "date", format: "yyyy-MM-dd HH:mm:ss" },
                { dataField: "GRPID", caption: SysMsg.wfGRPID, allowEditing: false, allowSorting: false },
                { dataField: "BTNID", caption: SysMsg.wfBTNID, allowEditing: false, allowSorting: false },
                { dataField: "COMMENT", caption: SysMsg.wfCOMMENT, allowEditing: false, allowSorting: false }
            ],
            selection: {
                mode: "single"
            },
            paging: {
                enabled: false
            },
            scrolling: {
                useNative: false
            }
        },
        popCommentOption: {
            title: SysMsg.wfCOMMENT,
            showTitle: true,
            visible: false,
            height: 250,
            onShown: function (e) {
                var txtComment = $("#txtComment").dxTextArea("instance");
                txtComment.option("value", viewModel.comment());
            }
        },
        popWFHistOption: {
            title: SysMsg.wfhist,
            showTitle: true,
            visible: false,
            onShown: function (e) {
                BindWFHistData();
            }
        },
        onCommentClick: function (e) {
            var popComment = $("#popComment").dxPopup("instance");
            popComment.hide();
            var button = this.commentButton();
            if (button == "BTNSYSWFZB") {
                FinishZB(this.comment());
            }
            else {
                ButtonClick("BMAINBLOCK", this.commentButton(), this.comment(), params);
            }
            
        }
        //  Put the binding properties here
    };

    function InitView(params, winbox) {
        var $divButton = $("#divButton");
        var $divTab = $("#divTab");
        var $divBlock = $("#divBlock");
        $divButton.empty();
        $divTab.empty();
        $divBlock.empty();
        var dataTabs = [];

        for (var i = 0; i < winbox.block.length; i++) {
            var block = winbox.block[i];
            dataTabs.push({ IDNUM: block.IDNUM, text: block.DES, type: block.type });
            if (block.type == "MAIN") {
                InitButton(block, $divButton, params);
                InitMainBlock(block, $divBlock);
            }
            else {
                InitGridBlock(block, $divBlock);
            }
        }

        var divTab = $divTab.dxTabs("instance");
        divTab.option({
            dataSource: dataTabs,
            selectedIndex: 0,
            showNavButtons: false,
            scrollByContent:true,
            onItemClick: function (e) {

                var $blocks = $("#divBlock").children();
                for (var i = 0; i < $blocks.length; i++) {
                    var $block = $blocks[i];
                    if ($block.id == "blk" + e.itemData.IDNUM) {
                        $block.style.display = "block";

                        if (e.itemData.type == "LIST") {
                            var grid = $("#grid" + e.itemData.IDNUM).dxDataGrid("instance");
                            grid.repaint();
                        }
                    }
                    else {
                        $block.style.display = "none";
                    }
                }
                //DevExpress.ui.notify(e.itemData.IDNUM, "error", 1000);
            }
        });
        divTab.repaint();
    }

    function BindData(params) {
        var data = GetWinboxData(params);
    }

    function InitMainBlock(block, $divBlock) {
        $('<div>').attr('id', 'blk' + block.IDNUM).appendTo($divBlock);
        var $blk = $("#blk" + block.IDNUM);
        $('<div>').attr('id', 'fs' + block.IDNUM).attr("class", "dx-fieldset").appendTo($blk);
        var $fieldset = $("#fs" + block.IDNUM);

        for (var i = 0; i < block.field.length; i++) {
            var field = block.field[i];
            $('<div>').attr('id', 'field' + block.IDNUM + field.FIELDNAME).attr("class", "dx-field").appendTo($fieldset);
            var $field = $("#field" + block.IDNUM + field.FIELDNAME);

            var readonly = true;
            if (field.STATUS == "2") {
                readonly = false;
                if (field.REQUIRED == "1") {
                    $('<div>').attr("class", "dx-field-label EditableR").appendTo($field).html(field.DES);
                }
                else {
                    $('<div>').attr("class", "dx-field-label Editable").appendTo($field).html(field.DES);
                }
            }
            else {
                $('<div>').attr("class", "dx-field-label").appendTo($field).html(field.DES);
            }

            $('<div>').attr('id', 'fv' + block.IDNUM + field.FIELDNAME).attr("class", "dx-field-value").appendTo($field);
            var $fv = $("#fv" + block.IDNUM + field.FIELDNAME);
            var feID = "fe" + block.IDNUM + field.FIELDNAME;
            var fieldValue = block.data[0][field.FIELDNAME];

            if (field.CTRLTYPE == "9") {
                $("<div>")
                    .append($("<img>", { "src": "data:image;base64," + fieldValue, "class": "FormSizedImg", "id": feID }))
                    .appendTo($fv);
                $fv.append("<div id='itp" + feID + "'>");

                if (readonly == false) {
                    var itp = $("#itp" + feID);
                    var obu = {
                        icon: "images/upload.png",
                        block: block.IDNUM,
                        field: field.FIELDNAME,
                        onClick: function (e) {
                            ImageUpload(e);
                        }
                    }
                    var obc = {
                        icon: "images/camera.png",
                        block: block.IDNUM,
                        field: field.FIELDNAME,
                        onClick: function (e) {
                            ImageCamera(e);
                        }
                    }
                    $("<div>").appendTo(itp).dxButton(obu);
                    $("<div style='margin-left:10px'>").appendTo(itp).dxButton(obc);
                }
           
            }
            else {
                var editorOption = {
                    value: fieldValue,
                    readOnly: readonly,
                    BLOCKID: block.IDNUM,
                    FIELDNAME: field.FIELDNAME,
                    onValueChanged: function (e) {
                        if (viewModel.eventTrigger == true) {
                            MainValueChanged(e);
                        }
                        else {
                            viewModel.eventTrigger = true;
                        }

                    },
                    onFocusIn: function (e) {
                        if (this.option("dataWindow") != null) {
                            if (e.component.option("readOnly") == false) {
                                OpenDataWindow(this);
                            }
                        }
                    },
                }

                createMainControl(feID, $fv, field, editorOption);

                if (field.CTRLTYPE == "914") {
                    $fv.append("<div id='itp" + feID + "'>");
                    var itp = $("#itp" + feID);
                    if (readonly == false) {
                        var obu = {
                            icon: "images/upload.png",
                            block: block.IDNUM,
                            field: field.FIELDNAME,
                            onClick: function (e) {
                                FileUpload(e);
                            }
                        }
                        $("<div>").appendTo(itp).dxButton(obu);
                    }

                    var obc = {
                        icon: "images/open.png",
                        block: block.IDNUM,
                        field: field.FIELDNAME,
                        onClick: function (e) {
                            FileOpen(this);
                        }
                    }
                    $("<div style='margin-left:10px'>").appendTo(itp).dxButton(obc);
                }
            }
        }

        $("#fileSelector").off("change");
        $("#fileSelector").on("change", function (e) {
            if (viewModel.clickTrigger == false) {
                return;
            }
            else {
                viewModel.clickTrigger = false;
            }
            var inputObj = this;
            if (inputObj.files.length == 0) {
                ServerError("No file selected");
                return;
            }
            var file = inputObj.files[0];

            if (viewModel.attachType == "image") {
                if (!/image\/\w+/.test(file.type)) {
                    ServerError("Not an image file selected");
                    return;
                }
            }


            viewModel.indicatorVisible(true);

            var reader = new FileReader();
            reader.onload = function (e) {
                var postData = {
                    name: file.name,
                    value: this.result,
                    block: "BMAINBLOCK",
                    field: viewModel.attachField
                }

                if (viewModel.attachType == "image") {
                    PostImage(postData);
                }
                else {
                    PostFile(postData);
                }
                inputObj.value = "";
            }
            reader.readAsDataURL(inputObj.files[0]);
        });

    }

    function InitGridBlock(block, $divBlock) {
        var cols = [];

        $('<div>').attr('id', 'blk' + block.IDNUM).attr("style", "display:none").appendTo($divBlock);
        var $blk = $("#blk" + block.IDNUM);
        $('<div>').attr('id', 'bar' + block.IDNUM).attr('style', 'margin-bottom:10px').appendTo($blk).dxToolbar({});
        var bar = $("#bar" + block.IDNUM).dxToolbar("instance");
        $('<div>').attr('id', 'grid' + block.IDNUM).appendTo($blk).dxDataGrid({});
        var grid = $("#grid" + block.IDNUM).dxDataGrid("instance");

        var baritems = [];

        if (block.ALLOWEDIT == "1") {
            var baritemNew = { location: 'before', widget: 'button', name: "new", needComment: "0", options: { icon: "add" } };
            baritems.push(baritemNew);
        }

        for (var b = 0; b < block.button.length; b++) {
            var button = block.button[b];
            var baritem = { location: 'before', widget: 'button', name: button.BTNID, needComment: button.NEEDCOMMENT, options: { text: button.DES } };
            baritems.push(baritem);
        }

        if (baritems.length == 0) {
            $("#bar" + block.IDNUM).hide();
        }
        else {
            bar.option({
                items: baritems,
                blockID: block.IDNUM,
                onItemClick: function (e) {
                    switch (e.itemData.name) {
                        case "new": {
                            OpenNewDetailForm(e, this.option("blockID"));
                            break;
                        }
                        default: {
                            if (e.itemData.needComment == "1") {
                                this.commentVisible(true);
                                this.comment(e.itemData.options.text);
                                this.commentButton(e.itemData.name);
                            }
                            else {
                                ButtonClick(block.IDNUM, e.itemData.name, "", params);
                            }

                            break;
                        }
                    }
                }
            });
            bar.repaint();
        }
        

        for (var i = 0; i < block.field.length; i++) {
            var field = block.field[i];
            var readonly = true;
            if (field.STATUS == "2") {
                readonly = false;
            }

            var col = createListControl(field, readonly, block);
      
            cols.push(col);
        }

        var allowAdding = block.ALLOWCREATE == "1";
        var allowDeleting = block.ALLOWDELETE == "1";
        var allowUpdating = block.ALLOWEDIT == "1";

        grid.option({
            columns: cols,
            columnAutoWidth: true,
            BLOCKID: block.IDNUM,
            paging: {
                enabled: false
            },
            selection: {
                mode: 'single'
            },
            scrolling: {
                useNative: false
            },
            dataSource: block.data,
            onRowClick: function (e) {
                var selection = e.data;
                if (selection == null) {
                    return;
                }

                OpenDetailForm(e);

            },
            editing: {
                texts: {
                    confirmDeleteMessage: ""
                }
            }
        });

        grid.refresh();
    }

    function InitButton(block, $divButton, params) {
        var bar = $("#mainBar").dxToolbar("instance");
        var baritems = [];

        if (block.ALLOWEDIT == "1") {
            var baritemSave = { location: 'before', widget: 'button', name: "save", needComment: "0", options: { icon: "save" } };
            baritems.push(baritemSave);
        }

        var baritemRefresh = { location: 'before', widget: 'button', name: "refresh", needComment: "0", options: { icon: "refresh" } };
        baritems.push(baritemRefresh);

        if (viewModel.winbox.WORKFLOW == "1") {
            var baritemWFHIST = { location: 'before', widget: 'button', name: "wfhist", needComment: "0", options: { icon: "event" } };
            baritems.push(baritemWFHIST);
        }

        if (viewModel.winbox.RECALL == "1") {
            var baritemRecall = { location: 'before', widget: 'button', name: "recall", needComment: "0", options: { icon: "revert" } };
            baritems.push(baritemRecall);
        }


        for (var b = 0; b < block.button.length; b++) {
            var button = block.button[b];
            //if (button.BTNID == "BTNSYSWFZB") {
            //    continue;
            //}
            var baritem = { location: 'before', widget: 'button', name: button.BTNID, needComment: button.NEEDCOMMENT, options: { text: button.DES }, EXTPROP: button.EXTPROP };
            baritems.push(baritem);
        }

        bar.option({
            items: baritems
        });
        bar.repaint();

        //for (var b = 0; b < block.button.length; b++) {
        //    var button = block.button[b];
        //    $('<div>').attr('id', button.BTNID).attr("style","float:left").appendTo($divButton).dxButton({});
        //    var btn = $("#"+button.BTNID).dxButton("instance");
        //    btn.option({
        //        text: button.DES,
        //        btnid:button.BTNID,
        //        onClick: function (e) {
        //            ButtonClick(e.component.option().btnid, params);
        //        }
        //    });
        //    btn.repaint();
        //}
    }

    function GetWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = "";
        if (params.NEW == "1") {
            url = serviceURL + "/Api/Asapment/NewDoc?UserName=" + u + "&FUNCID=" + params.FUNCID + "&GROUPID=" + params.GROUPID;
        }
        else {
            url = serviceURL + "/Api/Asapment/GetWinbox?UserName=" + u + "&FUNCID=" + params.FUNCID + "&GROUPID=" + params.GROUPID + "&DOCID=" + params.DOCID;
        }


        $.ajax({
            type: 'GET',
            url: url,
            cache: false,
            success: function (data, textStatus) {
                viewModel.winbox = data;
                viewModel.title(data.func);
                InitView(params, data);
                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                if (xmlHttpRequest.responseText == "NO SESSION") {
                    ServerError(xmlHttpRequest.responseText);
                }
                else {
                    DevExpress.ui.notify("该单据未包含明细信息", "error", 1000);
                }


            }
        });
    }

    function ButtonClick(BLOCKID, BTNID, comment, params) {
        if (BTNID == "BTNSYSWFZB") {
            viewModel.keepCache = true;
            Mobile.app.navigate("ORGSelect");
            return;
        }


        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/ButtonClick2?UserName=" + u + "&BLOCKID=" + BLOCKID + "&BTNID=" + BTNID + "&COMMENT=" + comment;
        url = encodeURI(url);
        $.ajax({
            type: 'GET',
            url: url,
            cache: false,
            success: function (data, textStatus) {
                if (BTNID == "refresh") {
                    BindWinboxData(viewModel, data);
                }
                else {
                    if (data.Close == "1") {
                        (new DevExpress.framework.dxCommand({ onExecute: "#_back" })).execute();
                        return;
                    }

                    if (data.Message != "") {
                        ButtonClick("", "refresh", "", "");
                        DevExpress.ui.notify(data.Message, "success", 2000);
                    }
                }
                viewModel.indicatorVisible(false);

            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function ContinueZB() {
        var popComment = $("#popComment").dxPopup("instance");
        popComment.show();
        viewModel.commentVisible(true);
        viewModel.comment("");
        viewModel.commentButton("BTNSYSWFZB");
    }

    function FinishZB(comment) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/ButtonClick2?UserName=" + u + "&BLOCKID=BMAINBLOCK&BTNID=BTNSYSWFZB&COMMENT=" + comment;
        url = encodeURI(url);
        $.ajax({
            type: 'GET',
            url: url,
            cache: false,
            success: function (data, textStatus) {
                viewModel.indicatorVisible(false);
                (new DevExpress.framework.dxCommand({ onExecute: "#_back" })).execute();
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function ButtonClickDevice(button) {
        if (button.EXTPROP.ACTION = "SCAN") {
            cordova.plugins.barcodeScanner.scan(function (result) {
                if (result.text == null || result.text == "") {
                    return;
                }

                var result = result.text;
                CallbackServer(button.EXTPROP.CALLBACK, result);
            },
                function (error) {
                    DevExpress.ui.notify("扫描失败: " + error, "error", 3000);
                });
        }
    }

    function CallbackServer(callback, result) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/CallbackServer?UserName=" + u + "&Callback=" + callback + "&Result=" + result;
        url = encodeURI(url);
        $.ajax({
            type: 'GET',
            url: url,
            cache: false,
            success: function (data, textStatus) {
                if (data.Close == "1") {
                    (new DevExpress.framework.dxCommand({ onExecute: "#_back" })).execute();
                    return;
                }

                if (data.Message != "") {
                    ButtonClick("", "refresh", "", "");
                    DevExpress.ui.notify(data.Message, "success", 2000);
                }
                viewModel.indicatorVisible(false);

            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function BindWinboxData(viewModel, data) {
        for (var b in data) {
            var block;
            var blockID = data[b].IDNUM;
            if (blockID == "BMAINBLOCK") {
                for (var i = 0; i < viewModel.winbox.block.length; i++) {
                    var blk = viewModel.winbox.block[i];
                    if (blk.IDNUM == blockID) {
                        block = blk;
                        break;
                    }
                }

                for (var bf in block.field) {
                    var field = block.field[bf];
                    var feID = "#fe" + blockID + field.FIELDNAME;
                    $(feID)[Object.keys($(feID).data())[0]]("instance").option("value", data[b].data[0][field.FIELDNAME]);
                    continue;
                }

            }
            else {
                var grid = $("#grid" + blockID).dxDataGrid("instance");
                grid.option("dataSource", data[b].data);
                grid.refresh();
            }
        }

    }

    function OpenDetailForm(e) {
        viewModel.keepCache = true;
        var option = e.component.option();
        var block;
        for (var i = 0; i < viewModel.winbox.block.length; i++) {
            var b = viewModel.winbox.block[i];
            if (b.IDNUM == option.BLOCKID) {
                block = b;
                break;
            }
        }

        var param = {
            mode: "edit",
            block: block,
            data: e.data,
            rowIndex: e.dataIndex
        }

        sessionStorage.setItem("detailData", JSON.stringify(param));
        Mobile.app.navigate("FormDetail");
    }

    function OpenNewDetailForm(e, blockID) {
        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/AddNewRow";
        var postData = {
            blockID: blockID,
            userName: u
        }

        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            cache: false,
            success: function (data, textStatus) {
                viewModel.indicatorVisible(false);
                var grid = $("#grid" + blockID).dxDataGrid("instance");
                var ds = grid.option("dataSource");
                ds.push(data[0]);
                grid.option("dataSource", ds);
                viewModel.keepCache = true;

                var block;
                for (var i = 0; i < viewModel.winbox.block.length; i++) {
                    var b = viewModel.winbox.block[i];
                    if (b.IDNUM == blockID) {
                        block = b;
                        break;
                    }
                }

                var idx = ds.length - 1;
                var rowdata = data;
                var param = {
                    mode: "new",
                    block: block,
                    data: rowdata,
                    rowIndex: idx
                }

                sessionStorage.setItem("detailData", JSON.stringify(param));
                Mobile.app.navigate("FormDetail");
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function MainValueChanged(e) {
        var val = e.value;
        var loadIndicator = $("#loadIndicator").dxLoadIndicator("instance");
        loadIndicator.option("visible", true);

        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/FieldValueChanged";
        var option = e.component.option();
        var postData = {
            userName: u,
            blockID: option.BLOCKID,
            fieldName: option.FIELDNAME,
            fieldValue: e.value,
            rowIndex: 0
        }

        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            cache: false,
            success: function (data, textStatus) {
                if (data.DATA != null) {
                    var dr = data.DATA[0];
                    for (var fieldName in dr) {
                        var feID = "#fe" + option.BLOCKID + fieldName;
                        var editor = $(feID);
                        if (editor.length > 0) {
                            editor[Object.keys($(feID).data())[0]]("instance").option("value", dr[fieldName]);
                        }
                    }
                }
                loadIndicator.option("visible", false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.eventTrigger = false;
                e.component.option("value", e.previousValue);
                loadIndicator.option("visible", false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function RefreshData() {
        var param = JSON.parse(sessionStorage.getItem("detailData"));
        var blockID = param.block.IDNUM;
        var f_delete = sessionStorage.getItem("f_delete")
        sessionStorage.removeItem("f_delete");
        var postData = {};
        var u = sessionStorage.getItem("username");

        if (f_delete == "1") {
            var grid = $("#grid" + blockID).dxDataGrid("instance");
            var ds = grid.option("dataSource");
            grid.deleteRow(param.rowIndex);
            postData = {
                blockID: "BMAINBLOCK",
                userName: u,
                rowIndex: 0
            }
        }
        else {
            postData = {
                blockID: blockID,
                userName: u,
                rowIndex: param.rowIndex
            }
        }


        var url = serviceURL + "/Api/Asapment/GetDataRowV2";

        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            cache: false,
            success: function (data, textStatus) {
                viewModel.indicatorVisible(false);
                if (f_delete != "1") {
                    var grid = $("#grid" + blockID).dxDataGrid("instance");
                    var ds = grid.option("dataSource");
                    ds[param.rowIndex] = data.detailData[0];
                    grid.option("dataSource", ds);
                }

                for (var f in data.mainData[0]) {
                    var feID = "#feBMAINBLOCK" + f;
                    var ctrl = $(feID).data();
                    if (ctrl != null) {
                        $(feID)[Object.keys(ctrl)[0]]("instance").option("value", data.mainData[0][f]);
                    }
                    continue;
                }
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                ServerError(xmlHttpRequest.responseText);
                viewModel.indicatorVisible(false);
            }
        });
    }

    function OpenDataWindow(e) {
        var option = e.option();
        var p = {
            rowIndex: 0,
            blockID: option.BLOCKID,
            fieldName: option.FIELDNAME,
            fieldDES: option.DES
        };

        sessionStorage.setItem("dwParam", JSON.stringify(p));
        viewModel.keepCache = true;
        Mobile.app.navigate("DataWindow");
    }

    function UpdateDataWindow() {
        var dwData = [];
        dwData.push(JSON.parse(sessionStorage.getItem("dwData")));
        var param = JSON.parse(sessionStorage.getItem("dwParam"));

        var dwInput = sessionStorage.getItem("dwInput");
        if (dwInput == "1") {
            sessionStorage.removeItem("dwInput");
            var feID = "#fe" + param.blockID + param.fieldName;
            var inputValue = dwData[0][param.fieldName];
            $(feID)[Object.keys($(feID).data())[0]]("instance").option("value", inputValue);
            return;
        }

        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/SetDataWindow";

       
        var postData = {
            blockID: param.blockID,
            fieldName: param.fieldName,
            data: dwData,
            userName: u,
            rowIndex: 0
        };

        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            cache: false,
            success: function (data, textStatus) {
                viewModel.indicatorVisible(false);
                var block = viewModel.winbox.block[0];

                for (var i = 0; i < block.field.length; i++) {
                    var field = block.field[i];
                    var feID = "#fe" + param.blockID + field.FIELDNAME;
                    var ctrl = $(feID).data();
                    if (ctrl != null) {
                        $(feID)[Object.keys(ctrl)[0]]("instance").option("value", data[0][field.FIELDNAME]);
                    }

                }
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                ServerError(xmlHttpRequest.responseText);
                viewModel.indicatorVisible(false);
            }
        });

    }

    function ImageUpload(e) {
        viewModel.clickTrigger = true;
        e.event.stopPropagation();
        var button = e.element.dxButton("instance");
        viewModel.attachType = "image";
        viewModel.attachField = button.option("field");
        var inputObj = $("#fileSelector")[0];
        inputObj.click();

    }

    function ImageCamera(e) {
        if (viewModel.clickTrigger == false) {
            viewModel.clickTrigger = true;
            return;
        }
        else {
            viewModel.clickTrigger = false;
        }

        var button = e.element.dxButton("instance");
        var option = button.option();

        navigator.camera.getPicture(
            function (e) {
                var val = "data:image;base64," + e;
                var postData = {
                    value: val,
                    block: option.block,
                    field: option.field
                }
                PostImage(postData);
            },
            function (e) {
                ServerError(e);
            },
            { destinationType: Camera.DestinationType.DATA_URL }
        );
    }

    function FileUpload(e) {
        viewModel.clickTrigger = true;
        e.event.stopPropagation();
        var button = e.element.dxButton("instance");
        viewModel.attachType = "";
        viewModel.attachField = button.option("field");
        var inputObj = $("#fileSelector")[0];
        inputObj.click();
    }

    function FileOpen(e) {
        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/GetFileID";

        var postData = {
            userName: u,
            blockID: e._options.block,
            fieldName: e._options.field,
            rowIndex: viewModel.rowIndex
        }

        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                if (data.FID != null && data.FID !="") {
                    OpenFile(data.FID);
                }

                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function PostFile(e) {
        if (viewModel.fieldEvent == false) {
            return;
        }
        var val = e.value;
        var feID = "fe" + e.block + e.field;
        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/FileUpload";

        var postData = {
            userName: u,
            blockID: e.block,
            fieldName: e.field,
            fileName: e.name,
            base64Value: val,
            rowIndex: viewModel.rowIndex
        }

        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                if (data.DATA != null) {
                    viewModel.data = data.DATA[0];
                    var dr = data.DATA[0];
                    for (var fieldName in dr) {
                        var feID = "#fe" + e.block + fieldName;
                        var editor = $(feID);
                        if (editor.length > 0) {
                            editor[Object.keys($(feID).data())[0]]("instance").option("value", dr[fieldName]);
                        }
                    }
                }

                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function PostImage(e) {
        if (viewModel.fieldEvent == false) {
            return;
        }
        var val = e.value;
        var feID = "fe" + e.block + e.field;
        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/PostImage";

        var postData = {
            userName: u,
            blockID: e.block,
            fieldName: e.field,
            base64Value: val,
            rowIndex: viewModel.rowIndex
        }

        var img = $("#" + feID)[0];

        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                img.src = val;
                if (data.DATA != null) {
                    viewModel.data = data.DATA[0];
                    var dr = data.DATA[0];
                    for (var fieldName in dr) {
                        if (fieldName == e.field) {
                            continue;
                        }
                        var feID = "#fe" + e.block + fieldName;
                        var editor = $(feID);
                        if (editor.length > 0) {
                            editor[Object.keys($(feID).data())[0]]("instance").option("value", dr[fieldName]);
                        }
                    }
                }

                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function OpenWFHist() {
        var popWFHist = $("#popWFHist").dxPopup("instance");
        popWFHist.show();
    }

    function BindWFHistData() {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/GetWFHistory";

        var postData = {
            userName: u
        }

        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                var gridWFHist = $("#gridWFHist").dxDataGrid("instance");
                gridWFHist.option("dataSource", data);
                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    return viewModel;
};