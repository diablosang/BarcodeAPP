Mobile.BIView = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        menuVisible: ko.observable(false),
        viewShown: function (e) {
            GetBIViewName(this, params);
        },
        tabOption: {
            onItemClick: function (e) {
                var vid = e.itemData.VID;
                GetViewData(this, params, vid);
            }
        }
    };

    return viewModel;

    function GetBIViewName(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/GetBIViewName?UserName=" + u + "&FUNCID=" + params.FUNCID;

        $.ajax({
            type: 'GET',
            url: url,
            cache: false,
            success: function (data, textStatus) {
                var items = [];
                for (var i = 0; i < data.views.length; i++) {
                    var item = {
                        VID: data[i].VID,
                        text:data[i].DES
                    }

                    items.push(item);
                }

                var tab = $("#tabView").dxTabs("instance");
                tab.option({
                    dataSource: items,
                    selectedIndex:0
                });

                var vid = data.views[0].VID;
                viewModel.title(data.func, vid);
                GetViewData(params, data);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                DevExpress.ui.notify(errorThrown, "error", 1000);
            }
        });
    }

    function GetViewData(viewModel, params,vid) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/GetViewData?UserName=" + u + "&FUNCID=" + params.FUNCID + "&GROUPID=" + params.GROUPID+"&VID="+vid;

        $.ajax({
            type: 'GET',
            url: url,
            cache: false,
            success: function (data, textStatus) {
                BindView(viewModel, params, data);
                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                DevExpress.ui.notify(errorThrown, "error", 1000);
                viewModel.indicatorVisible(false);
            }
        });
    }

    function BindView(viewModel, params, data) {
        var $divView = $("#divView");
        $divView.empty();

        for (var i = 0; i < data.length; i++){
            switch (data[i].CPTYPE)
            {
                case "GRID": BindGrid(viewModel, params, data[i]); break;
                default: BindChart(viewModel, params, data[i]); break;
            }
        }
    }

    function BindGrid(viewModel, params, cpData)
    {
        var $divView = $("#divView");
        var $cp = $("<div>").attr("id", "cp" + cpData.CPID).appendTo($divView);

        var gridOption = {
            dataSource: cpData.data,
            columns: cpData.cols,
            columnAutoWidth: true,
            paging: {
                enabled: false
            }
        }
        //var grid = $("<div>").attr("id", "grid" + cpData.CPID).appendTo($cp).dxDataGrid({ gridOption });
    }

    function BindChart(viewModel, params, cpData)
    {
        var charttype = "";
        switch (cpData.CPTYPE)
        {
            case "CHART_BAR": charttype = "bar"; break;
            case "CHART_LINE": charttype = "line"; break;
            case "CHART_PIE": charttype = "pie"; break;
        }

        var $divView = $("#divView");
        var $cp = $("<div>").attr("id", "cp" + cpData.CPID).appendTo($divView);
        $("<div>").attr("id", "chart" + cpData.CPID).appendTo($cp).dxChart({});
        var chart = $("#chart" + cpData.CPID).dxChart("instance");
        var series = [];

        for (var i = 0; i < cpData.Series; i++)
        {
            var serie = {
                name:cpData.Name,
                argumentField: cpData.ArgumentField,
                valueField: cpData.ValueField,
                type: cpData.ChartType,
            }

            series.push(serie);
        }
        var chartOption = {
            "export": {
                enabled: true
            },
            series: series,
            dataSource:cpData.Data
        }
    }
};