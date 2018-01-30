Ext.namespace('HY.SelectorPanel');
HY.SelectorPanel = function(config){
    Ext.QuickTips.init();//初始化tooltip
    //config.language = new language20('GetVariableMaintenanceLanguage', '/Web/SelectorManager.ashx');
	HY.SelectorPanel.superclass.constructor.call(this,config);
};
Ext.extend(HY.SelectorPanel, Ext.Panel,{
	title:false,
	LanguageUrl:'',//多语言数据URL
	url: '/Web/SelectorManager.ashx', //数据URL
	extensionUrl:'',//提交请求的扩展URL
	width:500,
	height:345,
	language:null,
	activeTab:0,//added by leo
	hideBorders:true,//不显示本身和子容器边框
	isXPathEdit:false,//是否是XPath编辑页面
	selectedType:null,//1.存储过程 2.公式 3.xPath
	enableGridPanel:false,//是否显示存储过程面板
	enableFormulaPanel:false,//是否显示公式面板
	enableXPathGridPanel:true,//是否显示XPath面板
	formulaPageSize:8,
	procPageSize:8,
	fields : [
	    {name:'ProcID',mapping:'ProcID'},
	    {name:'DBName',mapping:'DBName'},
	    {name:'ProcName',mapping:'ProcName'},
	    {name:'ProcShowName',mapping:'ProcShowName'},
	    {name:'StoredType',mapping:'StoredType'},
	    {name:'ReturnValueType',mapping:'ReturnValueType'}
	],
	init:function(){
		var mainPanel = {
			xtype:'panel',
			layout:'fit',
			hideBorders:true,
			items:this.initResTabPanel()
		};
		return mainPanel;
	},
	//初始化选项卡面板
	initResTabPanel: function(){
		this.resTabPanel=new Ext.TabPanel({
			activeTab:parseInt(this.activeTab),
			border:false,
			enableTabScroll:true,
			layoutOnTabChange:true,
			items:[
//			    {title:'存储过程',layout:'fit',items:this.initGridPanel()},
//			    {title:'公式',layout:'fit',items:this.initFormulaPanel()},
//			    {title:'XPath',layout:'fit',items:this.initXPathGridPanel()}
			],
			listeners:{
				'tabchange': function(a,b){
				    if (b.title == '公式') {
						if(!this.formulaStore.getCount())
							this.formulaStore.load({params:{start:0}});
					}
				}
				,scope:this
			}
		});
		
		if(this.enableGridPanel){
		    this.resTabPanel.add({ title: '存储过程', layout: 'fit', items: this.initGridPanel() });
		}
		if(this.enableFormulaPanel){
		    this.resTabPanel.add({ title: '公式', layout: 'fit', items: this.initFormulaPanel() });
		}
		if(this.enableXPathGridPanel){
			this.resTabPanel.add({title:'XPath',layout:'fit',items:this.initXPathGridPanel()});
		}
		return this.resTabPanel;
	},
	//初始化
	initComponent:function(){
	    var mainPanel = this.init();
		Ext.apply(this, mainPanel);
		Ext.apply(this.initialConfig, mainPanel);
		HY.SelectorPanel.superclass.initComponent.apply(this, arguments);
	},
	afterRender:function() {
		HY.SelectorPanel.superclass.afterRender.apply(this, arguments);
		this.initSelectedStore();
		this.App = new Ext.App({});
	},
	initFormulaStore:function(){
	    this.formulaStore = new Ext.data.JsonStore({
            proxy:new Ext.data.HttpProxy({
		        url:this.url,
		        method:"POST"
	        }),
            baseParams:{method:"GetExpressionList",limit:this.formulaPageSize,search:''},
            root: 'Table',
            totalProperty: 'totalProperty',
            fields : ['ExpressionID' ,'ExpressionName','ReturnValueType','ExpressionType']
        });
        return this.formulaStore
	},
	initFormulaPanel:function(){
	    this.formulaGridSm=new Ext.grid.CheckboxSelectionModel({checkOnly:false,singleSelect:true});//checkOnly:true,
	    var colModel=new Ext.grid.ColumnModel([
		    this.formulaGridSm,
		    {header:'ExpressionID',dataIndex:'ExpressionID',hidden:true},
		    { header: '公式名称', dataIndex: 'ExpressionName', width: 200 },
		    { header: '公式返回类型', dataIndex: 'ReturnValueType', width: 150, sortable: true, renderer: this.initRendererReturnValueType },
		    { header: '公式类型', dataIndex: 'ExpressionType', width: 150, sortable: true, renderer: function (v) { return v == '1' ? '计算公式' : '布尔公式' } }
		]);
		this.formulaGridPanel = new Ext.grid.GridPanel({
		    store:this.initFormulaStore(),
			selModel:this.formulaGridSm,
			colModel:colModel,
			border:false,
			stripeRows:true,//交替
			loadMask:true,//遮罩
			viewConfig: {forceFit: true},
			tbar:this.initFormulaTbar(),
//			plugins: new Ext.ux.PanelResizer({
//                minHeight: 100
//            }),
            bbar: new Ext.PagingToolbar({
                pageSize: this.formulaPageSize,
                store: this.formulaStore,
                displayInfo: true,
                emptyMsg: '没有记录',
                prevText: '上一页',
                nextText: '下一页',
                refreshText: '刷新',
                firstText: '第一页',
                lastText: '最后一页',
                beforePageText: '当前页',
                afterPageText: '共{0}页',
                displayMsg: '显示第{0}条到第{1}条信息,一共{2}条',
                plugins: new Ext.ux.ProgressBarPager()
            })
		});
		//选中
		this.formulaGridSm.on('rowselect',function(e,rowIndex,record){
				if(this.formulaGridPanel.loading !== true){
					if(record){
						this.selectedStore.removeAll();
						this.selectedStore.add(record);
						this.selectedType=2;
					}
				}
		},this);
		//反选
		this.formulaGridSm.on('rowdeselect',function(e,rowIndex,record){
				if(this.formulaGridPanel.loading !== true){
					if(record){
						this.selectedStore.removeAll();
						this.selectedType=null;
					}
				}
		},this);
		return this.formulaGridPanel;
	},
	initXPathGridTbar:function(){
	    return [
			'流程名称: ', this.initXPathComboBox(), '->',
			{ xtype: 'button', iconCls: "x-btn-text x-tbar-loading", text: '刷新',
		        handler:function(){
		            this.xPathGridStore.reload();
		    },scope:this}
			];
	},
	initXPathComboBox:function(){
	    var comboBox=new Ext.form.ComboBox({
            name:'DBCombo',
            emptyText: '请选择',
            editable:false,
            displayField:'Name',
            valueField:'Code',
            mode:'local',
            width:120,
            ref: '../xPathDBCombo',
            store:new Ext.data.JsonStore({
	            proxy:new Ext.data.HttpProxy({
		            url:this.url,
		                method:"POST"
	                }),
	                autoLoad:true,
	                baseParams:{method:"GetComboByParentCode"},
	                root: 'procName',
	                fields:['Code','Name']
            }),
            forceSelection:true,
            triggerAction:'all'
        });
        comboBox.on('select',function(combo,record,index){
            this.xPathGridStore.baseParams.procName=record.get('Code');
            this.xPathGridStore.load();
        },this);
        return comboBox
	},
	initXPathGridStore:function(){
	    this.xPathGridStore = new Ext.data.JsonStore({
            proxy:new Ext.data.HttpProxy({
		        url:this.url,
		        method:"POST"
	        }),
            baseParams:{method:"ListXpathByProcessName",procName:''},
            root: 'Table',
            fields : [{name:'XmlId',mapping:'XmlId'},
	            {name:'ProcessName',mapping:'ProcessName'},
	            {name:'XPath',mapping:'XPath'},
	            {name:'XpathDesc',mapping:'XpathDesc'},
	            {name:'ReturnValueType',mapping:'ReturnValueType'},
	            {name:'PItemValue',mapping:'PItemValue'},
	            {name:'PItemValueType',mapping:'PItemValueType'}
	        ]
        });
        return this.xPathGridStore
	},
	initRendererReturnValueType:function(v){
	    var temp="";
        switch(v){
            case "1": temp = '字符串'; break;
            case "2": temp = '整型'; break;
            case "3": temp = '浮点型'; break;
            case "4": temp = '布尔型'; break;
            case "5": temp = '时间型'; break;
            case "6": temp = '数据集'; break;
        } 
        return temp;  
	},
	initRendererPItemValueType:function(v){
	    var temp="";
        switch(v){
//            case "1": temp = '数值'; break;
            case "2": temp = '文本'; break;
//            case "3": temp = '时间'; break;
//            case "4": temp = '布尔'; break;
            case "5": temp = '环境变量'; break;
            case "6": temp = '流程全局变量'; break;
            case "7": temp = '节点局部变量'; break;
            case "8": temp = '表单字段'; break;
            case "9": temp = 'SQL语句'; break;
            case "10": temp = '函数'; break;
            case "11": temp = '公式'; break;
//            case "12": temp = '选人规则前置条件'; break;
//            case "13": temp = '公式项'; break;
        } 
        return temp;  
	},
	initXPathGridPanel:function(){
	    this.xPathGridSm=new Ext.grid.CheckboxSelectionModel({checkOnly:false,singleSelect:true});//checkOnly:true,
	    var colModel=new Ext.grid.ColumnModel([
		    this.xPathGridSm,
		    {header:'XmlId',dataIndex:'XmlId',hidden:true},
		    { header: '流程名称', dataIndex: 'ProcessName', width: 200, hidden: true },
		    {header:'XPath',dataIndex:'XPath',width:150,hidden:true},
		    { header: '描述', dataIndex: 'XpathDesc', width: 150, sortable: true },
		    { header: 'XPath返回类型', dataIndex: 'ReturnValueType', width: 100, sortable: true, renderer: this.initRendererReturnValueType, scope: this },
		    { header: '值', dataIndex: 'PItemValue', width: 100, sortable: true },
		    { header: '返回值类型', dataIndex: 'PItemValueType', width: 100, sortable: true, renderer: this.initRendererPItemValueType, scope: this }
		]);
		this.xPathGridPanel = new Ext.grid.GridPanel({
		    store:this.initXPathGridStore(),
			selModel:this.xPathGridSm,
			colModel:colModel,
			border:false,
			clicksToEdit:1,
			stripeRows:true,//交替
			loadMask:true,//遮罩
			viewConfig: {forceFit: true},//自动间距
			tbar:this.initXPathGridTbar()
		});
		//选中
		this.xPathGridSm.on('rowselect',function(e,rowIndex,record){
				if(this.xPathGridPanel.loading !== true){
					if(record){
						this.selectedStore.removeAll();
						this.selectedStore.add(record);
						this.selectedType=3;
					}
				}
		},this);
		//反选
		this.xPathGridSm.on('rowdeselect',function(e,rowIndex,record){
				if(this.xPathGridPanel.loading !== true){
					if(record){
						this.selectedStore.removeAll();
						this.selectedType=null;
					}
				}
		},this);
		return this.xPathGridPanel;
	},
	initComboBox:function(){
	    var store= new Ext.data.JsonStore({
	        proxy:new Ext.data.HttpProxy({
            url:this.url,
                method:"POST"
            }),
            autoLoad:true,
            baseParams:{method:"GetDBByParentCode"},
            root: 'procName',
	        fields:['Code','Name']
	    });
	    var comboBox=new Ext.form.ComboBox({
            name:'DBCombo',
            emptyText: '请选择',
            editable:false,
            displayField:'Name',
            valueField:'Code',
            mode:'local',
            width:120,
            store:store,
            forceSelection:true,
            triggerAction:'all'
        });
        comboBox.on('select',function(combo,record,index){
            this.gridStore.baseParams.dbName=record.get('Code');
            this.gridStore.load();
        },this);
        return comboBox
	},
	initGridStore:function(){
	    this.gridStore = new Ext.data.JsonStore({
            proxy:new Ext.data.HttpProxy({
		        url:this.url,
		        method:"POST"
	        }),
            baseParams:{method:"GetProcedureListByDBName",limit:this.procPageSize,dbName:'',search:''},
            root: 'Table',
            totalProperty: 'totalProperty',
            fields : this.fields
        });
        return this.gridStore
	},//存储过程tbar
	initGridTbar:function(){
	    return [
			'数据库名: ', this.initComboBox(), '-',
			'存储过程名称: ',
             new Ext.ux.form.SearchField({
                store: this.gridStore,
                paramName:'search',
                width:120
             }),
             '->',
			{ xtype: 'button', iconCls: "x-btn-text x-tbar-loading", text: '刷新',
		        handler:function(){
		            if(this.gridStore)
				        this.gridStore.reload();
		    },scope:this}
			];
	},
	initGridPanel:function(){
	    this.gridSm=new Ext.grid.CheckboxSelectionModel({checkOnly:false,singleSelect:true});//checkOnly:true,
	    var colModel=new Ext.grid.ColumnModel([
		    this.gridSm,
		    {header:'ProcID',dataIndex:'ProcID',hidden:true},
		    {header:'DBName',dataIndex:'DBName',hidden:true},
		    { header: '存储过程名称', dataIndex: 'ProcName', width: 200, sortable: true },
		    { header: '显示名称', dataIndex: 'ProcShowName', width: 150, sortable: true },
		    { header: '类型', dataIndex: 'StoredType', width: 100, sortable: true, renderer: function (v) { return v == '1' ? '存储过程' : 'SQL语句' } },
		    { header: '返回值类型', dataIndex: 'ReturnValueType', width: 100, sortable: true, renderer: this.initRendererReturnValueType }
		]);
		this.gridPanel = new Ext.grid.GridPanel({
		    store:this.initGridStore(),
			selModel:this.gridSm,
			colModel:colModel,
			border:false,
			stripeRows:true,//交替
			loadMask:true,//遮罩
			viewConfig: {forceFit: true},//自动间距
			tbar:this.initGridTbar(),
			bbar: new Ext.PagingToolbar({
                pageSize: this.procPageSize,
                store: this.gridStore,
                displayInfo: true,
				emptyMsg: "没有记录",
				prevText: '上一页',
				nextText: '下一页',
				refreshText: '刷新',
				firstText: '第一页',
				lastText: '最后一页',
				beforePageText: '当前页',
				afterPageText: '共{0}页',
				displayMsg: '显示 {0}-{1}条信息,一共{2}条',
                plugins: new Ext.ux.ProgressBarPager()
            })
		});
		//选中
		this.gridSm.on('rowselect',function(e,rowIndex,record){
				if(this.gridPanel.loading !== true){
					if(record){
						this.selectedStore.removeAll();
						this.selectedStore.add(record);
						this.selectedType=1;
					}
				}
		},this);
		//反选
		this.gridSm.on('rowdeselect',function(e,rowIndex,record){
				if(this.gridPanel.loading !== true){
					if(record){
						this.selectedStore.removeAll();
						this.selectedType=null;
					}
				}
		},this);
		return this.gridPanel;
	},
	//初始化选中store
	initSelectedStore:function(){
		if(!this.selectedStore){
			//创建已选STORE,将时间绑定到全局事件中
			this.selectedStore = new Ext.data.JsonStore({
				fields:this.fields
			});
		}
		return this.selectedStore;
	},
	initFormulaTbar:function(){
	    return [
	        '搜索: ', ' ',
            new Ext.ux.form.SearchField({
                store: this.formulaStore,
                paramName:'search',
                width:150
            }),
	        '->',
	        { xtype: 'button', text: '跳转至编辑',		        
		        handler:function(){
		            var tab=window.parent.tab;
		            var nodeId='00010000020001000000000000000000000000000000000000';
		            var nodeText='变量维护';
		            var url="/Web/Page/VariableMaintenance/VariableMaintenance.aspx?activeTab=1";
		            var n = tab.getComponent(nodeId);
		            if (n) {
		                tab.setActiveTab(n);
			            return false;
		            }
		            var n = tab.add({
			            id: nodeId,
			            title: '变量维护',
			            closable:true,
			            html : '<iframe src='+url+' width="100%" height="100%" frameborder="0" scrolling="auto" name='+nodeText+' id='+nodeId+'></iframe>'
		            });
		            tab.setActiveTab(n);
		            tab.doLayout();
		    },scope:this},
	        {xtype: 'button',iconCls:"x-btn-text x-tbar-loading",text: '刷新',
		        handler:function(){
		            this.formulaStore.reload();
		    },scope:this}
	    ];
	}
});

