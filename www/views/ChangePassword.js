Mobile.ChangePassword = function (params) {
    "use strict";

    var viewModel = {
        formOption: {
            formData: { OLDPWD: "", NEWPWD1: "", NEWPWD2:"" },
            items: [
                  {
                      label: { text: "原密码" },
                      dataField: "OLDPWD",
                      editorOptions: {
                          mode: "password"
                      },
                      colSpan: 1
                  },
                  {
                      label: { text: "新密码" },
                      dataField: "NEWPWD1",
                      editorOptions: {
                          mode: "password"
                      },
                      colSpan: 1
                  },
                  {
                      label: { text: "再次输入" },
                      dataField: "NEWPWD2",
                      editorOptions: {
                          mode: "password"
                      },
                      colSpan: 1
                  },
            ]
        },
        toolBarOption: {
            items: [
                { location: 'before', widget: 'button', name: 'submit', options: { icon: 'check', text: '提交' } },
            ],
            onItemClick: function (e) {
                switch (e.itemData.name) {
                    case "submit": {
                        Submit();
                    }
                }
            }
        },
    };

    function Submit() {
        var form = $("#formMain").dxForm("instance");
        var formData = form.option("formData");
        if (formData.NEWPWD1 != formData.NEWPWD2) {
            ServerError(SysMsg.pwdnomatch);
            return;
        }

        var u = sessionStorage.getItem("username");
        var url = serviceURL + "/Api/Asapment/ChangePwd";
        var postData = {
            userName: u,
            oldpwd:formData.OLDPWD,
            newpwd: formData.NEWPWD1
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                DevExpress.ui.notify(SysMsg.pwdchanged, "Success", 2000);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                ServerError(xmlHttpRequest.responseText);
            }
        });

        formData = { OLDPWD: "", NEWPWD1: "", NEWPWD2: "" };
        form.option("formData", formData);
    }

    return viewModel;
};