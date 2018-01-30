/*
 * Ext GUI Designer
 * Copyright(c) 2006-2009 Ext JS, LLC
 * licensing@extjs.com
 * This product is NOT licensed for production use.
 */
xds.PropertyRecord = Ext.data.Record.create([{
    name: "name",
    type: "string"
},
"value", "group"]);
xds.PropGrid = Ext.extend(Ext.grid.EditorGridPanel, {
    enableColumnMove: false,
    stripeRows: false,
    trackMouseOver: false,
    clicksToEdit: 1,
    enableHdMenu: false,
    baseCls: "x-plain",
    hideHeaders: true,
    cls: "grouped-prop-grid",
    cacheSizes: false,
    initComponent: function () {
        this.lastEditRow = null;
        var b = new xds.PropGrid.Store(this);
        this.propStore = b;
        var a = new xds.PropGrid.ColumnModel(this, b);
        this.selModel = new Ext.grid.CellSelectionModel({
            onEditorKey: function (p, o) {
                var i = o.getKey(),
                j,
                l = this.grid,
                m = l.activeEditor;
                if (i == o.TAB) {
                    if (o.shiftKey) {
                        j = l.walkCells(m.row, m.col - 1, -1, this.acceptsNav, this)
                    } else {
                        j = l.walkCells(m.row, m.col + 1, 1, this.acceptsNav, this)
                    }
                    o.stopEvent()
                } else { if (i == o.ENTER) {
                        var d = m.record.id;
                        var c = o.ctrlKey;
                        var f = o.shiftKey;
                        m.completeEdit();
                        o.stopEvent();
                        if (c) {
                            var h = l.component.getNode();
                            if (h.nextSibling) {
                                h.nextSibling.select();
                                l.startEditById(d)
                            }
                        } else { if (f) {
                                var h = l.component.getNode();
                                if (h.previousSibling) {
                                    h.previousSibling.select();
                                    l.startEditById(d)
                                }
                            }
                        }
                    } else { if (i == o.ESC) {
                            o.stopEvent();
                            m.cancelEdit()
                        }
                    }
                }
                if (j) {
                    l.startEditing(j[0], j[1])
                }
            }
        });
        b.store.sort("name", "ASC");
        this.addEvents("beforepropertychange", "propertychange");
        this.cm = a;
        this.store = b.store;
        this.view = new Ext.grid.GroupingView({
            forceFit: true,
            showGroupName: false,
            scrollOffset: 18,
            getRowClass: function (c) {
                return c.data.value === undefined ? "" : "has-value"
            }
        });
        this.tbar = new Ext.Toolbar({
            cls: this.tbCls || "xds-toolbar",
            items: [{
                tooltip: "Show configs grouped by component",
                pressed: true,
                iconCls: "icon-grouped",
                enableToggle: true,
                toggleGroup: "prop-group",
                toggleHandler: function (c, d) {
                    if (d) {
                        this.setGrouped(true)
                    }
                },
                scope: this
            },
            " ", {
                tooltip: "Show configs alphabetical",
                pressed: false,
                iconCls: "icon-sorted",
                enableToggle: true,
                toggleGroup: "prop-group",
                toggleHandler: function (c, d) {
                    if (d) {
                        this.setGrouped(false)
                    }
                },
                scope: this
            },
            "-", {
                tooltip: 'Show "Common" config group',
                pressed: true,
                iconCls: "icon-common",
                enableToggle: true,
                toggleHandler: function (c, d) {
                    this.setShowCommon(d)
                },
                scope: this
            },
            "-", {
                tooltip: "Hide inherited configs",
                pressed: false,
                iconCls: "icon-hide-inherited",
                enableToggle: true,
                toggleHandler: function (c, d) {
                    this.setHideInherited(d)
                },
                scope: this
            }]
        });
        xds.PropGrid.superclass.initComponent.call(this);
        this.selModel.on("beforecellselect", function (e, d, c) {
            if (c === 0) {
                this.startEditing.defer(200, this, [d, 1]);
                return false
            }
        },
        this)
    },
    setGrouped: function (a) {
        if (!a) {
            this.view.enableGrouping = false;
            this.propStore.store.clearGrouping()
        } else {
            this.view.enableGrouping = true;
            this.propStore.store.groupBy("group")
        }
    },
    setHideInherited: function (b, a) {
        this.propStore.filterGroup = b ? this.component.xcls : undefined;
        if (a !== false) {
            this.propStore.refresh()
        }
    },
    setShowCommon: function (b, a) {
        this.propStore.showCommon = b;
        if (a !== false) {
            this.propStore.refresh()
        }
    },
    setComponent: function (a) {
        this.stopEditing();
        this.component = a;
        if (this.propStore.filterGroup) {
            this.propStore.filterGroup = a.xcls
        }
        this.propStore.setComponent(a)
    },
    getComponent: function () {
        return this.component
    },
    clear: function () {
        delete this.component;
        this.propStore.clear()
    },
    onRender: function () {
        xds.PropGrid.superclass.onRender.apply(this, arguments);
        this.getGridEl().addClass("x-props-grid");
        this.view.mainBody.on("mousedown", this.onChecked, this)
    },
    onChecked: function (d, b) {
        if (b = d.getTarget("span.bcheck", 2)) {
            d.stopPropagation();
            var a = b.firstChild.className;
            var c = this.propStore.store.getById(a);
            if (c) {
                c.set("value", !b.firstChild.checked)
            }
        }
    },
    startEditById: function (c) {
        var b = this.propStore.store.getById(c);
        if (b) {
            var a = this.propStore.store.indexOf(b);
            this.startEditing(a, 1)
        }
    }
});
xds.PropGrid.Store = function (a, b) {
    this.grid = a;
    this.store = new Ext.data.GroupingStore({
        recordType: xds.PropertyRecord,
        groupField: "group"
    });
    this.store.on("update", this.onUpdate, this);
    xds.PropGrid.Store.superclass.constructor.call(this)
};
Ext.extend(xds.PropGrid.Store, Ext.util.Observable, {
    showCommon: true,
    getConfigByType: function (b, a) {
        if (b == "Common") {
            return this.grid.component.getConfigObject(a)
        }
        var c = this.grid.component["get" + b + "Configs"]();
        return c.map[a]
    },
    getConfig: function (a) {
        if (a.configType) {
            return this.getConfigByType(a.configType, a.data.name)
        }
        return this.grid.component.getConfigObject(a.data.name)
    },
    getConfigAt: function (a) {
        return this.getConfig(this.store.getAt(a))
    },
    setComponent: function (p) {
        this.component = p;
        this.store.removeAll();
        var f = [];
        var m = p.configs.items;
        var d = p.getConfig();
        for (var h = 0, n = m.length, e, j; h < n; h++) {
            e = m[h].name;
            j = m[h].group;
            if (!this.filterGroup || this.filterGroup == j) {
                f.push(new xds.PropertyRecord({
                    name: e,
                    value: d[e],
                    group: j
                },
                e))
            }
        }
        var b = p.getLayoutConfigs();
        if (b) {
            b = b.items;
            for (var h = 0, n = b.length, e; h < n; h++) {
                e = b[h].name;
                f.push(new xds.PropertyRecord({
                    name: e,
                    value: d[e],
                    group: b[h].group
                },
                e))
            }
        }
        var m = p.getContainerConfigs();
        if (m) {
            m = m.items;
            for (var h = 0, n = m.length, e; h < n; h++) {
                e = m[h].name;
                var a = new xds.PropertyRecord({
                    name: e,
                    value: m[h].getValue(p),
                    group: m[h].group
                },
                "Container-" + e);
                a.configType = "Container";
                f.push(a)
            }
        }
        if (this.showCommon) {
            var m = p.getCommonConfigs();
            if (m) {
                m = m.items;
                for (var h = 0, n = m.length, e; h < n; h++) {
                    e = m[h].name;
                    var a = new xds.PropertyRecord({
                        name: e,
                        value: m[h].getValue(p),
                        group: "(Common)"
                    },
                    "Common-" + e);
                    a.configType = "Common";
                    f.push(a)
                }
            }
        }
        var l = p.getEditorConfigs();
        if (l) {
            l = l.items;
            for (var h = 0, n = l.length, e; h < n; h++) {
                e = l[h].name;
                f.push(new xds.PropertyRecord({
                    name: e,
                    value: l[h].getValue(p),
                    group: l[h].group
                },
                e))
            }
        }
        this.store.loadRecords({
            records: f
        },
        {},
        true)
    },
    onUpdate: function (f, a, e) {
        if (e == Ext.data.Record.EDIT) {
            var b = a.data.value;
            var c = a.modified.value;
            if (this.grid.fireEvent("beforepropertychange", this.component, a.data.name, b, c) !== false) {
                this.getConfig(a).setValue(this.component, b);
                if (a.configType == "Common") {
                    this.store.getById(a.data.name).set("value", b)
                } else {
                    var d = this.store.getById("Common-" + a.data.name);
                    if (d) {
                        d.set("value", b)
                    }
                }
                a.commit();
                this.grid.fireEvent("propertychange", this.component, a.data.name, b, c)
            } else {
                a.reject()
            }
        }
    },
    clear: function () {
        this.component = null;
        this.store.removeAll()
    },
    refresh: function () {
        this.setComponent(this.component)
    }
});
xds.PropGrid.ColumnModel = Ext.extend(Ext.grid.ColumnModel, {
    nameText: "Name",
    valueText: "Value",
    dateFormat: "m/j/Y",
    constructor: function (b, a) {
        this.grid = b;
        xds.PropGrid.ColumnModel.superclass.constructor.call(this, [{
            header: this.nameText,
            width: 50,
            sortable: true,
            dataIndex: "name",
            id: "name",
            menuDisabled: true
        },
        {
            header: this.valueText,
            width: 50,
            resizable: false,
            dataIndex: "value",
            id: "value",
            menuDisabled: true
        },
        {
            header: "",
            hidden: true,
            width: 10,
            resizable: false,
            locked: true,
            dataIndex: "group",
            menuDisabled: true
        }]);
        this.store = a;
        this.renderCellDelegate = this.renderCell.createDelegate(this);
        this.renderPropDelegate = this.renderProp.createDelegate(this)
    },
    isCellEditable: function (a, b) {
        return a == 1
    },
    getRenderer: function (a) {
        return a == 1 ? this.renderCellDelegate : this.renderPropDelegate
    },
    renderProp: function (a) {
        return a
    },
    renderCell: function (e, d, b, g) {
        var f = this.store.getConfigAt(g);
        var a = f.render(e, d, b, g);
        return f.htmlEncode ? Ext.util.Format.htmlEncode(a) : a
    },
    getCellEditor: function (a, b) {
        return this.store.getConfigAt(b).getEditor()
    }
});
Ext.ux.SelectBox = function (a) {
    this.searchResetDelay = 1000;
    a = a || {};
    a = Ext.apply(a || {},
    {
        editable: false,
        forceSelection: true,
        rowHeight: false,
        lastSearchTerm: false,
        triggerAction: "all",
        mode: "local"
    });
    Ext.ux.SelectBox.superclass.constructor.apply(this, arguments);
    this.lastSelectedIndex = this.selectedIndex || 0
};
Ext.extend(Ext.ux.SelectBox, Ext.form.ComboBox, {
    lazyInit: false,
    initEvents: function () {
        Ext.ux.SelectBox.superclass.initEvents.apply(this, arguments);
        this.el.on("keydown", this.keySearch, this, true);
        this.cshTask = new Ext.util.DelayedTask(this.clearSearchHistory, this)
    },
    keySearch: function (f, d, b) {
        var a = f.getKey();
        var c = String.fromCharCode(a);
        var g = 0;
        if (!this.store.getCount()) {
            return
        }
        switch (a) {
        case Ext.EventObject.HOME:
            f.stopEvent();
            this.selectFirst();
            return;
        case Ext.EventObject.END:
            f.stopEvent();
            this.selectLast();
            return;
        case Ext.EventObject.PAGEDOWN:
            this.selectNextPage();
            f.stopEvent();
            return;
        case Ext.EventObject.PAGEUP:
            this.selectPrevPage();
            f.stopEvent();
            return
        }
        if ((f.hasModifier() && !f.shiftKey) || f.isNavKeyPress() || f.isSpecialKey()) {
            return
        }
        if (this.lastSearchTerm == c) {
            g = this.lastSelectedIndex
        }
        this.search(this.displayField, c, g);
        this.cshTask.delay(this.searchResetDelay)
    },
    onRender: function (b, a) {
        this.store.on("load", this.calcRowsPerPage, this);
        Ext.ux.SelectBox.superclass.onRender.apply(this, arguments);
        if (this.mode == "local") {
            this.calcRowsPerPage()
        }
    },
    onSelect: function (a, c, b) {
        if (this.fireEvent("beforeselect", this, a, c) !== false) {
            this.setValue(a.data[this.valueField || this.displayField]);
            if (!b) {
                this.collapse()
            }
            this.lastSelectedIndex = c + 1;
            this.fireEvent("select", this, a, c)
        }
    },
    render: function (a) {
        Ext.ux.SelectBox.superclass.render.apply(this, arguments);
        if (Ext.isSafari) {
            this.el.swallowEvent("mousedown", true)
        }
        this.el.unselectable();
        this.innerList.unselectable();
        this.trigger.unselectable();
        this.innerList.on("mouseup", function (d, c, b) {
            if (c.id && c.id == this.innerList.id) {
                return
            }
            this.onViewClick()
        },
        this);
        this.innerList.on("mouseover", function (d, c, b) {
            if (c.id && c.id == this.innerList.id) {
                return
            }
            this.lastSelectedIndex = this.view.getSelectedIndexes()[0] + 1;
            this.cshTask.delay(this.searchResetDelay)
        },
        this);
        this.trigger.un("click", this.onTriggerClick, this);
        this.trigger.on("mousedown", function (d, c, b) {
            d.preventDefault();
            this.onTriggerClick()
        },
        this);
        this.on("collapse", function (d, c, b) {
            Ext.getDoc().un("mouseup", this.collapseIf, this)
        },
        this, true);
        this.on("expand", function (d, c, b) {
            Ext.getDoc().on("mouseup", this.collapseIf, this)
        },
        this, true)
    },
    clearSearchHistory: function () {
        this.lastSelectedIndex = 0;
        this.lastSearchTerm = false
    },
    selectFirst: function () {
        this.focusAndSelect(this.store.data.first())
    },
    selectLast: function () {
        this.focusAndSelect(this.store.data.last())
    },
    selectPrevPage: function () {
        if (!this.rowHeight) {
            return
        }
        var a = Math.max(this.selectedIndex - this.rowsPerPage, 0);
        this.focusAndSelect(this.store.getAt(a))
    },
    selectNextPage: function () {
        if (!this.rowHeight) {
            return
        }
        var a = Math.min(this.selectedIndex + this.rowsPerPage, this.store.getCount() - 1);
        this.focusAndSelect(this.store.getAt(a))
    },
    search: function (c, b, d) {
        c = c || this.displayField;
        this.lastSearchTerm = b;
        var a = this.store.find.apply(this.store, arguments);
        if (a !== -1) {
            this.focusAndSelect(a)
        }
    },
    focusAndSelect: function (a) {
        var b = typeof a === "number" ? a : this.store.indexOf(a);
        this.select(b, this.isExpanded());
        this.onSelect(this.store.getAt(a), b, this.isExpanded())
    },
    calcRowsPerPage: function () {
        if (this.store.getCount()) {
            this.rowHeight = Ext.fly(this.view.getNode(0)).getHeight();
            this.rowsPerPage = this.maxHeight / this.rowHeight
        } else {
            this.rowHeight = false
        }
    }
});
xds.FlyoutSelect = Ext.extend(Ext.ux.SelectBox, {
    listClass: "x-combo-list-small",
    width: 120,
    displayField: "text",
    initComponent: function () {
        this.store = new Ext.data.SimpleStore({
            fields: ["text"],
            expandData: true,
            data: this.data
        });
        delete this.data;
        xds.FlyoutSelect.superclass.initComponent.call(this)
    },
    initList: function () {
        Ext.form.ComboBox.prototype.initList.call(this);
        this.list.setZIndex(80005)
    }
});
Ext.reg("flyoutselect", xds.FlyoutSelect);
Ext.ux.TileView = Ext.extend(Ext.DataView, {
    categoryName: "category",
    imagePath: "imagePath",
    imageName: "imageName",
    itemName: "text",
    itemDescription: "description",
    itemIconCls: "iconCls",
    itemSelector: "dd",
    initComponent: function () {
        this.tpl = new Ext.XTemplate(this.getMarkup(), {
            getCategory: this.getCategory,
            openCategory: this.openCategory,
            view: this
        });
        Ext.ux.TileView.superclass.initComponent.call(this)
    },
    getMarkup: function () {
        return ['<div class="x-tile-ct">', '<tpl for=".">', '<tpl if="this.openCategory(values, xindex, xcount)">', '<tpl if="xindex != 1">', '<div style="clear:left"></div></dl>', "</tpl>", '<h2><div unselectable="on" class="x-unselectable">{[this.getCategory(values)]}</div></h2>', "<dl>", "</tpl>", '<dd><img title="{text:htmlEncode}" src="', Ext.BLANK_IMAGE_URL, '" class="{', this.itemIconCls, '}"/>', "<div><h4>{", this.itemName, "}</h4><p>{", this.itemDescription, "}</p></div>", "</dd>", '<tpl if="xindex == xcount">', '<div style="clear:left"></div></dl>', "</tpl>", "</tpl>", "</div>"].join("")
    },
    openCategory: function (b, c, d) {
        var a = this.getCategory(b);
        if (this.lastCat != a) {
            this.lastCat = a;
            return true
        }
        return false
    },
    getCategory: function (a) {
        return a[this.view.categoryName]
    },
    onClick: function (b) {
        var a = b.getTarget("h2", 3, true);
        if (a) {
            a.toggleClass("collapsed");
            a.next("dl").toggleClass("collapsed")
        } else {
            return Ext.ux.TileView.superclass.onClick.apply(this, arguments)
        }
    }
});
xds.MoreField = Ext.extend(Ext.BoxComponent, {
    defaultAutoCreate: {
        tag: "div",
        cls: "x-more-field",
        cn: [{
            tag: "span"
        },
        {
            tag: "a",
            href: "#"
        }]
    },
    fieldClass: "x-form-text",
    isFormField: true,
    value: undefined,
    getName: function () {
        return this.name || this.id
    },
    onRender: function (c, a) {
        xds.MoreField.superclass.onRender.call(this, c, a);
        if (!this.el) {
            var b = this.getAutoCreate();
            this.el = c.createChild(b, a)
        }
        this.el.addClass([this.fieldClass, this.cls]);
        this.valueEl = this.el.child("span");
        this.btnEl = this.el.child("a");
        this.btnEl.swallowEvent("click", true);
        this.btnEl.on("click", this.onMoreClick, this);
        this.initValue()
    },
    onMoreClick: Ext.emptyFn,
    afterRender: function (b, a) {
        xds.MoreField.superclass.afterRender.call(this);
        this.originalValue = this.getRawValue()
    },
    initValue: function () {
        if (this.value !== undefined) {
            this.setValue(this.value)
        }
    },
    isDirty: function () {
        return false
    },
    isValid: function () {
        return true
    },
    validate: function () {
        return true
    },
    processValue: function (a) {
        return a
    },
    validateValue: function (a) {
        return true
    },
    reset: Ext.emptyFn,
    markInvalid: Ext.emptyFn,
    clearInvalid: Ext.emptyFn,
    getRawValue: function () {
        return this.value
    },
    getValue: function () {
        return this.value
    },
    setRawValue: function (a) {
        this.value = a;
        if (this.valueEl) {
            this.valueEl.dom.innerHTML = a
        }
    },
    setValue: function (a) {
        this.setRawValue(a)
    }
});
Ext.reg("morefield", xds.MoreField);
xds.Project = Ext.extend(Ext.util.Observable, {
    constructor: function (a) {
        Ext.apply(this, a)
    },
    save: function (a, b) {
        if (!this.file) {
            this.saveAs(a, b);
            return
        }
        xds.File.saveProject(this.getData(), a, b)
    },
    saveAs: function (a, b) {
        xds.File.saveProjectAs(this.getData(), a, b)
    },
    open: function () {
        xds.File.setTitle(this.file || "New Project");
        xds.inspector.root.beginUpdate();
        var d = xds.inspector.root;
        while (d.firstChild) {
            d.removeChild(d.firstChild)
        }
        var b = this.components || [];
        for (var a = 0, e; e = b[a]; a++) {
            xds.inspector.restore(e, d)
        }
        xds.inspector.root.endUpdate();
        if (d.firstChild) {
            d.firstChild.select()
        }
    },
    getData: function () {
        var b = {
            name: this.name,
            file: this.file,
            components: []
        };
        var a = xds.inspector.root;
        var c = a.firstChild;
        while (c) {
            b.components.push(c.component.getInternals(true));
            c = c.nextSibling
        }
        return b
    },
    setData: function (a) {
        Ext.apply(this, a)
    },
    doClose: function () {
        var a = xds.inspector.root;
        while (a.firstChild) {
            var b = a.removeChild(a.firstChild);
            b.destroy()
        }
        xds.canvas.clear()
    },
    close: function (a, b) {
        Ext.Msg.show({
            title: "Confirm",
            msg: "Are you sure you would like to reset your project?",
            buttons: Ext.Msg.YESNO,
            fn: function (c) {
                if (c == "yes") {
                    this.doClose()
                } else { if (c == "no") {}
                }
            },
            scope: this
        })
    }
});
xds.Config = function (a) {
    Ext.apply(this, a);
    if (!xds.Config.editors.string) {
        Ext.apply(xds.Config.editors, {
            options: new Ext.grid.GridEditor(new Ext.ux.SelectBox({
                listClass: "x-combo-list-small",
                store: new Ext.data.SimpleStore({
                    fields: ["text"],
                    expandData: true
                }),
                displayField: "text"
            })),
            date: new Ext.grid.GridEditor(new Ext.form.DateField({
                selectOnFocus: true
            })),
            string: new Ext.grid.GridEditor(new Ext.form.TextField({
                selectOnFocus: true
            })),
            code: new Ext.grid.GridEditor(new Ext.form.TextArea({
                width: 250,
                height: 100
            }), {
                constrain: true
            }),
            object: new Ext.grid.GridEditor(new Ext.form.TextArea({
                width: 250,
                height: 100
            }), {
                constrain: true
            }),
            number: new Ext.grid.GridEditor(new Ext.form.NumberField({
                selectOnFocus: true,
                style: "text-align:left;"
            }))
        })
    }
};
xds.Config.prototype = {
    name: "",
    defautValue: "",
    type: "String",
    htmlEncode: true,
    editor: "string",
    setFn: "setConfig",
    getFn: "getConfigValue",
    getValue: function (a) {
        return a[this.getFn](this.name)
    },
    setValue: function (e, b) {
        var a = e[this.getFn](this.name);
        e[this.setFn](this.name, b);
        if (String(a) !== String(b)) {
            if (typeof this.updateFn == "string") {
                var d = e.getExtComponent();
                d[this.updateFn](b)
            } else { if (typeof this.updateFn == "function") {
                    this.updateFn(e.getExtComponent(), b, e)
                } else {
                    xds.fireEvent("componentchanged")
                }
            }
        }
    },
    getEditor: function () {
        if (this.editor == "options") {
            var a = xds.Config.editors.options;
            a.field.store.loadData(this.options);
            return a
        }
        return xds.Config.editors[this.editor]
    },
    render: function (a, c, b) {
        return a
    }
};
xds.Config.String = Ext.extend(xds.Config, {
    type: "String",
    defaultValue: "",
    htmlEncode: true,
    editor: "string"
});
xds.Config.Number = Ext.extend(xds.Config, {
    type: "Number",
    defaultValue: 0,
    htmlEncode: false,
    editor: "number"
});
xds.Config.Boolean = Ext.extend(xds.Config, {
    type: "Boolean",
    defaultValue: false,
    editor: "boolean",
    htmlEncode: false,
    render: function (a, c, b) {
        a = a === undefined ? this.defaultValue : a;
        return '<span class="bcheck"><input type="checkbox" class="' + b.id + '"' + (a ? " checked" : "") + "></span>"
    }
});
xds.Config.Object = Ext.extend(xds.Config.String, {
    type: "Object",
    defaultValue: null,
    editor: "object",
    render: function () {
        return "[object]..."
    },
    setValue: function (c, value) {
        if (typeof value != "object") {
            value = Ext.util.Format.trim(value);
            var o;
            eval("o = " + (value.length > 0 ? value : "null") + ";");
            c.setConfig(this, o)
        } else {
            c.setConfig(this, value)
        }
        xds.fireEvent("componentchanged")
    }
});
xds.Config.Array = Ext.extend(xds.Config.Object, {});
xds.Config.types = {
    string: xds.Config.String,
    number: xds.Config.Number,
    "boolean": xds.Config.Boolean,
    object: xds.Config.Object
};
xds.Config.editors = {};
xds.editorConfigs = new Ext.util.MixedCollection(false, function (a) {
    return a.name
});
xds.editorConfigs.addAll([new xds.Config.String({
    name: "name",
    ctype: "string",
    group: "(Designer)",
    getValue: function (a) {
        return a.id
    },
    setValue: function (e, b) {
        var a = e.id;
        var d = xds.inspector.getNodeById(e.id);
        if (xds.canvas.selectedId == a) {
            xds.canvas.selectedId = b
        }
        d.setNodeId(b);
        d.setText(b)
    }
}), new xds.Config.String({
    name: "userXType",
    ctype: "string",
    group: "(Designer)",
    getValue: function (a) {
        return a.userXType
    },
    setValue: function (b, a) {
        b.userXType = a
    }
})]);
xds.dockConfigs = new Ext.util.MixedCollection(false, function (a) {
    return a.name
});
xds.dockConfigs.addAll([new xds.Config.String({
    name: "dock",
    ctype: "string",
    group: "(Designer)",
    editor: "options",
    options: ["(none)", "bbar", "tbar", "fbar"],
    getValue: function (a) {
        return a.dock
    },
    setValue: function (b, a) {
        if (a == "(none)") {
            a = undefined
        }
        b.dock = a;
        b.setSuffix(a);
        xds.fireEvent("componentchanged")
    }
})]);
xds.commonConfigs = ["id", "itemId", "title", "text", "layout", "width", "height", "autoScroll", "url", "name", "fieldLabel", "iconCls"];
xds.MainMenu = Ext.extend(Ext.Toolbar, {
    id: "app-menu",
    defaults: {
        minWidth: 42
    },
    initComponent: function () {
        this.items = [{
            text: "File",
            menu: [xds.actions.newAction, "-", xds.actions.openAction, "-", xds.actions.saveAction, xds.actions.saveAsAction]
        },
        {
            text: "Project",
            menu: [xds.actions.newCmpAction, xds.actions.deleteCmpAction]
        },
        {
            text: "Help",
            menu: [xds.actions.help, "-", xds.actions.aboutXds]
        }];
        xds.MainMenu.superclass.initComponent.call(this)
    }
});
xds.actions = {
    saveAction: new Ext.Action({
        iconCls: "icon-project-save",
        itemText: "Save Project",
        tooltip: "Save Project",
        handler: function () {
            xds.project.save()
        }
    }),
    saveAsAction: new Ext.Action({
        itemText: "Save Project As...",
        handler: function () {
            xds.project.saveAs()
        }
    }),
    newAction: new Ext.Action({
        iconCls: "icon-project-new",
        itemText: "New Project",
        tooltip: "New Project",
        handler: function () {
            xds.project.close(function () {
                var a = new xds.Project();
                a.open()
            })
        }
    }),
    openAction: new Ext.Action({
        iconCls: "icon-project-open",
        itemText: "Open Project...",
        tooltip: "Open Project",
        handler: function () {
            xds.project.close(function () {
                xds.File.openProject(function (b) {
                    var a = new xds.Project(b);
                    a.open()
                })
            })
        }
    }),
    newCmpAction: new Ext.Action({
        iconCls: "icon-cmp-new",
        tooltip: "New Component",
        itemText: "New Component...",
        handler: function () {
            var a = new xds.CWindow({
                title: "New Component"
            });
            a.show()
        }
    }),
    deleteCmpAction: new Ext.Action({
        iconCls: "icon-cmp-delete",
        tooltip: "Delete Component",
        disabled: true,
        itemText: "Delete Component",
        handler: function () {
            xds.inspector.removeComponent(xds.active.component)
        }
    }),
    help: new Ext.Action({
        tooltip: "Help",
        itemText: "Help",
        handler: function () {
            Ext.Msg.alert("Help", "Coming soon!")
        }
    }),
    aboutXds: new Ext.Action({
        tooltip: "About Ext Designer",
        itemText: "About",
        handler: function () {
            Ext.Msg.alert("About", "Ext Designer is a tool to assist in the rapid development of Ext Applications.")
        }
    })
};
xds.Component = Ext.extend(Ext.util.Observable, {
    isContainer: false,
    isVisual: true,
    nameSuffix: "",
    filmCls: "",
    flyoutCls: "",
    minWidth: 10,
    minHeight: 10,
    snapToGrid: 10,
    showGrid: true,
    constructor: function (a) {
        Ext.apply(this, a);
        this.name = this.name || this.defaultName;
        this.id = this.id || this.nextId();
        this.userConfig = this.userConfig || {};
        if (this.enableFlyout) {
            this.flyoutCls = "xds-flyout"
        }
    },
    setOwner: function (a) {
        if (this.owner && !a) {
            this.setName(this.id)
        }
        this.owner = a;
        delete this.config
    },
    setConfig: function (a, b) {
        this.userConfig[a] = b;
        if (this.config) {
            this.config[a] = b
        }
        if (a == "id" || a == "itemId" || (a == "name" && !this.getConfigValue("id") && !this.getConfigValue("itemId"))) {
            this.setName(b)
        }
        if (a == "layout") {
            delete this.layoutConfig;
            xds.props.refresh.defer(100, xds.props);
            if (xds.Layouts[b] && xds.Layouts[b].onInit) {
                xds.Layouts[b].onInit(this.getNode())
            }
        }
    },
    getSnapToGrid: function (a) {
        return !this.snapToGrid ? "(none)" : this.snapToGrid
    },
    setSnapToGrid: function (b, a) {
        this.snapToGrid = a == "(none)" ? 0 : parseInt(a, 10)
    },
    setName: function (a) {
        this.name = a;
        this.getNode().setText(a + this.nameSuffix)
    },
    getConfig: function () {
        if (!this.config) {
            this.config = Ext.apply({
                xtype: this.xtype
            },
            this.defaultConfig);
            this.initConfig(this.config, this.owner);
            Ext.apply(this.config, this.userConfig)
        }
        return this.config
    },
    getConfigValue: function (a) {
        return this.getConfig()[a]
    },
    isSet: function (a) {
        return this.userConfig[a] !== undefined
    },
    initConfig: function (b, a) {},
    nextId: function () {
        return Ext.getCmp("structure").nextId(this.naming)
    },
    getNode: function () {
        if (!this.node) {
            var b = this.attrs = {
                id: this.id,
                text: !this.owner ? this.id : (this.name || this.defaultName),
                iconCls: this.iconCls,
                leaf: true
            };
            if (this.isContainer) {
                b.leaf = false;
                b.children = [];
                b.expanded = true
            }
            this.node = new Ext.tree.TreeNode(b);
            this.node.component = this
        }
        return this.node
    },
    getFilm: function () {
        return Ext.get("film-for-" + this.id)
    },
    isValidChild: function (a, b) {
        if (this.isContainer) {
            if (this.validChildTypes) {
                return this.validChildTypes.contains(a)
            }
            return xds.Registry.get(a).prototype.isVisual !== false
        }
        return false
    },
    isValidParent: function (a) {
        return this.isVisual ? true : !!a
    },
    getConfigs: function () {
        return this.configs
    },
    getConfigObject: function (b) {
        if (this.configs.map[b]) {
            return this.configs.map[b]
        } else {
            var d = this.getLayoutConfigs();
            if (d && d.map[b]) {
                return d.map[b]
            } else {
                var a = this.getEditorConfigs();
                if (a && a.map[b]) {
                    return a.map[b]
                } else {
                    var c = this.getContainerConfigs();
                    if (c) {
                        return c.map[b]
                    }
                }
            }
        }
    },
    getContainerConfigs: function () {
        var a = this.getConfigValue("layout");
        if (a && a != "auto") {
            return xds.Layouts[a].layoutConfigs
        }
        return null
    },
    setContainerConfig: function (a, b) {
        this.layoutConfig = this.layoutConfig || {};
        this.layoutConfig[a] = b
    },
    getContainerConfigValue: function (a) {
        return this.layoutConfig ? this.layoutConfig[a] : undefined
    },
    getLayoutConfigs: function () {
        if (this.owner) {
            var a = this.owner.getConfigValue("layout");
            if (a && a != "auto") {
                return xds.Layouts[a].configs
            }
        }
        return null
    },
    getCommonConfigs: function () {
        if (!this.configs.common) {
            this.configs.common = this.configs.filterBy(function (a) {
                return xds.commonConfigs.indexOf(a.name) !== -1
            })
        }
        return this.configs.common
    },
    getEditorConfigs: function () {
        if (this.owner) {
            return false
        }
        return xds.editorConfigs
    },
    createCanvasConfig: function (f) {
        var e = Ext.apply({},
        this.getConfig());
        e.xtype = this.dtype;
        e.stateful = false;
        e.viewerNode = f;
        if (this.layoutConfig) {
            e.layoutConfig = Ext.apply({},
            this.layoutConfig)
        }
        if (this.snapToGrid && this.showGrid && e.layout == "absolute") {
            var b = "xds-grid-" + this.snapToGrid;
            e.bodyCssClass = e.bodyCssClass ? e.bodyCssClass + b : b
        }
        this.activeCmpId = e.id = Ext.id();
        if (f.hasChildNodes()) {
            e.items = [];
            for (var d = 0, a = f.childNodes.length; d < a; d++) {
                if (!this.assignDocked(e, f.childNodes[d])) {
                    e.items.push(f.childNodes[d].component.createCanvasConfig(f.childNodes[d]))
                }
            }
            if (e.items.length < 1) {
                delete e.items
            }
        }
        return e
    },
    getActions: function () {
        return null
    },
    setSuffix: function (b, a) {
        a = a || "loaded";
        if (!b) {
            delete this.nameSuffix
        } else {
            this.nameSuffix = ' <i class="xds-suffix-' + a + '">&nbsp;' + b + "&nbsp;</i>"
        }
        this.setName(this.name)
    },
    assignDocked: function (a, b) {
        b = b.component ? b.component : b;
        if (b.dock) {
            a[b.dock] = b.createCanvasConfig(b.getNode());
            return true
        }
        return false
    },
    syncFilm: function () {
        if (this.isVisual !== false) {
            var a = Ext.getCmp(this.activeCmpId);
            if (a) {
                a.syncFilm()
            }
        }
    },
    getExtComponent: function () {
        return Ext.getCmp(this.activeCmpId)
    },
    isResizable: function () {
        return false
    },
    onFilmClick: Ext.emptyFn,
    getLabel: function (f) {
        var a;
        var d = this.getExtComponent();
        if (d) {
            var c = d.el.up(".x-form-item", 3);
            if (c) {
                a = c.down(".x-form-item-label")
            }
            var b = d.el.next(".x-form-cb-label");
            if (a && a.getRegion().contains(f.getPoint())) {
                return {
                    el: a,
                    name: "fieldLabel"
                }
            } else { if (b && b.getRegion().contains(f.getPoint())) {
                    return {
                        el: b,
                        name: "boxLabel"
                    }
                }
            }
        }
        return null
    },
    onFilmDblClick: function (b) {
        var a = this.getLabel(b);
        if (a) {
            xds.canvas.startEdit(this, a.el, this.getConfigObject(a.name))
        }
    },
    onSelectChange: function (a) {
        this.selected = a
    },
    onFilmMouseDown: function (a) {
        if (this.enableFlyout && a.getTarget("b", 1)) {
            this.delegateFlyout(a)
        }
    },
    delegateFlyout: function (a) {
        if (this.enableFlyout) {
            if (!this.flyout) {
                this.getNode().select();
                this.flyout = this.onFlyout(a);
                if (this.flyout && !this.flyout.isVisible()) {
                    this.flyout.showBy(this.getFlyoutButton(), "tl-tr?")
                }
            } else {
                this.flyout.destroy()
            }
        }
    },
    getFlyoutButton: function () {
        var a = this.getFilm();
        return a ? a.child("b") : null
    },
    hasConfig: function (a, b) {
        return this.getConfigValue(a) === b
    },
    getInternals: function (a) {
        var d = {
            cid: this.cid,
            name: !this.owner ? this.id : (this.name || this.defaultName),
            dock: this.dock,
            layoutConfig: xds.copy(this.layoutConfig),
            userConfig: xds.copy(this.userConfig)
        };
        if (this.userXType) {
            d.userXType = this.userXType
        }
        if (a) {
            var f = this.getNode();
            if (f.hasChildNodes()) {
                d.cn = [];
                for (var b = 0, e; e = f.childNodes[b]; b++) {
                    d.cn.push(e.component.getInternals(true))
                }
            }
        }
        return d
    },
    getDefaultInternals: function () {
        return {
            cid: this.cid
        }
    },
    getSpec: function () {
        return this.spec || this.getDefaultInternals()
    },
    beforeRemove: function () {
        if (this.flyout) {
            this.flyout.destroy()
        }
    },
    isAnchored: function () {
        var a = this.owner ? this.owner.getConfigValue("layout") : "";
        return a && this.getConfigValue("anchor") && (a == "form" || a == "anchor" || a == "absolute")
    },
    isFit: function () {
        var a = this.owner ? this.owner.getConfigValue("layout") : "";
        return a == "fit" || a == "card"
    },
    setComponentX: function (b, a) {
        b.setPosition(a)
    },
    setComponentY: function (a, b) {
        a.setPosition(undefined, b)
    }
});
xds.Component.getFilmEl = function () {
    var a = this.getPositionEl();
    if (this.fieldLabel) {
        return this.el.up(".x-form-item") || a
    }
    return a
};
xds.Component.isValidDrop = function (a, b) {
    return a != b && (!a || a.isValidChild(b.cid)) && b.isValidParent(a)
};
xds.Registry = function () {
    var a = new Ext.util.MixedCollection(true, function (d) {
        return d.prototype.cid
    });
    var b = Ext.extend(Ext.data.JsonStore, {
        constructor: function () {
            b.superclass.constructor.call(this, {
                id: "cid",
                fields: [{
                    name: "id",
                    mapping: "cid"
                },
                "xtype", "xcls", "typeDef", "text", "iconCls", "naming", "category", "isVisual"]
            })
        }
    });
    var c = null;
    return {
        register: function (f) {
            a.add(f);
            f.prototype.__xdclass = f;
            var g = f.prototype.configs || [];
            f.prototype.configs = f.configs = new Ext.util.MixedCollection(false, function (h) {
                return h.name
            });
            for (var e = 0, d = g.length; e < d; e++) {
                f.configs.add(new xds.Config.types[g[e].ctype](g[e]))
            }
        },
        unregister: function (d) {
            a.remove(d)
        },
        get: function (d) {
            return a.get(d)
        },
        all: a,
        createStore: function (g) {
            if (!c) {
                c = [];
                for (var e = 0, d = a.items.length; e < d; e++) {
                    c.push(a.items[e].prototype)
                }
            }
            var f = new b();
            f.loadData(c);
            if (g) {
                f.filter("isVisual", true)
            }
            return f
        },
        addUserType: function (d) {
            this.userTypes = this.userTypes || [];
            this.userTypes.push(d)
        }
    }
} ();
xds.Canvas = Ext.extend(Ext.Panel, {
    constructor: function () {
        xds.canvas = this;
        xds.on("componentselect", this.onComponentSelect, this, {
            delay: 10
        });
        xds.Canvas.superclass.constructor.call(this, {
            id: "canvas",
            region: "center",
            baseCls: "x-plain",
            layout: "auto",
            bodyStyle: "padding:5px;position:relative;left:0;top:0;",
            items: new Ext.Panel({
                baseCls: "x-plain"
            }),
            autoScroll: true,
            bregion: new Ext.lib.Region(0, 0, 0, 0),
            rregion: new Ext.lib.Region(0, 0, 0, 0),
            cregion: new Ext.lib.Region(0, 0, 0, 0)
        })
    },
    afterRender: function () {
        xds.Canvas.superclass.afterRender.call(this);
        this.body.on("mousedown", this.onBodyMouseDown, this);
        this.body.on("click", this.onBodyClick, this);
        this.body.on("contextmenu", this.onBodyContextMenu, this);
        this.body.on("mouseover", this.onBodyOver, this, {
            buffer: 50
        });
        this.body.on("mousemove", this.onBodyMove, this);
        this.body.on("dblclick", this.onBodyDblClick, this);
        Ext.getBody().on("mouseover", this.onDocOver, this);
        this.dropZone = new xds.Canvas.DropZone(this);
        this.dragTracker = new xds.Canvas.DragTracker({
            el: this.body
        })
    },
    isFlyoutBtnClick: function (b) {
        if (this.selectedId) {
            var c = xds.inspector.getNodeById(this.selectedId);
            if (c) {
                var a = c.component.getFlyoutButton();
                if (a && a.getRegion().contains(b.getPoint())) {
                    return c.component
                }
            }
        }
        return false
    },
    onBodyMouseDown: function (b, a, d) {
        if (d = this.isFlyoutBtnClick(b)) {
            d.delegateFlyout(b);
            return
        }
        var d = this.findTarget(b);
        if (d) {
            d.component.onFilmMouseDown(b)
        }
    },
    onBodyDblClick: function (b, a) {
        var d = this.findTarget(b);
        if (d) {
            d.component.onFilmDblClick(b)
        }
    },
    onBodyClick: function (d, b) {
        if (this.isFlyoutBtnClick(d)) {
            return
        }
        if (d.target == this.body.dom) {
            xds.inspector.getSelectionModel().clearSelections();
            return
        }
        var f = this.findTarget(d);
        if (f) {
            var a = f.component.selected;
            if (f.component.onFilmClick(d, a) !== false) {
                xds.fireEvent("componentclick", {
                    component: f.component,
                    node: f,
                    event: d
                })
            }
        }
    },
    onBodyOver: function (b, a) {
        if (a = b.getTarget(".el-film", 2)) {
            if (a != this.overFilm) {
                this.overFilm = Ext.get(a);
                this.overFilm.addClass("el-film-over")
            }
        }
    },
    onBodyMove: function (g, k) {
        if ((k = g.getTarget(".el-film", 2))) {
            if (g.getTarget("b", 1)) {
                var j = Ext.get(k);
                j.setStyle("cursor", "default");
                this.dragTracker.setDragMode("Absolute");
                return
            }
            var h = this.getTargetComponent(k);
            if (h) {
                var j = Ext.get(k);
                var f = j.lastRegion;
                var d = 7;
                var n = g.getPoint();
                var m = h.component.isResizable("Corner", g);
                var i = this.bregion;
                i.top = f.bottom - d;
                i.left = f.left;
                i.right = f.right - (m ? d : 0);
                i.bottom = f.bottom;
                if (i.contains(n) && h.component.isResizable("Bottom", g)) {
                    this.dragTracker.setDragMode("Bottom");
                    j.setStyle("cursor", Ext.isAir ? "move" : "s-resize");
                    return
                }
                var a = this.rregion;
                a.top = f.top;
                a.left = f.right - d;
                a.right = f.right;
                a.bottom = f.bottom - (m ? d : 0);
                if (a.contains(n) && h.component.isResizable("Right", g)) {
                    this.dragTracker.setDragMode("Right");
                    j.setStyle("cursor", Ext.isAir ? "move" : "e-resize");
                    return
                }
                var h = this.cregion;
                h.top = f.bottom - d;
                h.left = f.right - d;
                h.right = f.right;
                h.bottom = f.bottom;
                if (m && h.contains(n)) {
                    this.dragTracker.setDragMode("Corner");
                    j.setStyle("cursor", Ext.isAir ? "move" : "se-resize");
                    return
                }
                j.setStyle("cursor", "default")
            }
            this.dragTracker.setDragMode("Absolute")
        }
    },
    onBodyContextMenu: function (d) {
        d.preventDefault();
        var b = this.findTarget(d, false);
        if (b) {
            var f = this.getTargetComponent(b);
            if (f) {
                var a = xds.inspector.getContextMenu();
                f.select();
                a.node = f;
                a.showAt(d.getXY())
            }
        }
    },
    onDocOver: function (a) {
        if (this.overFilm && !a.within(this.overFilm)) {
            this.overFilm.removeClass("el-film-over");
            delete this.overFilm
        }
    },
    beginUpdate: function () {
        this.updating = true
    },
    endUpdate: function (a) {
        this.updating = false;
        if (this.updateCmp && a !== true) {
            this.setComponent(this.updateCmp)
        }
    },
    setComponent: function (b) {
        if (this.updating) {
            this.updateCmp = b;
            return
        }
        if (b && b.getOwnerTree) {
            b = this.createConfig(b)
        }
        var a = this.items.items[0];
        if (a) {
            if (a.viewerNode) {
                a.viewerNode.component.beforeRemove()
            }
            this.remove(a)
        }
        if (b) {
            var d = this.add(b);
            Ext.lib.Event.suspend();
            this.doLayout();
            d.show();
            Ext.lib.Event.resume();
            this.syncAll.defer(50, this)
        }
    },
    clear: function () {
        this.setComponent(null)
    },
    setComponentFromNode: function (a) {
        this.setComponent(this.createConfig(a))
    },
    createConfig: function (a) {
        return a.component.createCanvasConfig(a)
    },
    onComponentSelect: function (a) {
        this.setSelected(a.node ? a.node.id : null);
        if (a.component && this.editData && a.component != this.editData.component) {
            this.stopEdit()
        }
    },
    setSelected: function (d) {
        if (this.selectedId != d) {
            var a = Ext.get("film-for-" + this.selectedId);
            if (a) {
                a.removeClass("el-film-selected");
                a.setStyle(a.getStyle("z-index") - 1)
            } else {
                var c = Ext.get("chld-for-" + this.selectedId);
                if (c) {
                    c.up(".xds-floater").removeClass("chld-selected")
                }
            }
        }
        this.selectedId = d;
        if (d) {
            var b = Ext.get("film-for-" + this.selectedId);
            if (b) {
                b.addClass("el-film-selected");
                b.setStyle(b.getStyle("z-index") + 1)
            } else {
                var c = Ext.get("chld-for-" + this.selectedId);
                if (c) {
                    c.up(".xds-floater").addClass("chld-selected")
                }
            }
        }
    },
    syncAll: function () {
        if (xds.active && xds.active.topNode) {
            xds.active.topNode.cascade(function () {
                this.component.syncFilm()
            })
        }
        this.setSelected(this.selectedId)
    },
    getTargetComponent: function (b) {
        var a = b.id.substr(9);
        return xds.inspector.getNodeById(a)
    },
    findTarget: function (c, b) {
        var a = c.getTarget(".el-film", 2) || c.getTarget(".xds-child-target", 2);
        if (a && b !== false) {
            return this.getTargetComponent(a)
        }
        return a
    },
    getInlineEditor: function () {
        if (!this.inlineEd) {
            this.inlineEd = new Ext.Editor({
                alignment: "l-l?",
                completeOnEnter: true,
                autoSize: "width",
                zIndex: 60000,
                shadow: "drop",
                shadowOffset: 3,
                cls: "x-small-editor",
                field: {
                    selectOnFocus: true
                },
                ignoreNoChange: false,
                doAutoSize: function () {
                    if (typeof this.requestedWidth == "number") {
                        this.setSize(this.requestedWidth)
                    } else {
                        this.setSize(this.boundEl.getWidth())
                    }
                }
            });
            this.inlineEd.on("complete", this.onEditComplete, this)
        }
        return this.inlineEd
    },
    stopEdit: function () {
        if (this.inlineEd && this.inlineEd.editing) {
            this.inlineEd.completeEdit()
        }
    },
    startEdit: function (f, e, a, c) {
        var g = this.editData;
        if (g && g.component == f && g.el == e && g.config == a) {
            return
        }
        this.stopEdit();
        this.editData = {
            component: f,
            el: e,
            config: a
        };
        var b = this.getInlineEditor();
        b.requestedWidth = c;
        b.startEdit(e, a.getValue(f))
    },
    onEditComplete: function (a, b, c) {
        if (String(b) != String(c)) {
            if (xds.active && xds.active.component == this.editData.component) {
                xds.props.setValue(this.editData.config.name, b)
            } else {
                this.editData.config.setValue(this.editData.component, b)
            }
        }
        delete this.editData
    }
});
xds.Canvas.DropZone = Ext.extend(Ext.dd.DropZone, {
    constructor: function (a) {
        this.allowContainerDrop = false;
        xds.Canvas.DropZone.superclass.constructor.call(this, a.bwrap, {});
        this.canvas = a;
        this.dragOverData = {};
        this.lastInsertClass = "xds-no-status"
    },
    ddGroup: "TreeDD",
    getTargetFromEvent: function (a) {
        return a.getTarget(".xds-child-target", 2) || a.getTarget(".el-film", 2) || this.canvas
    },
    isValidDropPoint: function (g, b, d) {
        var a = g ? g.component : null;
        var f = b.node.component || b.node.instance;
        return xds.Component.isValidDrop(a, f)
    },
    onNodeEnter: function (d, a, c, b) {},
    onNodeOver: function (h, a, f, d) {
        var g = this.canvas.getTargetComponent(h);
        if (h == this.canvas) {
            return this.isValidDropPoint(g, d, f) ? "xds-dd-new" : this.dropNotAllowed
        }
        var b = d.node;
        if (this.isValidDropPoint(g, d, f)) {
            return "xds-dd-add"
        } else {
            return this.dropNotAllowed
        }
    },
    onNodeOut: function (d, a, c, b) {},
    onNodeDrop: function (h, a, f, d) {
        var g = h == this.canvas ? null : this.canvas.getTargetComponent(h);
        var b = d.node;
        if (this.isValidDropPoint(g, d, f)) {
            this.canvas.lastDropPoint = f.getPoint();
            xds.fireEvent("componentevent", {
                type: b.component ? "move" : "new",
                parentId: g ? g.id : null,
                component: b.component ? b.component : b.instance.getSpec()
            });
            delete this.canvas.lastDropPoint;
            return true
        } else {
            return false
        }
    }
});
xds.Canvas.DragTracker = Ext.extend(Ext.dd.DragTracker, {
    autoStart: true,
    preventDefault: false,
    dragMode: "Absolute",
    setDragMode: function (a) {
        if (!this.active && !this.waiting) {
            this.dragMode = a
        }
    },
    onMouseUp: function (a) {
        this.waiting = false;
        xds.Canvas.DragTracker.superclass.onMouseUp.call(this, a)
    },
    isAbsolute: function (a) {
        return (a.component.owner && a.component.owner.getConfigValue("layout") == "absolute")
    },
    onBeforeStart: function (b) {
        var a = b.getTarget(".el-film", 2);
        this.snapValue = false;
        if (a && !b.getTarget("b", 1)) {
            this.node = xds.canvas.getTargetComponent(a);
            this.cmp = this.node.component;
            if (this.dragMode == "Absolute") {
                if (this.isAbsolute(this.node)) {
                    this.pos = this.cmp.getExtComponent().getPosition(true);
                    this.snapValue = this.node.component.owner.snapToGrid;
                    this.startX = this.pos[0];
                    this.startY = this.pos[1];
                    this.waiting = true;
                    return true
                }
            } else {
                this.startSize = this.cmp.getExtComponent().getSize();
                this.waiting = true;
                if (this.isAbsolute(this.node)) {
                    this.snapValue = this.node.component.owner.snapToGrid
                }
                return true
            }
        }
        return false
    },
    onStart: function (a) {
        this.waiting = false;
        this.node.select();
        this.cmp.getExtComponent().film.addClass("el-film-drag")
    },
    onDrag: function (a) {
        this["onDrag" + this.dragMode](a, this.getOffset(), this.cmp.getExtComponent())
    },
    onDragAbsolute: function (b, c, a) {
        a.setPosition(this.snap(this.startX - c[0]), this.snap(this.startY - c[1]));
        a.syncFilm()
    },
    onDragRight: function (b, c, a) {
        a.setWidth(Math.max(this.cmp.minWidth, this.snap(this.startSize.width - c[0])));
        a.syncFilm()
    },
    onDragBottom: function (b, c, a) {
        a.setHeight(Math.max(this.cmp.minHeight, this.snap(this.startSize.height - c[1])));
        a.syncFilm()
    },
    onDragCorner: function (b, c, a) {
        a.setSize(Math.max(this.cmp.minWidth, this.snap(this.startSize.width - c[0])), Math.max(this.cmp.minHeight, this.snap(this.startSize.height - c[1])));
        a.syncFilm()
    },
    onEnd: function (b) {
        var a = this.cmp.getExtComponent();
        a.film.removeClass("el-film-drag");
        this["onEnd" + this.dragMode](b, this.getOffset(), a);
        if (a.ownerCt && a.ownerCt.layout) {
            delete a.anchorSpec;
            a.ownerCt.doLayout()
        }
    },
    onEndAbsolute: function (b, c, a) {
        var d = a.getPosition(true);
        d[0] = this.snap(d[0]);
        d[1] = this.snap(d[1]);
        xds.canvas.beginUpdate();
        this.cmp.setConfig("x", d[0]);
        this.cmp.setConfig("y", d[1]);
        xds.props.setValue("x", d[0]);
        xds.props.setValue("y", d[1]);
        xds.canvas.endUpdate(true);
        xds.fireEvent("componentchanged")
    },
    onEndRight: function (c, d, b) {
        xds.canvas.beginUpdate();
        var a = b.getWidth();
        this.cmp.setConfig("width", a);
        xds.props.setValue("width", a);
        xds.canvas.endUpdate(true);
        xds.fireEvent("componentchanged")
    },
    onEndBottom: function (c, d, b) {
        xds.canvas.beginUpdate();
        var a = b.getHeight();
        this.cmp.setConfig("height", a);
        xds.props.setValue("height", a);
        xds.canvas.endUpdate(true);
        xds.fireEvent("componentchanged")
    },
    onEndCorner: function (d, f, c) {
        xds.canvas.beginUpdate();
        var b = c.getWidth();
        this.cmp.setConfig("width", b);
        xds.props.setValue("width", b);
        var a = c.getHeight();
        this.cmp.setConfig("height", a);
        xds.props.setValue("height", a);
        xds.canvas.endUpdate(true);
        xds.fireEvent("componentchanged")
    },
    snap: function (c, b) {
        b = b || this.snapValue;
        if (b < 1 || !c) {
            return c
        }
        var e = c,
        d = b;
        var a = c % d;
        if (a > 0) {
            if (a > (d / 2)) {
                e = c + (d - a)
            } else {
                e = c - a
            }
        }
        return e
    }
});
xds.ConfigEditor = Ext.extend(Ext.Panel, {
    constructor: function () {
        this.grid = new xds.PropGrid();
        this.grid.on("rowcontextmenu", this.onRowContext, this);
        xds.ConfigEditor.superclass.constructor.call(this, {
            id: "props",
            region: "south",
            margins: "0 0 0 0",
            title: "Component Config",
            layout: "fit",
            border: false,
            items: this.grid,
            disabled: true,
            split: true,
            height: Math.round(Ext.lib.Dom.getViewportHeight() * 0.4),
            tools: [{
                id: "expand-all",
                handler: function () {
                    this.grid.view.expandAllGroups()
                },
                qtip: "Expand All",
                scope: this
            },
            {
                id: "collapse-all",
                handler: function () {
                    this.grid.view.collapseAllGroups()
                },
                qtip: "Collapse All",
                scope: this
            }]
        })
    },
    findRecord: function (b) {
        var a = null;
        this.grid.store.each(function (c) {
            if (c.data.name == b) {
                a = c;
                return false
            }
        });
        return a
    },
    findType: function (c) {
        var b = xds.configs[xds.active.component.xcls].configs;
        for (var d = 0, a = b.length; d < a; d++) {
            if (b[d].name == c) {
                return b[d].type
            }
        }
        return "String"
    },
    addAndEdit: function (c, d, e) {
        var b = xds.active.component.config;
        if (e !== undefined || b[c] === undefined) {
            b[c] = e !== undefined ? this.convertForType(d, e) : this.getDefaultForType(d);
            this.grid.setComponent(b)
        }
        if (e === undefined) {
            var a = this.findRecord(c);
            if (a) {
                this.grid.startEditing.defer(10, this.grid, [this.grid.store.indexOf(a), 1])
            }
        } else {
            xds.fireEvent("componentchanged")
        }
    },
    getDefaultForType: function (a) {
        a = a.toLowerCase();
        switch (a) {
        case "string":
            return "";
        case "boolean":
            return false;
        case "number":
            return 0;
        default:
            return ""
        }
    },
    convertForType: function (a, b) {
        a = a.toLowerCase();
        switch (a) {
        case "string":
            return "" + b;
        case "boolean":
            return ! (b === false || b === "0" || b === "false");
        case "number":
            return b === "" ? 0 : parseInt(b, 10);
        default:
            return b
        }
    },
    onRowContext: function (a, c, b) {
        if (!this.contextMenu) {
            this.contextMenu = new Ext.menu.Menu({
                items: [{
                    text: "Delete",
                    iconCls: "icon-delete",
                    handler: function () {
                        xds.active.component.getConfigObject(this.contextProperty).setValue(xds.active.component, undefined);
                        this.refresh();
                        xds.fireEvent("componentchanged")
                    },
                    scope: this
                },
                "-", {
                    text: "Refresh values",
                    iconCls: "icon-refresh",
                    handler: this.refresh,
                    scope: this
                }]
            })
        }
        this.contextProperty = this.grid.store.getAt(c).data.name;
        this.contextMenu.items.items[0].setText("Delete " + this.contextProperty);
        this.contextMenu.showAt(b.getXY());
        b.stopEvent()
    },
    refresh: function () {
        if (xds.active) {
            var a = xds.active.component;
            this.grid.setComponent(a)
        } else {
            this.grid.clear()
        }
    },
    setValue: function (c, b) {
        var a = this.grid.propStore.store.getById(c);
        if (a) {
            a.set("value", b)
        }
    }
});
xds.Inspector = Ext.extend(Ext.tree.TreePanel, {
    constructor: function () {
        xds.inspector = this;
        xds.Inspector.superclass.constructor.call(this, {
            id: "structure",
            region: "center",
            split: true,
            height: 300,
            minHeight: 120,
            autoScroll: true,
            margins: "0 0 0 0",
            title: "Component Inspector",
            trackMouseOver: false,
            animate: false,
            autoScroll: true,
            useArrows: true,
            enableDD: true,
            border: false,
            rootVisible: false,
            tools: [{
                id: "expand-all",
                qtip: "Expand All",
                handler: function () {
                    this.root.expand(true)
                },
                scope: this
            },
            {
                id: "collapse-all",
                qtip: "Collapse All",
                handler: function () {
                    this.root.collapse(true)
                },
                scope: this
            },
            {
                id: "refresh",
                qtip: "Repaint Canvas",
                handler: function () {
                    xds.fireEvent("componentchanged")
                }
            }],
            keys: [{
                key: Ext.EventObject.DELETE,
                fn: function () {
                    if (xds.active) {
                        Ext.Msg.confirm("Delete Component", "Are you sure you wish to permanently delete this component?", function (a) {
                            if (a == "yes" && xds.active) {
                                xds.inspector.removeComponent(xds.active.component)
                            }
                        })
                    }
                }
            }]
        })
    },
    initComponent: function () {
        this.loader = new xds.Inspector.DemoLoader();
        this.root = {
            id: "croot",
            async: true,
            expanded: true,
            allowDrag: false,
            text: "croot",
            allowDrop: false
        };
        this.on("nodedragover", this.onDragOver, this);
        this.on("beforeappend", this.onBeforeAppend, this);
        this.on("beforenodedrop", this.onBeforeDrop, this);
        this.on("nodedrop", this.onAfterDrop, this);
        this.on("contextmenu", this.onNodeContext, this);
        xds.on("componentevent", this.onComponentEvent, this);
        xds.on("componentclick", this.onComponentClick, this);
        this.getSelectionModel().on("selectionchange", function (c, b) {
            var a = b;
            while (a && a.parentNode != this.root) {
                a = a.parentNode
            }
            if (this.prevSelection) {
                this.prevSelection.onSelectChange(false);
                delete this.prevSelection
            }
            if (b && b.component) {
                b.component.onSelectChange(true);
                this.prevSelection = b.component
            }
            xds.fireEvent("componentselect", {
                component: b ? b.component : null,
                node: b,
                top: a ? a.component : null,
                topNode: a
            })
        },
        this);
        xds.Inspector.superclass.initComponent.call(this)
    },
    onBeforeEdit: function (c, b, a) {
        return !this.getNodeById(b)
    },
    onEdit: function (c, b, a) {
        var d = this.editor.editNode
    },
    onComponentClick: function (a) {
        if (a.node) {
            a.node.select()
        }
    },
    onBeforeAppend: function (a, b, d) {
        var c;
        if (b.component && (c = b.component.getConfigValue("layout"))) {
            if (xds.Layouts[c] && xds.Layouts[c].onBeforeAdd) {
                xds.Layouts[c].onBeforeAdd(b, d)
            }
        }
    },
    removeComponent: function (b) {
        var a = b.attributes ? b : this.getNodeById(b.id);
        if (a) {
            if (a.isSelected()) {
                if (a.nextSibling) {
                    a.nextSibling.select()
                } else { if (a.previousSibling) {
                        a.previousSibling.select()
                    } else { if (a.parentNode.component) {
                            a.parentNode.select()
                        } else {
                            xds.canvas.clear()
                        }
                    }
                }
            }
            a.parentNode.removeChild(a);
            if (!this.root.hasChildNodes()) {
                xds.canvas.clear()
            }
        }
    },
    getContextMenu: function () {
        if (!this.contextMenu) {
            var a = this.contextMenu = new Ext.menu.Menu({
                zIndex: 80000,
                items: [{
                    text: "Select Component",
                    iconCls: "icon-cmp-view",
                    handler: function () {
                        a.node.select()
                    }
                },
                {
                    itemId: "save-to-toolbox",
                    text: "Save to Toolbox",
                    iconCls: "icon-save",
                    handler: function () {
                        var b = a.node.component.getInternals(true);
                        b.naming = b.name;
                        xds.Registry.addUserType(b);
                        xds.toolbox.loadUserTypes();
                        var c = xds.toolbox.getNodeById("User_Components");
                        if (c && c.lastChild) {
                            c.lastChild.ensureVisible();
                            c.lastChild.ui.highlight()
                        }
                    }
                },
                "-", {
                    itemId: "move-up",
                    text: "Move Up",
                    handler: function () {
                        a.node.parentNode.insertBefore(a.node, a.node.previousSibling);
                        a.node.select();
                        xds.fireEvent("componentchanged")
                    }
                },
                {
                    itemId: "move-down",
                    text: "Move Down",
                    handler: function () {
                        a.node.parentNode.insertBefore(a.node, a.node.nextSibling.nextSibling);
                        a.node.select();
                        xds.fireEvent("componentchanged")
                    }
                },
                "-", {
                    text: "Delete",
                    iconCls: "icon-delete",
                    handler: function () {
                        xds.inspector.removeComponent(a.node.component);
                        xds.fireEvent("componentchanged")
                    }
                }],
                onContextShow: function () {
                    this.items.get("save-to-toolbox").setDisabled( !! a.node.component.owner);
                    this.items.get("move-up").setDisabled(!a.node.previousSibling);
                    this.items.get("move-down").setDisabled(!a.node.nextSibling);
                    a.node.ui.addClass("xds-context-node");
                    var d = a.node.component.getActions();
                    if (d) {
                        a.add(new Ext.menu.Separator({
                            id: "actions-sep"
                        }));
                        for (var c = 0, b = d.length; c < b; c++) {
                            a.add(d[c])
                        }
                    }
                },
                onContextClose: function () {
                    var d = a.node.component.getActions();
                    if (d) {
                        a.remove(a.items.get("actions-sep"));
                        for (var c = 0, b = d.length; c < b; c++) {
                            a.remove(a.items.get(d[c].initialConfig.itemId))
                        }
                    }
                    a.node.ui.removeClass("xds-context-node")
                }
            });
            a.on("beforeshow", a.onContextShow, a);
            a.on("hide", a.onContextClose, a)
        }
        return this.contextMenu
    },
    onNodeContext: function (c, b) {
        var a = this.getContextMenu();
        a.node = c;
        a.showAt(b.getXY());
        b.stopEvent()
    },
    nextId: function (b) {
        if (!this.getNodeById(b)) {
            return b
        }
        var a = 0;
        while (this.getNodeById(b + (++a))) {}
        return b + a
    },
    onDragOver: function (a) {
        return xds.Component.isValidDrop(this.getDropPosition(a.target, a.point).parent.component, a.dropNode.component || a.dropNode.instance)
    },
    onBeforeDrop: function (d) {
        if (!xds.Component.isValidDrop(this.getDropPosition(d.target, d.point).parent.component, d.dropNode.component || d.dropNode.instance)) {
            return false
        }
        if (d.tree == d.source.tree) {
            if (!d.dropNode.component.owner) {
                this.initCopy(d.dropNode, d.target, d.point);
                d.dropStatus = true;
                return false
            }
            return true
        } else { if (d.dropNode) {
                d.dropStatus = true;
                var c = this.getDropPosition(d.target, d.point);
                var b = d.dropNode.instance.getSpec();
                var a = this.restore(b, c.parent, c.before);
                a.select();
                xds.fireEvent("componentchanged")
            }
        }
        return false
    },
    getDropPosition: function (b, a) {
        var c = {};
        switch (a) {
        case "above":
            c.parent = b.parentNode;
            c.before = b;
            break;
        case "below":
            c.parent = b.parentNode;
            c.before = b.nextSibling;
            break;
        default:
            c.parent = b
        }
        return c
    },
    onAfterDrop: function (a) {
        a.dropNode.select();
        a.dropNode.component.setOwner(a.dropNode.parentNode.component);
        xds.fireEvent("componentchanged")
    },
    onComponentEvent: function (c) {
        var b = c.parentId ? this.getNodeById(c.parentId) : this.root;
        if (c.type == "new") {
            this.restore(c.spec || c.component, b).select();
            xds.fireEvent("componentchanged")
        } else { if (c.type == "move") {
                c.component.setOwner(b.component);
                var a = c.component.getNode();
                b.appendChild(a);
                a.select();
                xds.fireEvent("componentchanged")
            }
        }
    },
    initCopy: function (c, b, a) {
        Ext.Msg.show({
            title: "Copy",
            msg: "Dropping a root level component here can not be undone. Would you like to copy it instead?",
            buttons: Ext.Msg.YESNOCANCEL,
            fn: function (d) {
                if (d == "yes") {
                    var e = c.component.getInternals(true);
                    var f = this.getDropPosition(b, a);
                    this.restore(e, f.parent, f.before).select()
                } else { if (d == "no") {
                        var f = this.getDropPosition(b, a);
                        c.component.setOwner(f.parent.component);
                        f.parent.insertBefore(c, f.before);
                        c.select();
                        xds.fireEvent("componentchanged")
                    }
                }
            },
            scope: this
        })
    },
    restore: function (h, b, f) {
        b = b || this.root;
        var e = xds.create(h);
        delete e.cn;
        if (b) {
            e.setOwner(b.component)
        }
        var d = e.getNode();
        if (b) {
            b.insertBefore(d, f)
        }
        if (h.cn) {
            for (var a = 0, g; g = h.cn[a]; a++) {
                this.restore(g, d)
            }
        }
        return d
    }
});
xds.Inspector.DemoLoader = Ext.extend(Ext.tree.TreeLoader, {
    load: function (a, b) {
        b()
    }
});
xds.Toolbox = Ext.extend(Ext.tree.TreePanel, {
    constructor: function () {
        xds.Toolbox.superclass.constructor.call(this, {
            width: 200,
            region: "west",
            split: true,
            id: "toolbox",
            border: false,
            margins: "0 0 0 0",
            cmargins: "0 1 0 0",
            title: "Toolbox",
            layout: "fit",
            collapsible: true,
            rootVisible: false,
            animate: false,
            autoScroll: true,
            useArrows: true,
            minWidth: 150,
            enableDrag: true,
            collapseFirst: false,
            animCollapse: false,
            animFloat: false,
            tools: [{
                id: "expand-all",
                handler: function () {
                    this.root.expand(true)
                },
                qtip: "Expand All",
                scope: this
            },
            {
                id: "collapse-all",
                handler: function () {
                    this.root.collapse(true)
                },
                qtip: "Collapse All",
                scope: this
            }]
        });
        xds.toolbox = this
    },
    initComponent: function () {
        this.loader = new xds.Toolbox.DemoLoader();
        this.root = {
            id: "troot",
            async: true,
            expanded: true,
            text: "troot"
        };
        xds.Toolbox.superclass.initComponent.call(this);
        this.getSelectionModel().on("beforeselect", function (a, b) {
            if (b && !b.isLeaf()) {
                b.toggle();
                return false
            }
        });
        this.on("dblclick", this.onDblClick, this)
    },
    onDblClick: function (a) {
        if (a.isLeaf() && xds.active && xds.Component.isValidDrop(xds.active.component, a.instance)) {
            xds.inspector.restore(a.instance.getSpec(), xds.active.node);
            xds.fireEvent("componentchanged")
        }
    },
    loadUserTypes: function () {
        var e = xds.Registry.userTypes;
        if (e) {
            var d = this.getNodeById("User_Components");
            if (d) {
                while (d.firstChild) {
                    d.removeChild(d.firstChild)
                }
            } else {
                d = this.root.appendChild({
                    cls: "toolbox-ct",
                    allowDrag: false,
                    text: "User Components",
                    id: "User_Components",
                    leaf: false
                })
            }
            d.beginUpdate();
            for (var b = 0, a; a = e[b]; b++) {
                var g = xds.Registry.get(a.cid);
                if (g) {
                    var f = new Ext.tree.TreeNode({
                        text: a.name,
                        iconCls: g.prototype.iconCls,
                        leaf: true,
                        user: true
                    });
                    d.appendChild(f);
                    f.type = g;
                    f.spec = a;
                    f.instance = new g();
                    f.instance.spec = a
                }
            }
            d.endUpdate();
            d.expand()
        }
    },
    onRender: function (b, a) {
        xds.Toolbox.superclass.onRender.call(this, b, a);
        this.innerCt.setStyle("padding-bottom", "20px")
    }
});
xds.Toolbox.Loader = Ext.extend(Ext.tree.TreeLoader, {
    load: Ext.emptyFn
});
xds.Toolbox.WebLoader = Ext.extend(xds.Toolbox.Loader, {});
xds.Toolbox.DemoLoader = Ext.extend(xds.Toolbox.Loader, {
    load: function (a, k) {
        if (a.id != "troot") {
            k();
            return
        }
        var l = a.getOwnerTree();
        a.beginUpdate();
        var j = xds.Registry.all.items;
        for (var b = 0, d = j.length, g, f, e; b < d; b++) {
            f = j[b];
            e = "xdc" + f.prototype.category.replace(/\s/g, "_");
            g = l.getNodeById(e);
            if (!g) {
                g = a.appendChild({
                    cls: "toolbox-ct",
                    allowDrag: false,
                    text: f.prototype.category,
                    id: e,
                    leaf: false
                })
            }
            var h = new Ext.tree.TreeNode({
                text: f.prototype.text,
                iconCls: f.prototype.iconCls,
                leaf: true
            });
            g.appendChild(h);
            h.type = f;
            h.instance = new f()
        }
        l.loadUserTypes();
        a.endUpdate();
        a.expand.defer(10, a, [true]);
        k();
        xds.fireEvent("componentsloaded")
    }
});
xds.Layouts = {
    form: {
        id: "form",
        xcls: "Ext.layout.FormLayout",
        text: "Form Layout",
        configs: [{
            name: "anchor",
            group: "Ext.layout.FormLayout",
            ctype: "string"
        },
        {
            name: "clearCls",
            group: "Ext.layout.FormLayout",
            ctype: "string"
        },
        {
            name: "fieldLabel",
            group: "Ext.layout.FormLayout",
            ctype: "string"
        },
        {
            name: "hideLabel",
            group: "Ext.layout.FormLayout",
            ctype: "boolean"
        },
        {
            name: "itemCls",
            group: "Ext.layout.FormLayout",
            ctype: "string"
        },
        {
            name: "labelSeparator",
            group: "Ext.layout.FormLayout",
            ctype: "string"
        },
        {
            name: "labelStyle",
            group: "Ext.layout.FormLayout",
            ctype: "string"
        }],
        layoutConfigs: [{
            name: "labelAlign",
            group: "(Layout)",
            ctype: "string",
            editor: "options",
            options: ["left", "right", "top"]
        },
        {
            name: "labelSeparator",
            group: "(Layout)",
            setFn: "setContainerConfig",
            getFn: "getContainerConfigValue",
            ctype: "string"
        },
        {
            name: "labelPad",
            group: "Ext.layout.FormLayout",
            ctype: "number"
        },
        {
            name: "labelWidth",
            group: "Ext.layout.FormLayout",
            ctype: "number"
        }]
    },
    table: {
        id: "table",
        xcls: "Ext.layout.TableLayout",
        text: "Table Layout",
        configs: [{
            name: "cellId",
            group: "Ext.layout.TableLayout",
            ctype: "string"
        },
        {
            name: "cellCls",
            group: "Ext.layout.TableLayout",
            ctype: "string"
        },
        {
            name: "colspan",
            group: "Ext.layout.TableLayout",
            ctype: "number"
        },
        {
            name: "rowspan",
            group: "Ext.layout.TableLayout",
            ctype: "number"
        }],
        layoutConfigs: [{
            name: "columns",
            group: "(Layout)",
            setFn: "setContainerConfig",
            getFn: "getContainerConfigValue",
            ctype: "number"
        }]
    },
    card: {
        id: "card",
        xcls: "Ext.layout.CardLayout",
        text: "Card Layout",
        configs: [],
        layoutConfigs: [{
            name: "deferredRender",
            group: "(Layout)",
            ctype: "boolean",
            setFn: "setContainerConfig",
            getFn: "getContainerConfigValue",
            defaultValue: false
        }]
    },
    accordion: {
        id: "accordion",
        xcls: "Ext.layout.AccordionLayout",
        text: "Accordion Layout",
        configs: [],
        layoutConfigs: [{
            name: "fill",
            group: "(Layout)",
            ctype: "boolean",
            setFn: "setContainerConfig",
            getFn: "getContainerConfigValue",
            defaultValue: true
        },
        {
            name: "autoWidth",
            group: "(Layout)",
            ctype: "boolean",
            setFn: "setContainerConfig",
            getFn: "getContainerConfigValue",
            defaultValue: true
        },
        {
            name: "titleCollapse",
            group: "(Layout)",
            ctype: "boolean",
            setFn: "setContainerConfig",
            getFn: "getContainerConfigValue",
            defaultValue: true
        },
        {
            name: "hideCollapseTool",
            group: "(Layout)",
            ctype: "boolean",
            setFn: "setContainerConfig",
            getFn: "getContainerConfigValue",
            defaultValue: false
        },
        {
            name: "collapseFirst",
            group: "(Layout)",
            ctype: "boolean",
            setFn: "setContainerConfig",
            getFn: "getContainerConfigValue",
            defaultValue: false
        },
        {
            name: "animate",
            group: "(Layout)",
            ctype: "boolean",
            setFn: "setContainerConfig",
            getFn: "getContainerConfigValue",
            defaultValue: false
        },
        {
            name: "sequence",
            group: "(Layout)",
            ctype: "boolean",
            setFn: "setContainerConfig",
            getFn: "getContainerConfigValue",
            defaultValue: false
        },
        {
            name: "activeOnTop",
            group: "(Layout)",
            ctype: "boolean",
            setFn: "setContainerConfig",
            getFn: "getContainerConfigValue",
            defaultValue: false
        }]
    },
    border: {
        id: "border",
        xcls: "Ext.layout.BorderLayout",
        text: "Border Layout",
        configs: [{
            name: "animFloat",
            group: "Ext.layout.BorderLayout",
            ctype: "boolean"
        },
        {
            name: "autoHide",
            group: "Ext.layout.BorderLayout",
            ctype: "boolean"
        },
        {
            name: "cmargins",
            group: "Ext.layout.BorderLayout",
            ctype: "string"
        },
        {
            name: "collapseMode",
            group: "Ext.layout.BorderLayout",
            ctype: "string",
            editor: "options",
            options: ["standard", "mini"]
        },
        {
            name: "floatable",
            group: "Ext.layout.BorderLayout",
            ctype: "boolean"
        },
        {
            name: "margins",
            group: "Ext.layout.BorderLayout",
            ctype: "string"
        },
        {
            name: "minHeight",
            group: "Ext.layout.BorderLayout",
            ctype: "number"
        },
        {
            name: "minWidth",
            group: "Ext.layout.BorderLayout",
            ctype: "number"
        },
        {
            name: "region",
            group: "Ext.layout.BorderLayout",
            ctype: "string",
            editor: "options",
            options: ["center", "east", "north", "south", "west"]
        },
        {
            name: "split",
            group: "Ext.layout.BorderLayout",
            ctype: "boolean"
        }],
        onBeforeAdd: function (d, c) {
            var f = ["center", "west", "east", "north", "south"];
            var e = d.firstChild;
            while (e) {
                var b = e.component.getConfigValue("region");
                if (b) {
                    var a = f.indexOf(b);
                    if (a != -1) {
                        f.splice(a, 1)
                    }
                }
                e = e.nextSibling
            }
            c.component.setConfig("region", f[0])
        },
        onInit: function (a) {
            var b = a.firstChild;
            while (b) {
                this.onBeforeAdd(a, b);
                b = b.nextSibling
            }
        }
    },
    anchor: {
        id: "anchor",
        xcls: "Ext.layout.AnchorLayout",
        text: "Anchor Layout",
        configs: [{
            name: "anchor",
            group: "Ext.layout.AnchorLayout",
            ctype: "string"
        }]
    },
    absolute: {
        id: "absolute",
        xcls: "Ext.layout.AbsoluteLayout",
        text: "Absolute Layout",
        configs: [{
            name: "anchor",
            group: "Ext.layout.AbsoluteLayout",
            ctype: "string"
        },
        {
            name: "x",
            group: "Ext.layout.AbsoluteLayout",
            ctype: "number"
        },
        {
            name: "y",
            group: "Ext.layout.AbsoluteLayout",
            ctype: "number"
        }],
        layoutConfigs: [{
            name: "snapToGrid",
            group: "Ext.layout.AbsoluteLayout",
            setFn: "setSnapToGrid",
            getFn: "getSnapToGrid",
            ctype: "string",
            editor: "options",
            options: ["(none)", "5", "10", "15", "20"],
            defaultValue: "10"
        }],
        onBeforeAdd: function (b, a) {
            if (xds.canvas.lastDropPoint) {
                var d = b.component.getExtComponent();
                if (d) {
                    var c = d.getLayoutTarget().translatePoints(xds.canvas.lastDropPoint);
                    c.left = xds.canvas.dragTracker.snap(c.left, b.component.snapToGrid);
                    c.top = xds.canvas.dragTracker.snap(c.top, b.component.snapToGrid);
                    a.component.userConfig.x = c.left;
                    a.component.userConfig.y = c.top
                }
            }
        }
    },
    column: {
        id: "column",
        xcls: "Ext.layout.ColumnLayout",
        text: "Column Layout",
        configs: [{
            name: "columnWidth",
            group: "Ext.layout.ColumnLayout",
            ctype: "number"
        }],
        layoutConfigs: [{
            name: "scrollOffset",
            group: "(Layout)",
            ctype: "number"
        }]
    },
    fit: {
        id: "fit",
        xcls: "Ext.layout.FitLayout",
        text: "Fit Layout",
        configs: []
    },
    hbox: {
        id: "hbox",
        xcls: "Ext.layout.HBoxLayout",
        text: "HBox Layout",
        configs: [{
            name: "flex",
            group: "Ext.layout.HBoxLayout",
            ctype: "number"
        },
        {
            name: "margins",
            group: "Ext.layout.HBoxLayout",
            ctype: "string"
        }],
        layoutConfigs: [{
            name: "align",
            group: "(Layout)",
            setFn: "setContainerConfig",
            getFn: "getContainerConfigValue",
            ctype: "string",
            editor: "options",
            options: ["top", "middle", "stretch", "stretchmax"],
            defaultValue: "top"
        },
        {
            name: "pack",
            group: "(Layout)",
            setFn: "setContainerConfig",
            getFn: "getContainerConfigValue",
            ctype: "string",
            editor: "options",
            options: ["start", "center", "end"],
            defaultValue: "start"
        },
        {
            name: "padding",
            group: "(Layout)",
            setFn: "setContainerConfig",
            getFn: "getContainerConfigValue",
            ctype: "string",
            defaultValue: "0"
        },
        {
            name: "scrollOffset",
            group: "(Layout)",
            setFn: "setContainerConfig",
            getFn: "getContainerConfigValue",
            ctype: "number",
            defaultValue: 0
        }]
    },
    vbox: {
        id: "vbox",
        xcls: "Ext.layout.VBoxLayout",
        text: "VBox Layout",
        configs: [{
            name: "flex",
            group: "Ext.layout.VBoxLayout",
            ctype: "number"
        },
        {
            name: "margins",
            group: "Ext.layout.VBoxLayout",
            ctype: "string"
        }],
        layoutConfigs: [{
            name: "align",
            group: "(Layout)",
            setFn: "setContainerConfig",
            getFn: "getContainerConfigValue",
            ctype: "string",
            editor: "options",
            options: ["left", "center", "stretch", "stretchmax"],
            defaultValue: "top"
        },
        {
            name: "pack",
            group: "(Layout)",
            setFn: "setContainerConfig",
            getFn: "getContainerConfigValue",
            ctype: "string",
            editor: "options",
            options: ["start", "center", "end"],
            defaultValue: "start"
        },
        {
            name: "padding",
            group: "(Layout)",
            setFn: "setContainerConfig",
            getFn: "getContainerConfigValue",
            ctype: "string",
            defaultValue: "0"
        },
        {
            name: "scrollOffset",
            group: "(Layout)",
            setFn: "setContainerConfig",
            getFn: "getContainerConfigValue",
            ctype: "number",
            defaultValue: 0
        }]
    }
};
xds.layouts = ["auto", "absolute", "accordion", "anchor", "border", "card", "column", "fit", "form", "hbox", "table", "vbox"];
(function () {
    for (var a in xds.Layouts) {
        if (xds.Layouts.hasOwnProperty(a)) {
            xds.initConfigs("configs", xds.Layouts[a]);
            xds.initConfigs("layoutConfigs", xds.Layouts[a])
        }
    }
})();
xds.StoreCache = new Ext.util.MixedCollection(false, function (a) {
    return a.component.id
});
Ext.intercept(Ext.StoreMgr, "register", function (a) {
    if (a.cache === false) {
        return false
    }
    if (a.component) {
        xds.StoreCache.replace(a)
    }
});
xds.Flyout = Ext.extend(Ext.Tip, {
    floating: {
        shadow: true,
        shim: true,
        useDisplay: false,
        constrain: false,
        zindex: 80001
    },
    cls: "component-info x-small-editor",
    width: 170,
    layout: "form",
    labelAlign: "top",
    initComponent: function () {
        xds.Flyout.superclass.initComponent.call(this);
        this.component.flyout = this;
        this.component.flyoutCls = "xds-flyout xds-flyout-open";
        this.component.getFlyoutButton().addClass("xds-flyout-open");
        this.mon(xds.canvas.el, "mousedown", this.doAutoClose, this);
        this.mon(xds.east.el, "mousedown", this.doAutoClose, this);
        this.mon(xds.toolbox.el, "mousedown", this.doAutoClose, this);
        this.syncTask = Ext.TaskMgr.start({
            run: function () {
                var a = this.component.getFlyoutButton();
                if (a) {
                    this.showBy(a, "tl-tr?")
                }
            },
            scope: this,
            interval: 100
        })
    },
    beforeDestroy: function () {
        delete this.component.flyout;
        this.component.flyoutCls = "xds-flyout";
        xds.un("componentselect", this.doAutoClose, this);
        if (this.component.getFlyoutButton()) {
            this.component.getFlyoutButton().removeClass("xds-flyout-open")
        }
        Ext.TaskMgr.stop(this.syncTask);
        xds.Flyout.superclass.beforeDestroy.call(this)
    },
    doAutoClose: function (a) {
        if (!a.within(this.el) && a.target != this.component.getFlyoutButton().dom) {
            this.destroy()
        }
    },
    doAutoWidth: Ext.emptyFn
});
xds.CWindow = Ext.extend(Ext.Window, {
    iconCls: "icon-cmp",
    width: 500,
    height: 350,
    layout: "border",
    plain: true,
    modal: true,
    initComponent: function () {
        this.items = [this.view = new Ext.ux.TileView({
            style: "background:#fff;overflow:auto",
            region: "center",
            categoryName: "category",
            store: new xds.Registry.createStore(true),
            singleSelect: true,
            trackOver: true,
            overClass: "x-tile-over"
        }), {
            layout: "form",
            region: "south",
            height: 29,
            bodyStyle: "padding:3px;border-top:1px solid #B7CCE4;",
            baseCls: "x-plain",
            labelWidth: 70,
            items: this.idField = new Ext.form.TextField({
                value: "MyComponent",
                selectOnFocus: true,
                fieldLabel: "Class Name",
                anchor: "100%"
            })
        }];
        this.buttons = [{
            text: "OK",
            disabled: true,
            handler: this.onAccept,
            scope: this
        },
        {
            text: "Cancel",
            handler: this.close,
            scope: this
        }];
        this.view.on("selectionchange", this.onViewSelect, this);
        xds.CWindow.superclass.initComponent.call(this)
    },
    onViewSelect: function () {
        var a = this.view.getSelectedRecords()[0];
        if (a) {
            this.buttons[0].enable();
            this.idField.setValue(xds.inspector.nextId(a.data.naming))
        } else {
            this.buttons[0].disable()
        }
    },
    onAccept: function () {
        var a = this.view.getSelectedRecords()[0];
        var b = xds.Registry.get(a.id);
        xds.fireEvent("componentevent", {
            type: "new",
            component: (new b()).getSpec()
        });
        this.close()
    }
});
xds.types.Container = Ext.extend(xds.Component, {
    cid: "container",
    category: "Containers",
    defaultName: "&lt;container&gt;",
    text: "Container",
    dtype: "xdcontainer",
    xtype: "container",
    xcls: "Ext.Container",
    iconCls: "icon-container",
    naming: "MyContainer",
    enableFlyout: true,
    isContainer: true,
    defaultConfig: {
        autoEl: "div"
    },
    initConfig: function (b, a) {
        if (!a) {
            b.width = 400;
            b.height = 250
        }
    },
    isResizable: function (a, b) {
        return !this.isFit() && !this.isAnchored()
    },
    configs: [{
        name: "activeItem",
        group: "Ext.Container",
        ctype: "string"
    },
    {
        name: "autoDestroy",
        group: "Ext.Container",
        ctype: "boolean"
    },
    {
        name: "defaultType",
        group: "Ext.Container",
        ctype: "string"
    },
    {
        name: "hideBorders",
        group: "Ext.Container",
        ctype: "boolean"
    },
    {
        name: "layout",
        group: "Ext.Container",
        ctype: "string",
        editor: "options",
        options: xds.layouts
    },
    {
        name: "autoHeight",
        group: "Ext.BoxComponent",
        ctype: "boolean"
    },
    {
        name: "autoWidth",
        group: "Ext.BoxComponent",
        ctype: "boolean"
    },
    {
        name: "height",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageX",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageY",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "width",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "x",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "y",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "disabled",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "disabledClass",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "overCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "stateful",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }],
    onFlyout: function () {
        var a = [{
            xtype: "flyoutselect",
            fieldLabel: "Select a layout",
            data: xds.layouts,
            bindTo: {
                component: this,
                name: "layout",
                event: "select",
                defaultValue: "auto"
            }
        }];
        if (this.owner && this.owner.hasConfig("layout", "border")) {
            a.push({
                xtype: "flyoutselect",
                fieldLabel: "Select a region",
                data: ["north", "east", "center", "south", "west"],
                bindTo: {
                    component: this,
                    name: "region",
                    event: "select"
                }
            })
        }
        return new xds.Flyout({
            title: this.getNode().text,
            component: this,
            items: a
        })
    }
});
xds.Registry.register(xds.types.Container);
xds.Container = Ext.extend(Ext.Container, {});
Ext.reg("xdcontainer", xds.Container);
xds.PanelBase = Ext.extend(xds.Component, {
    category: "Containers",
    isContainer: true,
    enableFlyout: true,
    isResizable: function (a, b) {
        return !this.isFit() && !this.isAnchored()
    },
    initConfig: function (b, a) {
        if (!a) {
            b.width = 400;
            b.height = 250
        }
    },
    autoScrollable: true,
    layoutable: true,
    getFlyoutItems: function () {
        var a = [];
        if (this.layoutable) {
            a.push({
                xtype: "flyoutselect",
                fieldLabel: "Select a layout",
                data: xds.layouts,
                bindTo: {
                    component: this,
                    name: "layout",
                    event: "select",
                    defaultValue: "auto"
                }
            })
        }
        if (this.autoScrollable) {
            a.push({
                xtype: "checkbox",
                boxLabel: "Enable autoScroll",
                hideLabel: true,
                bindTo: {
                    component: this,
                    name: "autoScroll",
                    event: "check"
                }
            })
        }
        if (this.owner && this.owner.hasConfig("layout", "border")) {
            a.push({
                xtype: "flyoutselect",
                fieldLabel: "Select a region",
                data: ["north", "east", "center", "south", "west"],
                bindTo: {
                    component: this,
                    name: "region",
                    event: "select"
                }
            })
        }
        if (this.hasConfig("layout", "absolute")) {
            a.push({
                xtype: "flyoutselect",
                fieldLabel: "Snap to grid",
                data: ["(none)", 5, 10, 15, 20],
                bindTo: {
                    component: this,
                    name: "snapToGrid",
                    event: "select"
                }
            })
        }
        return a
    },
    onFlyout: function () {
        var a = this.getFlyoutItems();
        return new xds.Flyout({
            title: this.getNode().text,
            component: this,
            items: a
        })
    },
    getPanelHeader: function () {
        var a = this.getExtComponent();
        if (a.header && a.headerAsText) {
            return a.header.child("span")
        }
        return null
    },
    onFilmDblClick: function (a) {
        var b = this.getPanelHeader();
        if (b && b.getRegion().contains(a.getPoint())) {
            this.startTitleEdit(b)
        } else {
            xds.PanelBase.superclass.onFilmDblClick.call(this, a)
        }
    },
    startTitleEdit: function (a) {
        xds.canvas.startEdit(this, a || this.getPanelHeader(), this.getConfigObject("title"), 150)
    }
});
xds.types.FieldSet = Ext.extend(xds.Component, {
    cid: "fieldset",
    category: "Containers",
    defaultName: "&lt;fieldset&gt;",
    text: "FieldSet",
    dtype: "xdfieldset",
    xtype: "fieldset",
    xcls: "Ext.form.FieldSet",
    iconCls: "icon-fieldset",
    naming: "MyFieldSet",
    isContainer: true,
    defaultConfig: {
        title: "My Fields",
        layout: "form"
    },
    initConfig: function (b, a) {
        if (!a) {
            b.width = 400
        }
    },
    onFilmDblClick: function (b) {
        var a = this.getExtComponent();
        if (a.header && a.header.getRegion().contains(b.getPoint())) {
            xds.canvas.startEdit(this, a.header, this.getConfigObject("title"))
        } else {
            xds.types.Fieldset.superclass.onFilmDblClick.call(this, b)
        }
    },
    configs: [{
        name: "checkboxName",
        group: "Ext.form.FieldSet",
        ctype: "string"
    },
    {
        name: "checkboxToggle",
        group: "Ext.form.FieldSet",
        ctype: "boolean"
    },
    {
        name: "title",
        group: "Ext.form.FieldSet",
        ctype: "string"
    },
    {
        name: "animCollapse",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "autoScroll",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "baseCls",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "bodyStyle",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "collapsedCls",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "collapsible",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "html",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "maskDisabled",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "padding",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "autoDestroy",
        group: "Ext.Container",
        ctype: "boolean"
    },
    {
        name: "defaultType",
        group: "Ext.Container",
        ctype: "string"
    },
    {
        name: "hideBorders",
        group: "Ext.Container",
        ctype: "boolean"
    },
    {
        name: "layout",
        group: "Ext.Container",
        ctype: "string",
        editor: "options",
        options: xds.layouts
    },
    {
        name: "autoHeight",
        group: "Ext.BoxComponent",
        ctype: "boolean"
    },
    {
        name: "autoWidth",
        group: "Ext.BoxComponent",
        ctype: "boolean"
    },
    {
        name: "height",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageX",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageY",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "width",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "x",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "y",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "disabled",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "disabledClass",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "overCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "stateful",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }]
});
xds.Registry.register(xds.types.FieldSet);
xds.FieldSet = Ext.extend(Ext.form.FieldSet, {});
Ext.reg("xdfieldset", xds.FieldSet);
xds.types.Form = Ext.extend(xds.PanelBase, {
    cid: "form",
    defaultName: "&lt;form&gt;",
    text: "Form Panel",
    dtype: "xdform",
    xtype: "formpanel",
    xcls: "Ext.form.FormPanel",
    iconCls: "icon-form",
    naming: "MyForm",
    defaultConfig: {
        title: "My Form",
        labelWidth: 100,
        labelAlign: "left",
        layout: "form"
    },
    initConfig: function (b, a) {
        if (!a) {
            b.width = 400;
            b.height = 250;
            b.padding = "10px"
        }
    },
    configs: [{
        name: "formId",
        group: "Ext.form.FormPanel",
        ctype: "string"
    },
    {
        name: "itemCls",
        group: "Ext.form.FormPanel",
        ctype: "string"
    },
    {
        name: "labelAlign",
        group: "Ext.form.FormPanel",
        ctype: "string",
        editor: "options",
        options: ["left", "right", "top"],
        defaultValue: "left"
    },
    {
        name: "labelSeparator",
        group: "Ext.form.FormPanel",
        ctype: "string",
        defaultValue: ":"
    },
    {
        name: "labelWidth",
        group: "Ext.form.FormPanel",
        ctype: "number"
    },
    {
        name: "monitorPoll",
        group: "Ext.form.FormPanel",
        ctype: "number"
    },
    {
        name: "monitorValid",
        group: "Ext.form.FormPanel",
        ctype: "boolean"
    },
    {
        name: "animCollapse",
        group: "Ext.Panel",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "autoScroll",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "baseCls",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "bodyBorder",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "bodyStyle",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "border",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "buttonAlign",
        group: "Ext.Panel",
        ctype: "string",
        editor: "options",
        options: ["center", "left", "right"]
    },
    {
        name: "collapsedCls",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "collapsible",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "disabled",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "elements",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "footer",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "frame",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "header",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "headerAsText",
        group: "Ext.Panel",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "hideCollapseTool",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "html",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "iconCls",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "maskDisabled",
        group: "Ext.Panel",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "minButtonWidth",
        group: "Ext.Panel",
        ctype: "number"
    },
    {
        name: "padding",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "shadow",
        group: "Ext.Panel",
        ctype: "string",
        editor: "options",
        options: ["sides", "drop", "frame"]
    },
    {
        name: "shadowOffset",
        group: "Ext.Panel",
        ctype: "number"
    },
    {
        name: "tabTip",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "title",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "titleCollapse",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "unstyled",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "activeItem",
        group: "Ext.Container",
        ctype: "string"
    },
    {
        name: "autoDestroy",
        group: "Ext.Container",
        ctype: "boolean"
    },
    {
        name: "defaultType",
        group: "Ext.Container",
        ctype: "string"
    },
    {
        name: "hideBorders",
        group: "Ext.Container",
        ctype: "boolean"
    },
    {
        name: "layout",
        group: "Ext.Container",
        ctype: "string",
        editor: "options",
        options: xds.layouts
    },
    {
        name: "autoHeight",
        group: "Ext.BoxComponent",
        ctype: "boolean"
    },
    {
        name: "autoWidth",
        group: "Ext.BoxComponent",
        ctype: "boolean"
    },
    {
        name: "height",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageX",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageY",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "width",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "x",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "y",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "disabled",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "disabledClass",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "overCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "stateful",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }]
});
xds.Registry.register(xds.types.Form);
xds.FormPanel = Ext.extend(Ext.form.FormPanel, {});
Ext.reg("xdform", xds.FormPanel);
xds.types.Panel = Ext.extend(xds.PanelBase, {
    cid: "panel",
    defaultName: "&lt;panel&gt;",
    text: "Panel",
    dtype: "xdpanel",
    xtype: "panel",
    xcls: "Ext.Panel",
    iconCls: "icon-panel",
    naming: "MyPanel",
    defaultConfig: {
        title: "My Panel"
    },
    configs: [{
        name: "animCollapse",
        group: "Ext.Panel",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "autoScroll",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "baseCls",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "bodyBorder",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "bodyStyle",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "border",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "buttonAlign",
        group: "Ext.Panel",
        ctype: "string",
        editor: "options",
        options: ["center", "left", "right"],
        defaultValue: "right"
    },
    {
        name: "collapsedCls",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "collapsible",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "disabled",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "elements",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "footer",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "frame",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "header",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "headerAsText",
        group: "Ext.Panel",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "hideCollapseTool",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "html",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "iconCls",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "maskDisabled",
        group: "Ext.Panel",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "minButtonWidth",
        group: "Ext.Panel",
        ctype: "number"
    },
    {
        name: "padding",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "shadow",
        group: "Ext.Panel",
        ctype: "string",
        editor: "options",
        options: ["sides", "drop", "frame"]
    },
    {
        name: "shadowOffset",
        group: "Ext.Panel",
        ctype: "number"
    },
    {
        name: "tabTip",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "title",
        group: "Ext.Panel",
        ctype: "string",
        updateFn: "setTitle"
    },
    {
        name: "titleCollapse",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "unstyled",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "activeItem",
        group: "Ext.Container",
        ctype: "string"
    },
    {
        name: "autoDestroy",
        group: "Ext.Container",
        ctype: "boolean"
    },
    {
        name: "defaultType",
        group: "Ext.Container",
        ctype: "string"
    },
    {
        name: "hideBorders",
        group: "Ext.Container",
        ctype: "boolean"
    },
    {
        name: "layout",
        group: "Ext.Container",
        ctype: "string",
        editor: "options",
        options: xds.layouts
    },
    {
        name: "autoHeight",
        group: "Ext.BoxComponent",
        ctype: "boolean"
    },
    {
        name: "autoWidth",
        group: "Ext.BoxComponent",
        ctype: "boolean"
    },
    {
        name: "height",
        group: "Ext.BoxComponent",
        ctype: "number",
        updateFn: "setHeight"
    },
    {
        name: "pageX",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageY",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "width",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "x",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "y",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "disabled",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "disabledClass",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "overCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "stateful",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }]
});
xds.Registry.register(xds.types.Panel);
xds.Panel = Ext.extend(Ext.Panel, {});
Ext.reg("xdpanel", xds.Panel);
xds.types.TabPanel = Ext.extend(xds.PanelBase, {
    cid: "tabpanel",
    defaultName: "&lt;tabs&gt;",
    text: "TabPanel",
    dtype: "xdtabpanel",
    xtype: "tabpanel",
    xcls: "Ext.TabPanel",
    iconCls: "icon-tabs",
    naming: "MyTabs",
    layoutable: false,
    autoScrollable: false,
    defaultConfig: {
        activeTab: 0
    },
    configs: [{
        name: "activeTab",
        group: "Ext.TabPanel",
        ctype: "string",
        updateFn: "setActiveTab"
    },
    {
        name: "baseCls",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "bodyBorder",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "bodyStyle",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "border",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "buttonAlign",
        group: "Ext.Panel",
        ctype: "string",
        editor: "options",
        options: ["center", "left", "right"],
        defaultValue: "right"
    },
    {
        name: "collapsedCls",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "collapsible",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "disabled",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "maskDisabled",
        group: "Ext.Panel",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "minButtonWidth",
        group: "Ext.Panel",
        ctype: "number"
    },
    {
        name: "tabTip",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "unstyled",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "activeItem",
        group: "Ext.Container",
        ctype: "string"
    },
    {
        name: "autoDestroy",
        group: "Ext.Container",
        ctype: "boolean"
    },
    {
        name: "defaultType",
        group: "Ext.Container",
        ctype: "string"
    },
    {
        name: "hideBorders",
        group: "Ext.Container",
        ctype: "boolean"
    },
    {
        name: "autoHeight",
        group: "Ext.BoxComponent",
        ctype: "boolean"
    },
    {
        name: "autoWidth",
        group: "Ext.BoxComponent",
        ctype: "boolean"
    },
    {
        name: "height",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageX",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageY",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "width",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "x",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "y",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "disabled",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "disabledClass",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "overCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "stateful",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }],
    getFlyoutItems: function () {
        var a = xds.types.TabPanel.superclass.getFlyoutItems.call(this);
        var d = [],
        e = this;
        var g = this.getNode().childNodes;
        for (var b = 0, f; f = g[b]; b++) {
            if (!f.dock) {
                d.push(f.component.getConfigValue("title"))
            }
        }
        a.unshift({
            xtype: "flyoutselect",
            fieldLabel: "Active Item",
            data: d,
            bindTo: {
                component: this,
                name: "activeTab",
                event: "select",
                get: function () {
                    var c = e.getExtComponent();
                    var h = c.getActiveTab();
                    if (h) {
                        return d[c.items.indexOf(h)]
                    } else {
                        return d[0]
                    }
                },
                set: function (j) {
                    var i = d.indexOf(j.getValue());
                    var h = e.getConfigObject("activeTab");
                    h.setValue(e, i);
                    if (xds.active.component == e) {
                        xds.props.setValue("activeTab", i)
                    }
                }
            }
        });
        return a
    },
    getDefaultInternals: function () {
        return {
            cid: this.cid,
            cn: [{
                cid: "panel",
                userConfig: {
                    title: "Tab 1"
                }
            },
            {
                cid: "panel",
                userConfig: {
                    title: "Tab 2"
                }
            },
            {
                cid: "panel",
                userConfig: {
                    title: "Tab 3"
                }
            }]
        }
    },
    getTabTarget: function (d) {
        if (d.getTarget("b", 1)) {
            return false
        }
        var g = this.getExtComponent();
        if (g) {
            var k = d.getPoint();
            var f = g.stripWrap.getRegion();
            if (!f.contains(k)) {
                return
            }
            var j = g.stripWrap.dom.getElementsByTagName("li"),
            b = false;
            for (var a = 0, c = j.length - 1; a < c; a++) {
                var h = j[a];
                if (Ext.fly(h).getRegion().contains(k)) {
                    b = a;
                    break
                }
            }
            return b
        }
        return false
    },
    getTabComponent: function (b) {
        var e = 0;
        var d = this.getNode();
        for (var a = 0, c; c = d.childNodes[a]; a++) {
            if (!c.dock) {
                if (e === b) {
                    return c.component
                } else {
                    e++
                }
            }
        }
        return null
    },
    onFilmClick: function (d) {
        var b = this.getTabTarget(d);
        if (b !== false) {
            var a = this.getConfigObject("activeTab");
            a.setValue(this, b);
            if (xds.active && xds.active.component == this) {
                xds.props.setValue("activeTab", b)
            }
            var c = this.getTabComponent(b);
            if (c) {
                c.getNode().select();
                return false
            }
        }
    },
    onFilmDblClick: function (d) {
        var a = this.getTabTarget(d);
        if (a !== false) {
            var c = this.getTabComponent(a);
            var b = this.getExtComponent().getTabEl(a);
            xds.canvas.startEdit(c, b, c.getConfigObject("title"), 100)
        }
    }
});
xds.Registry.register(xds.types.TabPanel);
xds.TabPanel = Ext.extend(Ext.TabPanel, {});
Ext.reg("xdtabpanel", xds.TabPanel);
xds.types.Viewport = Ext.extend(xds.Component, {
    cid: "viewport",
    category: "Containers",
    defaultName: "&lt;viewport&gt;",
    text: "Viewport",
    dtype: "xdviewport",
    xtype: "viewport",
    xcls: "Ext.Viewport",
    iconCls: "icon-viewport",
    naming: "MyViewport",
    enableFlyout: true,
    isContainer: true,
    filmCls: "el-film-btn-overlap",
    isValidParent: function (a) {
        return !a
    },
    configs: [{
        name: "activeItem",
        group: "Ext.Container",
        ctype: "string"
    },
    {
        name: "autoDestroy",
        group: "Ext.Container",
        ctype: "boolean"
    },
    {
        name: "defaultType",
        group: "Ext.Container",
        ctype: "string"
    },
    {
        name: "hideBorders",
        group: "Ext.Container",
        ctype: "boolean"
    },
    {
        name: "layout",
        group: "Ext.Container",
        ctype: "string",
        editor: "options",
        options: xds.layouts
    },
    {
        name: "autoHeight",
        group: "Ext.BoxComponent",
        ctype: "boolean"
    },
    {
        name: "autoWidth",
        group: "Ext.BoxComponent",
        ctype: "boolean"
    },
    {
        name: "height",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageX",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageY",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "width",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "x",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "y",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "disabled",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "disabledClass",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "overCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "stateful",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }],
    onFlyout: function () {
        return new xds.Flyout({
            title: this.getNode().text,
            component: this,
            items: [{
                xtype: "flyoutselect",
                fieldLabel: "Select a layout",
                data: xds.layouts,
                bindTo: {
                    component: this,
                    name: "layout",
                    event: "select",
                    defaultValue: "auto"
                }
            }]
        })
    }
});
xds.Registry.register(xds.types.Viewport);
xds.Viewport = Ext.extend(Ext.Panel, {
    baseCls: "page",
    frame: true,
    initComponent: function () {
        xds.Viewport.superclass.initComponent.call(this)
    },
    onShow: function () {
        xds.Viewport.superclass.onShow.call(this);
        this.onCanvasResize();
        xds.canvas.on("resize", this.onCanvasResize, this)
    },
    onHide: function () {
        xds.Viewport.superclass.onHide.call(this);
        xds.canvas.un("resize", this.onCanvasResize, this)
    },
    onCanvasResize: function () {
        this.setSize(xds.canvas.body.getStyleSize())
    }
});
Ext.reg("xdviewport", xds.Viewport);
xds.types.Window = Ext.extend(xds.PanelBase, {
    cid: "window",
    defaultName: "&lt;window&gt;",
    text: "Window",
    dtype: "xdwindow",
    xtype: "window",
    xcls: "Ext.Window",
    iconCls: "icon-window",
    naming: "MyWindow",
    isValidParent: function (a) {
        return !a || a.cid == "viewport"
    },
    isResizable: function (a, b) {
        return true
    },
    defaultConfig: {
        title: "My Window",
        width: 400,
        height: 250
    },
    configs: [{
        name: "closable",
        group: "Ext.Window",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "closeAction",
        group: "Ext.Window",
        ctype: "string",
        editor: "options",
        options: ["close", "hide"],
        defaultValue: "close"
    },
    {
        name: "constrain",
        group: "Ext.Window",
        ctype: "boolean"
    },
    {
        name: "constrainHeader",
        group: "Ext.Window",
        ctype: "boolean"
    },
    {
        name: "draggable",
        group: "Ext.Window",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "maximizable",
        group: "Ext.Window",
        ctype: "boolean"
    },
    {
        name: "minHeight",
        group: "Ext.Window",
        ctype: "number",
        defaultValue: 100
    },
    {
        name: "minimizable",
        group: "Ext.Window",
        ctype: "boolean"
    },
    {
        name: "minWidth",
        group: "Ext.Window",
        ctype: "number",
        defaultValue: 200
    },
    {
        name: "modal",
        group: "Ext.Window",
        ctype: "boolean"
    },
    {
        name: "plain",
        group: "Ext.Window",
        ctype: "boolean"
    },
    {
        name: "resizable",
        group: "Ext.Window",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "autoScroll",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "bodyBorder",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "bodyStyle",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "border",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "buttonAlign",
        group: "Ext.Panel",
        ctype: "string",
        editor: "options",
        options: ["center", "left", "right"],
        defaultValue: "right"
    },
    {
        name: "collapsedCls",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "collapsible",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "disabled",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "elements",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "footer",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "hideCollapseTool",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "html",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "iconCls",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "maskDisabled",
        group: "Ext.Panel",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "minButtonWidth",
        group: "Ext.Panel",
        ctype: "number"
    },
    {
        name: "padding",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "shadow",
        group: "Ext.Panel",
        ctype: "string",
        editor: "options",
        options: ["sides", "drop", "frame"]
    },
    {
        name: "shadowOffset",
        group: "Ext.Panel",
        ctype: "number"
    },
    {
        name: "tabTip",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "title",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "titleCollapse",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "activeItem",
        group: "Ext.Container",
        ctype: "string"
    },
    {
        name: "autoDestroy",
        group: "Ext.Container",
        ctype: "boolean"
    },
    {
        name: "defaultType",
        group: "Ext.Container",
        ctype: "string"
    },
    {
        name: "hideBorders",
        group: "Ext.Container",
        ctype: "boolean"
    },
    {
        name: "layout",
        group: "Ext.Container",
        ctype: "string",
        editor: "options",
        options: xds.layouts
    },
    {
        name: "autoHeight",
        group: "Ext.BoxComponent",
        ctype: "boolean"
    },
    {
        name: "height",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageX",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageY",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "width",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "x",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "y",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "disabled",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "disabledClass",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "overCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "stateful",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }]
});
xds.Registry.register(xds.types.Window);
xds.Window = Ext.extend(Ext.Panel, {
    baseCls: "x-window",
    closable: true,
    elements: "header,body",
    frame: true,
    initEvents: function () {
        xds.Window.superclass.initEvents.call(this);
        if (this.minimizable) {
            this.addTool({
                id: "minimize"
            })
        }
        if (this.maximizable) {
            this.addTool({
                id: "maximize"
            })
        }
        if (this.closable) {
            this.addTool({
                id: "close"
            })
        }
    },
    onRender: function () {
        xds.Window.superclass.onRender.apply(this, arguments);
        if (this.plain) {
            this.el.addClass("x-window-plain")
        }
    }
});
Ext.reg("xdwindow", xds.Window);
xds.types.Button = Ext.extend(xds.Component, {
    cid: "button",
    category: "Standard",
    defaultName: "&lt;button&gt;",
    text: "Button",
    dtype: "xdbutton",
    xtype: "button",
    xcls: "Ext.Button",
    iconCls: "icon-button",
    naming: "MyButton",
    isContainer: true,
    filmCls: "el-film-nolabel",
    validChildTypes: ["menu"],
    defaultConfig: {
        text: "MyButton"
    },
    initConfig: function (b, a) {},
    configs: [{
        name: "allowDepress",
        group: "Ext.Button",
        ctype: "boolean"
    },
    {
        name: "arrowAlign",
        group: "Ext.Button",
        ctype: "string",
        editor: "options",
        options: ["bottom", "left", "right", "top"]
    },
    {
        name: "clickEvent",
        group: "Ext.Button",
        ctype: "string",
        editor: "options",
        options: ["click", "mousedown"]
    },
    {
        name: "enableToggle",
        group: "Ext.Button",
        ctype: "boolean"
    },
    {
        name: "iconAlign",
        group: "Ext.Button",
        ctype: "string",
        editor: "options",
        options: ["bottom", "left", "right", "top"]
    },
    {
        name: "iconCls",
        group: "Ext.Button",
        ctype: "string"
    },
    {
        name: "menuAlign",
        group: "Ext.Button",
        ctype: "string"
    },
    {
        name: "minWidth",
        group: "Ext.Button",
        ctype: "number"
    },
    {
        name: "pressed",
        group: "Ext.Button",
        ctype: "boolean"
    },
    {
        name: "repeat",
        group: "Ext.Button",
        ctype: "boolean"
    },
    {
        name: "scale",
        group: "Ext.Button",
        ctype: "string",
        editor: "options",
        options: ["small", "medium", "large"]
    },
    {
        name: "tabIndex",
        group: "Ext.Button",
        ctype: "number"
    },
    {
        name: "text",
        group: "Ext.Button",
        ctype: "string"
    },
    {
        name: "toggleGroup",
        group: "Ext.Button",
        ctype: "string"
    },
    {
        name: "tooltip",
        group: "Ext.Button",
        ctype: "string"
    },
    {
        name: "tooltipType",
        group: "Ext.Button",
        ctype: "string",
        editor: "options",
        options: ["title", "qtip"]
    },
    {
        name: "type",
        group: "Ext.Button",
        ctype: "string",
        editor: "options",
        options: ["button", "reset", "submit"]
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "disabled",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "disabledClass",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "overCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "stateful",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }],
    onFilmDblClick: function (b) {
        var a = this.getExtComponent();
        xds.canvas.startEdit(this, a.el.child(a.buttonSelector), this.getConfigObject("text"), 80)
    }
});
xds.Registry.register(xds.types.Button);
xds.Button = Ext.extend(Ext.Button, {});
Ext.reg("xdbutton", xds.Button);
xds.types.Label = Ext.extend(xds.Component, {
    cid: "label",
    category: "Standard",
    defaultName: "&lt;label&gt;",
    text: "Label",
    dtype: "xdlabel",
    xtype: "label",
    xcls: "Ext.form.Label",
    iconCls: "icon-label",
    naming: "MyLabel",
    filmCls: "el-film-nolabel",
    defaultConfig: {
        text: "Label:"
    },
    isResizable: function (a, b) {
        return a == "Right" && !this.getConfigValue("anchor") && (!this.owner || this.owner.getConfigValue("layout") != "form")
    },
    onFilmDblClick: function (b) {
        var a = this.getExtComponent();
        xds.canvas.startEdit(this, a.el, this.getConfigObject("text"))
    },
    configs: [{
        name: "forId",
        group: "Ext.form.Labl",
        ctype: "string"
    },
    {
        name: "html",
        group: "Ext.form.Labl",
        ctype: "string"
    },
    {
        name: "text",
        group: "Ext.form.Labl",
        ctype: "string"
    },
    {
        name: "autoHeight",
        group: "Ext.BoxComponent",
        ctype: "boolean"
    },
    {
        name: "autoWidth",
        group: "Ext.BoxComponent",
        ctype: "boolean"
    },
    {
        name: "height",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageX",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageY",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "width",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "x",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "y",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "disabled",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "disabledClass",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "overCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "stateful",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }]
});
xds.Registry.register(xds.types.Label);
xds.Label = Ext.extend(Ext.form.Label, {});
Ext.reg("xdlabel", xds.Label);
xds.types.Toolbar = Ext.extend(xds.Component, {
    cid: "toolbar",
    category: "Toolbar",
    defaultName: "&lt;toolbar&gt;",
    text: "Toolbar",
    dtype: "xdtoolbar",
    xtype: "toolbar",
    xcls: "Ext.Toolbar",
    iconCls: "icon-toolbar",
    naming: "MyToolbar",
    enableFlyout: true,
    isContainer: true,
    dock: "tbar",
    defaultConfig: {},
    initConfig: function (b, a) {
        if (!a) {
            b.width = 400
        }
    },
    configs: [{
        name: "autoDestroy",
        group: "Ext.Container",
        ctype: "boolean"
    },
    {
        name: "defaultType",
        group: "Ext.Container",
        ctype: "string"
    },
    {
        name: "height",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageX",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageY",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "width",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "x",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "y",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "disabled",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "disabledClass",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "overCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "stateful",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }],
    getEditorConfigs: function () {
        if (!this.owner) {
            return xds.types.Toolbar.superclass.getEditorConfigs.call(this)
        }
        return xds.dockConfigs
    },
    onFlyout: function () {
        return new xds.Flyout({
            title: this.getNode().text,
            component: this,
            items: [{
                xtype: "flyoutselect",
                fieldLabel: "Dock in parent",
                data: ["(none)", "tbar", "bbar", "fbar"],
                bindTo: {
                    component: this,
                    name: "dock",
                    event: "select",
                    defaultValue: "(none)",
                    clear: "(none)"
                }
            }]
        })
    },
    isValidParent: function (a) {
        return !a || a.getExtComponent().isXType("panel")
    }
});
xds.Registry.register(xds.types.Toolbar);
xds.Toolbar = Ext.extend(Ext.Toolbar, {
    afterRender: function () {
        if (!this.items || this.items.length < 1) {
            this.height = 27
        }
        xds.Toolbar.superclass.afterRender.call(this)
    }
});
Ext.reg("xdtoolbar", xds.Toolbar);
xds.types.ToolbarSeparator = Ext.extend(xds.Component, {
    cid: "tbseparator",
    category: "Toolbar",
    defaultName: "&lt;separator&gt;",
    text: "Separator",
    dtype: "xdtbseparator",
    xtype: "tbseparator",
    xcls: "Ext.Toolbar.Separator",
    iconCls: "icon-cmp",
    naming: "MySeparator",
    filmCls: "el-film-nolabel",
    isContainer: false,
    defaultConfig: {},
    configs: [{
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }]
});
xds.Registry.register(xds.types.ToolbarSeparator);
xds.ToolbarSeparator = Ext.extend(Ext.Toolbar.Separator, {});
Ext.reg("xdtbseparator", xds.ToolbarSeparator);
xds.types.ToolbarSpacer = Ext.extend(xds.Component, {
    cid: "tbspacer",
    category: "Toolbar",
    defaultName: "&lt;spacer&gt;",
    text: "Spacer",
    dtype: "xdtbspacer",
    xtype: "tbspacer",
    xcls: "Ext.Toolbar.Spacer",
    iconCls: "icon-cmp",
    naming: "MySpacer",
    filmCls: "el-film-nolabel",
    isContainer: false,
    defaultConfig: {},
    configs: [{
        name: "width",
        group: "Ext.Toolbar.Spacer",
        ctype: "number"
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }]
});
xds.Registry.register(xds.types.ToolbarSpacer);
xds.ToolbarSpacer = Ext.extend(Ext.Toolbar.Spacer, {});
Ext.reg("xdtbspacer", xds.ToolbarSpacer);
xds.types.ToolbarText = Ext.extend(xds.Component, {
    cid: "tbtext",
    category: "Toolbar",
    defaultName: "&lt;text&gt;",
    text: "Text Item",
    dtype: "xdtbtext",
    xtype: "tbtext",
    xcls: "Ext.Toolbar.TextItem",
    iconCls: "icon-cmp",
    naming: "MyText",
    filmCls: "el-film-nolabel",
    isContainer: false,
    defaultConfig: {
        text: "Text Item"
    },
    configs: [{
        name: "text",
        group: "Ext.Toolbar.TextItem",
        ctype: "string"
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }],
    onFilmDblClick: function (a) {
        xds.canvas.startEdit(this, this.getExtComponent().el, this.getConfigObject("text"), 80)
    }
});
xds.Registry.register(xds.types.ToolbarText);
xds.ToolbarText = Ext.extend(Ext.Toolbar.TextItem, {});
Ext.reg("xdtbtext", xds.ToolbarText);
xds.types.ToolbarFill = Ext.extend(xds.Component, {
    cid: "tbfill",
    category: "Toolbar",
    defaultName: "&lt;fill&gt;",
    text: "Fill",
    dtype: "xdtbfill",
    xtype: "tbfill",
    xcls: "Ext.Toolbar.Fill",
    iconCls: "icon-cmp",
    naming: "MyFill",
    filmCls: "el-film-nolabel",
    isContainer: false,
    defaultConfig: {},
    configs: [{
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }]
});
xds.Registry.register(xds.types.ToolbarFill);
xds.ToolbarFill = Ext.extend(Ext.Toolbar.Fill, {});
Ext.reg("xdtbfill", xds.ToolbarFill);
xds.types.GridPanel = Ext.extend(xds.PanelBase, {
    cid: "grid",
    category: "Grid",
    defaultName: "&lt;grid&gt;",
    text: "Grid Panel",
    dtype: "xdgrid",
    xtype: "grid",
    xcls: "Ext.grid.GridPanel",
    iconCls: "icon-grid",
    naming: "MyGrid",
    isContainer: true,
    autoScrollable: false,
    layoutable: false,
    enableFlyout: false,
    validChildTypes: ["gridcolumn", "booleancolumn", "numbercolumn", "datecolumn", "templatecolumn", "jsonstore", "arraystore", "xmlstore", "toolbar", "pagingtoolbar"],
    defaultConfig: {
        title: "My Grid",
        store: "(none)"
    },
    initConfig: function (b, a) {
        if (!a) {
            b.width = 400;
            b.height = 250
        }
    },
    isResizable: function (a, b) {
        return !this.isFit() && !this.isAnchored()
    },
    isValidChild: function (a) {
        return this.supr().isValidChild.apply(this, arguments)
    },
    configs: [{
        name: "autoExpandColumn",
        group: "Ext.grid.GridPanel",
        ctype: "string"
    },
    {
        name: "autoExpandMax",
        group: "Ext.grid.GridPanel",
        ctype: "number"
    },
    {
        name: "autoExpandMin",
        group: "Ext.grid.GridPanel",
        ctype: "number"
    },
    {
        name: "columnLines",
        group: "Ext.grid.GridPanel",
        ctype: "boolean"
    },
    {
        name: "deferRowRender",
        group: "Ext.grid.GridPanel",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "disableSelection",
        group: "Ext.grid.GridPanel",
        ctype: "boolean"
    },
    {
        name: "enableColumnHide",
        group: "Ext.grid.GridPanel",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "enableColumnMove",
        group: "Ext.grid.GridPanel",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "enableColumnResize",
        group: "Ext.grid.GridPanel",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "enableHdMenu",
        group: "Ext.grid.GridPanel",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "hideHeaders",
        group: "Ext.grid.GridPanel",
        ctype: "boolean"
    },
    {
        name: "loadMask",
        group: "Ext.grid.GridPanel",
        ctype: "boolean"
    },
    {
        name: "maxHeight",
        group: "Ext.grid.GridPanel",
        ctype: "number"
    },
    {
        name: "minColumnWidth",
        group: "Ext.grid.GridPanel",
        ctype: "number"
    },
    {
        name: "stripeRows",
        group: "Ext.grid.GridPanel",
        ctype: "boolean"
    },
    {
        name: "trackMouseOver",
        group: "Ext.grid.GridPanel",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "animCollapse",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "baseCls",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "border",
        group: "Ext.Panel",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "buttonAlign",
        group: "Ext.Panel",
        ctype: "string",
        editor: "options",
        options: ["center", "left", "right"]
    },
    {
        name: "collapsedCls",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "collapsible",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "disabled",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "elements",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "floating",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "footer",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "frame",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "header",
        group: "Ext.Panel",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "headerAsText",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "hideCollapseTool",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "iconCls",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "maskDisabled",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "minButtonWidth",
        group: "Ext.Panel",
        ctype: "number"
    },
    {
        name: "shadow",
        group: "Ext.Panel",
        ctype: "string",
        editor: "options",
        options: ["sides", "drop", "frame"]
    },
    {
        name: "shadowOffset",
        group: "Ext.Panel",
        ctype: "number"
    },
    {
        name: "tabTip",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "title",
        group: "Ext.Panel",
        ctype: "string"
    },
    {
        name: "titleCollapse",
        group: "Ext.Panel",
        ctype: "boolean"
    },
    {
        name: "autoHeight",
        group: "Ext.BoxComponent",
        ctype: "boolean"
    },
    {
        name: "height",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageX",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageY",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "width",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "x",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "y",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "disabled",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "disabledClass",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "overCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "stateful",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }],
    createCanvasConfig: function (h) {
        var g = Ext.apply({},
        this.getConfig());
        g.xtype = this.dtype;
        g.stateful = false;
        g.viewerNode = h;
        this.activeCmpId = g.id = Ext.id();
        g.cls = "x-panel-animated";
        g.columns = [];
        for (var e = 0, a = h.childNodes.length, b, f; e < a; e++) {
            f = h.childNodes[e].component;
            if (f.isStore) {
                g.store = f.createCanvasConfig(h.childNodes[e])
            } else { if (!this.assignDocked(g, f) && f.xtype != "toolbar") {
                    var d = f.getConfig();
                    d.xtype = f.xtype;
                    g.columns.push(d)
                }
            }
        }
        return g
    },
    getTargetColumnIndex: function (h) {
        var a = this.getExtComponent();
        if (a) {
            var n = h.getPoint();
            var l = a.view.mainHd.getRegion();
            if (!l.contains(n)) {
                return false
            }
            var m = n.left;
            var b = l.left;
            var j = a.colModel.config;
            var d = 0,
            f = false;
            for (var d = 0, g = j.length, k; k = j[d]; d++) {
                if (!k.hidden) {
                    b += k.width;
                    if (m <= b) {
                        f = d;
                        break
                    }
                }
            }
            return f
        }
        return false
    },
    getTargetColumn: function (a) {
        if (typeof a == "object") {
            a = this.getTargetColumnIndex(a)
        }
        if (a === false) {
            return null
        }
        var b = this.getColumnNodes();
        return b[a].component
    },
    onFilmClick: function (b) {
        var a = this.getTargetColumn(b);
        if (a) {
            a.getNode().select();
            return false
        }
    },
    onFilmDblClick: function (d) {
        var a = this.getTargetColumnIndex(d);
        if (a !== false) {
            var c = this.getExtComponent().view.getHeaderCell(a);
            var b = this.getTargetColumn(a);
            xds.canvas.startEdit(b, c, b.getConfigObject("header"))
        } else {
            xds.types.GridPanel.superclass.onFilmDblClick.call(this, d)
        }
    },
    getDefaultInternals: function () {
        return {
            cid: this.cid,
            cn: [{
                cid: "gridcolumn",
                userConfig: {
                    header: "Column 1",
                    dataIndex: "data1"
                }
            },
            {
                cid: "gridcolumn",
                userConfig: {
                    header: "Column 2",
                    dataIndex: "data2"
                }
            },
            {
                cid: "gridcolumn",
                userConfig: {
                    header: "Column 3",
                    dataIndex: "data3"
                }
            }]
        }
    },
    getActions: function () {
        if (!this.actions) {
            this.actions = [new Ext.Action({
                itemId: "auto-columns",
                text: "Auto columns",
                iconCls: "icon-auto-columns",
                handler: this.doAutoColumns,
                scope: this
            })]
        }
        return this.actions
    },
    getColumnNodes: function () {
        var f = this.getNode(),
        c = f.childNodes,
        d = [];
        for (var b = 0, a = c.length, e; e = c[b]; b++) {
            if (!e.component.dock && !e.component.isStore) {
                d.push(e)
            }
        }
        return d
    },
    getStoreNode: function () {
        var a = this.getNode().firstChild;
        while (a) {
            if (a.component.isStore) {
                return a
            }
            a = a.nextSibling
        }
        return null
    },
    doAutoColumns: function () {
        var k = this.getStoreNode(),
        b = this.getNode();
        if (!k) {
            Ext.Msg.alert("Warning", "Unable to read columns - no store has been defined.");
            return
        }
        xds.canvas.beginUpdate();
        var h = this.getColumnNodes();
        for (var d = 0, f; f = h[d]; d++) {
            f.parentNode.removeChild(f)
        }
        var e = k.childNodes;
        for (var d = 0, f; f = e[d]; d++) {
            var j = f.component,
            g = j.getConfigValue("type"),
            a = j.getConfigValue("name");
            switch (g) {
            case "int":
            case "float":
                xds.inspector.restore({
                    cid: "numbercolumn",
                    userConfig: {
                        header: a,
                        dataIndex: a
                    }
                },
                b);
                break;
            case "date":
                xds.inspector.restore({
                    cid: "datecolumn",
                    userConfig: {
                        header: a,
                        dataIndex: a
                    }
                },
                b);
                break;
            case "boolean":
                xds.inspector.restore({
                    cid: "booleancolumn",
                    userConfig: {
                        header: a,
                        dataIndex: a
                    }
                },
                b);
                break;
            default:
                xds.inspector.restore({
                    cid: "gridcolumn",
                    userConfig: {
                        header: a,
                        dataIndex: a
                    }
                },
                b);
                break
            }
        }
        xds.canvas.endUpdate();
        xds.fireEvent("componentchanged")
    }
});
xds.Registry.register(xds.types.GridPanel);
xds.GridPanel = Ext.extend(Ext.grid.GridPanel, {
    afterRender: function () {
        xds.GridPanel.superclass.afterRender.call(this);
        if (false && this.store && this.store.viewerNode) {
            this.createFloater(this.store.viewerNode.id, this.store.storeId, this.store.iconCls)
        }
    }
});
Ext.reg("xdgrid", xds.GridPanel);
xds.GridPanel.DefaultStore = new Ext.data.JsonStore({
    storeId: "(none)",
    fields: ["data1", "data2", "data3"],
    data: [{
        data1: "cell",
        data2: "cell",
        data3: "cell"
    },
    {
        data1: "cell",
        data2: "cell",
        data3: "cell"
    },
    {
        data1: "cell",
        data2: "cell",
        data3: "cell"
    }]
});
Ext.onReady(function () {
    xds.Config.editors.columns = new Ext.grid.GridEditor(new xds.MoreField({
        value: "(Collection)",
        setRawValue: function (a) {
            this.value = a
        },
        onMoreClick: function (b) {
            var a = new xds.ColumnWindow();
            a.component = xds.active.component;
            a.show(b.target)
        }
    }))
});
xds.StoreBase = Ext.extend(xds.Component, {
    category: "Data",
    defaultName: "&lt;store&gt;",
    naming: "MyStore",
    isVisual: false,
    isContainer: true,
    isStore: true,
    validChildTypes: ["datafield"],
    defaultConfig: {},
    initConfig: function (b, a) {
        b.storeId = this.id
    },
    setConfig: function (a, b) {
        xds.StoreBase.superclass.setConfig.call(this, a, b);
        this.reconfigure();
        if (a == "url" && this.actions) {
            this.actions[0][b ? "enable" : "disable"]();
            this.actions[0].initialConfig.disabled = !b
        }
    },
    reconfigure: function (d) {
        var b = xds.StoreCache.get(this.owner.id);
        var e = this.processConfig(b.viewerNode);
        e.cache = false;
        var a = this.createStore(e, false);
        b.reader = a.reader;
        b.proxy = a.proxy;
        if (b.proxy) {
            b.proxy.on("loadexception", this.onLoadException, this)
        }
        b.remoteSort = a.remoteSort;
        b.sortDir = a.sortDir;
        b.sortField = a.sortField;
        b.url = a.url;
        if (d !== false && b.dataCache) {
            b.loadData(b.dataCache)
        }
    },
    createCanvasConfig: function (d) {
        var a = xds.StoreCache.get(this.owner.id);
        if (!a) {
            var b = this.processConfig(d);
            b.viewerNode = d;
            b.component = this.owner;
            a = this.createStore(b, true)
        }
        return a
    },
    onLoadException: function () {
        xds.status.el.update("");
        Ext.Msg.alert("Error", "Unable to load data using the supplied configuration.");
        this.setSuffix("load error", "error")
    },
    processConfig: function (e) {
        var d = Ext.apply({},
        this.getConfig());
        d.xtype = this.xtype;
        d.fields = [];
        d.autoLoad = false;
        d.iconCls = this.iconCls;
        if (e.hasChildNodes()) {
            for (var b = 0, a = e.childNodes.length; b < a; b++) {
                d.fields.push(e.childNodes[b].component.getConfig())
            }
        }
        return d
    },
    getActions: function () {
        if (!this.actions) {
            var a = function (c) {
                var b = [];
                for (var d = 0; d < c; d++) {
                    xds.inspector.restore({
                        cid: "datafield"
                    },
                    this.getNode())
                }
            };
            this.actions = [new Ext.Action({
                itemId: "store-load",
                text: "Load data",
                iconCls: "icon-load",
                handler: function () {
                    var b = xds.StoreCache.get(this.owner.id);
                    delete b.dataCache;
                    b.reload()
                },
                scope: this,
                disabled: !this.getConfigValue("url")
            }), new Ext.Action({
                itemId: "quick-add",
                text: "Quick add",
                hideOnClick: false,
                menu: {
                    zIndex: 80001,
                    items: [{
                        text: "1 field",
                        handler: a.createDelegate(this, [1])
                    },
                    {
                        text: "2 fields",
                        handler: a.createDelegate(this, [2])
                    },
                    {
                        text: "3 fields",
                        handler: a.createDelegate(this, [3])
                    },
                    {
                        text: "4 fields",
                        handler: a.createDelegate(this, [4])
                    },
                    {
                        text: "5 fields",
                        handler: a.createDelegate(this, [5])
                    }]
                }
            })]
        }
        return this.actions
    },
    isValidParent: function (a) {
        if (a && a.getStoreNode) {
            return !a.getStoreNode()
        }
        return true
    }
});
xds.types.JsonStore = Ext.extend(xds.StoreBase, {
    cid: "jsonstore",
    text: "Json Store",
    xtype: "jsonstore",
    dtype: "jsonstore",
    xcls: "Ext.data.JsonStore",
    iconCls: "icon-json",
    createStore: function (a, c) {
        a = a || {};
        a.proxy = a.proxy || new Ext.data.HttpProxy(a);
        var b = new Ext.data.JsonStore(a);
        if (c) {
            b.on("beforeload", function () {
                if (!b.proxy.conn.url) {
                    Ext.Msg.alert("Warning", 'Could not load JsonStore, "url" has not been set.');
                    return false
                }
                if (b.dataCache) {
                    b.loadData(b.dataCache);
                    return false
                } else {
                    xds.status.el.update("Loading store...")
                }
            });
            b.on("load", function (d) {
                d.dataCache = d.reader.jsonData;
                xds.status.el.update("");
                this.setSuffix((d.data.length) + " records loaded", "loaded")
            },
            this);
            b.proxy.on("loadexception", this.onLoadException, this)
        }
        return b
    },
    configs: [{
        name: "idProperty",
        group: "Ext.data.JsonStore",
        ctype: "string"
    },
    {
        name: "root",
        group: "Ext.data.JsonStore",
        ctype: "string"
    },
    {
        name: "totalProperty",
        group: "Ext.data.JsonStore",
        ctype: "string"
    },
    {
        name: "autoLoad",
        group: "Ext.data.Store",
        ctype: "boolean"
    },
    {
        name: "remoteSort",
        group: "Ext.data.Store",
        ctype: "boolean"
    },
    {
        name: "sortDir",
        group: "Ext.data.Store",
        ctype: "string",
        editor: "options",
        options: ["ASC", "DESC"]
    },
    {
        name: "sortField",
        group: "Ext.data.Store",
        ctype: "string"
    },
    {
        name: "storeId",
        group: "Ext.data.Store",
        ctype: "string"
    },
    {
        name: "url",
        group: "Ext.data.Store",
        ctype: "string"
    }]
});
xds.Registry.register(xds.types.JsonStore);
xds.types.ArrayStore = Ext.extend(xds.StoreBase, {
    cid: "arraystore",
    text: "Array Store",
    xtype: "arraystore",
    dtype: "arraystore",
    xcls: "Ext.data.Store",
    iconCls: "icon-array",
    createStore: function (a, c) {
        a.reader = new Ext.data.ArrayReader({
            idIndex: a.idIndex,
            root: a.root,
            totalProperty: a.totalProperty
        },
        a.fields);
        var b = new Ext.data.Store(a);
        if (c) {
            b.on("beforeload", function () {
                if (!b.proxy.conn.url) {
                    Ext.Msg.alert("Warning", 'Could not load Array Store, "url" has not been set.');
                    return false
                }
                if (b.dataCache) {
                    b.loadData(b.dataCache);
                    return false
                } else {
                    xds.status.el.update("Loading store...")
                }
            });
            b.on("load", function () {
                b.dataCache = b.reader.arrayData;
                xds.status.el.update("");
                this.setSuffix((b.dataCache ? b.dataCache.length : 0) + " records loaded", "loaded")
            },
            this);
            if (b.proxy) {
                b.proxy.on("loadexception", this.onLoadException, this)
            }
        }
        return b
    },
    configs: [{
        name: "idIndex",
        group: "Ext.data.ArrayStore",
        ctype: "number"
    },
    {
        name: "root",
        group: "Ext.data.ArrayStore",
        ctype: "string"
    },
    {
        name: "totalProperty",
        group: "Ext.data.ArrayStore",
        ctype: "string"
    },
    {
        name: "autoLoad",
        group: "Ext.data.Store",
        ctype: "boolean"
    },
    {
        name: "remoteSort",
        group: "Ext.data.Store",
        ctype: "boolean"
    },
    {
        name: "sortDir",
        group: "Ext.data.Store",
        ctype: "string",
        editor: "options",
        options: ["ASC", "DESC"]
    },
    {
        name: "sortField",
        group: "Ext.data.Store",
        ctype: "string"
    },
    {
        name: "storeId",
        group: "Ext.data.Store",
        ctype: "string"
    },
    {
        name: "url",
        group: "Ext.data.Store",
        ctype: "string"
    }]
});
xds.Registry.register(xds.types.ArrayStore);
xds.types.XmlStore = Ext.extend(xds.StoreBase, {
    cid: "xmlstore",
    text: "Xml Store",
    xtype: "xmlstore",
    dtype: "xmlstore",
    xcls: "Ext.data.XmlStore",
    iconCls: "icon-xml",
    createStore: function (a, c) {
        a = a || {};
        a.proxy = a.proxy || new Ext.data.HttpProxy(a);
        var b = new Ext.data.XmlStore(a);
        if (c) {
            b.on("beforeload", function () {
                if (!b.proxy.conn.url) {
                    Ext.Msg.alert("Warning", 'Could not load XmlStore, "url" has not been set.');
                    return false
                }
                if (!b.reader.meta.record) {
                    Ext.Msg.alert("Warning", 'Could not load XmlStore, "record" has not been set.');
                    return false
                }
                if (b.dataCache) {
                    b.loadData(b.dataCache);
                    return false
                } else {
                    xds.status.el.update("Loading store...")
                }
            });
            b.on("load", function () {
                b.dataCache = b.reader.xmlData;
                xds.status.el.update("");
                this.setSuffix((b.data.length) + " records loaded", "loaded")
            },
            this);
            b.proxy.on("loadexception", this.onLoadException, this)
        }
        return b
    },
    configs: [{
        name: "idPath",
        group: "Ext.data.XmlStore",
        ctype: "string"
    },
    {
        name: "record",
        group: "Ext.data.XmlStore",
        ctype: "string"
    },
    {
        name: "totalRecords",
        group: "Ext.data.XmlStore",
        ctype: "string"
    },
    {
        name: "autoLoad",
        group: "Ext.data.Store",
        ctype: "boolean"
    },
    {
        name: "remoteSort",
        group: "Ext.data.Store",
        ctype: "boolean"
    },
    {
        name: "sortDir",
        group: "Ext.data.Store",
        ctype: "string",
        editor: "options",
        options: ["ASC", "DESC"]
    },
    {
        name: "sortField",
        group: "Ext.data.Store",
        ctype: "string"
    },
    {
        name: "storeId",
        group: "Ext.data.Store",
        ctype: "string"
    },
    {
        name: "url",
        group: "Ext.data.Store",
        ctype: "string"
    }]
});
xds.Registry.register(xds.types.XmlStore);
xds.FieldBase = Ext.extend(xds.Component, {
    category: "Form Fields",
    naming: "MyField",
    defaultConfig: {
        fieldLabel: "Label"
    },
    isResizable: function (a, b) {
        return a == "Right" && !this.isAnchored() && !this.isFit() && (!this.owner || this.owner.getConfigValue("layout") != "form")
    },
    initConfig: function (c, a) {
        var b = this.owner ? this.owner.getConfigValue("layout") : "";
        if (!a) {
            c.width = 200
        } else { if (b == "form" || b == "anchor" || b == "absolute") {
                c.anchor = "100%"
            }
        }
    }
});
xds.types.Checkbox = Ext.extend(xds.FieldBase, {
    cid: "checkbox",
    defaultName: "&lt;checkbox&gt;",
    text: "Checkbox",
    dtype: "xdcheckbox",
    xtype: "checkbox",
    xcls: "Ext.form.Checkbox",
    iconCls: "icon-checkbox",
    naming: "MyCheckbox",
    defaultConfig: {
        fieldLabel: "Label",
        boxLabel: "boxLabel"
    },
    configs: [{
        name: "boxLabel",
        group: "Ext.form.Checkbox",
        ctype: "string"
    },
    {
        name: "checked",
        group: "Ext.form.Checkbox",
        ctype: "boolean"
    },
    {
        name: "checkedCls",
        group: "Ext.form.Checkbox",
        ctype: "string"
    },
    {
        name: "inputValue",
        group: "Ext.form.Checkbox",
        ctype: "string"
    },
    {
        name: "mouseDownCls",
        group: "Ext.form.Checkbox",
        ctype: "string"
    },
    {
        name: "fieldClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "focusClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "inputType",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "invalidClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "invalidText",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "msgTarget",
        group: "Ext.form.Field",
        ctype: "string",
        editor: "options",
        options: ["qtip", "side", "title", "under"]
    },
    {
        name: "name",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "readOnly",
        group: "Ext.form.Field",
        ctype: "boolean"
    },
    {
        name: "tabIndex",
        group: "Ext.form.Field",
        ctype: "number"
    },
    {
        name: "validateOnBlur",
        group: "Ext.form.Field",
        ctype: "boolean"
    },
    {
        name: "validationEvent",
        group: "Ext.form.Field",
        ctype: "string",
        edtor: "options",
        options: ["keyup", "change", "blur"]
    },
    {
        name: "tabIndex",
        group: "Ext.form.Field",
        ctype: "number"
    },
    {
        name: "height",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageX",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageY",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "width",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "x",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "y",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "disabled",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "disabledClass",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "overCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "stateful",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }]
});
xds.Registry.register(xds.types.Checkbox);
xds.Checkbox = Ext.extend(Ext.form.Checkbox, {
    getFilmEl: xds.Component.getFilmEl
});
Ext.reg("xdcheckbox", xds.Checkbox);
xds.types.DateField = Ext.extend(xds.FieldBase, {
    cid: "datefield",
    defaultName: "&lt;dateField&gt;",
    text: "Date Field",
    dtype: "xddatefield",
    xtype: "datefield",
    xcls: "Ext.form.DateField",
    iconCls: "icon-datefield",
    naming: "MyField",
    configs: [{
        name: "altFormats",
        group: "Ext.form.DateField",
        ctype: "string"
    },
    {
        name: "format",
        group: "Ext.form.DateField",
        ctype: "string"
    },
    {
        name: "maxText",
        group: "Ext.form.DateField",
        ctype: "string"
    },
    {
        name: "maxValue",
        group: "Ext.form.DateField",
        ctype: "string"
    },
    {
        name: "minText",
        group: "Ext.form.DateField",
        ctype: "string"
    },
    {
        name: "minValue",
        group: "Ext.form.DateField",
        ctype: "string"
    },
    {
        name: "showToday",
        group: "Ext.form.DateField",
        ctype: "boolean"
    },
    {
        name: "allowBlank",
        group: "Ext.form.TextField",
        ctype: "boolean"
    },
    {
        name: "blankText",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "disableKeyFilter",
        group: "Ext.form.TextField",
        ctype: "boolean"
    },
    {
        name: "emptyClass",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "emptyText",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "maxLength",
        group: "Ext.form.TextField",
        ctype: "number"
    },
    {
        name: "maxLengthText",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "selectOnFocus",
        group: "Ext.form.TextField",
        ctype: "boolean"
    },
    {
        name: "vtype",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "vtypeText",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "fieldClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "focusClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "inputType",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "invalidClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "invalidText",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "msgTarget",
        group: "Ext.form.Field",
        ctype: "string",
        editor: "options",
        options: ["qtip", "side", "title", "under"]
    },
    {
        name: "name",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "readOnly",
        group: "Ext.form.Field",
        ctype: "boolean"
    },
    {
        name: "tabIndex",
        group: "Ext.form.Field",
        ctype: "number"
    },
    {
        name: "validateOnBlur",
        group: "Ext.form.Field",
        ctype: "boolean"
    },
    {
        name: "validationEvent",
        group: "Ext.form.Field",
        ctype: "string",
        edtor: "options",
        options: ["keyup", "change", "blur"]
    },
    {
        name: "tabIndex",
        group: "Ext.form.Field",
        ctype: "number"
    },
    {
        name: "height",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageX",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageY",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "width",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "x",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "y",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "disabled",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "disabledClass",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "overCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "stateful",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }]
});
xds.Registry.register(xds.types.DateField);
xds.DateField = Ext.extend(Ext.form.DateField, {
    getFilmEl: xds.Component.getFilmEl
});
Ext.reg("xddatefield", xds.DateField);
xds.types.HtmlEditor = Ext.extend(xds.FieldBase, {
    cid: "htmleditor",
    defaultName: "&lt;htmlEditor&gt;",
    text: "Html Editor",
    dtype: "xdhtmleditor",
    xtype: "htmleditor",
    xcls: "Ext.form.HtmlEditor",
    iconCls: "icon-html",
    defaultConfig: {
        anchor: "100%",
        fieldLabel: "Label",
        height: 150,
        width: 300
    },
    isResizable: function (a, b) {
        return !this.getConfigValue("anchor") && (!this.owner || this.owner.getConfigValue("layout") != "form")
    },
    configs: [{
        name: "createLinkText",
        group: "Ext.form.HtmlEditor",
        ctype: "string"
    },
    {
        name: "defaultLinkValue",
        group: "Ext.form.HtmlEditor",
        ctype: "string"
    },
    {
        name: "enableAlignments",
        group: "Ext.form.HtmlEditor",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "enableColors",
        group: "Ext.form.HtmlEditor",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "enableFont",
        group: "Ext.form.HtmlEditor",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "enableFontSize",
        group: "Ext.form.HtmlEditor",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "enableFormat",
        group: "Ext.form.HtmlEditor",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "enableLinks",
        group: "Ext.form.HtmlEditor",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "enableLists",
        group: "Ext.form.HtmlEditor",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "enableSourceEdit",
        group: "Ext.form.HtmlEditor",
        ctype: "boolean",
        defaultValue: true
    },
    {
        name: "name",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "tabIndex",
        group: "Ext.form.Field",
        ctype: "number"
    },
    {
        name: "height",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageX",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageY",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "width",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "x",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "y",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "disabled",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "disabledClass",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "overCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "stateful",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }]
});
xds.Registry.register(xds.types.HtmlEditor);
xds.HtmlEditor = Ext.extend(Ext.form.HtmlEditor, {
    getFilmEl: xds.Component.getFilmEl,
    createIFrame: function () {
        this.bogusFrame = this.wrap.createChild({
            cls: "xds-bogus-frame x-form-text"
        })
    },
    onResize: function (b, c) {
        Ext.form.HtmlEditor.superclass.onResize.apply(this, arguments);
        if (this.el && this.bogusFrame) {
            if (typeof b == "number") {
                var d = b - this.wrap.getFrameWidth("lr");
                this.el.setWidth(this.adjustWidth("textarea", d))
            }
            if (typeof c == "number") {
                var a = c - this.wrap.getFrameWidth("tb") - this.tb.el.getHeight();
                this.el.setHeight(this.adjustWidth("textarea", a));
                this.bogusFrame.dom.style.height = a + "px"
            }
        }
    }
});
Ext.reg("xdhtmleditor", xds.HtmlEditor);
xds.types.NumberField = Ext.extend(xds.FieldBase, {
    cid: "numberfield",
    defaultName: "&lt;numberField&gt;",
    text: "Number Field",
    dtype: "xdnumberfield",
    xtype: "numberfield",
    xcls: "Ext.form.NumberField",
    iconCls: "icon-numfield",
    configs: [{
        name: "allowDecimals",
        group: "Ext.form.NumberField",
        ctype: "boolean"
    },
    {
        name: "allowNegative",
        group: "Ext.form.NumberField",
        ctype: "boolean"
    },
    {
        name: "decimalPrecision",
        group: "Ext.form.NumberField",
        ctype: "number"
    },
    {
        name: "decimalSeparator",
        group: "Ext.form.NumberField",
        ctype: "string"
    },
    {
        name: "maxText",
        group: "Ext.form.NumberField",
        ctype: "string"
    },
    {
        name: "maxValue",
        group: "Ext.form.NumberField",
        ctype: "number"
    },
    {
        name: "minText",
        group: "Ext.form.NumberField",
        ctype: "string"
    },
    {
        name: "minValue",
        group: "Ext.form.NumberField",
        ctype: "number"
    },
    {
        name: "nanText",
        group: "Ext.form.NumberField",
        ctype: "string"
    },
    {
        name: "allowBlank",
        group: "Ext.form.TextField",
        ctype: "boolean"
    },
    {
        name: "blankText",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "disableKeyFilter",
        group: "Ext.form.TextField",
        ctype: "boolean"
    },
    {
        name: "emptyClass",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "emptyText",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "grow",
        group: "Ext.form.TextField",
        ctype: "boolean"
    },
    {
        name: "growMax",
        group: "Ext.form.TextField",
        ctype: "number"
    },
    {
        name: "growMin",
        group: "Ext.form.TextField",
        ctype: "number"
    },
    {
        name: "maxLength",
        group: "Ext.form.TextField",
        ctype: "number"
    },
    {
        name: "maxLengthText",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "selectOnFocus",
        group: "Ext.form.TextField",
        ctype: "boolean"
    },
    {
        name: "vtype",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "vtypeText",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "fieldClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "focusClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "inputType",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "invalidClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "invalidText",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "msgTarget",
        group: "Ext.form.Field",
        ctype: "string",
        editor: "options",
        options: ["qtip", "side", "title", "under"]
    },
    {
        name: "name",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "readOnly",
        group: "Ext.form.Field",
        ctype: "boolean"
    },
    {
        name: "tabIndex",
        group: "Ext.form.Field",
        ctype: "number"
    },
    {
        name: "validateOnBlur",
        group: "Ext.form.Field",
        ctype: "boolean"
    },
    {
        name: "validationEvent",
        group: "Ext.form.Field",
        ctype: "string",
        edtor: "options",
        options: ["keyup", "change", "blur"]
    },
    {
        name: "tabIndex",
        group: "Ext.form.Field",
        ctype: "number"
    },
    {
        name: "height",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageX",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageY",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "width",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "x",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "y",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "disabled",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "disabledClass",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "overCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "stateful",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }]
});
xds.Registry.register(xds.types.NumberField);
xds.NumberField = Ext.extend(Ext.form.NumberField, {
    getFilmEl: xds.Component.getFilmEl
});
Ext.reg("xdnumberfield", xds.NumberField);
xds.types.Radio = Ext.extend(xds.FieldBase, {
    cid: "radio",
    defaultName: "&lt;radio&gt;",
    text: "Radio",
    dtype: "xdradio",
    xtype: "radio",
    xcls: "Ext.form.Radio",
    iconCls: "icon-radio",
    naming: "MyRadio",
    defaultConfig: {
        fieldLabel: "Label",
        boxLabel: "boxLabel"
    },
    configs: [{
        name: "boxLabel",
        group: "Ext.form.Checkbox",
        ctype: "string"
    },
    {
        name: "checked",
        group: "Ext.form.Checkbox",
        ctype: "boolean"
    },
    {
        name: "checkedCls",
        group: "Ext.form.Checkbox",
        ctype: "string"
    },
    {
        name: "inputValue",
        group: "Ext.form.Checkbox",
        ctype: "string"
    },
    {
        name: "mouseDownCls",
        group: "Ext.form.Checkbox",
        ctype: "string"
    },
    {
        name: "fieldClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "focusClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "inputType",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "invalidClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "invalidText",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "msgTarget",
        group: "Ext.form.Field",
        ctype: "string",
        editor: "options",
        options: ["qtip", "side", "title", "under"]
    },
    {
        name: "name",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "readOnly",
        group: "Ext.form.Field",
        ctype: "boolean"
    },
    {
        name: "tabIndex",
        group: "Ext.form.Field",
        ctype: "number"
    },
    {
        name: "validateOnBlur",
        group: "Ext.form.Field",
        ctype: "boolean"
    },
    {
        name: "validationEvent",
        group: "Ext.form.Field",
        ctype: "string",
        edtor: "options",
        options: ["keyup", "change", "blur"]
    },
    {
        name: "tabIndex",
        group: "Ext.form.Field",
        ctype: "number"
    },
    {
        name: "height",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageX",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageY",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "width",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "x",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "y",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "disabled",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "disabledClass",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "overCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "stateful",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }]
});
xds.Registry.register(xds.types.Radio);
xds.Radio = Ext.extend(Ext.form.Radio, {
    getFilmEl: xds.Component.getFilmEl
});
Ext.reg("xdradio", xds.Radio);
xds.types.TextField = Ext.extend(xds.FieldBase, {
    cid: "textfield",
    defaultName: "&lt;textField&gt;",
    text: "Text Field",
    dtype: "xdtextfield",
    xtype: "textfield",
    xcls: "Ext.form.TextField",
    iconCls: "icon-textfield",
    configs: [{
        name: "allowBlank",
        group: "Ext.form.TextField",
        ctype: "boolean"
    },
    {
        name: "blankText",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "disableKeyFilter",
        group: "Ext.form.TextField",
        ctype: "boolean"
    },
    {
        name: "emptyClass",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "emptyText",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "grow",
        group: "Ext.form.TextField",
        ctype: "boolean"
    },
    {
        name: "growMax",
        group: "Ext.form.TextField",
        ctype: "number"
    },
    {
        name: "growMin",
        group: "Ext.form.TextField",
        ctype: "number"
    },
    {
        name: "maxLength",
        group: "Ext.form.TextField",
        ctype: "number"
    },
    {
        name: "maxLengthText",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "selectOnFocus",
        group: "Ext.form.TextField",
        ctype: "boolean"
    },
    {
        name: "vtype",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "vtypeText",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "fieldClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "focusClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "inputType",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "invalidClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "invalidText",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "msgTarget",
        group: "Ext.form.Field",
        ctype: "string",
        editor: "options",
        options: ["qtip", "side", "title", "under"]
    },
    {
        name: "name",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "readOnly",
        group: "Ext.form.Field",
        ctype: "boolean"
    },
    {
        name: "tabIndex",
        group: "Ext.form.Field",
        ctype: "number"
    },
    {
        name: "validateOnBlur",
        group: "Ext.form.Field",
        ctype: "boolean"
    },
    {
        name: "validationEvent",
        group: "Ext.form.Field",
        ctype: "string",
        edtor: "options",
        options: ["keyup", "change", "blur"]
    },
    {
        name: "tabIndex",
        group: "Ext.form.Field",
        ctype: "number"
    },
    {
        name: "height",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageX",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageY",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "width",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "x",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "y",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "disabled",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "disabledClass",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "overCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "stateful",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }]
});
xds.Registry.register(xds.types.TextField);
xds.TextField = Ext.extend(Ext.form.TextField, {
    getFilmEl: xds.Component.getFilmEl
});
Ext.reg("xdtextfield", xds.TextField);
xds.types.TextArea = Ext.extend(xds.FieldBase, {
    cid: "textarea",
    defaultName: "&lt;textArea&gt;",
    text: "Text Area",
    dtype: "xdtextarea",
    xtype: "textarea",
    xcls: "Ext.form.TextArea",
    iconCls: "icon-textarea",
    isResizable: function (a, b) {
        return !this.getConfigValue("anchor") && (!this.owner || this.owner.getConfigValue("layout") != "form")
    },
    configs: [{
        name: "preventScrollbars",
        group: "Ext.form.TextArea",
        ctype: "boolean"
    },
    {
        name: "allowBlank",
        group: "Ext.form.TextField",
        ctype: "boolean"
    },
    {
        name: "blankText",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "disableKeyFilter",
        group: "Ext.form.TextField",
        ctype: "boolean"
    },
    {
        name: "emptyClass",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "emptyText",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "grow",
        group: "Ext.form.TextField",
        ctype: "boolean"
    },
    {
        name: "growMax",
        group: "Ext.form.TextField",
        ctype: "number"
    },
    {
        name: "growMin",
        group: "Ext.form.TextField",
        ctype: "number"
    },
    {
        name: "maxLength",
        group: "Ext.form.TextField",
        ctype: "number"
    },
    {
        name: "maxLengthText",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "selectOnFocus",
        group: "Ext.form.TextField",
        ctype: "boolean"
    },
    {
        name: "vtype",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "vtypeText",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "fieldClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "focusClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "inputType",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "invalidClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "invalidText",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "msgTarget",
        group: "Ext.form.Field",
        ctype: "string",
        editor: "options",
        options: ["qtip", "side", "title", "under"]
    },
    {
        name: "name",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "readOnly",
        group: "Ext.form.Field",
        ctype: "boolean"
    },
    {
        name: "tabIndex",
        group: "Ext.form.Field",
        ctype: "number"
    },
    {
        name: "validateOnBlur",
        group: "Ext.form.Field",
        ctype: "boolean"
    },
    {
        name: "validationEvent",
        group: "Ext.form.Field",
        ctype: "string",
        edtor: "options",
        options: ["keyup", "change", "blur"]
    },
    {
        name: "tabIndex",
        group: "Ext.form.Field",
        ctype: "number"
    },
    {
        name: "height",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageX",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageY",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "width",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "x",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "y",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "disabled",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "disabledClass",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "overCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "stateful",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }]
});
xds.Registry.register(xds.types.TextArea);
xds.TextArea = Ext.extend(Ext.form.TextArea, {
    getFilmEl: xds.Component.getFilmEl
});
Ext.reg("xdtextarea", xds.TextArea);
xds.types.TimeField = Ext.extend(xds.FieldBase, {
    cid: "timefield",
    defaultName: "&lt;timeField&gt;",
    text: "Time Field",
    dtype: "xdtimefield",
    xtype: "timefield",
    xcls: "Ext.form.TimeField",
    iconCls: "icon-timefield",
    configs: [{
        name: "altFormats",
        group: "Ext.form.TimeField",
        ctype: "string"
    },
    {
        name: "format",
        group: "Ext.form.TimeField",
        ctype: "string"
    },
    {
        name: "increment",
        group: "Ext.form.TimeField",
        ctype: "number"
    },
    {
        name: "maxText",
        group: "Ext.form.TimeField",
        ctype: "string"
    },
    {
        name: "maxValue",
        group: "Ext.form.TimeField",
        ctype: "string"
    },
    {
        name: "minText",
        group: "Ext.form.TimeField",
        ctype: "string"
    },
    {
        name: "minValue",
        group: "Ext.form.TimeField",
        ctype: "string"
    },
    {
        name: "allowBlank",
        group: "Ext.form.TextField",
        ctype: "boolean"
    },
    {
        name: "blankText",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "disableKeyFilter",
        group: "Ext.form.TextField",
        ctype: "boolean"
    },
    {
        name: "emptyClass",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "emptyText",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "maxLength",
        group: "Ext.form.TextField",
        ctype: "number"
    },
    {
        name: "maxLengthText",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "selectOnFocus",
        group: "Ext.form.TextField",
        ctype: "boolean"
    },
    {
        name: "vtype",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "vtypeText",
        group: "Ext.form.TextField",
        ctype: "string"
    },
    {
        name: "fieldClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "focusClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "inputType",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "invalidClass",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "invalidText",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "msgTarget",
        group: "Ext.form.Field",
        ctype: "string",
        editor: "options",
        options: ["qtip", "side", "title", "under"]
    },
    {
        name: "name",
        group: "Ext.form.Field",
        ctype: "string"
    },
    {
        name: "readOnly",
        group: "Ext.form.Field",
        ctype: "boolean"
    },
    {
        name: "tabIndex",
        group: "Ext.form.Field",
        ctype: "number"
    },
    {
        name: "validateOnBlur",
        group: "Ext.form.Field",
        ctype: "boolean"
    },
    {
        name: "validationEvent",
        group: "Ext.form.Field",
        ctype: "string",
        edtor: "options",
        options: ["keyup", "change", "blur"]
    },
    {
        name: "tabIndex",
        group: "Ext.form.Field",
        ctype: "number"
    },
    {
        name: "height",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageX",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "pageY",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "width",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "x",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "y",
        group: "Ext.BoxComponent",
        ctype: "number"
    },
    {
        name: "cls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "ctCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "disabled",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "disabledClass",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "hideMode",
        group: "Ext.Component",
        ctype: "string",
        editor: "options",
        options: ["display", "offsets", "visibility"]
    },
    {
        name: "id",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "itemId",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "overCls",
        group: "Ext.Component",
        ctype: "string"
    },
    {
        name: "stateful",
        group: "Ext.Component",
        ctype: "boolean"
    },
    {
        name: "style",
        group: "Ext.Component",
        ctype: "string"
    }]
});
xds.Registry.register(xds.types.TimeField);
xds.TimeField = Ext.extend(Ext.form.TimeField, {
    getFilmEl: xds.Component.getFilmEl
});
Ext.reg("xdtimefield", xds.TimeField);
xds.ColumnBase = Ext.extend(xds.Component, {
    category: "Grid",
    defaultName: "&lt;column&gt;",
    naming: "MyColumn",
    isVisual: false,
    setConfig: function (a, b) {
        xds.ColumnBase.superclass.setConfig.call(this, a, b);
        if (a == "dataIndex") {
            var c = this.getConfigValue("id");
            this.setName(c ? c : (b || this.defaultName))
        }
    },
    defaultConfig: {
        header: "column",
        sortable: true,
        resizable: true,
        dataIndex: "",
        width: 100
    },
    initConfig: function (b, a) {}
});
xds.types.GridColumn = Ext.extend(xds.ColumnBase, {
    cid: "gridcolumn",
    text: "Grid Column",
    xtype: "gridcolumn",
    dtype: "xdgridcolumn",
    xcls: "Ext.grid.Column",
    iconCls: "icon-grid-column",
    configs: [{
        name: "align",
        group: "Ext.grid.Column",
        ctype: "string",
        editor: "options",
        options: ["center", "left", "right"]
    },
    {
        name: "css",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "dataIndex",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "fixed",
        group: "Ext.grid.Column",
        ctype: "boolean"
    },
    {
        name: "header",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.grid.Column",
        ctype: "boolean"
    },
    {
        name: "id",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "menuDisabled",
        group: "Ext.grid.Column",
        ctype: "boolean"
    },
    {
        name: "resizable",
        group: "Ext.grid.Column",
        ctype: "boolean"
    },
    {
        name: "tooltip",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "width",
        group: "Ext.grid.Column",
        ctype: "number"
    }]
});
xds.Registry.register(xds.types.GridColumn);
xds.types.BooleanColumn = Ext.extend(xds.ColumnBase, {
    cid: "booleancolumn",
    defaultName: "&lt;booleanColumn&gt;",
    text: "Boolean Column",
    xtype: "booleancolumn",
    dtype: "xdbooleancolumn",
    xcls: "Ext.grid.BooleanColumn",
    iconCls: "icon-grid-bool",
    configs: [{
        name: "align",
        group: "Ext.grid.Column",
        ctype: "string",
        editor: "options",
        options: ["center", "left", "right"]
    },
    {
        name: "css",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "dataIndex",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "fixed",
        group: "Ext.grid.Column",
        ctype: "boolean"
    },
    {
        name: "header",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.grid.Column",
        ctype: "boolean"
    },
    {
        name: "id",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "menuDisabled",
        group: "Ext.grid.Column",
        ctype: "boolean"
    },
    {
        name: "resizable",
        group: "Ext.grid.Column",
        ctype: "boolean"
    },
    {
        name: "tooltip",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "width",
        group: "Ext.grid.Column",
        ctype: "number"
    }]
});
xds.Registry.register(xds.types.BooleanColumn);
xds.types.NumberColumn = Ext.extend(xds.ColumnBase, {
    cid: "numbercolumn",
    defaultName: "&lt;numberColumn&gt;",
    text: "Number Column",
    xtype: "numbercolumn",
    dtype: "xdnumbercolumn",
    xcls: "Ext.grid.NumberColumn",
    iconCls: "icon-grid-num",
    defaultConfig: {
        header: "column",
        sortable: true,
        resizable: true,
        dataIndex: "",
        width: 100,
        format: "0,000.00"
    },
    configs: [{
        name: "align",
        group: "Ext.grid.Column",
        ctype: "string",
        editor: "options",
        options: ["center", "left", "right"]
    },
    {
        name: "css",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "dataIndex",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "fixed",
        group: "Ext.grid.Column",
        ctype: "boolean"
    },
    {
        name: "format",
        group: "Ext.grid.NumberColumn",
        ctype: "string"
    },
    {
        name: "header",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.grid.Column",
        ctype: "boolean"
    },
    {
        name: "id",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "menuDisabled",
        group: "Ext.grid.Column",
        ctype: "boolean"
    },
    {
        name: "resizable",
        group: "Ext.grid.Column",
        ctype: "boolean"
    },
    {
        name: "tooltip",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "width",
        group: "Ext.grid.Column",
        ctype: "number"
    }]
});
xds.Registry.register(xds.types.NumberColumn);
xds.types.DateColumn = Ext.extend(xds.ColumnBase, {
    cid: "datecolumn",
    defaultName: "&lt;dateColumn&gt;",
    text: "Date Column",
    xtype: "datecolumn",
    dtype: "xddatecolumn",
    xcls: "Ext.grid.DateColumn",
    iconCls: "icon-grid-date",
    defaultConfig: {
        header: "column",
        sortable: true,
        resizable: true,
        dataIndex: "",
        width: 100,
        format: "m/d/Y"
    },
    configs: [{
        name: "align",
        group: "Ext.grid.Column",
        ctype: "string",
        editor: "options",
        options: ["center", "left", "right"]
    },
    {
        name: "css",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "dataIndex",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "fixed",
        group: "Ext.grid.Column",
        ctype: "boolean"
    },
    {
        name: "format",
        group: "Ext.grid.DateColumn",
        ctype: "string"
    },
    {
        name: "header",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.grid.Column",
        ctype: "boolean"
    },
    {
        name: "id",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "menuDisabled",
        group: "Ext.grid.Column",
        ctype: "boolean"
    },
    {
        name: "resizable",
        group: "Ext.grid.Column",
        ctype: "boolean"
    },
    {
        name: "tooltip",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "width",
        group: "Ext.grid.Column",
        ctype: "number"
    }]
});
xds.Registry.register(xds.types.DateColumn);
xds.types.TemplateColumn = Ext.extend(xds.ColumnBase, {
    cid: "templatecolumn",
    defaultName: "&lt;templateColumn&gt;",
    text: "Template Column",
    xtype: "templatecolumn",
    dtype: "xdtemplatecolumn",
    xcls: "Ext.grid.TemplateColumn",
    iconCls: "icon-grid-tpl",
    defaultConfig: {
        header: "column",
        sortable: true,
        resizable: true,
        dataIndex: "",
        width: 100,
        tpl: ""
    },
    configs: [{
        name: "align",
        group: "Ext.grid.Column",
        ctype: "string",
        editor: "options",
        options: ["center", "left", "right"]
    },
    {
        name: "css",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "dataIndex",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "fixed",
        group: "Ext.grid.Column",
        ctype: "boolean"
    },
    {
        name: "tpl",
        group: "Ext.grid.TemplateColumn",
        ctype: "string"
    },
    {
        name: "header",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "hidden",
        group: "Ext.grid.Column",
        ctype: "boolean"
    },
    {
        name: "id",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "menuDisabled",
        group: "Ext.grid.Column",
        ctype: "boolean"
    },
    {
        name: "resizable",
        group: "Ext.grid.Column",
        ctype: "boolean"
    },
    {
        name: "tooltip",
        group: "Ext.grid.Column",
        ctype: "string"
    },
    {
        name: "width",
        group: "Ext.grid.Column",
        ctype: "number"
    }]
});
xds.Registry.register(xds.types.TemplateColumn);
xds.types.DataField = Ext.extend(xds.Component, {
    cid: "datafield",
    category: "Data",
    name: "DataField",
    text: "Data Field",
    xtype: "datafield",
    dtype: "xddatafield",
    xcls: "Ext.data.DataField",
    iconCls: "icon-data-field",
    naming: "MyField",
    isVisual: false,
    defaultConfig: {
        name: "field",
        type: "auto"
    },
    initConfig: function (b, a) {
        b.storeId = this.id
    },
    setConfig: function (a, b) {
        this.supr().setConfig.call(this, a, b);
        this.owner.reconfigure()
    },
    configs: [{
        name: "dateFormat",
        group: "Ext.data.DataField",
        ctype: "string"
    },
    {
        name: "mapping",
        group: "Ext.data.DataField",
        ctype: "string"
    },
    {
        name: "name",
        group: "Ext.data.DataField",
        ctype: "string"
    },
    {
        name: "sortDir",
        group: "Ext.data.DataField",
        ctype: "string",
        editor: "options",
        options: ["ASC", "DESC"]
    },
    {
        name: "sortType",
        group: "Ext.data.DataField",
        ctype: "string"
    },
    {
        name: "type",
        group: "Ext.data.DataField",
        ctype: "string",
        editor: "options",
        options: ["auto", "boolean", "date", "float", "int", "string"]
    }]
});
xds.Registry.register(xds.types.DataField);
xds.File = function () {
    return {
        saveProject: function (c, a, b) {},
        saveProjectAs: function (c, a, b) {},
        openProject: function (a, b) {},
        getComponents: function (a, b) {},
        saveUserComponent: function (b, a, c) {},
        removeUserComponent: function (b, a, c) {},
        setTitle: function (a) {}
    }
} ();
Ext.onReady(function () {
    Ext.QuickTips.init();
    Ext.QuickTips.getQuickTip().el.setZIndex(70000);
    xds.project = new xds.Project();
    var d = new Ext.Toolbar({
        items: [xds.actions.newAction, "-", xds.actions.newCmpAction, xds.actions.deleteCmpAction, {
            id: "csep",
            xtype: "tbseparator",
            hidden: true
        }]
    });
    var c = new xds.Toolbox();
    var b = new xds.Inspector();
    xds.props = new xds.ConfigEditor();
    xds.east = new Ext.Panel({
        id: "east",
        width: 240,
        region: "east",
        minWidth: 150,
        split: true,
        margins: "0",
        cmargins: "2 1 1 5",
        baseCls: "x-plain",
        layout: "border",
        items: [b, xds.props]
    });
    var e = new xds.Canvas();
    xds.on("componentselect", function (j) {
        if (j.component) {
            var i = xds.active;
            xds.props.enable();
            xds.active = j;
            xds.props.refresh();
            if (!i || j.topNode != i.topNode) {
                e.setComponent(j.topNode)
            }
        } else {
            xds.props.disable();
            xds.active = null;
            xds.props.refresh()
        }
    });
    xds.on("componentchanged", function () {
        if (xds.active) {
            e.setComponent(xds.active.topNode)
        }
    });
    var g = new Ext.Toolbar({
        id: "status",
        region: "south",
        height: 24,
        items: [{
            id: "xdstatus",
            xtype: "tbtext",
            text: "&nbsp;"
        }]
    });
    var a = new Ext.Viewport({
        layout: "border",
        items: [{
            id: "tools",
            baseCls: "x-plain",
            region: "north",
            height: 26,
            items: [d]
        },
        xds.east, c, e, g]
    });
    xds.status = Ext.getCmp("xdstatus");
    xds.fireEvent("init");
    var f;
    var h = function () {
        if (f) {
            for (var k = 0, j = f.length; k < j; k++) {
                d.remove(f[k].itemId)
            }
            f = null
        }
    };
    xds.on("componentselect", function (m) {
        var k = d.items.get("csep");
        if (m.component) {
            xds.actions.deleteCmpAction.enable();
            h();
            var n = m.component.getActions();
            if (n) {
                k.show();
                for (var l = 0, j = n.length; l < j; l++) {
                    d.add(n[l])
                }
                d.doLayout()
            } else {
                k.hide()
            }
            f = n
        } else {
            xds.actions.deleteCmpAction.disable();
            k.hide();
            h()
        }
    })
});