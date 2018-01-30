Ext.namespace('HY.ExFields', 'HY.ExFieldsApp');
HY.ExFieldsApp = {}; //HY.ExFieldsApp 配置信息全局变量缓存

HY.ExFields = function (config) {
    Ext.QuickTips.init();
    Ext.apply(this, config);
    this.addEvents("exfieldchange");
    HY.ExFields.superclass.constructor.call(this, config);
};
Ext.extend(HY.ExFields, Ext.util.Observable, {
    url: '/ExFieldsHandler.ashx',
    exFieldsPath: '', //获取扩展描述根节点
    exConfig: null, //扩展字段配置信息
    isDebug: true,
    parentCode: '', //增加父节点 --Sylar
    //获取扩展字段信息
    getConfig: function () {
        if (HY.ExFieldsApp[this.exFieldsPath]) {//防止重复读取配置信息
            this.exConfig = HY.ExFieldsApp[this.exFieldsPath];
        } else if (this.exConfig == null) {
            //AJAX同步方式
            var conn = Ext.lib.Ajax.getConnectionObject().conn;
            conn.open("POST", '/ExFieldsHandler/GetExFieldsHeader.ashx', false);
            conn.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            //conn.send('method=GetExFieldsHeader&exFieldsPath='+this.exFieldsPath);//job_00006
            //增加列头父结点Code --Sylar
            conn.send('exFieldsPath=' + this.exFieldsPath + '&parentCode=' + this.parentCode); //job_00006
            this.exConfig = conn.responseText == '' ? null : Ext.decode(conn.responseText).types;
            this.exConfig = Ext.isArray(this.exConfig) ? this.exConfig : [this.exConfig];
            HY.ExFieldsApp[this.exFieldsPath] = this.exConfig; //将配置信息放入全局变量缓存
        }
        return this.exConfig;
    }
});

//Ext.override(Ext.grid.PropertyColumnModel, {
//	getCellEditor : function(colIndex, rowIndex){
//		var editor = Ext.grid.PropertyColumnModel.superclass.getCellEditor.call(this, colIndex, rowIndex);
//		if(typeof editor == 'string'){
//			if(!this.editors[editor])
//				editor = Ext.grid.GridEditor(Ext.create({xtype:editor},'textfield')); 
//			else
//				editor = this.editors[editor];
//		}
//		
//		return editor;
//	},
//	constructor : function(grid, store){
//		Ext.grid.PropertyColumnModel.superclass.constructor.call(this.grid, store);
//		Ext.apply(this.editors,{
//			'datefield' : new g.GridEditor(new f.DateField({selectOnFocus:true})),
//			'textfield' : new g.GridEditor(new f.TextField({selectOnFocus:true})),
//			'numberfield' : new g.GridEditor(new f.NumberField({selectOnFocus:true, style:'text-align:left;'})),
//			'checkbox' : new g.GridEditor(bfield, {
//				autoSize: 'both'
//			})
//		});
//	}
//});

