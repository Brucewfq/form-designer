Ext.namespace('HY.ChooseCity');
HY.ChooseCity = function(config){
    //触发全局事件，已选记录store发生变更时
	this.addEvents('selectcomplete');
	//载入对语言
	//config.language = new language20('GetLanguageResources',this.LanguageResourcesUrl);
	
	//窗口标题
	//config.title = config.language ? config.language.title : '资源选择';
	
	HY.ChooseCity.superclass.constructor.call(this,config);
	if(this.id){
		HY.ChooseWidgetMgr.reg(this);
	}
};
Ext.extend(HY.ChooseCity, Ext.Window, {
    title: '城市选择',
    LanguageUrl: '', //多语言数据URL
    url: '/ResourcesPanelHandler.ashx', //其他数据URL
    extensionUrl: '', //提交请求的扩展URL
    width: 350,
    height: 350,
    minWidth: 350,
    minHeight: 350,
    closeAction: 'hide',
    customizeType: 1,
    orgType: 'B96C323FF5E749D78E6B85EB0E7BD8A2',
    isMain: true,
    plain: true,
    hideMode: 'offsets',
    border: false,
    buttonAlign: 'center',
    modal: true,
    hideSelected: false, //隐藏已选资源区
    enableGridPanel: true, //是否显示城市筛选面板
    enableAddPanel: true, //是否显示新增城市面板
    defaultCity: true, //默认选择城市
    gridPageSize: 10,
    suppressEvent: false, //事件压制
    orgCityEvent: false,
    commonCityEvent: false,
    primaryKey: 'Res_Id', //主键所有相关数据源之间的关联键值
    checkModel: 'multiple', //'multiple':多选; 'single':单选;
    fields: [
		{ name: "Res_Id" },
		{ name: "Name" },
		{ name: "CNName" },
		{ name: "ENName" },
		{ name: "ParentCode", mapping: 'Res_Parent_Code' },
		{ name: "ParentName", mapping: 'Parent_Name' },
		{ name: "Initials", mapping: 'Res_Data' },
		{ name: "Level", mapping: 'Res_Data1' },
		{ name: 'childslength', type: 'int' },
		{ name: 'Res_CodeData2' }
	],
    comboFields: [
		"Code", "Name"
	],
    buttons: [{
        text: '确定',
        ref: '../btnOkCtiy',
        handler: function () {
            var win = this.ownerCt.ownerCt;
            if (win.selectedStore.data.length > 0) {
                win.onOkClicked();
            } else {
                win.onCancelClicked();
            }
        }
    }, {
        text: '添加',
        ref: '../btnAddCtiy',
        handler: function () {
            var win = this.ownerCt.ownerCt;
            win.addCity();
        }
    }, {
        text: '取消',
        ref: '../btnCancelCtiy',
        handler: function () {
            var win = this.ownerCt.ownerCt;
            win.onCancelClicked();
        }
    }],
    mask: function (msg) {
        if (this.el)
            this.el.mask(msg || '载入已选资源数据...', 'x-mask-loading');
        //如果只想遮罩window body区域时
        //this.tbar.mask()
        //this.body.mask()
        //this.bbar.mask()
    },
    unmask: function () {
        if (this.el)
            this.el.unmask();
        //如果只想遮罩window body区域时
        //this.tbar.unmask()
        //this.body.unmask()
        //this.bbar.unmask()
    },
    onOkClicked: function () {
        if (this.isColor) {
            Ext.Msg.alert('提示', '请选择正确的记录数！');
            return
        }
        this.onOk();
    },
    onOk: function () {
        this.hide();
        this.fireEvent('selectcomplete', this.returnRecords());
    },
    //返回选中的records
    returnRecords: function () {
        var records = this.selectedStore.getRange();
        return records;
    },
    onCancelClicked: function () {
        this.onCancel();
        this.unmask();
    },
    onCancel: function () {
        this.hide();
    },
    open: function (records) {

        this.onOpen();
        //		this.mask();
        this.importRecords(records);
        //		this.unmask();
    },
    openClear: function (records) {
        this.onOpenClear();
        //		this.mask();

        this.selectedStore.removeAll();
        this.importRecords(records);
        if (this.enableAddPanel)
            this.addPanel.form.reset();
        //		this.unmask();
    },
    onOpen: function () {
        this.show();
    },
    onOpenClear: function () {
        this.show();
    },
    importRecords: function (records) {
        if (records) {
            Ext.each(records, function (record) {
                this.initSelectedStore();
                this.addSelectedStore(record);
            }, this);
        }
    },
    listeners: { "hide": function (e) {
        this.saveCommonCities();

    }
    },
    //保存常用城市
    saveCommonCities: function () {
        var Ids = "";
        this.commonCityStore.each(function (record, rowIndex) {
            Ids += record.get(this.primaryKey) + ",";
        }, this);
        if (Ids != "")
            Ids = Ids.substring(0, Ids.length - 1);
        Ext.Ajax.request({
            url: this.url,
            params: { method: "SaveCitiesCommonById", Ids: Ids },
            method: "POST",
            success: function () {
                //            App.setAlert('系统提示', '常用人员保存成功!');
            },
            failure: function () {
                App.setAlert('系统提示', '操作失败!');
            }
        }, this);
    },
    //初始化选中store
    initSelectedStore: function () {
        if (!this.selectedStore) {
            //创建已选STORE,将事件绑定到全局事件中
            this.selectedStore = new Ext.data.JsonStore({
                root: this.storeRoot,
                fields: this.fields,
                listeners: {
                    'add': function (store, records, index) {
                        this.suppressEvent = true;
                        Ext.each(records, function (record) {
                            this.onAddSelected(record);
                            if (!this.hideSelected && this.checkModel == 'multiple')
                                this.addTopItem(record);
                        }, this);
                        this.suppressEvent = false;
                    },
                    'remove': function (store, record, index) {
                        this.suppressEvent = true;
                        this.onRemoveSelected(record);
                        if (!this.hideSelected && this.checkModel == 'multiple')
                            this.removeTopItem(record);
                        this.suppressEvent = false;
                    },
                    'clear': function (store, records) {
                        this.suppressEvent = true;
                        Ext.each(records, function (record) {
                            this.onRemoveSelected(record);
                            if (!this.hideSelected && this.checkModel == 'multiple')
                                this.removeTopItem(record);
                        }, this);
                        this.suppressEvent = false;
                    },
                    'load': function (store, records, options) {
                        this.suppressEvent = true;
                        this.suppressEvent = false;
                    },
                    scope: this
                }
            });
        }
        return this.selectedStore;
    },
    //初始化已选择的城市(top)
    initSelectedTopPanel: function () {
        this.topPanel = new Ext.Panel({
            layout: 'column',
            height: 45,
            autoScroll: true,
            items: [],
            //			border:false,
            //			autoWidth:true,
            bodyStyle: "padding:3px"
        });
        return this.topPanel;
    },
    init: function () {
        var mainPanel = {
            xtype: 'panel',
            layout: 'fit',
            tbar: (!this.hideSelected && this.checkModel == 'single') ? false : this.initSelectedTopPanel(),
            hideBorders: true,
            items: this.initResTabPanel()
        };
        return mainPanel;
    },
    //初始化
    initComponent: function () {
        var mainPanel = this.init();
        Ext.apply(this, mainPanel);
        Ext.apply(this.initialConfig, mainPanel);
        HY.ChooseCity.superclass.initComponent.apply(this, arguments);
    },
    afterRender: function () {
        HY.ChooseCity.superclass.afterRender.apply(this, arguments);
        //		this.gridStore.load({params:{start:0,limit:this.gridPageSize}});
        if (this.enableAddPanel)
            this.comboStore.load();
        this.initSelectedStore();
        this.App = new Ext.App({});
    },
    //初始化选项卡面板
    initResTabPanel: function () {
        this.resTabPanel = new Ext.TabPanel({
            activeTab: 0,
            border: false,
            enableTabScroll: true,
            layoutOnTabChange: true,
            items: [
			    { title: '城市列表', layout: 'fit', items: this.initGridPanel() }
			],
            listeners: {
                'tabchange': function (a, b) {
                    if (b.title == '城市列表') {
                        this.btnAddCtiy.hide();
                        this.btnOkCtiy.show();
                        if (!this.gridStore.getCount())
                            this.gridStore.load({ params: { start: 0, limit: this.gridPageSize} });
                    } else if (b.title == '常用城市') {
                        this.btnAddCtiy.hide();
                        this.btnOkCtiy.show();
                    } else {
                        this.btnOkCtiy.hide();
                        this.btnAddCtiy.show();
                    }
                },
                scope: this
            }
        });
        if (this.defaultCity) {
            this.resTabPanel.add({ title: '常用城市', layout: 'fit', items: this.initDefaultPanel() });
        }
        if (this.enableAddPanel) {
            this.resTabPanel.add({ title: '新增', layout: 'fit', items: this.initAddPanel() });
        }
        return this.resTabPanel;
    },

    initDefaultPanel: function () {
        this.commonCityStore = new Ext.data.JsonStore({
            proxy: new Ext.data.HttpProxy({
                url: this.url,
                method: "POST"
            }),
            baseParams: { method: "GetCommonCity", customizeType: this.customizeType, isMain: this.isMain, orgType: this.orgType },
            root: 'Table',
            autoLoad: true,
            fields: this.fields
        });
        this.commonCityStore.on('load', function (myStore, records, op) {
            if (records.length > 0)
                this.resTabPanel.setActiveTab(1);
            else
                this.resTabPanel.setActiveTab(0);
        }, this);
        this.defaultSm = new Ext.grid.CheckboxSelectionModel({ checkOnly: true, singleSelect: this.checkModel == 'multiple' ? false : true });
        var colModel = new Ext.grid.ColumnModel([
		    this.defaultSm,
        //		    {header:'首字母',dataIndex:'Initials',width:70,sortable:true},
		    {header: '城市名称', dataIndex: 'Name', width: 60, sortable: true },
        //		    {header:'英文名称',dataIndex:'ENName',width:60,sortable:true},
		    {header: '级别', dataIndex: 'Level', width: 40, sortable: true, renderer: function (v) { return Ext.util.Format.substr(v, 0, 2); } }
		]);
        this.defaultPanel = new Ext.grid.GridPanel({
            store: this.commonCityStore,
            selModel: this.defaultSm,
            colModel: colModel,
            border: false,
            stripeRows: true, //交替
            plugins: new HY.RowCloseIcon(),
            viewConfig: { forceFit: true}//自动间距
        });
        //选中
        this.defaultSm.on('rowselect', function (e, rowIndex, record) {
            if (!this.suppressEvent) {
                if (this.defaultPanel.loading !== true) {
                    if (record) {
                        this.commonCityEvent = true;
                        if (this.checkModel == 'single') {
                            this.selectedStore.removeAll();
                        }
                        this.addSelectedStore(record);
                        this.commonCityEvent = false;
                    }
                }
            }
        }, this);
        //反选
        this.defaultSm.on('rowdeselect', function (e, rowIndex, record) {
            if (!this.suppressEvent) {
                if (this.defaultPanel.loading !== true) {
                    if (record) {
                        this.commonCityEvent = true;
                        this.removeSelectedStore(record);
                        this.commonCityEvent = false;
                    }
                }
            }
        }, this);
        return this.defaultPanel;
    },
    //初始化列表store
    initGridStore: function () {
        this.gridStore = new Ext.data.GroupingStore({
            proxy: new Ext.data.HttpProxy({
                url: this.url,
                method: "POST"
            }),
            //			autoLoad:{params:{start:0,limit:this.gridPageSize}},
            baseParams: Ext.applyIf({ method: "GetResourceCity" }, this.baseParams),
            sortInfo: { field: 'Res_Id', direction: "ASC" }, //一个group中的排序方式
            groupField: 'Initials',
            reader: new Ext.data.XmlReader({
                record: 'Table',
                totalProperty: 'result'
            },
			this.fields
			)
        });
        this.gridStore.on('load', function (Store, records, options) {
            this.initSelectedStore();
            this.chechedSelectedCities();
            //this.resTabPanel.setActiveTab(0);
        }, this);
        return this.gridStore;
    },
    //初始化列表面板
    initGridPanel: function () {
        this.gridSm = new Ext.grid.CheckboxSelectionModel({ checkOnly: true, singleSelect: this.checkModel == 'multiple' ? false : true });
        var self = this;
        var colModel = new Ext.grid.ColumnModel([
		    this.gridSm,
		    { header: '首字母', dataIndex: 'Initials', width: 70, sortable: true },
		    { header: '城市名称', dataIndex: 'Name', width: 60, sortable: true },
		    { header: '英文名称', dataIndex: 'ENName', width: 60, sortable: true },
		    { header: '级别', dataIndex: 'Level', width: 40, sortable: true, renderer: function (v) { return Ext.util.Format.substr(v, 0, 2); } },
		    { header: '&#160;', resizable: false, width: 13, hideable: false, menuDisabled: true, renderer: function () {
		        return '<div class="x-grid3-row-adddefaultemp mygrid-toLeft" style="visibility:hidden;"></div>';
		    }
		    }
		]);

        this.pathTextfield = new Ext.form.TextField({
            emptyText: '城市名称',
            width: '120',
            style: 'margin-right:5px',
            enableKeyEvents: true,
            listeners: { "keyup": function (extField, e) {
                if (e.keyCode == "13") {
                    this.gridStore.baseParams.SearchName = extField.getValue();
                    this.gridStore.load({ params: { start: 0, limit: this.gridPageSize} });
                }
            }
			    , scope: this
            }
        });
        this.gridPanel = new Ext.grid.GridPanel({
            store: this.initGridStore(),
            selModel: this.gridSm,
            colModel: colModel,
            border: false,
            stripeRows: true, //交替
            loadMask: true, //遮罩
            viewConfig: { forceFit: true }, //自动间距
            tbar: [
			'城市筛选: ', this.pathTextfield
			],
            view: new Ext.grid.GroupingView({
                forceFit: true,
                showGroupName: false,
                enableNoGroups: false, // REQUIRED!
                hideGroupedColumn: true //是否隐藏分组字段
            }),
            bbar: new Ext.PagingToolbar({
                pageSize: this.gridPageSize,
                store: this.gridStore,
                displayInfo: true,
                emptyMsg: "没有记录",
                prevText: '上一页',
                nextText: '下一页',
                refreshText: '刷新',
                firstText: '第一页',
                lastText: '最后一页',
                beforePageText: '',
                afterPageText: '/ {0}',
                displayMsg: '一共{2}条'
            })
        });

        this.gridPanel.on('render', function () {
            var mainBody = this.gridPanel.getView().mainBody;
            mainBody.on('mousedown', function (e, t) {
                if (e.button === 0 && t.className.indexOf('x-grid3-row-adddefaultemp') >= 0) { // Only fire if left-click
                    e.stopEvent();
                    var row = e.getTarget('.x-grid3-row');
                    if (row) {
                        var index = row.rowIndex;
                        var record = this.gridPanel.getStore().getAt(index);
                        var id = record.get(this.primaryKey);
                        var commindex = this.commonCityStore.findExact(this.primaryKey, id);
                        if (commindex == -1) {
                            this.commonCityStore.add(record);
                            var selectedIndex = this.selectedStore.findExact(this.primaryKey, id);
                            if (selectedIndex != -1)
                                this.defaultSm.selectRow(this.commonCityStore.getCount() - 1, true);
                            App.setAlert('系统提示', '已加入常用列表!');
                        } else {
                            App.setAlert('系统提示', '常用列表中已有该城市!');
                        }
                    }
                }
            }, this);
            mainBody.on('mouseover', function (e, t) {
                var row;
                if ((row = this.gridPanel.getView().findRowIndex(t)) !== false) {
                    var rowDom = this.gridPanel.getView().getRow(row);
                    Ext.fly(rowDom).child('.mygrid-toLeft').show();
                }
            }, this);
            mainBody.on('mouseout', function (e, t) {
                var row;
                if ((row = this.gridPanel.getView().findRowIndex(t)) !== false) {
                    var rowDom = this.gridPanel.getView().getRow(row);
                    Ext.fly(rowDom).child('.mygrid-toLeft').hide();
                }
            }, this);
        }, this);
        //选中
        this.gridSm.on('rowselect', function (e, rowIndex, record) {
            if (!this.suppressEvent) {//orgCityEvent
                if (this.gridPanel.loading !== true) {
                    if (record) {
                        this.orgCityEvent = true;
                        if (this.checkModel == 'single') {
                            this.selectedStore.removeAll();
                        }
                        this.addSelectedStore(record);
                        this.orgCityEvent = false;
                    }
                }
            }
        }, this);
        //反选
        this.gridSm.on('rowdeselect', function (e, rowIndex, record) {
            if (!this.suppressEvent) {//orgCityEvent 原来为这个错误的
                if (this.gridPanel.loading !== true) {
                    if (record) {
                        this.orgCityEvent = true;
                        this.removeSelectedStore(record);
                        this.orgCityEvent = false;
                    }
                }
            }
        }, this);

        return this.gridPanel;
    },
    initAddPanel: function () {
        this.addPanel = new Ext.form.FormPanel({
            layout: 'form',
            border: false,
            labelWidth: 100,
            labelAlign: 'right',
            defaultType: "textfield",
            bodyStyle: "padding:10 0 0 0",
            items: [
                { name: 'CityNameCN', fieldLabel: '城市名称(中文)&nbsp', anchor: '95%', allowBlank: false },
                { name: 'CityNameEN', fieldLabel: '城市名称(英文)&nbsp', anchor: '95%', allowBlank: false },
                this.initComboBox(),
                { name: 'Initials', fieldLabel: '首字母(A-Z)&nbsp', anchor: '95%', allowBlank: false },
                { name: 'CityType', fieldLabel: '城市类型&nbsp', anchor: '95%' }

            ]
        });

        return this.addPanel;
    },
    initComboStore: function () {
        if (!this.comboStore) {
            this.comboStore = new Ext.data.JsonStore({
                autoDestroy: true,
                proxy: new Ext.data.HttpProxy({
                    url: this.url,
                    method: "POST"
                }),
                baseParams: Ext.applyIf({ method: "GetComboByParentCode" }, this.baseParams),
                root: 'cityLevel',
                fields: this.comboFields
            });
        }
        return this.comboStore;
    },
    initComboBox: function () {
        this.comboBox = new Ext.form.ComboBox({
            name: 'CityLevel',
            fieldLabel: '城市级别&nbsp',
            emptyText: '请选择',
            anchor: '95%',
            allowBlank: false,
            editable: false,
            displayField: 'Name',
            valueField: 'Code',
            mode: 'local',
            store: this.initComboStore(),
            forceSelection: true,
            triggerAction: 'all'
        });
        return this.comboBox
    },
    addTopItem: function (record) {
        if (this.empCheckModel == 'single') {
            this.topPanel.removeAll();
        }
        var item = new Ext.Panel({
            width: 75,
            height: 22,
            bodyStyle: "line-height:18px;text-align:center;cursor:pointer;",
            id: record.get(this.primaryKey),
            html: '<b>' + record.data.Name + '</b>'
        });
        item.on('render', function () {
            item.el.on('click', function () {
                this.topPanel.remove(record.get(this.primaryKey), true);
                this.selectedStore.remove(record);
            }, this);
            item.el.on('mouseover', function () {
                item.el.addClass("x-personchoose-over");
            });
            item.el.on('mouseout', function () {
                item.el.removeClass("x-personchoose-over");
            });
        }, this);
        this.topPanel.add(item);
        this.topPanel.doLayout();
    },
    removeTopItem: function (record) {
        this.topPanel.remove(record.get(this.primaryKey), true);
    },

    //加载时选中已选项
    chechedSelectedCities: function () {
        this.suppressEvent = true;
        this.selectedStore.each(function (record, rowIndex) {
            var Id = record.get(this.primaryKey);
            var index = -1, index2 = -1;
            this.gridStore.each(function (rd, rowIndex) {
                if (Id == rd.get(this.primaryKey)) {
                    index = rowIndex;
                    return false;
                }
            }, this);
            if (this.gridSm.grid)
                this.gridSm.selectRow(index, true);
            this.commonCityStore.each(function (rd, rowIndex) {
                if (Id == rd.get(this.primaryKey)) {
                    index2 = rowIndex;
                    return false;
                }
            }, this);
            if (this.defaultSm.grid)
                this.defaultSm.selectRow(index2, true);
        }, this);
        this.suppressEvent = false;
    },
    //勾选选中项
    onAddSelected: function (record) {
        var id = record.get(this.primaryKey);
        //在表格中勾选选中项
        //alert(this.orgCityEvent);
        if (!this.orgCityEvent) {
            if (this.gridStore) {
                var index = -1;
                this.gridStore.each(function (rd, rowIndex) {
                    if (id == rd.get(this.primaryKey)) {
                        index = rowIndex;
                        return false;
                    }
                }, this);
                if (this.gridSm.grid)
                    this.gridSm.selectRow(index, true);
            }
        }
        if (!this.commonCityEvent) {
            if (this.commonCityStore) {
                var index = -1;
                this.commonCityStore.each(function (rd, rowIndex) {
                    if (id == rd.get(this.primaryKey)) {
                        index = rowIndex;
                        return false;
                    }
                }, this);
                if (this.defaultSm.grid)
                    this.defaultSm.selectRow(index, true);
            }
        }
    },
    //取消勾选选中项
    onRemoveSelected: function (record) {
        //在表格中取消勾选选中项
        var id = record.get(this.primaryKey);
        if (!this.orgCityEvent) {
            if (this.gridStore) {
                var index = -1;
                this.gridStore.each(function (rd, rowIndex) {
                    if (id == rd.get(this.primaryKey)) {
                        index = rowIndex;
                        return false;
                    }
                }, this);
                if (this.gridSm.grid)
                    this.gridSm.deselectRow(index);
            }
        }
        //在常用表格中取消勾选选中项
        if (!this.commonCityEvent) {
            if (this.commonCityStore) {
                var index = -1;
                this.commonCityStore.each(function (rd, rowIndex) {
                    if (id == rd.get(this.primaryKey)) {
                        index = rowIndex;
                        return false;
                    }
                }, this);
                if (this.defaultSm.grid)
                    this.defaultSm.deselectRow(index);
            }
        }
    },
    //public添加已选择记录
    addSelectedStore: function (record) {
        var id = record.get(this.primaryKey);
        var index = this.selectedStore.findExact(this.primaryKey, id);
        if (index == -1)
            this.selectedStore.add(record);
    },
    //public移除已选择记录
    removeSelectedStore: function (record) {
        this.removeSelected(record.get(this.primaryKey));
    },
    //private移除已选择记录
    removeSelected: function (id) {
        var store = this.selectedStore;
        var index = this.selectedStore.findExact(this.primaryKey, id);
        this.selectedStore.removeAt(index);
    },
    addCity: function () {
        if (this.addPanel.form.isValid()) {
            this.addPanel.form.submit({
                url: this.url,
                method: 'POST',
                params: {
                    method: 'AddResource'
                },
                success: function (form, action) {
                    //成功后
                    var flag = action.result.success;
                    if (flag == "true") {
                        this.App.setAlert('提示', '添加成功!');
                        this.addPanel.form.reset();
                        this.gridStore.load({ params: { start: 0, limit: this.gridPageSize} });
                    }
                },
                failure: function () {
                    this.App.setAlert('提示', '发生异常!');
                },
                scope: this
            });
        }
    }
});
