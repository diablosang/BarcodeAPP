Mobile.FormDetail = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        data: {},
        block:{},
        rowIndex:0,
        keepCache: false,
        fieldEvent: true,
        clickTrigger: true,
        attachField: "",
        attachType:"",
        viewShown: function (e) {
            if (viewModel.keepCache == true) {
                viewModel.keepCache = false;
                var viewAction = sessionStorage.getItem("viewAction");
                if (viewAction != null) {
                    sessionStorage.removeItem("viewAction");

                    if (viewAction == "dataWindow") {
                        UpdateDataWindow();
                    }
                }
                return;
            }

            InitView(viewModel);
        },
        viewHidden: function (e) {
            if (viewModel.keepCache == false) {
                var cache = Mobile.app.viewCache;
                cache.removeView(e.viewInfo.key);
            }

            sessionStorage.setItem("viewAction","refreshRow");
        },
        indicatorVisible:ko.observable(false),
        toolBarOption: {
            onItemClick: function (e) {
                switch (e.itemData.name) {
                    case "delete":
                        {
                            DeleteRow();
                            break;
                        }
                }
            }
        }
    };

    function InitView(viewModel) {
        var param = JSON.parse(sessionStorage.getItem("detailData"));
        var $fieldset = $("#fsDetail");
        var block = param.block;
        viewModel.data = param.data;
        viewModel.block= block;
        viewModel.rowIndex = param.rowIndex;
        if (param.mode == "edit") {
            viewModel.title("修改" + block.DES);
        }
        else if (param.mode == "new") {
            viewModel.title("新建" + block.DES);
        }
        else {
            viewModel.title(block.DES);
        }

        var toolbarItems = [];
        if (block.ALLOWDELETE == "1") {
            toolbarItems.push({ location: 'before', widget: 'button', name: 'delete', options: { icon: 'remove', text: SysMsg.delete } });
        }

        if (toolbarItems.length > 0) {
            var toolBar = $("#toolbarDetail").dxToolbar("instance");
            toolBar.option("items", toolbarItems);
        }
        else {
            $("#toolbarDetail").hide();
        }



        for (var i = 0; i < block.field.length; i++) {
            var field = block.field[i];
            $('<div>').attr('id', 'field' + block.IDNUM + field.FIELDNAME).attr("class", "dx-field").appendTo($fieldset);
            var $field = $("#field" + block.IDNUM + field.FIELDNAME);

            var readonly = true;
            if (field.STATUS == "2") {
                readonly = false;
                if (field.REQUIRED=="1") {
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

            var fieldValue = viewModel.data[field.FIELDNAME];
            var feID = "fe" + block.IDNUM + field.FIELDNAME;

            if (field.CTRLTYPE == "9") {
                $("<div>")
                     .append($("<img>", { "src": "data:image;base64," + fieldValue, "class": "FormSizedImg", "id": feID }))
                     .appendTo($fv);
                $fv.append("<div id='itp" + feID + "'>");

                $("#fsDetail").on("click", ".FormSizedImg", function () {
                    var _this = $(this);//将当前的pimg元素作为_this传入函数  
                    ShowBigImg( _this);
                });

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
                    DES: field.DES,
                    onValueChanged: function (e) {
                        EditValueChanged(e);
                    },
                    onFocusIn: function (e) {
                        if (this.option("dataWindow") != null) {
                            if (e.component.option("readOnly") == false) {
                                OpenDataWindow(this);
                            }                            
                        }
                    }
                };

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
                    block: viewModel.block.IDNUM,
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

    function EditValueChanged(e)
    {
        if (viewModel.fieldEvent == false)
        {
            return;
        }
        var val = e.value;
        viewModel.indicatorVisible(true);

        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/FieldValueChanged";
        var option = e.component.option();
        var postData = {
            userName: u,
            blockID: option.BLOCKID,
            fieldName: option.FIELDNAME,
            fieldValue: e.value,
            rowIndex: viewModel.rowIndex
        }

        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            cache: false,
            success: function (data, textStatus) {
                if (data.DATA != null)
                {
                    viewModel.data = data.DATA[0];
                    var dr = data.DATA[0];
                    for (var fieldName in dr)
                    {
                        var feID = "#fe" + option.BLOCKID + fieldName;
                        var editor = $(feID);
                        if(editor.length > 0)
                        {
                            editor[Object.keys($(feID).data())[0]]("instance").option("value", dr[fieldName]);
                        }
                    }
                }
                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                e.component.option("value", e.previousValue);                
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function DeleteRow() {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/DeleteRow";
        var postData = {
            userName: u,
            blockID: viewModel.block.IDNUM,
            rowIndex: viewModel.rowIndex
        }

        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            cache: false,
            success: function (data, textStatus) {
                sessionStorage.setItem("f_delete", "1");
                (new DevExpress.framework.dxCommand({ onExecute: "#_back" })).execute();
                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
        return;
    }

    function OpenDataWindow(e) {
        var option = e.option();
        var p = {
            rowIndex: viewModel.rowIndex,
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
            rowIndex: viewModel.rowIndex
        };

        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            cache: false,
            success: function (data, textStatus) {
                viewModel.fieldEvent = false;
                viewModel.indicatorVisible(false);
                var block = viewModel.block;

                for (var i = 0; i < block.field.length; i++) {
                    var field = block.field[i];
                    var feID = "#fe" + param.blockID + field.FIELDNAME;
                    $(feID)[Object.keys($(feID).data())[0]]("instance").option("value", data[0][field.FIELDNAME]);
                }

                viewModel.fieldEvent = true;
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {                
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });

    }

    function ImageUpload(e)
    {
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
            async:false,
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
                if (data.FID != null && data.FID != "") {
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

    return viewModel;
};