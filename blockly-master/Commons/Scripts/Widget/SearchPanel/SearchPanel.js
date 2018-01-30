Ext.namespace('HY.SearchPanel');
var SearchLanguage = new language20('GetMultLanguage', '/MaintenanceLogHandler.ashx');
HY.SearchPanel = function(config) {
    var App = new Ext.App({});
    Ext.QuickTips.init(); //初始化tooltip
    this.addEvents('selectBtnClick');
    HY.SearchPanel.superclass.constructor.call(this, config);
};
Ext.extend(HY.SearchPanel, Ext.grid.GridPanel, {
    LanguageUrl: '',
    //多语言数据URL
    IsQuery: true,
    //高级查询
    initComponent: function() {
        this.tbar = this.initTbar();
        if (this.IsQuery) this.tbar.push('->', this.initQueryButton());
        Ext.each(this.cm.config,
        function(cmItem) {
            var filterRecord = Ext.data.Record.create([{
                name: 'columnId'
            },
            {
                name: 'columnName'
            },
            {
                name: 'filterType'
            }]);
            if (cmItem.hidden != 'false' || cmItem.hidden != '') {
                var newRecord = new filterRecord({
                    columnId: cmItem.dataIndex,
                    columnName: cmItem.header,
                    filterType: cmItem.filterType == '' || cmItem.filterType == null ? 'textfield': cmItem.filterType
                });
                if (this.IsQuery) this.colComboStore.add(newRecord);
                this.filterComboStore.add(newRecord);
            }
        },
        this);
        HY.SearchPanel.superclass.initComponent.call(this);
    },
    initTbar: function() {
        return [this.initFilterCombo()];
    },
    initFilterCombo: function() {
        //筛选值 09.11.15
        var BeginFilterValue = new Ext.form.TextField({
            name: 'BeginFilterValue',
            width: 100,
            //emptyText: this.language.getText('EnterQuery'),
            ref: '../BeginFilterValue',
            enableKeyEvents: true,
            hidden: true
        });
        var EndFilterValue = new Ext.form.TextField({
            name: 'EndFilterValue',
            width: 100,
            //emptyText: this.language.getText('EnterQuery'),
            ref: '../EndFilterValue',
            enableKeyEvents: true,
            hidden: true
        });
        //日期条件筛选
        var starTime = new Ext.form.DateField({
            format: 'Y-m-d',
            hidden: true,
            //emptyText:this.language.getText('StartTime'),
            editable: false,
            listeners: {
                'select': function(DateField, date) {
                    var end = endTime.getValue();
                    if (end) {
                        if (date >= end) {
                            DateField.setValue();
                            App.setAlert(SearchLanguage.getText('Prompted'), SearchLanguage.getText('TipContentDate'));
                        }
                    }
                }
            }
        });
        var endTime = new Ext.form.DateField({
            hidden: true,
            format: 'Y-m-d',
            //emptyText:this.language.getText('EndTime'),
            editable: false,
            listeners: {
                'select': function(DateField, date) {
                    var begin = starTime.getValue();
                    if (begin) {
                        if (begin >= date) {
                            DateField.setValue();
                            App.setAlert(SearchLanguage.getText('Prompted'), SearchLanguage.getText('TipContentDate'));
                        }
                    }
                },
                scope: this
            }
        });

        var money_less = new Ext.form.NumberField({
            //emptyText:this.language.getText('GreaterThan'),
            hidden: true,
            width: 80
        });
        var money_more = new Ext.form.NumberField({
            hidden: true,
            //emptyText:this.language.getText('LessThan'),
            width: 80
        });
        var searchButton = new Ext.Button({
            text: '查询',
            iconCls: "searchicon",
            handler: function() {
                var filterT = filterCombo.filterType; //字段类型
                var filterV = filterCombo.getValue(); //字段名
                var formulaN = formulaCombo.getValue(); //运算符
                var filterCondition = '';
                var msg = '';
                if (formulaN != 'and') {
                    if (filterV == SearchLanguage.getText('All') || filterV == '') {
                        filterCondition = ' 1=1 ';
                    } else {
                        if (filterT == 'datefield') {
                            var starT = starTime.getValue();
                            if (starT == '') {
                                filterCondition = ' 1=1 ';
                            } else {
                                starT = starT == '' ? '': starT.format('Y-m-d');
                                if (formulaN != 'like') {
                                    filterCondition = filterV + ' ' + formulaN + ' \'' + starT + '\'';
                                } else {
                                    filterCondition = 'convert(nvarchar,' + filterV + ',120)' + ' ' + formulaN + ' \'%' + starT + '%\'';
                                }
                            }
                        } else if (filterT == 'numberfield') { //金额类型
                            var money_lessStr = money_less.getValue().toString();
                            if (money_lessStr == '') {
                                filterCondition = ' 1=1 ';
                            } else {
                                if (formulaN != 'like') {
                                    filterCondition = filterV + ' ' + formulaN + ' (cast replace(' + money_lessStr + ', \',\', \'\') as float) ';
                                } else {
                                    filterCondition = filterV + ' ' + formulaN + '% (cast replace(' + money_lessStr + ', \',\', \'\') as float)%';
                                }
                            }
                        } else { //textfield 类型字段
                            var Bvalue = BeginFilterValue.getValue();
                            if (Bvalue == '') {
                                filterCondition = ' 1=1 '

                            } else {
                                if (formulaN != 'like') {
                                    filterCondition = filterV + ' ' + formulaN + ' \'' + Bvalue + '\'';
                                } else {
                                    filterCondition = filterV + ' ' + formulaN + ' \'%' + Bvalue + '%\'';
                                }
                            }
                        }
                    }
                } else {
                    if (filterV == SearchLanguage.getText('All') || filterV == '') {
                        filterCondition = ' 1=1 ';
                    } else {
                        if (filterT == 'datefield') {
                            var starT = starTime.getValue();
                            var endT = endTime.getValue();
                            if (starT == '' || endT == '') {
                                // App.setAlert(this.SearchLanguage.getText('Prompted'), this.SearchLanguage.getText('TipContentDate'));
                                return;
                            }
                            starT = starT == '' ? '': starT.format('Y-m-d');
                            endT = endT == '' ? '': endT.format('Y-m-d');
                            filterCondition = filterV + ' >= \'' + starT + '\' and ' + filterV + ' <= \'' + endT + '\'';

                        } else if (filterT == 'numberfield') { //金额类型
                            var money_lessStr = money_less.getValue().toString();
                            var money_moreStr = money_more.getValue().toString();
                            if (money_lessStr == '' || money_moreStr == '') {
                                //App.setAlert(this.language.getText('Prompted'), this.language.getText('EnterQuery'));
                                return;
                            }
                            filterCondition = filterV + '>= (cast replace(' + money_lessStr + ', \',\', \'\') as float) and ' + filterV + ' <= (cast replace(' + money_moreStr + ', \',\', \'\') as float)';
                        } else { //textfield 类型字段
                            var Bvalue = BeginFilterValue.getValue();
                            var Evalue = EndFilterValue.getValue();
                            if (Bvalue == '' || Evalue == '') {
                                return
                            }
                            filterCondition = filterV + ' >= \'' + Bvalue + '\' and ' + filterV + ' <= \'' + Evalue + '\'';
                        }
                    }
                }
                if (!filterCondition.length < 1) filterCondition = 'where ' + filterCondition;
                this.fireEvent('selectBtnClick', filterCondition);
            },
            scope: this
        });

        this.filterComboStore = new Ext.data.JsonStore({
            fields: [{
                name: 'columnId'
            },
            {
                name: 'columnName'
            },
            {
                name: 'filterType'
            }],
            data: [{
                columnId: SearchLanguage.getText('All'),
                columnName: SearchLanguage.getText('All'),
                filterType: 'textfield'
            }]
        });
        var filterCombo = new Ext.form.ComboBox({
            name: "filterCombo",
            width: 100,
            editable: false,
            mode: "local",
            displayField: "columnName",
            valueField: "columnId",
            triggerAction: "all",
            ref: '../filterCombo',
            store: this.filterComboStore
        });
        filterCombo.on('afterrender',
        function(combo) {
            combo.setValue(filterCombo.store.getAt(0).data.columnId);
            filterCombo.filterType = 'textfield';
        });
        filterCombo.on('select',
        function(a, b, c) {
            //alert(formulaCombo.getValue())
            if (formulaCombo.getValue() != 'and') {
                if (b.data.filterType == 'datefield') { //日期类型
                    filterCombo.filterType = 'datefield';
                    BeginFilterValue.hide();
                    EndFilterValue.hide();
                    starTime.show();
                    endTime.hide();
                    money_less.hide();
                    money_more.hide();
                } else if (b.data.filterType == 'numberfield') { //金额类型
                    filterCombo.filterType = 'numberfield';
                    BeginFilterValue.hide();
                    EndFilterValue.hide();
                    starTime.hide();
                    endTime.hide();
                    money_less.show();
                    money_more.hide();
                } else { //普通类型
                    filterCombo.filterType = 'textfield';
                    BeginFilterValue.show();
                    EndFilterValue.hide();
                    starTime.hide();
                    endTime.hide();
                    money_less.hide();
                    money_more.hide();
                }
            } else {
                if (b.data.filterType == 'datefield') {
                    filterCombo.filterType = 'datefield';
                    BeginFilterValue.hide();
                    EndFilterValue.hide();
                    starTime.show();
                    endTime.show();
                    money_less.hide();
                    money_more.hide();
                } else if (b.data.filterType == 'numberfield') { //金额类型
                    filterCombo.filterType = 'numberfield';
                    BeginFilterValue.hide();
                    EndFilterValue.hide();
                    starTime.hide();
                    endTime.hide();
                    money_less.show();
                    money_more.show();
                } else { //普通类型
                    filterCombo.filterType = 'textfield';
                    BeginFilterValue.show();
                    EndFilterValue.show();
                    starTime.hide();
                    endTime.hide();
                    money_less.hide();
                    money_more.hide();
                }
            }
        });
        this.formulaComboStore = new Ext.data.JsonStore({
            fields: [{
                name: 'formulaId'
            },
            {
                name: 'formulaName'
            }],
            data: [{
                formulaId: '=',
                formulaName: SearchLanguage.getText('Equal')
            },
            {
                formulaId: 'like',
                formulaName: SearchLanguage.getText('FuzzyQuery')
            },
            {
                formulaId: 'and',
                formulaName: SearchLanguage.getText('Range')
            },
            {
                formulaId: '>',
                formulaName: SearchLanguage.getText('MoreThan')
            },
            {
                formulaId: '<',
                formulaName: SearchLanguage.getText('LessThan')
            },
            {
                formulaId: '>=',
                formulaName: SearchLanguage.getText('MoreThanOrEquals')
            },
            {
                formulaId: '<=',
                formulaName: SearchLanguage.getText('LessOrEqual')
            }]
        });
        var formulaCombo = new Ext.form.ComboBox({
            name: "formulaCombo",
            width: 100,
            editable: false,
            mode: "local",
            displayField: "formulaName",
            valueField: "formulaId",
            triggerAction: "all",
            ref: '../formulaCombo',
            store: this.formulaComboStore,
            listeners: {
                'afterrender': function(combo) {
                    combo.setValue(formulaCombo.store.getAt(0).data.formulaId);
                    filterCombo.fireEvent('select', filterCombo, filterCombo.store.getAt(0), 0);
                }
            }
        });
        formulaCombo.on('select',
        function(combo, record, index) {
            if (record.data.formulaId == 'and') {
                if (filterCombo.filterType == 'datefield') {
                    filterCombo.filterType = 'datefield';
                    BeginFilterValue.hide();
                    EndFilterValue.hide();
                    starTime.show();
                    endTime.show();
                    money_less.hide();
                    money_more.hide();
                } else if (filterCombo.filterType == 'numberfield') { //金额类型
                    filterCombo.filterType = 'numberfield';
                    BeginFilterValue.hide();
                    EndFilterValue.hide();
                    starTime.hide();
                    endTime.hide();
                    money_less.show();
                    money_more.show();
                } else { //普通类型
                    filterCombo.filterType = 'textfield';
                    BeginFilterValue.show();
                    EndFilterValue.show();
                    starTime.hide();
                    endTime.hide();
                    money_less.hide();
                    money_more.hide();
                }
            } else {
                if (filterCombo.filterType == 'datefield') {
                    filterCombo.filterType = 'datefield';
                    BeginFilterValue.hide();
                    EndFilterValue.hide();
                    starTime.show();
                    endTime.hide();
                    money_less.hide();
                    money_more.hide();
                } else if (filterCombo.filterType == 'numberfield') { //金额类型
                    filterCombo.filterType = 'numberfield';
                    BeginFilterValue.hide();
                    EndFilterValue.hide();
                    starTime.hide();
                    endTime.hide();
                    money_less.show();
                    money_more.hide();
                } else { //普通类型
                    filterCombo.filterType = 'textfield';
                    BeginFilterValue.show();
                    EndFilterValue.hide();
                    starTime.hide();
                    endTime.hide();
                    money_less.hide();
                    money_more.hide();
                }
            }
        });
        return [filterCombo, "-", formulaCombo, "-", BeginFilterValue, EndFilterValue, starTime, money_less, " ", endTime, money_more, "-", searchButton];
    },
    initQueryButton: function() {
        this.colComboStore = new Ext.data.JsonStore({
            fields: [{
                name: 'columnId'
            },
            {
                name: 'columnName'
            },
            {
                name: 'filterType'
            }]
        });
        this.gridStore = new Ext.data.JsonStore({
            fields: [{
                name: 'condition'
            },
            {
                name: 'columnName'
            },
            {
                name: 'columnType'
            },
            {
                name: 'formulaValue'
            },
            {
                name: 'firstSearchValue'
            },
            {
                name: 'LastSearchValue'
            }]
        });
        var delButton = new Ext.Button({
            text: SearchLanguage.getText('Del'),
            handler: function() {
                var rows = queryPanel.getSelectionModel().getSelections();
                if (rows != 0) {
                    queryPanel.store.remove(rows);
                    queryPanel.getView().refresh();
                } else {
                    //提示
                }
            }
        });
        var addButton = new Ext.Button({
            text: SearchLanguage.getText('Add'),
            handler: function() {
                var newRecord = new Ext.data.Record.create(this.gridStore.fields);
                var myNewRecord = new newRecord({
                    condition: '',
                    columnName: '',
                    columnType: '',
                    formulaValue: '',
                    firstSearchValue: '',
                    LastSearchValue: ''
                });
                this.gridStore.add(myNewRecord);
            },
            scope: this
        });
        var getformulaOperators = function(formulaValue) {
            var Operator = '';
            switch (formulaValue) {
            case SearchLanguage.getText('Equal'):
                Operator = '=';
                break;
            case SearchLanguage.getText('MoreThan'):
                Operator = '>';
                break;
            case SearchLanguage.getText('LessThan'):
                Operator = '<';
                break;
            case SearchLanguage.getText('LessOrEqual'):
                Operator = '<=';
                break;
            case SearchLanguage.getText('MoreThanOrEquals'):
                Operator = '>=';
                break;
            case SearchLanguage.getText('FuzzyQuery'):
                Operator = 'like';
                break;
            case SearchLanguage.getText('Range'):
                Operator = 'and';
                break;
            default:
                Operator = '';
            }
            return Operator;
        };
        var searchButton = new Ext.Button({
            text: SearchLanguage.getText('Search'),
            handler: function() {
                var store = queryPanel.getStore();
                var filterCondition = '';
                if (store.getCount() < 1) {
                    alert(SearchLanguage.getText('PleaseAddTheQueryTerms'));
                    return;
                }
                for (var i = 0; i < store.getCount(); i++) {
                    var row = store.getAt(i);
                    var Operator = getformulaOperators(row.data.formulaValue);
                    var beginValue = row.data.firstSearchValue;
                    var endValue = row.data.LastSearchValue;
                    var columnType = row.data.columnType;
                    var columnName = row.data.columnId;
                    var condition = row.data.condition;
                    if (Operator != 'and') {
                        if (columnType == 'datefield') {

}
                        if ((condition == '' && i != 0) || columnName == '' || columnType == '' || beginValue == '' || Operator == '') {
                            alert(SearchLanguage.getText('Article') + (i + 1) + SearchLanguage.getText('DoneWrongQueryConditions'));
                            return;
                        }
                    } else {
                        if ((condition == '' && i != 0) || columnName == '' || columnType == '' || endValue == '' || Operator == '' || beginValue == '') {
                            alert(SearchLanguage.getText('Article') + (i + 1) + SearchLanguage.getText('DoneWrongQueryConditions'));
                            return;
                        }
                    }
                    if (i != 0) {
                        filterCondition = filterCondition + ' ' + condition + ' ';
                    }
                    if (columnType == 'datefield') {
                        beginValue = beginValue.format('Y-m-d');
                        if (Operator == 'and') endValue = endValue.format('Y-m-d');
                    }
                    if (Operator != 'and') {
                        if (columnType == 'numberfield') {
                            if (Operator != 'like') filterCondition = filterCondition + ' ' + columnName + ' ' + Operator + '(cast replace(' + beginValue + ', \',\', \'\') as float)';
                            else filterCondition = filterCondition + ' ' + columnName + ' ' + Operator + ' %(cast replace(' + beginValue + ', \',\', \'\') as float)%';
                        } else //(columnType=='datefield')
                        {
                            if (Operator != 'like') filterCondition = filterCondition + ' ' + columnName + ' ' + Operator + ' \'' + beginValue + '\'';
                            else filterCondition = filterCondition + 'convert(nvarchar,' + columnName + ',120)' + ' ' + Operator + ' \'%' + beginValue + '%\'';
                            //filterCondition = filterCondition + ' ' + columnName + ' ' + Operator + ' \'%' + beginValue + '%\'';
                        }
                    } else {
                        if (columnType == 'datefield' && beginValue > endValue) {
                            alert(SearchLanguage.getText('Article') + (i + 1) + SearchLanguage.getText('DoneWrongQueryConditions'));
                            return
                        }
                        if (columnType == 'numberfield') filterCondition = filterCondition + ' ' + columnName + '>= (cast replace(' + beginValue + ', \',\', \'\') as float) and ' + columnName + ' <= (cast replace(' + endValue + ', \',\', \'\') as float)';
                        else filterCondition = filterCondition + ' ' + columnName + ' >= \'' + beginValue + '\' and ' + columnName + ' <= \'' + endValue + '\'';
                    }

                }
                queryWin.hide();
                if (!filterCondition.length < 1) filterCondition = 'where ' + filterCondition;
                this.fireEvent('selectBtnClick', filterCondition);

            },
            scope: this
        });
        var ckModel = new Ext.grid.CheckboxSelectionModel({
            handleMouseDown: Ext.emptyFn,
            singleSelect: false
        });
        var column = [ckModel, {
            header: SearchLanguage.getText('Condition'),
            sortable: true,
            dataIndex: 'condition',
            editor: new Ext.grid.GridEditor(new Ext.form.ComboBox({
                name: "gridconditionCombo",
                width: 100,
                editable: false,
                mode: "local",
                displayField: "conditionName",
                valueField: "conditionId",
                triggerAction: "all",
                ref: '../../gridconditionCombo',
                store: new Ext.data.JsonStore({
                    fields: [{
                        name: 'conditionName'
                    },
                    {
                        name: 'conditionId'
                    }],
                    data: [{
                        conditionName: 'and',
                        conditionId: 'and'
                    },
                    {
                        conditionName: 'or',
                        conditionId: 'or'
                    }]
                })
            }))
        },
        {
            header: SearchLanguage.getText('ColumnName'),
            sortable: true,
            dataIndex: 'columnName',
            editor: new Ext.grid.GridEditor(new Ext.form.ComboBox({
                name: "gridcolumnNameCombo",
                width: 100,
                editable: false,
                mode: "local",
                displayField: "columnName",
                valueField: "columnName",
                triggerAction: "all",
                ref: '../../gridcolumnNameCombo',
                store: this.colComboStore
            }))
        },
        {
            header: "columnId",
            sortable: true,
            dataIndex: 'columnId',
            hidden: true
        },
        {
            header: SearchLanguage.getText('FormulaValue'),
            sortable: true,
            dataIndex: 'formulaValue',
            editor: new Ext.grid.GridEditor(new Ext.form.ComboBox({
                name: "gridformulaCombo",
                width: 100,
                editable: false,
                mode: "local",
                displayField: "formulaName",
                valueField: "formulaName",
                triggerAction: "all",
                ref: '../../gridformulaCombo',
                store: this.formulaComboStore
            }))
        },
        {
            header: SearchLanguage.getText('FirstSearchValue'),
            sortable: true,
            dataIndex: 'firstSearchValue',
            editor: new Ext.grid.GridEditor(new Ext.form.TextField({
                selectOnFocus: true
            })),
            renderer: function(v) {
                if (v instanceof Date) return v.format('Y-m-d');
                else return v
            }
        },
        {
            header: SearchLanguage.getText('LastSearchValue'),
            sortable: true,
            dataIndex: 'LastSearchValue',
            editor: new Ext.grid.GridEditor(new Ext.form.TextField({
                selectOnFocus: true
            })),
            renderer: function(v) {
                if (v instanceof Date) return v.format('Y-m-d');
                else return v
            }
        },
        {
            header: SearchLanguage.getText('ColumnType'),
            sortable: true,
            dataIndex: 'columnType',
            hidden: true
        }];
        var queryPanel = new Ext.grid.EditorGridPanel({
            height: 300,
            width: 400,
            clicksToEdit: 1,
            sm: ckModel,
            enableHdMenu: false,
            cm: new Ext.ux.grid.MyColumnModel(this, this.gridStore, column),
            ds: this.gridStore,
            viewConfig: {
                forceFit: true
            },
            tbar: [addButton, '-', delButton, '->', searchButton]
        });
        queryPanel.on('cellclick',
        function(grid, rowIndex, columnIndex, e) {
            if (rowIndex == 0 && columnIndex == 1) {
                return false;
            }
            if (columnIndex == 6) {
                var formulaValue = grid.getStore().getAt(rowIndex).data.formulaValue;
                if (formulaValue != SearchLanguage.getText('Range')) return false;
            }
        });
        queryPanel.on('afteredit',
        function(e) {
            if (e.column == 2) {
                var row = e.grid.getStore().getAt(e.row);
                var gridcolumnNameComboValue = row.data.columnName;
                for (var i = 0; i < this.colComboStore.getCount(); i++) {
                    var v = this.colComboStore.getAt(i);
                    if (gridcolumnNameComboValue == v.data.columnName) {
                        var columnType = this.colComboStore.getAt(i).data.filterType;
                        var id = this.colComboStore.getAt(i).data.columnId;
                        row.data.columnType = columnType;
                        row.data.columnId = id;
                        row.data.firstSearchValue = '';
                        row.data.endSearchValue = '';
                        e.grid.getView().refresh();
                        return;
                    }
                }
            }
            if (e.column == 4) {
                var row = e.grid.getStore().getAt(e.row);
                var formulaValue = row.data.formulaValue;
                if (formulaValue != SearchLanguage.getText('Range')) {
                    row.data.LastSearchValue = '';
                    e.grid.getView().refresh();
                }
            }
        },
        this);
        //this.createQueryPanel(queryPanel);
        var queryWin = new Ext.Window({
            closeAction: 'hide',
            modal: true,
            width: 500,
            height: 300,
            //            autoWidth: true,
            layout: 'fit',
            items: [queryPanel]
        });

        var queryButton = new Ext.Button({
            text: SearchLanguage.getText('AdvancedQuery'),
            hidden:true,
            handler: function() {
                queryWin.show();
            }
        });
        return queryButton;
    }
})

