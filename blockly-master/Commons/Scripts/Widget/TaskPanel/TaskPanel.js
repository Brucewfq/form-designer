//创建主task面板，获取数据
Ext.namespace('HY.TaskPanel');
var myTaskLanguageUrl = '/MyTaskHandler.ashx';
var myTaskLanguage = new language20('GetMyTaskMultLanguage', myTaskLanguageUrl);
var App = new Ext.App({});
Ext.QuickTips.init();
HY.TaskPanel = Ext.extend(Ext.ux.InlineToolbarTabPanel, {
    isShowFlowchart: Ext.isIE8, //是否显示流程图
    url: myTaskLanguageUrl,
    title: myTaskLanguage.getText('myTask'),
    //activeTab: 0,
    enableTabScroll: true,
    frame: false,
    border: false,
    defaults: {
        autoScroll: true,
        frame: false,
        border: false
    },
    isAddCm: false, //是否有添加的
    getGetTaskParams: function () {
        return {
            //			start:0,
            //			filterCondition:'',
            limit: this.pageSize
        };
    },
    initAddColumn: function () { },
    initInlineTbar: function () {
        this.inlineTbar = [/*'->',*/
        //'我发起的任务',
		{
		text: "<b><font size='2'>" + myTaskLanguage.getText('RefreshAll') + "</font><b>",
		iconCls: "x-btn-text x-tbar-loading",
		handler: function () {
		    this.removeAll();
		    this.initGetTaskTypes();
		    try {
		        if (window.top.__refreshMenuCount)
		            window.top.__refreshMenuCount();
		    }
		    catch (ex) { 
                
            }
		},
		scope: this,
		//disabled: true,
		ref: '../allRefreshButton'
}
		];
    },
    initComponent: function () {
        //		myTaskLanguage = new language20('GetMultLanguage',this.url);
        this.initInlineTbar();
        HY.TaskPanel.superclass.initComponent.call(this);
    },
    initGetTaskTypes: function () {
		try {
            if (window.top.__refreshMenuCount)
                window.top.__refreshMenuCount();
        }
        catch (ex) {

        }
        //获取流程大类数据
        Ext.Ajax.request({
            url: this.url,
            params: Ext.apply({
                method: 'GetTaskTypes'
            }, this.getGetTaskParams()),
            success: function (response, opts) {
                //添加tab分页panel
                var data = Ext.decode(response.responseText);
                if (data.types == '') {
                    App.setAlert(myTaskLanguage.getText('Prompted'), myTaskLanguage.getText('NoTask'));
                    return
                }
                var types = Ext.isArray(data.types) ? data.types : [data.types];
                Ext.each(types, function (type) {
                    //循环创建分页
                    this.add(
						this.initTaskTypes(type)
					);
                }, this);
                this.setActiveTab(0);
            },
            failure: function (response, opts) {
                Ext.Msg.alert(myTaskLanguage.getText('Prompted'), myTaskLanguage.getText('OperationFailed'));
            },
            scope: this
        });
    },
    render: function () {
        HY.TaskPanel.superclass.render.apply(this, arguments);
        this.initGetTaskTypes();
    },
    initTaskTypes: function (type) {
        var taskTypes = new HY.TaskTypes({
            isShowFlowchart: this.isShowFlowchart,
            url: this.url,
            language: myTaskLanguage,
            myid: type.TypeCode,
            getGetTaskParams: this.getGetTaskParams,
            data: type
        });
        return taskTypes;
    }
});
Ext.reg('TaskPanel', HY.TaskPanel);

