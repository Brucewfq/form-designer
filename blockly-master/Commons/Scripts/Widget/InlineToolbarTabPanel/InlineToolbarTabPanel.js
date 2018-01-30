Ext.namespace('Ext.ux.InlineToolbarTabPanel');
Ext.ux.InlineToolbarTabPanel = Ext.extend(Ext.TabPanel, {
    createClasses: function () {
        Ext.ux.InlineToolbarTabPanel.superclass.createClasses.apply(this, arguments);
        this.inlineTbarCls = this.baseCls + '-inlinetbar'; //内嵌toolbar样式名
    },
    initComponent: function () {
        Ext.ux.InlineToolbarTabPanel.superclass.initComponent.call(this);
        if (this.inlineTbar) {
            this.elements += ',inlineTbar';
            this.inlineTopToolbar = this.createToolbar(this.inlineTbar);
            delete this.inlineTbar;
        }
    },
    // private  lyf 20140730
    createAndAppendFirstElement: function (name, pnode) {
        if (this[name]) {
            if (pnode.firstChild)
                pnode.insertBefore(this[name].dom, pnode.firstChild);
            else
                pnode.appendChild(this[name].dom);
            return;
        }

        if (name === 'bwrap' || this.elements.indexOf(name) != -1) {
            if (this[name + 'Cfg']) {
                this[name] = Ext.fly(pnode).createChild(this[name + 'Cfg']);
            } else {
                var el = document.createElement('div');
                el.className = this[name + 'Cls'];

                if (pnode.firstChild)
                    this[name] = Ext.get(pnode.insertBefore(el, pnode.firstChild));
                else
                    this[name] = Ext.get(pnode.appendChild(el));
                //this[name] = Ext.get(pnode.appendChild(el));
            }
            if (this[name + 'CssClass']) {
                this[name].addClass(this[name + 'CssClass']);
            }
            if (this[name + 'Style']) {
                this[name].applyStyles(this[name + 'Style']);
            }
        }
    },
    onRender: function (ct, position) {
        Ext.ux.InlineToolbarTabPanel.superclass.onRender.call(this, ct, position);
        var el = this.el, d = el.dom;
        if (d.firstChild)
            this.inlineTbar = this.stripWrap.down('.' + this.inlineTbarCls);
        //创建inlinetbar容器
        var name = 'inlineTbar';
        this.createAndAppendFirstElement(name, d.firstChild);

        if (this.border === false) {
            if (this.inlineTbar) {
                this.inlineTbar.addClass(this.inlineTbarCls + '-noborder');
            }
        }
        if (this.inlineTbar && this.inlineTopToolbar) {
            this.inlineTopToolbar.ownerCt = this;
            this.inlineTopToolbar.render(this.inlineTbar);
        }
    },
    afterRender: function () {
        Ext.ux.InlineToolbarTabPanel.superclass.afterRender.call(this);
    },
    onResize: function () {
        Ext.ux.InlineToolbarTabPanel.superclass.onResize.apply(this, arguments);
    },
    autoScrollTabs: function () {
        if (Ext.isEmpty(this.inlineTopToolbar)) return;

        var tbEl = this.inlineTopToolbar.getEl();
        var tbWidth = tbEl.dom.offsetWidth;
        var w = this.header.dom.offsetWidth - tbWidth;
        //this.stripWrap.setWidth(w);

        this.pos = this.tabPosition == 'bottom' ? this.footer : this.header;
        var count = this.items.length,
			ow = this.pos.dom.offsetWidth,
			wrap = this.stripWrap,
			wd = wrap.dom,
			tw = wd.clientWidth,
			cw = wd.offsetWidth,
			pos = this.getScrollPos(),
			l = this.edge.getOffsetsTo(this.stripWrap)[0] + pos;

        if (!this.enableTabScroll || count < 1 || cw < 20) { // 20 to prevent display:none issues
            return;
        }
        if (l <= tw) {
            wd.scrollLeft = 0;
            wrap.setWidth(tw);
            if (this.scrolling) {
                this.scrolling = false;
                this.pos.removeClass('x-tab-scrolling');
                this.scrollLeft.hide();
                this.scrollRight.hide();
                // See here: http://extjs.com/forum/showthread.php?t=49308&highlight=isSafari
                if (Ext.isAir || Ext.isWebKit) {
                    wd.style.marginLeft = '';
                    wd.style.marginRight = '';
                }
            }
        } else {
            if (!this.scrolling) {
                this.pos.addClass('x-tab-scrolling');
                // See here: http://extjs.com/forum/showthread.php?t=49308&highlight=isSafari
                if (Ext.isAir || Ext.isWebKit) {
                    wd.style.marginLeft = '18px';
                    wd.style.marginRight = '18px';
                }
            }
            tw -= wrap.getMargins('lr') + 2;
            wrap.setWidth(tw > 20 ? tw : 20);
            if (!this.scrolling) {
                if (!this.scrollLeft) {
                    this.createScrollers();
                } else {
                    this.scrollLeft.show();
                    this.scrollRight.show();
                }
            }
            this.scrolling = true;
            if (pos > (l - tw)) { // ensure it stays within bounds
                wd.scrollLeft = l - tw;
            } else { // otherwise, make sure the active tab is still visible
                this.scrollToTab(this.activeTab, false);
            }
            this.updateScrollButtons();
        }
        if (this.scrollRight)
            this.scrollRight.setRight(tbWidth);
    }
});
Ext.reg('InlineToolbarTabPanel', Ext.ux.InlineToolbarTabPanel);
