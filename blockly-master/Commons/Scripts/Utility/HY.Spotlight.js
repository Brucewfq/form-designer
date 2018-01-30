//Spotlight向导模式
Ext.namespace('HY.Spotlight');
HY.Spotlight = function(config){
    Ext.apply(this, config);
    this.store = new Ext.data.XmlStore({
        autoDestroy: true,
        autoLoad:true,
        storeId: 'myStore',
        url: this.url,
        record: 'Step',
        idPath: 'id',
        fields: [
            'title', 'discription', 'id'
        ]
    });
    //this.store.load();
};
Ext.extend(HY.Spotlight,Ext.ux.Spotlight,{
    step:1,//当前步骤
    prveText:'上一步',//上一步按钮文字
    nextText:'下一步',//下一步按钮文字
    doneText:'完成',//完成按钮文字
    closeText:'取消',//取消按钮文字
    discriptionRegional:'buttom',//right/buttom
    store:null,
    createElements : function(){
        Ext.ux.Spotlight.prototype.createElements.call(this);
        var bd = Ext.getBody();

        this.titleEl = bd.createChild({cls:'x-spotlight x-spotlight-title',children: [{tag:'p',html: ''}]});
        this.footerEl = bd.createChild({cls:'x-spotlight x-spotlight-footer'});
        
        var ellist = [this.titleEl, this.footerEl];
        
        if(this.discriptionRegional == 'right'){
            this.discriptionEl = bd.createChild({cls:'x-spotlight x-spotlight-discription',children: [{tag:'p',html: ''}]});
            ellist.push(this.discriptionEl);
        }
        
        this.createToolbar();
        
        this.all.add(ellist);// = new Ext.CompositeElement(ellist);
    },
    createToolbar: function(){
        if (this.footerBar && this.footerBar.render) {
            return;
        }
        this.prevbtn = new Ext.Button({text: this.prveText,scope:this,handler:function(){
            this.step--;
            this.show();
            this.updateSpot(false);
        }});
        this.nextbtn = new Ext.Button({text: this.nextText,scope:this,handler:function(){
            if(this.step < this.store.getCount()){
                this.step++;
                this.show();
                this.updateSpot(true);
            }else{
                this.step=1;
                this.doneSpot();
                this.hide();
            }
        }});
        this.closebtn = new Ext.Button({text: this.closeText,scope:this,handler:function(){
            this.step=1;
            this.closeSpot();
            this.hide();
        }});
        var tb = [new Ext.Toolbar.Fill(),this.prevbtn,'&#160;',this.nextbtn,'&#160;',this.closebtn];
        if(this.discriptionRegional == 'buttom'){
            this.discriptionEl = new Ext.Toolbar.TextItem({
			    text:'a',
			    //hidden:true,
			    ref: '../discriptionText'
		    });
		    tb = tb.insert(0,this.discriptionEl);
		}
        this.footerBar = new Ext.Toolbar({
            items: tb,
            toolbarCls: 'x-panel-fbar',
            enableOverflow: false,
            renderTo:this.footerEl
        });
    },
    
    setTitle:function(title){
        if(title)
            this.title=title
        this.titleEl.first().update(this.title);
    },
    setDiscription:function(discription){
        if(discription)
            this.discription=discription
        if(this.discriptionEl.setText)
            this.discriptionEl.setText(this.discription);
        else
            this.discriptionEl.first().update(this.discription);
    },
    toggleSpot:function(){
        this.prevbtn.setDisabled(this.step<=1)
        this.nextbtn.setText(this.store.getCount() == this.step?this.doneText:this.nextText)
        this.setTitle(this.store.getAt(this.step-1).get('title'));
        this.setDiscription(this.store.getAt(this.step-1).get('discription'));
    },
    //初始化时重构此函数
    updateSpot:Ext.emptyFn,
    closeSpot:Ext.emptyFn,
    doneSpot:Ext.emptyFn,
    
    show : function(el){
        if(el){
            if(el.id)
                el = el.id;
            var index = this.store.indexOfId(el);
            if(index != -1){
                //this.store.getById(el);
                this.step = index+1;
            }
//            for(var i = 0;i < this.store.getCount();i++){
//                if(this.data[i].id == el)
//                    this.step = i + 1;
//            }
        }else{
            el=this.store.getAt(this.step-1).get('id');
        }
        Ext.ux.Spotlight.prototype.show.call(this, el);
	    this.toggleSpot();
    },
    applyBounds : function(basePts, anim, doHide, callback, scope){

        var rg = this.el.getRegion();

        var dw = Ext.lib.Dom.getViewWidth(true);
        var dh = Ext.lib.Dom.getViewHeight(true);

        var c = 0, cb = false;
        if(anim){
            cb = {
                callback: function(){
                    c++;
                    if(c == 4){
                        this.animated = false;
                        if(doHide){
                            this.doHide();
                        }
                        Ext.callback(callback, scope, [this]);
                    }
                },
                scope: this,
                duration: this.duration,
                easing: this.easing
            };
            this.animated = true;
        }

        this.titleEl.setBounds(
                basePts ? dw : rg.left,
                0,
                basePts ? 0 : this.el.getWidth(),
                rg.top,
                cb);
                
        if(this.discriptionRegional == 'right'){
            this.discriptionEl.setBounds(
                    rg.right,
                    basePts ? dh : rg.top,
                    dw - rg.right,
                    basePts ? 0 : (dh - rg.top),
                    cb);
        }
        this.footerEl.setBounds(
                rg.left,
                rg.bottom,
                basePts ? 0 : this.el.getWidth(),
                dh - rg.bottom,
                cb);

        Ext.ux.Spotlight.prototype.applyBounds.call(this, basePts, anim, doHide, callback, scope);
    },
    destroy : function(){
        Ext.destroy(
            this.titleEl,
            this.discriptionEl,
            this.footerEl,
            this.footerBar);
        Ext.ux.Spotlight.prototype.destroy.call(this);
    }
});