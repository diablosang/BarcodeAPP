Mobile.Partial_BarInfo = function (params) {
    "use strict";

    var viewModel = {
        barInfo: {},
        countInfo: {},
        formBarInfoOption: {
            colCount: 2,
            colCountByScreen: { lg: 2, md: 2, sm: 2, xs: 2 },
            items: [
                {
                    label: { text: "条码" },
                    dataField: "CODE_BAR",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 2
                },
                {
                    label: { text: "物料" },
                    dataField: "CODE_ITEM",
                    editorType: "dxTextBox",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 2
                },
                {
                    label: { text: "描述" },
                    dataField: "DESC_ITEM",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 2
                },
                {
                    label: { text: "状态" },
                    dataField: "STATUS",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 1
                },
                {
                    label: { text: "库位" },
                    dataField: "CODE_LOC",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 1
                },
                {
                    label: { text: "货架" },
                    dataField: "CODE_SHELF",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 1
                },
                {
                    label: { text: "批次" },
                    dataField: "CODE_LOT",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 1
                },
                {
                    label: { text: "参考" },
                    dataField: "CODE_REF",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 1
                },
                {
                    label: { text: "数量" },
                    dataField: "QTY_STK",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 1
                },
                {
                    label: { text: "单位" },
                    dataField: "UM_STK",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 1
                }
            ]
        },
        formBarInfo2Option: {
            colCount: 2,
            colCountByScreen: { lg: 2, md: 2, sm: 2, xs: 2 },
            items: [
                {
                    label: { text: "当前条码" },
                    dataField: "BAR_CUR",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 1
                },
                {
                    label: { text: "当前数量" },
                    dataField: "QTY_CUR",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 1
                },
                {
                    label: { text: "合计条码" },
                    dataField: "BAR_TOT",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 1
                },
                {
                    label: { text: "合计数量" },
                    dataField: "QTY_TOT",
                    editorOptions: formReadOnlyTextEditor,
                    colSpan: 1
                }
            ]
        },
        viewShown: function (e) {
            var form = $("#formBarInfo").dxForm("instance");
            form.option("formData", this.barInfo);
            var form2 = $("#formBarInfo2").dxForm("instance");
            form2.option("formData", this.countInfo);
        },
        SetBarInfo: function (barInfo,countInfo) {
            this.barInfo = barInfo;
            this.countInfo = countInfo;
            var form = $("#formBarInfo").dxForm("instance");
            form.option("formData", this.barInfo);
            var form2 = $("#formBarInfo2").dxForm("instance");
            form2.option("formData", this.countInfo);
        }
    };

    return viewModel;
};