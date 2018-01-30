Ext.namespace('HY.CallFormula');
HY.CallFormula = function(config){
    this.addEvents('selectcomplete');
    Ext.QuickTips.init();//初始化tooltip
	HY.CallFormula.superclass.constructor.call(this,config);
	this.returnJson = {paramsInfo:[],formulaInfo:[]};
};
Ext.extend(HY.CallFormula, Ext.Window, {
    title: '公式条件',
    LanguageUrl: '', //多语言数据URL
    url: '/Web/SelectorManager.ashx', //数据URL
    LanguageUrl: '', //多语言数据URL
    width: 450,
    height: 300,
    minWidth: 450,
    minHeight: 300,
    closeAction: 'hide',
    plain: true,
    hideMode: 'offsets',
    border: false,
    buttonAlign: 'center',
    resizable: false, //不可以随意改变大小
    modal: true,
    formulaId: null,
    formulaJson: null,
    isCalculateOrBoolean: false,
    buttons: [
        { text: '确定', handler: function () {
            var win = this.ownerCt.ownerCt;
            win.initIsOkFnction();
        }
        },
        { text: '取消', handler: function () {
            var win = this.ownerCt.ownerCt;
            win.hide();
        }
        }
    ],
    initIsOkFnction: function () {
        if (!this.formulaName.isValid() || !this.comboReturnValueType.isValid())
            return
        if (!this.editFormulaStore || this.editFormulaStore.getCount() == 0) {
            this.App.setAlert('系统提示', '请添加条件!');
            return
        }

        var returnValueType = this.comboReturnValueType.getValue();
        var formulaName = this.formulaName.getValue();
        var expressionID = this.editFormulaStore.baseParams.expressionID;
        var expressionType = this.comboFormulaType.getValue();
        var id;
        if (this.formulaId && this.formulaId != '')
            id = this.formulaId;
        else
            id = Ext.ux.newGuid();
        if (this.isCalculateOrBoolean) {
            var records = this.editFormulaStore.getRange();
            for (var i = 0; i < records.length; i++) {
                records[i].set('RenderOrder', (i + 1).toString())
            }
        }
        var json = []; //WhiteShell.Globle.DataFormat.gridStoreSerialization(this.editFormulaStore);
        this.editFormulaStore.each(function (rd, rowIndex) {
            json.push(rd.data);
        }, this);
        var formulaJson = {
            returnValueType: returnValueType,
            formulaName: formulaName,
            expressionID: expressionID,
            expressionType: expressionType,
            formulaParams: json,
            id: id
        };
        this.returnJson.formulaInfo.push(formulaJson);
        this.fireEvent('selectcomplete', this.returnJson, formulaJson.id, formulaName);
        this.hide();
    },
    init: function () {
        var mainPanel = {
            xtype: 'panel',
            layout: 'fit',
            hideBorders: true,
            tbar: this.initFormulaGridTbar(),
            items: this.initRightFormulaGrid()
        };
        return mainPanel;
    },
    //初始化
    initComponent: function () {
        var mainPanel = this.init();
        Ext.apply(this, mainPanel);
        Ext.apply(this.initialConfig, mainPanel);
        HY.CallFormula.superclass.initComponent.apply(this, arguments);
    },
    afterRender: function () {
        HY.CallFormula.superclass.afterRender.apply(this, arguments);
        this.App = new Ext.App({});
        this.formulaLoad();
    },
    formulaLoad: function () {
        if (!this.formulaJson && this.formulaId && this.formulaId != '') {
            Ext.Ajax.request({
                url: this.url,
                params: { Method: 'GetExpressionById', expressionID: this.formulaId },
                success: function (data) {
                    var responseText = Ext.decode(data.responseText).info;
                    this.comboFormulaType.setValue(responseText.ExpressionType);
                    if (responseText.ExpressionType == '1') {
                        this.isCalculateOrBoolean = true;
                        this.rightFormulaGrid.reconfigure(this.formatFormulaStoreCalculate, this.colModelFormulaCalculate);
                    }
                    else {
                        this.isCalculateOrBoolean = false;
                        this.rightFormulaGrid.reconfigure(this.formatFormulaStore, this.colModelFormulaBoolean);
                    }
                    this.comboReturnValueType.setValue(responseText.ReturnValueType);
                    this.formulaName.setValue(responseText.ExpressionName);
                    this.editFormulaStore.baseParams.expressionID = this.formulaId;
                    this.editFormulaStore.load();
                },
                failure: function () {
                    this.App.setAlert('系统提示', '向导数据保存错误!');
                },
                scope: this
            });
            //            this.isCalculateOrBoolean=false;
            ////            this.comboReturnValueType.setValue();
            //            this.comboFormulaType.setValue('2');
            //            this.rightFormulaGrid.reconfigure(this.formatFormulaStore,this.colModelFormulaBoolean);
            ////            this.formulaWindow.comboReturnValueType.setValue(record.get('ReturnValueType'));
            //            this.formulaName.setValue(this.formulaRecord.get('ExpressionName'));
            ////            this.formulaWindow.comboFormulaType.setValue(record.get('ExpressionType'));
            //            this.editFormulaStore.baseParams.expressionID=this.formulaRecord.get('Expression_Id');
            //            this.editFormulaStore.load();
        } else if (this.formulaJson && this.formulaJson != '' && this.formulaId && this.formulaId != '') {
            for (var i = 0; i < this.formulaJson.formulaInfo.length; i++) {
                var formulaJson = this.formulaJson.formulaInfo[i];
                if (formulaJson.id == this.formulaId) {
                    this.comboFormulaType.setValue(formulaJson.expressionType);
                    if (formulaJson.expressionType == '1') {
                        this.isCalculateOrBoolean = true;
                        this.rightFormulaGrid.reconfigure(this.formatFormulaStoreCalculate, this.colModelFormulaCalculate);
                    }
                    else {
                        this.isCalculateOrBoolean = false;
                        this.rightFormulaGrid.reconfigure(this.formatFormulaStore, this.colModelFormulaBoolean);
                    }
                    this.comboReturnValueType.setValue(formulaJson.returnValueType);
                    this.formulaName.setValue(formulaJson.formulaName);
                    for (var j = 0; j < formulaJson.formulaParams.length; j++) {
                        var formulaParamsJson = formulaJson.formulaParams[j];
                        var store = this.editFormulaStore;
                        var recordData = {
                            ID: formulaParamsJson.ID,
                            ExpressionID: formulaParamsJson.ExpressionID,
                            Level: formulaParamsJson.Level,
                            RenderOrder: formulaParamsJson.RenderOrder,
                            RenderType: formulaParamsJson.RenderType,
                            Value: formulaParamsJson.Value,
                            ValueType: formulaParamsJson.ValueType,
                            ReturnValueType: formulaParamsJson.ReturnValueType,
                            ValueRemark: formulaParamsJson.ValueRemark,
                            RowIndex: formulaParamsJson.RowIndex ? formulaParamsJson.RowIndex : ''
                        };
                        var newRecord = new store.recordType(recordData);
                        this.editFormulaStore.add(newRecord);
                    }
                    this.editFormulaStore.fireEvent('load');
                }
            }
        }
    },
    //公式类型
    initFormulaTypeCombo: function () {
        var formulaTypeCombo = new Ext.form.ComboBox({
            typeAhead: true,
            triggerAction: 'all',
            lazyRender: true,
            mode: 'local',
            editable: false,
            width: 75,
            value: '2',
            ref: '../comboFormulaType',
            allowBlank: false,
            //            disabled:true,
            store: new Ext.data.JsonStore({
                fields: ['Code', 'Name'],
                data: [
                    { Code: '1', Name: '计算公式' },
                    { Code: '2', Name: '布尔公式' }
                ]
            }),
            valueField: 'Code',
            displayField: 'Name',
            listeners: {
                'select': function (combo, record, index) {
                    if (index == 0) {
                        this.isCalculateOrBoolean = true;
                        this.rightFormulaGrid.reconfigure(this.formatFormulaStoreCalculate, this.colModelFormulaCalculate);
                    }
                    else {
                        this.isCalculateOrBoolean = false;
                        this.rightFormulaGrid.reconfigure(this.formatFormulaStore, this.colModelFormulaBoolean);
                    }
                },
                scope: this
            }
        });
        return formulaTypeCombo;
    },
    //公式条件的tbar
    initFormulaGridTbar: function () {
        var comboReturnValueType = new Ext.form.ComboBox({
            typeAhead: true,
            triggerAction: 'all',
            lazyRender: true,
            mode: 'local',
            editable: false,
            width: 80,
            ref: '../comboReturnValueType',
            allowBlank: false,
            store: new Ext.data.JsonStore({
                fields: ['Code', 'Name'],
                data: [
                    { Code: '1', Name: '字符串' },
                    { Code: '2', Name: '整型' },
                    { Code: '3', Name: '浮点型' },
                    { Code: '4', Name: '布尔型' },
                    { Code: '5', Name: '时间型' },
                    { Code: '6', Name: '数据集' }
                ]
            }),
            valueField: 'Code',
            displayField: 'Name'
        });
        return [
	        '->', '公式名称: ', { xtype: 'textfield', width: 80, ref: '../formulaName', allowBlank: false }, '-',
	        '返回值类型:', comboReturnValueType, '-',
	        '公式类型:', this.initFormulaTypeCombo()
	    ]
    },
    initEditFormulaStore: function () {
        //布尔类型公式store
        this.formatFormulaStore = new Ext.data.JsonStore({
            fields: ['ID1', 'ID2', 'ID3', 'ExpressionID', 'Level1', 'RenderOrder1', 'ValueType1', 'Value1', 'ReturnValueType1', 'ValueRemark1',
                                                      'Level2', 'RenderOrder2', 'ValueType2', 'Value2', 'ReturnValueType2', 'ValueRemark2',
                                                      'Level3', 'RenderOrder3', 'ValueType3', 'Value3', 'ReturnValueType3', 'ValueRemark3']
        });
        //计算类型公式store
        this.formatFormulaStoreCalculate = new Ext.data.JsonStore({
            fields: ['ID', 'ExpressionID', 'Level', 'RenderOrder', 'RenderType', 'Value', 'ValueType', 'ReturnValueType', 'ValueRemark', 'RowIndex']
        });
        this.editFormulaStore = new Ext.data.JsonStore({
            proxy: new Ext.data.HttpProxy({
                url: this.url,
                method: "POST"
            }),
            baseParams: { method: "GetListByExpressionId", expressionID: '' },
            root: 'Table',
            fields: ['ID', 'ExpressionID', 'Level', 'RenderOrder', 'RenderType', 'Value', 'ValueType', 'ReturnValueType', 'ValueRemark', 'RowIndex'],
            listeners: {
                'load': function (mystore, records) {
                    if (this.isCalculateOrBoolean)
                        this.initformatFormulaStoreCalculateReload();
                    else
                        this.initformatFormulaStoreReload();
                },
                scope: this
            }
        });

        return this.isCalculateOrBoolean ? this.formatFormulaStoreCalculate : this.formatFormulaStore;
    },
    //计算类型公式reload方法
    initformatFormulaStoreCalculateReload: function () {
        var records = this.editFormulaStore.getRange();
        if (this.formatFormulaStoreCalculate) {
            this.formatFormulaStoreCalculate.removeAll();
            this.rightFormulaGrid.formulaWinTbarEdit.setDisabled(true);
            this.rightFormulaGrid.formulaWinTbarDel.setDisabled(true);
            this.rightFormulaGrid.formulaWinTbarLeft.setDisabled(true);
            this.rightFormulaGrid.formulaWinTbarRight.setDisabled(true);
        } else {
            return
        }
        for (var i = 0; i < records.length; i++) {
            var index = parseInt(records[i].get('RowIndex'));
            if (index > this.formatFormulaStoreCalculate.getCount()) {
                var store = this.formatFormulaStoreCalculate;
                var recordData = {
                    Level: records[i].get('Level'),
                    ValueRemark: records[i].get('ValueRemark'),
                    RowIndex: records[i].get('RowIndex')
                };
                var newRecord = new store.recordType(recordData);
                this.formatFormulaStoreCalculate.add(newRecord);
            } else {
                var rd = this.formatFormulaStoreCalculate.getAt(index - 1);
                var newValue = rd.get('ValueRemark') + ' ' + records[i].get('ValueRemark');
                rd.set('ValueRemark', newValue);
            }
        }
    },
    //布尔类型公式reload方法
    initformatFormulaStoreReload: function () {
        var records = this.editFormulaStore.getRange();
        if (this.formatFormulaStore) {
            this.formatFormulaStore.removeAll();
            this.rightFormulaGrid.formulaWinTbarEdit.setDisabled(true);
            this.rightFormulaGrid.formulaWinTbarDel.setDisabled(true);
            this.rightFormulaGrid.formulaWinTbarLeft.setDisabled(true);
            this.rightFormulaGrid.formulaWinTbarRight.setDisabled(true);
        } else {
            return
        }
        for (var i = 0; i < records.length - 2; i = i + 4) {
            var store = this.formatFormulaStore;
            var recordData = {
                ID1: records[i].get('ID'),
                ID2: records[i + 1].get('ID'),
                ID3: records[i + 2].get('ID'),
                ExpressionID: records[i].get('ExpressionID'),
                Level1: records[i].get('Level'),
                RenderOrder1: records[i].get('RenderOrder'),
                ValueType1: records[i].get('ValueType'),
                Value1: records[i].get('Value'),
                ReturnValueType1: records[i].get('ReturnValueType'),
                ValueRemark1: records[i].get('ValueRemark'),
                Level2: records[i + 1].get('Level'),
                RenderOrder2: records[i + 1].get('RenderOrder'),
                ValueType2: records[i + 1].get('ValueType'),
                Value2: records[i + 1].get('Value'),
                ReturnValueType2: records[i + 1].get('ReturnValueType'),
                ValueRemark2: records[i + 1].get('ValueRemark'),
                Level3: records[i + 2].get('Level'),
                RenderOrder3: records[i + 2].get('RenderOrder'),
                ValueType3: records[i + 2].get('ValueType'),
                Value3: records[i + 2].get('Value'),
                ReturnValueType3: records[i + 2].get('ReturnValueType'),
                ValueRemark3: records[i + 2].get('ValueRemark')
            };
            var newRecord = new store.recordType(recordData);
            this.formatFormulaStore.add(newRecord);
            if ((records.length - i) >= 4) {
                var recordOP = {
                    ID1: records[i + 3].get('ID'),
                    ID2: '',
                    ID3: '',
                    ExpressionID: records[i].get('ExpressionID'),
                    Level1: records[i + 3].get('Level'),
                    RenderOrder1: records[i + 3].get('RenderOrder'),
                    ValueType1: records[i + 3].get('ValueType'),
                    Value1: records[i + 3].get('Value'),
                    ReturnValueType1: records[i + 3].get('ReturnValueType'),
                    ValueRemark1: records[i + 3].get('ValueRemark'),
                    Level2: '',
                    RenderOrder2: '',
                    ValueType2: '',
                    Value2: '',
                    ReturnValueType2: '',
                    ValueRemark2: '',
                    Level3: '',
                    RenderOrder3: '',
                    ValueType3: '',
                    Value3: '',
                    ReturnValueType3: '',
                    ValueRemark3: ''
                };
                var newRecord2 = new store.recordType(recordOP);
                this.formatFormulaStore.add(newRecord2);
            }
        }
    },
    initComboReturnType: function (refPath, name) {
        var comboReturnTypea = new Ext.form.ComboBox({
            typeAhead: true,
            triggerAction: 'all',
            lazyRender: true,
            mode: 'local',
            editable: false,
            width: 80,
            ref: refPath,
            emptyText: '返回值类型',
            allowBlank: false,
            name: name,
            store: new Ext.data.JsonStore({
                fields: ['Code', 'Name'],
                data: [
                    { Code: '1', Name: '字符串' },
                    { Code: '2', Name: '整型' },
                    { Code: '3', Name: '浮点型' },
                    { Code: '4', Name: '布尔型' },
                    { Code: '5', Name: '时间型' },
                    { Code: '6', Name: '数据集' }
                ]
            }),
            valueField: 'Code',
            displayField: 'Name'
        });
        return comboReturnTypea;
    },
    //布尔公式新增按钮弹出的窗体
    initFormulaEditWin: function () {
        if (!this.formulaEditWin) {
            var comboType = new Ext.form.ComboBox({
                typeAhead: true,
                triggerAction: 'all',
                lazyRender: true,
                mode: 'local',
                editable: false,
                width: 333,
                allowBlank: false,
                ref: '../../booleanOperation',
                store: new Ext.data.JsonStore({
                    fields: ['Code', 'Name'],
                    data: [{ Code: '&&', Name: 'and' },
			            { Code: '||', Name: 'or' }
			        ]
                }),
                valueField: 'Code',
                displayField: 'Name'
            });
            var comboValue1 = new Ext.form.ComboBox({
                typeAhead: true,
                triggerAction: 'all',
                lazyRender: true,
                mode: 'local',
                editable: false,
                width: 90,
                ref: '../../comboValue1',
                emptyText: '值类型',
                allowBlank: false,
                store: new Ext.data.JsonStore({
                    fields: ['Code', 'Name'],
                    data: [
			            { Code: '2', Name: '文本' },
			            { Code: '5', Name: '环境变量' },
			            { Code: '6', Name: '流程全局变量' },
			            { Code: '7', Name: '节点局部变量' },
			            { Code: '8', Name: '表单字段' },
			            { Code: '9', Name: 'SQL语句' },
			            { Code: '10', Name: '函数' },
			            { Code: '11', Name: '公式' }
			        ]
                }),
                valueField: 'Code',
                displayField: 'Name',
                listeners: {
                    'select': function (combo, record, index) {
                        var code = record.get('Code');
                        if (code == '8' || code == '10' || code == '11') {
                            this.formulaEditPanel.textfieldValue1.setDisabled(true);
                            this.formulaEditPanel.buttonValue1.setDisabled(false);
                        } else {
                            this.formulaEditPanel.textfieldValue1.setDisabled(false);
                            this.formulaEditPanel.buttonValue1.setDisabled(true);
                        }
                        this.formulaEditPanel.textfieldValue1.setValue();
                        this.formulaEditPanel.hiddenValue1.setValue();
                    },
                    //	                'change':function(){
                    //	                    this.formulaEditPanel.textfieldValue1.setValue();
                    //	                    this.formulaEditPanel.hiddenValue1.setValue();
                    //	                },
                    scope: this
                }
            });
            var comboValue2 = new Ext.form.ComboBox({
                typeAhead: true,
                triggerAction: 'all',
                lazyRender: true,
                mode: 'local',
                editable: false,
                width: 90,
                ref: '../../comboValue2',
                emptyText: '值类型',
                allowBlank: false,
                store: new Ext.data.JsonStore({
                    fields: ['Code', 'Name'],
                    data: [
			            { Code: '2', Name: '文本' },
			            { Code: '5', Name: '环境变量' },
			            { Code: '6', Name: '流程全局变量' },
			            { Code: '7', Name: '节点局部变量' },
			            { Code: '8', Name: '表单字段' },
			            { Code: '9', Name: 'SQL语句' },
			            { Code: '10', Name: '函数' },
			            { Code: '11', Name: '公式' }
			        ]
                }),
                valueField: 'Code',
                displayField: 'Name',
                listeners: {
                    'select': function (combo, record, index) {
                        var code = record.get('Code');
                        if (code == '8' || code == '10' || code == '11') {
                            this.formulaEditPanel.textfieldValue2.setDisabled(true);
                            this.formulaEditPanel.buttonValue2.setDisabled(false);
                        } else {
                            this.formulaEditPanel.textfieldValue2.setDisabled(false);
                            this.formulaEditPanel.buttonValue2.setDisabled(true);
                        }
                        this.formulaEditPanel.textfieldValue2.setValue();
                        this.formulaEditPanel.hiddenValue2.setValue();
                    },
                    //	                'change':function(){
                    //	                    this.formulaEditPanel.textfieldValue2.setValue();
                    //	                    this.formulaEditPanel.hiddenValue2.setValue();
                    //	                },
                    scope: this
                }
            });

            var combo = new Ext.form.ComboBox({
                typeAhead: true,
                triggerAction: 'all',
                lazyRender: true,
                mode: 'local',
                ref: '../../comparisonOperation',
                editable: false,
                width: 333,
                allowBlank: false,
                store: new Ext.data.JsonStore({
                    fields: ['Code', 'Name'],
                    data: [{ Code: '1', Name: '==' },
			            { Code: '2', Name: '<' },
			            { Code: '3', Name: '<=' },
			            { Code: '4', Name: '>' },
			            { Code: '5', Name: '>=' },
			            { Code: '6', Name: '!=' }
			        ]
                }),
                valueField: 'Name',
                displayField: 'Name'
            });
            this.formulaEditPanel = new Ext.form.FormPanel({
                //	            layout:'form',
                border: false,
                bodyStyle: "padding:5px 0px 0px 5px",
                labelWidth: 0.1,
                items: [
	                { xtype: 'label', html: '&nbsp;布尔运算符:' },
	                { layout: 'column', border: false, items: [{ layout: 'form', border: false, items: comboType}] },
	                { xtype: 'label', html: '&nbsp;变量1:' },
	                { layout: 'column', border: false,
	                    items: [
	                            { layout: 'form', border: false, items: [{ xtype: 'textfield', disabled: true, allowBlank: false, ref: '../../textfieldValue1', width: 120 }, { xtype: 'hidden', ref: '../../hiddenValue1'}] },
	                            { xtype: 'button', text: '...', ref: '../buttonValue1', disabled: true,
	                                handler: function () {
	                                    var value = comboValue1.getValue();
	                                    if (value == 8) {
	                                        this.initTextfieldSelectorWindow(this.formulaEditPanel.textfieldValue1, this.formulaEditPanel.hiddenValue1).show();
	                                    } else if (value == 10) {
	                                        this.initProcedureWindow(this.formulaEditPanel.textfieldValue1, this.formulaEditPanel.hiddenValue1);
	                                    } else if (value == 11) {
	                                        this.initFormulaWindow(this.formulaEditPanel.textfieldValue1, this.formulaEditPanel.hiddenValue1);
	                                    }
	                                }, scope: this
	                            },
	                            { layout: 'form', border: false, items: comboValue1 },
	                            { layout: 'form', border: false, items: this.initComboReturnType('../../comboReturnType1', 'comboReturnType1') }
	                ]
	                },
	                { xtype: 'label', html: '&nbsp;比较运算符:' },
	                { layout: 'column', border: false, items: [{ layout: 'form', border: false, items: combo}] },
	                { xtype: 'label', html: '&nbsp;变量2:' },
	                { layout: 'column', border: false,
	                    items: [
	                            { layout: 'form', border: false, items: [{ xtype: 'textfield', disabled: true, allowBlank: false, ref: '../../textfieldValue2', width: 120 }, { xtype: 'hidden', ref: '../../hiddenValue2'}] },
	                            { xtype: 'button', text: '...', ref: '../buttonValue2', disabled: true,
	                                handler: function () {
	                                    var value = comboValue2.getValue();
	                                    if (value == 8) {
	                                        this.initTextfieldSelectorWindow(this.formulaEditPanel.textfieldValue2, this.formulaEditPanel.hiddenValue2).show();
	                                    } else if (value == 10) {
	                                        this.initProcedureWindow(this.formulaEditPanel.textfieldValue2, this.formulaEditPanel.hiddenValue2);
	                                    } else if (value == 11) {
	                                        this.initFormulaWindow(this.formulaEditPanel.textfieldValue2, this.formulaEditPanel.hiddenValue2);
	                                    }
	                                }, scope: this
	                            },
	                            { layout: 'form', border: false, items: comboValue2 },
	                            { layout: 'form', border: false, items: this.initComboReturnType('../../comboReturnType2', 'comboReturnType2') }
	                ]
	                }
	            ]
            });
            this.formulaEditWin = new Ext.Window({
                title: '添加',
                width: 365,
                height: 240,
                layout: 'fit',
                closeAction: 'hide',
                border: false,
                resizable: false, //不可以随意改变大小
                modal: 'true', //弹出模态窗体
                buttonAlign: "center",
                bodyStyle: "padding:0 0 0 0",
                items: [{
                    xtype: 'panel',
                    layout: 'fit',
                    items: this.formulaEditPanel
                }],
                buttons: [
		            { text: '确定',
		                handler: function () {
		                    if (!this.formulaEditPanel.form.isValid()) {
		                        return
		                    }

		                    var store = this.editFormulaStore;
		                    var recordData = {
		                        ID: new Date() - 4000,
		                        ExpressionID: '1',
		                        Level: '0',
		                        RenderOrder: this.editFormulaStore.getCount() + 1,
		                        RenderType: '1',
		                        Value: this.formulaEditPanel.booleanOperation.getValue(),
		                        ValueType: '2',
		                        ReturnValueType: '1',
		                        ValueRemark: this.formulaEditPanel.booleanOperation.getValue()
		                    };
		                    var newRecord = new store.recordType(recordData);
		                    if (!this.formulaEditPanel.booleanOperation.disabled)
		                        this.editFormulaStore.add(newRecord);


		                    var recordData2Value = '';
		                    if (this.formulaEditPanel.comboValue1.getValue() == '8' || this.formulaEditPanel.comboValue1.getValue() == '10' || this.formulaEditPanel.comboValue1.getValue() == '11')
		                        recordData2Value = this.formulaEditPanel.hiddenValue1.getValue();
		                    else
		                        recordData2Value = this.formulaEditPanel.textfieldValue1.getValue();
		                    var recordData2 = {
		                        ID: new Date() - 3000,
		                        ExpressionID: '1',
		                        Level: '1',
		                        RenderOrder: this.editFormulaStore.getCount() + 1,
		                        RenderType: '0',
		                        Value: recordData2Value,
		                        ValueType: this.formulaEditPanel.comboValue1.getValue(),
		                        ReturnValueType: this.formulaEditPanel.comboReturnType1.getValue(),
		                        ValueRemark: this.formulaEditPanel.textfieldValue1.getValue()
		                    };
		                    var newRecord2 = new store.recordType(recordData2);
		                    this.editFormulaStore.add(newRecord2);

		                    var recordData3 = {
		                        ID: new Date() - 2000,
		                        ExpressionID: '1',
		                        Level: '1',
		                        RenderOrder: this.editFormulaStore.getCount() + 1,
		                        RenderType: '1',
		                        Value: this.formulaEditPanel.comparisonOperation.getValue(),
		                        ValueType: '2',
		                        ReturnValueType: '1',
		                        ValueRemark: this.formulaEditPanel.comparisonOperation.getValue()
		                    };
		                    var newRecord3 = new store.recordType(recordData3);
		                    this.editFormulaStore.add(newRecord3);

		                    var recordData4Value = '';
		                    if (this.formulaEditPanel.comboValue2.getValue() == '8' || this.formulaEditPanel.comboValue2.getValue() == '10' || this.formulaEditPanel.comboValue2.getValue() == '11')
		                        recordData4Value = this.formulaEditPanel.hiddenValue2.getValue();
		                    else
		                        recordData4Value = this.formulaEditPanel.textfieldValue2.getValue();
		                    var recordData4 = {
		                        ID: new Date() - 1000,
		                        ExpressionID: '1',
		                        Level: '1',
		                        RenderOrder: this.editFormulaStore.getCount() + 1,
		                        RenderType: '0',
		                        Value: recordData4Value,
		                        ValueType: this.formulaEditPanel.comboValue2.getValue(),
		                        ReturnValueType: this.formulaEditPanel.comboReturnType2.getValue(),
		                        ValueRemark: this.formulaEditPanel.textfieldValue2.getValue()
		                    };
		                    var newRecord4 = new store.recordType(recordData4);
		                    this.editFormulaStore.add(newRecord4);

		                    this.initformatFormulaStoreReload();
		                    this.formulaEditWin.hide();
		                }, scope: this
		            },
		            { text: '取消',
		                handler: function () {
		                    this.formulaEditWin.hide();
		                }, scope: this
		            }
	            ]
            });
        }
        //清空表单
        this.formulaEditPanel.form.reset();
        this.formulaEditPanel.textfieldValue1.setDisabled(true);
        this.formulaEditPanel.buttonValue1.setDisabled(true);
        this.formulaEditPanel.textfieldValue2.setDisabled(true);
        this.formulaEditPanel.buttonValue2.setDisabled(true);
        //为返回值类型赋默认值
        this.formulaEditPanel.comboReturnType1.setValue('1');
        this.formulaEditPanel.comboReturnType2.setValue('1');
        return this.formulaEditWin;
    },
    //计算公式新增按钮弹出的窗体中的新增按钮的窗体
    initCalculateFormulaItemsEditWin: function () {
        if (!this.calculateFormulaItemsEditWin) {
            var comboType = new Ext.form.ComboBox({
                typeAhead: true,
                triggerAction: 'all',
                lazyRender: true,
                mode: 'local',
                editable: false,
                width: 200,
                allowBlank: false,
                fieldLabel: '运算符',
                ref: 'calculateOperation',
                store: new Ext.data.JsonStore({
                    fields: ['Code', 'Name'],
                    data: [{ Code: '+', Name: '+' },
			            { Code: '-', Name: '-' },
			            { Code: '*', Name: '*' },
			            { Code: '/', Name: '/' },
			            { Code: '%', Name: '%' }
			        ]
                }),
                valueField: 'Code',
                displayField: 'Name'
            });
            var comboValue = new Ext.form.ComboBox({
                typeAhead: true,
                triggerAction: 'all',
                lazyRender: true,
                mode: 'local',
                editable: false,
                width: 200,
                ref: 'comboValue',
                //	            emptyText:'值类型',
                fieldLabel: '值类型',
                allowBlank: false,
                store: new Ext.data.JsonStore({
                    fields: ['Code', 'Name'],
                    data: [
			            { Code: '1', Name: '数值' },
			            { Code: '5', Name: '环境变量' },
			            { Code: '6', Name: '流程全局变量' },
			            { Code: '7', Name: '节点局部变量' },
			            { Code: '8', Name: '表单字段' },
			            { Code: '9', Name: 'SQL语句' },
			            { Code: '10', Name: '函数' },
			            { Code: '11', Name: '公式' }
			        ]
                }),
                valueField: 'Code',
                displayField: 'Name',
                listeners: {
                    'select': function (combo, record, index) {
                        if (index == 4 || index == 6 || index == 7) {
                            this.calculateFormulaItemsEditPanel.textfieldValue.setDisabled(true);
                            this.calculateFormulaItemsEditPanel.buttonValue.setDisabled(false);
                        } else {
                            this.calculateFormulaItemsEditPanel.textfieldValue.setDisabled(false);
                            this.calculateFormulaItemsEditPanel.buttonValue.setDisabled(true);
                        }
                        this.calculateFormulaItemsEditPanel.textfieldValue.setValue();
                        this.calculateFormulaItemsEditPanel.hiddenValue.setValue();
                    },
                    scope: this
                }
            });
            this.calculateFormulaItemsEditPanel = new Ext.form.FormPanel({
                layout: 'form',
                border: false,
                bodyStyle: "padding:10px 0px 0px 10px",
                labelWidth: 50,
                items: [
	                comboType,
	                { layout: 'column', border: false,
	                    items: [
	                            { layout: 'form', border: false, items: [{ xtype: 'textfield', fieldLabel: '值', disabled: true, allowBlank: false, ref: '../../textfieldValue', width: 178 },
	                            { xtype: 'hidden', ref: '../../hiddenValue'}]
	                            },
	                            { xtype: 'button', ref: '../buttonValue', disabled: true, iconCls: 'cog_editcon',
	                                handler: function () {
	                                    var value = comboValue.getValue();
	                                    if (value == 8) {
	                                        this.initTextfieldSelectorWindow(this.calculateFormulaItemsEditPanel.textfieldValue, this.calculateFormulaItemsEditPanel.hiddenValue).show();
	                                    } else if (value == 10) {
	                                        this.initProcedureWindow(this.calculateFormulaItemsEditPanel.textfieldValue, this.calculateFormulaItemsEditPanel.hiddenValue);
	                                    } else if (value == 11) {
	                                        this.initFormulaWindow(this.calculateFormulaItemsEditPanel.textfieldValue, this.calculateFormulaItemsEditPanel.hiddenValue);
	                                    }
	                                }, scope: this
	                            }
	                ]
	                },
	                comboValue
	            ]
            });
            this.calculateFormulaItemsEditWin = new Ext.Window({
                title: '添加',
                width: 300,
                height: 160,
                layout: 'fit',
                closeAction: 'hide',
                border: false,
                resizable: false, //不可以随意改变大小
                modal: 'true', //弹出模态窗体
                buttonAlign: "center",
                bodyStyle: "padding:0 0 0 0",
                items: [{
                    xtype: 'panel',
                    layout: 'fit',
                    items: this.calculateFormulaItemsEditPanel
                }],
                buttons: [
		            { text: '确定',
		                handler: function () {
		                    if (!this.calculateFormulaItemsEditPanel.form.isValid()) {
		                        return
		                    }
		                    var count = 0;
		                    var level = 1;
		                    if (this.CalculateFormulaIsAddOrEdit) {
		                        count = this.formatFormulaStoreCalculate.getCount();
		                        if (!this.calculateFormulaEditWin.comboTypeOp.disabled) {
		                            count++;
		                        }
		                    }
		                    else {
		                        var record = this.rightFormulaGrid.getSelectionModel().getSelected();
		                        count = parseInt(record.get('RowIndex'));
		                        count--;
		                        level = record.get('Level');
		                    }

		                    var store = this.gridStoreCalculateFormula;
		                    var recordData = {
		                        ID: new Date() - 2000,
		                        ExpressionID: '',
		                        Level: level,
		                        RenderOrder: '',
		                        RenderType: '1',
		                        Value: this.calculateFormulaItemsEditPanel.calculateOperation.getValue(),
		                        ValueType: '2',
		                        ReturnValueType: '3',
		                        ValueRemark: this.calculateFormulaItemsEditPanel.calculateOperation.getValue(),
		                        RowIndex: count + 1
		                    };
		                    var newRecord = new store.recordType(recordData);
		                    if (!this.calculateFormulaItemsEditPanel.calculateOperation.disabled) {
		                        this.gridStoreCalculateFormula.add(newRecord);
		                    }
		                    var recordData1Value = '';
		                    if (this.calculateFormulaItemsEditPanel.comboValue.getValue() == '8' || this.calculateFormulaItemsEditPanel.comboValue.getValue() == '10' || this.calculateFormulaItemsEditPanel.comboValue.getValue() == '11')
		                        recordData1Value = this.calculateFormulaItemsEditPanel.hiddenValue.getValue();
		                    else
		                        recordData1Value = this.calculateFormulaItemsEditPanel.textfieldValue.getValue();
		                    var recordData1 = {
		                        ID: new Date() - 1000,
		                        ExpressionID: '',
		                        Level: level,
		                        RenderOrder: '',
		                        RenderType: '0',
		                        Value: recordData1Value,
		                        ValueType: this.calculateFormulaItemsEditPanel.comboValue.getValue(),
		                        ReturnValueType: '3',
		                        ValueRemark: this.calculateFormulaItemsEditPanel.textfieldValue.getValue(),
		                        RowIndex: count + 1
		                    };
		                    var newRecord1 = new store.recordType(recordData1);
		                    this.gridStoreCalculateFormula.add(newRecord1);
		                    this.calculateFormulaItemsEditWin.hide();
		                }, scope: this
		            },
		            { text: '取消',
		                handler: function () {
		                    this.calculateFormulaItemsEditWin.hide();
		                }, scope: this
		            }
	            ]
            });
        }
        this.calculateFormulaItemsEditPanel.form.reset();
        this.calculateFormulaItemsEditPanel.textfieldValue.setDisabled(true);
        this.calculateFormulaItemsEditPanel.calculateOperation.clearInvalid();
        this.calculateFormulaItemsEditPanel.textfieldValue.clearInvalid();
        return this.calculateFormulaItemsEditWin;
    },
    //条件项窗体新增时候确定按钮事件
    functionCalculateFormulaEditWinOk: function () {
        if (!this.gridStoreCalculateFormula || this.gridStoreCalculateFormula.getCount() == 0 || !this.calculateFormulaEditWin.comboTypeOp.isValid()) {
            this.App.setAlert('系统提示', '至少有一条数据!');
            return
        }
        var count = this.formatFormulaStoreCalculate.getCount();
        var store = this.gridStoreCalculateFormula;
        var recordData = {
            ID: new Date() - 1000,
            ExpressionID: '',
            Level: '0',
            RenderOrder: '',
            RenderType: '1',
            Value: this.calculateFormulaEditWin.comboTypeOp.getValue(),
            ValueType: '2',
            ReturnValueType: '1',
            ValueRemark: this.calculateFormulaEditWin.comboTypeOp.getValue(),
            RowIndex: count + 1
        };
        var newRecord = new store.recordType(recordData);
        if (!this.calculateFormulaEditWin.comboTypeOp.disabled) {
            this.editFormulaStore.add(newRecord);
        }
        this.editFormulaStore.add(this.gridStoreCalculateFormula.getRange());
        this.initformatFormulaStoreCalculateReload();
        this.calculateFormulaEditWin.hide();
    },
    //条件项窗体编辑时候确定按钮事件
    functionCalculateFormulaUpdateWinOk: function () {
        if (!this.gridStoreCalculateFormula || this.gridStoreCalculateFormula.getCount() == 0) {
            this.App.setAlert('系统提示', '至少有一条数据!');
            return
        }
        var record = this.rightFormulaGrid.getSelectionModel().getSelected();
        if (!record) {
            return
        }
        var RowIndex = parseInt(record.get('RowIndex'));
        var records = this.editFormulaStore.getRange();
        for (var i = records.length - 1; i >= 0; i--) {
            var index = parseInt(records[i].get('RowIndex'));
            if (index == RowIndex) {
                this.editFormulaStore.removeAt(i);
            }
        }
        var j = 0; //默认插入行数为0
        if (!this.calculateFormulaEditWin.comboTypeOp.disabled) {
            j = this.editFormulaStore.findExact('RowIndex', (RowIndex - 1).toString());
            var rd = this.editFormulaStore.getAt(j);
            rd.set('ValueRemark', this.calculateFormulaEditWin.comboTypeOp.getValue());
            rd.set('Value', this.calculateFormulaEditWin.comboTypeOp.getValue());
            j++;
        }
        this.editFormulaStore.insert(j, this.gridStoreCalculateFormula.getRange().reverse());
        this.initformatFormulaStoreCalculateReload();
        this.calculateFormulaEditWin.hide();
    },
    //计算公式新增按钮弹出的窗体中的编辑按钮的窗体
    initCalculateFormulaItemsUpdateWin: function () {
        if (!this.calculateFormulaItemsUpdateWin) {
            var comboType = new Ext.form.ComboBox({
                typeAhead: true,
                triggerAction: 'all',
                lazyRender: true,
                mode: 'local',
                editable: false,
                width: 200,
                allowBlank: false,
                fieldLabel: '运算符',
                ref: 'calculateOperation',
                store: new Ext.data.JsonStore({
                    fields: ['Code', 'Name'],
                    data: [{ Code: '+', Name: '+' },
			            { Code: '-', Name: '-' },
			            { Code: '*', Name: '*' },
			            { Code: '/', Name: '/' },
			            { Code: '%', Name: '%' }
			        ]
                }),
                valueField: 'Code',
                displayField: 'Name'
            });
            var comboValue = new Ext.form.ComboBox({
                typeAhead: true,
                triggerAction: 'all',
                lazyRender: true,
                mode: 'local',
                editable: false,
                width: 200,
                ref: 'comboValue',
                //	            emptyText:'值类型',
                fieldLabel: '值类型',
                allowBlank: false,
                store: new Ext.data.JsonStore({
                    fields: ['Code', 'Name'],
                    data: [
			            { Code: '1', Name: '数值' },
			            { Code: '5', Name: '环境变量' },
			            { Code: '6', Name: '流程全局变量' },
			            { Code: '7', Name: '节点局部变量' },
			            { Code: '8', Name: '表单字段' },
			            { Code: '9', Name: 'SQL语句' },
			            { Code: '10', Name: '函数' },
			            { Code: '11', Name: '公式' }
			        ]
                }),
                valueField: 'Code',
                displayField: 'Name',
                listeners: {
                    'select': function (combo, record, index) {
                        if (index == 4 || index == 6 || index == 7) {
                            this.calculateFormulaItemsUpdatePanel.textfieldValue.setDisabled(true);
                            this.calculateFormulaItemsUpdatePanel.buttonValue.setDisabled(false);
                        } else {
                            this.calculateFormulaItemsUpdatePanel.textfieldValue.setDisabled(false);
                            this.calculateFormulaItemsUpdatePanel.buttonValue.setDisabled(true);
                        }
                        this.calculateFormulaItemsUpdatePanel.textfieldValue.setValue();
                        this.calculateFormulaItemsUpdatePanel.hiddenValue.setValue();
                    },
                    scope: this
                }
            });
            this.calculateFormulaItemsUpdatePanel = new Ext.form.FormPanel({
                layout: 'form',
                border: false,
                bodyStyle: "padding:10px 0px 0px 10px",
                labelWidth: 50,
                items: [
	                comboType,
	                { layout: 'column', border: false,
	                    items: [
	                            { layout: 'form', border: false, items: [{ xtype: 'textfield', fieldLabel: '值', disabled: true, allowBlank: false, ref: '../../textfieldValue', width: 178 },
	                            { xtype: 'hidden', ref: '../../hiddenValue'}]
	                            },
	                            { xtype: 'button', ref: '../buttonValue', disabled: true, iconCls: 'cog_editcon',
	                                handler: function () {
	                                    var value = comboValue.getValue();
	                                    if (value == 8) {
	                                        this.initTextfieldSelectorWindow(this.calculateFormulaItemsUpdatePanel.textfieldValue, this.calculateFormulaItemsUpdatePanel.hiddenValue).show();
	                                    } else if (value == 10) {
	                                        this.initProcedureWindow(this.calculateFormulaItemsUpdatePanel.textfieldValue, this.calculateFormulaItemsUpdatePanel.hiddenValue);
	                                    } else if (value == 11) {
	                                        this.initFormulaWindow(this.calculateFormulaItemsUpdatePanel.textfieldValue, this.calculateFormulaItemsUpdatePanel.hiddenValue);
	                                    }
	                                }, scope: this
	                            }
	                ]
	                },
	                comboValue
	            ]
            });
            this.calculateFormulaItemsUpdateWin = new Ext.Window({
                title: '添加',
                width: 300,
                height: 160,
                layout: 'fit',
                closeAction: 'hide',
                border: false,
                resizable: false, //不可以随意改变大小
                modal: 'true', //弹出模态窗体
                buttonAlign: "center",
                bodyStyle: "padding:0 0 0 0",
                items: [{
                    xtype: 'panel',
                    layout: 'fit',
                    items: this.calculateFormulaItemsUpdatePanel
                }],
                buttons: [
		            { text: '确定',
		                handler: function () {
		                    if (!this.calculateFormulaItemsUpdatePanel.form.isValid()) {
		                        return
		                    }
		                    var winRecord = this.calculateFormulaEditWin.gridPanelCalculateFormula.getSelectionModel().getSelected();
		                    var index = this.gridStoreCalculateFormula.findExact('ID', winRecord.get('ID'));
		                    winRecord.set('ValueRemark', this.calculateFormulaItemsUpdatePanel.textfieldValue.getValue());
		                    var ValueType = this.calculateFormulaItemsUpdatePanel.comboValue.getValue();
		                    if (ValueType == '8' || ValueType == '10' || ValueType == '11')
		                        winRecord.set('Value', this.calculateFormulaItemsUpdatePanel.hiddenValue.getValue());
		                    else
		                        winRecord.set('Value', this.calculateFormulaItemsUpdatePanel.textfieldValue.getValue());
		                    winRecord.set('ValueType', ValueType);
		                    if (index != 0) {
		                        var rd = this.gridStoreCalculateFormula.getAt(index - 1);
		                        rd.set('ValueRemark', this.calculateFormulaItemsUpdatePanel.calculateOperation.getValue());
		                        rd.set('Value', this.calculateFormulaItemsUpdatePanel.calculateOperation.getValue());
		                    }
		                    this.calculateFormulaItemsUpdateWin.hide();
		                }, scope: this
		            },
		            { text: '取消',
		                handler: function () {
		                    this.calculateFormulaItemsUpdateWin.hide();
		                }, scope: this
		            }
	            ]
            });
        }
        this.calculateFormulaItemsUpdatePanel.form.reset();
        this.calculateFormulaItemsUpdatePanel.textfieldValue.setDisabled(true);
        this.calculateFormulaItemsUpdatePanel.calculateOperation.clearInvalid();
        this.calculateFormulaItemsUpdatePanel.textfieldValue.clearInvalid();
        return this.calculateFormulaItemsUpdateWin;
    },
    //计算公式新增按钮弹出的窗体
    initCalculateFormulaEditWin: function () {
        if (!this.calculateFormulaEditWin) {

            this.gridStoreCalculateFormula = new Ext.data.JsonStore({
                fields: ['ID', 'ExpressionID', 'Level', 'RenderOrder', 'RenderType', 'Value', 'ValueType', 'ReturnValueType', 'ValueRemark', 'RowIndex']
            });
            var selModel = new Ext.grid.CheckboxSelectionModel({ checkOnly: false, singleSelect: true }); //checkOnly:true,
            var colModel = new Ext.grid.ColumnModel([
	            selModel,
	            { header: 'ID', dataIndex: 'ID', hidden: true },
	            { header: 'ExpressionID', dataIndex: 'ExpressionID', hidden: true },
	            { header: '实际值', dataIndex: 'Value', width: 200, sortable: true },
	            { header: '描述值', dataIndex: 'ValueRemark', width: 250, sortable: true },
	            { header: '值类型', dataIndex: 'ValueType', width: 200, sortable: true },
	            { header: 'RowIndex', dataIndex: 'RowIndex', width: 200, hidden: true }
	        ]);
            var gridPanelCalculateFormula = new Ext.grid.GridPanel({
                store: this.gridStoreCalculateFormula,
                selModel: selModel,
                colModel: colModel,
                border: false,
                stripeRows: true, //交替
                loadMask: true, //遮罩
                viewConfig: { forceFit: true }, //自动间距
                ref: '../gridPanelCalculateFormula',
                tbar: [
		            '->',
	                { xtype: 'button', iconCls: "addicon", text: '新增', ref: '../calculateFormulaWinTbarAdd',
	                    handler: function () {
	                        this.initCalculateFormulaItemsEditWin().show();
	                        if (this.gridStoreCalculateFormula && this.gridStoreCalculateFormula.getCount() > 0) {
	                            this.calculateFormulaItemsEditPanel.calculateOperation.setDisabled(false);
	                        } else {
	                            this.calculateFormulaItemsEditPanel.calculateOperation.setDisabled(true);
	                        }

	                    }, scope: this
	                },
		            { xtype: 'button', iconCls: "editicon", text: '编辑', ref: '../calculateFormulaWinTbarEdit', disabled: true,
		                handler: function () {
		                    var record = gridPanelCalculateFormula.getSelectionModel().getSelected();
		                    if (!record) {
		                        return
		                    }
		                    this.initCalculateFormulaItemsUpdateWin().show();
		                    var index = this.gridStoreCalculateFormula.findExact('ID', record.get('ID'));
		                    if (index == 0) {
		                        this.calculateFormulaItemsUpdatePanel.calculateOperation.setDisabled(true);
		                    } else {
		                        var rd = this.gridStoreCalculateFormula.getAt(index - 1);
		                        this.calculateFormulaItemsUpdatePanel.calculateOperation.setValue(rd.get('Value'));
		                        this.calculateFormulaItemsUpdatePanel.calculateOperation.setDisabled(false);
		                    }
		                    this.calculateFormulaItemsUpdatePanel.textfieldValue.setValue(record.get('ValueRemark'));
		                    this.calculateFormulaItemsUpdatePanel.hiddenValue.setValue(record.get('Value'));
		                    this.calculateFormulaItemsUpdatePanel.comboValue.setValue(record.get('ValueType'));
		                    var ValueType = record.get('ValueType')
		                    if (ValueType == '8' || ValueType == '10' || ValueType == '11') {
		                        this.calculateFormulaItemsUpdatePanel.textfieldValue.setDisabled(true);
		                        this.calculateFormulaItemsUpdatePanel.buttonValue.setDisabled(false);
		                    } else {
		                        this.calculateFormulaItemsUpdatePanel.textfieldValue.setDisabled(false);
		                        this.calculateFormulaItemsUpdatePanel.buttonValue.setDisabled(true);
		                    }
		                }, scope: this
		            },
		            { xtype: 'button', iconCls: "deleteicon", text: '删除', ref: '../calculateFormulaWinTbarDel', disabled: true,
		                handler: function () {
		                    var record = gridPanelCalculateFormula.getSelectionModel().getSelected();
		                    if (!record) {
		                        return
		                    }
		                    var index = this.gridStoreCalculateFormula.findExact('ID', record.get('ID'));
		                    if (index == 0) {
		                        this.gridStoreCalculateFormula.removeAt(index + 1);
		                        this.gridStoreCalculateFormula.removeAt(index);
		                    } else {
		                        this.gridStoreCalculateFormula.removeAt(index);
		                        this.gridStoreCalculateFormula.removeAt(index - 1);
		                    }
		                }, scope: this
		            },
		            { xtype: 'button', iconCls: "alldeleteicon", text: '删除全部', ref: '../calculateFormulaWinTbarDelAll',
		                handler: function () {
		                    this.gridStoreCalculateFormula.removeAll();
		                    gridPanelCalculateFormula.calculateFormulaWinTbarEdit.setDisabled(true);
		                    gridPanelCalculateFormula.calculateFormulaWinTbarDel.setDisabled(true);
		                }, scope: this
		            }
                //		            ,{xtype: 'button',iconCls:"x-btn-text x-tbar-loading",text: '刷新',
                //		                handler:function(){
                //		            },scope:this}
		        ],
                listeners: {
                    'rowclick': function (mygrid, index, e) {
                        if (index % 2 == 0) {
                            gridPanelCalculateFormula.calculateFormulaWinTbarEdit.setDisabled(false);
                            gridPanelCalculateFormula.calculateFormulaWinTbarDel.setDisabled(false);
                        } else {
                            gridPanelCalculateFormula.calculateFormulaWinTbarEdit.setDisabled(true);
                            gridPanelCalculateFormula.calculateFormulaWinTbarDel.setDisabled(true);
                        }
                    },
                    scope: this
                }
            });
            //		    //选中
            //		    selModel.on('rowselect',function(e,rowIndex,record){
            //			    gridPanelCalculateFormula.calculateFormulaWinTbarEdit.setDisabled(false);
            //				gridPanelCalculateFormula.calculateFormulaWinTbarDel.setDisabled(false);
            //		    },this);
            //		    //反选
            //	        selModel.on('rowdeselect',function(e,rowIndex,record){
            //			    gridPanelCalculateFormula.calculateFormulaWinTbarEdit.setDisabled(true);
            //				gridPanelCalculateFormula.calculateFormulaWinTbarDel.setDisabled(true);
            //		    },this);
            this.calculateFormulaEditWin = new Ext.Window({
                title: '条件项',
                width: 365,
                height: 240,
                layout: 'fit',
                closeAction: 'hide',
                border: false,
                resizable: false, //不可以随意改变大小
                modal: 'true', //弹出模态窗体
                buttonAlign: "center",
                bodyStyle: "padding:0 0 0 0",
                items: [{
                    xtype: 'panel',
                    layout: 'fit',
                    ref: 'calculateFormulaEditWinTbar',
                    tbar: this.initCalculateFormulaEditWinTbar(),
                    items: gridPanelCalculateFormula
                }],
                buttons: [
		            { text: '确定',
		                handler: function () {
		                    if (this.CalculateFormulaIsAddOrEdit)
		                        this.functionCalculateFormulaEditWinOk();
		                    else
		                        this.functionCalculateFormulaUpdateWinOk();
		                }, scope: this
		            },
		            { text: '取消',
		                handler: function () {
		                    this.calculateFormulaEditWin.hide();
		                }, scope: this
		            }
	            ]
            });
        }
        this.calculateFormulaEditWin.gridPanelCalculateFormula.calculateFormulaWinTbarEdit.setDisabled(true);
        this.calculateFormulaEditWin.gridPanelCalculateFormula.calculateFormulaWinTbarDel.setDisabled(true);
        this.calculateFormulaEditWin.comboTypeOp.setValue();
        this.gridStoreCalculateFormula.removeAll();
        return this.calculateFormulaEditWin;
    },
    initFormulaUpdateWin: function () {
        if (!this.formulaUpdateWin) {
            var comboType = new Ext.form.ComboBox({
                typeAhead: true,
                triggerAction: 'all',
                lazyRender: true,
                mode: 'local',
                editable: false,
                width: 333,
                allowBlank: false,
                name: 'Value0',
                ref: '../../booleanOperation',
                store: new Ext.data.JsonStore({
                    fields: ['Code', 'Name'],
                    data: [{ Code: '&&', Name: 'and' },
			            { Code: '||', Name: 'or' }
			        ]
                }),
                valueField: 'Code',
                displayField: 'Name'
            });
            var comboValue1 = new Ext.form.ComboBox({
                typeAhead: true,
                triggerAction: 'all',
                lazyRender: true,
                mode: 'local',
                editable: false,
                width: 90,
                ref: '../../comboValue1',
                emptyText: '变量类型',
                allowBlank: false,
                name: 'ValueType1',
                store: new Ext.data.JsonStore({
                    fields: ['Code', 'Name'],
                    data: [
			            { Code: '2', Name: '文本' },
			            { Code: '5', Name: '环境变量' },
			            { Code: '6', Name: '流程全局变量' },
			            { Code: '7', Name: '节点局部变量' },
			            { Code: '8', Name: '表单字段' },
			            { Code: '9', Name: 'SQL语句' },
			            { Code: '10', Name: '函数' },
			            { Code: '11', Name: '公式' }
			        ]
                }),
                valueField: 'Code',
                displayField: 'Name',
                listeners: {
                    'select': function (combo, record, index) {
                        var code = record.get('Code');
                        if (code == '8' || code == '10' || code == '11') {
                            this.formulaUpdatePanel.textfieldValue1.setDisabled(true);
                            this.formulaUpdatePanel.buttonValue1.setDisabled(false);
                        } else {
                            this.formulaUpdatePanel.textfieldValue1.setDisabled(false);
                            this.formulaUpdatePanel.buttonValue1.setDisabled(true);
                        }
                        this.formulaUpdatePanel.textfieldValue1.setValue();
                        this.formulaUpdatePanel.hiddenValue1.setValue();
                    },
                    //	                'change':function(){
                    //	                    this.formulaUpdatePanel.textfieldValue1.setValue();
                    //	                    this.formulaUpdatePanel.hiddenValue1.setValue();
                    //	                },
                    scope: this
                }
            });
            var comboValue2 = new Ext.form.ComboBox({
                typeAhead: true,
                triggerAction: 'all',
                lazyRender: true,
                mode: 'local',
                editable: false,
                width: 90,
                ref: '../../comboValue2',
                emptyText: '变量类型',
                allowBlank: false,
                name: 'ValueType3',
                store: new Ext.data.JsonStore({
                    fields: ['Code', 'Name'],
                    data: [
			            { Code: '2', Name: '文本' },
			            { Code: '5', Name: '环境变量' },
			            { Code: '6', Name: '流程全局变量' },
			            { Code: '7', Name: '节点局部变量' },
			            { Code: '8', Name: '表单字段' },
			            { Code: '9', Name: 'SQL语句' },
			            { Code: '10', Name: '函数' },
			            { Code: '11', Name: '公式' }
			        ]
                }),
                valueField: 'Code',
                displayField: 'Name',
                listeners: {
                    'select': function (combo, record, index) {
                        var code = record.get('Code');
                        if (code == '8' || code == '10' || code == '11') {
                            this.formulaUpdatePanel.textfieldValue2.setDisabled(true);
                            this.formulaUpdatePanel.buttonValue2.setDisabled(false);
                        } else {
                            this.formulaUpdatePanel.textfieldValue2.setDisabled(false);
                            this.formulaUpdatePanel.buttonValue2.setDisabled(true);
                        }
                        this.formulaUpdatePanel.textfieldValue2.setValue();
                        this.formulaUpdatePanel.hiddenValue2.setValue();
                    },
                    //	                'change':function(){
                    //	                    this.formulaUpdatePanel.textfieldValue2.setValue();
                    //	                    this.formulaUpdatePanel.hiddenValue2.setValue();
                    //	                },
                    scope: this
                }
            });
            var combo = new Ext.form.ComboBox({
                typeAhead: true,
                triggerAction: 'all',
                lazyRender: true,
                mode: 'local',
                ref: '../../comparisonOperation',
                editable: false,
                width: 333,
                allowBlank: false,
                name: 'Value2',
                store: new Ext.data.JsonStore({
                    fields: ['Code', 'Name'],
                    data: [{ Code: '1', Name: '==' },
			            { Code: '2', Name: '<' },
			            { Code: '3', Name: '<=' },
			            { Code: '4', Name: '>' },
			            { Code: '5', Name: '>=' },
			            { Code: '6', Name: '!=' }
			        ]
                }),
                valueField: 'Name',
                displayField: 'Name'
            });
            this.formulaUpdatePanel = new Ext.form.FormPanel({
                layout: 'form',
                border: false,
                bodyStyle: "padding:5 0 0 5",
                labelWidth: 0.1,
                items: [
	                { xtype: 'label', html: '&nbsp;布尔运算符:' },
	                { layout: 'column', border: false, items: [{ layout: 'form', border: false, items: comboType}] },
	                { xtype: 'label', html: '&nbsp;变量1:' },
	                { layout: 'column', border: false,
	                    items: [
	                            { layout: 'form', border: false, items: [{ xtype: 'textfield', name: 'ValueRemark1', disabled: true, allowBlank: false, ref: '../../textfieldValue1', width: 120 }, { xtype: 'hidden', name: 'Value1', ref: '../../hiddenValue1'}] },
	                            { xtype: 'button', text: '...', ref: '../buttonValue1', disabled: true,
	                                handler: function () {
	                                    var value = comboValue1.getValue();
	                                    if (value == 8) {
	                                        this.initTextfieldSelectorWindow(this.formulaUpdatePanel.textfieldValue1, this.formulaUpdatePanel.hiddenValue1).show();
	                                    } else if (value == 10) {
	                                        this.initProcedureWindow(this.formulaUpdatePanel.textfieldValue1, this.formulaUpdatePanel.hiddenValue1);
	                                    } else if (value == 11) {
	                                        this.initFormulaWindow(this.formulaUpdatePanel.textfieldValue1, this.formulaUpdatePanel.hiddenValue1);
	                                    }
	                                }, scope: this
	                            },
	                            { layout: 'form', border: false, items: comboValue1 },
	                            { layout: 'form', border: false, items: this.initComboReturnType('../../comboReturnType1', 'ReturnValueType1') }
	                ]
	                },
	                { xtype: 'label', html: '&nbsp;比较运算符:' },
	                { layout: 'column', border: false, items: [{ layout: 'form', border: false, items: combo}] },
	                { xtype: 'label', html: '&nbsp;变量2:' },
	                { layout: 'column', border: false,
	                    items: [
	                            { layout: 'form', border: false, items: [{ xtype: 'textfield', name: 'ValueRemark3', disabled: true, allowBlank: false, ref: '../../textfieldValue2', width: 120 }, { xtype: 'hidden', name: 'Value3', ref: '../../hiddenValue2'}] },
	                            { xtype: 'button', text: '...', ref: '../buttonValue2', disabled: true,
	                                handler: function () {
	                                    var value = comboValue2.getValue();
	                                    if (value == 8) {
	                                        this.initTextfieldSelectorWindow(this.formulaUpdatePanel.textfieldValue2, this.formulaUpdatePanel.hiddenValue2).show();
	                                    } else if (value == 10) {
	                                        this.initProcedureWindow(this.formulaUpdatePanel.textfieldValue2, this.formulaUpdatePanel.hiddenValue2);
	                                    } else if (value == 11) {
	                                        this.initFormulaWindow(this.formulaUpdatePanel.textfieldValue2, this.formulaUpdatePanel.hiddenValue2);
	                                    }
	                                }, scope: this
	                            },
	                            { layout: 'form', border: false, items: comboValue2 },
	                            { layout: 'form', border: false, items: this.initComboReturnType('../../comboReturnType2', 'ReturnValueType3') }
	                ]
	                }
	            ]
            });

            this.formulaUpdateWin = new Ext.Window({
                title: '编辑',
                width: 365,
                height: 240,
                layout: 'fit',
                closeAction: 'hide',
                border: false,
                resizable: false, //不可以随意改变大小
                modal: 'true', //弹出模态窗体
                buttonAlign: "center",
                bodyStyle: "padding:0 0 0 0",
                items: [{
                    xtype: 'panel',
                    layout: 'fit',
                    items: this.formulaUpdatePanel
                }],
                buttons: [
		            { text: '确定',
		                handler: function () {
		                    if (!this.formulaUpdatePanel.form.isValid()) {
		                        return
		                    }
		                    var record = this.rightFormulaGrid.getSelectionModel().getSelected();
		                    if (!record) {
		                        return
		                    }
		                    var index = this.editFormulaStore.findExact('ID', record.get('ID1'));
		                    var rd = this.editFormulaStore.getAt(index);
		                    if (this.formulaUpdatePanel.comboValue1.getValue() == '8' || this.formulaUpdatePanel.comboValue1.getValue() == '10' || this.formulaUpdatePanel.comboValue1.getValue() == '11')
		                        rd.set('Value', this.formulaUpdatePanel.hiddenValue1.getValue());
		                    else
		                        rd.set('Value', this.formulaUpdatePanel.textfieldValue1.getValue());
		                    rd.set('ValueType', this.formulaUpdatePanel.comboValue1.getValue());
		                    rd.set('ReturnValueType', this.formulaUpdatePanel.comboReturnType1.getValue());
		                    rd.set('ValueRemark', this.formulaUpdatePanel.textfieldValue1.getValue());

		                    var rd2 = this.editFormulaStore.getAt(index + 1);
		                    rd2.set('Value', this.formulaUpdatePanel.comparisonOperation.getValue());
		                    rd2.set('ValueType', '2');
		                    rd2.set('ReturnValueType', '1');
		                    rd2.set('ValueRemark', this.formulaUpdatePanel.comparisonOperation.getValue());

		                    var rd3 = this.editFormulaStore.getAt(index + 2);
		                    if (this.formulaUpdatePanel.comboValue2.getValue() == '8' || this.formulaUpdatePanel.comboValue2.getValue() == '10' || this.formulaUpdatePanel.comboValue2.getValue() == '11')
		                        rd3.set('Value', this.formulaUpdatePanel.hiddenValue2.getValue());
		                    else
		                        rd3.set('Value', this.formulaUpdatePanel.textfieldValue2.getValue());
		                    rd3.set('ValueType', this.formulaUpdatePanel.comboValue2.getValue());
		                    rd3.set('ReturnValueType', this.formulaUpdatePanel.comboReturnType2.getValue());
		                    rd3.set('ValueRemark', this.formulaUpdatePanel.textfieldValue2.getValue());

		                    if (!this.formulaUpdatePanel.booleanOperation.disabled) {
		                        var rd0 = this.editFormulaStore.getAt(index - 1);
		                        rd0.set('Value', this.formulaUpdatePanel.booleanOperation.getValue());
		                        rd0.set('ValueType', '2');
		                        rd0.set('ReturnValueType', '1');
		                        rd0.set('ValueRemark', this.formulaUpdatePanel.booleanOperation.getValue());
		                    }

		                    this.initformatFormulaStoreReload();
		                    this.formulaUpdateWin.hide();
		                }, scope: this
		            },
		            { text: '取消',
		                handler: function () {
		                    this.formulaUpdateWin.hide();
		                }, scope: this
		            }
	            ]
            });
        }
        this.formulaUpdatePanel.form.reset();
        return this.formulaUpdateWin;
    },
    //计算公式新增按钮弹出的窗体的tbar
    initCalculateFormulaEditWinTbar: function () {
        var comboTypeOp = new Ext.form.ComboBox({
            typeAhead: true,
            triggerAction: 'all',
            lazyRender: true,
            mode: 'local',
            editable: false,
            width: 150,
            allowBlank: false,
            fieldLabel: '运算符',
            ref: '../../comboTypeOp',
            store: new Ext.data.JsonStore({
                fields: ['Code', 'Name'],
                data: [{ Code: '+', Name: '+' },
		            { Code: '-', Name: '-' },
		            { Code: '*', Name: '*' },
		            { Code: '/', Name: '/' },
		            { Code: '%', Name: '%' }
		        ]
            }),
            valueField: 'Code',
            displayField: 'Name'
        });
        var bar = ['->', '运算符:', comboTypeOp];
        return bar;
    },
    //布尔公式点击新增按钮事件
    functionBooleanWinTbarAdd: function () {
        this.initFormulaEditWin().show();
        if (this.editFormulaStore && this.editFormulaStore.getCount() > 0) {
            this.formulaEditPanel.booleanOperation.setDisabled(false);
        } else {
            this.formulaEditPanel.booleanOperation.setDisabled(true);
        }
    },
    //计算公式点击新增按钮事件
    functionCalculateWinTbarAdd: function () {
        this.initCalculateFormulaEditWin().show();
        if (this.formatFormulaStoreCalculate && this.formatFormulaStoreCalculate.getCount() > 0) {
            this.calculateFormulaEditWin.comboTypeOp.clearInvalid();
            this.calculateFormulaEditWin.comboTypeOp.setDisabled(false);
        } else {
            this.calculateFormulaEditWin.comboTypeOp.clearInvalid();
            this.calculateFormulaEditWin.comboTypeOp.setDisabled(true);
        }
    },
    //布尔公式点击编辑按钮事件
    functionBooleanWinTbarEdit: function () {
        this.initFormulaUpdateWin().show();
        var record = this.rightFormulaGrid.getSelectionModel().getSelected();
        this.formulaUpdatePanel.form.loadRecord(record);
        var index = this.editFormulaStore.findExact('ID', record.get('ID1'));
        var rd = this.editFormulaStore.getAt(index - 1);
        if (rd) {
            this.formulaUpdatePanel.booleanOperation.setValue(rd.get('Value'));
            this.formulaUpdatePanel.booleanOperation.setDisabled(false);
        }
        else {
            this.formulaUpdatePanel.booleanOperation.setDisabled(true);
        }
        var rdValue1 = this.editFormulaStore.getAt(index);
        var valueType1 = rdValue1.get('ValueType');
        if (valueType1 == '8' || valueType1 == '10' || valueType1 == '11') {
            this.formulaUpdatePanel.textfieldValue1.setDisabled(true);
            this.formulaUpdatePanel.buttonValue1.setDisabled(false);
        } else {
            this.formulaUpdatePanel.textfieldValue1.setDisabled(false);
            this.formulaUpdatePanel.buttonValue1.setDisabled(true);
        }
        var rdValue2 = this.editFormulaStore.getAt(index + 2);
        var valueType2 = rdValue2.get('ValueType');
        if (valueType2 == '8' || valueType2 == '10' || valueType2 == '11') {
            this.formulaUpdatePanel.textfieldValue2.setDisabled(true);
            this.formulaUpdatePanel.buttonValue2.setDisabled(false);
        } else {
            this.formulaUpdatePanel.textfieldValue2.setDisabled(false);
            this.formulaUpdatePanel.buttonValue2.setDisabled(true);
        }
    },
    //布尔公式点击删除按钮事件
    functionBooleanWinTbarDel: function () {
        var record = this.rightFormulaGrid.getSelectionModel().getSelected();
        var index = this.editFormulaStore.findExact('ID', record.get('ID1'));
        this.editFormulaStore.removeAt(index);
        this.editFormulaStore.removeAt(index);
        this.editFormulaStore.removeAt(index);
        if (index > 0)
            this.editFormulaStore.removeAt(index - 1);
        else
            this.editFormulaStore.removeAt(index);
        this.editFormulaStore.each(function (rd, rowIndex) {
            rd.set('RenderOrder', rowIndex + 1);
        }, this);
        this.initformatFormulaStoreReload();
    },
    //计算公式点击删除按钮事件
    functionCalculateWinTbarDel: function () {
        var record = this.rightFormulaGrid.getSelectionModel().getSelected();
        var selectRowIndex = parseInt(record.get('RowIndex'));
        var index = this.editFormulaStore.findExact('RowIndex', record.get('RowIndex'));
        if (index > 0)
            this.editFormulaStore.removeAt(index - 1);
        else {
            var nextindex = this.editFormulaStore.findExact('RowIndex', selectRowIndex + 1);
            this.editFormulaStore.removeAt(nextindex);
        }
        var records = this.editFormulaStore.getRange();
        for (var i = records.length - 1; i >= 0; i--) {
            var currentRowIndex = parseInt(records[i].get('RowIndex'));
            if (currentRowIndex == selectRowIndex)
                this.editFormulaStore.removeAt(i);
            else if (currentRowIndex > selectRowIndex)
                records[i].set('RowIndex', currentRowIndex - 2);
        }
        this.initformatFormulaStoreCalculateReload();
    },
    //布尔公式点击左移按钮事件
    functionBooleanWinTbarLeft: function () {
        var record = this.rightFormulaGrid.getSelectionModel().getSelected();
        var index = this.editFormulaStore.findExact('ID', record.get('ID1'));
        if (!record) {
            return
        }
        var index = this.editFormulaStore.findExact('ID', record.get('ID1'));
        var rd = this.editFormulaStore.getAt(index);
        var booleanLevel = parseInt(rd.get('Level')) - 1;
        rd.set('Level', booleanLevel);
        for (var i = index - 3; i < index; i++) {
            var rd = this.editFormulaStore.getAt(i);
            var level = parseInt(rd.get('Level')) - 1;
            var rdNext = this.editFormulaStore.getAt(index - 4);
            var levelNext = 0;
            if (rdNext) {
                levelNext = parseInt(rdNext.get('Level'));
            }
            if (level > levelNext + 1)
                rd.set('Level', level);
        }
        for (var i = index + 1; i <= index + 3; i++) {
            var rd = this.editFormulaStore.getAt(i);
            var level = parseInt(rd.get('Level')) - 1;
            var rdNext = this.editFormulaStore.getAt(index + 4);
            var levelNext = 0;
            if (rdNext) {
                levelNext = parseInt(rdNext.get('Level'));
            }
            if (level > levelNext + 1)
                rd.set('Level', level);
        }


        var index2 = this.formatFormulaStore.findExact('ID1', record.get('ID1'));
        var rd2 = this.formatFormulaStore.getAt(index2);
        var level2 = parseInt(rd2.get('Level1')) - 1;
        rd2.set('Level1', level2);
        if (level2 == 0) {
            this.rightFormulaGrid.formulaWinTbarLeft.setDisabled(true);
        } else {
            this.rightFormulaGrid.formulaWinTbarLeft.setDisabled(false);
        }


        var rd2_1 = this.formatFormulaStore.getAt(index2 - 1);
        var level2_1 = parseInt(rd2_1.get('Level1')) - 1;
        var rdTop = this.formatFormulaStore.getAt(index2 - 2);
        var levelTop = 0;
        if (rdTop) {
            levelTop = parseInt(rdTop.get('Level1'));
        }
        if (level2_1 > levelTop)
            rd2_1.set('Level1', level2_1);

        var rd2_2 = this.formatFormulaStore.getAt(index2 + 1);
        var level2_2 = parseInt(rd2_2.get('Level1')) - 1;
        var rdNext = this.formatFormulaStore.getAt(index2 + 2);
        var levelNext = 0;
        if (rdNext) {
            levelNext = parseInt(rdNext.get('Level1'));
        }
        if (level2_2 > levelNext)
            rd2_2.set('Level1', level2_2);
    },
    //计算公式点击左移按钮事件
    functionCalculateWinTbarLeft: function () {
        var record = this.rightFormulaGrid.getSelectionModel().getSelected();
        if (!record) {
            return
        }
        var index = this.formatFormulaStoreCalculate.findExact('RowIndex', record.get('RowIndex'));
        var rd = this.formatFormulaStoreCalculate.getAt(index);
        var level = parseInt(rd.get('Level')) - 1;
        rd.set('Level', level);
        if (level == 0) {
            this.rightFormulaGrid.formulaWinTbarLeft.setDisabled(true);
        } else {
            this.rightFormulaGrid.formulaWinTbarLeft.setDisabled(false);
        }

        var rd1 = this.formatFormulaStoreCalculate.getAt(index - 1);
        var level1 = parseInt(rd1.get('Level')) - 1;
        var rd1_Top = this.formatFormulaStoreCalculate.getAt(index - 2);
        var level1_Top = 0;
        if (rd1_Top) {
            level1_Top = parseInt(rd1_Top.get('Level'));
        }
        if (level1 > level1_Top)
            rd1.set('Level', level1);

        var rd2 = this.formatFormulaStoreCalculate.getAt(index + 1);
        var level2 = parseInt(rd2.get('Level')) - 1;
        var rd2_Next = this.formatFormulaStoreCalculate.getAt(index + 2);
        var level2_Next = 0;
        if (rd2_Next) {
            level2_Next = parseInt(rd2_Next.get('Level'));
        }
        if (level2 > level2_Next)
            rd2.set('Level', level2);

        var indexop = this.editFormulaStore.findExact('RowIndex', record.get('RowIndex'));
        var rdop = this.editFormulaStore.getAt(indexop);
        var levelop = parseInt(rdop.get('Level')) - 1;
        var rowIndex = parseInt(record.get('RowIndex'));
        var indexTop = this.editFormulaStore.findExact('RowIndex', (rowIndex - 1).toString());
        var rdTop = this.formatFormulaStore.getAt(indexTop);
        var indexNext = this.editFormulaStore.findExact('RowIndex', (rowIndex + 1).toString());
        var rdNext = this.formatFormulaStore.getAt(indexNext);
        this.editFormulaStore.each(function (r, i) {
            var myRowIndex = parseInt(r.get('RowIndex'));
            var l = parseInt(r.get('Level')) - 1;
            if (myRowIndex == rowIndex - 1) {
                var levelTop = 0;
                if (rdTop) {
                    levelTop = parseInt(rdTop.get('Level'));
                }
                if (l > levelop)
                    r.set('Level', l);
            } else if (myRowIndex == rowIndex) {
                r.set('Level', l);
            } else if (myRowIndex == rowIndex + 1) {
                var levelNext = 0;
                if (rdNext) {
                    levelNext = parseInt(rdNext.get('Level'));
                }
                if (l > levelNext)
                    r.set('Level', l);
            }
        }, this);
    },
    //布尔公式点击右移按钮事件
    functionBooleanWinTbarRight: function () {
        var record = this.rightFormulaGrid.getSelectionModel().getSelected();
        if (!record) {
            return
        }

        var index = this.editFormulaStore.findExact('ID', record.get('ID1'));
        var rd = this.editFormulaStore.getAt(index);
        var booleanLevel = parseInt(rd.get('Level')) + 1;
        rd.set('Level', booleanLevel);
        for (var i = index - 3; i < index; i++) {
            var rd = this.editFormulaStore.getAt(i);
            var level = parseInt(rd.get('Level')) + 1;
            if (level == booleanLevel + 1)
                rd.set('Level', level);
        }
        for (var i = index + 1; i <= index + 3; i++) {
            var rd = this.editFormulaStore.getAt(i);
            var level = parseInt(rd.get('Level')) + 1;
            if (level == booleanLevel + 1)
                rd.set('Level', level);
        }

        var index2 = this.formatFormulaStore.findExact('ID1', record.get('ID1'));
        var rd2 = this.formatFormulaStore.getAt(index2);
        var level2 = parseInt(rd2.get('Level1')) + 1;
        rd2.set('Level1', level2);
        if (level2 == 0) {
            this.rightFormulaGrid.formulaWinTbarLeft.setDisabled(true);
        } else {
            this.rightFormulaGrid.formulaWinTbarLeft.setDisabled(false);
        }

        var rd2_1 = this.formatFormulaStore.getAt(index2 - 1);
        var level2_1 = parseInt(rd2_1.get('Level1')) + 1;
        if (level2_1 == level2 + 1)
            rd2_1.set('Level1', level2_1);

        var rd2_2 = this.formatFormulaStore.getAt(index2 + 1);
        var level2_2 = parseInt(rd2_2.get('Level1')) + 1;
        if (level2_2 == level2 + 1)
            rd2_2.set('Level1', level2_2);
    },
    //计算公式点击右移按钮事件
    functionCalculateWinTbarRight: function () {
        var record = this.rightFormulaGrid.getSelectionModel().getSelected();
        if (!record) {
            return
        }
        var index = this.formatFormulaStoreCalculate.findExact('RowIndex', record.get('RowIndex')); //1
        var rd = this.formatFormulaStoreCalculate.getAt(index);
        var level = parseInt(rd.get('Level')) + 1; //1
        rd.set('Level', level);
        if (level == 0) {
            this.rightFormulaGrid.formulaWinTbarLeft.setDisabled(true);
        } else {
            this.rightFormulaGrid.formulaWinTbarLeft.setDisabled(false);
        }

        var rd1 = this.formatFormulaStoreCalculate.getAt(index - 1);
        var level1 = parseInt(rd1.get('Level')) + 1;
        if (level1 == level + 1)
            rd1.set('Level', level1);

        var rd2 = this.formatFormulaStoreCalculate.getAt(index + 1);
        var level2 = parseInt(rd2.get('Level')) + 1;
        if (level2 == level + 1)
            rd2.set('Level', level2);

        var indexop = this.editFormulaStore.findExact('RowIndex', record.get('RowIndex'));
        var rdop = this.editFormulaStore.getAt(indexop);
        var levelop = parseInt(rdop.get('Level')) + 1;
        var rowIndex = parseInt(record.get('RowIndex'));
        this.editFormulaStore.each(function (r, i) {
            var myRowIndex = parseInt(r.get('RowIndex'));
            if (myRowIndex == rowIndex - 1 || myRowIndex == rowIndex + 1) {
                var l = parseInt(r.get('Level')) + 1;
                if (levelop + 1 == l)
                    r.set('Level', l);
            }
            if (myRowIndex == rowIndex) {
                var l = parseInt(r.get('Level')) + 1;
                r.set('Level', l);
            }
        }, this);
    },
    //计算公式点击编辑按钮事件
    functionCalculateWinTbarEdit: function () {
        this.initCalculateFormulaEditWin().show();
        var record = this.rightFormulaGrid.getSelectionModel().getSelected(); //条件
        if (!record) {
            return
        }
        var RowIndex = parseInt(record.get('RowIndex'));
        this.editFormulaStore.each(function (rd, i) {
            var ri = parseInt(rd.get('RowIndex'));
            if (ri == RowIndex) {
                this.gridStoreCalculateFormula.add(rd);
            }
        }, this);
        if (RowIndex > 1) {
            var index = this.editFormulaStore.findExact('RowIndex', (RowIndex - 1).toString());
            var rd = this.editFormulaStore.getAt(index);
            this.calculateFormulaEditWin.comboTypeOp.setValue(rd.get('Value'));
            this.calculateFormulaEditWin.comboTypeOp.setDisabled(false);
        } else {
            this.calculateFormulaEditWin.comboTypeOp.setDisabled(true);
        }
        this.calculateFormulaEditWin.comboTypeOp.clearInvalid();
    },
    initFormulaWinTbar: function () {

        return [
	        '->',
	        { xtype: 'button', iconCls: "addicon", text: '新增', ref: '../formulaWinTbarAdd',
	            handler: function () {
	                if (!this.isCalculateOrBoolean)
	                    this.functionBooleanWinTbarAdd();
	                else
	                    this.functionCalculateWinTbarAdd();
	                this.CalculateFormulaIsAddOrEdit = true;
	            }, scope: this
	        },
		    { xtype: 'button', iconCls: "editicon", text: '编辑', ref: '../formulaWinTbarEdit', disabled: true,
		        handler: function () {
		            if (!this.isCalculateOrBoolean)
		                this.functionBooleanWinTbarEdit();
		            else
		                this.functionCalculateWinTbarEdit();
		            this.CalculateFormulaIsAddOrEdit = false;
		        }, scope: this
		    },
		    { xtype: 'button', iconCls: "deleteicon", text: '删除', ref: '../formulaWinTbarDel', disabled: true,
		        handler: function () {
		            if (!this.isCalculateOrBoolean)
		                this.functionBooleanWinTbarDel();
		            else
		                this.functionCalculateWinTbarDel();
		        }, scope: this
		    },
		    { xtype: 'button', iconCls: "alldeleteicon", text: '删除全部', ref: '../formulaWinTbarDelAll',
		        handler: function () {
		            this.editFormulaStore.removeAll();
		            if (!this.isCalculateOrBoolean)
		                this.initformatFormulaStoreReload();
		            else
		                this.initformatFormulaStoreCalculateReload();
		        }, scope: this
		    },
		    { xtype: 'button', iconCls: " x-btn-text x-tbar-page-prev", text: '左', ref: '../formulaWinTbarLeft', disabled: true,
		        handler: function () {
		            if (!this.isCalculateOrBoolean)
		                this.functionBooleanWinTbarLeft();
		            else
		                this.functionCalculateWinTbarLeft();
		        }, scope: this
		    },
		    { xtype: 'button', iconCls: " x-btn-text x-tbar-page-next", text: '右', ref: '../formulaWinTbarRight', disabled: true,
		        handler: function () {
		            if (!this.isCalculateOrBoolean)
		                this.functionBooleanWinTbarRight();
		            else
		                this.functionCalculateWinTbarRight();
		        }, scope: this
		    },
		    { xtype: 'button', iconCls: "x-btn-text x-tbar-loading", text: '刷新',
		        handler: function () {
		            this.editFormulaStore.reload();
		        }, scope: this
		    }
	    ];
    },
    initRightFormulaGrid: function () {
        var selModel = new Ext.grid.CheckboxSelectionModel({ singleSelect: false });
        //布尔类型公式的colMode
        this.colModelFormulaBoolean = new Ext.grid.ColumnModel([
	        { header: '条件', dataIndex: '', sortable: true, width: 120,
	            renderer: function (v, d, r, i) {
	                var nbsp = '';
	                var level = parseInt(r.get('Level1'));
	                for (var i = 0; i < level; i++) {
	                    nbsp += '&nbsp;&nbsp;&nbsp;&nbsp;'
	                }
	                var temp = r.get('ValueRemark1').toString();

	                if (temp == '&&')
	                    temp = 'and';
	                if (temp == '||')
	                    temp = 'or';
	                return nbsp + temp + ' ' + r.get('ValueRemark2') + ' ' + r.get('ValueRemark3');
	            }
	        }
	    ]);
        //计算类型公式的colMode
        this.colModelFormulaCalculate = new Ext.grid.ColumnModel([
	        { header: '条件', dataIndex: '', sortable: true, width: 120,
	            renderer: function (v, d, r, i) {
	                var nbsp = '';
	                var temp = r.get('ValueRemark').toString();
	                var level = parseInt(r.get('Level'));
	                for (var i = 0; i < level; i++) {
	                    nbsp += '&nbsp;&nbsp;&nbsp;&nbsp;'
	                }
	                return nbsp + temp;
	            }
	        }
	    ]);

        this.rightFormulaGrid = new Ext.grid.GridPanel({
            border: false,
            stripeRows: true, //交替
            loadMask: true, //遮罩
            viewConfig: { forceFit: true }, //自动间距
            selModel: selModel,
            colModel: this.isCalculateOrBoolean ? this.colModelFormulaCalculate : this.colModelFormulaBoolean,
            store: this.initEditFormulaStore(),
            tbar: this.initFormulaWinTbar(),
            listeners: {
                'rowclick': function (mygrid, index, e) {
                    if (index % 2 == 0) {
                        this.rightFormulaGrid.formulaWinTbarEdit.setDisabled(false);
                        this.rightFormulaGrid.formulaWinTbarDel.setDisabled(false);
                        this.rightFormulaGrid.formulaWinTbarLeft.setDisabled(true);
                        this.rightFormulaGrid.formulaWinTbarRight.setDisabled(true);
                    } else {
                        this.rightFormulaGrid.formulaWinTbarEdit.setDisabled(true);
                        this.rightFormulaGrid.formulaWinTbarDel.setDisabled(true);
                        var rd = this.isCalculateOrBoolean ? this.formatFormulaStoreCalculate.getAt(index) : this.formatFormulaStore.getAt(index);
                        var level = this.isCalculateOrBoolean ? parseInt(rd.get('Level')) : parseInt(rd.get('Level1'));
                        if (level == 0) {
                            this.rightFormulaGrid.formulaWinTbarLeft.setDisabled(true);
                        } else {
                            this.rightFormulaGrid.formulaWinTbarLeft.setDisabled(false);
                        }
                        this.rightFormulaGrid.formulaWinTbarRight.setDisabled(false);
                    }
                },
                scope: this
            }
        });
        return this.rightFormulaGrid;
    },
    //选择存储过程、公式、xpath 的windown窗体
    initTextfieldSelectorWindow: function (textfield, hiddenfield) {
        if (this.selectorWindow) {
            if (this.selectorWindow.rendered == true) {
                this.selectorWindow.destroy();
            }
        }
        this.selectorWindow = new HY.SelectorWindow({ enableGridPanel: false, enableFormulaPanel: false });
        this.selectorWindow.on('selectcomplete', function (record, selectedType) {
            textfield.setValue(record.get('XpathDesc'));
            hiddenfield.setValue(record.get('XmlId'));
        });
        return this.selectorWindow;
    },
    initProcedureWindow: function (textfield, hiddenfield) {
        if (this.callProcedure) {
            if (this.callProcedure.rendered == true) {
                this.callProcedure.destroy();
            }
        }
        var procedureId = hiddenfield.getValue();
        this.callProcedure = new HY.CallFunction({ procedureId: procedureId });
        this.callProcedure.on('selectcomplete', function (procedureJson, id, procedureShowName) {
            textfield.setValue(procedureShowName);
            hiddenfield.setValue(id);
            this.returnJson.paramsInfo.concat(procedureJson.paramsInfo);
            this.returnJson.formulaInfo.concat(procedureJson.formulaInfo);
//            for (var i = 0; i < procedureJson.paramsInfo.length; i++) {
//                this.returnJson.paramsInfo.push(procedureJson.paramsInfo[i]);
//            }
//            for (var i = 0; i < procedureJson.formulaInfo.length; i++) {
//                this.returnJson.formulaInfo.push(procedureJson.formulaInfo[i]);
//            }
        }, this);
        this.callProcedure.show();
    },
    initFormulaWindow: function (textfield, hiddenfield) {
        if (this.callFormula) {
            if (this.callFormula.rendered == true) {
                this.callFormula.destroy();
            }
        }
        this.callFormula = new HY.CallFormula({ formulaId: hiddenfield.getValue() });
        this.callFormula.on('selectcomplete', function (procedureJson, id, formulaName) {
            this.returnJson.paramsInfo.concat(procedureJson.paramsInfo);
            this.returnJson.formulaInfo.concat(procedureJson.formulaInfo);
//            for (var i = 0; i < procedureJson.paramsInfo.length; i++) {
//                this.returnJson.paramsInfo.push(procedureJson.paramsInfo[i]);
//            }
//            for (var i = 0; i < procedureJson.formulaInfo.length; i++) {
//                this.returnJson.formulaInfo.push(procedureJson.formulaInfo[i]);
//            }
            textfield.setValue(formulaName);
            hiddenfield.setValue(id);
        }, this);
        this.callFormula.show();
    }
});