//流程分
Ext.namespace('HY.TaskTypes');
HY.TaskTypes = Ext.extend(Ext.Panel, {
    url: '',
    layout: "accordion",
    titleNum: true,
    collapseFirst: false,
    //	layoutConfig: {
    //		collapseFirst: true//默认展开第一项
    //	},
    defaults: {
        autoScroll: true,
        layout: 'fit',
        frame: false,
        border: false
    },
    getGetTaskParams: function () {
        return {};
    },
    initComponent: function () {
        var num = this.titleNum == true ? ('<strong class="x-tasktypes-total" style="color:#1D57C7;">(' + this.data.total + ')</strong>') : '';
        this.title = this.data.ProcType + num;
        HY.TaskTypes.superclass.initComponent.call(this);
    },
    render: function () {
        HY.TaskTypes.superclass.render.apply(this, arguments);
        //获取指定大类流
        Ext.Ajax.request({
            url: this.url,
            params: Ext.apply({
                method: 'GetTaskProcsByTypes',
                type: this.myid
            }, this.getGetTaskParams()),
            success: function (response, opts) {
                //添加tab分页panel
                var data = Ext.decode(response.responseText);
                var procs = Ext.isArray(data.procs) ? data.procs : [data.procs];
                Ext.each(procs, function (proc) {
                    //循环创建分页
                    this.add(
					    new Ext.Panel({
					        title: proc.ShowProcSetName + (this.titleNum ? '<span class="x-tasktypegrid-total" style="color:blue;">(' + proc.Count + ')</span>' : ''),
					        data: proc,
					        iconCls: 'x-panel-icon-toggle',
					        collapsible: true,
					        collapsed: true,
					        listeners: {
					            expand: this.expandGrid,
					            afterrender: this.expandFirst,
					            scope: this
					        }
					    })
					);
                }, this);
                this.doLayout();
            },
            failure: function (response, opts) {
                Ext.Msg.alert(myTaskLanguage.getText('Prompted'), myTaskLanguage.getText('OperationFailed'));
            },
            scope: this
        });
    },
    expandFirst: function (panel) {
        if (this.items.items[0] == panel) {
            this.expandGrid(panel);
        }
    },
    expandGrid: function (procPanel) {
        if (!procPanel.isCollapsed)//确保只在第一次展开时加载
        {
            procPanel.isCollapsed = true;
            //获取grid自定义列头
            Ext.Ajax.request({
                url: this.url,
                params: {
                    method: 'GetDefinedColumnsByProc',
                    procSetName: procPanel.data.ProcSetName
                },
                success: function (response, opts) {
                    //添加tab分页panel
                    var data = Ext.decode(response.responseText);
                    var columns = Ext.isArray(data.columns) ? data.columns : [data.columns];
                    procPanel.add(
					    this.initTaskTypeGrid(procPanel, columns)
					);
                    procPanel.doLayout();
                    //默认展开第一个
                    procPanel.expand();
                },
                failure: function (response, opts) {
                    Ext.Msg.alert(myTaskLanguage.getText('Prompted'), myTaskLanguage.getText('OperationFailed'));
                },
                scope: this
            });
        }
    },
    initTaskTypeGrid: function (procPanel, columns) {
        var taskTypeGrid = new HY.TaskTypeGrid({
            isShowFlowchart: this.isShowFlowchart,
            myid: 'grid-' + procPanel.data.ProcSetID,
            colModel: columns,
            url: this.url,
            language: myTaskLanguage,
            data: procPanel.data,
            getGetTaskParams: this.getGetTaskParams
        });
        return taskTypeGrid;
    }
});
Ext.reg('TaskTypes', HY.TaskTypes);