HY.ExFields.PropertyGridExFields = Ext.extend(HY.ExFields, {
    init: function (propertyGrid) {
        if (!this.exFieldsPath)
            return;
        var g = propertyGrid
        var cm = g.getColumnModel();
        var view = g.getView();
        var propertys = [];

        /*customEditors: {
        CnName: new editor({xpath:'combo'})
        },
        propertyNames: {
        CnName:'中文名',
        EnName:'英文名',
        OrderId:'排序字段'
        },
        customRenderers:{
        OrderId:function(v){
        return v + 'px';
        }
        }*/
        view.renderRows = this.renderRows;
        var bfield = {
            autoCreate: { tag: 'select', children: [
				{ tag: 'option', value: 'true', html: cm.trueText },
				{ tag: 'option', value: 'false', html: cm.falseText }
			]
            },
            getValue: function () {
                return this.el.dom.value == 'true';
            }
        };

        for (var i = 0; i < this.getConfig().length; i++) {
            var config = this.getConfig()[i];

            //表单项
            var editor = { selectOnFocus: true };

            if (config.IsHidden.toLowerCase() === 'false')//是否隐藏
                g.propertyNames[config.DataIndex] = config.Header; //字段名 : 列名

            //默认值
            if (config.DefaultValue)
                editor.DefaultValue = config.DefaultValue;

            //是否必填
            if (config.IsRequired.toLowerCase() === 'true')
                editor.allowBlank = false;
            else
                editor.allowBlank = true;

            //是否多选
            if (config.IsMultiplet.toLowerCase() === 'false') {
                editor.xtype = config.FieldType.toLowerCase(); //字段类型
            } else {
                editor.xtype = 'multipletgridcolumn';
                editor.oxtype = config.FieldType.toLowerCase();
            }

            //列配置
            if (config.ColumnConfig) {
                g.customRenderers[config.DataIndex] = Ext.grid.Column.types[config.ColumnConfig.toLowerCase() || 'gridcolumn'].renderer;
            }

            //表单项类型
            if (config.FieldType.toLowerCase() == 'numberfield') {
                editor.style = 'text-align:left;';
            } else if (config.FieldType.toLowerCase() == 'checkbox') {
                editor = Ext.apply(editor, bfield);
            }

            //表单项配置
            if (config.FieldConfig) {
                var FieldConfig;
                eval('FieldConfig = ' + config.FieldConfig);
                editor = Ext.apply(editor, FieldConfig);
            }

            //字段类型
            var fieldCmp = Ext.create(editor, 'textfield');
            editor = new Ext.grid.GridEditor(fieldCmp);

            //表单项类型
            if (config.FieldType.toLowerCase() == 'chooseresourcescombo' || config.FieldType.toLowerCase() == 'combo')
                g.customRenderers[config.DataIndex] = Ext.util.Format.getComboText(fieldCmp);

            g.customEditors[config.DataIndex] = editor;
            this.fireEvent("exfieldchange", propertyGrid, null, config);
        }
    },
    renderRows: function (startRow, endRow) {
        // pull in all the crap needed to render rows
        var g = this.grid, cm = g.colModel, ds = g.store, stripe = g.stripeRows;
        var colCount = cm.getColumnCount();

        if (ds.getCount() < 1) {
            return '';
        }

        var cs = this.getColumnData();

        startRow = startRow || 0;
        endRow = !Ext.isDefined(endRow) ? ds.getCount() - 1 : endRow;

        // records to render
        var rs = ds.getRange(startRow, endRow);
        var rs2 = [];
        Ext.each(rs, function (r) {
            if (g.propertyNames[r.get('name')])
                rs2.push(r);
        }, this);
        //		var rs2 = this.ds.queryBy(function(r,id){
        //			//for(var i=0; i<g.propertyNames.length; i++){
        //				if(g.propertyNames[r.get('name')])
        //					return true;
        //			//}
        //			return false;
        //		},this).getRange();

        return this.doRender(cs, rs2, ds, startRow, colCount, stripe);
    }
});


//Grid中自动配置CM扩展属性
//同步获取扩展字段配置，Ext.lib.Ajax.getConnectionObject
HY.ExFields.GridExFields = Ext.extend(HY.ExFields, {
    init: function (grid) {
        if (!this.exFieldsPath)
            return;
        var cm = grid.getColumnModel();
        var columns = [];
        for (var i = 0; i < this.getConfig().length; i++) {
            var config = this.getConfig()[i];
            var column = {};
            var editor = column.editor = {};

            //列名
            column.header = config.Header;
            //字段名
            column.dataIndex = config.DataIndex;

            //列宽度
            if (config.Width)
                column.width = parseInt(config.Width);

            //是否隐藏
            if (config.IsHidden.toLowerCase() === 'false')
                column.hidden = false;
            else
                column.hidden = true;

            //默认值
            if (config.DefaultValue) {
                column.DefaultValue = config.DefaultValue;
                editor.DefaultValue = config.DefaultValue;
            }

            //是否必填
            if (config.IsRequired && (config.IsRequired.toLowerCase() === 'true'))
                column.allowBlank = false;
            else
                column.allowBlank = true;

            //是否多选
            if (config.IsMultiplet.toLowerCase() === 'false') {
                editor.xtype = config.FieldType.toLowerCase();
            } else {
                editor.xtype = 'multipletgridcolumn';
                editor.oxtype = config.FieldType.toLowerCase();
            }

            //列配置
            if (config.ColumnConfig) {
                column.xtype = config.ColumnConfig.toLowerCase();
            }

            //表单项类型
            if (config.FieldType.toLowerCase() == 'checkbox') {
                column.align = 'center';
                column.xtype = 'booleancolumn';
                editor.boxLabel = false;
            } else if (config.FieldType.toLowerCase() == 'chooseresourcescombo' || config.FieldType.toLowerCase() == 'combo') {
                column.renderer = Ext.util.Format.comboRenderer();
            }

            //表单项配置
            if (config.FieldConfig) {
                var FieldConfig;
                eval('FieldConfig = ' + config.FieldConfig);
                editor = Ext.apply(editor, FieldConfig);
            }
            this.fireEvent("exfieldchange", grid, column, config);
            columns.push(column);
        }
        cm.addColumns(columns);
    }
});

