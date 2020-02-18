Mobile.FormList = function (params) {
    "use strict";

    var viewModel = {
        winbox: {},
        curPage: ko.observable(1),
        searchInited: ko.observable(false),
        indicatorVisible: ko.observable(false),
        title: ko.observable(""),
        funcID: ko.observable(""),
        groupID: ko.observable(""),
        keyfield: ko.observable(""),
        viewShown:function(e){
            GetListWinbox(viewModel, params);
        },
        gridOption: {
            columnAutoWidth: true,
            wordWrapEnabled: true,
            selection: {
                mode: "single"
            },
            paging:{
                enabled: false
            },
            scrolling:{
                useNative:false
            },
            onRowClick: function (e) {
                var selectedData = e.data;
                if (selectedData == null) {
                    return;
                }

                var view = "FormEdit?FUNCID=" + this.funcID() + "&GROUPID=" + this.groupID() + "&DOCID=" + selectedData[this.keyfield()];
                Mobile.app.navigate(view);
            }
        },
        toolBarOption:{
            items: [
                { location: 'before', widget: 'button', name: 'new', options: { icon: 'doc', text: '' } },
                { location: 'before', widget: 'button', name: 'find', options: { icon: 'find', text: '' } },
                { location: 'before', widget: 'button',name:'first', options: { icon: 'home', text: '' } },
                  { location: 'before', widget: 'button',name:'prev', options: { icon: 'spinleft',text:'' } },
                  { location: 'before', widget: 'button', name: 'next', options: { icon: 'spinright', text: '' } },
                  //{ location: 'before', widget: 'button', name: 'find', options: { icon: 'find', text: '查找' } },
                  { location: 'before', widget: 'button', name: 'fav', options: { icon: 'favorites', text: '' } },
            ],
            onItemClick: function (e) {
                switch (e.itemData.name)
                {
                    case "new":
                        {
                            var view = "FormEdit?FUNCID=" + this.funcID() + "&GROUPID=" + this.groupID() + "&NEW=1";
                            Mobile.app.navigate(view);
                            break;
                        }
                    case "find":
                        {
                            var popup = $("#popSearch").dxPopup("instance");
                            popup.show();
                            break;
                        } 
                    case "first": this.curPage(1); BindData(this); break;
                    case "prev":
                        {
                            if (this.curPage() == 1) {
                                return;
                            }
                            else {
                                var p = this.curPage() - 1;
                                this.curPage(p);
                                BindData(this);
                            }
                            break;
                            
                        }
                    case "next": {
                        var p = this.curPage() + 1;
                        this.curPage(p);
                        BindData(this);
                        break;
                    }
                    case "fav": {
                        AddFavorite(this);
                        break;
                    }
                }
            }
        },
        searchPopupOption: {
            title: '',
            showTitle: true,
            visible: false,
            toolbarItems:
               [{
                   location: 'center', options: {
                       text: '执行查找',
                       icon:'find',
                       onClick: function (e) {
                           SearchData(viewModel);
                       }
                   }, widget: 'dxButton'
               }],
            onShowing: function (e) {
                if (viewModel.searchInited() == true)
                {
                    return;
                }
                var $fsSearch = $("#fsSearch");
                var block = this.winbox.block[0];
                for (var i = 0; i < block.field.length; i++) {
                    var field = block.field[i];
                    if (field.ALLOWSEARCH=="1") {
                        AddSearchField(block,field,$fsSearch);
                    }
                }
                viewModel.searchInited(true);

            },
            onShown: function (e) {
                var w = $("#popSearch").width();
                w = w - w / 3.15;
                $("#fsSearch").width(w);
            }
        }
    };

    return viewModel;

    function SearchData(viewModel) {
        var block = viewModel.winbox.block[0];
        var where = "";

        if (block.PROC != "1") {
            where = "1=1";
        }


        for (var i = 0; i < block.field.length; i++) {
            var field = block.field[i];
            if (field.ALLOWSEARCH == "1") {
                var control;
                var feID = "#fe" + block.IDNUM + field.FIELDNAME;

                switch (field.CTRLTYPE) {
                    case "2": {
                        if (field.DSTYPE == "5") {
                            control = $(feID).dxSelectBox("instance");
                        }
                        else {
                            if (field.DS_DATA.length > 0) {
                                control = $(feID).dxSelectBox("instance");
                            }
                            else {
                                control = $(feID).dxTextBox("instance");
                            }
                        }


                        var val = control.option().value;
                        if (val != null && val.toString() != "") {
                            if (block.PROC == "1") {
                                where = where + "'" + val + "',";
                            }
                            else {
                                where = where + " and " + field.FIELDNAME + "='" + val + "'";
                            }

                        }
                        break;
                    }
                    case "3": {
                        control = $(feID).dxCheckBox("instance");
                        var val = control.option().value;
                        if (val != null && val.toString() != "") {
                            val = (val == true ? "1" : "0");
                            if (block.PROC == "1") {
                                where = where + "'" + val + "',";
                            }
                            else {
                                where = where + " and " + field.FIELDNAME + "=" + val;
                            }

                        }
                        break;
                    }
                    case "4": {
                        var control1 = $(feID).dxDateBox("instance");
                        var val1 = control1.option().text;
                        var control2 = $(feID + "_T").dxDateBox("instance");
                        var val2 = control2.option().text;
                        if (val1 != null && val1.toString() != "") {
                            if (val2 != null && val2.toString() != "") {
                                if (block.PROC == "1") {
                                    where = where + "'" + val1 + "','" + val2 + "',";
                                }
                                else {
                                    where = where + " and (" + field.FIELDNAME + " between '" + val1 + "' and '" + val2 + "')";
                                }

                            }
                            else {
                                if (block.PROC == "1") {
                                    where = where + "'" + val + "',";
                                }
                                else {
                                    where = where + " and " + field.FIELDNAME + "='" + val1 + "'";
                                }

                            }
                        }
                        break;
                    }
                    case "5": {
                        control = $(feID).dxTextArea("instance");
                        var val = control.option().value;
                        if (val != null && val.toString() != "") {
                            if (block.PROC == "1") {
                                where = where + "'" + val + "',";
                            }
                            else {
                                where = where + " and " + field.FIELDNAME + " like '%" + val + "%'";
                            }

                        }
                        break;
                    }
                    case "7": {
                        control = $(feID).dxNumberBox("instance");
                        var val = control.option().value;
                        if (val != null && val.toString() != "") {
                            if (block.PROC == "1") {
                                where = where + "'" + val + "',";
                            }
                            else {
                                where = where + " and " + field.FIELDNAME + "=" + val;
                            }

                        }
                        break;
                    }
                    case "8": {
                        control = $(feID).dxTextBox("instance");
                        var val = control.option().value;
                        if (val != null && val.toString() != "") {
                            if (block.PROC == "1") {
                                where = where + "'" + val + "',";
                            }
                            else {
                                where = where + " and " + field.FIELDNAME + "='" + val + "'";
                            }

                        }
                        break;
                    }
                    default: {
                        control = $(feID).dxTextBox("instance");
                        var val = control.option().value;
                        if (val != null && val.toString() != "") {
                            if (block.PROC == "1") {
                                where = where + "'" + val + "',";
                            }
                            else {
                                where = where + " and " + field.FIELDNAME + " like '%" + val + "%'";
                            }
                        }
                        break;
                    }
                }
            }
        }

        var popup = $("#popSearch").dxPopup("instance");
        popup.hide();
        viewModel.curPage(1);
        BindData(viewModel, where);
    }

    function InitView(viewModel, params,winbox)
    {
        $("#fsSearch").empty();
        viewModel.searchInited(false);

        var grid = $("#gridMain").dxDataGrid("instance");
        grid.deselectAll();

        var block = winbox.block[0];
        var cols = [];
        for (var i = 0; i < block.field.length; i++) {
            var field = block.field[i];
            var col = createListControl(field);
            cols.push(col);
        }

        grid.option({
            columns: cols,
            columnAutoWidth: true,
            dataSource: block.data
        });

        grid.refresh();

        var toolbar = $("#tbMain").dxToolbar("instance");
        var option = toolbar.option();

        if (block.ALLOWCREATE == "1") {
            option.items[0].disabled = false;
        }
        else {
            option.items[0].disabled = true;
        }

        toolbar.option(option);
        toolbar.repaint();
    }

    function AddSearchField(block, field, $fsSearch)
    {
        $('<div>').attr('id', 'fsf' + block.IDNUM + field.FIELDNAME).attr("class", "dx-field").appendTo($fsSearch);
        var $field = $("#fsf" + block.IDNUM + field.FIELDNAME);
        $('<div>').attr("class", "dx-field-label").appendTo($field).html(field.DES);
        $('<div>').attr('id', 'fsv' + block.IDNUM + field.FIELDNAME).attr("class", "dx-field-value").appendTo($field);
        var $fv = $("#fsv" + block.IDNUM + field.FIELDNAME);

        var editorOption = {
            value: "",
            readOnly: false,
            BLOCKID: block.IDNUM,
            FIELDNAME: field.FIELDNAME
        }
        var feID = "fe" + block.IDNUM + field.FIELDNAME;

        createMainControl(feID,$fv,field, editorOption);

        if (field.CTRLTYPE == "4")
        {
            $('<div>').attr('id', 'fe' +block.IDNUM+ field.FIELDNAME + '_T').appendTo($fv).dxDateBox({
                value:"",
                formatString: "yyyy-MM-dd",
                pickerType: "calendar",
                readOnly: false
            });
        }
    }

    function BindData(viewModel,filterString)
    {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        //var url = serviceURL + "/Api/Asapment/GetListData?UserName=" + u + "&page=" + viewModel.curPage();
        var url = serviceURL + "/Api/Asapment/GetListData2";
        var postData = {
            user: u,
            page: viewModel.curPage()-1,
            filter: filterString
        }

        $.ajax({
            type: 'POST',
            url: url,
            data:postData,
            cache: false,
            success: function (data, textStatus) {
                var gridData = [];
                for (var i = 0; i < data.length; i++) {
                    gridData.push(data[i]);
                }

                var grid = $("#gridMain").dxDataGrid("instance");

                grid.option({
                    dataSource: gridData
                });

                grid.repaint();
                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function GetListWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/GetListWinbox?UserName=" + u + "&FUNCID=" + params.FUNCID;

        $.ajax({
            type: 'GET',
            url: url,
            cache: false,
            success: function (data, textStatus) {
                viewModel.winbox=data;
                viewModel.title(data.FUNCDESC);
                viewModel.funcID(data.FUNCID);
                viewModel.groupID(data.GROUPID);
                viewModel.keyfield(data.KEYFIELD);
                InitView(viewModel, params, data);
                viewModel.indicatorVisible(false);
                ResizeColumns();
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function ResizeColumns() {
        //var grid = $("#gridMain").dxDataGrid("instance");
        //var columns = grid.option("columns");
        //for (var i = 0; i < columns.length; ++) {
        //    var col = columns[i].id;
        //    var width = 
        //}

    }

    function AddFavorite(viewModel)
    {
        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/AddFavorite?UserName=" + u + "&FUNCID=" + viewModel.funcID() + "&GROUPID=" + viewModel.groupID();
        $.ajax({
            type: 'GET',
            url: url,
            cache: false,
            success: function (data, textStatus) {
                DevExpress.ui.notify("添加收藏夹成功", "success", 1000);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }
};