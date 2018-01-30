/**************************************
测试使用，排除错误后删
by fangle 2010/3/9
**************************************/

Ext.namespace('HY.ResourcesPanel');
//控件构造函

HY.ResourcesPanel = function (config) {
    Ext.QuickTips.init(); //初始化tooltip
    Ext.apply(this, config); //将config的配置放入this中
    //触发全局事件，已选记录store发生变更时
    this.addEvents(
		'loadselections',
		'recordselect',
		'recorddeselect',
		'clearselections'
	);

    HY.ResourcesPanel.superclass.constructor.call(this, config);
};
Ext.extend(HY.ResourcesPanel, Ext.Panel, {
    //**************************************************
    width: 200,
    height: 310,
    layout: 'fit',
    url: '/ResourcesPanelHandler.ashx', //提交请求URL 
    extensionUrl: '', //提交请求的扩展URL
    title: false, //不需要使用false,需要只用直接如：'title名称',
    hideBorders: true, //不显示本身和子容器边框
    customizeType: 3, //常用类型
    orgType: 'B96C323FF5E749D78E6B85EB0E7BD8A2', //组织结构
    isMain: true, //常用部门是否主部门
    //**********自定义属性****************************************
    enableTreePanel: true, //是否启用树面板，为false则不加载树面
    enableTreeNodeCheckBox: true, //是否启用树节点复选框
    enableGridPanel: true, //是否启用表格面板，为false则不加载表格面
    enableChild: true, //是否可以打开子节点，否false则表格面板不显示路径
    enableAddRecord: false, //是否可添加记录，为true则显示添加面板（未用
    enableSearch: true, //是否启用搜索功能，如果为false则不加载搜索面板和搜索框 （未用
    enableHideSearchPanel: true, //是否可隐藏搜索面板，为false则默认显示搜索面板，且不可隐藏（未用
    rootVisible: true, //树是否显示根节点
    uiProvider: true, //是否根节点能选
    enableTreePaging: true, //是否启用树分页（未用
    enableGridPaging: true, //是否启用表格分页，搜索分页（未用
    enableCommonDepartment: false, //是否启用常用部门
    requestMethod: "GetDomainTreeByParentCode", //请求后台的代码
    treeTabTitle: '资源树',
    gridTabTitle: '列表',
    searchTabTitle: '搜索',
    CommonTabTitle: '常用部门',
    treeRootText: '资源',
    gridRootText: '资源名称',
    treeSearchText: '筛选:',
    minSearchTextSize: 2, //最小搜索字符数

    treeIcon: '/Commons/Images/backicon.gif',
    checkModel: 'single', //'multiple':多选; 'single':单选;

    gridOneIcon: '/Common/Ext/images/default/tree/leaf.gif',
    gridMoreIcon: '/Common/Ext/images/default/tree/folder.gif',
    treePageSize: 100, //树分页
    gridPageSize: 15, //表格分页
    searchPageSize: 15, //搜索分页

    fields: [
		{ name: "Res_Id" },
		{ name: "Name" },
		{ name: "ParentCode", mapping: 'Res_Parent_Code' },
		{ name: "ParentName", mapping: 'Parent_Name' },
		{ name: 'childslength', type: 'int' },
		{ name: "CNName" },
		{ name: "ENName" }
	],
    primaryKey: 'Res_Id', //主键所有相关数据源之间的关联键值
    storeRoot: 'root',
    rootCode: '00000000000000000000000000000000', //传入的主节点
    selectedStore: null, //已选择数据源，可配置
    suppressEvent: false, //事件压制
    pathHidden: [], //路径的code集合

    baseParams: {}, //URL附加参数
    //**********自定义属性结束****************************************

    //初始化控件界面，此处不能对主键的数据源进行处理
    initComponent: function () {
        this.initSelectedStore();
        var mainPanel = this.init();
        Ext.apply(this, mainPanel);
        Ext.apply(this.initialConfig, mainPanel);
        HY.ResourcesPanel.superclass.initComponent.apply(this, arguments);
    },
    //渲染和数据源操作
    afterRender: function () {
        HY.ResourcesPanel.superclass.afterRender.apply(this, arguments);
        this.App = new Ext.App({});
    },


    //初始化主面板
    init: function () {
        var mainPanel = {
            tbar: this.initTbar(),
            items: this.initResTabPanel()
        };
        return mainPanel;
    },
    //存储常用部门
    saveCommonDepartment: function () {
        var Ids = "";
        this.commonDepartmentStore.each(function (record, rowIndex) {
            Ids += record.get(this.primaryKey) + ",";
        }, this);
        if (Ids != "")
            Ids = Ids.substring(0, Ids.length - 1);
        Ext.Ajax.request({
            url: this.url,
            params: { method: "SaveCommonDepartment", Ids: Ids },
            method: "POST",
            success: function () {
            },
            failure: function () {
            }
        }, this);
    },
    //初始化工具条
    initTbar: function () {
        var self = this;
        return [
		this.treeSearchText,
		new Ext.ux.form.SearchField({
		    store: this.searchStore,
		    paramName: 'SearchName',
		    width: 120,
		    id: 'resTemp',
		    searchLength: this.minSearchTextSize,
		    onTrigger1Click: function () {
		        if (this.hasSearch) {
		            this.el.dom.value = '';
		            //                    self.searchStore.baseParams = this.store.baseParams || {};
		            if (self.searchStore) {
		                self.searchStore.baseParams.SearchName = '';
		                self.searchStore.baseParams.rootCode = this.rootCode == '00000000000000000000000000000000' ? '' : this.rootCode;
		                self.searchStore.reload({ params: { start: 0, limit: self.searchPageSize} });
		            }
		            this.triggers[0].hide();
		            this.hasSearch = false;
		        }
		    },
		    onTrigger2Click: function () {
		        var v = this.getRawValue();
		        if (v.length < 1) {
		            this.onTrigger1Click();
		            return;
		        }
		        var tabTemp = 'tabTemp' + self.id;
		        if (!Ext.getCmp(tabTemp)) {
		            self.resTabPanel.add({ title: self.searchTabTitle, layout: 'fit', id: tabTemp, closable: true, items: self.initSearchPanel(v) });
		        } else {
		            self.searchStore.baseParams.SearchName = v;
		            self.searchStore.baseParams.rootCode = this.rootCode == '00000000000000000000000000000000' ? '' : this.rootCode;
		            self.searchStore.load({ params: { start: 0, limit: self.searchPageSize} });
		        }
		        self.resTabPanel.setActiveTab(self.resTabPanel.items.getCount() - 1);
		        this.hasSearch = true;
		        this.triggers[0].show();
		    }
		})
		];
    },
    //初始化选项卡面板
    initResTabPanel: function () {
        this.resTabPanel = new Ext.TabPanel({
            activeTab: 0,
            border: false,
            enableTabScroll: true,
            layoutOnTabChange: true,
            items: [],
            listeners: {
                'beforeremove': function () {
                    this.searchStore = null;
                    Ext.getCmp('resTemp').onTrigger1Click();
                },
                'tabchange': function (a, b) {
                    if (b.title == this.gridTabTitle) {
                        if (!this.gridStore.getCount())
                            this.gridStore.load({ params: { start: 0, limit: this.gridPageSize} });
                    }
                }
				, scope: this
            }
        });
        if (this.enableTreePanel) {
            this.resTabPanel.add({ title: this.treeTabTitle, layout: 'fit', items: this.initTreePanel() });
        }
        if (this.enableGridPanel) {
            this.resTabPanel.add({ title: this.gridTabTitle, layout: 'fit', items: this.initGridPanel() });
        }
        if (this.enableCommonDepartment) {
            this.resTabPanel.add({ title: this.CommonTabTitle, layout: 'fit', items: this.initCommonPanel() });
        }
        return this.resTabPanel;
    },
    //初始化常用部门面板
    initCommonPanel: function () {
        this.commonDepartmentStore = new Ext.data.JsonStore({
            proxy: new Ext.data.HttpProxy({
                url: this.url,
                method: "POST"
            }),
            baseParams: Ext.applyIf({ method: "GetCommonDepartment", customizeType: this.customizeType, isMain: this.isMain, orgType: this.orgType }, this.baseParams),
            root: 'Table',
            autoLoad: true,
            fields: [{ name: "Res_Id" },
		    { name: "Name" },
		    { name: "ParentCode" },
		    { name: "ParentName"}]
        });

        this.commonDepartmentStore.on('load', function (myStore, records, op) {
            if (records.length > 0)
                this.resTabPanel.setActiveTab(2);
            else
                this.resTabPanel.setActiveTab(0);
        }, this);
        this.defaultSm = new Ext.grid.CheckboxSelectionModel({ checkOnly: true, singleSelect: this.checkModel == 'multiple' ? false : true });
        var colModel = new Ext.grid.ColumnModel([
		    this.defaultSm,
		    { header: '组织名称', dataIndex: 'Name', width: 60, sortable: true },
		    { header: '父组织名称', dataIndex: 'ParentName', width: 60, sortable: true },
		    { header: '&#160;', resizable: false, fixed: true, width: 20, hideable: false, menuDisabled: true, renderer: function () {
		        return '<div class="x-grid3-row-editdefaultemp mygrid-close" style="visibility:hidden;"></div>';
		    }
		    }

		]);
        this.defaultPanel = new Ext.grid.GridPanel({
            store: this.commonDepartmentStore,
            selModel: this.defaultSm,
            colModel: colModel,
            border: false,
            stripeRows: true, //交替
            plugins: new HY.NewRowCloseIcon(),
            viewConfig: { forceFit: true}//自动间距
        });

        //正选
        this.defaultSm.on('rowselect', function (e, rowIndex, record) {
            if (!this.suppressEvent) {
                if (this.defaultPanel.loading !== true) {
                    if (record) {
                        if (this.checkModel == 'single') {
                            this.selectedStore.removeAll();
                        }
                        this.addSelectedStore(record);
                    }
                }
            }
        }, this);
        //反选
        this.defaultSm.on('rowdeselect', function (e, rowIndex, record) {
            if (!this.suppressEvent) {
                if (this.defaultPanel.loading !== true) {
                    if (record) {
                        this.removeSelectedStore(record);
                    }
                }
            }
        }, this);
        return this.defaultPanel;
    },
    prepareData: function (attr) {
        //if (this.checkModel != 'single')
        if (!attr['checked'])
            attr['checked'] = false;

        return attr;
    },
    //初始化树面板
    initTreePanel: function () {
        this.treeRoot = this.prepareData({
            id: this.rootCode,
            text: this.treeRootText,
            leaf: false,
            expanded: true
        });
        this.loader = new Ext.ux.tree.PagingTreeLoader({          //使用扩展的分页TreeLoader By xuyiru 09.12.25
            dataUrl: this.url,
            requestMethod: 'POST',
            baseAttrs: {
                uiProvider: Ext.tree.TreeCheckNodeUI,
                listeners: {
                    'beforechildrenrendered': function (treeNode) {
                        if (!treeNode.childrenRendered) {
                            for (var i = 0; i < treeNode.childNodes.length; i++) {
                                this.prepareData(treeNode.childNodes[i].attributes);
                            }
                        }
                    },
                    scope: this
                }
            },
            baseParams: Ext.applyIf({ method: this.requestMethod }, this.baseParams),
            enableTextPaging: true,                  //是否显示分页输入框
            pageSize: this.treePageSize,             //分页显示的结点
            pagingModel: 'remote',                    //local表示前台分页,remote则表示后台分页
            params: { start: 0, limit: this.treePageSize },
            listeners: {
                'beforeload': function (treeloader, node) {
                    Ext.apply(treeloader.baseParams || {}, {
                        ParentCode: node.attributes.id
                    });
                    this.resTabPanel.body.mask('Loading…', 'x-mask-loading');
                },
                'load': function (treeloader, node) {

                    if (this.enableCommonDepartment) {
                        node.ui.onOver = function (e) {
                            this.addClass('mytree-toLeft');
                        }
                        node.ui.onOut = function (e) {
                            this.removeClass('mytree-toLeft');
                        }
                        Ext.each(node.childNodes, function (theNode) {
                            theNode.ui.onOver = function (e) {
                                this.addClass('mytree-toLeft');
                            }
                            theNode.ui.onOut = function (e) {
                                this.removeClass('mytree-toLeft');
                            }
                        })
                    }
                    this.resTabPanel.body.unmask();
                    this.chechedSelectedRow();
                },
                scope: this
            }
        });
        this.treePanel = new Ext.tree.TreePanel({
            autoScroll: true,
            animate: true, //是否动画
            useArrows: true, //箭头还是+ false：+ true：箭
            enableDD: true, //是否可以拖动
            rootVisible: this.rootVisible, //是否显示根节点
            trackMouseOver: true,
            border: false,
            plugins: [new Ext.ux.tree.TreeNodeMouseoverPlugin()],
            loader: this.loader,
            root: this.treeRoot,
            listeners: {
                'checkchange': function (node, checked) {
                    if (!this.suppressEvent) {
                        if (checked) {
                            //选中
                            if (this.checkModel == 'single') {
                                this.selectedStore.removeAll();
                            }
                            this.addSelected(this.conventNode2Record(node));


                        } else {
                            //不选中
                            this.removeSelected(node.id);
                        }
                    }
                },
                'click': function (node, e) {
                    if (this.checkModel == 'single') {
                        this.selectedStore.removeAll();
                        this.addSelected(this.conventNode2Record(node));
                    }
                },
                scope: this
            },
            checkModel: this.checkModel//'multiple':多选; 'single':单选; 'cascade':级联多选
        });
        if (this.enableCommonDepartment) {
            this.treePanel.on('click', function (node, e) {
                if ((e.getXY()[1] > node.getUI().getEl().getBoundingClientRect().top) && (e.getXY()[1] < node.getUI().getEl().getBoundingClientRect().bottom) && e.getXY()[0] < node.getUI().getEl().getBoundingClientRect().right && e.getXY()[0] > node.getUI().getEl().getBoundingClientRect().right - 20) {

                    var id = node.id
                    var commindex = this.commonDepartmentStore.findExact(this.primaryKey, id);
                    if (commindex == -1) {
                        var newRecord = new this.commonDepartmentStore.recordType(this.conventNode2Record(node), id);
                        this.commonDepartmentStore.add(newRecord);
                        var selectedIndex = this.selectedStore.findExact(this.primaryKey, id);
                        if (selectedIndex != -1)
                            this.defaultSm.selectRow(this.commonDepartmentStore.getCount() - 1, true);
                        this.App.setAlert('系统提示', '已加入常用列表!');
                    } else {
                        this.App.setAlert('系统提示', '常用列表中已有该部门!');
                    }
                }

            }, this);
        }
        return this.treePanel;
    },
    //初始化列表store
    initGridStore: function () {
        this.gridStore = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy({
                url: this.url,
                method: "POST"
            }),
            baseParams: Ext.applyIf({ method: "GetListByParentCode", ParentCode: this.rootCode }, this.baseParams),
            reader: new Ext.data.XmlReader({
                record: 'Table',
                totalProperty: 'result'
            },
			this.fields
			)
        });

        return this.gridStore;
    },
    //初始化列表面板
    initGridPanel: function () {
        this.gridSm = new Ext.grid.CheckboxSelectionModel({ checkOnly: true, singleSelect: this.checkModel == 'multiple' ? false : true });
        var self = this;
        var cm = new Ext.grid.ColumnModel([
		{ header: '&#160;', dataIndex: 'childslength', width: 20, fixed: true, menuDisabled: true,
		    renderer: function (v, p) {
		        p.attr = 'style="padding:0 !important;"';
		        var style = '<div style="background:transparent no-repeat center center url(\'{url}\');height:18px;">&#160;</div>'
		        if (v > 0) {
		            return style.replace(/{url}/ig, self.gridMoreIcon);
		        } else {
		            return style.replace(/{url}/ig, self.gridOneIcon);
		        }
		    }
		},
		this.gridSm,
		{ header: this.gridRootText, dataIndex: 'Name', sortable: true },
		{ header: 'CNName', dataIndex: 'CNName', hidden: true },
		{ header: 'ENName', dataIndex: 'ENName', hidden: true },
		{ header: '&#160;', resizable: false, width: 13, hideable: false, menuDisabled: true, renderer: function () {
		    return '<div class="x-grid3-row-adddefaultemp mygrid-toLeft" style="visibility:hidden;"></div>';
		}, hidden: !this.enableCommonDepartment
		}
		]);
        this.pathTextfield = new Ext.form.TextField({
            emptyText: '父' + this.treeRootText + '路径',
            width: '120',
            style: 'margin-right:5px',
            readOnly: true
        });
        var pathButton = new Ext.Button({
            xtype: 'button',
            tooltip: '返回上级' + this.treeRootText,
            icon: this.treeIcon,
            handler: function () {
                var pathLength = this.pathHidden.length;
                if (pathLength) {
                    this.gridStore.baseParams.ParentCode = this.pathHidden[pathLength - 1].data.ParentCode;
                    this.gridStore.load({ params: { start: 0, limit: this.gridPageSize} });
                    this.pathHidden.pop();
                    var temp = "";
                    for (var i = 0; i < this.pathHidden.length; i++) {
                        temp += this.pathHidden[i].data.Name + '>';
                    }
                    temp = temp.substr(0, temp.length - 1);
                    this.pathTextfield.setValue(temp);
                }
            }, scope: this
        });
        this.gridPanel = new Ext.grid.GridPanel({
            store: this.initGridStore(),
            sm: this.gridSm,
            cm: cm,
            border: false,
            stripeRows: true, //交替
            loadMask: true, //遮罩
            viewConfig: { forceFit: true }, //自动间距
            tbar: [
			'路径: ', this.pathTextfield, pathButton
			],
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
                displayMsg: ''
            }),
            listeners: { 'rowdblclick': function (grid, rowIndex) {
                var record = this.gridStore.getAt(rowIndex);
                if (record && record.data.childslength > 0) {
                    this.gridStore.baseParams.ParentCode = record.get(this.primaryKey);
                    this.gridStore.load({ params: { start: 0, limit: this.gridPageSize} });
                    this.pathHidden.push(record);
                    var temp = "";
                    for (var i = 0; i < this.pathHidden.length; i++) {
                        temp += this.pathHidden[i].data.Name + '>';
                    }
                    temp = temp.substr(0, temp.length - 1);
                    this.pathTextfield.setValue(temp);
                }
            },
                scope: this
            }
        });
        this.gridPanel.on('render', function (grid) {
            if (this.enableChild)
                this.gridPanel.getTopToolbar().show();
            else
                this.gridPanel.getTopToolbar().hide();
            var store = grid.getStore();
            var view = grid.getView();
            grid.tip = new Ext.ToolTip({
                target: view.mainBody,
                delegate: '.x-grid3-row',
                trackMouse: true,
                title: '详细信息',
                renderTo: document.body,
                listeners: {
                    'beforeshow': function updateTipBody(tip) {
                        var rowIndex = view.findRowIndex(tip.triggerElement);
                        tip.body.dom.innerHTML = this.gridRootText + ': ' + store.getAt(rowIndex).get('Name') + '<br>' +
                                                this.treeRootText + '中文: ' + store.getAt(rowIndex).get('CNName') + '<br>' +
                                                this.treeRootText + '英文: ' + store.getAt(rowIndex).get('ENName') + '<br>' +
                                                '子节点数: ' + store.getAt(rowIndex).get('childslength');
                    },
                    scope: this
                }
            });

            var mainBody = this.gridPanel.getView().mainBody;
            mainBody.on('mousedown', function (e, t) {
                if (e.button === 0 && t.className.indexOf('x-grid3-row-adddefaultemp') >= 0) { // Only fire if left-click
                    e.stopEvent();
                    var row = e.getTarget('.x-grid3-row');
                    if (row) {
                        var index = row.rowIndex;
                        var record = this.gridPanel.getStore().getAt(index);
                        var id = record.get(this.primaryKey);
                        var commindex = this.commonDepartmentStore.findExact(this.primaryKey, id);
                        if (commindex == -1) {
                            this.commonDepartmentStore.add(record);
                            var selectedIndex = this.selectedStore.findExact(this.primaryKey, id);
                            if (selectedIndex != -1)
                                this.defaultSm.selectRow(this.commonDepartmentStore.getCount() - 1, true);
                            this.App.setAlert('系统提示', '已加入常用列表!');
                        } else {
                            this.App.setAlert('系统提示', '常用列表中已有该部门!');
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
        //正选
        this.gridSm.on('rowselect', function (e, rowIndex, record) {
            if (!this.suppressEvent) {
                if (this.gridPanel.loading !== true) {
                    if (record) {
                        if (this.checkModel == 'single') {
                            this.selectedStore.removeAll();
                        }
                        this.addSelectedStore(record);
                    }
                }
            }
        }, this);
        //反选
        this.gridSm.on('rowdeselect', function (e, rowIndex, record) {
            if (!this.suppressEvent) {
                if (this.gridPanel.loading !== true) {
                    if (record) {
                        this.removeSelectedStore(record);
                    }
                }
            }
        }, this);
        this.gridStore.on('load', function () {
            this.chechedSelectedRow();
        }, this);
        return this.gridPanel;
    },
    //初始化搜索store
    initSearchStore: function (searchText) {
        this.searchStore = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy({
                url: this.url,
                method: "POST"
            }),
            baseParams: Ext.applyIf({ method: "GetListByResourceName", SearchName: '', rootCode: '' }, this.baseParams),
            reader: new Ext.data.XmlReader({
                record: 'Table',
                totalProperty: 'result'
            },
			this.fields
			)
        });
        this.searchStore.baseParams.SearchName = searchText;
        this.searchStore.baseParams.rootCode = this.rootCode == '00000000000000000000000000000000' ? '' : this.rootCode;
        this.searchStore.load({ params: { start: 0, limit: this.searchPageSize} });
        return this.searchStore;
    },
    //初始化搜索Panel
    initSearchPanel: function (searchText) {
        this.searchSm = new Ext.grid.CheckboxSelectionModel({ checkOnly: true, singleSelect: this.checkModel == 'multiple' ? false : true });
        var cm = new Ext.grid.ColumnModel([
			this.searchSm,
			{ header: 'Res_Id', dataIndex: 'Res_Id', sortable: true, hidden: true },
			{ header: this.gridRootText, dataIndex: 'Name', sortable: true },
			{ header: '父' + this.gridRootText, dataIndex: 'ParentName', sortable: true }
		]);

        var searchPanel = new Ext.grid.GridPanel({
            store: this.initSearchStore(searchText),
            sm: this.searchSm,
            cm: cm,
            border: false,
            stripeRows: true, //交替
            loadMask: true, //遮罩
            viewConfig: { forceFit: true }, //自动间距
            bbar: new Ext.PagingToolbar({
                pageSize: this.searchPageSize,
                store: this.searchStore,
                displayInfo: true,
                emptyMsg: "没有记录",
                prevText: '上一页',
                nextText: '下一页',
                refreshText: '刷新',
                firstText: '第一页',
                lastText: '最后一页',
                beforePageText: '',
                afterPageText: '/ {0}',
                displayMsg: ''
            })
        });
        searchPanel.on('render', function (grid) {
            var store = grid.getStore();
            var view = grid.getView();
            grid.tip = new Ext.ToolTip({
                target: view.mainBody,
                delegate: '.x-grid3-row',
                trackMouse: true,
                title: '详细信息',
                renderTo: document.body,
                listeners: {
                    'beforeshow': function updateTipBody(tip) {
                        var rowIndex = view.findRowIndex(tip.triggerElement);
                        tip.body.dom.innerHTML = this.gridRootText + ': ' + store.getAt(rowIndex).get('Name') + '<br>' +
                                                this.treeRootText + '中文: ' + store.getAt(rowIndex).get('CNName') + '<br>' +
                                                this.treeRootText + '英文: ' + store.getAt(rowIndex).get('ENName');
                        //                                                +'<br>'+'子节点数: '+ store.getAt(rowIndex).get('childslength');
                    },
                    scope: this
                }
            });
        }, this);
        //选中
        this.searchSm.on('rowselect', function (e, rowIndex, record) {
            if (!this.suppressEvent) {
                if (searchPanel.loading !== true) {
                    if (record) {
                        if (this.checkModel == 'single') {
                            this.selectedStore.removeAll();
                        }
                        this.addSelectedStore(record);
                    }
                }
            }
        }, this);
        //反选
        this.searchSm.on('rowdeselect', function (e, rowIndex, record) {
            if (!this.suppressEvent) {
                if (searchPanel.loading !== true) {
                    if (record) {
                        this.removeSelectedStore(record);
                    }
                }
            }
        }, this);
        this.searchStore.on('load', function () {
            this.chechedSelectedRow();
        }, this);
        this.searchPanel = searchPanel;
        return searchPanel;
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
                        }, this);
                        this.fireEvent('recordselect', store, records, index); //addrecord
                        this.suppressEvent = false;
                    },
                    'remove': function (store, record, index) {
                        this.suppressEvent = true;
                        this.onRemoveSelected(record);
                        this.fireEvent('recorddeselect', store, record, index); //removerecode
                        this.suppressEvent = false;
                    },
                    'clear': function (store, records) {
                        this.suppressEvent = true;
                        Ext.each(records, function (record) {
                            this.onRemoveSelected(record);
                        }, this);
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
    },
    //加载时选中已选项
    chechedSelectedRow: function () {
        this.suppressEvent = true;
        this.selectedStore.each(function (record, rowIndex) {
            var id = record.get(this.primaryKey);
            //            if (this.treePanel) {
            //                if (this.treePanel.getNodeById(id))
            //                    if (this.checkModel != 'single') {
            //                        this.treePanel.getNodeById(id).getUI().check(true);
            //                    }
            //            }
            if (this.gridStore)
                var index = this.gridStore.findExact(this.primaryKey, id);
            if (this.gridSm) {
                if (this.gridSm.grid)
                    this.gridSm.selectRow(index, true);
            }
            if (this.searchStore) {
                var index2 = this.searchStore.findExact(this.primaryKey, id);
                if (this.searchSm.grid)
                    this.searchSm.selectRow(index2, true);
            }
            if (this.commonDepartmentStore) {
                var index3 = this.commonDepartmentStore.findExact(this.primaryKey, id);
                if (this.defaultSm.grid)
                    this.defaultSm.selectRow(index3, true);
            }

        }, this);
        this.suppressEvent = false;
    },
    //将树节点转换为store
    conventNode2Record: function (node) {
        return {
            Res_Id: node.id,
            Name: node.text,
            ParentCode: node.parentNode == null ? '' : node.parentNode.id,
            ParentName: node.parentNode == null ? '' : node.parentNode.text
        }
    },
    //勾选选中项
    onAddSelected: function (record) {
        var id = record.get(this.primaryKey);
        //在树中勾选选中项
        if (this.treePanel) {
            var n = this.treePanel.getNodeById(id);
            if (n) {
                n.getUI().check(true);
                n.select();
            }
        }
        //在表格中勾选选中项
        if (this.gridStore) {
            var index = this.gridStore.findExact(this.primaryKey, id);
            if (this.gridSm.grid)
                this.gridSm.selectRow(index, true);
        }
        //在搜索中勾选选中项
        if (this.searchStore) {
            var index2 = this.searchStore.findExact(this.primaryKey, id);
            if (this.searchSm.grid)
                this.searchSm.selectRow(index2, true);
        }
        if (this.commonDepartmentStore) {
            var index3 = this.commonDepartmentStore.findExact(this.primaryKey, id);
            if (this.defaultSm.grid)
                this.defaultSm.selectRow(index3, true);
        }
    },
    //取消勾选选中项
    onRemoveSelected: function (record) {
        var id = record.get(this.primaryKey);
        //在树中取消勾选选中项
        if (this.treePanel) {
            if (this.treePanel.getNodeById(id))
            //if (this.checkModel != 'single') {
            //this.treePanel.getNodeById(id).getUI().checkbox.checked = false;
            //this.treePanel.getNodeById(id).getUI().checkbox.select();
                this.treePanel.getNodeById(id).getUI().check(false);
            //}
        }
        //在表格中取消勾选选中项
        if (this.gridStore) {
            var index = this.gridStore.findExact(this.primaryKey, id);
            if (this.gridSm.grid)
                this.gridSm.deselectRow(index);
        }
        //在搜索中取消勾选选中项
        if (this.searchStore) {
            var index2 = this.searchStore.findExact(this.primaryKey, id);
            if (this.searchSm.grid)
                this.searchSm.deselectRow(index2);
        }

        if (this.commonDepartmentStore) {
            var index3 = this.commonDepartmentStore.findExact(this.primaryKey, id);
            if (this.defaultSm.grid)
                this.defaultSm.deselectRow(index3);
        }
    },
    clearPathTextfield: function () {
        if (this.pathTextfield)
            this.pathTextfield.setValue();
        this.pathHidden = [];
    },
    //public树、列表、搜索 reload
    reloadStore: function (orderParam) {
        if (this.loader) {
            if (arguments.length && orderParam.ParentCode) {
                this.treePanel.root.attributes.id = orderParam.ParentCode;
            }
            if (this.treePanel.rendered) {
                this.loader.baseParams = Ext.apply(this.loader.baseParams || {}, orderParam);
                var node = this.treePanel.getSelectionModel().getSelectedNode();
                if (node) {
                    if (node.reload)
                        node.reload();
                    else
                        node.parentNode.reload();
                }
                //this.treePanel.root.reload();
            }
        }
        if (this.gridStore) {
            this.gridStore.baseParams = Ext.apply(this.gridStore.baseParams || {}, orderParam);
            this.clearPathTextfield();
            this.gridStore.load({ params: { start: 0, limit: this.gridPageSize} });
        }
        if (this.searchStore) {
            this.searchStore.baseParams = Ext.apply(this.searchStore.baseParams || {}, orderParam);
            this.searchStore.load({ params: { start: 0, limit: this.searchPageSize} });
        }
    },
    //public获得选中的store
    getSelectedStore: function () {
        return this.selectedStore;
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
    }
});
Ext.reg('resourcespanel', HY.ResourcesPanel);