//面板方式展示
//panel初始化是，初始化ITEMS
Ext.util.CSS.createStyleSheet('.items-float{float:left;} .items-allow-float{clear:none!important;} .items-stop-float{clear:both!important;}');
HY.ExFields.PanelExFields = Ext.extend(HY.ExFields, {
    init: function (panel) {
        if (!this.exFieldsPath)
            return;
        var items = [];
        for (var i = 0; i < this.getConfig().length; i++) {
            var config = this.getConfig()[i];
            var item = {};
            item.invalidText = config.Header + ' 不能为空';
            item.fieldLabel = config.Header;
            item.itemId = config.DataIndex;
            item.name = config.DataIndex;
            item.ref = '../' + config.DataIndex;

            //定义高度，解决IE7下的布局问题
            item.height = config.height ? config.height : 24;
            //			if(config.Width)
            //				item.width = parseInt(config.Width);

//            item.listeners = { 'invalid': function (c, validText) {
//                Ext.Msg.alert('提示', validText); 
//                return false;
//            }};
            if (config.IsHidden.toLowerCase() === 'false') {
                item.hidden = false;
            }
            else
                item.hidden = true;

            if (config.DefaultValue)
                item.value = config.DefaultValue;

            if (config.IsRequired.toLowerCase() === 'true')
                item.allowBlank = false;
            else
                item.allowBlank = true;

            //是否多选
            if (config.IsMultiplet.toLowerCase() === 'false') {
                item.xtype = config.FieldType.toLowerCase();
            } else {
                item.xtype = 'multipletgridwin';
                item.oxtype = config.FieldType.toLowerCase();
            }

            if (config.FieldType.toLowerCase() == 'checkbox') {
                item.hideLabel = true;
                item.boxLabel = config.Header;
            }

            if (config.FieldConfig) {
                var FieldConfig;
                eval('FieldConfig = ' + config.FieldConfig);
                item = Ext.apply(item, FieldConfig);
            }
            this.fireEvent("exfieldchange", panel, item, config);
            items.push(item);
        }
        panel.add(items);
    }
});


//Column扩展
HY.ExFields.PxColumn = Ext.extend(Ext.grid.Column, {
    pxText: 'px',
    constructor: function (cfg) {
        HY.ExFields.PxColumn.superclass.constructor.call(this, cfg);
        var px = this.pxText;
        this.renderer = function (v) {
            if (v === undefined || !v)
                return '';
            else
                return v + px;
        };
    }
});
Ext.grid.Column.types['pxcolumn'] = HY.ExFields.PxColumn;

//field扩展
HY.ExFields.ChooseResourcesCombo = Ext.extend(Ext.form.ComboBox, {
    //	mode: 
    url: '/ExFieldsHandler.ashx',
    mode: 'local', //临时测试可使用'local'
    editable: false,
    forceSelection: true,
    triggerAction: 'all',
    storeListeners: null,
    initComponent: function () {
        var app = 'ChooseResourcesCombo_' + this.rootCode;
        this.store = {
            xtype: 'jsonstore',
            url: '/ExFieldsHandler/GetResListCombo.ashx',
            baseParams: {
                rootCode: this.rootCode,
                fields: this.displayField + ',' + this.valueField
            },
            root: 'res',
            autoLoad: true,
            fields: [this.displayField, this.valueField],
            listeners: this.storeListeners
        };
        this.hiddenName = this.name;
        if (HY.ExFieldsApp[app]) {//防止重复读取配置信息
            this.mode = 'local';
            this.store.data = HY.ExFieldsApp[app];
        }
        HY.ExFields.ChooseResourcesCombo.superclass.initComponent.apply(this, arguments);
    },
    onRender: function () {
        //解决数据导入页面问题
        // this.store.load();
        this.store.on('load', function (a, rds) {
            var num = this.store.find(this.displayField, this.getValue());
            if (num != -1) //modified by lyf on 2010.06.02
                this.setValue(this.store.getAt(num).get(this.valueField));
        }, this);
        HY.ExFields.ChooseResourcesCombo.superclass.onRender.apply(this, arguments);
    }
});
Ext.reg('chooseresourcescombo', HY.ExFields.ChooseResourcesCombo);

