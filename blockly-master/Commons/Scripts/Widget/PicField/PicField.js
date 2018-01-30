Ext.namespace('HY.PicExFields','Ext.form.PicField');
Ext.form.PicField = Ext.extend(Ext.form.Field,{
	cls:'x-form-span',
	emptyText : null,
	emptyClass : 'x-form-empty-field',
	value:'',
	allowBlank:true,
	width:100,
	defaultAutoCreate : {tag: 'img', src: '', alt:'点击选择图片', autocomplete: 'off',style : 'filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale);'},
	initComponent:function(){
		this.addEvents('click','render');
		this.hiddenName=this.name;
		this.name=Ext.id();
		Ext.form.PicField.superclass.initComponent.call(this);
	},
	fireEvent:function(){
		var TOARRAY = Ext.toArray,
			EACH = Ext.each,
			ISOBJECT = Ext.isObject,
			TRUE = true,
			FALSE = false;
		var a = TOARRAY(arguments), ename = a[0].toLowerCase(), me = this, ret = TRUE, ce = me.events[ename], q, c;
		if (me.eventsSuspended === TRUE) {
			if ((q = me.eventQueue)) {
				q.push(a);
			}
		} else if (ISOBJECT(ce) && ce.bubble) {
			if (ce.fire.apply(ce, a.slice(1)) === FALSE) {
				return FALSE;
			}
			c = me.getBubbleTarget && me.getBubbleTarget();
			if (c && c.enableBubble) {
				if (!c.events[ename] ||
					!Ext.isObject(c.events[ename]) || !c.events[ename].bubble) {
					c.enableBubble(ename);
				}
				return c.fireEvent.apply(c, a);
			}
		} else {
			if (ISOBJECT(ce)) {
				a.shift();
				ret = ce.fire.apply(ce, a);
			}
		}
		return ret;
	},
	onClick:Ext.emptyFn,
	vtype:null,
	onRender:function(ct, position){
		Ext.form.PicField.superclass.onRender.call(this, ct, position);
		var self=this;
		this.el.dom.onclick=function(){
			self.onClick();self.fireEvent('click',this)
		};
		this.hiddenField = this.el.insertSibling({tag:'input', type:'hidden', name: this.hiddenName,
                    id: (this.hiddenId||this.hiddenName)}, 'before', true);
	},
//	setURL:function(v){
//		this.el.dom.src = v;
//		this.value=v.toString();
//		this.startValue=v.toString();
//		this.el.dom.value = this.value;
//		this.hiddenField.value=this.value;
//	},
	setWidth:function(v){
		this.el.dom.style.width=v;
	},
	setHeight:function(v){
		this.el.dom.style.height=v;
	},
	setLocalValue:function(v){
		this.value = v.toString();
		this.el.dom.value = this.value;
		if (Ext.isIE) {
			var geturl = 'file://'+ this.value;
			this.el.dom.src = Ext.BLANK_IMAGE_URL;
			this.el.dom.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = geturl;
		}
		else{
			this.el.dom.src = this.value;
		}
	},
	setValue : function(v){
		if(this.el && !Ext.isEmpty(v)){
			this.el.removeClass(this.emptyClass);
			this.value = v.toString();
			this.el.dom.value = this.value;
//			if (Ext.isIE) {
//				var geturl = 'file://'+ this.value;
//				this.el.dom.src = Ext.BLANK_IMAGE_URL;
//				this.el.dom.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = geturl;
//			}
//			else{
				this.el.dom.src = this.value;
//			}
			this.hiddenField.value=this.value;
		}else{
			this.el.addClass(this.emptyClass);
			this.value = '';
			this.el.dom.value = '';
			this.hiddenField.value=this.value;
			this.el.dom.src = this.value;
			//this.el.dom.src = '';
		}
//			this.validate();
//		
//			if(this.renderer)
//				v = this.renderer(v);
//			
//			if(Ext.isEmpty(v)){
//				if(this.emptyText)
//					v = this.emptyText;
//				else
//					v = "&#160;"
//			}
//			
//			this.el.update(v);
//		}
//		return this;
	},
	getValue : function(){
		//如果已经绘制了，返回数据
		if(this.rendered) {
			return this.value;
		}
		return '';
	}
});
Ext.reg('picfield', Ext.form.PicField);