//流程详细任务
Ext.namespace('HY.TaskTypeGrid');
HY.TaskTypeGrid = Ext.extend(Ext.grid.GridPanel, {
    pageSize: 20,
    iconCls: 'x-panel-icon-toggle',
    border: false,
    loadMask: true,
    stripeRows: true,
    getgroupField: 'processStatus',
    viewConfig: {
        forceFit: true,
        showGroupName: false,
        enableNoGroups: false, // REQUIRED!
        hideGroupedColumn: true //是否隐藏分组字段
    },
    getGetTaskParams: function () {
        return {};
    },
    rendererType: {
        //时间格式转换
        date: function (v) {
            return v ? v.dateFormat('Y-m-d') : '';
        },
        string: function (v) {
            return v;
        },
        //		callback:function(v){
        //			return v=='1'? myStartTaskLanguage.getText('canRecall'):myStartTaskLanguage.getText('canNotRecall');
        //		},
        //		decline:function(v){
        //			return v=='1'? myStartTaskLanguage.getText('canStop'):myStartTaskLanguage.getText('canNotStop');
        //		},
        status: function (v) {
            var result = "";
            switch (v) {
                case "0": result = "Error"; break;
                case "1": result = "Running"; break;
                case "2": result = "Active"; break;
                case "3": result = "Completed"; break;
                case "4": result = "Stopped"; break;
                case "5": result = "Deleted"; break;
                default: result = "-"; break;
            }
            return result;
        },
        money: function (v) {
            return Ext.util.Format.currency(v);
        }
    },
    listeners: {
        'afterrender': function (grid) {
            grid.getStore().load.defer(100, grid.getStore(), [{ params: { start: 0, limit: grid.pageSize}}]);
        },
        'rowdblclick': function (gbody, rowIndex, e) {
            if (gbody.getSelectionModel().getCount()) {
                var selectedRow = gbody.getSelectionModel().getSelected();
                //var sn = selectedRow.get("ProcInstID")+"_"+selectedRow.get("ActInstDestID");
                var href = selectedRow.get("Data");
                cmbk_openWindowMax(href);
                //window.open(href, '', 'left=0,top=0,width=' + (screen.availWidth - 10) + ',height=' + (screen.availHeight - 160) + ',toolbar=yes,menubar=yes,scrollbars=yes,status=yes,location=yes,resizable=yes');
                //window.open(href,'','width=870,height=700,left='+(window.screen.availWidth-870)/2+',top=0');
            }
        },
        scope: this
    },
    initSmEvents: function () {
        //在选择行的时候，load store的信息
        this.selModel.on("rowselect", function (SelectionModel, rowIndex, record) {
            var selectedRows = SelectionModel.getSelections();
            var snList = "";
            var ActivityName = "";
            Ext.each(selectedRows, function (rowItem) {
                snList += rowItem.data.ProcInstID + '_' + rowItem.data.ActInstDestID + '|';
                ActivityName += rowItem.data.Name + '|';
            });
            if (snList == null || snList.length == 0) {
                this.approvalStore.removeAll();
                return;
            }
            snList = snList.substring(0, snList.length - 1);
            this.approvalStore.baseParams.snList = snList;
            if (ActivityName != '')
                ActivityName = ActivityName.substring(0, ActivityName.length - 1);
            this.approvalStore.baseParams.ActivityName = ActivityName;
            this.approvalStore.baseParams.ProcessName = this.data.ProcSetName;
            this.approvalStore.load();
        }, this);
        this.selModel.on("rowdeselect", function (SelectionModel, rowIndex, record) {
            var selectedRows = SelectionModel.getSelections();
            var snList = "";
            var ActivityName = "";
            Ext.each(selectedRows, function (rowItem) {
                snList += rowItem.data.ProcInstID + '_' + rowItem.data.ActInstDestID + '|';
                ActivityName += rowItem.data.Name + '|';
            });
            if (snList == null || snList.length == 0) {
                this.approvalStore.removeAll();
                return;
            }
            snList = snList.substring(0, snList.length - 1);
            this.approvalStore.baseParams.snList = snList;
            if (ActivityName != '')
                ActivityName = ActivityName.substring(0, ActivityName.length - 1);
            this.approvalStore.baseParams.ActivityName = ActivityName;
            this.approvalStore.baseParams.ProcessName = this.data.ProcSetName;
            this.approvalStore.load();
        }, this);
    },
    showFlowchart: function () {
        var url = '/ProcessWeb/Page/FlowChart.aspx?viewstatus=view&procinstid={procInstID}';
        var a = "<a href='javascript:' onclick='window.open(\"" + url + "\",\"\",\"width=870,height=700,resizable=yes,fullScreen=yes\") '>流程图</a>";
        return function (v, metadata, record) {
            var procInstID = record.data.ProcInstID;
            return a.replace(/{procInstID}/ig, procInstID);
        };
    },

    initComponent: function () {
        this.tbar = this.initTbar();
        this.id = this.myid;
        this.selModel = new Ext.grid.CheckboxSelectionModel({
            singleSelect: false,
            hideable: false
        });
        this.initSmEvents();

        var colModel = [this.selModel];
        var fields = [];

        var mywidth = 100;
        Ext.each(this.colModel, function (cmItem) {
            var filterRecord = Ext.data.Record.create([{ name: 'columnId' }, { name: 'columnName' }, { name: 'filterType' }, { name: 'resRoot'}]);
            var myhidden = 'false';
            if (cmItem.hidden) {
                var temphidden = cmItem.hidden;
                var myarr = temphidden.split(',');
                myhidden = myarr[0];
                if (myarr.length > 1)
                    mywidth = parseInt(myarr[1]);
            }
            if (myhidden == 'false' || myhidden == 'False') {
                var newRecord = new filterRecord({ columnId: cmItem.dataindex, columnName: cmItem.headertext, filterType: cmItem.filtertype, resRoot: myhidden });
                this.filterComboStore.add(newRecord);
            }
            if (cmItem.filtertype) {
                var filterTypeAndRenderer = cmItem.filtertype,
				filterType = '',
				rendererType = '';
                if (filterTypeAndRenderer.length > 0) {
                    var arr = filterTypeAndRenderer.split(',');
                    filterType = arr[0];
                    if (arr.length > 1)
                        rendererType = arr[1];
                }
            }
            var columnItem = {
                header: cmItem.headertext,
                dataIndex: cmItem.dataindex,
                sortable: true,
                hidden: myhidden == 'true' ? true : false,
                width: mywidth,
                hideable: cmItem.hiddable == 'true' ? true : false,
                renderer: rendererType ? this.rendererType[rendererType] : false,
                filtertype: filterType ? filterType : false,
                colcode: cmItem.colcode
            };
            if (columnItem.header == "流程名称") {
                columnItem["renderer"] = function (v) { return v.replace("_Process", ""); };
            }
            colModel.push(columnItem);
            fields.push({
                name: cmItem.dataindex,
                type: rendererType ? rendererType : false
            });

        }, this);

        if (this.isAddCm)
            colModel.push(this.initAddColumn());
        if (this.isShowFlowchart)
            colModel.push({ header: '', dataIndex: 'Folio', hidden: false, hideable: false, renderer: this.showFlowchart() });
        this.colModel = new Ext.grid.ColumnModel({
            defaults: {
                menuDisabled: false,
                sortable: false
            },
            columns: colModel
        });
        this.store = new Ext.data.GroupingStore({
            autoLoad: false,
            baseParams: Ext.apply({
                method: "GetTaskListByProc",
                procSetName: this.data.ProcSetName,
                start: 0,
                filterCondition: ''
            }, this.getGetTaskParams()),
            proxy: new Ext.data.HttpProxy({
                url: this.url,
                method: 'POST'
            }),
            reader: new Ext.data.JsonReader({
                root: 'rows',
                totalProperty: 'result',
                fields: fields
            }),
            sortInfo: { field: 'ProcInstID', direction: "DESC" }, //serialNumber
            remoteSort: true, //所有记录排
            groupField: this.getgroupField,
            listeners: {
                beforeload: function (store, op) {
                    Ext.apply(store.baseParams, this.getGetTaskParams());
                },
                load: function (store, records, o) {
                    //暂时处理，需要新开mytask。js将任务批量审批分离出去
                    if (this.approvalCombo) {
                        //批量处理刷新列表后清楚原有批量处理下拉框中的选项
                        this.approvalCombo.clearValue();
                        this.approvalCombo.store.removeAll();
                    }
                },
                scope: this
            }
        });
        this.bbar = new Ext.PagingToolbar({
            pageSize: this.pageSize,
            store: this.store,
            displayInfo: true,
            emptyMsg: myTaskLanguage.getText('EmptyMsg'),
            prevText: myTaskLanguage.getText('PrevText'),
            nextText: myTaskLanguage.getText('NextText'),
            refreshText: myTaskLanguage.getText('RefreshText'),
            firstText: myTaskLanguage.getText('FirstText'),
            lastText: myTaskLanguage.getText('LastText'),
            beforePageText: myTaskLanguage.getText('BeforePageText'),
            afterPageText: myTaskLanguage.getText('AfterPageText'),
            displayMsg: myTaskLanguage.getText('DisplayMsg')
        });

        HY.TaskTypeGrid.superclass.initComponent.call(this);
    },
    initSaveColumnButton: function () {
        var saveColumnButton = new Ext.Button({
            text: myTaskLanguage.getText('SaveUserColumn'),
            handler: function () {
                var columnModel = this.getColumnModel();
                var columnCount = columnModel.getColumnCount();
                var colCodeList = "";
                for (var i = 0; i < columnCount; i++) {
                    var column = columnModel.getColumnAt(i);
                    var columnMappingIndex = columnModel.getDataIndex(i);
                    var colHidden = column.hidden ? true : false;
                    if (column.header != "" && columnMappingIndex != "")
                        colCodeList += column.colcode + ":" + colHidden + "|";
                }
                colCodeList = colCodeList.substring(0, colCodeList.length - 1);
                Ext.Msg.confirm(myTaskLanguage.getText('Prompted'), myTaskLanguage.getText('SaveConfirm'), function (btn) {
                    if (btn == 'yes') {
                        Ext.Ajax.request({
                            url: this.url,
                            params: {
                                method: 'SaveCustomColumnInfo',
                                colCodeList: colCodeList,
                                procsetName: this.data.ProcSetName
                            },
                            success: function (data) {
                                App.setAlert(myTaskLanguage.getText('Prompted'), myTaskLanguage.getText('OperationSuccessful'));
                            },
                            failure: function () {
                                App.setAlert(myTaskLanguage.getText('Prompted'), myTaskLanguage.getText('OperationFailed'));
                            },
                            scope: this
                        });
                    }
                }, this);
            }, scope: this
        });
        return saveColumnButton;
    },
    initDeleteColumnButton: function () {
        var DeleteColumnButton = new Ext.Button({
            text: myTaskLanguage.getText('DeleteUserColumn'),
            handler: function () {
                Ext.Msg.confirm(myTaskLanguage.getText('Prompted'), myTaskLanguage.getText('DeleteConfirm'), function (btn) {
                    if (btn == 'yes') {
                        Ext.Ajax.request({
                            url: this.url,
                            params: {
                                method: 'DeleteCustomColumnInfo',
                                procsetName: this.data.ProcSetName
                            },
                            success: function (data) {
                                App.setAlert(myTaskLanguage.getText('Prompted'), myTaskLanguage.getText('OperationSuccessful'));
                            },
                            failure: function () {
                                App.setAlert(myTaskLanguage.getText('Prompted'), myTaskLanguage.getText('OperationFailed'));
                            },
                            scope: this
                        });
                    }
                }, this);
            }, scope: this
        });
        return DeleteColumnButton;
    },
    initRefreshButton: function () {
        return {
            text: myTaskLanguage.getText('Refresh'),
            iconCls: "x-btn-text x-tbar-loading",
            handler: function (button, e) {
                this.filterCombo.setValue();
                this.filterValue.setValue();
                Ext.apply(this.store.baseParams, this.getGetTaskParams());
                Ext.apply(this.store.baseParams, { filterCondition: '' });
                this.store.load({ params: { start: 0, limit: this.pageSize} });
                if (window.top.__refreshMenuCount)
                    window.top.__refreshMenuCount();

            },
            scope: this,
            ref: '../refreshButton'
        };
    },
    initTbar: function () {
        return [
		this.initApprovalCombo(),
		this.initFilterCombo(),
		'->',
		this.initSaveColumnButton(), '-',
		this.initDeleteColumnButton(), '-',
		this.initRefreshButton()
		];
    },
    //初始化快速审批combo
    initApprovalCombo: function () {
        this.approvalStore = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy({
                url: this.url,
                method: "POST"
            }),
            baseParams: {
                method: "GetActionsBySn",
                snList: ""
            },
            reader: new Ext.data.XmlReader({
                root: 'NewDataSet',
                record: 'Table1'
            },
			[
			    { name: "ActionName" }, { name: "ActionValue" }
			]
			)
        });
        var approvalCombo = new Ext.form.ComboBox({
            name: "actions",
            ref: '../approvalCombo',
            mode: "local",
            emptyText: myTaskLanguage.getText('QuickApproval'),
            displayField: "ActionName",
            valueField: "ActionValue",
            width: 100,
            hidden: true,
            editable: false,
            triggerAction: "all",
            store: this.approvalStore,
            listeners: { 'select': function (combo, record, index) {
                var snList = this.approvalStore.baseParams.snList.replace(/,/ig, '_');
                var actionName = record.data.ActionName;
                var actionValue = record.data.ActionValue;
                Ext.Ajax.request({
                    url: this.url,
                    params: {
                        Method: 'DoAction',
                        snList: snList,
                        actionName: actionName,
                        actionValue: actionValue
                    },
                    success: function (data) {
                        App.setAlert(myTaskLanguage.getText('Prompted'), myTaskLanguage.getText('OperationSuccessful'));
                        Ext.apply(this.store.baseParams, this.getGetTaskParams());
                        this.store.reload({ params: { start: 0, limit: this.pageSize} });
                        if (window.top.__refreshMenuCount)
                            window.top.__refreshMenuCount();
                    },
                    failure: function () {
                        App.setAlert(myTaskLanguage.getText('Prompted'), myTaskLanguage.getText('OperationFailed'));
                    },
                    scope: this
                });
            }, scope: this
            }
        });
        this.approvalStore.on('load', function (store) {
            Ext.each(store.data.items, function (record) {
                if (!record)
                    return;
                //				if(record.data.ActionName == myTaskLanguage.getText('back') || record.data.ActionName == myTaskLanguage.getText('refuse'))
                //				store.remove(record);
            });
            if (store.data.items.length == 0) {
                Ext.Msg.alert(myTaskLanguage.getText('Prompted'), myTaskLanguage.getText('NoSimilarities'));
                return;
            }
        }, this);
        return approvalCombo;
    },
    initFilterCombo: function () {
        //筛选值 09.11.15
        var filterValue = new Ext.form.TextField({
            name: 'filterValue',
            width: 100,
            emptyText: myTaskLanguage.getText('EnterQuery'),
            ref: '../filterValue',
            enableKeyEvents: true
        });

        //日期条件筛选
        var starTime = new Ext.form.DateField({
            format: 'Y-m-d',
            hidden: true,
            emptyText: myTaskLanguage.getText('StartTime'),
            editable: false,
            listeners: {
                'select': function (DateField, date) {
                    var end = endTime.getValue();
                    if (end) {
                        if (date >= end) {
                            DateField.setValue();
                            App.setAlert(myTaskLanguage.getText('Prompted'), myTaskLanguage.getText('TipContentDate'));
                        }
                    }
                }
            }
        });
        var endTime = new Ext.form.DateField({
            hidden: true,
            format: 'Y-m-d',
            emptyText: myTaskLanguage.getText('EndTime'),
            editable: false,
            listeners: {
                'select': function (DateField, date) {
                    var begin = starTime.getValue();
                    if (begin) {
                        if (begin >= date) {
                            DateField.setValue();
                            App.setAlert(myTaskLanguage.getText('Prompted'), myTaskLanguage.getText('TipContentDate'));
                        }
                    }
                },
                scope: this
            }
        });

        var money_less = new Ext.form.NumberField({
            emptyText: myTaskLanguage.getText('GreaterThan'),
            hidden: true,
            width: 80
        });
        var money_more = new Ext.form.NumberField({
            hidden: true,
            emptyText: myTaskLanguage.getText('LessThan'),
            width: 80
        });
        var searchButton = new Ext.Button({
            text: myTaskLanguage.getText('Search'),
            iconCls: "searchicon",
            handler: function () {
                var filterN = filterCombo.getValue();
                var filterV = filterValue.getValue();
                var filterCondition = '';
                //			    var msg = '';
                if (filterV == '' && filterN != '' && filterN != myTaskLanguage.getText('total') && filterValue.isVisible()) {
                    App.setAlert(myTaskLanguage.getText('Prompted'), myTaskLanguage.getText('EnterQuery'));
                    return;
                } else if (filterN == '' || filterN == myTaskLanguage.getText('total')) {
                    filterCondition = '';
                } else {
                    //日期类型的字段
                    var filterType = filterCombo.filterType;
                    //日期类型的字段
                    if (filterType == '2') {
                        var starT = starTime.getValue();
                        var endT = endTime.getValue();
                        if (starT == '' || endT == '') {
                            App.setAlert(myTaskLanguage.getText('Prompted'), myTaskLanguage.getText('TipContentDate'));
                            return;
                        }
                        starT = starT == '' ? '' : starT.format('Y-m-d');
                        endT = endT == '' ? '' : endT.format('Y-m-d');

                        filterCondition = filterN + ' >= \'' + starT + ' 00:00:00\' and ' + filterN + ' <= \'' + endT + ' 23:59:59\'';
                    } else if (filterType == '3') {//金额类型
                        var money_lessStr = money_less.getValue().toString();
                        var money_moreStr = money_more.getValue().toString();
                        if (money_lessStr == '' || money_moreStr == '') {
                            App.setAlert(myTaskLanguage.getText('Prompted'), myTaskLanguage.getText('EnterQuery'));
                            return;
                        }

                        filterCondition = 'cast (replace(' + filterN + ', \',\', \'\') as float) >= cast(' + money_lessStr + ' as float) and cast (replace(' + filterN + ', \',\', \'\') as float) <= cast(' + money_moreStr + ' as float)';
                    } else if (filterType == '4') {//特殊
                        filterCondition = ''; //filterN + ' = \'' + specColumnQueryInfoCombo.getValue() + '\'';
                    } else {//普通类型字段
                        filterCondition = filterN + ' like \'%' + filterV + '%\'';
                    }
                }
                Ext.apply(this.store.baseParams, this.getGetTaskParams());
                Ext.apply(this.store.baseParams, { filterCondition: filterCondition });
                this.store.load({ params: { start: 0, limit: this.pageSize} });
            }, scope: this
        });
        this.filterComboStore = new Ext.data.JsonStore({
            fields: [{ name: 'columnId' }, { name: 'columnName' }, { name: 'filterType' }, { name: 'resRoot'}],
            data: [{ columnId: myTaskLanguage.getText('total'), columnName: myTaskLanguage.getText('total'), filterType: '', resRoot: ''}]
        });
        var filterCombo = new Ext.form.ComboBox({
            name: "actions",
            width: 100,
            editable: false,
            mode: "local",
            emptyText: myTaskLanguage.getText('FilterOut'),
            displayField: "columnName",
            valueField: "columnId",
            triggerAction: "all",
            ref: '../filterCombo',
            store: this.filterComboStore
        });
        filterCombo.on('select', function (a, b, c) {
            //日期类型
            if (b.data.filterType == '2') {
                filterCombo.filterType = '2';
                filterValue.hide();
                starTime.show();
                endTime.show();
                money_less.hide();
                money_more.hide();
            } else if (b.data.filterType == '3') {//金额类型
                filterCombo.filterType = '3';
                filterValue.hide();
                starTime.hide();
                endTime.hide();
                money_less.show();
                money_more.show();
            } else if (b.data.filterType == '4') {//选择类型
                filterCombo.filterType = '4';
                comboFilter.resRoot = b.data.resRoot;
                filterValue.hide();
                starTime.hide();
                endTime.hide();
                money_less.hide();
                money_more.hide();
            } else {//普通类型
                filterCombo.filterType = '1';
                filterValue.show();
                starTime.hide();
                endTime.hide();
                money_less.hide();
                money_more.hide();
            }
        });
        return [" ", filterCombo, "-", filterValue, starTime, money_less, " ", endTime, money_more, "-", searchButton];
    }
});
Ext.reg('TaskTypeGrid', HY.TaskTypeGrid);