//资源选择子窗体（数据导入页面还未实现）
HY.ExFields.ChooseResourcesWin = Ext.extend(Ext.form.ComboBox, {
    url: '/ExFieldsHandler.ashx',
    mode: 'local',
    //临时测试可使用'local'
    editable: false,
    readOnly: true,
    forceSelection: true,
    triggerAction: 'all',
    treeRootText: '',
    gridRootText: '',
    rootName: '',
    rootCode: '00000000000000000000000000000000',
    treeTabTitle: '',
    checkModel: 'multiple',
    initComponent: function () {
        var app = 'ChooseResourcesWin_' + this.rootCode;
        this.store = {
            xtype: 'jsonstore',
            url: '/ExFieldsHandler/GetMultipleResCombo.ashx',
            baseParams: {
                rootCode: this.rootCode
            },
            root: 'res',
            fields: [this.displayField, this.valueField]
        };
        this.hiddenName = this.name;
        if (HY.ExFieldsApp[app]) { //防止重复读取配置信息
            this.mode = 'local';
            this.store.data = HY.ExFieldsApp[app];
        }
        var chooseResources = new HY.ChooseResources({
            rootCode: this.rootCode,
            checkModel: this.checkModel,
            treeRootText: this.treeRootText,
            gridRootText: this.gridRootText,
            treeTabTitle: this.treeTabTitle,
            uiProvider: false,
            rootName: this.rootName
        });
        //选中后显示
        chooseResources.on('selectcomplete', function (records) {
            if (records.length < 1) {
                alert('此时选中的资源为空');
            } else {
                var names = '';
                var codes = '';
                Ext.each(records,
                function (record) {
                    names += record.get('Name') + ',';
                    codes += record.get('Res_Id') + ',';
                });
                names = names.substring(0, names.length - 1); //去掉多余的','
                codes = codes.substring(0, codes.length - 1); //去掉多余的','
                this.store.removeAll();
                this.store.add(new Ext.data.Record({
                    Res_Id: codes,
                    Res_Name: names
                }));
                this.setValue(codes); //为控件赋值
            }
        }, this);
        this.on('afterrender', function () {
            this.store.on('load', function (a, rds) {
                if (a.getCount() > 0)
                    this.el.dom.value = a.getAt(0).get(this.displayField);
            }, this);
        });
        this.on('focus', function () {
            var rds = this.store.getAt(0);
            if (rds) {
                var names = (rds.get(this.displayField) || '').split(',');
                var codes = (rds.get(this.valueField) || '').split(',');
                var TopicRecord = Ext.data.Record.create([{
                    name: "Res_Id"
                }, {
                    name: "Name"
                }, {
                    name: "ParentCode"
                }, {
                    name: 'ParentName'
                }]);
                var Records = [];
                for (var i = 0; i < names.length; i++) {
                    var myNewRecord = new TopicRecord({
                        Res_Id: codes[i],
                        Name: names[i],
                        ParentCode: this.rootCode,
                        ParentName: this.rootName
                    });
                    Records.push(myNewRecord);
                }
            }
            chooseResources.open(Records);
        }, this);
        HY.ExFields.ChooseResourcesWin.superclass.initComponent.apply(this, arguments);
    },
    setValue: function (v) {
        HY.ExFields.ChooseResourcesWin.superclass.setValue.call(this, v);
        if (v) {
            this.store.load({
                params: {
                    ResContent: v
                }
            });
        }
        return this;
    }
});
Ext.reg('chooseresourceswin', HY.ExFields.ChooseResourcesWin);

