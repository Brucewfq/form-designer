Ext.grid.VerticalGridview = function(config){
	Ext.grid.VerticalGridview.superclass.constructor.call(this, config);
	this.addEvents(
		"columnsummaryupdate"//列总和更新事件
	);
};
Ext.extend(Ext.grid.VerticalGridview, Ext.grid.GridView, {
    isGroupSummary: true, //是否启用列统计
    headerWidth: 200, //表头宽度
    rowsWidth: 80, //每条记录段宽度
    colsTotalWidth: 80, //列总计宽度
    colWidth: 23,
    isColsTotal: true, //是否需要右侧的合计列
    isRowsTotal: true, //是否需要右侧的合计列
    enableColumnResize: false, //不能改变列大小
    scrollOffset: 17, //滚动条大小
    hdCls: 'x-grid3-hd',
    cellSelector: 'li.x-grid3-cell', //数据单元格选择器
    rowSelector: 'div.x-grid3-row', //数据行选择器
    //初始化gridview模板
    initTemplates: function () {
        var ts = this.templates || {};
        if (!ts.master) {
            ts.master = new Ext.Template(
				'<div class="x-grid3 x-grid3-vertical" hidefocus="true">',
					'<div class="x-grid3-viewport">',
						'<div class="x-grid3-header"><div class="x-grid3-header-inner"><div class="x-grid3-header-offset">{header}</div></div><div class="x-clear"></div></div>',
						'<div class="x-grid3-scroller"><div class="x-grid3-body">{body}<div class="x-clear"></div></div><a href="#" class="x-grid3-focus" tabIndex="-1"></a></div>',
						(this.isColsTotal ? '<div class="x-grid3-columnsummary"><div class="x-grid3-columnsummary-inner"><div class="x-grid3-columnsummary-offset">{columnsummary}</div></div><div class="x-clear"></div></div>' : ''), //summary
						'<div class="x-clear"></div>',
						(this.isRowsTotal ? '{rowsummary}' : ''), //summary
					'</div>',
					'<div class="x-grid3-resize-marker">&#160;</div>',
					'<div class="x-grid3-resize-proxy">&#160;</div>',
				'</div>'
			);
        }

        if (!ts.header) {
            ts.header = new Ext.Template(
				'<ul class="x-grid3-hd-row" style="{style}">{cells}</ul>'
			);
        }

        if (!ts.hcell) {
            ts.hcell = new Ext.Template(
				'<li class="x-grid3-hd x-grid3-cell x-grid3-li-{id}" style="{style}"><div {tooltip} {attr} class="x-grid3-hd-inner x-grid3-hd-{id}" unselectable="on" style="{istyle}">', this.grid.enableHdMenu ? '<a class="x-grid3-hd-btn" href="#"></a>' : '',
					'{value}<img class="x-grid3-sort-icon" src="', Ext.BLANK_IMAGE_URL, '" />',
				'</div></li>'
			);
        }

        if (!ts.body) {
            ts.body = new Ext.Template('{rows}');
        }
        var innerText = [
			'<ul class="x-grid3-row-ul" style="{tstyle}overflow:hidden;">',
				'{cells}',
			'</ul>',
        //this.enableRowBody为true则行展开详细（Details）
        //bodyStyle 设定描述样式 this.bodyStyle中设定
			(this.enableRowBody ? '<div class="x-grid3-row-body-ul" style="{bodyStyle}{tstyle}"><div class="x-grid3-body-cell" tabIndex="0" hidefocus="on"><div class="x-grid3-row-body">{body}</div></div></div>' : '')
        ].join("");

        if (!ts.row) {
            ts.row = new Ext.Template(
				'<div class="x-grid3-row {alt}" style="{tstyle} overflow:hidden;">',
					innerText,
				'</div>'
			);
        }
        if (!ts.rowInner) {
            ts.rowInner = new Ext.Template(innerText);
        }

        if (!ts.cell) {
            ts.cell = new Ext.Template(
				'<li class="x-grid3-col x-grid3-cell x-grid3-li-{id} {css}" style="{style} overflow:hidden;" tabIndex="0" {cellAttr}>',
					'<div class="x-grid3-cell-inner x-grid3-col-{id}" unselectable="on" {attr}>{value}</div>',
				'</li>'
			);
        }

        //列总计
        //是否使用列总计
        if (this.isGroupSummary) {
            if (!ts.columnSummary) {
                ts.columnSummary = new Ext.Template(
				    '<ul class="x-grid3-cs-row" style="{cstyle}">{cells}</ul>'
			    );
            }

            if (!ts.columnSummaryCell) {
                ts.columnSummaryCell = new Ext.Template(
				    '<li class="x-grid3-cs x-grid3-cell x-grid3-cs-{id}" style="{style}"><div {tooltip} {attr} class="x-grid3-cs-inner x-grid3-cs-{id}" unselectable="on">',
					    '{value}',
				    "</div></li>"
			    );
            }
        }

        //记录总计
        if (!ts.rowSummary) {
            ts.rowSummary = new Ext.Template(
				'<div class="x-grid3-rowsummary">',
					'<div class="x-grid3-rs-title">(Totals)</div>',
					'<div class="x-grid3-rowsummary-inner"><div class="x-grid3-rowsummary-offset"><ul class="x-grid3-rs-row" style="{fstyle}">{cells}</ul><div class="x-clear"></div></div></div>',
					'<div class="x-grid3-total">{total}</div>',
				'</div>'
			);
        }
        if (!ts.rowSummaryCell) {
            ts.rowSummaryCell = new Ext.Template(
				'<li class="x-grid3-rs x-grid3-cell x-grid3-rs-{id}" style="{fstyle}"><div {tooltip} {attr} class="x-grid3-rs-inner x-grid3-rs-{id}" unselectable="on" style="{istyle}">',
					'{value}',
				"</div></li>"
			);
        }

        for (var k in ts) {
            var t = ts[k];
            if (t && typeof t.compile == 'function' && !t.compiled) {
                t.disableFormats = true;
                t.compile();
            }
        }

        this.templates = ts;
        this.colRe = new RegExp("x-grid3-li-([^\\s]+)", "");
    },
    //将dom中所有必要元素ext对象化
    initElements: function () {
        Ext.grid.VerticalGridview.superclass.initElements.call(this);
        if (this.isGroupSummary) {
            this.mainColumnsummary = new Ext.Element(this.mainWrap.dom.childNodes[2]); //x-grid3-columnsummary列总计元素
            this.innerColumnSummary = this.mainColumnsummary.dom.firstChild; //x-grid3-columnsummary-inner//列总计显示区域外层
        }
    },
    findCellIndex: function (el, requiredCls) {
        var cell = this.findCell(el);
        if (cell && (!requiredCls || this.fly(cell).hasClass(requiredCls))) {
            return this.getCellIndex(cell);
        }
        return false;
    },
    getCell: function (row, col) {
        return this.getRow(row).getElementsByTagName('li')[col]; //*******************竟然在这里使用硬耦合的方式
    },
    getHeaderCell: function (index) {
        return this.mainHd.dom.getElementsByTagName('li')[index]; //*******************竟然在这里使用硬耦合的方式
    },
    updateAllColumnWidths: function () {
        var tw = this.getTotalWidth();
        var clen = this.cm.getColumnCount();
        var ws = [];
        for (var i = 0; i < clen; i++) {
            ws[i] = this.getColumnWidth(i);
        }
        this.innerHd.firstChild.firstChild.style.width = tw; //ts.header模板宽度
        for (var i = 0; i < clen; i++) {
            var hd = this.getHeaderCell(i);
            hd.style.width = ws[i];
        }
        var ns = this.getRows();
        for (var i = 0, len = ns.length; i < len; i++) {
            ns[i].style.width = tw;
            ns[i].firstChild.style.width = tw;
            var row = ns[i].firstChild; //**********************
            for (var j = 0; j < clen; j++) {
                row.childNodes[j].style.width = ws[j];
            }
        }
        this.onAllColumnWidthsUpdated(ws, tw);
    },
    //更新列宽
    updateColumnWidth: function (col, width) {
        var w = this.getColumnWidth(col);
        var tw = this.getTotalWidth();
        this.innerHd.firstChild.firstChild.style.width = tw; //**********************
        var hd = this.getHeaderCell(col);
        hd.style.width = tw;
        var ns = this.getRows();
        for (var i = 0, len = ns.length; i < len; i++) {
            ns[i].style.width = w;
            ns[i].firstChild.style.width = w;
            ns[i].firstChild.childNodes[col].style.width = w; //*******************使用table dom对象的rows硬耦合
        }
        this.onColumnWidthUpdated(col, w, tw);
    },
    //更新列宽，当隐藏和显示行操作是调用
    updateColumnHidden: function (col, hidden) {
        var tw = this.getTotalWidth();
        this.innerHd.firstChild.firstChild.style.width = tw;
        var display = hidden ? 'none' : '';
        var hd = this.getHeaderCell(col);
        hd.style.display = display;
        var ns = this.getRows();
        tw = this.getColumnWidth();
        for (var i = 0, len = ns.length; i < len; i++) {
            ns[i].style.width = tw;
            ns[i].firstChild.style.width = tw;
            ns[i].firstChild.childNodes[col].style.display = display; //*******************使用table dom对象的rows硬耦合
        }
        this.onColumnHiddenUpdated(col, hidden, tw);
        delete this.lastViewWidth;
        this.layout();
    },
    //当gv渲染结束后开始渲染表体数据部分
    afterRender: function () {
        this.mainBody.dom.innerHTML = this.renderRows();
        this.processRows(0, true);
        if (this.deferEmptyText !== true) {
            this.applyEmptyText();
        }

        this.doColumnsSummary()//**********************
    },
    doColumnsSummary: function () {//**********************
        if (this.isGroupSummary) {
            var ds = this.grid.store;
            var rs = ds.getRange(0, ds.getCount() - 1);
            var cs = this.getColumnData();
            var data = this.calculate(rs, cs);
            this.innerColumnSummary.firstChild.innerHTML = this.renderColumnsSummary({ data: data }, cs);
            this.fireEvent("columnsummaryupdate", this, data, cs);
        }
        //Ext.DomHelper.overwrite(colSumEl, this.renderColumnsSummary({data: data}, cs));
        return true;
    },

    //计算，未处理清零数据？？？？？？？？？？？？？？？？？
    calculate: function (rs, cs) {
        var data = {}, r, c, cfg = this.cm.config, cf;
        if (rs.length > 0) {
            for (var j = 0, jlen = rs.length; j < jlen; j++) {
                r = rs[j];
                for (var i = 0, len = cs.length; i < len; i++) {
                    c = cs[i];
                    cf = cfg[i];
                    if (cf.summaryType) {
                        data[c.name] = Ext.grid.GroupSummary.Calculations[cf.summaryType](data[c.name] || 0, r, c.name, data);
                    }
                }
            }
        } else {
            for (var i = 0, len = cs.length; i < len; i++) {
                c = cs[i];
                cf = cfg[i];
                if (cf.summaryType) {
                    data[c.name] = 0;
                }
            }
        }
        return data;
    },
    renderColumnsSummary: function (o, cs) {
        cs = cs || this.view.getColumnData();
        var cfg = this.cm.config;

        var buf = [], c, p = {}, cf, last = cs.length - 1;
        for (var i = 0, len = cs.length; i < len; i++) {
            c = cs[i];
            cf = cfg[i];
            p.id = c.id;
            p.style = this.getColumnStyle(i, null, true); //***************************
            p.css = i == 0 ? 'x-grid3-cell-first ' : (i == last ? 'x-grid3-cell-last ' : '');
            if (cf.summaryType || cf.summaryRenderer) {
                p.value = (cf.summaryRenderer || c.renderer)(o.data[c.name], p, o);
            } else {
                p.value = '';
            }
            if (p.value != undefined && p.value !== "") p.attr = 'title="' + p.value + '"'; //**********************
            if (p.value == undefined || p.value === "") p.value = "&#160;";
            buf[buf.length] = this.templates.columnSummaryCell.apply(p);
        }

        return this.templates.columnSummary.apply({
            cstyle: 'width:' + (this.colsTotalWidth - 1) + 'px;',
            cells: buf.join('')
        });
    },
    layout: function () {
        if (!this.mainBody) {
            return;
        }
        var g = this.grid;
        var c = g.getGridEl();
        var csize = c.getSize(true);
        var vw = csize.width;
        if (vw < 20 || csize.height < 20) {
            return;
        }
        if (g.autoHeight) {
            this.scroller.dom.style.overflow = 'visible';
        } else {
            this.el.setSize(csize.width, csize.height);
            var hdHeight = this.mainHd.getHeight();
            //var vh = (hdHeight+this.scrollOffset);
            var totalHeight = this.cm.getColumnCount(true) * this.colWidth;
            var vh = (totalHeight + this.scrollOffset);
            this.scroller.setSize(vw - this.headerWidth - this.colsTotalWidth, vh);
            if (this.innerHd) {
                this.innerHd.style.width = this.getTotalWidth();
                this.innerHd.style.height = totalHeight + 'px';
                this.mainHd.setWidth(this.headerWidth);
            }
            if (this.innerColumnSummary) {
                this.innerColumnSummary.style.width = (this.colsTotalWidth - 1) + 'px';
                this.innerColumnSummary.style.height = totalHeight + 'px';
                this.mainColumnsummary.setWidth(this.colsTotalWidth - 1);
            }
        }
        if (this.forceFit) {
            if (this.lastViewWidth != vw) {
                this.fitColumns(false, false);
                this.lastViewWidth = vw;
            }
        } else {
            this.autoExpand();
            this.syncHeaderScroll();
        }
        this.onLayout(vw, vh);
    },
    onColumnWidthUpdated: function (col, w, tw) {//**********************
        this.doColumnsSummary();
    },
    renderHeaders: function () {
        var cm = this.cm, ts = this.templates;
        var ct = ts.hcell;
        var cb = [], sb = [], p = {};
        //替换所有表头项模板
        for (var i = 0, len = cm.getColumnCount(); i < len; i++) {
            p.id = cm.getColumnId(i);
            p.value = cm.getColumnHeader(i) || "";
            p.style = this.getColumnStyle(i, true); //设定列样式，宽度、文字居中和是否隐藏
            p.tooltip = this.getColumnTooltip(i);
            if (cm.config[i].align == 'right') {
                p.istyle = 'padding-right:16px';
            } else {
                delete p.istyle;
            }
            cb[cb.length] = ct.apply(p);
        }
        //替换表头模板及宽度
        //将表头项注入到表头模板中
        return ts.header.apply({ cells: cb.join(""), tstyle: 'width:' + this.getTotalWidth() + ';' });
    },
    doRender: function (cs, rs, ds, startRow, colCount, stripe) {
        var ts = this.templates, ct = ts.cell, rt = ts.row, last = colCount - 1;
        var tstyle = 'width:' + this.rowsWidth + 'px;'; //**********************
        var buf = [], cb, c, p = {}, rp = { tstyle: tstyle }, r;
        for (var j = 0, len = rs.length; j < len; j++) {
            r = rs[j]; cb = [];
            var rowIndex = (j + startRow);
            for (var i = 0; i < colCount; i++) {
                c = cs[i];
                p.id = c.id;
                p.css = i == 0 ? 'x-grid3-cell-first ' : (i == last ? 'x-grid3-cell-last ' : '');
                p.attr = p.cellAttr = "";
                p.value = c.renderer(r.data[c.name], p, r, rowIndex, i, ds);
                p.style = c.style;
                if (p.value == undefined || p.value === "") p.value = "&#160;";
                if (r.data[c.name] != undefined && r.data[c.name] !== "") p.attr = 'title="' + r.data[c.name] + '"'; //**********************
                if (r.dirty && typeof r.modified[c.name] !== 'undefined') {
                    p.css += ' x-grid3-dirty-cell';
                }
                cb[cb.length] = ct.apply(p);
            }
            var alt = [];
            if (stripe && ((rowIndex + 1) % 2 == 0)) {
                alt[0] = "x-grid3-row-alt";
            }
            if (r.dirty) {
                alt[1] = " x-grid3-dirty-row";
            }
            rp.cols = colCount;
            if (this.getRowClass) {
                alt[2] = this.getRowClass(r, rowIndex, rp, ds);
            }
            rp.alt = alt.join(" ");
            rp.cells = cb.join("");
            buf[buf.length] = rt.apply(rp);
        }
        return buf.join("");
    },
    //设定列样式，宽度、文字居中和是否隐藏
    getColumnStyle: function (col, isHeader, isColumnsSummary) {
        var style = !isHeader ? (this.cm.config[col].css || '') : (this.cm.config[col].headerCss || '');

        if (isHeader)
            style += 'width:' + this.getTotalWidth() + ';';
        else if (isColumnsSummary)//***********************************
            style += 'width:' + (this.colsTotalWidth - 1) + 'px;';
        else
            style += 'width:' + this.getColumnWidth(col) + ';';
        if (this.cm.isHidden(col)) {
            style += 'display:none;';
        }
        var align = this.cm.config[col].align;
        if (!isHeader && align) {
            style += 'text-align:' + align + ';';
        }
        return style;
    },
    getColumnWidth: function (col) {
        return this.rowsWidth + 'px';
    },
    //所有列中宽度加上px的字符串
    getTotalWidth: function () {
        return this.headerWidth + 'px';
    },
    //根据窗体调整列
    //preventRefresh防止刷新
    //onlyExpand仅展开列
    fitColumns: function (preventRefresh, onlyExpand, omitColumn) {
        var cm = this.cm, leftOver, dist, i;
        var tw = cm.getTotalWidth(false); //不包含隐藏列的总宽度
        var aw = this.grid.getGridEl().getWidth(true) - this.scrollOffset; //GridPanel.body.contentWidth - 滚动条偏移量，即实际内容区域
        if (aw < 20) {//如果可是区域小于滚动条大小则返回
            return;
        }
        var extra = aw - tw; //溢出宽度
        if (extra === 0) {//如果不溢出这返回
            return false;
        }
        var vc = cm.getColumnCount(true); //可显示的列数
        var ac = vc - (typeof omitColumn == 'number' ? 1 : 0);
        if (ac === 0) {
            ac = 1;
            omitColumn = undefined;
        }
        var colCount = cm.getColumnCount(); //所有列数
        var cols = [];
        var extraCol = 0;
        var width = 0;
        var w;
        for (i = 0; i < colCount; i++) {
            if (!cm.isHidden(i) && !cm.isFixed(i) && i !== omitColumn) {
                w = cm.getColumnWidth(i);
                cols.push(i);
                extraCol = i;
                cols.push(w);
                width += w;
            }
        }
        var frac = (aw - cm.getTotalWidth()) / width;
        while (cols.length) {
            w = cols.pop();
            i = cols.pop();
            cm.setColumnWidth(i, Math.max(this.grid.minColumnWidth, Math.floor(w + w * frac)), true);
        }
        if ((tw = cm.getTotalWidth(false)) > aw) {
            var adjustCol = ac != vc ? omitColumn : extraCol;
            cm.setColumnWidth(adjustCol, Math.max(1,
					 cm.getColumnWidth(adjustCol) - (tw - aw)), true);
        }
        if (preventRefresh !== true) {
            this.updateAllColumnWidths();
        }
        return true;
    },
    //渲染行
    renderRows: function (startRow, endRow) {
        this.updateMainBodyWidth(); //**********************

        var g = this.grid, cm = g.colModel, ds = g.store, stripe = g.stripeRows;
        var colCount = cm.getColumnCount();
        if (ds.getCount() < 1) {
            return "";
        }
        var cs = this.getColumnData();
        startRow = startRow || 0;
        endRow = typeof endRow == "undefined" ? ds.getCount() - 1 : endRow;
        var rs = ds.getRange(startRow, endRow);
        return this.doRender(cs, rs, ds, startRow, colCount, stripe);
    },
    //刷新整个view
    refresh: function (headersToo) {
        this.fireEvent("beforerefresh", this);
        this.grid.stopEditing(true);
        var result = this.renderBody();
        this.mainBody.update(result);
        if (headersToo === true) {
            this.updateHeaders();
            this.updateHeaderSortState();
        }
        this.processRows(0, true);
        this.layout();
        this.applyEmptyText();
        this.doColumnsSummary()//**********************

        this.fireEvent("refresh", this);
    },
    onUpdate: function (ds, record) {
        this.refreshRow(record);
        this.doColumnsSummary(); //**********************
    },
    onAdd: function (ds, records, index) {
        this.insertRows(ds, index, index + (records.length - 1));
        this.doColumnsSummary(); //**********************
    },
    //更新横标很想滚动层宽度
    updateMainBodyWidth: function (isUpdate) {
        if (this.grid.store.getCount() > 0 && isUpdate !== true) {
            this.mainBody.setWidth(this.grid.store.getCount() * (this.rowsWidth + 2)); //**********************加左右两像素宽度
        }
    },
    onRemove: function (ds, record, index, isUpdate) {
        this.updateMainBodyWidth(isUpdate); //**********************

        if (isUpdate !== true) {
            this.fireEvent("beforerowremoved", this, index, record);
        }
        this.removeRow(index);
        if (isUpdate !== true) {
            this.processRows(index);
            this.applyEmptyText();
            this.fireEvent("rowremoved", this, index, record);
        }
        if (isUpdate !== true) {
            this.doColumnsSummary(); //**********************
        }
    },
    onLoad: function () {
        this.scrollToTop();
        this.doColumnsSummary(); //**********************
    },
    //列隐藏事件
    onHiddenChange: function (cm, col, hidden) {
        Ext.grid.VerticalGridview.superclass.onHiddenChange.call(this, cm, col, hidden);
        this.doColumnsSummary(); //**********************
    },
    //行焦点
    //将隐藏的A元素移动到指定好的左上角，便于其他元素定位
    focusRow: function (row) {
        //		this.focusCell(row, 0, false);
    },
    //单元焦点
    //将隐藏的A元素移动到指定的单元右上角，便于其他元素定位
    focusCell: function (row, col, hscroll) {
        //		row = Math.min(row, Math.max(0, this.getRows().length-1));
        //		var xy = this.ensureVisible(row, col, hscroll);
        //		this.focusEl.setXY(xy||this.scroller.getXY());
        //		
        //		if(Ext.isGecko){
        //			this.focusEl.focus();
        //		}else{
        //			this.focusEl.focus.defer(1, this.focusEl);
        //		}
    },
    //获取指定单元的XY坐标
    ensureVisible: function (row, col, hscroll) {
        //		if(typeof row != "number"){
        //			row = row.rowIndex;
        //		}
        //		if(!this.ds){
        //			return;
        //		}
        //		if(row < 0 || row >= this.ds.getCount()){
        //			return;
        //		}
        //		col = (col !== undefined ? col : 0);
        //		var rowEl = this.getRow(row), cellEl;
        //		if(!(hscroll === false && col === 0)){
        //			while(this.cm.isHidden(col)){
        //				col++;
        //			}
        //			cellEl = this.getCell(row, col);
        //		}
        //		if(!rowEl){
        //			return;
        //		}
        //		var c = this.scroller.dom;
        //		var ctop = 0;
        //		var p = rowEl, stop = this.mainBody.dom;//this.el.dom;
        //		while(p && p != stop){
        //			ctop += p.offsetTop;
        //			p = p.offsetParent;
        //		}
        //		ctop -= this.mainHd.dom.offsetHeight;
        //		var cbot = ctop + rowEl.offsetHeight;
        //		var ch = c.clientHeight;
        //		var stop = parseInt(c.scrollTop, 10);
        //		var sbot = stop + ch;
        //		if(ctop < stop){
        //		  c.scrollTop = ctop;
        //		}else if(cbot > sbot){
        //			c.scrollTop = cbot-ch;
        //		}
        //		if(hscroll !== false){
        //			var cleft = parseInt(cellEl.offsetLeft, 10);
        //			var cright = cleft + cellEl.offsetWidth;
        //			var sleft = parseInt(c.scrollLeft, 10);
        //			var sright = sleft + c.clientWidth;
        //			if(cleft < sleft){
        //				c.scrollLeft = cleft;
        //			}else if(cright > sright){
        //				c.scrollLeft = cright-c.clientWidth;
        //			}
        //		}
        //		return cellEl ? Ext.fly(cellEl).getXY() : [c.scrollLeft+this.el.getX(), Ext.fly(rowEl).getY()];
    }
});
Ext.reg('vgrid', Ext.grid.VerticalGridview);//注册到xtype中