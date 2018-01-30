Ext.namespace('HY.DepartmentPanel');
//控件构造函
HY.DepartmentPanel = function(config){

	HY.DepartmentPanel.superclass.constructor.call(this,config);
};
Ext.extend(HY.DepartmentPanel, HY.ResourcesPanel, {
    url: '/OrganizationHandler.ashx', //其他数据URL
    rootCode: '00000000000000000000000000000000', //指定资源父节点
    orgType: 'B96C323FF5E749D78E6B85EB0E7BD8A2',
    baseParams: { structTypeCode: 'B96C323FF5E749D78E6B85EB0E7BD8A2', showDisableData: false, orgModel: '1' },
    fields: [
		{ name: "Res_Id" },
		{ name: "Name" },
		{ name: "ParentCode" },
		{ name: "ParentName" },
		{ name: 'childslength', type: 'int' },
		{ name: "CNName" },
		{ name: "ENName" }
	],
    comboFields: [
		{ name: "Code", mapping: 'Res_Id' },
		{ name: "Name" }
	],
    init: function () {
        var oldPanel = HY.DepartmentPanel.superclass.init.apply(this, arguments);
        Ext.apply(oldPanel, {
            layout: 'fit'
        })
        var mainPanel = {
            xtype: 'panel',
            layout: 'fit',
            tbar: this.initComboToolbar(),
            hideBorders: true,
            items: oldPanel
        };
        return mainPanel;

    },
    afterRender: function () {
        HY.DepartmentPanel.superclass.afterRender.apply(this, arguments);
        this.comboStore.load();
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
                var structTypeCode = Store.getAt(0).get('Code');
                this.comboBox.setValue(structTypeCode);
                this.reloadStore({ structTypeCode: structTypeCode, ParentCode: this.rootCode });
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
            this.clearPathTextfield();
            this.selectedStore.removeAll();
            this.reloadStore({ structTypeCode: combo.getValue(), ParentCode: this.rootCode });
            this.orgType = combo.getValue()
        }, this);
        return this.comboBox
    },
    initComboToolbar: function () {
        return [this.initComboBox()];
    }
});