//资源选择子窗体（数据导入页面还未实现）
HY.ExFields.ChoosePersonWin = Ext.extend(Ext.form.ComboBox, {
    url: '/ResourcesPanelHandler.ashx',
    mode: 'local', //临时测试可使用'local'
    editable: false,
    readOnly: true,
    forceSelection: true,
    trans2name: false,
    triggerAction: 'all',
    treeRootText: '',
    gridRootText: '',
    rootName: '',
    rootCode: '',
    treeTabTitle: '',
    empCheckModel: 'single',
    //为EditorGrid准备
    onBlur: Ext.emptyFn,
    beforeBlur: Ext.emptyFn,
    initComponent: function () {
        var me = this;
        var app = 'ChoosePersonWin_' + this.rootCode;
        this.store = {
            xtype: 'jsonstore',
            url: '/EmployeeHandler/GetEmpInfoByIDSet.ashx',
            root: 'empInfo',
            fields: [this.displayField, this.valueField]
        };
        this.hiddenName = this.name;
        if (HY.ExFieldsApp[app]) { //防止重复读取配置信息
            this.mode = 'local';
            this.store.data = HY.ExFieldsApp[app];
        }
        var choosePerson = new HY.ChoosePerson({
            empCheckModel: this.empCheckModel,
            //rootCode: this.rootCode,
            hideSelected: this.hideSelected,
            enableCommonEmps: this.enableCommonEmps,
            listeners: {
                "hide": function () {
                    HY.ExFields.ChoosePersonWin.superclass.onBlur.call(this);
                },
                "close": function () {
                    HY.ExFields.ChoosePersonWin.superclass.onBlur.call(this);
                }
            }
        });
        //选中后显示
        choosePerson.on('selectcomplete', function (records) {
            if (records.length < 1) {
                alert('此时选中的资源为空');
            } else {
                var names = '';
                var codes = '';
                Ext.each(records,
                function (record) {
                    names += record.get(me.displayField) + ',';
                    codes += record.get(me.valueField) + ',';
                });
                names = names.substring(0, names.length - 1); //去掉多余的','
                codes = codes.substring(0, codes.length - 1); //去掉多余的','
                this.store.removeAll();
                var dt = {};
                dt[me.displayField] = names;
                dt[me.valueField] = codes;
                this.store.add(new Ext.data.Record(dt));
                this.setValue(codes); //为控件赋值
            }
        }, this);
        this.on('afterrender', function () {
            this.store.on('load', function (a, rds) {
                if (a.getCount() > 0)
                    this.el.dom.value = a.getAt(0).get(this.displayField);
            }, this);
        });
        this.on('focus', function () {
            choosePerson.open();
        }, this);
        HY.ExFields.ChoosePersonWin.superclass.initComponent.apply(this, arguments);
    },
    setValue: function (v) {
        HY.ExFields.ChoosePersonWin.superclass.setValue.call(this, v);
        if (v) {
            var params = {};
            params[this.valueField] = v;
            this.store.load({
                params: params
            });
        }
        return this;
    }
});
Ext.reg('choosepersonwin', HY.ExFields.ChoosePersonWin);

//HY.ExFields.ChoosePersonWin = Ext.extend(Ext.form.TextField, {
//    url: '/ResourcesPanelHandler.ashx',
//    mode: 'local', //临时测试可使用'local'
//    editable: false,
//    trans2name: false,
//    readOnly: true,
//    forceSelection: true,
//    //借用validator实现通过人员code获取人员信息
//    //并显示在页面上
//    //为EditorGrid准备
//    onBlur: Ext.emptyFn,
//    beforeBlur: Ext.emptyFn,
//    onFocus: function () {
//        HY.ExFields.ChoosePersonWin.superclass.onFocus.call(this);
//        if (!this.choosePerson) {
//            this.choosePerson = new HY.ChoosePerson({
//                empCheckModel: this.empCheckModel,
//                //rootCode: this.rootCode,
//                hideSelected: this.hideSelected,
//                enableCommonEmps: this.enableCommonEmps,
//                listeners: {
//                    "hide": function () {
//                        HY.ExFields.ChoosePersonWin.superclass.onBlur.call(this);
//                    },
//                    "close": function () {
//                        HY.ExFields.ChoosePersonWin.superclass.onBlur.call(this);
//                    },
//                    "selectcomplete":function(records){                    
//                        if (records.length > 0) {
//                            this.setValue(records[0].data.Emp_Id);
//                        } else {
//                            this.setValue('');
//                        }
//                    },scope:this
//                }
//            })
//        }
//        this.choosePerson.show();
//        if(this.gridEditor)
//            this.choosePerson.setZIndex(this.gridEditor.el.getZIndex() + 10);
//    },
//    initComponent: function () {       
//        HY.ExFields.ChoosePersonWin.superclass.initComponent.apply(this, arguments);
//    },
//    setValue: function (v) {
//        HY.ExFields.ChoosePersonWin.superclass.setValue.call(this, v);
//        if (v) {
//            this.store.load({
//                params: {
//                    ResContent: v
//                }
//            });
//        }
//        return this;
//    }
//});
//Ext.reg('choosepersonwin', HY.ExFields.ChoosePersonWin);