Ext.ns('Ext.ux.grid');
// 新类 MyColumnModel 的构造函数
Ext.ux.grid.MyColumnModel = function(grid, store, column) {
    this.grid = grid;
    this.store = store;
    this.customEditors = {
        'textfield': new Ext.grid.GridEditor(new Ext.form.TextField({
            selectOnFocus: true,
            style: 'text-align:right;'
        })),
        'datefield': new Ext.grid.GridEditor(new Ext.form.DateField({
            selectOnFocus: true,
            format: 'Y-m-d',
            style: 'text-align:right;'
        })),
        'numberfield': new Ext.grid.GridEditor(new Ext.form.NumberField({
            selectOnFocus: true,
            style: 'text-align:left;'
        }))
    };
    Ext.ux.grid.MyColumnModel.superclass.constructor.call(this, column);
};

Ext.extend(Ext.ux.grid.MyColumnModel, Ext.grid.ColumnModel, {
    // 通过覆盖父类中的方法 getCellEditor, 实现根据表达式中条件列的不同取值，
    //为表达式的值所在单元格返回不同的编辑器
    getCellEditor: function(colIndex, rowIndex) {
        var p = this.store.getAt(rowIndex);
        n = p.data.columnType; // 对应表达式的条件列的取值

        if (colIndex == 5 || colIndex == 6) // 表达式的值 propertyValue 所在的列
        {
            if (this.customEditors[n]) {
                return this.customEditors[n];
            } else {
                // 如果没有定义特定的单元格编辑器，则返回普通的文本框编辑器
                var ed = new Ext.grid.GridEditor(new Ext.form.TextField({
                    selectOnFocus: true
                }));
                return ed;
            }
        } else return this.config[colIndex].editor;
    }
});