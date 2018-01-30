/**************************************
说明：函数调用模块js
版本：1.0
作者：xuyiru
创建日期：2010-7-19
修改时间：
修改人：
修改内容：
**************************************/

Ext.namespace('HY.CallFunction');
//控件构造函

HY.CallFunction = function(config){
    this.addEvents('selectcomplete');
	Ext.QuickTips.init();//初始化tooltip
	this.App = new Ext.App({});
	Ext.apply(this,config);//将config的配置放入this中
	HY.CallFunction.superclass.constructor.call(this,config);
	this.returnJson = {paramsInfo:[],formulaInfo:[]};
};
Ext.extend(HY.CallFunction, Ext.Window,{
	width:500,
	height:310,
	layout:'fit',
	closeAction:'hide',
	plain:true,
	hideMode:'offsets',
	modal:true,
	url: '/Web/CallFunction.ashx', //提交请求URL
	extensionUrl:'',//提交请求的扩展URL
	title:'函数',//不需要使用false,需要只用直接如：'title名称',
	hideBorders:true,//不显示本身和子容器边框
	procedurePageSize:8,//函数分页数
	border:false,
	buttonAlign:'center',
	procedureId:null,
	procedureFields:[
	    'Res_Id','Res_Name','CNName','Description','Name','Res_Data','Res_Data1','Res_CodeData2','ParamName','ParamType','mysort','PItemValueType','PItemValue'
	],	
	//初始化
	initComponent:function(){
		var mainPanel = this.init();
		Ext.apply(this, mainPanel);
		Ext.apply(this.initialConfig, mainPanel);
		HY.CallFunction.superclass.initComponent.apply(this, arguments);
	},
	afterRender:function() {
		HY.CallFunction.superclass.afterRender.apply(this, arguments);
	},
	init:function(){
		var mainPanel = {
			xtype:'panel',
			layout:'border',
			hideBorders:true,
			items:this.initBorder()
		};
		return mainPanel;
	},
	initBorder:function(){
		//面
		var mainPanelItems = [];
		mainPanelItems.push(this.initLeft());
		mainPanelItems.push(this.initRight());
		return mainPanelItems;
	},
	initLeft:function(){
		return {
			region:'center',
			layout:'fit',
			header:false,
			border:true,
			title:this.title,
			items:this.initResourcesPanel() 
		};
	},
	initRight:function(){
		return {
			region:'east',
			layout:'fit',
			split:true,
			border:true,
			collapsible:true,
			collapseMode:'mini',
			width: 280,
			minSize: 280,
			maxSize: 350,
			title:'参数',
			items:this.initSelectedRightPanel()
		};
	},
	//初始化函数的store
	initProcedureStore: function(){
		this.procedureStore = new Ext.data.JsonStore({
		    proxy:new Ext.data.HttpProxy({
			    url:this.url,
			    method:"POST"
		    }),
		    baseParams:{method:'GetSystemFunctionList',limit:this.procedurePageSize,procedureId:''},
		    root: 'Table',
		    autoLoad:true,
		    totalProperty:'totalProperty',
		    fields:this.procedureFields,
		    listeners:{
		        'load':function(){
		            this.returnJson = {paramsInfo:[],formulaInfo:[]};
		            this.procedureParamsStore.removeAll();
		            if(this.procedureId){
		                var index = this.procedureStore.findExact('mysort','0');
		                if(index!=-1){
		                    this.procedureParamsStore.baseParams.procedureId = this.procedureId;
		                    this.procedureSm.selectRow(index,true);
		                }
		                this.procedureId = null;
		                this.procedureParamsStore.baseParams.procedureId = '';
		            }
		        },
		        'beforeload':function(){
		            if(this.procedureId){
		                this.procedureStore.baseParams.procedureId = this.procedureId;}
		        },
		        scope:this
		    }
	    });
		return this.procedureStore;
	},
	initGridTbar:function(){
	    
	    return [
			'搜索: ',
             new Ext.ux.form.SearchField({
                store: this.procedureStore,
                paramName:'search',
                width:120
             })
			
		];
	},
	initResourcesPanel:function(){
	    this.procedureSm = new Ext.grid.CheckboxSelectionModel({singleSelect:true});
	    var colModel = new Ext.grid.ColumnModel([
		    this.procedureSm,
		    {header:'函数',dataIndex:'Name',width:60,sortable:true}
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
                emptyMsg:'',
				prevText:'上一页',
				nextText:'下一页',
				refreshText:'刷新',
				firstText:'第一页',
				lastText:'最后一页',
				beforePageText:'',
				afterPageText:'/ {0}',
				displayMsg:''
//                plugins: new Ext.ux.ProgressBarPager()
            })
	    });
	    this.procedurePanel.on('render', function(grid) {
	        var gridEl = grid.getEl();
            gridEl.select('div.x-grid3-hd-checker').removeClass('x-grid3-hd-checker');
            var store = grid.getStore();
            var view = grid.getView();
            grid.tip = new Ext.ToolTip({
                target: view.mainBody,
                delegate: '.x-grid3-row',
                anchor: 'top',
                title:'函数说明:',
                renderTo: document.body,
                listeners: {
                    'beforeshow': function updateTipBody(tip) {
                        var rowIndex = view.findRowIndex(tip.triggerElement);
                        tip.body.dom.innerHTML = store.getAt(rowIndex).get('Description')+'';
                    },
                    scope:this
	           }
	        });
	    });
	    //选中
	    this.procedureSm.on('rowselect',function(e,rowIndex,record){
		    this.procedureParamsStore.baseParams.pCode = record.get('Res_Id');
		    this.procedureParamsStore.load();
	    },this);
	    //反选
        this.procedureSm.on('rowdeselect',function(e,rowIndex,record){
		    this.procedureParamsStore.removeAll();
	    },this);
	    return this.procedurePanel;
	},
	initProcedureParamsStore: function(){
		this.procedureParamsStore = new Ext.data.JsonStore({
            proxy:new Ext.data.HttpProxy({
			    url:this.url,
			    method:"POST"
		    }),
            baseParams:{method:"GetFunctionParamsList",pCode:'',procedureId:''},
            root: 'Table',
            fields: this.procedureFields
        });
		return this.procedureParamsStore;
	},
	initSelectedRightPanel:function(){
	    var comboType = new Ext.form.ComboBox({
	        typeAhead:true,
	        triggerAction:'all',
	        lazyRender:true,
	        editable:false,
	        mode:'local',
//	        ref:refPath,
//            name:name,
	        store:new Ext.data.JsonStore({
	            fields:['Code','Name'],
			    data:[
//			        {Code: '1', Name: '数值'},
			        {Code: '2', Name: '文本'},
//			        {Code: '3', Name: '时间'},
//			        {Code: '4', Name: '布尔'},
//			        {Code: '5', Name: '环境变量'},
			        {Code: '6', Name: '流程全局变量'},
			        {Code: '7', Name: '节点局部变量'},
			        {Code: '8', Name: '表单字段'},
			        {Code: '9', Name: 'SQL语句'},
			        {Code: '10', Name: '函数'},
			        {Code: '11', Name: '公式'}
			    ]
	        }),
	        valueField:'Code',
	        displayField:'Name'
	    }); 
	    var selModel = new Ext.grid.CheckboxSelectionModel({singleSelect:false});
	    var colModel = new Ext.grid.ColumnModel([
	        {header: '参数名',dataIndex: 'Name',sortable: true,width: 100,renderer:function(v,m,r){if(v) return v; else return r.get('ParamName')}},
	        {header: '参数类型',dataIndex: 'PItemValueType',sortable: true,width: 90,editor:comboType,renderer:Ext.util.Format.comboRenderer(comboType)},
	        {header: '参数值',dataIndex: 'PItemValue',sortable: true,width: 90,editor:new Ext.form.TextField()},
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
		    listeners:{
				'beforeedit':function(e){
				    if(e.column==2){
					    var rec = e.record;
					    var PItemValueType = rec.get('PItemValueType');
					    if(!PItemValueType || PItemValueType==''){
					        this.App.setAlert('系统提示', '请选择参数类型!');
					        return false;
					    }
					    if(PItemValueType==10){
					        this.initProcedureWindow(rec).show();
					        return false;
					    }else if(PItemValueType==8){
					        this.initSelectorWindow(rec).show();
					        return false;
					    }else if(PItemValueType==11){
					        this.initFormulaWindow(rec).show();
					        return false;
					    }
					}
				},
				'afteredit':function(e){
				},
				scope:this
			}
		});
		return this.procedureParamsGrid;
	},
	initOkBtnFn:function(){
	    var procedurerd = this.procedurePanel.getSelectionModel().getSelected();
	    if(!procedurerd){
	        this.App.setAlert('系统提示','请选择函数!');
	        return
	    }
	    var isValid = false;
        this.procedureParamsStore.each(function(rd,rowIndex){
            if(!rd.get('PItemValue') || rd.get('PItemValue')==''){
                isValid=true;
                return false;
            }
        },this);
        if(isValid){
            this.App.setAlert('系统提示','请配置存储过程参数的值!');
            return
        }
        
        var resourceName = procedurerd.get('Res_Name');
        var procedureShowName = procedurerd.get('Name');
	    var json = WhiteShell.Globle.DataFormat.gridStoreSerialization(this.procedureParamsStore);////////////
	    var procedureJson = {
	        resourceName:resourceName, 
	        procedureParams:json,
	        id: Ext.ux.newGuid()
	    };
	    this.returnJson.paramsInfo.push(procedureJson);
	    
	    
	    this.fireEvent('selectcomplete',this.returnJson, procedureJson.id,procedureShowName);
        this.hide();
	},
	buttons:[
		{text:'确定',
			handler:function(){
				var win = this.ownerCt.ownerCt;
				win.initOkBtnFn();
			}
		},
		{text:'取消',
			handler:function(){
				var win = this.ownerCt.ownerCt;
				win.hide();
			}
		}
	],
	initProcedureWindow:function(rec){
	    if(this.callProcedure){
            if (this.callProcedure.rendered == true) {
                this.callProcedure.destroy();
            }
        }
        var procedureId = rec.get('PItemValue')+'';
	    this.callProcedure = new HY.CallFunction({procedureId:procedureId});
        this.callProcedure.on('selectcomplete',function(procedureJson, id, procedureShowName){
            for(var i=0;i<procedureJson.paramsInfo.length;i++){
                this.returnJson.paramsInfo.push(procedureJson.paramsInfo[i]);
            }
            for(var i=0;i<procedureJson.formulaInfo.length;i++){
                this.returnJson.formulaInfo.push(procedureJson.formulaInfo[i]);
            }
            rec.set('PItemValue',id);
        },this);
        return this.callProcedure;
	},
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
	initFormulaWindow:function(rec){
	    if(this.callFormula){
            if (this.callFormula.rendered == true) {
                this.callFormula.destroy();
            }
        }
	    this.callFormula = new HY.CallFormula({formulaId:rec.get('PItemValue')});
        this.callFormula.on('selectcomplete',function(procedureJson, id, formulaName){
            for(var i=0;i<procedureJson.paramsInfo.length;i++){
                this.returnJson.paramsInfo.push(procedureJson.paramsInfo[i]);
            }
            for(var i=0;i<procedureJson.formulaInfo.length;i++){
                this.returnJson.formulaInfo.push(procedureJson.formulaInfo[i]);
            }
            rec.set('PItemValue',id);
        },this);
        return this.callFormula;
	}
});
Ext.reg('callfunction', HY.CallFunction);

//Ext.onReady(function(){
//    var callProcedure = new HY.CallFunction({procedureId:'7446be30265a12e96ba0cfe8ad5940d5'});
//    callProcedure.show();
//});