//城市资源选择子窗体
HY.ExFields.ChooseCityWin = Ext.extend(Ext.form.ComboBox, {
    url: '/ExFieldsHandler.ashx',
    mode: 'local',
    //临时测试可使用'local'
    editable: false,
    //trans2name: false,
    readOnly: true,
    checkModel: 'multiple',
    forceSelection: true,
    triggerAction: 'all',
    initComponent: function () {
        var app = 'ChooseCityWin_' + this.rootCode;
        this.store = {
            xtype: 'jsonstore',
            url: '/ExFieldsHandler/GetMultipleResCombo.ashx',
            baseParams: {
                rootCode: this.rootCode
            },
            root: 'res',
            //autoLoad:true,
            fields: [this.displayField, this.valueField]
        };
        this.hiddenName = this.name;
        if (HY.ExFieldsApp[app]) { //防止重复读取配置信息
            this.mode = 'local';
            this.store.data = HY.ExFieldsApp[app];
        };
        var chooseCity = new HY.ChooseCity({
            checkModel: this.checkModel
        });
        chooseCity.on('selectcomplete', function (records) {
            if (records.length < 1) {
                alert('此时选中的城市为空');
            } else {
                var names = '';
                var codes = '';
                Ext.each(records, function (record) {
                    names += record.get('Name') + ',';
                    codes += record.get('Res_Id') + ',';
                });
                names = names.substring(0, names.length - 1); //去掉多余的','
                codes = codes.substring(0, codes.length - 1); //去掉多余的','
                this.store.removeAll();
                this.store.add(new Ext.data.Record({ Res_Id: codes, Res_Name: names }));
                //为控件赋值
                this.setValue(codes);
            }
        }, this);
        this.on('afterrender', function () {
            this.store.load({
                params: {
                    ResContent: this.getValue()
                }
            });
            this.store.on('load', function (a, rds) {
                if (this.valueField != null && a.getCount() > 0) {
                    this.setValue(a.getAt(0).get(this.valueField));
                }
            },
            this)
        });
        this.on('focus', function () {
            //alert(this.displayField);
            var rds = this.store.getAt(0)
            if (rds.get(this.displayField) != null) {
                var names = rds.get(this.displayField).split(',');
                var codes = rds.get(this.valueField).split(',');
                var TopicRecord = Ext.data.Record.create([{
                    name: "Res_Id"
                }, {
                    name: "Name"
                }]);
                var Records = [];
                for (var i = 0; i < names.length; i++) {
                    var myNewRecord = new TopicRecord({
                        Res_Id: codes[i],
                        Name: names[i]
                    });
                    Records.push(myNewRecord);
                }
                chooseCity.open(Records);
            } else {
                chooseCity.open();
            }
        }, this);
        HY.ExFields.ChooseCityWin.superclass.initComponent.apply(this, arguments);
    },
    onRender: function () {
        //解决数据导入页面问题
        HY.ExFields.ChooseCityWin.superclass.onRender.apply(this, arguments);
    }
});
Ext.reg('choosecitywin', HY.ExFields.ChooseCityWin);

////城市资源选择子窗体
//HY.ExFields.SelectionRulesCombo = Ext.extend(Ext.form.TextField, {
//    listeners:{
//        'focus':function(field){
//            this.initDataWin().show();
//        }
//    },
//    tooltip:{text:'未配置',title:'提示'},
//    onRender:function(ct, position){
//        HY.ExFields.SelectionRulesCombo.superclass.onRender.call(this, ct, position);  
////        if(this.tooltip.text)
////            this.mytip=new Ext.ToolTip({target:this.id,trackMouse:false,draggable:true,maxWidth:200,minWidth:100,title:this.tooltip.title,html:'未配置'});    
//    },
//    initDataWin:function(){
//        if(this.dataWindow){
//	        this.dataWindow.close();
//	    }
//	    this.dataWindow = new HY.ShowWindows();
//	    this.dataWindow.on('getvalueevent',function(record){
//	        var type=record.get('Type');
//	        var temp="";
//            switch(type){
//                case "1": temp='数值'; break;
//                case "2": temp='文本'; break;
//                case "3": temp='时间'; break;
//                case "4": temp='布尔'; break;
//                case "5": temp='环境变量'; break;
//                case "6": temp='流程DataFields'; break;
//                case "7": temp='节点DataFields'; break;
//                case "8": temp='表单XPath'; break;
//                case "9": temp='SQL语句'; break;
//                case "10": temp='存储过程'; break;
//                case "11": temp='公式'; break;
//                case "12": temp='选人规则前置条件'; break;
//                case "13": temp='公式项'; break;
//            } 
//	        var tip='Type:'+type+'@'+this.name+':'+record.get('Data2');
//	        var value='值类型:'+temp+',值:'+record.get('remark');
//            this.setValue(value);
//            this.hiddenValue=tip;
//            this.tooltip.text=tip;
//            if(this.tooltip.text)
//                new Ext.ToolTip({target:this.id,trackMouse:false,draggable:true,maxWidth:200,minWidth:100,title:this.tooltip.title,html:this.tooltip.text});
//        },this);
//       return this.dataWindow;
//    }
//});
//Ext.reg('selectionrulescombo', HY.ExFields.SelectionRulesCombo);

