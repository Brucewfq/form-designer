var checkBoxes = [];
Divo.app.PortalManager = function() {
	// ----------------- private properties ----------------------
	var prefs = [
	 {
		id : 'MyTask',
		text : 'MyTask',
		items : {
				id : 'MyTask',
				xtype : 'iframepanel',
				defaultSrc : function() {
					return '/web/aspx/MyTask/MyTask.aspx';
				}
		} //TODO:  http://extjs.com/forum/showthread.php?t=20750		
	}, 
	{
		id : 'MyDraft',
		text : 'MyDraft',
		items:  {
        		id : 'MyDraft',
				xtype : 'iframepanel',
				defaultSrc : function() {
					return '/web/aspx/draftBox/DraftIndex.aspx';
					}
    	} //TODO: close it, then open again, SampleGrid not display!
	}, {
		id : 'p1',
		text : 'Portlet1',
		items:undefined
	}, {
		id : 'p2',
		text : 'Portlet2',
		items:undefined
	},{
	    id:'AppTask',
	    text:'AppTask',
	    items:{
	        id:'AppTask',
	        xtype:'iframepanel',
	        defaultSrc:function(){
	            return '/web/aspx/ApproveTask/ApproveTask.aspx';
	        }
	    }
	}];

	var portalState, portal, settingId;
	
	var me;

	// -----------------  private method ----------------------
	function createCheckbox() {
		var div = Ext.get(settingId);
		div.dom.innerHTML = "";
		var tbl = document.createElement("table");
		tbl.setAttribute("id", "app-portal-demo-tbl-dn-ext");
		var tBody = document.createElement("tBody");
		tbl.appendChild(tBody);
		tbl.cellPadding = 2;
		tbl.cellSpacing = 2;
		var row = document.createElement("tr");
		tBody.appendChild(row);
		var cell = document.createElement("td");
		cell.colSpan = 4;
		cell.innerHTML = "<span>Portlet样例:<br></span>";
		row.appendChild(cell);
		for (var i = 0;i < prefs.length; i++) {
			var text = prefs[i].text;
			var rowInd = Math.round(i / 2 - 0.1, 0) + 1;
			if (rowInd >= tbl.rows.length - 1) {
				var row = document.createElement("tr");
				tBody.appendChild(row);
			}
			var row = tbl.rows[rowInd];
			var cell = document.createElement("td");
			cell.width = "20px;"
			row.appendChild(cell);
			var chk = document.createElement("input");
			chk.type = "checkbox";
			chk.id = prefs[i].id;
			chk.txt = text;
			cell.appendChild(chk);
			checkBoxes.push(chk);
			chk.onclick = onChkChanged;
			cell = document.createElement("td");
			row.appendChild(cell);
			cell.innerHTML = text;
		}
		div.appendChild(tbl); 
	}

	function onChkChanged(e) {
		var evt = e || window.event;
		var chk = evt.target || evt.srcElement;
		if (!chk.checked) {
			portal.removePortlet(chk.id);
			portal.doLayout();
		} else if (chk.checked) {
			showPortlet( {
				text : chk.txt,
				id : chk.id,
				checked : true
			});
			portal.doLayout();
		}
		portalState.save();
	}

	function restoreState() {
		var portlets = portalState.getVisiblePortlets();
		if (!portlets) return;

		portal.removeAllPortlets();
		for (var i = 0;i < portlets.length && i < 9; i++) {
			var p = portlets[i];
			if (p && p.id) {
				showPortlet(p);
				me.setCheckBox(p.id, 'true');
			}
		}
		portal.doLayout();
	}

	function showPortlet(pInfo) {
		var items;
		for (var i = 0;i < prefs.length; i++) {
			if (prefs[i].text==pInfo.text) {
				items = prefs[i].items;
				break;
			}
		};	
		
		var pTools = [{
			id : 'close',
			handler : function(e, target, panel) {
				panel.ownerCt.remove(panel, true);
				me.setCheckBox(panel.pInfo.id, false);
				portalState.save();
			}
		}];
		var h = portalState.getHeight(pInfo.id);
		var p = portal.addPortlet( {
			id : pInfo.id,
			text : pInfo.text,
			height : h || 200
		}, pTools,items);
		
		p.on("resize", function() {
				portalState.save();
		});
	}

	// -------------------- public method -----------------------
	return {
		/**
		 * @param {String}
		 *            sId div id of container of all checkbox
		 * @param {String}
		 *            portId id of portlet
		 * @param {Divo.app.PortalState}
		 *            ps 
		 */
		init : function(sId, portId, ps) {
			settingId = sId;
			portalState = ps;
			me = this;
			portal = Ext.ComponentMgr.get(portId);

			createCheckbox();
			restoreState();
		},
		setCheckBox : function(ext, checked) {
		    
			for (var i = 0;i < checkBoxes.length; i++) {
			    
				if (checkBoxes[i].id == ext) {
					checkBoxes[i].checked = checked;
					break;
				}
			}
		}

	};
}
// EOP

