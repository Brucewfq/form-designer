HY.ChoosePerson = Ext.extend(HY.ChooseDepartment, {
    constructor: function (config) {
        //触发全局事件，已选记录store发生变更时
        this.addEvents(
		    'loademp',
		    'addemp',
		    'removeemp',
		    'clearemp'
	    );

        HY.ChoosePerson.superclass.constructor.call(this, config);
        if (this.id) {
            HY.ChooseWidgetMgr.reg(this);
        }
    },
    title: '人员选择',
    LanguageUrl: '', //多语言数据URL
    url: '/OrganizationHandler.ashx', //其他数据URL
    extensionUrl: '/EmployeeHandler.ashx', //提交请求的扩展URL
    customizeType: 2,
    isMain: true,
    width: 700,
    height: 400,
    minWidth: 400,
    minHeight: 400,
    rootCode: '00000000000000000000000000000000',
    useEmpId: false, //使用者id
    checkModel: 'single', //'multiple':多选; 'single':单选;
    defaultSelectedTip: '请选择人员',
    gridSelectedText: '人员',
    //新增自定义属性
    empGridSearchText: '姓名搜索: ',
    optionalEmpsPageSize: 15, //选中组织面板分页数
    orgChecked: true, //是否包含子部门默认
    empCheckModel: 'multiple', //'multiple':多选; 'single':单选;
    empSuppressEvent: false, //事件压制
    commonEmpEvent: false,
    orgEmpEvent: false,
    empPrimaryKey: 'Emp_Id',
    addMaxCount: 100, //全选人员的最大记录数
    minSelectedCount: 0, //最小选择记录
    maxSelectedCount: 0, //最大选择记录
    enableCommonDepartment: false, //是否启用常用部门
    enableCommonEmps: false,
    buttons: [
		{ text: '确定',
		    handler: function () {
		        var win = this.ownerCt.ownerCt;
		        win.onOkClicked();
		        win.saveCommonEmps();
		    }
		},
		{ text: '取消',
		    handler: function () {
		        var win = this.ownerCt.ownerCt;
		        win.onCancelClicked();
		        win.saveCommonEmps();
		    }
		}
	],
    //初始化属性
    initProperty: function () {
        if (this.selectedRegion == 'top' || this.hideSelected)
            this.width = 470;
    },
    onOpenClear: function () {
        this.show();
        if (this.empsStore)
            this.empsStore.removeAll();
        if (this.selectedEmpsStore)
            this.selectedEmpsStore.removeAll();
    },
    importRecords: function (records) {
        if (records) {
            Ext.each(records, function (record) {
                this.initSelectedEmpsStore();
                this.addSelectedEmpStore(record);
            }, this);
        }
    },
    //资源选择区域（Left+Center）
    initLeft: function () {
        var left = HY.ChoosePerson.superclass.initLeft.apply(this, arguments);
        Ext.apply(left, {
            region: 'west',
            split: true,
            collapsible: true,
            collapseMode: 'mini',
            width: 190,
            minSize: 190,
            maxSize: 300
        })
        return left;
    },
    //可选用户列表（Center）
    initCenter: function () {
        return {
            region: 'center',
            layout: 'fit',
            items: this.initCenterTabPanel()
        };
    },
    initCenterTabPanel: function () {
        this.centerTabPanel = new Ext.TabPanel({
            activeTab: 0,
            border: false,
            enableTabScroll: true,
            layoutOnTabChange: true,
            items: [
			    { title: '部门人员', layout: 'fit', items: this.initEmpsGridPanel() }
			],
            listeners: {
                'tabchange': function (a, b) {

                }
				, scope: this
            }
        });
        if (this.enableCommonEmps) {
            this.centerTabPanel.add({ title: '常用人员', layout: 'fit', items: this.initCommonEmpsGridPanel() });
        }
        return this.centerTabPanel;
    },
    saveCommonEmps: function () {
        if (!this.enableCommonEmps) {
            return;
        }
        var empIds = "";
        this.commonEmpsStore.each(function (record, rowIndex) {
            empIds += record.get(this.empPrimaryKey) + ",";
        }, this);
        if (empIds != "") {
            empIds = empIds.substring(0, empIds.length - 1);
            Ext.Ajax.request({
                url: this.extensionUrl,
                params: { method: "SaveEmpCommonById", empIds: empIds },
                method: "POST",
                success: function () {
                },
                failure: function () {
                    this.App.setAlert('系统提示', '常用人员保存失败!');
                }
                , scope: this
            });
        }
    },
    //初始化常用用户列表store
    initCommonEmpsGridPanel: function () {
        this.commonEmpsStore = new Ext.data.JsonStore({
            proxy: new Ext.data.HttpProxy({
                url: this.extensionUrl,
                method: "POST"
            }),
            baseParams: { method: "EmpCommonGetById", customizeType: this.customizeType, isMain: this.isMain, orgType: this.orgType },
            root: 'Table',
            autoLoad: true,
            fields: this.empsFields,
            sortInfo: {
                field: 'Emp_AD_Account',
                direction: 'ASC'
            }
        });
        this.commonEmpsStore.on('load', function (myStore, records, op) {
            if (records.length > 0)
                this.centerTabPanel.setActiveTab(1);
        }, this);
        this.commonEmpsSm = new Ext.grid.CheckboxSelectionModel({ checkOnly: true, singleSelect: this.empCheckModel == 'multiple' ? false : true });
        var cm = new Ext.grid.ColumnModel([
				this.commonEmpsSm,
				{ header: '姓名', width: 50, dataIndex: 'Emp_Name', sortable: true },
				{ header: '帐号', width: 50, dataIndex: 'Emp_AD_Account', sortable: true },
				{ header: '组织', width: 80, dataIndex: 'OrgName', sortable: true }
			]);
        var commonEmpsGridPanel = new Ext.grid.GridPanel({
            border: false,
            viewConfig: { forceFit: true },
            sm: this.commonEmpsSm,
            cm: cm,
            stripeRows: true, //交替
            loadMask: true, //遮罩
            store: this.commonEmpsStore,
            plugins: new HY.RowCloseIcon()
        });
        //正选
        this.commonEmpsSm.on('rowselect', function (e, rowIndex, record) {
            if (!this.empSuppressEvent) {
                if (commonEmpsGridPanel.loading !== true) {
                    if (record) {
                        this.commonEmpEvent = true;
                        if (this.empCheckModel == 'single') {
                            this.selectedEmpsStore.removeAll();
                        }
                        this.addSelectedEmpStore(record);
                        this.commonEmpEvent = false;
                    }
                }
            }
        }, this);
        //反选
        this.commonEmpsSm.on('rowdeselect', function (e, rowIndex, record) {
            if (!this.empSuppressEvent) {
                if (commonEmpsGridPanel.loading !== true) {
                    if (record) {
                        this.commonEmpEvent = true;
                        this.removeSelectedEmpStore(record);
                        this.commonEmpEvent = false;
                    }
                }
            }
        }, this);
        return commonEmpsGridPanel;
    },
    initBorder: function () {
        var border = HY.ChoosePerson.superclass.initBorder.apply(this, arguments);
        border.push(this.initCenter());
        return border;
    },
    empsFields: [
		"Emp_Id",
		"Emp_Name",
		"Emp_Code",
		"Emp_AD_Account",
		"OrgName",
		"OrgCode",
		"K2UserID",
        'Emp_Gender',
        'Emp_AD_Mail_Address',
        'Emp_TelPhone',
        'Emp_Language'
	],
    //初始化
    initComponent: function () {
        this.initProperty();
        HY.ChoosePerson.superclass.initComponent.apply(this, arguments);
    },
    //渲染和数据源操作
    afterRender: function () {
        HY.ChoosePerson.superclass.afterRender.apply(this, arguments);
        this.initSelectedEmpsStore();
        this.App = new Ext.App({});
        //		this.commonEmpsStore.load();
    },
    //返回选中的records
    returnRecords: function () {
        var records = this.selectedEmpsStore.getRange();
        return records;
    },
    //初始化可选用户全选store
    initEmpsAllStore: function () {
        if (!this.empsAllStore) {
            this.empsAllStore = new Ext.data.Store({
                proxy: new Ext.data.HttpProxy({
                    url: this.extensionUrl,
                    method: "POST"
                }),
                baseParams: Ext.applyIf({ method: "GetEmpsByOrgCode", OrgId: '', SearchName: '', check: this.orgChecked }, this.baseParams),
                reader: new Ext.data.XmlReader({
                    record: 'Table',
                    totalProperty: 'result'
                },
			    this.empsFields
			    )
            });
            this.empsAllStore.on('load', function (Store, records, options) {
                Ext.each(records, function (record) {
                    this.addSelectedEmpStore(record);
                }, this);
            }, this);
        }
        return this.empsAllStore;
    },
    //初始化可选用户列表store
    initEmpsStore: function () {
        if (!this.empsStore) {
            this.empsStore = new Ext.data.Store({
                sortInfo: {
                    field: 'Emp_AD_Account',
                    direction: 'ASC'
                },
                proxy: new Ext.data.HttpProxy({
                    url: this.extensionUrl,
                    method: "POST"
                }),
                baseParams: Ext.applyIf({ method: "GetEmpsByOrgCode", OrgId: '', SearchName: '', limit: this.optionalEmpsPageSize, check: this.orgChecked }, this.baseParams),
                reader: new Ext.data.XmlReader({
                    record: 'Table',
                    totalProperty: 'result'
                },
			    this.empsFields
			    )
            });
            this.empsStore.on('load', function (Store, records, options) {
                this.chechedSelectedEmp();
                this.centerTabPanel.setActiveTab(0);
            }, this);
        }
        return this.empsStore;
    },
    //可选用户列表
    initEmpsGridPanel: function () {
        this.empsSm = new Ext.grid.CheckboxSelectionModel({ checkOnly: true, singleSelect: this.empCheckModel == 'multiple' ? false : true });
        var cm = new Ext.grid.ColumnModel([
		    this.empsSm,
			{ header: '姓名', width: 50, dataIndex: 'Emp_Name', sortable: true },
			{ header: '帐号', width: 50, dataIndex: 'Emp_AD_Account', sortable: true },
			{ header: '组织', width: 80, dataIndex: 'OrgName', sortable: true },
			{ header: '&#160;', resizable: false, fixed: true, width: 20, hideable: false, menuDisabled: true, renderer: function () {
			    return '<div class="x-grid3-row-adddefaultemp mygrid-toLeft" style="visibility:hidden;"></div>';
			}, hidden: !this.enableCommonEmps
			}
		]);
        //可选用户列表分页工具条
        var bbar = new Ext.PagingToolbar({
            pageSize: this.optionalEmpsPageSize,
            store: this.initEmpsStore(),
            displayInfo: true,
            emptyMsg: "",
            prevText: '上一页',
            nextText: '下一页',
            refreshText: '刷新',
            firstText: '第一页',
            lastText: '最后一页',
            beforePageText: '',
            afterPageText: '/ {0}',
            displayMsg: ''
        });
        var label = this.empCheckModel == 'multiple' ? "选择: " : "-";
        var empsGridPanel = new Ext.grid.GridPanel({
            border: false,
            viewConfig: { forceFit: true },
            sm: this.empsSm,
            cm: cm,
            stripeRows: true, //交替
            loadMask: true, //遮罩
            store: this.empsStore,
            tbar: [
            //{ xtype: 'label', text: '选择: ', hidden: this.empCheckModel == 'multiple' ? false : true },
                label,
				{ xtype: 'button', text: '全选', tooltip: '全选部门所有用户', hidden: this.empCheckModel == 'multiple' ? false : true,
				    handler: function () {
				        this.empStoreAllLoad();
				    }, scope: this
				},
				{ xtype: 'button', text: '全否', tooltip: '取消部门所有用户', hidden: this.empCheckModel == 'multiple' ? false : true,
				    handler: function () {
				        this.selectedEmpsStore.removeAll();
				    }, scope: this
				},
				'-','->', this.empGridSearchText,
				new Ext.ux.form.SearchField({
				    store: this.empsStore,
				    paramName: 'SearchName',
				    width: 120
				})
			],
            bbar: bbar
        });
        empsGridPanel.on('render', function () {
            var mainBody = empsGridPanel.getView().mainBody;
            mainBody.on('mousedown', function (e, t) {
                if (e.button === 0 && t.className.indexOf('x-grid3-row-adddefaultemp') >= 0) { // Only fire if left-click
                    e.stopEvent();
                    var row = e.getTarget('.x-grid3-row');
                    if (row) {
                        var index = row.rowIndex;
                        var record = empsGridPanel.getStore().getAt(index);
                        var id = record.get(this.empPrimaryKey);
                        var commindex = this.commonEmpsStore.findExact(this.empPrimaryKey, id);
                        if (commindex == -1) {
                            record.set("isnew", "yes");
                            this.commonEmpsStore.add(record);
                            var selectedIndex = this.selectedEmpsStore.findExact(this.empPrimaryKey, id);
                            if (selectedIndex != -1)
                                this.commonEmpsSm.selectRow(this.commonEmpsStore.getCount() - 1, true);
                            this.App.setAlert('系统提示', '已加入常用列表!');
                        } else {
                            this.App.setAlert('系统提示', '常用列表中已有该人员!');
                        }
                    }
                }
            }, this);
            mainBody.on('mouseover', function (e, t) {
                var row;
                if ((row = empsGridPanel.getView().findRowIndex(t)) !== false) {
                    var rowDom = empsGridPanel.getView().getRow(row);
                    Ext.fly(rowDom).child('.mygrid-toLeft').show();
                }
            }, this);
            mainBody.on('mouseout', function (e, t) {
                var row;
                if ((row = empsGridPanel.getView().findRowIndex(t)) !== false) {
                    var rowDom = empsGridPanel.getView().getRow(row);
                    Ext.fly(rowDom).child('.mygrid-toLeft').hide();
                }
            }, this);
        }, this);
        //分页工具条追加“含子部门用户”选项
        this.orgCheckBox = new Ext.form.Checkbox({
            boxLabel: '含子部门用户',
            disabled: this.isPermission == '2' ? true : false,
            checked: this.isPermission == '2' ? false : this.orgChecked,
            listeners: {
                'check': function (Checkbox, checked) {
                    this.empsStore.baseParams.check = checked;
                    this.empsStore.reload({ params: { start: 0, limit: this.optionalEmpsPageSize} });
                },
                scope: this
            }
        });
        bbar.add('->', '-', this.orgCheckBox);
        //正选
        this.empsSm.on('rowselect', function (e, rowIndex, record) {
            if (!this.empSuppressEvent) {
                if (empsGridPanel.loading !== true) {
                    if (record) {
                        this.orgEmpEvent = true;
                        if (this.empCheckModel == 'single') {
                            this.selectedEmpsStore.removeAll();
                        }
                        this.addSelectedEmpStore(record);
                        this.orgEmpEvent = false;
                    }
                }
            }
        }, this);
        //反选
        this.empsSm.on('rowdeselect', function (e, rowIndex, record) {
            if (!this.empSuppressEvent) {
                if (empsGridPanel.loading !== true) {
                    if (record) {
                        this.orgEmpEvent = true;
                        this.removeSelectedEmpStore(record);
                        this.orgEmpEvent = false;
                    }
                }
            }
        }, this);
        return empsGridPanel;
    },
    //初始化选中人员store
    initSelectedEmpsStore: function () {
        if (!this.selectedEmpsStore) {
            //创建已选STORE,将时间绑定到全局事件中
            this.selectedEmpsStore = new Ext.data.JsonStore({
                root: this.storeRoot,
                fields: this.empsFields,
                listeners: {
                    'add': function (store, records, index) {
                        this.empSuppressEvent = true;
                        Ext.each(records, function (record) {
                            this.onAddSelectedEmp(record);
                            if (!this.hideSelectedEmps && this.selectedRegion == 'top') {
                                this.addTopItem(record);
                            }
                        }, this);
                        this.fireEvent('addemp', store, records, index);
                        this.setSelectedTip(store.getCount());
                        this.empSuppressEvent = false;
                    },
                    'remove': function (store, record, index) {
                        this.empSuppressEvent = true;
                        this.onRemoveSelectedEmp(record);
                        if (!this.hideSelectedEmps && this.selectedRegion == 'top') {
                            this.removeTopItem(record);
                        }
                        this.fireEvent('removeemp', store, record, index);
                        this.setSelectedTip(store.getCount());
                        this.empSuppressEvent = false;
                    },
                    'clear': function (store, records) {
                        this.empSuppressEvent = true;
                        Ext.each(records, function (record) {
                            this.onRemoveSelectedEmp(record);
                            if (!this.hideSelectedEmps && this.selectedRegion == 'top') {
                                this.removeTopItem(record);
                            }
                        }, this);
                        this.fireEvent('clearemp', store, records);
                        this.setSelectedTip(store.getCount());
                        this.empSuppressEvent = false;
                    },
                    'load': function (store, records, options) {
                        this.empSuppressEvent = true;
                        this.fireEvent('loademp', store, records, options);
                        this.setSelectedTip(store.getCount());
                        this.empSuppressEvent = false;
                    },
                    scope: this
                }
            });
        }
        return this.selectedEmpsStore;
    },
    //初始化已选择的资源(right)
    initSelectedRightPanel: function () {
        //资源
        this.selectedRightPanel = new Ext.grid.GridPanel({
            border: false,
            header: false,
            stripeRows: true, //交替
            cm: new Ext.grid.ColumnModel([
				{ header: this.gridSelectedText, width: 50, dataIndex: 'Emp_Name' },
				{ header: this.treeRootText, width: 80, dataIndex: 'OrgName' }
			]),
            store: this.initSelectedEmpsStore(),
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
                        this.selectedEmpsStore.remove(record);
                    }
                },
                scope: this
            },
            plugins: new HY.RowCloseIcon()
        });
        return this.selectedRightPanel;
    },
    initResourcesPanelEvents: function () {
        //	this.initEmpsStore();
        this.resourcesPanel.on('recordselect', function (store, records, index) {
            this.empStoreLoad(records[0]);
        }, this);
        this.resourcesPanel.on('recorddeselect', function (store, record, index) {
            this.empsStore.removeAll();
            this.empsStore.baseParams.OrgId = this.rootCode;
        }, this);
        this.resourcesPanel.on('clearselections', function (store, record, index) {
            this.empsStore.removeAll();
            this.empsStore.baseParams.OrgId = this.rootCode;
        }, this);
    },
    empStoreLoad: function (record) {
        this.empsStore.baseParams.check = this.orgCheckBox.getValue();
        this.empsStore.baseParams.OrgId = record.get(this.primaryKey);
        this.empsStore.load({ params: { start: 0, limit: this.optionalEmpsPageSize} });
    },
    empStoreAllLoad: function () {
        var store = this.initEmpsAllStore();
        if (store && this.selectedStore.getAt(0)) {
            store.baseParams.check = this.orgCheckBox.getValue();
            store.baseParams.OrgId = this.selectedStore.getAt(0).get(this.primaryKey);
            store.load({ params: { start: 0, limit: this.addMaxCount} });
        } else {
            Ext.Msg.alert('提示', '请选择组织');
        }
    },
    addTopItem: function (record) {
        if (this.empCheckModel == 'single') {
            this.topPanel.removeAll();
        }
        var item = new Ext.Panel({
            width: 75,
            height: 22,
            bodyStyle: "line-height:18px;text-align:center;cursor:pointer;",
            id: record.get(this.empPrimaryKey),
            html: '<b>' + record.data.Emp_Name + '</b>'
        });
        item.on('render', function () {
            item.el.on('click', function () {
                this.topPanel.remove(record.get(this.empPrimaryKey), true);
                this.selectedEmpsStore.remove(record);
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
        this.topPanel.remove(record.get(this.empPrimaryKey), true);
    },
    //加载时选中已选项
    chechedSelectedEmp: function () {
        this.suppressEvent = true;
        this.selectedEmpsStore.each(function (record, rowIndex) {
            var empId = record.get(this.empPrimaryKey);
            var orgId = record.get('OrgCode');
            var index = -1, index2 = -1;
            this.empsStore.each(function (rd, rowIndex) {
                if (empId == rd.get(this.empPrimaryKey) && orgId == rd.get('OrgCode')) {
                    index = rowIndex;
                    return false;
                }
            }, this);
            if (this.empsSm.grid)
                this.empsSm.selectRow(index, true);
            if (this.enableCommonEmps) {
                this.commonEmpsStore.each(function (rd, rowIndex) {
                    if (empId == rd.get(this.empPrimaryKey) && orgId == rd.get('OrgCode')) {
                        index2 = rowIndex;
                        return false;
                    }
                }, this);
                if (this.commonEmpsSm.grid)
                    this.commonEmpsSm.selectRow(index2, true);
            }
        }, this);
        this.suppressEvent = false;
    },
    //勾选选中项
    onAddSelectedEmp: function (record) {
        var empId = record.get(this.empPrimaryKey);
        var orgId = record.get('OrgCode');
        //在表格中勾选选中项
        if (!this.orgEmpEvent) {
            if (this.empsStore) {
                var index = -1;
                this.empsStore.each(function (rd, rowIndex) {
                    if (empId == rd.get(this.empPrimaryKey) && orgId == rd.get('OrgCode')) {
                        index = rowIndex;
                        return false;
                    }
                }, this);
                if (this.empsSm.grid)
                    this.empsSm.selectRow(index, true);
            }
        }
        //在常用表格中勾选选中项
        if (!this.commonEmpEvent) {
            if (this.commonEmpsStore) {
                var index = -1;
                this.commonEmpsStore.each(function (rd, rowIndex) {
                    if (empId == rd.get(this.empPrimaryKey) && orgId == rd.get('OrgCode')) {
                        index = rowIndex;
                        return false;
                    }
                }, this);
                if (this.commonEmpsSm.grid)
                    this.commonEmpsSm.selectRow(index, true);
            }
        }
    },
    //取消勾选选中项
    onRemoveSelectedEmp: function (record) {
        //在表格中取消勾选选中项
        var empId = record.get(this.empPrimaryKey);
        var orgId = record.get('OrgCode');
        if (!this.orgEmpEvent) {
            if (this.empsStore) {
                var index = -1;
                this.empsStore.each(function (rd, rowIndex) {
                    if (empId == rd.get(this.empPrimaryKey) && orgId == rd.get('OrgCode')) {
                        index = rowIndex;
                        return false;
                    }
                }, this);
                if (this.empsSm.grid)
                    this.empsSm.deselectRow(index);
            }
        }
        //在常用表格中取消勾选选中项
        if (!this.commonEmpEvent) {
            if (this.commonEmpsStore) {
                var index = -1;
                this.commonEmpsStore.each(function (rd, rowIndex) {
                    if (empId == rd.get(this.empPrimaryKey) && orgId == rd.get('OrgCode')) {
                        index = rowIndex;
                        return false;
                    }
                }, this);
                if (this.commonEmpsSm.grid)
                    this.commonEmpsSm.deselectRow(index);
            }
        }
    },
    //public添加已选择记录
    addSelectedEmpStore: function (record) {
        if (!record.get) {
            this.addSelectedEmp(record);
        } else {
            var id = record.get(this.empPrimaryKey);
            var index = this.selectedEmpsStore.findExact(this.empPrimaryKey, id);
            if (index == -1)
                this.selectedEmpsStore.add(record);
        }
    },
    //public移除已选择记录
    removeSelectedEmpStore: function (record) {
        this.removeSelectedEmp(record.get(this.empPrimaryKey));
    },
    //private添加已选择记录
    addSelectedEmp: function (recordData) {
        var store = this.selectedEmpsStore;
        var id = recordData[this.empPrimaryKey]
        var newRecord = new store.recordType(recordData, id);
        this.addSelectedEmpStore(newRecord);
    },
    //private移除已选择记录
    removeSelectedEmp: function (id) {
        var store = this.selectedEmpsStore;
        var index = this.selectedEmpsStore.findExact(this.empPrimaryKey, id);
        this.selectedEmpsStore.removeAt(index);
    }
});
Ext.reg('chooseperson', HY.ChoosePerson);