//城市资源选择子窗体
HY.ExFields.SelectionRulesCombo = Ext.extend(Ext.form.TextField, {
    listeners: {
        'focus': function (field) {
            this.initDataWin().show();
        }
    },
    tooltip: { text: '未配置', title: '提示' },
    onRender: function (ct, position) {
        HY.ExFields.SelectionRulesCombo.superclass.onRender.call(this, ct, position);
        //        if(this.tooltip.text)
        //            this.mytip=new Ext.ToolTip({target:this.id,trackMouse:false,draggable:true,maxWidth:200,minWidth:100,title:this.tooltip.title,html:'未配置'});    
    },
    initDataWin: function () {
        if (this.dataWindow) {
            this.dataWindow.close();
        }
        this.dataWindow = new HY.ShowWindows();
        this.dataWindow.on('getvalueevent', function (record, returnJson) {
            var type = record.get('Type');
            var temp = "";
            switch (type) {
                case "2": temp = '文本'; break;
                case "5": temp = '环境变量'; break;
                case "6": temp = '流程全局变量'; break;
                case "7": temp = '节点局部变量'; break;
                case "8": temp = '表单字段'; break;
                case "9": temp = 'SQL语句'; break;
                case "10": temp = '函数'; break;
                case "11": temp = '公式'; break;
            }
            var tip = 'Type:' + type + '@' + this.name + ':' + record.get('Data2');
            var value = '值类型:' + temp + ',值:' + record.get('remark');
            this.setValue(value);
            this.hiddenValue = tip;
            this.hiddenName = tip;
            this.tooltip.text = tip;
            this.returnJson = returnJson;
            if (this.tooltip.text)
                new Ext.ToolTip({ target: this.id, trackMouse: false, draggable: true, maxWidth: 200, minWidth: 100, title: this.tooltip.title, html: this.tooltip.text });
        }, this);
        return this.dataWindow;
    }
});
Ext.reg('selectionrulescombo', HY.ExFields.SelectionRulesCombo);


//组织资源COMBO
//HY.ExFields.ChooseDepartmentWin = Ext.extend(Ext.form.TextField, {
//    url: '/ExFieldsHandler.ashx',
//    mode: 'local',
//    //临时测试可使用'local'
//    editable: false,
//    rootCode: '-',
//    //trans2name: false,
//    enableTreePanel: true, //是否启用树面板，为false则不加载树面
//    enableGridPanel: true, //是否启用表格面板，为false则不加载表格面
//    uiProvider: true,
//    readOnly: true,
//    checkModel: 'multiple',
//    forceSelection: true,
//    triggerAction: 'all',
//    initComponent: function () {       
//        HY.ExFields.ChooseDepartmentWin.superclass.initComponent.apply(this, arguments);
//    },
//    onBlur: Ext.emptyFn,
//    beforeBlur: Ext.emptyFn,
//    chooseDept:null,
//    onFocus: function () {
//        HY.ExFields.ChooseDepartmentWin.superclass.onFocus.call(this);
//        if (!this.chooseDept) {
//            this.chooseDept = new HY.ChooseDepartment({
//                checkModel: this.checkModel,
//                rootCode: this.rootCode,
//                uiProvider: this.uiProvider,
//                enableTreePanel: this.enableTreePanel,
//                enableGridPanel: this.enableGridPanel,
//                listeners: {
//                    "hide": function () {
//                        HY.ExFields.ChooseDepartmentWin.superclass.onBlur.call(this);
//                    },
//                    "close": function () {
//                        HY.ExFields.ChooseDepartmentWin.superclass.onBlur.call(this);
//                    },
//                    "selectcomplete": function (records) {
//                        var names = '';
//                        var codes = '';
//                        Ext.each(records, function (record) {
//                            names += record.get('Name') + ',';
//                            codes += record.get('Res_Id') + ',';
//                        });
//                        names = names.substring(0, names.length - 1); //去掉多余的','
//                        codes = codes.substring(0, codes.length - 1); //去掉多余的','
//                        //为控件赋值
//                        this.setValue(codes);
//                    }, scope: this
//                }
//            })
//        }
//        this.chooseDept.show();
//        this.chooseDept.setZIndex(this.gridEditor.el.getZIndex() + 10);
//    },
//    onRender: function () {
//        //解决数据导入页面问题
//        HY.ExFields.ChooseDepartmentWin.superclass.onRender.apply(this, arguments);
//    }
//});
//Ext.reg('choosedepartmentwin', HY.ExFields.ChooseDepartmentWin);