Ext.namespace('HY.SelectorWindow');
HY.SelectorWindow = function(config){
    //触发全局事件，已选记录store发生变更时
	this.addEvents('selectcomplete');
	//载入对语言
	//config.language = new language20('GetLanguageResources',this.LanguageResourcesUrl);
	
	//窗口标题
	//config.title = config.language ? config.language.title : '资源选择';
	
	HY.SelectorWindow.superclass.constructor.call(this,config);
};
Ext.extend(HY.SelectorWindow, Ext.Window,{
    title:'选择器',
	LanguageUrl:'',//多语言数据URL
	url: '/Web/SelectorManager.ashx', //数据URL
	extensionUrl:'',//提交请求的扩展URL
	width:450,
	height:345,
	minWidth:350,
	minHeight:345,
	closeAction:'hide',
	plain:true,
	hideMode:'offsets',
	border:false,
	buttonAlign:'center',
	modal:true,
	enableGridPanel:true,//是否显示存储过程面板
	enableFormulaPanel:true,//是否显示公式面板
	enableXPathGridPanel:true,//是否显示XPath面板
	onOkClicked:function(){
		this.onOk();
	},
	onOk:function(){
		this.hide();
		this.fireEvent('selectcomplete',this.returnRecord(),this.SelectorPanel.selectedType);
	},
	onCancelClicked:function(){
		this.onCancel();
	},
	onCancel:function(){
		this.hide();
	},
	//返回选中的record
	returnRecord:function(){
	    var records=this.SelectorPanel.selectedStore.getRange();
	    if(records.length>0)
		    return records[0];
		else
		    return null;
	},
	buttons:[
		{text:'确定',id:'btnOk',
			handler:function(){
			    var win = this.ownerCt.ownerCt;
				win.onOkClicked();
			}
		},
		{text:'取消',id:'btnCancel',
			handler:function(){
			    var win = this.ownerCt.ownerCt;
				win.onCancelClicked();
			}
		}
	],
    init:function(){
		var mainPanel = {
			xtype:'panel',
			layout:'fit',
			hideBorders:true,
			items:new HY.SelectorPanel({
			    ref:'SelectorPanel',
			    enableGridPanel:this.enableGridPanel,
	            enableFormulaPanel:this.enableFormulaPanel,
	            enableXPathGridPanel:this.enableXPathGridPanel
			})
		};
		return mainPanel;
	},
	//初始化
	initComponent:function(){
	    var mainPanel = this.init();
		Ext.apply(this, mainPanel);
		Ext.apply(this.initialConfig, mainPanel);
		HY.SelectorWindow.superclass.initComponent.apply(this, arguments);
	},
	afterRender:function() {
		HY.SelectorWindow.superclass.afterRender.apply(this, arguments);
		this.App = new Ext.App({});
	}
});