Ext.namespace('HY.UpLoadComponent');

HY.UpLoadComponent = function (config) {
    //config.id = config.id + '';
    //调用基类构造函数 
    HY.UpLoadComponent.superclass.constructor.call(this, config);
}
Ext.extend(HY.UpLoadComponent, Ext.grid.GridPanel, {
    fileType: null,
    temp: [],
    deleteFileIds: [],
    fileCount: 200,
    border: true,
    fileType: null,
    layout: 'fit',
    fileCount: Number.MAX_VALUE, //默认上传不限制个数
    border: false,
    header: false,
    autoScroll: true,
    viewConfig: { forceFit: true },
    emp_NameColIsHidden: true, //上传者列是否隐藏，默认隐藏
    selfDestruction: false, //只能删除自己上传的附件
    initComponent: function () {
        this.init();
        HY.UpLoadComponent.superclass.initComponent.call(this);
    },
    init: function () {
        //保存临时上传文件的数量和文件类型
        var tempCount = this.fileCount;
        var tempType = this.fileType;
        var tempFileIds = this.temp;
        var me = this;
        this.sm = new Ext.grid.CheckboxSelectionModel({
            hidden: (this.readOnly || this.disabled),
            listeners: {
                'beforerowselect': function (sm, rowIndex, keepExisting, record) {
                    if (me.selfDestruction) {
                        var EmpId = (WhiteShell.FormAssembly.businessForm.empInfo.applicantEmpId || WhiteShell.FormAssembly.businessForm.empInfo.empId)
                        if (EmpId != record.get('Emp_ID'))
                            return false;
                    }
                }
            }
        });

        this.cm = new Ext.grid.ColumnModel([
			this.sm,
			{ header: '文件名(FileName)', dataIndex: 'up_FileName', sortable: true,
			    renderer: function (v, c, r) {
			        return "<a href='/DownloadFileHandler.ashx?FileId=" + r.data.up_Id + "' target=\"_blank\">" + v + "</a>";
			    }
			},
			{ header: '上传时间', dataIndex: 'createTime', sortable: true },
			{ header: '文件大小(Size)', dataIndex: 'up_Size', sortable: true },
			{ header: '上传人', dataIndex: 'Emp_Name', sortable: true, hidden: this.emp_NameColIsHidden }
	    ]);
        if (!this.store) {
            this.store = new Ext.data.JsonStore({
                fields: [
                    { name: 'up_Id', smartDSItem: 'up_Id' },
                    { name: 'up_FileName', smartDSItem: 'up_FileName' },
                    { name: 'up_FileURL', smartDSItem: 'up_FileURL' },
                    { name: 'up_Size', smartDSItem: 'up_Size' },
                    { name: 'createTime', smartDSItem: 'createTime' },
                    { name: 'Emp_ID', smartDSItem: 'Emp_ID' },
                    { name: 'Emp_Name', smartDSItem: 'Emp_Name' },
		        ],
                smartDSItem: '/*/UploadInfo'
            });
        }
        if (this.readOnly || this.disabled) {
            return;
        }
        this.tbar = [
			'->',
			{
			    text: '上传(Upload)',
			    iconCls: "addicon",
			    handler: function () {//选择上传时判断上传文件的个数 
			        if (tempCount != 0 && this.store.getCount() >= tempCount) {
			            Ext.MessageBox.alert("错误(Error)", '超出上传文件的个数');
			            return;
			        }
			        this.CreateUploadWin();
			    },
			    scope: this
			}, "-", {
			    text: "删除(Delete)",
			    iconCls: "deleteicon",
			    handler: function () {
			        var row = this.getSelectionModel().getSelections();
			        if (row.length <= 0) return;
			        Ext.Msg.confirm("提示信息", "您确定要删除文件吗？", function (btn) {
			            if (btn == "yes") {
			                //删除文件，删除Grid的同时更改数据库中该文件的状态
			                for (var i = 0; i < row.length; i++) {
			                    for (var j = 0; j < tempFileIds.length; j++) {
			                        if (tempFileIds[j] == row[i].data.up_Id)
			                            this.setDeleteFileIds(row[i].data.up_Id);
			                    }
			                    this.store.remove(row[i]);
			                }
			            }
			        }, this);
			    },
			    scope: this
			}
		];
    },
    CreateUploadWin: function () {
        //上传Form
        var userfile = new Ext.form.TextField({
            fieldLabel: '选择文件',
            //id:'userfile',
            name: 'userfile',
            inputType: 'file',
            allowBlank: false,
            blankText: '文件不能为空',
            height: 25,
            anchor: '90%'
        })
        var uploadForm = new Ext.form.FormPanel({
            cls: 'x-panel-mc',
            region: 'center',
            labelWidth: 55,
            //frame:true,
            bodyStyle: 'padding:5px 5px 0',
            border: false,
            fileUpload: true,
            items: userfile
        });
        var win = new Ext.Window({
            title: "上传文件",
            width: 300,
            id: 'upload_win',
            height: 120,
            modal: true,
            border: false,
            iconCls: "picture.png",
            layout: "fit",
            items: uploadForm,
            buttons: [{
                text: '上传',
                type: 'submit',
                handler: function () {
                    if (!uploadForm.form.isValid()) { return; }
                    var tempfileName = userfile.getValue().replace("'", " ");
                    var suffixal = tempfileName.substring(tempfileName.lastIndexOf(".") + 1, tempfileName.length);
                    if (this.tempType && this.tempType.indexOf(suffixal) <= 0)//判断上传文件的类型
                    {
                        Ext.Msg.alert("提示", "上传的格式不正确！");
                        return;
                    }
                    //上传文件开始
                    uploadForm.form.submit({
                        waitMsg: '正在上传......',
                        url: "/UploadFileHandler.ashx",
                        params: { method: 'UploadFiles' },
                        success: function (form, action) {
                            var newRecordData = {
                                up_Id: action.result.fileId,
                                up_FileName: action.result.fileName,
                                up_FileURL: '',
                                createTime: action.result.createTime,
                                up_Size: action.result.fileSize,
                                Emp_ID: action.result.Emp_ID,
                                Emp_Name: action.result.Emp_Name
                            };
                            this.store.loadData([newRecordData], true);
                            win.close();
                        },
                        failure: function (form, action) {
                            form.reset();
                            if (action.failureType == Ext.form.Action.SERVER_INVALID)
                                Ext.MessageBox.alert('警告', action.result.errors.error);
                        },
                        scope: this
                    });
                },
                scope: this
            }, {
                text: '关闭',
                type: 'submit',
                handler: function () {
                    win.close(this);
                }
            }]
        });
        win.show();
    },
    setDeleteFileIds: function (id)//私有方法，设置删除文件的ID
    {
        this.deleteFileIds[this.deleteFileIds.length] = id;
    },
    setFileDatas: function (filedatas)//公开方法给上传控件设初始值，只有在修改时候用
    {
        if (filedatas != null && filedatas != undefined && filedatas.length > 0) {
            for (var i = 0; i < filedatas.length; i++) {
                if (filedatas[i] == undefined || filedatas[i].up_Id == "" || filedatas[i].up_Id.lenght <= 0)
                    return;
                var newRecordData = {
                    up_Id: filedatas[i].up_Id,
                    up_FileName: filedatas[i].up_FileName,
                    up_FileURL: '',
                    up_Size: filedatas[i].up_Size,
                    Emp_ID: filedatas[i].Emp_ID,
                    Emp_Name: filedatas[i].Emp_Name
                };
                this.store.loadData([newRecordData], true);
                this.temp[this.temp.length] = filedatas[i].up_Id;
            }
        }
    },
    getUploadFileNames: function () {
        var fileNames = [];
        var store = this.store;
        for (var i = 0; i < store.data.items.length; i++) {
            fileNames[fileNames.length] = store.data.items[i].data.up_FileName;
        }
        return fileNames;
    },
    getDeleteFileIds: function ()//获取删除是的文件ID数组
    {
        return this.deleteFileIds;
    },
    getUploadFileIds: function () //公开方法，获取上传文件的ID数组，如果为空，就没有上传文件
    {
        var fileIds = [];
        if (this.state == 0) {
            Ext.Msg.alert("提示", "正在上传，请稍候再提交！");
            return null;
        }
        var store = this.store;

        for (var i = 0; i < store.data.items.length; i++) {
            fileIds[fileIds.length] = store.data.items[i].data.up_Id;
        }
        return fileIds;
    }
})