HY.ExFields.ChooseDepartmentWin = Ext.extend(Ext.form.ComboBox, {
    url: '/ExFieldsHandler.ashx',
    mode: 'local', //临时测试可使用'local'
    editable: false,
    rootCode: '-',
    //trans2name: false,
    enableTreePanel: true, //是否启用树面板，为false则不加载树面
    enableGridPanel: true, //是否启用表格面板，为false则不加载表格面
    uiProvider: true,
    readOnly: true,
    checkModel: 'single',
    forceSelection: true,
    triggerAction: 'all',
    //为EditorGrid准备
    onBlur: Ext.emptyFn,
    beforeBlur: Ext.emptyFn,
    displayField: 'Name',
    valueField: 'Res_Id',
    initComponent: function () {
        var me = this;
        var app = 'ChooseDepartmentWin_' + this.rootCode;
        this.store = {
            xtype: 'jsonstore',
            url: '/OrganizationHandler/GetOrgDataByCode.ashx',
            fields: [{
                name: this.displayField,
                mapping: 'text'
            }, {
                name: this.valueField,
                mapping: 'id'
            }]
        };
        this.hiddenName = this.name;
        if (HY.ExFieldsApp[app]) { //防止重复读取配置信息
            this.mode = 'local';
            this.store.data = HY.ExFieldsApp[app];
        }
        var chooseDept = new HY.ChooseDepartment({
            checkModel: this.checkModel,
            rootCode: this.rootCode,
            uiProvider: this.uiProvider,
            enableTreePanel: this.enableTreePanel,
            enableGridPanel: this.enableGridPanel,
            listeners: {
                "hide": function () {
                    HY.ExFields.ChooseDepartmentWin.superclass.onBlur.call(this);
                },
                "close": function () {
                    HY.ExFields.ChooseDepartmentWin.superclass.onBlur.call(this);
                }
            }
        });
        //选中后显示
        chooseDept.on('selectcomplete', function (records) {
            if (records.length < 1) {
                alert('此时选中的资源为空');
            } else {
                var names = '';
                var codes = '';
                Ext.each(records, function (record) {
                    names += record.get(me.displayField) + ',';
                    codes += record.get(me.valueField) + ',';
                });
                names = names.substring(0, names.length - 1); //去掉多余的','
                codes = codes.substring(0, codes.length - 1); //去掉多余的','
                this.store.removeAll();
                var dt = {};
                dt[me.displayField] = names;
                dt[me.valueField] = codes;
                this.store.add(new Ext.data.Record(dt));
                //部门选择来自于grid的单元格
                if (this.grid) {
                    var colIndex = this.gridEditor.col;
                    var row = this.gridEditor.row;
                    var rd = this.grid.getStore().getAt(row);
                    var dataIndex = this.grid.getColumnModel().getDataIndex(colIndex);
                    rd.set(dataIndex, codes);
                    rd.set(dataIndex + '_Name', names);
                    var e = { grid: this.grid, record: rd };
                    this.grid.fireEvent('afteredit', e)
                    //this.gridEditor.record.set(gridDataIndex, '')
                }
                //来自于面板
                else {
                    this.setValue(codes); //为控件赋值
                }
            }
        }, this);
        this.on('afterrender', function () {
            this.store.on('load', function (a, rds) {
                if (a.getCount() > 0)
                    this.el.dom.value = a.getAt(0).get(this.displayField);
            }, this);
        });
        this.on('focus', function () {
            //用来修复编辑时，编辑框层次在选择框之前的问题；
            if (this.grid) {
                this.hide();
            }
            chooseDept.open();
        }, this);
        HY.ExFields.ChooseDepartmentWin.superclass.initComponent.apply(this, arguments);
    },
    setValue: function (v) {
        HY.ExFields.ChooseDepartmentWin.superclass.setValue.call(this, v);
        if (v) {
            var params = {};
            params[this.valueField] = v;
            this.store.load({
                params: params
            });
        }
        return this;
    }
});
Ext.reg('choosedepartmentwin', HY.ExFields.ChooseDepartmentWin);
