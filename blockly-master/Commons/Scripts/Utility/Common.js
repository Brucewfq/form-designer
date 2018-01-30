﻿function DataAccess(a, b, c) { this.params = {}; this.url = ""; this.method = "GET"; if (b) { this.params = b } if (a) { this.url = a } if (c) { this.method = c } this.Request = function () { Ext.Ajax.request({ url: this.url, params: this.params, method: this.method, success: this.success, failure: this.failure }) }; this.success = function (d, e) { return d.responseXML.xml }; this.failure = function (d, f) { var e = {}; e.message = "error:server return a Exception."; e.detail = d.responseText } } function rmbMoney(a) { a = (Math.round((a - 0) * 100)) / 100; a = (a == Math.floor(a)) ? a + ".00" : ((a * 10 == Math.floor(a * 10)) ? a + "0" : a); a = String(a); var e = a.split("."); var d = e[0]; var b = e[1] ? "." + e[1] : ".00"; var c = /(\d+)(\d{3})/; while (c.test(d)) { d = d.replace(c, "$1,$2") } a = d + b; if (a.charAt(0) == "-") { return "-\uffe5" + a.substr(1) } return "\uffe5" + a } function RMBMoney(w) { var c = 99999999999.99; var A = "\u96f6"; var E = "\u58f9"; var j = "\u8d30"; var k = "\u53c1"; var m = "\u8086"; var G = "\u4f0d"; var D = "\u9646"; var z = "\u67d2"; var I = "\u634c"; var B = "\u7396"; var g = "\u62fe"; var o = "\u4f70"; var s = "\u4edf"; var f = "\u4e07"; var h = "\u4ebf"; var y = "\u4eba\u6c11\u5e01"; var v = "\u5143"; var e = "\u89d2"; var t = "\u5206"; var x = "\u6574"; var b; var L; var u; var H; var J, n, r, q; var a; var F, C, K; var M, l; w = w.toString(); if (w == "") { alert("Empty input!"); return "" } if (w.match(/[^,.\d]/) != null) { alert("Invalid characters in the input string!"); return "" } if ((w).match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/) == null) { alert("Illegal format of digit number!"); return "" } w = w.replace(/,/g, ""); w = w.replace(/^0+/, ""); if (Number(w) > c) { alert("Too large a number to convert!"); return "" } H = w.split("."); if (H.length > 1) { b = H[0]; L = H[1]; L = L.substr(0, 2) } else { b = H[0]; L = "" } J = new Array(A, E, j, k, m, G, D, z, I, B); n = new Array("", g, o, s); r = new Array("", f, h); q = new Array(e, t); u = ""; if (Number(b) > 0) { a = 0; for (F = 0; F < b.length; F++) { C = b.length - F - 1; K = b.substr(F, 1); M = C / 4; l = C % 4; if (K == "0") { a++ } else { if (a > 0) { u += J[0] } a = 0; u += J[Number(K)] + n[l] } if (l == 0 && a < 4) { u += r[M] } } u += v } if (L != "") { for (F = 0; F < L.length; F++) { K = L.substr(F, 1); if (K != "0") { u += J[Number(K)] + q[F] } } } if (u == "") { u = A + v } if (L == "") { u += x } u = y + u; return u } function XmlDocument(b) { var a; if (window.ActiveXObject) { a = new ActiveXObject("MSXML2.DOMDocument.3.0") } else { a = document.implementation.createDocument("", "", null) } return a } function myBool(a) { if (a) { if (a.toLowerCase() == "true") { return true } else { if (a.toLowerCase() == "false") { return false } } } return Boolean(a) } function CreateDefineXmlByRecordDefine(g) { var f = XmlDocument(); var l = f.createElement("Columns"); for (var e = 0; e < g.prototype.fields.items.length; e++) { var d = g.prototype.fields.items[e]; var m = f.createElement("Column"); var c = f.createElement("name"); var k = f.createElement("defaultValue"); var a = f.createElement("mapping"); var b = f.createElement("dateFormat"); var j = f.createElement("sortDir"); var h = f.createElement("type"); c.text = d.name; k.text = d.defaultValue; if (d.mapping != null) { a.text = d.mapping } else { a.text = "null" } if (d.dateFormat != null) { b.text = d.dateFormat } else { b.text = "null" } j.text = d.sortDir; h.text = d.type; m.appendChild(c); m.appendChild(k); m.appendChild(a); m.appendChild(b); m.appendChild(j); m.appendChild(h); l.appendChild(m) } f.appendChild(l); return f.xml } function GetRecordDefineByDefineXml(d) { var g = []; var a = new XmlDocument(); a.loadXML(d); var f = a.selectNodes("//Column"); for (var b = 0; b < f.length; b++) { var e = {}; if (f[b].selectSingleNode("name") != null && f[b].selectSingleNode("name").text != "") { e.name = f[b].selectSingleNode("name").text } if (f[b].selectSingleNode("defaultValue") != null && f[b].selectSingleNode("defaultValue").text != "") { e.defaultValue = f[b].selectSingleNode("defaultValue").text } if (f[b].selectSingleNode("mapping") != null && f[b].selectSingleNode("mapping").text != "") { e.mapping = f[b].selectSingleNode("mapping").text } if (f[b].selectSingleNode("dateFormat") != null && f[b].selectSingleNode("dateFormat").text != "") { e.dateFormat = f[b].selectSingleNode("dateFormat").text } if (f[b].selectSingleNode("sortDir") != null && f[b].selectSingleNode("sortDir").text != "") { e.sortDir = f[b].selectSingleNode("sortDir").text } if (f[b].selectSingleNode("type") != null && f[b].selectSingleNode("type").text != "") { e.type = f[b].selectSingleNode("type").text } g.push(e) } var c = Ext.data.Record.create(g); return c } function CreateBlankRecord(XmlColDefine) { var xdoc = new XmlDocument(); xdoc.loadXML(XmlColDefine); var cols = xdoc.selectNodes("//Column"); var defaultdata = "{"; for (var i = 0; i < cols.length; i++) { var colname = ""; var defaultvalue = ""; if (cols[i].selectSingleNode("name")) { colname = cols[i].selectSingleNode("name").text } if (cols[i].selectSingleNode("defaultValue")) { defaultvalue = cols[i].selectSingleNode("defaultValue").text } if (i > 0) { defaultdata += "," } defaultdata += colname + ":'" + defaultvalue + "'" } defaultdata += "}"; defaultdata = eval("(" + defaultdata + ")"); var RecordDefine = GetRecordDefineByDefineXml(XmlColDefine); var newrow = new RecordDefine(defaultdata); return newrow } function GenerateXmlByRecord(e, d, l) { var j = new XmlDocument(); var f = e.selectSingleNode("/"); e.setAttribute("id", l.id); j.loadXML(d); var g = j.selectNodes("//Column"); for (var c = 0; c < g.length; c++) { var a = g[c].selectSingleNode("name").text; var h = l.data[a]; if (h == null) { h = "" } var k = f.selectSingleNode("/"); var b = k.createElement(a); b.text = h; e.appendChild(b) } } function GenerateXmlByStore(d, g, c) { var a = d.selectSingleNode("/"); d.setAttribute("id", c.id); for (var e = 0; e < c.data.items.length; e++) { var b = c.data.items[e]; var f = a.createElement("Table"); d.appendChild(f); GenerateXmlByRecord(f, g, b) } } function GenerateRecordByXml(e, j) { var k = new XmlDocument(); k.loadXML(j); var m = k.selectNodes("//Column"); var b; if (e.selectSingleNode("@id")) { b = e.selectSingleNode("@id").value } var o = new Array(); var f = {}; for (var g = 0; g < m.length; g++) { var h = ""; var a = ""; var l = ""; if (m[g].selectSingleNode("name") != null) { h = m[g].selectSingleNode("name").text } if (m[g].selectSingleNode("mapping") != null) { a = m[g].selectSingleNode("mapping").text } if (m[g].selectSingleNode("type") != null) { l = m[g].selectSingleNode("type").text } var n = ""; if (a == null || a == "") { n = e.selectSingleNode(h).text } else { if (e.selectSingleNode(a) == null) { if (n = e.selectSingleNode(h)) { n = e.selectSingleNode(h).text } else { n = "" } } else { n = e.selectSingleNode(a).text } } if (l == "date") { var d = new Date(); d = Date.parseDate(n, "Y-m-d"); n = d } f[h] = n } var c = GetRecordDefineByDefineXml(j); var p = new c(f); if (b) { p.id = b } return p } function GenerateStoreByXml(d, g) { var b = d.selectNodes("Table"); var c = {}; if (d.selectSingleNode("@id")) { c.id = d.selectSingleNode("@id").value } var j = d.selectSingleNode("@id").value; var h = new Ext.data.XmlReader({ root: "Table" }, GetRecordDefineByDefineXml(g)); c.reader = h; var a = new Ext.data.Store(c); for (var e = 0; e < b.length; e++) { var f = GenerateRecordByXml(b[e], g); a.add(f) } return a } function GenerateStoreByXml2(d, h) { var b = d.selectNodes("Table"); var c = {}; if (d.selectSingleNode("@id")) { c.id = d.selectSingleNode("@id").value } var g = CreateDefineXmlByRecordDefine(h); var j = new Ext.data.XmlReader({ root: "Table" }, h); c.reader = j; var a = new Ext.data.Store(c); for (var e = 0; e < b.length; e++) { var f = GenerateRecordByXml(b[e], g); a.add(f) } return a } function GenerateTextFieldConfigByXmlDefine(a, d) { var b = d.selectSingleNode("Attributes"); var c = {}; if (d.getAttribute("id")) { c.id = a + "_" + d.getAttribute("id") } if (b.selectSingleNode("fieldIndex") != null && b.selectSingleNode("fieldIndex").text != "") { c.fieldIndex = b.selectSingleNode("fieldIndex").text } if (b.selectSingleNode("fieldLabel") != null && b.selectSingleNode("fieldLabel").text != "") { c.fieldLabel = b.selectSingleNode("fieldLabel").text } if (b.selectSingleNode("grow") != null && b.selectSingleNode("grow").text != "") { c.grow = myBool(b.selectSingleNode("grow").text) } if (b.selectSingleNode("growMin") != null && b.selectSingleNode("growMin").text != "") { c.growMin = parseInt(b.selectSingleNode("growMin").text) } if (b.selectSingleNode("growMax") != null && b.selectSingleNode("growMax").text != "") { c.growMax = parseInt(b.selectSingleNode("growMax").text) } if (b.selectSingleNode("vtype") != null && b.selectSingleNode("vtype").text != "") { c.vtype = b.selectSingleNode("vtype").text } if (b.selectSingleNode("allowBlank") != null && b.selectSingleNode("allowBlank").text != "") { c.allowBlank = myBool(b.selectSingleNode("allowBlank").text) } if (b.selectSingleNode("minLength") != null && b.selectSingleNode("minLength").text != "") { c.minLength = parseInt(b.selectSingleNode("minLength").text) } if (b.selectSingleNode("maxLength") != null && b.selectSingleNode("maxLength").text != "") { c.maxLength = parseInt(b.selectSingleNode("maxLength").text) } if (b.selectSingleNode("minLengthText") != null && b.selectSingleNode("minLengthText").text != "") { c.minLengthText = b.selectSingleNode("minLengthText").text } if (b.selectSingleNode("maxLengthText") != null && b.selectSingleNode("maxLengthText").text != "") { c.maxLengthText = b.selectSingleNode("maxLengthText").text } if (b.selectSingleNode("selectOnFocus") != null && b.selectSingleNode("selectOnFocus").text != "") { c.selectOnFocus = myBool(b.selectSingleNode("selectOnFocus").text) } if (b.selectSingleNode("queryParam") != null && b.selectSingleNode("queryParam").text != "") { c.queryParam = b.selectSingleNode("queryParam").text } if (b.selectSingleNode("loadingText") != null && b.selectSingleNode("loadingText").text != "") { c.loadingText = b.selectSingleNode("loadingText").text } if (b.selectSingleNode("blankText") != null && b.selectSingleNode("blankText").text != "") { c.blankText = b.selectSingleNode("blankText").text } if (b.selectSingleNode("emptyText") != null && b.selectSingleNode("emptyText").text != "") { c.emptyText = b.selectSingleNode("emptyText").text } if (b.selectSingleNode("invalidText") != null && b.selectSingleNode("invalidText").text != "") { c.invalidText = b.selectSingleNode("invalidText").text } if (b.selectSingleNode("validateOnBlur") != null && b.selectSingleNode("validateOnBlur").text != "") { c.validateOnBlur = myBool(b.selectSingleNode("validateOnBlur").text) } if (b.selectSingleNode("validationDelay") != null && b.selectSingleNode("validationDelay").text != "") { c.validationDelay = parseInt(b.selectSingleNode("validationDelay").text) } if (b.selectSingleNode("msgTarget") != null && b.selectSingleNode("msgTarget").text != "") { c.msgTarget = b.selectSingleNode("msgTarget").text } if (b.selectSingleNode("readOnly") != null && b.selectSingleNode("readOnly").text != "") { c.readOnly = myBool(b.selectSingleNode("readOnly").text) } if (b.selectSingleNode("disabled") != null && b.selectSingleNode("disabled").text != "") { c.disabled = myBool(b.selectSingleNode("disabled").text) } if (b.selectSingleNode("inputType") != null && b.selectSingleNode("inputType").text != "") { c.inputType = b.selectSingleNode("inputType").text } if (b.selectSingleNode("height") != null && b.selectSingleNode("height").text != "") { c.height = parseInt(b.selectSingleNode("height").text) } if (b.selectSingleNode("width") != null && b.selectSingleNode("width").text != "") { c.width = parseInt(b.selectSingleNode("width").text) } if (b.selectSingleNode("renderTo") != null && b.selectSingleNode("renderTo").text != "") { c.willrenderTo = b.selectSingleNode("renderTo").text } return c } function GenerateComboboxConfigByXmlDefine(a, d) { var c = GenerateTextFieldConfigByXmlDefine(a, d); var b = d.selectSingleNode("Attributes"); if (b.selectSingleNode("DatSourceUrl") != null && b.selectSingleNode("DatSourceUrl").text != "") { c.DatSourceUrl = b.selectSingleNode("DatSourceUrl").text } if (b.selectSingleNode("transform") != null && b.selectSingleNode("transform").text != "") { c.transform = b.selectSingleNode("transform").text } if (b.selectSingleNode("lazyRender") != null && b.selectSingleNode("lazyRender").text != "") { c.lazyRender = myBool(b.selectSingleNode("lazyRender").text) } if (b.selectSingleNode("title") != null && b.selectSingleNode("title").text != "") { c.title = b.selectSingleNode("title").text } if (b.selectSingleNode("listWidth") != null && b.selectSingleNode("listWidth").text != "") { c.listWidth = parseInt(b.selectSingleNode("listWidth").text) } if (b.selectSingleNode("displayField") != null && b.selectSingleNode("displayField").text != "") { c.displayField = b.selectSingleNode("displayField").text } if (b.selectSingleNode("valueField") != null && b.selectSingleNode("valueField").text != "") { c.valueField = b.selectSingleNode("valueField").text } if (b.selectSingleNode("maxHeight") != null && b.selectSingleNode("maxHeight").text != "") { c.maxHeight = parseInt(b.selectSingleNode("maxHeight").text) } if (b.selectSingleNode("minChars") != null && b.selectSingleNode("minChars").text != "") { c.minChars = parseInt(b.selectSingleNode("minChars").text) } if (b.selectSingleNode("typeAhead") != null && b.selectSingleNode("typeAhead").text != "") { c.typeAhead = myBool(b.selectSingleNode("typeAhead").text) } if (b.selectSingleNode("queryDelay") != null && b.selectSingleNode("queryDelay").text != "") { c.queryDelay = parseInt(b.selectSingleNode("queryDelay").text) } if (b.selectSingleNode("pageSize") != null && b.selectSingleNode("pageSize").text != "") { c.pageSize = parseInt(b.selectSingleNode("pageSize").text) } if (b.selectSingleNode("editable") != null && b.selectSingleNode("editable").text != "") { c.editable = myBool(b.selectSingleNode("editable").text) } if (b.selectSingleNode("allQuery") != null && b.selectSingleNode("allQuery").text != "") { c.allQuery = b.selectSingleNode("allQuery").text } if (b.selectSingleNode("mode") != null && b.selectSingleNode("mode").text != "") { c.mode = b.selectSingleNode("mode").text } if (b.selectSingleNode("forceSelection") != null && b.selectSingleNode("forceSelection").text != "") { c.forceSelection = myBool(b.selectSingleNode("forceSelection").text) } if (b.selectSingleNode("typeAheadDelay") != null && b.selectSingleNode("typeAheadDelay").text != "") { c.typeAheadDelay = parseInt(b.selectSingleNode("typeAheadDelay").text) } if (b.selectSingleNode("valueNotFoundText") != null && b.selectSingleNode("valueNotFoundText").text != "") { c.valueNotFoundText = b.selectSingleNode("valueNotFoundText").text } if (b.selectSingleNode("lazyInit") != null && b.selectSingleNode("lazyInit").text != "") { c.lazyInit = myBool(b.selectSingleNode("lazyInit").text) } return c } function GenerateNumberFieldConfigByXmlDefine(a, d) { var c = GenerateTextFieldConfigByXmlDefine(a, d); var b = d.selectSingleNode("Attributes"); if (b.selectSingleNode("allowDecimals") != null && b.selectSingleNode("allowDecimals").text != "") { c.allowDecimals = myBool(b.selectSingleNode("allowDecimals").text) } if (b.selectSingleNode("decimalSeparator") != null && b.selectSingleNode("decimalSeparator").text != "") { c.decimalSeparator = b.selectSingleNode("decimalSeparator").text } if (b.selectSingleNode("decimalPrecision") != null && b.selectSingleNode("decimalPrecision").text != "") { c.decimalPrecision = parseInt(b.selectSingleNode("decimalPrecision").text) } if (b.selectSingleNode("allowNegative") != null && b.selectSingleNode("allowNegative").text != "") { c.allowNegative = myBool(b.selectSingleNode("allowNegative").text) } if (b.selectSingleNode("minValue") != null && b.selectSingleNode("minValue").text != "") { c.minValue = parseInt(b.selectSingleNode("minValue").text) } if (b.selectSingleNode("maxValue") != null && b.selectSingleNode("maxValue").text != "") { c.maxValue = parseInt(b.selectSingleNode("maxValue").text) } if (b.selectSingleNode("minText") != null && b.selectSingleNode("minText").text != "") { c.minText = b.selectSingleNode("minText").text } if (b.selectSingleNode("maxText") != null && b.selectSingleNode("maxText").text != "") { c.maxText = b.selectSingleNode("maxText").text } if (b.selectSingleNode("is") != null && b.selectSingleNode("is").text != "") { c.is = b.selectSingleNode("is").text } return c } function GenerateTextAreaConfigByXmlDefine(a, d) { var c = GenerateTextFieldConfigByXmlDefine(a, d); var b = d.selectSingleNode("Attributes"); if (b.selectSingleNode("preventScrollbars") != null && b.selectSingleNode("preventScrollbars").text != "") { c.preventScrollbars = myBool(b.selectSingleNode("preventScrollbars").text) } return c } function GenerateDateFieldConfigByXmlDefine(a, d) { var c = GenerateTextFieldConfigByXmlDefine(a, d); var b = d.selectSingleNode("Attributes"); if (b.selectSingleNode("format") != null && b.selectSingleNode("format").text != "") { c.format = b.selectSingleNode("format").text } if (b.selectSingleNode("altFormats") != null && b.selectSingleNode("altFormats").text != "") { c.altFormats = b.selectSingleNode("altFormats").text } if (b.selectSingleNode("minValue") != null && b.selectSingleNode("minValue").text != "") { c.minValue = b.selectSingleNode("minValue").text } if (b.selectSingleNode("maxValue") != null && b.selectSingleNode("maxValue").text != "") { c.maxValue = b.selectSingleNode("maxValue").text } if (b.selectSingleNode("minText") != null && b.selectSingleNode("minText").text != "") { c.minText = b.selectSingleNode("minText").text } if (b.selectSingleNode("maxText") != null && b.selectSingleNode("maxText").text != "") { c.maxText = b.selectSingleNode("maxText").text } if (b.selectSingleNode("invalidText") != null && b.selectSingleNode("invalidText").text != "") { c.invalidText = b.selectSingleNode("invalidText").text } return c } function GenerateTimeFieldConfigByXmlDefine(a, d) { var c = GenerateComboboxConfigByXmlDefine(a, d); var b = d.selectSingleNode("Attributes"); if (b.selectSingleNode("minValue") != null && b.selectSingleNode("minValue").text != "") { c.minValue = b.selectSingleNode("minValue").text } if (b.selectSingleNode("maxValue") != null && b.selectSingleNode("maxValue").text != "") { c.maxValue = b.selectSingleNode("maxValue").text } if (b.selectSingleNode("minText") != null && b.selectSingleNode("minText").text != "") { c.minText = b.selectSingleNode("minText").text } if (b.selectSingleNode("maxText") != null && b.selectSingleNode("maxText").text != "") { c.maxText = b.selectSingleNode("maxText").text } if (b.selectSingleNode("invalidText") != null && b.selectSingleNode("invalidText").text != "") { c.invalidText = b.selectSingleNode("invalidText").text } if (b.selectSingleNode("format") != null && b.selectSingleNode("format").text != "") { c.format = b.selectSingleNode("format").text } if (b.selectSingleNode("altFormats") != null && b.selectSingleNode("altFormats").text != "") { c.altFormats = b.selectSingleNode("altFormats").text } if (b.selectSingleNode("increment") != null && b.selectSingleNode("increment").text != "") { c.increment = parseIntattrs.selectSingleNode("increment").text } return c } function YCField(a, g, d) { switch (d) { case "TextField": config = GenerateTextFieldConfigByXmlDefine(a, g); break; case "ComboBox": config = GenerateComboboxConfigByXmlDefine(a, g); break; case "TextArea": config = GenerateTextAreaConfigByXmlDefine(a, g); break; case "NumberField": config = GenerateNumberFieldConfigByXmlDefine(a, g); break; case "TimeField": config = GenerateTimeFieldConfigByXmlDefine(a, g); break; case "DateField": config = GenerateDateFieldConfigByXmlDefine(a, g); break; default: break } var e; if (d == "ComboBox") { if (!config.DatSourceUrl) { alert("comboBox_ID:" + config.id + "\u7684DatSourceUrl\u6ca1\u6709\u8bbe\u7f6e!") } var c = new Ext.data.Store({ url: config.DatSourceUrl, autoLoad: false, reader: new Ext.data.XmlReader({ record: "Table" }, [{ name: config.displayField }, { name: config.valueField}]) }); config.mode = "local"; config.store = c; var f = new Ext.form.ComboBox(config); e = f } switch (d) { case "TextField": e = new Ext.form.TextField(config); break; case "TextArea": e = new Ext.form.TextArea(config); break; case "NumberField": e = new Ext.form.NumberField(config); break; case "TimeField": e = new Ext.form.TimeField(config); break; case "DateField": e = new Ext.form.DateField(config); break; default: break } function b(j) { if (!e.fieldIndex) { return } var i = e.fieldIndex; if (!j.data.items[0].data[i]) { alert("\u63a7\u4ef6ID:" + e.id + "\u6307\u5b9a\u8981\u7ed1\u5b9a\u7684field=" + i + "\u5728MAIN\u5b9a\u4e49\u4e2d\u4e0d\u5b58\u5728!"); return } if (e.getXType() == "combo") { e.store.load(); var h = e.selectByValue(j.data.items[0].data[i], false); if (!h) { if (j.data.items[0].data[i + "_text"]) { e.setValue(j.data.items[0].data[i + "_text"]) } else { e.setValue(j.data.items[0].data[i]) } } e.un("blur", l); e.on("blur", l); function l(m) { } } else { e.setValue(j.data.items[0].data[i]) } e.un("change", k); e.on("change", k); function k(n, m, o) { j.data.items[0].data[i] = m } } this.UnBindData = function (h) { e.purgeListeners() }; this.BindData = function (h) { b(h) }; this.Render = function () { if (Ext.get(e.willrenderTo)) { e.render(e.willrenderTo) } else { alert(e.id + "\u7684renderTo\u5bf9\u8c61:" + e.willrenderTo + "\u4e0d\u5b58\u5728!") } }; e.ycgenerate = this; this.getControl = function () { return e } } function GenerateColumnByXmlDefine(a) { var h; var b = a.selectSingleNode("@Type"); var g = ""; h = {}; if (b != null) { g = b.value } if (a.selectSingleNode("header") != null && a.selectSingleNode("header").text != "") { h.header = a.selectSingleNode("header").text } if (a.selectSingleNode("dataIndex") != null && a.selectSingleNode("dataIndex").text != "") { h.dataIndex = a.selectSingleNode("dataIndex").text } if (a.selectSingleNode("width") != null && a.selectSingleNode("width").text != "") { h.width = parseInt(a.selectSingleNode("width").text) } if (a.selectSingleNode("sortable") != null && a.selectSingleNode("sortable").text != "") { h.sortable = myBool(a.selectSingleNode("sortable").text) } if (a.selectSingleNode("locked") != null && a.selectSingleNode("locked").text != "") { h.locked = myBool(a.selectSingleNode("locked").text) } if (a.selectSingleNode("resizable") != null && a.selectSingleNode("resizable").text != "") { h.resizable = myBool(a.selectSingleNode("resizable").text) } if (a.selectSingleNode("hidden") != null && a.selectSingleNode("hidden").text != "") { h.hidden = myBool(a.selectSingleNode("hidden").text) } if (a.selectSingleNode("myrenderer") != null && a.selectSingleNode("myrenderer").text != "") { h.myrenderer = a.selectSingleNode("myrenderer").text } if (a.selectSingleNode("align") != null && a.selectSingleNode("align").text != "") { h.align = a.selectSingleNode("align").text } if (a.selectSingleNode("hideable") != null && a.selectSingleNode("hideable").text != "") { h.hideable = myBool(a.selectSingleNode("hideable").text) } if (a.selectSingleNode("editor") != null && a.selectSingleNode("editor").text != "") { var f = a.selectSingleNode("editor").text; if (f == "default") { h.editor = new Ext.form.TextField({}) } else { var d = a.selectSingleNode("editor").selectSingleNode("Control").childNodes[0].nodeName; h.editor = c(a.selectSingleNode("editor").selectSingleNode("Control").childNodes[0]); if (d == "NumberField") { if (h.myrenderer == "RMB") { h.renderer = function (j, k, i) { return RMBMoney(j) } } if (h.myrenderer == "rmb") { h.renderer = function (j, k, i) { return rmbMoney(j) } } if (h.myrenderer == "USD") { h.renderer = "usMoney" } } if (d == "DateField") { if (h.myrenderer == "date") { h.renderer = function e(i) { return i ? i.dateFormat("Y-m-d") : "" } } if (h.myrenderer == "DATE") { h.renderer = function e(i) { return i ? i.dateFormat("Y\u5e74m\u6708d\u65e5") : "" } } } if (d == "ComboBox") { h.renderer = function e(j, k, i) { if (i.data[h.dataIndex + "_text"] && i.data[h.dataIndex + "_text"] != "") { return i.data[h.dataIndex + "_text"] } else { return i.data[h.dataIndex] } } } } } if (a.selectSingleNode("hasSub") != null && a.selectSingleNode("hasSub").text != "") { } function c(m) { d = m.nodeName; var i = ""; switch (d) { case "TextField": config = GenerateTextFieldConfigByXmlDefine(i, m); break; case "ComboBox": config = GenerateComboboxConfigByXmlDefine(i, m); break; case "TextArea": config = GenerateTextAreaConfigByXmlDefine(i, m); break; case "NumberField": config = GenerateNumberFieldConfigByXmlDefine(i, m); break; case "TimeField": config = GenerateTimeFieldConfigByXmlDefine(i, m); break; case "DateField": config = GenerateDateFieldConfigByXmlDefine(i, m); break; default: break } var k; if (d == "ComboBox") { if (!config.DatSourceUrl) { alert("Editor\u4e2d\u7684comboBox_ID:" + config.id + "\u7684DatSourceUrl\u6ca1\u6709\u8bbe\u7f6e!") } var j = new Ext.data.Store({ url: config.DatSourceUrl, autoLoad: true, reader: new Ext.data.XmlReader({ record: "Table" }, [{ name: config.displayField }, { name: config.valueField}]) }); config.mode = "local"; config.store = j; var l = new Ext.form.ComboBox(config); k = l } switch (d) { case "TextField": k = new Ext.form.TextField(config); break; case "TextArea": k = new Ext.form.TextArea(config); break; case "NumberField": k = new Ext.form.NumberField(config); break; case "TimeField": k = new Ext.form.TimeField(config); break; case "DateField": k = new Ext.form.DateField(config); break; default: break } return k } return h } function GenerateColumnModelByXmlDefine(d) { var e = d.selectNodes("Column"); var b = new Array(); for (var c = 0; c < e.length; c++) { b[c] = GenerateColumnByXmlDefine(e[c]) } var a = new Ext.grid.ColumnModel(b); return a } function GenerateGridByXmlDefine(e, k, d) { var j = k.selectSingleNode("Attributes"); var b = {}; if (k.getAttribute("id")) { b.id = e + "_" + k.getAttribute("id") } if (j.selectSingleNode("StoreDefineID") != null && j.selectSingleNode("StoreDefineID").text != "") { b.StoreDefineID = j.selectSingleNode("StoreDefineID").text } if (j.selectSingleNode("StoreID") != null && j.selectSingleNode("StoreID").text != "") { b.StoreID = j.selectSingleNode("StoreID").text } if (j.selectSingleNode("enableAdd") != null && j.selectSingleNode("enableAdd").text != "") { b.enableAdd = j.selectSingleNode("enableAdd").text } if (j.selectSingleNode("clicksToEdit") != null && j.selectSingleNode("clicksToEdit").text != "") { b.clicksToEdit = parseInt(j.selectSingleNode("clicksToEdit").text) } if (j.selectSingleNode("maxHeight") != null && j.selectSingleNode("maxHeight").text != "") { b.maxHeight = parseInt(j.selectSingleNode("maxHeight").text) } if (j.selectSingleNode("disableSelection") != null && j.selectSingleNode("disableSelection").text != "") { b.disableSelection = myBool(j.selectSingleNode("disableSelection").text) } if (j.selectSingleNode("enableColumnMove") != null && j.selectSingleNode("enableColumnMove").text != "") { b.enableColumnMove = myBool(j.selectSingleNode("enableColumnMove").text) } if (j.selectSingleNode("enableColumnResize") != null && j.selectSingleNode("enableColumnResize").text != "") { b.enableColumnResize = myBool(j.selectSingleNode("enableColumnResize").text) } if (j.selectSingleNode("minColumnWidth") != null && j.selectSingleNode("minColumnWidth").text != "") { b.minColumnWidth = parseInt(j.selectSingleNode("minColumnWidth").text) } if (j.selectSingleNode("autoSizeColumns") != null && j.selectSingleNode("autoSizeColumns").text != "") { b.autoSizeColumns = myBool(j.selectSingleNode("autoSizeColumns").text) } if (j.selectSingleNode("autoSizeHeaders") != null && j.selectSingleNode("autoSizeHeaders").text != "") { b.autoSizeHeaders = myBool(j.selectSingleNode("autoSizeHeaders").text) } if (j.selectSingleNode("monitorWindowResize") != null && j.selectSingleNode("monitorWindowResize").text != "") { b.monitorWindowResize = myBool(j.selectSingleNode("monitorWindowResize").text) } if (j.selectSingleNode("maxRowsToMeasure") != null && j.selectSingleNode("maxRowsToMeasure").text != "") { b.maxRowsToMeasure = parseInt(j.selectSingleNode("maxRowsToMeasure").text) } if (j.selectSingleNode("trackMouseOver") != null && j.selectSingleNode("trackMouseOver").text != "") { b.trackMouseOver = myBool(j.selectSingleNode("trackMouseOver").text) } if (j.selectSingleNode("enableDragDrop") != null && j.selectSingleNode("enableDragDrop").text != "") { b.enableDragDrop = myBool(j.selectSingleNode("enableDragDrop").text) } if (j.selectSingleNode("enableColumnHide") != null && j.selectSingleNode("enableColumnHide").text != "") { b.enableColumnHide = myBool(j.selectSingleNode("enableColumnHide").text) } if (j.selectSingleNode("enableRowHeightSync") != null && j.selectSingleNode("enableRowHeightSync").text != "") { b.enableRowHeightSync = myBool(j.selectSingleNode("enableRowHeightSync").text) } if (j.selectSingleNode("stripeRows") != null && j.selectSingleNode("stripeRows").text != "") { b.stripeRows = myBool(j.selectSingleNode("stripeRows").text) } if (j.selectSingleNode("autoHeight") != null && j.selectSingleNode("autoHeight").text != "") { b.autoHeight = myBool(j.selectSingleNode("autoHeight").text) } if (j.selectSingleNode("frame") != null && j.selectSingleNode("frame").text != "") { b.frame = myBool(j.selectSingleNode("frame").text) } if (j.selectSingleNode("autoExpandColumn") != null && j.selectSingleNode("autoExpandColumn").text != "") { b.autoExpandColumn = j.selectSingleNode("autoExpandColumn").text } if (j.selectSingleNode("autoExpandMin") != null && j.selectSingleNode("autoExpandMin").text != "") { b.autoExpandMin = parseInt(j.selectSingleNode("autoExpandMin").text) } if (j.selectSingleNode("autoExpandMax") != null && j.selectSingleNode("autoExpandMax").text != "") { b.autoExpandMax = parseInt(j.selectSingleNode("autoExpandMax").text) } if (j.selectSingleNode("loadMask") != null && j.selectSingleNode("loadMask").text != "") { b.loadMask = myBool(j.selectSingleNode("loadMask").text) } if (j.selectSingleNode("header") != null && j.selectSingleNode("header").text != "") { b.header = myBool(j.selectSingleNode("header").text) } if (j.selectSingleNode("footer") != null && j.selectSingleNode("footer").text != "") { b.footer = myBool(j.selectSingleNode("footer").text) } if (j.selectSingleNode("title") != null && j.selectSingleNode("title").text != "") { b.title = j.selectSingleNode("title").text } if (j.selectSingleNode("bodyBorder") != null && j.selectSingleNode("bodyBorder").text != "") { b.bodyBorder = myBool(j.selectSingleNode("bodyBorder").text) } if (j.selectSingleNode("collapsible") != null && j.selectSingleNode("collapsible").text != "") { b.collapsible = myBool(j.selectSingleNode("collapsible").text) } if (j.selectSingleNode("html") != null && j.selectSingleNode("html").text != "") { b.html = j.selectSingleNode("html").text } if (j.selectSingleNode("draggable") != null && j.selectSingleNode("draggable").text != "") { b.draggable = myBool(j.selectSingleNode("draggable").text) } if (j.selectSingleNode("buttonAlign") != null && j.selectSingleNode("buttonAlign").text != "") { b.buttonAlign = j.selectSingleNode("buttonAlign").text } if (j.selectSingleNode("collapsed") != null && j.selectSingleNode("collapsed").text != "") { b.collapsed = myBool(j.selectSingleNode("collapsed").text) } if (j.selectSingleNode("autoWidth") != null && j.selectSingleNode("autoWidth").text != "") { b.autoWidth = myBool(j.selectSingleNode("autoWidth").text) } if (j.selectSingleNode("deferHeight") != null && j.selectSingleNode("deferHeight").text != "") { b.deferHeight = myBool(j.selectSingleNode("deferHeight").text) } if (j.selectSingleNode("height") != null && j.selectSingleNode("height").text != "") { b.height = parseInt(j.selectSingleNode("height").text) } if (j.selectSingleNode("width") != null && j.selectSingleNode("width").text != "") { b.width = parseInt(j.selectSingleNode("width").text) } if (j.selectSingleNode("renderTo") != null && j.selectSingleNode("renderTo").text != "") { b.willrenderTo = j.selectSingleNode("renderTo").text } var g = GenerateColumnModelByXmlDefine(k.selectSingleNode("Columns")); b.cm = g; var c = new Ext.grid.CheckboxSelectionModel(); var i = { text: "AddNewRow", handler: function () { var n = l.store; var m = CreateBlankRecord(n.DefineXml); l.stopEditing(); n.insert(0, m); l.startEditing(0, 0); l.getView().refresh() } }; var h = { text: "DeleteRow", handler: function () { var o = l.store; var n = l.getSelectionModel().getSelections(); for (var m = 0; m < n.length; m++) { o.remove(n[m]) } l.getView().refresh() } }; var f = Array(); if (b.enableAdd) { f.unshift(h); f.unshift(i); b.sm = c; g.config.unshift(c) } b.tbar = f; if (d != null) { b.plugins = d } var l = new Ext.grid.EditorGridPanel(b); l.ycgenerate = this; l.on("validateedit", a); function a(o) { var m = l.colModel; if (o.record.data[o.field + "_text"] != null && o.record.data[o.field + "_text"] != "undefine") { var n = m.getCellEditor(o.column, o.row); o.record.data[o.field + "_text"] = Ext.get(n.field.id).dom.value } } this.UnBindData = function () { }; this.BindData = function (n) { var m = l.store; if (l.getEl()) { l.reconfigure(n, l.colModel) } else { l.store = n } }; this.BindXmlData = function (p) { var o = GetRecordDefineByGridCM(l.colModel); var m = XmlDocument(); m.loadXML(p); var n = GenerateStoreByXml2(m.selectSingleNode("//NewDataSet"), o); if (l.getEl()) { l.reconfigure(n, l.colModel) } else { l.store = n } }; this.Render = function () { if (Ext.get(l.willrenderTo)) { l.render(l.willrenderTo); l.getView().refresh() } else { alert(l.id + "\u7684renderTo\u5bf9\u8c61:" + l.willrenderTo + "\u4e0d\u5b58\u5728!") } }; this.getControl = function () { return l } } function GetRecordDefineByGridCM(a) { var e = new Array(); for (var d = 0; d < a.config.length; d++) { var b = {}; var c = {}; if (a.config[d].dataIndex != null && a.config[d].dataIndex != "") { b.name = a.config[d].dataIndex; b.type = "string"; if (a.config[d].editor) { if (a.config[d].editor.field.getXType() == "datefield") { b.type = "date"; b.dateFormat = "Y-m-d" } if (a.config[d].editor.field.getXType() == "numberfield") { b.type = "float" } if (a.config[d].editor.field.getXType() == "combo") { c.name = b.name + "_text"; c.type = "string"; e.push(c) } } e.push(b) } } var f = Ext.data.Record.create(e); return f } function __refreshMenuCount() { var b = /MenuCountHandler.ashx"; var e = __createRquest(); e.open("POST", b, false); e.send(""); if (e.readyState == 4) { if (e.status == 200) { var d = e.responseText; var a = d.split("##"); for (var c = 0; c < a.length; c++) { a[c] = a[c].split("|") } Ext.getCmp("west-panel").el.select("li.x-tree-node div.x-tree-node-el").each(function (i) { var h = Ext.get(i); var k = h.getAttributeNS("ext", "tree-node-id"); for (var f = 0; f < a.length; f++) { if (k == a[f][0]) { var g = h.child("a.x-tree-node-anchor span"); g.dom.innerHTML = a[f][1] + "[" + a[f][2] + "]"; if (a[f][2] != "0") { g.dom.style.fontWeight = "bold" } else { g.dom.style.fontWeight = "" } } h.select("a.x-tree-node-anchor span") } }, this) } } e.abort() } var ChildeNodesCount__Start__ = 0; var ChildeNodesCount__End__ = 0; function __createRquest() { var a = null; try { a = new XMLHttpRequest() } catch (b) { try { a = new ActiveXObject("Msxml2.XMLHTTP") } catch (c) { a = new ActiveXObject("Microsoft.XMLHTTP") } } return a };