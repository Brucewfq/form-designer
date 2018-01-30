/**
 * Thanks: http://www.dnexlookup.com/
 */
Ext.ux.Portal = Ext.extend(Ext.Panel, {
	layout : 'column',
	autoScroll : true,
	cls : 'x-portal',
	defaultType : 'portalcolumn',
	portlets : {},

		initComponent : function() {
			Ext.ux.Portal.superclass.initComponent.call(this);
			this.addEvents( {
				validatedrop : true,
				beforedragover : true,
				dragover : true,
				beforedrop : true,
				drop : true
			});
		},
		initEvents : function() {
			Ext.ux.Portal.superclass.initEvents.call(this);
			this.dd = new Ext.ux.Portal.DropZone(this, this.dropConfig);
		},
		/**
		 * Create New Portlet
		 * 
		 * @param {Object}
		 *            pInfo portlet info(properties: id,text,height)
		 * @param {Array}
		 *            pTools config og tools
		 * @param {Array}
		 *            items content of portlet
		 */
		addPortlet : function(pInfo, pTools, items) {
			var p = new Ext.ux.Portlet( {
				autoCreate : true,
				tools : pTools,
				title : pInfo.text,
				height : pInfo.height,
				items : items,
				plugins : new Ext.ux.MaximizeTool(),
			    html : items?undefined:'Test Only'
			});
			p.pInfo = pInfo;
			this.portlets[pInfo.id] = p;

			var col = this.items.itemAt(0);
			var minNum = col.items.length;
			for (var i = 0;i < this.items.length; i++) {
				var c = this.items.itemAt(i);
				if (c.items.length < minNum) {
					minNum = c.items.length;
					col = c;
				}
			}
			col.add(p);
			p.pClmn = col;
			return p;
		},
		removePortlet : function(id) {
			var p = this.portlets[id];
			if (p) {
				p.pClmn.remove(p, true);
				delete this.portlets[id];
			}
		},
		removeAllPortlets : function() {
			for (var i = 0;i < this.items.length; i++) {
				var c = this.items.itemAt(i);
				for (var j = c.items.length - 1;j >= 0; j--) {
					c.remove(c.items.itemAt(j), true);
				}
			}
			this.portlets = {};
		},
		getAllPortlets : function() {
			var retVal = [];
			for (var i = 0;i < this.items.length; i++) {
				var c = this.items.itemAt(i);
				for (var j = c.items.length - 1;j >= 0; j--) {
					retVal.push(c.items.itemAt(j));
				}
			}
			return retVal;
		},
		getPortlet : function(id) {
			return this.portlets[id];
		}

	});
Ext.reg('portal', Ext.ux.Portal);

Ext.ux.Portal.DropZone = function(portal, cfg) {
	this.portal = portal;
	Ext.dd.ScrollManager.register(portal.body);
	Ext.ux.Portal.DropZone.superclass.constructor.call(this, portal.bwrap.dom,
			cfg);
	portal.body.ddScrollConfig = this.ddScrollConfig;
};

