Ext.namespace('HY.CallProcedure');
HY.CallProcedure = function(config){
    this.addEvents('selectcomplete');
    Ext.QuickTips.init();//初始化tooltip
	HY.CallProcedure.superclass.constructor.call(this,config);
//	this.myjsonq = {root: []};
	this.returnJson = {paramsInfo:[],formulaInfo:[]};
};
Ext.extend(HY.CallProcedure, Ext.Window,{
	title:false,
	LanguageUrl:'',//多语言数据URL
	url:'SelectorManager.ashx',//数据URL
	LanguageUrl:'',//多语言数据URL
	width:500,
	height:425,
	minWidth:500,
	minHeight:425,
	closeAction:'hide',
	plain:true,
	hideMode:'offsets',
	border:false,
	buttonAlign:'center',
	modal:true,
	procedurePageSize:6,
	procedureFields:[
        'ProcID','DBName','ProcName','ProcShowName','StoredType','ReturnValueType'
	],
	procedureParamsFields:[
		'ParamID','ProcID','ParamName','ParamType','ParamLength','IsOutput','IsNullParam','PItemId','PItemValue','PItemValueType'
	],
	buttons:[
		{text:'确定',handler:function(){
				var win = this.ownerCt.ownerCt;
				win.initOkBtnFn();
		}},
		{text:'取消',handler:function(){
				var win = this.ownerCt.ownerCt;
				win.hide();
		}}
	],
	initSelectorWindow:function(rec){
	    if(this.selectorWindow){
	        if (this.selectorWindow.rendered == true) {
                this.selectorWindow.destroy();
            }
	    }
	    this.selectorWindow = new HY.SelectorWindow({enableGridPanel:false,enableFormulaPanel:false});
	    this.selectorWindow.on('selectcomplete',function(record,selectedType){
            rec.set('PItemValue',record.get('XmlId'));
        });
	    return this.selectorWindow;
	},
	initOkBtnFn:function(){
	    var procedurerd = this.procedurePanel.getSelectionModel().getSelected();
	    if(!procedurerd){
	        this.App.setAlert('系统提示','请选择存储过程!');
	        return
	    }
	    if(!this.comboReturnType.isValid() || !this.textfieldProcShowName.isValid())
		    return
	    var paramsrd = this.procedurePanel.getSelectionModel().getSelected();
	    var isValid = false;
        this.procedureParamsStore.each(function(rd,rowIndex){
            if(rd.get('PItemValue')==''){
                isValid=true;
                return false;
            }
        },this);
        if(isValid){
            this.App.setAlert('系统提示','请配置存储过程参数的值!');
            return
        }
        
        var returnType = this.comboReturnType.getValue();
        var procedureShowName = this.textfieldProcShowName.getValue();
        var dbName = this.topPanel.procedureDBName.getValue();
        var procedureName = procedurerd.get('ProcName');
	    var json = WhiteShell.Globle.DataFormat.gridStoreSerialization(this.procedureParamsStore);
	    var procedureJson = {
	        dbName:dbName,
	        returnType: returnType, 
	        procedureShowName:procedureShowName, 
	        procedureName:procedureName, 
	        procedureParams:json,
	        id: Ext.ux.newGuid()
	    };
	    this.returnJson.paramsInfo.push(procedureJson);
	    
	    
	    this.fireEvent('selectcomplete',this.returnJson, procedureJson.id,procedureShowName);
        this.hide();
	},
	init:function(){
		var mainPanel = {
			xtype:'panel',
			layout:'border',
//			tbar:this.initSelectedTopPanel(),
			hideBorders:true,
			items:this.initBorder()
		};
		return mainPanel;
	},
	initBorder:function(){
		//面
		var mainPanelItems = [];
		mainPanelItems.push(this.initTop());
		mainPanelItems.push(this.initDown());
		return mainPanelItems;
	},
	initTop:function(){
	    this.topPanel = new Ext.Panel({
			region:'center',
			layout:'fit',
			border:true,
			tbar:this.initProcedureTbar(),
			items:this.initTopPanel()
		});
		return this.topPanel;
	},
	initDown:function(){
	    this.downPanel = new Ext.Panel({
	        region:'south',
			height:123,
			split:true,
			border:true,
			layout:'fit',
			items:this.initDownPanel()
	    });
		return this.downPanel;
	},
	//初始化
	initComponent:function(){
	    var mainPanel = this.init();
		Ext.apply(this, mainPanel);
		Ext.apply(this.initialConfig, mainPanel);
		HY.CallProcedure.superclass.initComponent.apply(this, arguments);
	},
	afterRender:function() {
		HY.CallProcedure.superclass.afterRender.apply(this, arguments);
		this.App = new Ext.App({});
	},
	//初始化存储过程grid的store
	initProcedureStore: function(){
		this.procedureStore = new Ext.data.JsonStore({
		    proxy:new Ext.data.HttpProxy({
			    url:this.url,
			    method:"POST"
		    }),
		    baseParams:{method:'GetSystemProcedureList',dbName:'',limit:this.procedurePageSize},
		    root: 'Table',
		    totalProperty:'totalProperty',
		    fields:this.procedureFields,
		    listeners:{
		        'load':function(){
		            this.returnJson = {paramsInfo:[],formulaInfo:[]};
		            this.procedureParamsStore.removeAll();
		        },
		        scope:this
		    }
	    });
		return this.procedureStore;
	},
	initTopPanel:function(){
	    this.procedureSm = new Ext.grid.CheckboxSelectionModel({singleSelect:true});
	    var colModel = new Ext.grid.ColumnModel([
		    this.procedureSm,
		    {header:'存储过程名称',dataIndex:'ProcName',width:60,sortable:true}
		]);
	    this.procedurePanel = new Ext.grid.GridPanel({
			store:this.initProcedureStore(),
			selModel:this.procedureSm,
			colModel:colModel,
			border:false,
			loadMask:true,//遮罩
			stripeRows:true,//交替
			viewConfig: {forceFit: true},//自动间距
			tbar:this.initGridTbar(),
			bbar: new Ext.PagingToolbar({
                pageSize: this.procedurePageSize,
                store: this.procedureStore,
                displayInfo: true,
                emptyMsg:'没有记录',
				prevText:'上一页',
				nextText:'下一页',
				refreshText:'刷新',
				firstText:'第一页',
				lastText:'最后一页',
				beforePageText:'当前页',
				afterPageText:'共{0}页',
				displayMsg:'显示 {0}-{1}条信息,一共{2}条',
                plugins: new Ext.ux.ProgressBarPager()
            })
	    });
	    this.procedurePanel.on('render', function(grid) {
	        var gridEl = grid.getEl();
            gridEl.select('div.x-grid3-hd-checker').removeClass('x-grid3-hd-checker');
	    });
	    //选中
	    this.procedureSm.on('rowselect',function(e,rowIndex,record){
		    this.procedureParamsStore.baseParams.dbName = this.topPanel.procedureDBName.getValue();
		    this.procedureParamsStore.baseParams.procName = record.get('ProcName');
		    this.procedureParamsStore.load();
	    },this);
	    //反选
        this.procedureSm.on('rowdeselect',function(e,rowIndex,record){
		    
	    },this);
	    return this.procedurePanel;
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
            emptyText:'请选择',
            editable:false,
            displayField:'Name',
            valueField:'Code',
            mode:'local',
            ref:'../procedureDBName',
            width:90,
            store:store,
            forceSelection:true,
            triggerAction:'all'
        });
        comboBox.on('select',function(combo,record,index){
            this.procedureStore.baseParams.dbName=record.get('Code');
            this.procedureStore.load({params:{start:0}});
        },this);
        return comboBox
	},
	initGridTbar:function(){
	    
	    return [
			'搜索: ',
             new Ext.ux.form.SearchField({
                store: this.procedureStore,
                paramName:'search',
                width:140
             }),
             '->',
			{xtype: 'button',iconCls:"x-btn-text x-tbar-loading",text: '刷新',
		        handler:function(){
		            if(this.procedureStore)
				        this.procedureStore.reload();
		    },scope:this}
			
		];
	},
	initProcedureTbar:function(){
	    this.textfieldProcShowName = new Ext.form.TextField({
            width:120,
            allowBlank:false,
            ref: '../tbarProcShowName'
        });
	    return [
			'数据库名: ',this.initComboBox(),'-',
			'返回类型: ',this.initComboReturnType(),'-',
			'显示名称: ',this.textfieldProcShowName
		];
	},
	//初始化存储过程参数grid的store 
	initProcedureParamsStore: function(){
		this.procedureParamsStore = new Ext.data.JsonStore({
            proxy:new Ext.data.HttpProxy({
			    url:this.url,
			    method:"POST"
		    }),
            baseParams:{method:"GetProcSystemParams",dbName:'',procName:''},
            root: 'Table',
            fields: this.procedureParamsFields
        });
		return this.procedureParamsStore;
	},
	initComboReturnType:function(refPath,name){
	    this.comboReturnType = new Ext.form.ComboBox({
            typeAhead:true,
            triggerAction:'all',
            lazyRender:true,
            mode:'local',
            editable:false,
            width:90,
            ref:refPath,
            emptyText:'返回值类型',
            allowBlank:false,
            name:name,
            store:new Ext.data.JsonStore({
                fields:['Code','Name'],
		        data:[
                    {Code: '1', Name: '字符串'},
                    {Code: '2', Name: '整型'},
                    {Code: '3', Name: '浮点型'},
                    {Code: '4', Name: '布尔型'},
                    {Code: '5', Name: '时间型'},
                    {Code: '6', Name: '数据集'}
                ]
            }),
            valueField:'Code',
            displayField:'Name'
        });
        return this.comboReturnType;
	},
	initComboType:function(refPath,name){
	    var comboType = new Ext.form.ComboBox({
	        typeAhead:true,
	        triggerAction:'all',
	        lazyRender:true,
	        editable:false,
	        mode:'local',
	        ref:refPath,
            name:name,
	        store:new Ext.data.JsonStore({
	            fields:['Code','Name'],
			    data:[{Code: '1', Name: '数值'},
			        {Code: '2', Name: '文本'},
			        {Code: '3', Name: '时间'},
			        {Code: '4', Name: '布尔'},
			        {Code: '5', Name: '环境变量'},
			        {Code: '6', Name: '流程DataFields'},
			        {Code: '7', Name: '节点DataFields'},
			        {Code: '8', Name: '表单XPath'},
			        {Code: '9', Name: 'SQL语句'},
			        {Code: '10', Name: '存储过程'},
			        {Code: '11', Name: '公式'}
//			        ,{Code: '12', Name: '选人规则前置条件'}
			    ]
	        }),
	        valueField:'Code',
	        displayField:'Name'
	    }); 
	    return comboType;
	},
	initDownPanel:function(){
	    var comboType = this.initComboType(null,null);
	    var selModel = new Ext.grid.CheckboxSelectionModel({singleSelect:false});
	    var colModel = new Ext.grid.ColumnModel([
	        {header: '参数',dataIndex: 'ParamName',sortable: true,width: 120},
	        {header: '数据类型',dataIndex: 'ParamType',sortable: true,width: 90},
	        {header: '输出参数',dataIndex: 'IsOutput',sortable: true,width: 60,renderer: function(v){return v=='0'? '否':'是'}},
	        {header: '值',dataIndex: 'PItemValue',sortable: true,width: 90,editor:new Ext.form.TextField({allowBlank: false})},
	        {header: '值类型',dataIndex: 'PItemValueType',sortable: true,width: 90,editor:comboType,renderer:Ext.util.Format.comboRenderer(comboType)},
            {header: 'hidden',dataIndex: 'ProcID',width: 100,hidden: true}
	    ]);
	    
	    this.procedureParamsGrid = new Ext.grid.EditorGridPanel({
            border:false,
            stripeRows:true,//交替
		    loadMask:true,//遮罩
		    viewConfig: {forceFit: true},//自动间距
		    selModel:selModel,
		    colModel:colModel,
		    clicksToEdit:1,
		    store:this.initProcedureParamsStore(),
//		    tbar:this.initProcGridBbar(),
		    listeners:{
				'beforeedit':function(e){
					if(e.column==3){
					    var rec = e.record;
					    var PItemValueType = rec.get('PItemValueType');
					    if(PItemValueType==''){
					        this.App.setAlert('系统提示', '请选择值类型!');
					        return false;
					    }
					    if(PItemValueType==10){
					        this.initProcedureWindow(rec);
					    }else if(PItemValueType==8){
					        this.initSelectorWindow(rec).show();
					    }else if(PItemValueType==11){
					        this.initFormulaWindow(rec);
					    }
					}
				},
				'afteredit':function(e){
				    if(e.column==4){
				        var rec = e.record;
				        rec.set('PItemValue','');
				    }
				},
				scope:this
			}
		});
		return this.procedureParamsGrid;
	},
	initProcedureWindow:function(rec){
	    var callProcedure = new HY.CallProcedure();
        callProcedure.on('selectcomplete',function(procedureJson, id, procedureShowName){
            for(var i=0;i<procedureJson.paramsInfo.length;i++){
                this.returnJson.paramsInfo.push(procedureJson.paramsInfo[i]);
            }
            for(var i=0;i<procedureJson.formulaInfo.length;i++){
                this.returnJson.formulaInfo.push(procedureJson.formulaInfo[i]);
            }
            rec.set('PItemValue',id);
        },this);
        callProcedure.show();
	},
	initFormulaWindow:function(rec){
	    var callFormula = new HY.CallFormula();
        callFormula.on('selectcomplete',function(procedureJson, id, formulaName){
            for(var i=0;i<procedureJson.paramsInfo.length;i++){
                this.returnJson.paramsInfo.push(procedureJson.paramsInfo[i]);
            }
            for(var i=0;i<procedureJson.formulaInfo.length;i++){
                this.returnJson.formulaInfo.push(procedureJson.formulaInfo[i]);
            }
            rec.set('PItemValue',id);
        },this);
        callFormula.show();
	}
});
//Ext.onReady(function(){
//    var callProcedure = new HY.CallProcedure();
//    callProcedure.on('selectcomplete',function(myjsonq, id){
//        alert(myjsonq);
//        alert(id)
//    },this);
//    callProcedure.show();
//});
