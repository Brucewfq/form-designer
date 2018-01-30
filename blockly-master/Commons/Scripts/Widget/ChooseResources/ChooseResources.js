HY.ChooseResources = Ext.extend(Ext.Window, {
    constructor: function (config) {
        Ext.QuickTips.init(); //初始化tooltip
        //	Ext.apply(this,config);//将config的配置放入this中
        this.addEvents('selectcomplete');
        //载入对语言
        //config.language = new language20('GetLanguageResources',this.LanguageResourcesUrl);

        HY.ChooseResources.superclass.constructor.call(this, config);
        if (this.id) {
            HY.ChooseWidgetMgr.reg(this);
        }
    },
    //多语言
    //树要改成treegrid，树列头可配置
    //资源列表CM可配置
    //搜索列表CM可配置
    //已选择列表CM可配置
    //所有列表必须使用primaryKey知道的相同主键关联
    //初始化时传入已选
    //确定后出发选择完成
    //已选列表双击后删除左侧选择项
    title: '资源选择',
    LanguageUrl: '', //多语言数据URL
    url: '/ResourcesPanelHandler.ashx', //其他数据URL
    extensionUrl: '', //提交请求的扩展URL
    rootCode: '00000000000000000000000000000000', //指定资源父节点
    selectedRegion: 'right', //top 或 right
    closeAction: 'hide',
    //constrain:true,//窗体不超过游览器可视区
    constrainHeader: true, //窗体header不超过游览器可视区
    hideBorders: true,
    maximizable: true,
    width: 415,
    height: 395,
    minWidth: 415,
    minHeight: 395,
    plain: true,
    hideMode: 'offsets',
    border: false,
    buttonAlign: 'center',
    requestMethod:"GetDomainTreeByParentCode",//请求后台的方法
    modal: true,
    selecteds: null, //已选中
    primaryKey: 'Res_Id', //主键所有相关数据源之间的关联键值
    storeRoot: 'root',
    defaultSelectedTip: '请选择资源',
    minSelectedCount: 0, //最小选择记录
    maxSelectedCount: 0, //最大选择记录
    selectedStore: null,
    fields: [
		{ name: "Res_Id" },
		{ name: "Name" },
		{ name: "ParentCode", mapping: 'Res_Parent_Code' },
		{ name: "ParentName", mapping: 'Parent_Name' },
		{ name: 'childslength', type: 'int' },
		{ name: "CNName" },
		{ name: "ENName" }
	],
    baseParams: { depth: 3 }, //URL附加参数

    //*******************ResourcesPanel资源面板属性**************************************
    hideSelected: false, //隐藏已选资源区
    enableTreePanel: true, //是否启用树面板，为false则不加载树面
    enableGridPanel: true, //是否启用表格面板，为false则不加载表格面
    enableChild: true, //是否可以打开子节点，否false则表格面板不显示路径
    rootVisible: true, //树是否显示根节点
    uiProvider: true, //是否根节点能选
    treeTabTitle: '组织树',
    gridTabTitle: '列表',
    searchTabTitle: '搜索',
    treeRootText: '资源',
    gridRootText: '资源名称',
    gridSelectedText: '资源',
    treeSearchText: '筛选:',
    treeIcon: '/Commons/Images/backicon.gif',
    checkModel: 'multiple', //'multiple':多选; 'single':单选;
    gridOneIcon: '/Commons/Ext/images/default/tree/leaf.gif',
    gridMoreIcon: '/Commons/Ext/images/default/tree/folder.gif',
    treePageSize: 100, //树分页
    gridPageSize: 8, //表格分页
    searchPageSize: 9,
    minSearchTextSize: 2, //最小搜索字符数
    enableCommonDepartment: false, //是否启用常用部门
    //*********************************************************
    //初始化
    initComponent: function () {
        var mainPanel = this.init();
        Ext.apply(this, mainPanel);
        Ext.apply(this.initialConfig, mainPanel);
        HY.ChooseResources.superclass.initComponent.apply(this, arguments);
    },
    //	afterRender:function() {
    //		HY.ChooseResources.superclass.afterRender.apply(this, arguments);
    //	},
    init: function () {
        //资源选
        this.selectedTip = new Ext.Toolbar.TextItem({ text: this.defaultSelectedTip });

        var mainPanel = {
            xtype: 'panel',
            layout: 'border',
            tbar: (!this.hideSelected && this.selectedRegion == 'top') ? false : this.initMainTool(),
            hideBorders: true,
            items: this.initBorder()
        };
        return mainPanel;
    },
    initMainTool: function () {
        if (!this.mainToolbar) {
            //主工具条
            this.mainToolbar = new Ext.Toolbar(this.initMainToolItems());
        }
        return this.mainToolbar;
    },
    initMainToolItems: function () {
        return [
			'->',
			'|',
			this.selectedTip
		];
    },
    initBorder: function () {
        //面
        var mainPanelItems = [];
        mainPanelItems.push(this.initLeft());

        if (!this.hideSelectedEmps && this.selectedRegion == 'top') {
            //显示且在顶部显示已选资源
            mainPanelItems.push(this.initTop());
        } else if (!this.hideSelected && this.selectedRegion == 'right') {
            //显示且在右侧显示已选资源
            mainPanelItems.push(this.initRight());
        }
        return mainPanelItems;
    },
    buttons: [
		{ text: '确定',
		    handler: function () {
		        var win = this.ownerCt.ownerCt;
		        win.onOkClicked();
		    }
		},
		{ text: '取消',
		    handler: function () {
		        var win = this.ownerCt.ownerCt;
		        win.onCancelClicked();
		    }
		}
	],
    listeners: { "hide": function (e) {
        if (this.enableCommonDepartment)
            this.resourcesPanel.saveCommonDepartment();
    }
    },
    //资源选择区域（Center）
    initLeft: function () {
        return {
            region: 'center',
            layout: 'fit',
            header: false,
            border: false,
            title: this.title,
            items: this.initResourcesPanel()
        };
    },
    //已选资源（Top）
    initTop: function () {
        return {
            region: 'north',
            height: 80,
            autoScroll: true,
            bbar: this.initMainTool(),
            items: this.initSelectedTopPanel()
        };
    },
    //已选资源（Right）
    initRight: function () {
        return {
            region: 'east',
            layout: 'fit',
            split: true,
            border: true,
            collapsible: true,
            collapseMode: 'mini',
            width: 200,
            minSize: 200,
            maxSize: 300,
            title: '已选' + this.gridSelectedText,
            items: this.initSelectedRightPanel()
        };
    },
    //资源选择提示，当前选择记录数，是否超
    setSelectedTip: function (msg) {
        this.isColor = false;
        if (msg >= this.minSelectedCount && msg <= this.maxSelectedCount) {
            this.isColor = false;
        } else if (this.maxSelectedCount == 0 && msg >= this.minSelectedCount) {
            this.isColor = false;
        } else if (this.minSelectedCount == 0 && msg <= this.maxSelectedCount) {
            this.isColor = false;
        } else {
            this.isColor = true;
        }
        var showText = '已选择&nbsp;' + msg + '&nbsp;条记录';
        if (this.minSelectedCount)
            showText += ',至少选择&nbsp;' + this.minSelectedCount + '&nbsp;条';
        if (this.maxSelectedCount)
            showText += ',最多选择&nbsp;' + this.maxSelectedCount + '&nbsp;条';
        if (this.isColor)
            showText = '<font color="red">' + showText + '</font>';
        this.selectedTip.getEl().dom.innerHTML = showText;
    },
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
        this.fireEvent('selectcomplete', this.returnRecords(), this);
        this.hide();
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
    openJson: function (jsonData) {
        var store = this.selectedStore;
        store.removeAll();
        this.open(jsonData);
    },
    openClear: function (records) {

        this.onOpenClear();
        //		this.mask();
        if (this.selectedStore)
            this.selectedStore.removeAll();
        this.importRecords(records);
        this.resourcesPanel.reloadStore();
        //		this.unmask();
    },
    onOpen: function () {
        this.show();
    },
    onOpenClear: function () {
        this.show();
    },
    importRecords: function (records) {
        this.resourcesPanel.removeAllSelectedStore();
        if (records) {
            Ext.each(records, function (record) {
                this.resourcesPanel.addSelectedStore(record);
            }, this);
        }
    },
    //资源面板初始化
    initResourcesPanel: function () {
        this.resourcesPanel = new HY.ResourcesPanel({
            url: this.url,
            enableCommonDepartment: this.enableCommonDepartment,
            extensionUrl: this.extensionUrl,
            rootCode: this.rootCode,
            primaryKey: this.primaryKey,
            treeSearchText: this.treeSearchText,
            enableTreePanel: this.enableTreePanel,
            enableGridPanel: this.enableGridPanel,
            requestMethod: this.requestMethod,
            enableChild: this.enableChild,
            treeTabTitle: this.treeTabTitle,
            gridTabTitle: this.gridTabTitle,
            searchTabTitle: this.searchTabTitle,
            treeRootText: this.treeRootText,
            gridRootText: this.gridRootText,
            treeIcon: this.treeIcon,
            checkModel: this.checkModel,
            gridOneIcon: this.gridOneIcon,
            gridMoreIcon: this.gridMoreIcon,
            treePageSize: this.treePageSize,
            gridPageSize: this.gridPageSize,
            searchPageSize: this.searchPageSize,
            minSearchTextSize: this.minSearchTextSize,
            fields: this.fields,
            rootVisible: this.rootVisible,
            uiProvider: this.uiProvider,
            baseParams: this.baseParams
        });
        this.initSelectedStore();
        this.initResourcesPanelEvents();
        return this.resourcesPanel;
    },
    initResourcesPanelEvents: function () {
        if (!this.hideSelectedEmps && this.selectedRegion == 'top') {
            this.resourcesPanel.on('recordselect', function (store, records, index) {
                Ext.each(records, function (record) {
                    this.addTopItem(record);
                }, this);
            }, this);
            this.resourcesPanel.on('recorddeselect', function (store, record, index) {
                this.removeTopItem(record);
            }, this);
        }
        this.resourcesPanel.on('recordselect', function (store, records, index) {
            this.setSelectedTip(this.selectedStore.getCount());
        }, this);
        this.resourcesPanel.on('recorddeselect', function (store, record, index) {
            this.setSelectedTip(this.selectedStore.getCount());
        }, this);
    },
    //初始化已选择的资源(top)
    initSelectedTopPanel: function () {
        this.topPanel = new Ext.Panel({
            layout: 'column',
            border: false,
            autoWidth: true,
            bodyStyle: "padding:3px",
            autoHeight: true
        });
        return this.topPanel;
    },
    //初始化已选择的资源(right)
    initSelectedRightPanel: function () {
        //资源
        this.selectedRightPanel = new Ext.grid.GridPanel({
            border: false,
            header: false,
            stripeRows: true, //交替
            cm: new Ext.grid.ColumnModel([
				{ header: this.gridSelectedText, dataIndex: 'Name' },
				{ header: '父' + this.gridSelectedText, dataIndex: 'ParentName' }
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
    initSelectedStore: function () {
        this.selectedStore = this.resourcesPanel.getSelectedStore();
    },
    addTopItem: function (record) {
        if (this.checkModel == 'single') {
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
    }
});
Ext.reg('chooseresources', HY.ChooseResources);