Ext
		.extend(Ext.ux.Portal.DropZone, Ext.dd.DropTarget, {
			ddScrollConfig : {
				vthresh : 50,
				hthresh : -1,
				animate : true,
				increment : 200
			},

			createEvent : function(dd, e, data, col, c, pos) {
				return {
					portal : this.portal,
					panel : data.panel,
					columnIndex : col,
					column : c,
					position : pos,
					data : data,
					source : dd,
					rawEvent : e,
					status : this.dropAllowed
				};
			},

			notifyOver : function(dd, e, data) {
				var xy = e.getXY(), portal = this.portal, px = dd.proxy;

				// case column widths
				if (!this.grid) {
					this.grid = this.getGrid();
				}

				// handle case scroll where scrollbars appear during drag
				var cw = portal.body.dom.clientWidth;
				if (!this.lastCW) {
					this.lastCW = cw;
				} else if (this.lastCW != cw) {
					this.lastCW = cw;
					portal.doLayout();
					this.grid = this.getGrid();
				}

				// determine column
				var col = 0, xs = this.grid.columnX, cmatch = false;
				for (var len = xs.length;col < len; col++) {
					if (xy[0] < (xs[col].x + xs[col].w)) {
						cmatch = true;
						break;
					}
				}
				// no match, fix last index
				if (!cmatch) {
					col--;
				}

				// find insert position
				var p, match = false, pos = 0, c = portal.items.itemAt(col), items = c.items.items;

				for (var len = items.length;pos < len; pos++) {
					p = items[pos];
					var h = p.el.getHeight();
					if (h !== 0 && (p.el.getY() + (h / 2)) > xy[1]) {
						match = true;
						break;
					}
				}

				var overEvent = this.createEvent(dd, e, data, col, c, match
						&& p ? pos : c.items.getCount());

				if (portal.fireEvent('validatedrop', overEvent) !== false
						&& portal.fireEvent('beforedragover', overEvent) !== false) {

					// make sure proxy width is fluid
					px.getProxy().setWidth('auto');

					if (p) {
						px.moveProxy(p.el.dom.parentNode, match
								? p.el.dom
								: null);
					} else {
						px.moveProxy(c.el.dom, null);
					}

					this.lastPos = {
						c : c,
						col : col,
						p : match && p ? pos : false
					};
					this.scrollPos = portal.body.getScroll();

					portal.fireEvent('dragover', overEvent);

					return overEvent.status;;
				} else {
					return overEvent.status;
				}

			},

			notifyOut : function() {
				delete this.grid;
			},

			notifyDrop : function(dd, e, data) {
				delete this.grid;
				if (!this.lastPos) {
					return;
				}
				var c = this.lastPos.c, col = this.lastPos.col, pos = this.lastPos.p;

				var dropEvent = this.createEvent(dd, e, data, col, c,
						pos !== false ? pos : c.items.getCount());

				if (this.portal.fireEvent('validatedrop', dropEvent) !== false
						&& this.portal.fireEvent('beforedrop', dropEvent) !== false) {

					dd.proxy.getProxy().remove();
					dd.panel.el.dom.parentNode.removeChild(dd.panel.el.dom);
					if (pos !== false) {
						c.insert(pos, dd.panel);
					} else {
						c.add(dd.panel);
					}

					c.doLayout();

					this.portal.fireEvent('drop', dropEvent);

					// scroll position is lost on drop, fix it
					var st = this.scrollPos.top;
					if (st) {
						var d = this.portal.body.dom;
						setTimeout(function() {
							d.scrollTop = st;
						}, 10);
					}

				}
				delete this.lastPos;
			},

			// internal cache of body and column coords
			getGrid : function() {
				var box = this.portal.bwrap.getBox();
				box.columnX = [];
				this.portal.items.each(function(c) {
					box.columnX.push( {
						x : c.el.getX(),
						w : c.el.getWidth()
					});
				});
				return box;
			}
		});

/**
 * Thanks: http://extjs.com/forum/showthread.php?t=18593
 */
Ext.ux.Portlet = Ext.extend(Ext.Panel, {
    anchor: '100%',
    frame: true,
    collapsible: true,
    draggable: true,
    cls: 'x-portlet',
 
    onRender : function(ct, position) {
        Ext.ux.Portlet.superclass.onRender.call(this, ct, position);
 
        this.resizer = new Ext.Resizable(this.el, {
            animate: true,
            duration: .6,
            easing: 'backIn',
            handles: 's',
            minHeight: this.minHeight || 100,
            pinned: false
        });
        this.resizer.on("resize", this.onResizer, this);  
    },
 
    onResizer : function(oResizable, iWidth, iHeight, e) {
        this.setHeight(iHeight);
    },
 
    onCollapse : function(doAnim, animArg) {
        this.el.setHeight("");  // remove height set by resizer
        Ext.ux.Portlet.superclass.onCollapse.call(this, doAnim, animArg);
    }
});
('portlet', Ext.ux.Portlet);

Ext.ux.PortalColumn = Ext.extend(Ext.Container, {
	layout : 'anchor',
	autoEl : 'div',
	defaultType : 'portlet',
	cls : 'x-portal-column'
});
Ext.reg('portalcolumn', Ext.ux.PortalColumn);

// EOP
