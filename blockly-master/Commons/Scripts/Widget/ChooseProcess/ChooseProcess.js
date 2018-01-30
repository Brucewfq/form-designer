HY.ChooseProcess = Ext.extend(HY.ChooseResources, {
    constructor: function (config) {
        //载入对语言
        if (config && config.isPermission)
            this.baseParams.orgModel = config.isPermission;
        else
            this.baseParams.orgModel = this.isPermission;
        HY.ChooseProcess.superclass.constructor.call(this, config);
        if (this.id) {
            HY.ChooseWidgetMgr.reg(this);
        }
    },
    title: '流程选择',
    width: 900,
    height: 400,
    primaryKey: 'Id', //主键所有相关数据源之间的关联键值
    LanguageUrl: '', //多语言数据URL
    url: '/OrganizationHandler.ashx', //其他数据URL
    rootCode: '00000000000000000000000000000000', //指定资源父节点
    orgType: 'B96C323FF5E749D78E6B85EB0E7BD8A2',
    isPermission: '1', //1.不使用权限 2.使用权限
    baseParams: { structTypeCode: 'B96C323FF5E749D78E6B85EB0E7BD8A2', showDisableData: false, orgModel: '1' },

    //*******************ResourcesPanel资源面板属性**************************************
    treeTabTitle: '流程查看',
    gridTabTitle: '列表',
    searchTabTitle: '搜索',
    treeRootText: '流程',
    gridRootText: '流程',
    gridSelectedText: '流程',
    treeSearchText: '组织筛选:',
    defaultSelectedTip: ' 请选择流程',
    extensionUrl: '',
    enableCommonDepartment: false,
    fields: [
        { name: 'Release_Date', mapping: 'Date' },
        { name: 'Release_Name', mapping: 'User' },
        { name: 'Release_Process', mapping: 'FullName' },
        'Id', 'IsTest', 'IsCurrent', 'Ver'
	],

    //初始化
    initComponent: function () {
        this.selectedStore = this.initSelectedStore();
        HY.ChooseProcess.superclass.initComponent.apply(this, arguments);
    },
    //渲染和数据源操作
    afterRender: function () {
        HY.ChooseProcess.superclass.afterRender.apply(this, arguments);
    },
    //初始化已选择的资源(right)
    initSelectedRightPanel: function () {
        //资源
        this.selectedRightPanel = new Ext.grid.GridPanel({
            border: false,
            header: false,
            stripeRows: true, //交替
            cm: new Ext.grid.ColumnModel([
				{ header: this.gridSelectedText, dataIndex: 'Release_Process' },
				{ header: '版本', dataIndex: 'Ver' }
			]),
            store: this.selectedStore,
            viewConfig: {
                forceFit: true,
                getRowClass: function (record, rowIndex, rp, ds) { // rp = rowParams
                    var a = rp.body;
                }
            },
            listeners: {
                'rowdblclick': function () {
                    var record = this.selectedRightPanel.getSelectionModel().getSelected();
                    if (record) {
                        this.selectedStore.remove(record);
                    }
                },
                scope: this
            },
            plugins: new HY.RowCloseIcon()
        });
        return this.selectedRightPanel;
    },
    //资源面板初始化
    initResourcesPanel: function () {
        this.resourcesPanel = new HY.ToBeExported({singleSelect: false, hideOperButton: true});
        this.initSelectedStore();
        this.initResourcesPanelEvents();
        return this.resourcesPanel;
    },
    //public添加已选择记录
    addSelectedStore: function (record) {
        var id = record.get(this.primaryKey);
        var index = this.selectedStore.findExact(this.primaryKey, id);
        if (index == -1)
            this.selectedStore.add(record);
    },
    removeAllSelectedStore: function () {
        this.selectedStore.removeAll();
    },
    //public移除已选择记录
    removeSelectedStore: function (record) {
        this.removeSelected(record.get(this.primaryKey));
    },
    //private添加已选择记录
    addSelected: function (recordData) {
        var store = this.selectedStore;
        var id = recordData[this.primaryKey]
        var newRecord = new store.recordType(recordData, id);
        this.addSelectedStore(newRecord);
    },
    //private移除已选择记录
    removeSelected: function (id) {
        var store = this.selectedStore;
        var index = this.selectedStore.findExact(this.primaryKey, id);
        this.selectedStore.removeAt(index);
    },

    initResourcesPanelEvents: function () {
        var selM = this.resourcesPanel.releaseGrid.getSelectionModel();

        selM.on('rowselect', function (e, rowIndex, record) {
            if (!this.suppressEvent) {
                if (record) {
                    if (this.checkModel == 'single') {
                        this.selectedStore.removeAll();
                    }
                    this.addSelectedStore(record);
                }
            }
            this.setSelectedTip(this.selectedStore.getCount());
        }, this);
        selM.on('rowdeselect', function (e, rowIndex, record) {
            if (!this.suppressEvent) {
                if (record) {
                    this.removeSelectedStore(record);
                }
            }
            this.setSelectedTip(this.selectedStore.getCount());
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
                        //                        Ext.each(records, function (record) {
                        //                            this.onAddSelected(record);
                        //                        }, this);
                        this.fireEvent('recordselect', store, records, index); //addrecord
                        this.suppressEvent = false;
                    },
                    'remove': function (store, record, index) {
                        this.suppressEvent = true;
                        //this.onRemoveSelected(record);
                        this.fireEvent('recorddeselect', store, record, index); //removerecode
                        this.suppressEvent = false;
                    },
                    'clear': function (store, records) {
                        this.suppressEvent = true;
                        //                        Ext.each(records, function (record) {
                        //                            this.onRemoveSelected(record);
                        //                        }, this);
                        this.fireEvent('clearselections', store, records); //clearrecord
                        this.suppressEvent = false;
                    },
                    'load': function (store, records, options) {
                        this.suppressEvent = true;
                        this.fireEvent('loadselections', store, records, options); //loadrecord
                        this.suppressEvent = false;
                    },
                    scope: this
                }
            });
        }
        return this.selectedStore;
    }
});
Ext.reg('ChooseProcess', HY.ChooseProcess);
