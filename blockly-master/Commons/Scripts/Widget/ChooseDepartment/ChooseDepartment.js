HY.ChooseDepartment = Ext.extend(HY.ChooseResources, {
    constructor: function (config) {
        //载入对语言
        if (config && config.isPermission)
            this.baseParams.orgModel = config.isPermission;
        else
            this.baseParams.orgModel = this.isPermission;
        HY.ChooseDepartment.superclass.constructor.call(this, config);
        if (this.id) {
            HY.ChooseWidgetMgr.reg(this);
        }
    },
    title: '组织选择',
    LanguageUrl: '', //多语言数据URL
    url: '/OrganizationHandler.ashx', //其他数据URL
    rootCode: '00000000000000000000000000000000', //指定资源父节点
    orgType: 'B96C323FF5E749D78E6B85EB0E7BD8A2',
    isPermission: '1', //1.不使用权限 2.使用权限
    baseParams: { structTypeCode: 'B96C323FF5E749D78E6B85EB0E7BD8A2', showDisableData: false, orgModel: '1' },

    //*******************ResourcesPanel资源面板属性**************************************
    treeTabTitle: '组织树',
    gridTabTitle: '列表',
    searchTabTitle: '搜索',
    treeRootText: '组织',
    gridRootText: '组织名称',
    gridSelectedText: '组织',
    treeSearchText:'组织筛选:',
    extensionUrl: '',
    enableCommonDepartment: false,
    fields: [
		{ name: "Res_Id" },
		{ name: "Name" },
		{ name: "ParentCode" },
		{ name: "ParentName" },
		{ name: 'childslength', type: 'int' },
		{ name: "CNName" },
		{ name: "ENName" }
	],
    //*********************************************************
    comboFields: [
		{ name: "Code", mapping: 'Res_Id' },
		{ name: "Name" }
	],
    //渲染和数据源操作
    afterRender: function () {
        HY.ChooseDepartment.superclass.afterRender.apply(this, arguments);
        this.comboStore.load();
    },
    initMainToolItems: function () {
        var items = HY.ChooseDepartment.superclass.initMainToolItems.apply(this, arguments);
        items.unshift(this.initComboBox());
        items.unshift('组织结构: ');
        return items;
    },
    initComboStore: function () {
        if (!this.comboStore) {
            this.comboStore = new Ext.data.JsonStore({
                autoDestroy: true,
                proxy: new Ext.data.HttpProxy({
                    url: this.url,
                    method: "POST"
                }),
                baseParams: Ext.applyIf({ method: "GetInitData" }, this.baseParams),
                storeId: 'comboStore',
                root: 'orgStructType',
                fields: this.comboFields
            });
            this.comboStore.on('load', function (Store, records, options) {
                this.comboBox.setValue(Store.getAt(0).get('Code'));
            }, this);
        }
        return this.comboStore;
    },
    initComboBox: function () {
        this.comboBox = new Ext.form.ComboBox({
            width: 120,
            editable: false,
            displayField: 'Name',
            valueField: 'Code',
            mode: 'local',
            store: this.initComboStore(),
            forceSelection: true,
            triggerAction: 'all'
        });
        this.comboBox.on('select', function (combo, record, index) {
            this.resourcesPanel.clearPathTextfield();
            this.selectedStore.removeAll();
            this.resourcesPanel.reloadStore({ structTypeCode: combo.getValue(), ParentCode: this.rootCode });
            this.orgType = combo.getValue()
        }, this);
        return this.comboBox
    }
});
Ext.reg('choosedepartment', HY.ChooseDepartment);