Ext.reg('multipleupload', HY.UpLoadComponent); // 注册到ext组件,便于将upload的grid序列化成xml lyf


//后续扩展。。。
Ext.override(HY.UpLoadComponent, {
    CreateUploadWin: function () {
        //上传Form
        var userfile = new Ext.form.TextField({
            fieldLabel: '选择文件', //upLoadLanguage.getText('SelectFile'),
            //id:'userfile',
            name: 'userfile',
            inputType: 'file',
            allowBlank: false,
            blankText: "文件不能为空", //upLoadLanguage.getText('FileCannotNull'),
            height: 25,
            anchor: '90%'
        })
        var uploadForm = new Ext.form.FormPanel({
            cls: 'x-panel-mc',
            region: 'center',
            labelWidth: 55,
            //frame:true,
            bodyStyle: 'padding:5px 5px 0',
            border: false,
            fileUpload: true,
            items: userfile
        });
        var win = new Ext.Window({
            title: '上传文件', //upLoadLanguage.getText('UploadFile'),
            width: 300,
            id: 'upload_win',
            height: 120,
            modal: true,
            border: false,
            iconCls: "picture.png",
            layout: "fit",
            items: uploadForm,
            buttons: [{
                text: '上传', //upLoadLanguage.getText('Upload'),
                type: 'submit',
                handler: function () {
                    if (!uploadForm.form.isValid()) { return; }
                    var tempfileName = userfile.getValue().replace("'", " ");
                    var suffixal = tempfileName.substring(tempfileName.lastIndexOf(".") + 1, tempfileName.length);
                    if (this.tempType && this.tempType.indexOf(suffixal) <= 0)//判断上传文件的类型
                    {
                        Ext.Msg.alert(upLoadLanguage.getText('Clew'), upLoadLanguage.getText('UploadFormatIsNotCorrect'));
                        return;
                    }
                    //上传文件开始
                    uploadForm.form.submit({
                        waitMsg: '正在上传', //upLoadLanguage.getText('Uploading'),
                        url: "UploadFile.ashx",
                        params: { method: 'UploadFiles' },
                        success: function (form, action) {
                            var newRecordData = {
                                up_Id: action.result.fileId,
                                up_FileName: action.result.fileName,
                                up_FileURL: '',
                                createTime: action.result.createTime,
                                up_Size: action.result.fileSize,
                                Emp_ID: action.result.Emp_ID,
                                Emp_Name: action.result.Emp_Name
                            };
                            this.store.loadData([newRecordData], true);
                            win.close();
                        },
                        failure: function (form, action) {
                            Ext.MessageBox.alert('警告', action.result.error); //upLoadLanguage.getText('Warning')
                        },
                        scope: this
                    });
                },
                scope: this
            }, {
                text: '关闭', //upLoadLanguage.getText('Close'),
                type: 'submit',
                handler: function () {
                    win.close(this);
                }
            }]
        });
        win.show();
    }
})
Ext.reg('upload', HY.UpLoadComponent);
