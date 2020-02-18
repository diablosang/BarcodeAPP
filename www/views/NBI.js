Mobile.NBI = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        inited: false,
        hideFoot: true,
        indicatorVisible: ko.observable(false),
        intevalPool: {},
        crsPool: [],
        loadedCustomJS: [],
        nbifunc: "",
        hideHeader: false,
        viewShown: function (e) {
            if (this.inited == false) {
                this.nbifunc = params.func;
                this.intevalPool = {};
                if (GetDeviceType() == "PC") {
                    Logon();
                }
                else {
                    if (params.crs == "1") {
                        LoadNBICRS();
                    }
                    else {
                        LoadNBIInfo();
                    }
                }
            }
            else {
                BindView();
            }
        },
        viewHidden: function (e) {
            for (var key in this.intevalPool) {
                var intevalID = this.intevalPool[key];
                clearInterval(intevalID);
            }
        },
        btnHideExecute: function (e) {
            $("#layout_header").hide();
            $("#layout-content").css("top", "0");
            this.hideHeader = true;
            BindView();
        }
    };

    function Logon() {
        var sessionStorage = window.sessionStorage;
        if (sessionStorage.baiduchn != null) {
            viewModel.chn(sessionStorage.baiduchn);
        }

        var devicetype = GetDeviceType();
        var u = "ADMIN";
        var postData = {
            UserName: u,
            Password: "sangguowei",
            CHN: "",
            DeviceID: "",
            DeviceType: devicetype,
            Lang: DeviceLang()
        };
        var url = serviceURL + "/Api/Asapment/Logon2";
        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            cache: false,
            success: function (data, textStatus) {
                sessionStorage.removeItem("username");
                sessionStorage.setItem("username", u);
                viewModel.inited = true;
                if (params.crs == "1") {
                    LoadNBICRS();
                }
                else {
                    LoadNBIInfo();
                }

                $(window).resize(function () {
                    BindView();
                });
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function LoadNBIInfo() {
        if (viewModel == null) {
            return;
        }

        var url = serviceURL + "/Api/Asapment/GetNBIInfo";
        var u = sessionStorage.getItem("username");
        var postData = {
            userName: u,
            func: viewModel.nbifunc
        }

        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                viewModel.ITEM = data.ITEM;
                viewModel.ITEMP = data.ITEMP;
                viewModel.title(data.TITLE);
                //document.title = data.TITLE;
                LoadNBIData();
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function LoadNBICRS() {
        if (viewModel == null) {
            return;
        }

        var url = serviceURL + "/Api/Asapment/GetNBICRS";
        var u = sessionStorage.getItem("username");
        var postData = {
            userName: u,
            func: params.func
        }

        viewModel.crsPool = [];

        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                viewModel.crsPool = data;
                StartCRS();
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function LoadNBIData() {
        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/GetNBIData";
        var postData = {
            userName: u,
            func: viewModel.nbifunc,
            group: "GADMIN"
        }
        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                viewModel.NBIDATA = data;
                BindView();

                var items = viewModel.ITEM;
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (item.AUTOUPD > 0 && params.crs != "1") {
                        AutoUpdateData(item.ITEMID, item.AUTOUPD);
                    }
                }
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                ServerError(xmlHttpRequest.responseText);
            }
        });

    }

    function BindView() {
        var items = viewModel.ITEM;
        var gap = 5;
        var cols = parseInt(items[0].SIZE);
        var pageWidth = $(document.body).width();
        var maxHeight = 0;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var h = item.POS_Y + item.SIZE_H - 1;
            if (h > maxHeight) {
                maxHeight = h;
            }
        }

        var header = 38;
        if (viewModel.hideHeader == true) {
            header = 0;
        }

        var pageHeight = $(document.body).height() - header;
        var itemHeight = 0;
        var itemWidth = parseInt((pageWidth - gap) / cols - gap);
        if (cols == 1) {
            itemHeight = parseInt(itemWidth / 16 * 10);
        }
        else {
            itemHeight = parseInt((pageHeight - gap) / maxHeight - gap);
        }

        var divCanvas = $("#divCanvas");
        divCanvas.empty();
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var itemInfo = {
                htmlItem: "<div id='item" + item.ITEMID + "' class='NBI_ITEM' />",
                posX: (itemWidth + gap) * (item.POS_X - 1) + gap,
                posY: (itemHeight + gap) * (item.POS_Y - 1) + gap,
                w: itemWidth * item.SIZE_W + gap * (item.SIZE_W - 1),
                h: itemHeight * item.SIZE_H + gap * (item.SIZE_H - 1)
            };

            item.itemInfo = itemInfo;

            switch (item.ITEMTYPE) {
                case "CHART": {
                    BindChartItem(item, divCanvas);
                    break;
                }
                case "MAP": {
                    BindMapItem(item, divCanvas);
                    break;

                }
                case "GRID": {
                    BindGridItem(item, divCanvas);
                    break;
                }
                case "PIVOT": {
                    BindPivotItem(item, divCanvas);
                    break;
                }
                case "GAUGE": {
                    BindGaugeItem(item, divCanvas);
                    break;
                }
                case "CV": {
                    BindCaptionValueItem(item, divCanvas);
                    break;
                }
                case "JS": {
                    BindCustomJSItem(item, divCanvas);
                    break;
                }
            }
        }
    }

    function BindItem(itemid) {
        var items = viewModel.ITEM;
        var gap = 5;
        var cols = parseInt(items[0].SIZE);

        var pageWidth = $(document.body).width();
        var maxHeight = 0;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var h = item.POS_Y + item.SIZE_H - 1;
            if (h > maxHeight) {
                maxHeight = h;
            }
        }

        var header = 38;
        if (viewModel.hideHeader == true) {
            header = 0;
        }
        var pageHeight = $(document.body).height() - header;
        var itemHeight = 0;
        var itemWidth = parseInt((pageWidth - gap) / cols - gap);
        if (cols == 1) {
            itemHeight = parseInt(itemWidth / 16 * 10);
        }
        else {
            itemHeight = parseInt((pageHeight - gap) / maxHeight - gap);
        }

        var item;
        var divCanvas = $("#divCanvas");
        for (var i = 0; i < items.length; i++) {
            if (items[i].ITEMID == itemid) {
                item = items[i];
                break;
            }
        }

        var itemInfo = {
            htmlItem: "<div id='item" + item.ITEMID + "' class='NBI_ITEM' />",
            posX: (itemWidth + gap) * (item.POS_X - 1) + gap,
            posY: (itemHeight + gap) * (item.POS_Y - 1) + gap,
            w: itemWidth * item.SIZE_W + gap * (item.SIZE_W - 1),
            h: itemHeight * item.SIZE_H + gap * (item.SIZE_H - 1)
        };

        item.itemInfo = itemInfo;

        $("#item" + itemid).remove();

        switch (item.ITEMTYPE) {
            case "CHART": {
                BindChartItem(item, divCanvas);
                break;
            }
            case "MAP": {
                BindMapItem(item, divCanvas);
                break;
            }
            case "GRID": {
                BindGridItem(item, divCanvas);
                break;
            }
            case "PIVOT": {
                BindPivotItem(item, divCanvas);
                break;
            }
            case "GAUGE": {
                BindGaugeItem(item, divCanvas);
                break;
            }
            case "CV": {
                BindCaptionValueItem(item, divCanvas);
                break;
            }
            case "JS": {
                BindCustomJSItem(item, divCanvas);
                break;
            }
        }
    }

    function BindGaugeItem(item, divCanvas) {
        var itemInfo = item.itemInfo;
        var prop = item.SYS_NBIITEMP;
        var option = viewModel.ITEMP[item.ITEMID];
        if (option == null) {
            return;
        }

        option.size = {
            width: itemInfo.w,
            height: itemInfo.h
        };

        var data = viewModel.NBIDATA[item.ITEMID];
        if (data.length > 0) {
            option.value = data[0][option.valueField];
        }



        var desField = DeviceLang() == "CHS" ? "DES1" : "DES2";
        if (option.title == null) {
            option.title = { text: item[desField] };
        }
        else {
            if (option.title.text == null || option.title.text == "") {
                option.title.text = item[desField];
            }
        }

        if (option.maxValueField != null && option.maxValueField != "") {
            if (data.length > 0) {
                option.scale.endValue = data[0][option.maxValueField];
            }
        }


        switch (option.gaugeType) {
            case "circular": {
                $(itemInfo.htmlItem).appendTo(divCanvas).dxCircularGauge(option);
                break;
            }
            case "bar": {
                $(itemInfo.htmlItem).appendTo(divCanvas).dxBarGauge(option);
                break;
            }
            case "linear": {
                $(itemInfo.htmlItem).appendTo(divCanvas).dxLinearGauge(option);
                break;
            }
            default: {
                $(itemInfo.htmlItem).appendTo(divCanvas).dxCircularGauge(option);
                break;
            }
        }

        var divItem = $("#item" + item.ITEMID);
        divItem.css("top", itemInfo.posY).css("left", itemInfo.posX).css("width", itemInfo.w).css("height", itemInfo.h);
    }

    function BindPivotItem(item, divCanvas) {
        var itemInfo = item.itemInfo;
        var prop = item.SYS_NBIITEMP;
        var option = viewModel.ITEMP[item.ITEMID];
        if (option == null) {
            return;
        }
        option.dataSource.store = viewModel.NBIDATA[item.ITEMID];

        $(itemInfo.htmlItem).appendTo(divCanvas).dxPivotGrid(option);
        var divItem = $("#item" + item.ITEMID);
        divItem.css("top", itemInfo.posY).css("left", itemInfo.posX).css("width", itemInfo.w).css("height", itemInfo.h);
    }

    function BindChartItem(item, divCanvas) {
        var itemInfo = item.itemInfo;
        var prop = item.SYS_NBIITEMP;
        var option = viewModel.ITEMP[item.ITEMID];
        if (option == null) {
            return;
        }

        option.size = {
            width: itemInfo.w,
            height: itemInfo.h
        };

        var desField = DeviceLang() == "CHS" ? "DES1" : "DES2";
        if (option.title == null) {
            option.title = { text: item[desField] };
        }
        else {
            if (option.title.text == null || option.title.text == "") {
                option.title.text = item[desField];
            }
        }

        option.dataSource = viewModel.NBIDATA[item.ITEMID];
        option.tooltip.zIndex = 99;

        option.onLegendClick = function (e) {
            if (option.chartType == "pie") {
                var arg = e.target;
                var item = this.getAllSeries()[0].getPointsByArg(arg)[0];
                if (item.isVisible()) {
                    item.hide();
                } else {
                    item.show();
                }
            }
            else {
                var series = e.target;
                if (series.isVisible() == true) {
                    series.hide();
                }
                else {
                    series.show();
                }
            }

        };


        if (option.CUSTOMJS != null) {
            var src = serviceURL + "/CustomJS/" + option.CUSTOMJS;
            if (viewModel.loadedCustomJS.indexOf(src) >= 0) {
                continueBindChart(option, item, divCanvas);
            }
            else {
                var d = new Date();
                $.getScript(src + "?ver=" + d.getTime().toString(), function () {   //加载test.js,成功后，并执行回调函数  
                    viewModel.loadedCustomJS.push(src);
                    continueBindChart(option, item, divCanvas);
                });
            }

            return;
        }


        if (option.chartType == "pie") {
            $(itemInfo.htmlItem).appendTo(divCanvas).dxPieChart(option);
        }

        else {
            $(itemInfo.htmlItem).appendTo(divCanvas).dxChart(option);
        }

        var divItem = $("#item" + item.ITEMID);
        divItem.css("top", itemInfo.posY).css("left", itemInfo.posX).css("width", itemInfo.w).css("height", itemInfo.h);

        if (option.commonPaneSettings != null) {
            var bgColor = option.commonPaneSettings.backgroundColor;
            if (bgColor != null) {
                divItem.css("background-color", bgColor);
            }
        }
    }

    function continueBindChart(option, item, divCanvas) {
        var itemInfo = item.itemInfo;

        if (option.argumentAxis.label.CUSTOMTEXT != null) {
            option.argumentAxis.label.customizeText = function (e) {
                var objectName = "CustomJSObject_" + option.argumentAxis.label.CUSTOMTEXT;
                var object = eval(objectName);
                return object.Run(e);
            };
        }

        if (option.CUSTOMPOINT != null) {
            option.customizePoint = function (e) {
                var objectName = "CustomJSObject_" + option.CUSTOMPOINT;
                var object = eval(objectName);
                return object.Run(e);
            };
        }

        if (option.chartType == "pie") {
            $(itemInfo.htmlItem).appendTo(divCanvas).dxPieChart(option);
        }

        else {
            $(itemInfo.htmlItem).appendTo(divCanvas).dxChart(option);
        }

        var divItem = $("#item" + item.ITEMID);
        divItem.css("top", itemInfo.posY).css("left", itemInfo.posX).css("width", itemInfo.w).css("height", itemInfo.h);
    }

    function BindGridItem(item, divCanvas) {
        var itemInfo = item.itemInfo;
        var prop = item.SYS_NBIITEMP;
        var option = viewModel.ITEMP[item.ITEMID];
        if (option == null) {
            return;
        }
        option.dataSource = viewModel.NBIDATA[item.ITEMID];

        if (option.columns != null) {
            for (var i = 0; i < option.columns.length; i++) {
                var col = option.columns[i];
                if (col.TEMPLATE != null && col.TEMPLATE != "") {
                    switch (col.TEMPLATE) {
                        case "progress": col.cellTemplate = cellTemplateProgress; break;
                    }
                }
            }
        }


        $(itemInfo.htmlItem).appendTo(divCanvas);
        var divItem = $("#item" + item.ITEMID);
        divItem.css("top", itemInfo.posY).css("left", itemInfo.posX).css("width", itemInfo.w).css("height", itemInfo.h);

        var titleHtml = "<div id='" + "title" + item.ITEMID + "'>";
        $(titleHtml).appendTo(divItem);
        var divTitle = $("#title" + item.ITEMID);
        divTitle.css("text-align", "center").css("width", "100%").css("font-size", "28px");
        divTitle.text(item.DES1);
        $("<div>").appendTo(divItem).dxDataGrid(option);


        //$(itemInfo.htmlItem).appendTo(divCanvas).dxDataGrid(option);
        //var divItem = $("#item" + item.ITEMID);
        //divItem.css("top", itemInfo.posY).css("left", itemInfo.posX).css("width", itemInfo.w).css("height", itemInfo.h);
    }

    function BindMapItem(item, divCanvas) {
        var itemData = [
            { lng: 121.477551, lat: 31.255583 },
            { lng: 121.548265, lat: 31.254101 },
            { lng: 121.431557, lat: 31.203707 }
        ];

        var itemInfo = item.itemInfo;

        $(itemInfo.htmlItem).appendTo(divCanvas);
        var divItem = $("#item" + item.ITEMID);
        divItem.css("top", itemInfo.posY).css("left", itemInfo.posX).css("width", itemInfo.w).css("height", itemInfo.h);
        $("<div id='baiduMap' />").appendTo(divItem);
        var baidu = $("#baiduMap");
        baidu.css("width", itemInfo.w).css("height", itemInfo.h);
        var map = new BMap.Map("baiduMap", {
            enableMapClick: false
        });    // 创建Map实例

        var geo = new BMap.Geocoder();
        var point = geo.getPoint("上海市", function (point) {
            map.centerAndZoom(point, 12);
        }, "");

        map.enableScrollWheelZoom(true); // 开启鼠标滚轮缩放
        var mapStyle = { style: "midnight" }
        map.setMapStyle(mapStyle);

        for (var i = 0; i < itemData.length; i++) {
            var marker = new BMap.Marker(new BMap.Point(itemData[i].lng, itemData[i].lat));
            map.addOverlay(marker);
        }
    }

    function BindCaptionValueItem(item, divCanvas) {
        var itemInfo = item.itemInfo;
        var prop = item.SYS_NBIITEMP;
        var option = viewModel.ITEMP[item.ITEMID];
        if (option == null) {
            return;
        }
        option.dataSource = viewModel.NBIDATA[item.ITEMID];

        $(itemInfo.htmlItem).appendTo(divCanvas);
        var divItem = $("#item" + item.ITEMID);
        divItem.css("top", itemInfo.posY).css("left", itemInfo.posX).css("width", itemInfo.w).css("height", itemInfo.h);

        $("<table>").attr("id", "tb" + item.ITEMID).appendTo(divItem);
        var divTB = $("#tb" + item.ITEMID);
        divTB.css("width", "100%");

        $("<tr>").attr("id", "tr" + item.ITEMID).appendTo(divTB);
        var divTR = $("#tr" + item.ITEMID);
        divTR.css("height", itemInfo.h);

        if (option.style != null) {
            for (var key in option.style) {
                divTB.css(key, option.style[key]);
            }
        }

        if (option.captionElement != null) {
            $("<td>").attr("id", "tdCaption" + item.ITEMID).attr('align', 'center').attr('valign', 'middle').appendTo(divTR);
            var divTD = $("#tdCaption" + item.ITEMID);
            if (option.valueElement != null) {
                divTD.css("width", "50%");
            }
            else {
                divTD.css("width", "100%");
            }
            //var captionHtml = "<div id='caption" + item.ITEMID + "'>";
            //$(captionHtml).appendTo(divTD);
            //var divCaption = $("#caption" + item.ITEMID);
            divTD.html(option.captionElement.text);
            if (option.captionElement.style != null) {
                for (var key in option.captionElement.style) {
                    divTD.css(key, option.captionElement.style[key]);
                }
            }
        }

        if (option.valueElement != null) {
            $("<td>").attr("id", "tdValue" + item.ITEMID).attr('align', 'center').attr('valign', 'middle').appendTo(divTR);
            var divTD = $("#tdValue" + item.ITEMID);
            if (option.captionElement != null) {
                divTD.css("width", "50%");
            }
            else {
                divTD.css("width", "100%");
            }
            //var valueHtml = "<div id='value" + item.ITEMID + "'>";
            //$(valueHtml).appendTo(divItem);
            //var divValue = $("#value" + item.ITEMID);
            var val = "";
            var data = viewModel.NBIDATA[item.ITEMID];
            if (data != null && data.length > 0) {
                val = viewModel.NBIDATA[item.ITEMID][0][option.valueElement.valueField];
            }

            divTD.text(val);
            if (option.valueElement.style != null) {
                for (var key in option.valueElement.style) {
                    divTD.css(key, option.valueElement.style[key]);
                }
            }
        }
    }

    function BindCustomJSItem(item, divCanvas) {
        var option = viewModel.ITEMP[item.ITEMID];
        var d = new Date();
        var src = serviceURL + "/CustomJS/" + option.src + "?ver=" + d.getTime().toString();

        $.getScript(src, function () {   //加载test.js,成功后，并执行回调函数  
            var object = "CustomJSObject_" + option.object + ".Create(viewModel,item, divCanvas)";
            eval(object)
        });
    }

    function AutoUpdateData(item, inteval) {
        var intevalID = viewModel.intevalPool[item];
        if (intevalID != null) {
            clearInterval(intevalID);
            viewModel.intevalPool[item] = null;
        }

        if (inteval > 0) {
            viewModel.intevalPool[item] = setInterval(function () {
                BindItemData(item);
            }, inteval * 1000);
        }
    }

    function BindItemData(itemid) {
        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/GetNBIItemData";
        var postData = {
            userName: u,
            func: params.func,
            group: "GADMIN",
            item: itemid
        };

        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            cache: false,
            success: function (data, textStatus) {
                viewModel.NBIDATA[itemid] = data;
                BindItem(itemid);
                if (debugMode) {
                    var debugMsg = itemid + "  " + data.length.toString() + "  " + new Date(+new Date() + 8 * 3600 * 1000).toISOString();
                    console.log(debugMsg);
                }

            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                ServerError(itemid+": "+xmlHttpRequest.responseText);
            }
        });
    }

    function StartCRS() {
        for (var key in viewModel.intevalPool) {
            var intevalID = viewModel.intevalPool[key];
            delete viewModel.intevalPool[key];
            clearInterval(intevalID);
        }

        var crs = viewModel.crsPool.shift();
        viewModel.nbifunc = crs.FUNCID;
        LoadNBIInfo();
        viewModel.crsPool.push(crs);
        setTimeout(StartCRS, crs.DSPTIME * 1000);
    }

    var cellTemplateProgress = function (container, options) {
        $("<div/>").dxBullet({
            target: 100,
            value: options.value * 100,
            size: {
                width: "100%"
            },
            tooltip: {
                enabled: true,
                font: {
                    size: 18
                },
                paddingTopBottom: 2,
                customizeTooltip: function () {
                    return { text: (options.value * 100).toString() + "%" };
                },
                zIndex: 99
            }
        }).appendTo(container);
    };

    return viewModel;
};