//图片上传控件
HY.PicExFields.PicUploadField = Ext.extend(Ext.form.PicField, {
	listeners:{
		'click':function(){
			this.picFieldWin.show();
			this.picFieldWin.center();
		}
	},
	initComponent:function(){
		this.init();
		HY.PicExFields.PicUploadField.superclass.initComponent.call(this);
	},
	initWindow:function(){
		var win_pic=new Ext.form.PicField({
			fieldLabel:'图片控件',
			//id:'imageBrowse_add',
			value:Ext.BLANK_IMAGE_URL,
			width:64,
			height:64
		})
		var self=this;
		var uploadPanel=new Ext.form.FormPanel({
			layout:'form',
			frame:true,
			border:false,
			labelAlign:'right',
			labelWidth:70,
			height:181,
			fileUpload : true,
			changeImg:function(nvalue,upload){
				if (Ext.isIE) {
					win_pic.setLocalValue(nvalue);
				}
				else{
					win_pic.setValue(upload.el.dom.files.item(0).getAsDataURL()); 
				}
			},
			defaults:{
				labelAlign:'right'
			},
			items:[{
				fieldLabel : '选择文件',
				xtype:'textfield',
				name : 'uploadfile',
				inputType : 'file',
				allowBlank : false,
				blankText : '文件不能为空',
				height : 25,
				anchor : '90%',
				listeners:{
					'change':function(text,nvalue,ovalue){
						if(self.validImgPath(nvalue)){
							uploadPanel.changeImg(nvalue,this);
						}
					},
					'render':function(){
						var self=this;
						this.el.dom.onchange=function(){
							if(Ext.isIE7 || Ext.isIE8)
							{
								this.select();
								var path=document.selection.createRange().text;
								document.selection.empty();
							}
							else{
								var path=Ext.get('uploadfile').dom.files.item(0).getAsDataURL();
							}
							self.fireEvent('change',self,path,'');
						}
						//将控件注册到父容器
						uploadPanel.uploadfile=this;
					}
				}
			},win_pic]
		})
	
		var tabPanel=new Ext.TabPanel({
			activeTab:0,
			forceLayout:true,
			frame:true,
			border:false,
			height:150,
			items:[{
				title:'图片上传',
				layout:'fit',
				height:150,
				border:false,
				index:0,
				items:uploadPanel
			}]
		})
		
		this.picFieldWin=new Ext.Window({
			resizable:false,
			width:300,
			height:215,
			modal:true,
			frame:true,
			closeAction:'hide',
			title:'上传图片',
			buttonAlign:'center',
			//items:tabPanel,
			items:uploadPanel,
			buttons:[{
				text:'确定',
				handler:function(){
					//if(tabPanel.activeTab.index==0){
						if (!uploadPanel.form.isValid()) {return;}
						var tempfileName = uploadPanel.form.findField('uploadfile').getValue().replace("'"," ");
						var suffixal = tempfileName.substring(tempfileName.lastIndexOf(".")+1,tempfileName.length);
						if(!this.validImgPath(tempfileName)){return false;}
						//上传文件开始
						uploadPanel.form.submit({
							waitMsg : '正在上传......',
							url: "/UploadFileHandler.ashx",
							params:{method:'UploadImage'},
							success : function(form, action) {
							    this.setValue('/ImageDownLoadHandler.ashx?method=ImageShow&fileId=' + action.result.fileId);
							    win_pic.setValue('/ImageDownLoadHandler.ashx?method=ImageShow&fileId=' + action.result.fileId);
								this.picFieldWin.hide();
							},
							failure : function(form, action) {
								form.reset();
								if (action.failureType == Ext.form.Action.SERVER_INVALID)
									Ext.MessageBox.alert('警告', action.result.errors.error);
							},
							scope:this
						});
					//}
					//picFieldWin.hide();
				},
				scope:this
			},{
				text:'取消',
				handler:function(){
					this.picFieldWin.hide();
				},
				scope:this
			}]
		});
	},
	init:function(){
		var App=new Ext.App({});
		var imgError="请上传jpg,gif,png,jpeg格式的图片";//错误提示
		var reg=/jpg|gif|png|jpeg/;//图片类型
		this.validImgPath=function(nvalue){
			if(!!nvalue&&nvalue.indexOf('.')!=-1){
				var str=nvalue.split('.');
				if(!reg.test(str[str.length-1])){
					App.setAlert('错误',imgError);
					return false;
				}
				return true;
			}
			else{
				App.setAlert('错误',imgError);
				return false;
			}
		}
		
		this.initWindow();
	}
})
Ext.reg('picuploadfield', HY.PicExFields.PicUploadField);