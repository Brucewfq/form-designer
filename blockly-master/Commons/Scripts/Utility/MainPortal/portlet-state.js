Divo.app.PortalState = function() {
	// -------------------- private properties ------------------
	var sm = Ext.state.Manager;
	var stateId = "app-portal-demo-v-p";
	var portal;

	// -------------------- private method  ------------------
	function saveState() {
		var portletInfos = [];
		var portlets = [];
		var colNum = portal.items.length;
		var rowIndex = 0;
		while (true) {
			var bFound = false;
			for (var i = 0;i < colNum; i++) {
				var p = portal.items.itemAt(i).items.itemAt(rowIndex);
				if (p && p.pInfo && p.pInfo.id) {
					portletInfos.push(p.pInfo);
					portlets.push(p);
					bFound = true;
				}
			}
			if (!bFound) {
				break;
			}
			rowIndex++;
		}

		if (portletInfos.length > 0)
		    sm.set(stateId, portletInfos);
		
		// save height of portlet
		for (var i = 0;i < portlets.length; i++) {
			if (portlets[i].lastSize) {
				var h = portlets[i].lastSize.height;
				var sid = stateId + '-h-' + portletInfos[i].id;
				if (h)
				   sm.set(sid, h);
			}
		}
	}

	// -------------------- public method ------------------
	return {
		init : function(portalId) {
			portal = Ext.ComponentMgr.get(portalId)
		},
		save : function() {
			saveState();
		},
		getVisiblePortlets : function() {
			return sm.get(stateId);
		},
		getHeight : function(portletId) {
			return sm.get(stateId + '-h-' + portletId);
		}
	};
}
// EOP

