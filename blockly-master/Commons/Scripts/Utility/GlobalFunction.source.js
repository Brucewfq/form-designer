Ext.BLANK_IMAGE_URL = '/Commons/Ext/Images/default/s.gif';

//#region JS基类重构
///<Summary>
///JS基类重构
///</Summary>
//自定义F1功能键
document.onhelp = function () { return false };
window.onhelp = function () { return false };
function keyDownHandler(e) {
    if (e) { // Firefox
        if (e.keyCode == 112) {
            alert('帮助制作中!!!');
            e.preventDefault();
            e.stopPropagation();
        }
    } else { // IE
        if (window.event.keyCode == 112) {
            alert('帮助制作中!!!');
            window.event.keyCode = 0;
            return false;
        }
    }
}
document.onkeydown = keyDownHandler;

//清除字符串两端空白字符
String.prototype.trim = function () {
    return Ext.util.Format.trim(this);
    //return this.replace(/^\s+|\s+$/g,"");
};

//如果第一个字符为逗号，则清除
String.prototype.tirmLeftComma = function () {
    if (this.indexOf(',') == 0)
        return this ? this.substring(1) : this;
    else
        return this;
};

String.prototype.getQuery = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = this.substring(this.indexOf("\?") + 1).match(reg);
    if (r != null) return unescape(r[2]); return '';
}

//时间段天数，包含开始当天
Date.prototype.getDaysByEndDate = function (endDate) {
    return this.getElapsed(endDate) / (1000 * 60 * 60 * 24) + 1;
};

//数组插入字段
Array.prototype.insert = function (index, v) {
    if (index >= 0) {
        this.splice(index, 0, v);
    }
    return this;
};

//删除数组项
Array.prototype.removeAt = function (index, end) {
    end = end || 1;
    this.splice(index, end);
    return this;
};


//返回一个字符串，保留指定位小数，多余部分四舍五入
//ie5没有toFixed方法需要追加
if (!Number.prototype.toFixed) {
    Number.prototype.toFixed = function (len) {
        var v = (this < 1) ? this + 1 : this;
        v = String(Math.round(v * Math.pow(10, len)));
        var whole = v.substr(0, v.length - len);
        var sub = v.substring(v.length - len);
        v = ((this < 1) ? 0 : whole) + '.' + sub;
        return v;
    };
}

if (Ext.isGecko) {
    XMLDocument.prototype.loadXML = function (xmlString) {
        var childNodes = this.childNodes;
        for (var i = childNodes.length - 1; i >= 0; i--)
            this.removeChild(childNodes[i]);

        var dp = new DOMParser();
        var newDOM = dp.parseFromString(xmlString, "text/xml");
        var newElt = this.importNode(newDOM.documentElement, true);
        this.appendChild(newElt);
    };

    if (document.implementation.hasFeature("XPath", "3.0")) {
        XMLDocument.prototype.selectNodes = function (cXPathString, xNode) {
            //return mxUtils.selectSingleNode(xNode, cXPathString);
            if (!xNode) { xNode = this; }
            var oNSResolver = this.createNSResolver(this.documentElement)
            var aItems = this.evaluate(cXPathString, xNode, oNSResolver,
                    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
            var aResult = [];
            for (var i = 0; i < aItems.snapshotLength; i++) {
                aResult[i] = aItems.snapshotItem(i);
            }
            return aResult;
        }


        XMLDocument.prototype.selectSingleNode = function (cXPathString, xNode) {
            if (!xNode) { xNode = this; }
            var xItems = this.selectNodes(cXPathString, xNode);
            if (xItems.length > 0) {
                return xItems[0];
            }
            else {
                return null;
            }
        }

        // prototying the Element
        Element.prototype.selectNodes = function (cXPathString) {
            if (this.ownerDocument.selectNodes) {
                return this.ownerDocument.selectNodes(cXPathString, this);
            }
            else { throw "For XML Elements Only"; }
        }
        Element.prototype.selectSingleNode = function (cXPathString) {
            if (this.ownerDocument.selectSingleNode) {
                return this.ownerDocument.selectSingleNode(cXPathString, this);
            }
            else { throw "For XML Elements Only"; }
        }
    }
}

//#endregion

//#region Ext基类重构
///<Summary>
///Ext基类重构
///</Summary>

//form布局时隐藏表单项
//1.字段值变更后触发form的change事件
//2.增加必填表单项特殊样式。必须满足以下条件allowBlank：false && this.allowBlankTip：true
Ext.override(Ext.form.Field, {
    initComponent: Ext.form.Field.prototype.initComponent.createSequence(function () {
        this.enableBubble('change');
        if (this.allowBlank === false && this.allowBlankTip === true)
            this.addClass('x-form-field-allowblank');
    }),
    getBubbleTarget: function () {
        if (!this.formPanel) {
            this.formPanel = this.findParentByType('form');
        }
        return this.formPanel;
    },
    hide: function () {
        Ext.form.Field.superclass.hide.call(this);
        if (this.labelWrap) {
            Ext.fly(this.labelWrap).setDisplayed(false);
        } else if (this.getEl()) {
            var formItem = this.getEl().parent('.x-form-item');
            if (formItem != null && formItem != undefined)
                formItem.setDisplayed(false); // hide label
        }
        return this;
    },
    show: function () {
        Ext.form.Field.superclass.show.call(this);
        if (this.labelWrap) {
            Ext.fly(this.labelWrap).setDisplayed(true);
        } else if (this.getEl()) {
            var formItem = this.getEl().parent('.x-form-item');
            if (formItem != null && formItem != undefined)
                formItem.setDisplayed(true); // show label
        }
        return this;
    }
});

//Label添加setText改变文本方法
Ext.override(Ext.form.Label, {
    setText: function (t) {
        this.text = t;
        if (this.rendered)
            this.el.update(t);
    }
});

//屏蔽空白字符串
Ext.override(Ext.form.TextField, {
    validator: function (text) {
        if (this.allowBlank == false && Ext.util.Format.trim(text).length == 0)
            return false;
        else
            return true;
    }
});

//强制限制数字长度（使用input标签本身自带的maxlength属性）
Ext.override(Ext.form.NumberField, {
    onRender: function (ct, position) {
        Ext.form.NumberField.superclass.onRender.call(this, ct, position);
        if (this.maxLength != Number.MAX_VALUE)
            this.el.dom.setAttribute('maxlength', this.maxLength);
    }
});

//获取或设置按钮悬停提示信息
Ext.override(Ext.Button, {
    initComponent: Ext.Button.prototype.initComponent.createSequence(function () {
        this.on('render', function () {
            if (this.alt)
                this.setAlt(this.alt);
        });
    }),
    setAlt: function (alt) {
        this.alt = alt;
        if (this.alt) {
            this.el.set({ title: this.alt });
        }
        return this;
    },
    getAlt: function () {
        return this.alt;
    }
});

//GridPanel增加单元格值更新方法
Ext.override(Ext.grid.GridPanel, {
    //更新cell值
    //调用者的行编号
    //调用者的列编号
    updateCellValue: function (rowIndex, columnIndex, val) {
        //获取列名
        var columnName = this.store.fields.keys[columnIndex];
        //获取行记录
        var row = this.store.data.items[rowIndex];

        //更新值
        row.set(columnName, val)
        this.getView().refresh();
        return this;
    }
});

////添加格式化数据
Ext.override(Ext.data.Store, {
    appendData: function (records) {
        this.loadData(WhiteShell.Globle.toArray(records), true);
    }
});

//添加column
Ext.override(Ext.grid.ColumnModel, {
    addColumns: function (columns) {
        var i, c, len, start;
        if (!Ext.isArray(columns))
            columns = [columns];
        var config = this.config;
        start = config.length;
        for (i = 0, len = columns.length; i < len; i++) {
            c = Ext.applyIf(columns[i], this.defaults);
            if (Ext.isEmpty(c.id)) {
                c.id = i + start;
            }
            if (!c.isColumn) {
                var Cls = Ext.grid.Column.types[c.xtype || 'gridcolumn'];
                c = new Cls(c);
                config[i + start] = c;
            }
            this.lookup[c.id] = c;
        }
        this.fireEvent('configchange', this);
    }
});
//#endregion

//#region Ext扩展类
///<Summary>
///Ext扩展类
///</Summary>
//格式化XML
Ext.util.formatXml = function (xml) {
    var formatted = '';
    var reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\r\n$2$3');
    var pad = 0;
    Ext.each(xml.split('\r\n'), function (node, index) {
        var indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (node.match(/^<\/\w/)) {
            if (pad != 0) {
                pad -= 1;
            }
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }

        var padding = '';
        for (var i = 0; i < pad; i++) {
            padding += '  ';
        }

        formatted += padding + node + '\r\n';
        pad += indent;
    });

    return formatted;
}

//深度拷贝
Ext.namespace("Ext.ux.clone");
Ext.ux.clone = function (o) {
    if (!o || 'object' !== typeof o) {
        return o;
    }
    if ('function' === typeof o.clone)
        return o.clone();
    var c = '[object Array]' === Object.prototype.toString.call(o) ? [] : {};
    var p, v;
    for (p in o) {
        if (Object.prototype.hasOwnProperty.call(o, p)) {
            v = o[p];
            if (v && 'object' === typeof v) {
                c[p] = Ext.ux.clone(v);
            }
            else {
                c[p] = v;
            }
        }
    }
    return c;
};

///带单位的文本框  
Ext.form.UnitField = Ext.extend(Ext.form.NumberField, {
    /*单位说明文字*/
    unitText: '',
    onRender: function (ct, position) {
        Ext.form.UnitField.superclass.onRender.call(this, ct, position);
        this.unitEl = ct.createChild({ tag: 'span', html: this.unitText });
        this.unitEl.addClass('x-form-unit');
    },
    alignErrorIcon: function () {
        this.errorIcon.alignTo(this.unitEl, 'tl-tr', [2, 0]);
    }
});
Ext.reg('unitfield', Ext.form.UnitField);

Ext.form.Span = Ext.extend(Ext.form.DisplayField, {
    cls: 'x-form-span',
    fieldClass: 'x-form-field',
    emptyText: null,
    emptyClass: 'x-form-empty-field'
});
Ext.reg('spanfield', Ext.form.Span);

//填充Toolbar指定宽度间隔对象
Ext.Toolbar.FillWidth = function (config) {
    this.width = config.width;
    Ext.Toolbar.FillWidth.superclass.constructor.call(this, config);
};
Ext.extend(Ext.Toolbar.FillWidth, Ext.Toolbar.Spacer, {
    render: function (td) {
        td.style.width = this.width ? this.width : '100%';
        Ext.Toolbar.FillWidth.superclass.render.call(this, td);
    }
});
Ext.reg('tbfillwidth', Ext.Toolbar.FillWidth);

//创建解析xml数据的store
Ext.data.XmlStore = function (c) {
    Ext.data.XmlStore.superclass.constructor.call(this, Ext.apply(c, {
        proxy: !c.data ? new Ext.data.HttpProxy({ url: c.url }) : undefined,
        reader: new Ext.data.XmlReader(c, c.fields)
    }));
};
Ext.extend(Ext.data.XmlStore, Ext.data.Store);

//返回combo中record对应的text值
Ext.util.Format.comboRenderer = function (combo) {
    return function (value) {
        if (!combo)
            combo = this.editor;
        var record = combo.findRecord(combo.valueField, value);
        return record ? record.get(combo.displayField) : value; //combo.valueNotFoundText;
    };
};
Ext.util.Format.getComboText = Ext.util.Format.comboRenderer; //兼容老版本

//汇率保存4位小数
Ext.util.Format.exchangeRateMoney = function (v) {
    if (v == "")
        return;
    return v.toFixed(4);
};

//时间型转化为浮点型
Ext.util.Format.timeToFloat = function (time) {
    if (time != undefiled && time != null) {
        var temp = time.split(":");
        return parseInt(parseInt(temp[1]) / 6) / 10
    } else {
        return 0;
    }
};
//保留两位小数金额字符串
Ext.util.Format.money = function (v) {
    //	if(v == 0)
    //		return '';
    //	if(v == 0)
    //		return 0;
    if (v == undefined)
        v = 0
    if (typeof (v) == "string")
        v = parseFloat(v);
    v = v.toFixed(2);
    return Ext.util.Format.currency(v);
};

//保留两位小数金额字符串
Ext.util.Format.money2 = function (v) {
    //	if(v == 0)
    //		return '';
    //	if(v == 0)
    //		return 0;
    if (v == undefined || v == null || v == '')
        v = 0
    if (typeof (v) == "string")
        v = parseFloat(v);
    v = v.toFixed(2);
    return v;
};
//将数值字符串转化为货币字符串（即千分逗号）
Ext.util.Format.currency = function (v) {
    var ps = v.split('.');
    var whole = ps[0];
    var sub = ps[1];
    var r = /(\d+)(\d{3})/;
    while (r.test(whole)) {
        whole = whole.replace(r, '$1' + ',' + '$2');
    }
    v = whole + '.' + sub;
    return v;
};

//生成GUID
//separator 为 false 时不使用分隔符
//separator 为 字符 时自定义分隔符
//默认separator 为 
Ext.ux.newGuid = function (isSeparator) {
    var guid = "";
    for (var i = 1; i <= 32; i++) {
        var n = Math.floor(Math.random() * 16.0).toString(16);
        guid += n;
        if (isSeparator === true) {
            if ((i == 8) || (i == 12) || (i == 16) || (i == 20))
                guid += "-";
        }
    }
    return guid;
};

//CalendarPicker日历控件-2009/06/19 - by fangle
//config.store
//config.renderer
//config.dateField 传入的store中对应日期的字段
Ext.CalendarPicker = function (config) {
    //增加日期变动更新事件
    this.addEvents(
		'update'//日期更新后触发事件，方便扩展
	);

    if (!config.dateFormat)
        config.dateFormat = 'Y/m/d';

    Ext.CalendarPicker.superclass.constructor.call(this, config);
    this.bindStore();
};
Ext.extend(Ext.CalendarPicker, Ext.DatePicker, {
    bindStore: function () {
        if (!this.store && this.storeConfig) {
            this.store = new Ext.data.XmlStore(config.storeConfig);
        }
        this.store.on("loadexception", function () {
            this.loading = false;
            if (this.el) {
                this.afterUpdate(this.activeDate);
            }
        }, this);
        //绑定store数据更新事件
        this.store.on("beforeload", function () {
            this.loading = true; return true;
        }, this);
        //绑定store数据更新事件
        this.store.on("load", function () {
            this.loading = false;
            if (this.el) {
                this.afterUpdate(this.activeDate);
            }
        }, this);
        this.store.on("clear", function () {
            if (this.el) {
                this.afterUpdate(this.activeDate);
                this.unmask();
            }
        }, this);
    },
    //判断是否要刷新本页
    isRefresh: function (date) {
        //判断是否初始化过
        var vd = this.activeDate;
        if (vd && this.el) {
            var t = date.getTime();
            //判断是否变更多年份和月份
            if (vd.getMonth() == date.getMonth() && vd.getFullYear() == date.getFullYear()) {
                //判断指定日期是否在本页中
                this.cells.each(function (c) {
                    if (c.dom.firstChild.dateValue == t) {
                        return false;
                    }
                });
                return false;
            }
        }
        return true;
    },
    //更新日历列表
    update: function (date, forceRefresh) {
        //基类的update会变更状态，所以需要实现保存状态
        var refresh = this.isRefresh(date);
        if (!this._mask)
            this.createMask();

        Ext.CalendarPicker.superclass.update.call(this, date, forceRefresh);

        if (refresh) {
            if (!this.store.url)
                this.mask();
            //基类改变了年月
            this.fireEvent("update", this, date.getDaysInMonth());

            if (this.loading !== true)
                this.afterUpdate(date);
        }
    },
    afterUpdate: function (date) {
        if (!this.renderer)
            return;

        var cells = this.cells.elements;
        var textEls = this.textNodes;
        var dateText, records;
        //当月1日不是textEls中的第一个，则日期从上月开始
        var startDate = new Date(cells[0].firstChild.dateValue);

        for (var i = 0; i < textEls.length; i++) {
            dateText = startDate.dateFormat(this.dateFormat);
            records = this.queryRecordsByDate(startDate);
            textEls[i].innerHTML = this.renderer(dateText, records);
            startDate.setDate(startDate.getDate() + 1);
        }
    },
    //重写事件
    handleDateClick: function (e, t) {
        e.stopEvent();
        if (t.dateValue && !Ext.fly(t.parentNode).hasClass("x-date-disabled")) {
            this.setValue(new Date(t.dateValue));
            this.fireEvent("select", this, this.value, this.queryRecordsByDate(this.value));
        }
    },
    //重写事件
    selectToday: function () {
        this.setValue(new Date().clearTime());
        this.fireEvent("select", this, this.value, this.queryRecordsByDate(this.value));
    },
    //按时间查找所有对应记录
    queryRecordsByDate: function (date) {
        var self = this;
        var recerds = this.store.queryBy(function (record, id) {
            return Date.parse(date) == Date.parse(record.get(self.dateField).clearTime());
        });
        if (recerds.getCount() == 0) {
            return null;
        } else {
            return recerds;
        }
    },
    setValue: function (value) {
        if (!value)
            value = new Date();
        else if (!(value instanceof Date))
            value = new Date(value);

        Ext.CalendarPicker.superclass.setValue.call(this, value);
    },
    getValue: function () {
        return this.value;
    },
    createMask: function () {
        if (!this._mask)
            this._mask = new Ext.LoadMask(this.el, { store: this.store });
    },
    mask: function () {
        if (!this._mask)
            this.createMask();
        this._mask.show();
    },
    unmask: function () {
        this._mask.hide();
    }
});
Ext.reg('calendarpicker', Ext.CalendarPicker);

//fckeditor
//WEB.config里配置
//	<appSettings>
//		<!--FCKEDITOR-->
//		<add key="DefaultLanguage" value="zh-cn"/>
//		<add key="FCKeditor:BasePath" value="/web/fckeditor/"/>
//		<add key="FCKeditor:UserFilesPath" value="/upload/"/>
//
//e.g.
//Ext.onReady(function() {
//	new Ext.FormPanel({
//		labelWidth : 35,
//		title : 'fckeditor Form',
//		width : 850,
//		defaultType : 'textfield',
//		items : [{
//			xtype : 'fckeditor',
//			name : 'n_context',
//			id : 'n_context',
//			fieldLabel : '内容',
//			height : 400,
//			value:'ddd'
//		}],
//		renderTo:document.body
//	});
//});

Ext.form.FCKeditor = function (config) {
    if (!config.id)
        config.id = Ext.id();
    if (!config.name)
        config.name = config.id;
    Ext.form.FCKeditor.superclass.constructor.call(this, config);
    this.MyisLoaded = false;
    this.MyValue = '';
};
Ext.extend(Ext.form.FCKeditor, Ext.form.TextArea, {
    editorInstance: undefined,
    BasePath: '/web/fckeditor/',
    SkinPath: null,
    height: 100,
    initEvents: function () {
        this.on('destroy', function () {
            if (typeof this.editorInstance != 'undefined') {
                delete this.editorInstance;
            }
        });
    },
    onRender: function (ct, position) {
        if (!this.el) {
            this.defaultAutoCreate = {
                tag: "textarea",
                style: "width:100px;height:60px;",
                autocomplete: "off"
            };
        }
        Ext.form.TextArea.superclass.onRender.call(this, ct, position);
        this.hideMode = "visibility";
        this.hidden = true;
        if (this.grow) {
            this.textSizeEl = Ext.DomHelper.append(document.body, {
                tag: "pre",
                cls: "x-form-grow-sizer"
            });
            if (this.preventScrollbars) {
                this.el.setStyle("overflow", "hidden");
            }
            this.el.setHeight(this.growMin);
        }
        this.on("render", function () {
            var oFCKeditor = new FCKeditor(this.id);
            oFCKeditor.BasePath = this.BasePath;
            if (this.SkinPath)
                oFCKeditor.Config['SkinPath'] = this.SkinPath;
            oFCKeditor.Height = this.height;
            oFCKeditor.ReplaceTextarea();
        });
    },
    setValue: function (value) {
        this.instanceValue = value;
        if (this.instanceLoaded) {
            this.FCKeditorSetValue(value);
        }
        Ext.form.TextArea.superclass.setValue.apply(this, [value]);
    },
    setIsLoaded: function (v) {
        this.instanceLoaded = v;
    },
    getIsLoaded: function () {
        return this.instanceLoaded;
    },
    getValue: function () {
        if (this.instanceLoaded) {
            value = this.FCKeditorGetValue();
            Ext.form.TextArea.superclass.setValue.apply(this, [value]);
            return Ext.form.TextArea.superclass.getValue.call(this);
        } else {
            return this.instanceValue;
        }
    },
    getRawValue: function () {
        if (this.instanceLoaded) {
            value = this.FCKeditorGetValue();
            Ext.form.TextArea.superclass.setRawValue.apply(this, [value]);
            return Ext.form.TextArea.superclass.getRawValue.call(this);
        } else {
            return this.instanceValue;
        }
    },
    FCKeditorSetValue: function (value) {
        if (this.instanceLoaded == false) {
            return;
        }
        var runner = new Ext.util.TaskRunner();
        var task = {
            run: function () {
                try {
                    var editor = this.editorInstance;
                    if (editor.EditorDocument.body) {
                        editor.SetData(value);
                        runner.stop(task);
                    }
                } catch (ex) {
                    //Ext.logf('调试信息(info)：{0}', ex);
                }
            },
            interval: 100,
            scope: this
        };
        runner.start(task);
    },
    FCKeditorGetValue: function () {
        var data = '';
        if (this.instanceLoaded == false) {
            return data;
        }
        data = this.editorInstance.GetData();
        return data;
    }
});
Ext.reg('fckeditor', Ext.form.FCKeditor);

function FCKeditor_OnComplete(editorInstance) {
    var activeEditor = Ext.getCmp(editorInstance.Name);
    activeEditor.editorInstance = editorInstance;
    activeEditor.instanceLoaded = true;
    activeEditor.FCKeditorSetValue(activeEditor.instanceValue);
}

//日期段限制
Ext.apply(Ext.form.VTypes, {
    daterange: function (val, field) {
        var date = field.parseDate(val);
        if (!date)
            return;

        if (field.startDateField && (!this.dateRangeMax || (date.getTime() != this.dateRangeMax.getTime()))) {
            var start = Ext.getCmp(field.startDateField);
            start.setMaxValue(date);
            this.dateRangeMax = date;
            start.validate();
        } else if (field.endDateField && (!this.dateRangeMin || (date.getTime() != this.dateRangeMin.getTime()))) {
            var end = Ext.getCmp(field.endDateField);
            end.setMinValue(date);
            this.dateRangeMin = date;
            end.validate();
        }
        return true;
    }
});

Ext.form.ChooseTriggerField = Ext.extend(Ext.form.TwinTriggerField, {
    editable: false,
    //cls:'x-form-span',
    trigger1Class: 'x-form-clear-trigger',
    trigger2Class: 'x-form-org-trigger',
    hideTrigger1: true,
    initComponent: function () {
        Ext.form.ChooseTriggerField.superclass.initComponent.call(this);
    },
    onRender: function (ct, position) {
        Ext.form.ChooseTriggerField.superclass.onRender.call(this, ct, position);
        if (!this.hiddenName)
            this.hiddenName = Ext.id();
        this.hiddenField = this.el.insertSibling({ tag: 'input', type: 'hidden', name: this.hiddenName,
            id: (this.hiddenId || Ext.id())
        }, 'before', true);
    },
    getText: function () {
        return this.el.dom.value
    },
    setText: function (v) {
        this.el.dom.value = v;
    },
    getValue: function () {
        var v = this.value;
        if (v === this.emptyText || v === undefined) {
            v = '';
        }
        return v;
    },
    setValue: function (displayValue, fieldValue) {
        var text = displayValue, v = fieldValue || displayValue;
        if (this.hiddenField) {
            this.hiddenField.value = Ext.value(v, '');
        }
        Ext.form.ChooseTriggerField.superclass.setValue.call(this, text);
        this.value = v;
        if (v !== this.emptyText && v !== undefined && v !== '')
            this.triggers[0].show();
        return this;
    },
    onTrigger1Click: function () {
        if (this.hasSearch) {
            this.el.dom.value = '';
            this.value = '';
            this.triggers[0].hide();
            this.hasSearch = false;
        }
    },
    onTrigger2Click: function () {
        //        var v = this.getRawValue();
        //        if(v.length < 1){
        //            this.onTrigger1Click();
        //            return;
        //        }
        if (this.handler) {
            this.handler.call(this.scope || this, this);
        }
        this.hasSearch = true;
        //this.triggers[0].show();
    },
    onDestroy: function () {
        Ext.destroyMembers(this, 'hiddenField');
        Ext.form.ChooseTriggerField.superclass.onDestroy.call(this);
    }
});
Ext.reg('choosetriggerfield', Ext.form.ChooseTriggerField);

Ext.ux.IconCombo = function (config) {
    Ext.ux.IconCombo.superclass.constructor.call(this, config);
    this.tpl = config.tpl ||
        '<tpl for=".">'
        + '<div class="x-combo-list-item">'
        + '<table><tbody><tr>'
        + '<td>'
        + '<div class="x-icon-combo-icon"><img style="width:16px;height:16px;" alt="" src="{' + this.iconClsField + '}" /></div></td>'
        + '<td>{' + this.displayField + '}</td>'
        + '</tr></tbody></table>'
        + '</div></tpl>'
   ;
    this.on({
        render: { scope: this, fn: function () {
            var wrap = this.el.up('div.x-form-field-wrap');
            //            this.wrap.applyStyles({position:'relative'});  
            //            this.el.addClass('x-icon-combo-input');  
            this.flag = Ext.DomHelper.append(wrap, {
                tag: 'div', style: 'position:absolute'
            });
        }
        }
    });
}
Ext.extend(Ext.ux.IconCombo, Ext.form.ComboBox, {
    setIconCls: function () {
        var rec = this.store.query(this.valueField, this.getValue()).itemAt(0);
        if (rec) {
            this.flag.className = 'x-icon-combo-icon ' + rec.get(this.iconClsField);
        }
    },
    setValue: function (value) {
        Ext.ux.IconCombo.superclass.setValue.call(this, value);
        this.setIconCls();
    }
});
//#endregion

//#region 公用的基础方法
///<Summary>
///公用的基础方法
///</Summary>
Ext.namespace("WhiteShell.Globle");
var WSG = WhiteShell.Globle;

//兼容各个版本的窗体关闭
WSG.closeWindow = function () {
    if (Ext.isIE6)//
    {
        window.opener = null;
        window.close();
    }
    else if (Ext.isIE7)// || ie
    {
        window.open('', '_self', '');
        window.close();
    }
    if (Ext.isSafari)//
    {
        window.opener = null;
        window.open('', '_self');
        window.close();
    }
    else {
        window.top.opener = null;
        window.close();
    }
}

//cookies
//设置Cookies
function setCookie(c_name, value, expiredays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = c_name + "=" + escape(value) +
		((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
}
//获取Cookies
function getCookie(c_name) {
    if (document.cookie.length > 0) {
        var ck = document.cookie.split(';');
        for (var i = 0; i < ck.length; i++) {
            c_start = ck[i].indexOf(c_name);
            if (c_start != -1) {
                var name = ck[i].split('=');
                return unescape(name[1])
            }
        }
    }
    return ""
}

WhiteShell.Globle.Cookies = {
    //获取指定COOKIE值（不支持带目录的cookie）
    get: getCookie,
    set: setCookie
};
//将object转换为数组
WhiteShell.Globle.toArray = function (obj) {
    var tmp = [obj];
    //if(Ext.isArray(obj))
    if (obj instanceof Array)
        return obj;
    return tmp;
};
//[已过时]，请使用Ext.ux.newGuid************
WhiteShell.Globle.guid = function (separator) {
    return Ext.ux.newGuid(separator);
};

//xml内容中包含的转义字符替换为相应的实体 added by lyf 09.08.14
WhiteShell.Globle.toXmlStandardization = function (xmlInnerText) {
    //只处理字符串的情况;
    if (typeof (xmlInnerText) == 'string') {
        xmlInnerText = xmlInnerText.replace(/&/g, '&amp;');
        xmlInnerText = xmlInnerText.replace(/</g, '&lt;');
        xmlInnerText = xmlInnerText.replace(/>/g, '&gt;');
        xmlInnerText = xmlInnerText.replace(/\'/g, '&apos;');
        xmlInnerText = xmlInnerText.replace(/\"/g, '&quot;');
    }
    return xmlInnerText;
};
WhiteShell.Globle.fromXmlStandardization = function (xmlInnerText) {
    //只处理字符串的情况;
    if (typeof (xmlInnerText) == 'string') {
        xmlInnerText = xmlInnerText.replace(/\&lt\;/g, '<');
        xmlInnerText = xmlInnerText.replace(/\&gt\;/g, '>');
        xmlInnerText = xmlInnerText.replace(/\&apos;/g, '\'');
        xmlInnerText = xmlInnerText.replace(/\&quot\;/g, '"');
        xmlInnerText = xmlInnerText.replace(/\&amp\;/g, '&');
    }
    return xmlInnerText;
};
//输出表单数据类型
WhiteShell.Globle.outputType = 1; //0->json string; 1->json object; 2->xml string;

//根据name查找表单面板(formPanel)中的表单项（form.field）
WhiteShell.Globle.GetExtComponetByName = function (formPanel, fieldName) {
    var ComponentControl = null;
    for (var i = 0; i < formPanel.form.items.items.length; i++) {
        if (formPanel.form.items.items[i].name == fieldName) {
            ComponentControl = formPanel.form.items.items[i];
            break;
        }
    }
    return ComponentControl;
}

Ext.namespace("WhiteShell.Globle.Polocy");
//最高消费政策
WhiteShell.Globle.Polocy.maxPrice = function (policyName) {
    return function (v) {
        if (v == "")
            return true;
        return v <= WhiteShell.FormAssembly.businessForm.getPolicyByName(policyName);
    }
};
Ext.form.Field.override({
    isField: true
});

//组件类型
WhiteShell.Globle.CompType = {
    BLOCK: 'block',
    GRID: 'grid',
    FIELD: 'field',
    CONTAINER: 'container',
    OTHER: 'other',
    //对比组件类型
    getCompType: function (comp) {
        //if()
        var xtype = comp.getXType ? comp.getXType() : comp.xtype;
        switch (xtype) {
            //表单项  
            case 'textfield':
            case 'trigger':
            case 'textarea':
            case 'combo':
            case 'lovcombo':
            case 'checkbox':
            case 'radio':
            case 'hidden':
            case 'htmleditor':
            case 'datefield':
            case 'datetimefield':
            case 'timefield':
            case 'numberfield':
            case 'moneyfield':
            case 'spanfield':
            case 'calendarpicker':
            case 'fckeditor':
            case 'commoncombo':
            case 'displayfield':
            case 'checkboxgroup':
            case 'radiogroup':
            case 'hytriggerfield':
            case 'ubidisplayfield':
                return this.FIELD;
                //表格
            case 'grid':
            case 'editorgrid':
            case 'multipleupload':
            case 'upload':
                return this.GRID;
                //子版块
            case 'formblock':
            case 'formsubwinblock':
                return this.BLOCK;
                //表单项与表格容器
            case 'form':
            case 'panel':
            case 'tabpanel':
            case 'window':
                return this.CONTAINER;
            default:
                return this.OTHER;
        }
    }
};

///<Summary>
///格式转换基础方法
///</Summary>
WhiteShell.Globle.DataFormat = {
    //返回当前日期
    nowDate: function () {
        return (new Date()).dateFormat('Y/m/d');
    },
    //序列化表单grid数据源
    gridStoreSerialization: function (gridStore) {
        if (!gridStore)
            return null;

        var rtnJsonObj = { row: [] };
        Ext.each(gridStore.data.items, function (recordItem) {
            var itemObj = {};

            for (var key in recordItem.data) {
                //不保存未定义和无值数据
                if (recordItem.data[key] != undefined && recordItem.data[key] != null)
                    if (recordItem.data[key] instanceof Date)
                        itemObj[key] = recordItem.data[key].dateFormat('Y/m/d H:i:s');
                    else
                        itemObj[key] = recordItem.data[key].toString();
                //else{
                //delete rtnJsonObj[fieldItem.name];
                //itemObj[key] = recordItem.data[key].toString();
                //}
            }
            rtnJsonObj.row.push(itemObj);
        });

        return rtnJsonObj;
    },
    //反序列化表单grid数据源
    gridStoreDeserialize: function (gridJsonObj, gridStore) {
        if (!gridJsonObj.row)
            return;
        gridStore.appendData(gridJsonObj.row);
    },
    //序列化表单fields数据源
    fieldsSerialization: function (fields, rtnJsonObj) {
        if (!fields)
            return null;
        if (!rtnJsonObj)
            rtnJsonObj = {};
        Ext.each(fields, function (fieldItem) {
            //使用xtype判断
            switch (fieldItem.getXType()) {
                case 'combo':
                case 'lovcombo':
                case 'commoncombo':
                    var val = fieldItem.getValue();
                    rtnJsonObj[fieldItem.name + "_Value"] = val;
                    var text = fieldItem.getEl().getValue() || val;
                    rtnJsonObj[fieldItem.name + "_Text"] = text;
                    break;
                case 'radio':
                    rtnJsonObj[fieldItem.id] = fieldItem.getGroupValue();
                    break;
                //				case 'checkbox':   
                //				case 'textfield':   
                //				case 'trigger':   
                //				case 'textarea':   
                //				case 'hidden':   
                case 'datefield':
                case 'datetimefield':
                case 'calendarpicker':
                    if (fieldItem.getValue() != '') //added by zeng 090911
                    {
                        rtnJsonObj[fieldItem.name] = fieldItem.getValue().dateFormat('Y/m/d');
                    }
                    else
                        rtnJsonObj[fieldItem.name] = ''; //如果日期是空串，跳过格式化
                    break;
                case 'timefield':
                    if (fieldItem.getValue() != '')
                        if (fieldItem.getValue() instanceof Date)
                            rtnJsonObj[fieldItem.name] = fieldItem.getValue().dateFormat('Y/m/d H:i:s');
                        else
                            rtnJsonObj[fieldItem.name] = fieldItem.getValue();
                    else
                        rtnJsonObj[fieldItem.name] = ''; //如果时间是空串，跳过格式化
                    break;
                default:
                    //清理所有值为空的记录，字段的强制输出
                    var fieldOutputable = (!fieldItem.getValue() && fieldItem.getValue() !== false); //updated by lyf 2010/07/06
                    if ((fieldOutputable || fieldItem.needOutput === true) && rtnJsonObj[fieldItem.name])
                        delete rtnJsonObj[fieldItem.name];
                    else if (fieldItem.getValue() == '&#160;')
                        rtnJsonObj[fieldItem.name] = '';
                    else
                        rtnJsonObj[fieldItem.name] = fieldItem.getValue();
                    break;
            }
        });
        return rtnJsonObj;
    },
    //反序列化表单fields数据源
    fieldsDeserialize: function (fieldJsonObj, fieldCmps) {
        Ext.each(WhiteShell.Globle.toArray(fieldCmps), function (fieldItem) {
            var fieldName = fieldItem.name;
            //使用xtype判断
            switch (fieldItem.getXType()) {
                case 'combo':
                case 'lovcombo':
                case 'commoncombo':
                    if (fieldJsonObj[fieldName + "_Value"])
                        fieldItem.setValue(fieldJsonObj[fieldName + "_Value"]);
                    if (fieldJsonObj[fieldName + "_Text"])
                        fieldItem.getEl().dom.value = fieldJsonObj[fieldName + "_Text"];
                    break;
                case 'radio':
                    if (fieldJsonObj[fieldItem.id])
                        fieldItem.setValue(fieldJsonObj[fieldItem.id]);
                    fieldItem.fireEvent("check", fieldItem); //赋值后 激发check事件
                    break;
                case 'datefield':
                case 'datetimefield':
                case 'calendarpicker':
                case 'timefield':
                    if (fieldJsonObj[fieldName]) {
                        fieldItem.setValue(new Date(fieldJsonObj[fieldName]));
                    }
                    break;
                //				case 'checkbox':   
                //				case 'textfield':   
                //				case 'trigger':   
                //				case 'textarea':   
                //				case 'hidden':   
                //				case 'timefield':   
                case 'spanfield':
                    if (fieldJsonObj[fieldName])
                        fieldItem.setValue(fieldJsonObj[fieldName]);
                    break;
                default:
                    if (fieldJsonObj[fieldName])
                        fieldItem.setValue(fieldJsonObj[fieldName]);
                    break;
            }
        });
    },
    //表格列统计
    calculate: function (grid) {
        return this.calculateByColName(grid, null);
    },
    //指定表格列值统计
    calculateByColName: function (grid, colName) {
        var data, r, c, cfg = grid.getView().cm.config, cf;
        var ds = grid.store;
        var rs = ds.getRange(0, ds.getCount() - 1);
        var cs = grid.getView().getColumnData();
        if (rs.length > 0) {
            for (var j = 0, jlen = rs.length; j < jlen; j++) {
                r = rs[j];
                for (var i = 0, len = cs.length; i < len; i++) {
                    c = cs[i];
                    cf = cfg[i];
                    if ((!colName || c.name == colName) && cf.summaryType) {
                        data = Ext.grid.GroupSummary.Calculations[cf.summaryType](data || 0, r, c.name, data);
                    }
                }
            }
        } else {
            data = 0;
        }
        return data;
    },
    //由Ext.Store转换为WhiteShell.Globle.outputType指定类型
    generateJsonFromStore: function (store) {
        var rtnData;
        var recordItems = store.data.items;
        switch (WhiteShell.Globle.outputType) {
            case 0: //返回json string类型
                rtnData = ""; //总数据集字符串
                for (var recordIndex = 0; recordIndex < recordItems.length; recordIndex++) {
                    var recordItem = recordItems[recordIndex];
                    var recordJsonData = recordItem.data;
                    var recordJsonStr = ""; //单条记录字符串					
                    rtnData += "," + this.jsonObj2JsonStr(recordJsonData);
                }
                rtnData = this.createJsonflag("row", [rtnData.tirmLeftComma()]);
                break;
            case 1: //返回json object类型
                rtnData = {};
                rtnData.row = [];
                for (var recordIndex = 0; recordIndex < recordItems.length; recordIndex++) {
                    var recordItem = recordItems[recordIndex];
                    var recordJsonData = recordItem.data;
                    rtnData.row.push(recordJsonData);
                }
                break;
            case 2: //返回xml string类型
                rtnData = ""; //总数据集字符串
                for (var recordIndex = 0; recordIndex < recordItems.length; recordIndex++) {
                    var recordItem = recordItems[recordIndex];
                    var recordJsonData = recordItem.data;
                    var recordJsonStr = ""; //单条记录字符串
                    rtnData += this.createXmlflag("row", this.jsonObj2XmlStr(recordJsonData));
                }
                break;
        }
        return rtnData;
    },
    jsonObj2JsonStr: function (jsonObj) {
        var jsonStr = "";
        for (var key in jsonObj)
            jsonStr += "," + this.createJsonflag(key, this.escape(jsonObj[key]));

        return "{" + jsonStr.tirmLeftComma() + "}";
    },
    jsonObj2XmlStr: function (jsonObj) {
        var xmlStr = "";
        for (var key in jsonObj)
            xmlStr += this.createXmlflag(key, this.escape(jsonObj[key]));

        return xmlStr;
    },
    escape: function (str) {
        if (str instanceof Date)
            str = str.dateFormat('Y/m/d');
        return str.toString().replace("\\", "\\\\").replace("'", "\\'").replace("<", "&lt;").replace(">", ">");
    },
    createXmlflag: function (flag, val) {
        return "<" + flag + ">" + val + "</" + flag + ">";
    },
    createJsonflag: function (flag, val, isObj) {
        switch (val.constructor) {
            case Array:
                return flag + ":[" + val.toString() + "]";
            case Boolean:
                return flag + ":" + val.toString();
            case Number:
                return flag + ":" + val;
            default:
                if (isObj)
                    return flag + ":{" + val.toString() + "}";
                else
                    return flag + ":'" + val + "'";
        }
    },
    //将JSON转XML
    json2xml: function (o, tab) {
        var toXml = function (v, name, ind) {
            var xml = "";
            if (v instanceof Array) {
                for (var i = 0, n = v.length; i < n; i++)
                    xml += ind + toXml(v[i], name, ind + "\t") + "\n";
            }
            else if (typeof (v) == "object") {
                var hasChild = false;
                xml += ind + "<" + name;
                for (var m in v) {
                    if (m.charAt(0) == "@")
                        xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
                    else
                        hasChild = true;
                }
                xml += hasChild ? ">" : "/>";
                if (hasChild) {
                    for (var m in v) {
                        if (m == "#text")
                            xml += WhiteShell.Globle.toXmlStandardization(v[m]);
                        else if (m == "#cdata")
                            xml += "<![CDATA[" + v[m] + "]]>";
                        else if (m.charAt(0) != "@")
                            xml += toXml(v[m], m, ind + "\t");
                    }
                    xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">";
                }
            }
            else {
                xml += ind + "<" + name + ">" + WhiteShell.Globle.toXmlStandardization(v.toString()) + "</" + name + ">";
            }
            return xml;
        };
        var xml = "";
        for (var m in o)
            xml += toXml(o[m], m, "");
        //return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");//替换/n去掉，因为textArea要支持换行
        return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t/g, "");
    },
    object2Xml: function (o, tab) {
        var toXml = function (v, name, ind) {
            var xml = "";
            //当传入对象为数组时
            if (v instanceof Array) {
                for (var i = 0, n = v.length; i < n; i++)
                    xml += ind + toXml(v[i], name, ind + "\t") + "\n";
            }
            else if (typeof (v) == "object") {
                var hasChild = false;
                xml += ind + "<" + name;
                for (var m in v) {
                    if (m.charAt(0) == "@")
                        xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
                    else
                        hasChild = true;
                }
                xml += hasChild ? ">" : "/>";
                if (hasChild) {
                    for (var m in v) {
                        if (m == "#text")
                            xml += WhiteShell.Globle.toXmlStandardization(v[m]);
                        else if (m == "#cdata")
                            xml += "<![CDATA[" + v[m] + "]]>";
                        else if (m.charAt(0) != "@")
                            xml += toXml(v[m], m, ind + "\t");
                    }
                    xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">";
                }
            }
            else {
                xml += ind + "<" + name + ">" + WhiteShell.Globle.toXmlStandardization(v.toString()) + "</" + name + ">";
            }
            return xml;
        };
        var xml = "";
        for (var m in o)
            xml += toXml(o[m], m, "");
        return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
    },
    // 数字金额转换汉字金额
    atoc: function (numberValue) {
        //是否为负数
        var isNegative = numberValue < 0;
        var numberValue = new String(Math.round(Math.abs(numberValue) * 100)); // 数字金额
        var chineseValue = ""; // 转换后的汉字金额
        var String1 = "零壹贰叁肆伍陆柒捌玖"; // 汉字数字
        var String2 = "万仟佰拾亿仟佰拾万仟佰拾元角分"; // 对应单位
        var len = numberValue.length; // numberValue 的字符串长度
        var Ch1; // 数字的汉语读法
        var Ch2; // 数字位的汉字读法
        var nZero = 0; // 用来计算连续的零值的个数
        var String3; // 指定位置的数值
        if (len > 20) {
            alert("金额数已超过计算范围，金额总数超过20位");
            return "";
        }
        if (numberValue == 0) {
            chineseValue = "零元整";
            return chineseValue;
        }
        String2 = String2.substr(String2.length - len, len); // 取出对应位数的STRING2的值
        for (var i = 0; i < len; i++) {
            String3 = parseInt(numberValue.substr(i, 1), 10); // 取出需转换的某一位的值
            //alert(String3);
            if (i != (len - 3) && i != (len - 7) && i != (len - 11) && i != (len - 15)) {
                if (String3 == 0) {
                    Ch1 = "";
                    Ch2 = "";
                    nZero = nZero + 1;
                } else if (String3 != 0 && nZero != 0) {
                    Ch1 = "零" + String1.substr(String3, 1);
                    Ch2 = String2.substr(i, 1);
                    nZero = 0;
                } else {
                    Ch1 = String1.substr(String3, 1);
                    Ch2 = String2.substr(i, 1);
                    nZero = 0;
                }
            } else { // 该位是万亿，亿，万，元位等关键位
                if (String3 != 0 && nZero != 0) {
                    Ch1 = "零" + String1.substr(String3, 1);
                    Ch2 = String2.substr(i, 1);
                    nZero = 0;
                } else if (String3 != 0 && nZero == 0) {
                    Ch1 = String1.substr(String3, 1);
                    Ch2 = String2.substr(i, 1);
                    nZero = 0;
                } else if (String3 == 0 && nZero >= 3) {
                    Ch1 = "";
                    Ch2 = "";
                    nZero = nZero + 1;
                } else {
                    Ch1 = "";
                    Ch2 = String2.substr(i, 1);
                    nZero = nZero + 1;
                }

                if (i == (len - 11) || i == (len - 3)) { // 如果该位是亿位或元位，则必须写上
                    Ch2 = String2.substr(i, 1);
                }
            }
            chineseValue = chineseValue + Ch1 + Ch2;
        }

        if (String3 == 0) { // 最后一位（分）为0时，加上“整”
            chineseValue = chineseValue + "整";
        }

        if (isNegative)
            chineseValue = '负' + chineseValue;

        return chineseValue;
    }
};

WhiteShell.Globle.Uri = {
    UrlParm: (function () {
        return {
            //获得参数,类似request.getParameter()
            parm: function (o) { // o: 参数名或者参数次序

                function F(o) {
                    return o.substring(o.indexOf("#"));
                }

                function getQuery(name) {
                    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");

                    var r = F(window.location.search).substr(1).match(reg);
                    if (r != null)
                        return decodeURI(r[2]);
                    return null;
                }
                return getQuery(o);
            },
            hasParm: function (o) {
                return !!this.parm(o);
            }
        }
    })()
};
var UrlParm = WhiteShell.Globle.Uri.UrlParm;
/*
//例如
// URL是 http://127.0.0.1/demo.jsp?a&page=2&b=dd&c=123&b=dd2
UrlParm.parm(0) // 结果: "";
UrlParm.parm( 'a' )// 结果: "";
UrlParm.parm( 'page' ) // 结果: "2";
UrlParm.parm(1) // 结果: "2";

UrlParm.parm( "b" )// 结果: "dd";
UrlParm.hasParm( "b" ) // 结果: true;
UrlParm.hasParm( "x" ) // 结果: false;
*/
//#endregion

//#region Mytask刷新主页面、最大化打开窗口、用户自定义列
//刷新主页面
//function cmbk_refreshMytask() {
//    alert(window.opener.Ext.getCmp("mytask"));
//    if (window.opener == null) {
//        alert("window.opener == null");
//        return;
//    }
//    if (window.opener.Ext.getCmp("mytask") == null) {
//        alert("mytask == null");
//        return;
//    }
//    window.opener.Ext.getCmp("mytask").refreshMyTask();
//}
//最大化打开窗口
function cmbk_openWindowMax(url) {
    url = url.replace(/\&amp;/g, "&");
    window.open(url, '', 'left=0,top=0,width=' + (screen.availWidth - 10) + ',height=' + (screen.availHeight - 30) + ',toolbar=no,menubar=no,scrollbars=no,status=no,location=no,resizable=yes')
}
///用户自定义列
Ext.util.appendCustomColumn = function (grid, procsetName) {
    // return;

    //alert(WhiteShell.FormAssembly.businessForm.isOriginate());
    //    alert(WhiteShell.FormAssembly.businessForm.getViewState());
    var slefFrom = WhiteShell.FormAssembly.businessForm; //申请和重发起页面不需要自定义列

    //    if (slefFrom != null && (slefFrom.isOriginate() || slefFrom.getViewState() == "republish") && ((self.location + "").indexOf("AccountPayable.aspx") == -1) && ((self.location + "").indexOf("AffirmPayment.aspx") == -1) && ((self.location + "").indexOf("PrintMediaProcess.aspx") == -1))
    //        return;

    var gridId = grid.id;
    var appendCustomColumnUrl = 'GridCustomColumns.ashx';
    //--------------------------------------------私有方法--------------------------------------------
    //保存自定义列的方法
    var saveCustomColumns = function () {
        //Ext.Msg.confirm('提示', '确认保存自定义列信息?', function(btn) {


        var CM = grid.getColumnModel();
        //创建CheckBox数组
        var showWindowArg_01 = [];
        for (var i = 0; i < CM.getColumnCount(); i++) {
            var colName = CM.getColumnId(i);
            if (colName == "checker" || colName == "numberer")
                continue;
            var column = CM.getColumnById(i);

            // alert(column.hideable + "=="+column.hidden )
            var CBOX_V;
            if (column.hideable + "" == "undefined") {
                if (column.hidden + "" == "undefined") {
                    CBOX_V = true;
                }
                else {
                    if (column.hidden + "" == "true")
                        CBOX_V = false;
                    else
                        CBOX_V = true;
                }

            }
            else {
                if (column.hidden + "" == "undefined") {
                    if (column.hidden + "" == "true")
                        CBOX_V = false;
                    else
                        CBOX_V = true;
                }
                else {
                    if (column.hidden + "" == "true")
                        CBOX_V = false;
                    else
                        CBOX_V = true;
                }
            }
            //CBOX_V =  column.hidden;


            var T_CBOX = new Ext.form.Checkbox({
                boxLabel: "<span style='font-size:15px'>" + column.header + "</span>",
                id: column.dataIndex,
                checked: CBOX_V
            });
            showWindowArg_01[showWindowArg_01.length] = T_CBOX;
        }
        var showWindowHeight = 20 * showWindowArg_01.length + 100; //弹出窗口的高度
        var showPanel = new Ext.Panel({
            layout: 'form',
            width: 290,
            height: showWindowHeight - 20,
            frame: true,
            labelWidth: 10,
            items: showWindowArg_01
        });

        var gridCustomWidnow = new Ext.Window({
            title: "选择列",
            width: 300,
            height: showWindowHeight,
            frame: true,
            modal: true,
            border: false,
            items: showPanel,
            buttonAlign: 'center',
            buttons: [{
                text: '确定',
                handler: function () {
                    gridCustomWidnow.close();
                    saveCustomColumns_01(grid, showWindowArg_01);

                }
            }]

        });
        gridCustomWidnow.show();


        //        var showWindowHeight = 30 * showWindowRows + 100;//弹出窗口的高度
        //        //把所有列信息传入/web/aspx/ColumnSelect.htm页面，该页面根据传入的列数据生成相应的checkbox数组
        //        var result = window.showModalDialog('/web/page/CustomColumn/ColumnSelect.htm', showWindowArg, 'resizable:no;scroll:yes;status:no;dialogWidth=250px;dialogHeight=' + showWindowHeight + 'px;center=yes;help=no');

    }
    //保存自定义列
    var saveCustomColumns_01 = function (grid, cboxArray) {

        if (true) {//解析弹出页面的返回值
            //            var newListArr = result.split("|");

            var CM = grid.getColumnModel();
            for (var i = 0; i < CM.getColumnCount(); i++) {
                var colName = CM.getColumnId(i);
                if (colName == "checker" || colName == "numberer")
                    continue;
                var column = CM.getColumnById(i);
                for (var j = 0; j < cboxArray.length; j++) {
                    if (column.dataIndex == cboxArray[j].id) {
                        if (cboxArray[j].checked)
                            column.hidden = false;
                        else
                            column.hidden = true;
                    }
                }
            }
            //重新加载grid的 columnModel
            grid.view.colModel = new Ext.grid.ColumnModel(CM);
            grid.view.refresh(true);

            ///拼接用于保存列所需要的信息
            var customColumnList = "";
            for (var columnIndex = 0; columnIndex < CM.getColumnCount(); columnIndex++) {
                var columnId = CM.getColumnId(columnIndex);
                var column = CM.getColumnById(columnId);
                var columnMappingIndex = CM.getDataIndex(columnIndex);
                if (columnMappingIndex != "")
                //注意字符串的前后顺序，后台拆分时也是按照此顺序 [标题，列名，是否隐藏，排序Id，列宽]
                    customColumnList += column.header + "," + column.dataIndex + ","
			            + (!column.hidden ? 'false' : column.hidden.toString()) + "," + columnIndex.toString() + ","
			            + (column.width ? column.width : '50') + "|";
            }
            customColumnList = customColumnList.substring(0, customColumnList.length - 1);
            Ext.Ajax.request({
                url: appendCustomColumnUrl,
                params: {
                    method: 'GridCustomColumns_Save'
				        , procsetName: procsetName
				        , gridId: gridId
				        , customColumnList: customColumnList
                },
                success: function (data) {
                    Ext.Msg.alert('提示', '保存成功！');
                },
                failure: function () {
                    Ext.Msg.alert('提示', '保存失败！');
                }
            })
        }
    }
    //清除保存的自定义列
    var deleteCustomColumns = function () {
        Ext.Msg.confirm('提示', '确认清除自定义列信息?', function (btn) {
            if (btn == 'yes') {

                Ext.Ajax.request({
                    url: appendCustomColumnUrl,
                    params: {
                        method: 'GridCustomColumns_Delete'
				        , procsetName: procsetName
				        , gridId: gridId
                    },
                    success: function (data) {
                        Ext.Msg.alert('提示', '清除成功！');
                    },
                    failure: function () {
                        Ext.Msg.alert('提示', '清除失败！');
                    }
                })
            }
        })
    }
    //--------------------------------------------私有方法--------------------------------------------

    //为grid添加保存自定义列的按钮(应该判断是否具有自定义列的按钮)

    var buttons = grid.tools;
    if (!buttons) {
        buttons = [];
        grid.tools = buttons;
    }

    buttons.push({
        id: 'save',
        text: '保存自定义列',
        qtip: '保存自定义列',
        specFlag: 'customFlag', //无意义，标识而已(尚未使用)
        handler: saveCustomColumns
    });
    buttons.push({
        id: 'close',
        text: '清除自定义信息',
        qtip: '清除自定义信息',
        specFlag: 'customFlag', //无意义，标识而已(尚未使用)
        handler: deleteCustomColumns
    });

    if (slefFrom != null && (!slefFrom.isOriginate() && slefFrom.getViewState() != "republish") && (((self.location + "").indexOf("AccountPayable.aspx") != -1) || ((self.location + "").indexOf("AffirmPayment.aspx") != -1) || ((self.location + "").indexOf("PrintMediaProcess.aspx") != -1))) {
        var bars = grid.topToolbar;
        for (var i = 0; i < bars.length; i++) {
            if (bars[i].text == "放大显示") {
                buttons.push({
                    id: 'refresh',
                    text: '放大/缩小显示',
                    qtip: '放大/缩小显示',
                    specFlag: 'customFlag',
                    handler: bars[i].handler
                });
            }
        }
    }

    //获取gird的Id
    var ds_CustomColumn = new Ext.data.Store({
        proxy: new Ext.data.HttpProxy({
            url: appendCustomColumnUrl,
            method: "POST",
            timeout: 120000
        }),
        baseParams: { method: "GridCustomColumns_Get", procsetName: procsetName, gridId: gridId },
        reader: new Ext.data.XmlReader(
            { record: 'Table', totalRecords: "result" },
            [
			    { name: 'Id' },
                { name: 'ProcsetName' },
                { name: 'EmpId' },
                { name: 'GridId' },
                { name: 'ColumnName' },
                { name: 'ColumnIndex' },
                { name: 'IsHidden' },
                { name: 'OrderId' },
                { name: 'ColumnWidth' }
            ]
        )
    });
    var originalColumnModel = grid.getColumnModel();
    ds_CustomColumn.on('load', function (store) {
        //有自定义列的信息时，根据自定义列来构造列模型，并应用到传入的grid
        if (store.data.length > 0) {
            var columnConfig = [];
            Ext.each(store.data.items, function (dsItem) {
                var columnItem = {};
                //标题
                columnItem.header = dsItem.data.ColumnName;
                //列对应的dataIndex
                columnItem.dataIndex = dsItem.data.ColumnIndex;
                var columnCount = originalColumnModel.getColumnCount();
                //获取原来配置中的renderer和editor(暂时用循环来做，可能会影响效率问题，但没找到更好的方法)
                for (var columnIndex = 0; columnIndex < columnCount; columnIndex++) {
                    var columnId = originalColumnModel.getColumnId(columnIndex);
                    var column = originalColumnModel.getColumnById(columnId);
                    var columnMappingIndex = originalColumnModel.getDataIndex(columnIndex);
                    if (columnMappingIndex == columnItem.dataIndex) {
                        //                        columnItem.renderer = column.renderer;
                        //                        columnItem.editor = column.editor;
                        columnItem = column;
                        break;
                    }
                }
                //是否隐藏
                if (dsItem.data.IsHidden.toLowerCase() != 'true' && dsItem.data.IsHidden.toLowerCase() != '1') {
                    hidden = false;
                }
                else {
                    hidden = true;
                }
                columnItem.hidden = hidden;
                columnItem.hideable = true; //是否可隐藏
                columnItem.sortable = true; //排序
                columnItem.width = parseInt(dsItem.data.ColumnWidth);
                columnConfig.push(columnItem);
            })
            //grid.on('render', function(){
            var columnModel = new Ext.grid.ColumnModel(columnConfig);
            //grid.reconfigure(grid.store, columnModel); //);originalColumnModel
            grid.view.colModel = new Ext.grid.ColumnModel(columnModel);

            // 更改顺序
            var columnModel = grid.getColumnModel();
            var columnCount = columnModel.getColumnCount();
            Ext.each(store.data.items, function (dsItem) {
                var nowIndex = dsItem.data.OrderId;
                var tempIndex = 0;
                for (var columnIndex = 0; columnIndex < columnCount; columnIndex++) {
                    var columnId = columnModel.getColumnId(columnIndex);
                    var column = columnModel.getColumnById(columnId);
                    if (column.dataIndex == dsItem.data.ColumnIndex) {
                        tempIndex = columnIndex;
                        break;
                    }
                }
                if (nowIndex != tempIndex) {
                    var tempConfig = columnModel.config[nowIndex];
                    columnModel.config[nowIndex] = columnModel.config[tempIndex];
                    columnModel.config[tempIndex] = tempConfig;
                }
            })

            grid.view.refresh(true);
            //});
        }
    });
    ds_CustomColumn.load();
}
//#endregion

//#region 放大表单版块、表单grid的放大缩小按钮
/*
* 放大表单版块
//panel需要最大化的版块，必填
//width定义最大化宽度，可选
//height定义最大化高度，可选
*/
function _showBigFormBlock(panel, width, height) {
    //保留原始值以便还原
    var originalValue =
	{
	    //保留原始父节点
	    panelParent: panel.ownerCt,
	    //保留在原父节点中的位置
	    po: panel.ownerCt.items.indexOfKey(panel.id),
	    size: panel.getSize()
	}
    //隐藏版块标题栏
    panel.header.hide('display');

    var win = new Ext.Window({
        title: panel.title,
        closable: true,
        width: width || 700,
        height: height || originalValue.size.height,
        border: false,
        plain: true,
        layout: 'fit',
        plain: true,
        items: panel,
        modal: true,
        maximizable: (width || height),
        maximized: (!width && !height), //不定义窗口大小时，默认最大化
        listeners: {
            close: function (e) {
                originalValue.panelParent.insert(originalValue.po, panel);
                panel.header.show();
                panel.setSize(originalValue.size.width, originalValue.size.height);
                originalValue.panelParent.doLayout();
                win.destroy();
            }
        }
    });
    win.show(this);
}

/*
grid的放大缩小按钮
*/
var SHOW_BIG_GRID_FLG = false;
var SHOW_BIG_GRID_FLG_DO = false;
var newVisiableArray = new Array();
var isFirstShowBigFlg = true;
//function __showBigGrid(grid,blockArray,showBlockId,formBlockId, oldWidth, oldHeight) 
function __showBigGrid(grid, obj, oldWidth, oldHeight) {

    var hideArray = [];
    var blockArray = obj.caller.blockArray;

    for (var i = 0; i < blockArray.length; i++) {
        if (obj.id != blockArray[i].id)
            hideArray[i] = blockArray[i].id;
    }

    var screenWidth = screen.width - 60;
    var screenHeight = screen.height;

    for (var i = 0; i < hideArray.length; i++) {
        if (hideArray[i] != "") {
            if (!SHOW_BIG_GRID_FLG) {
                if (Ext.getCmp(hideArray[i]) && Ext.getCmp(hideArray[i]).isVisible()) {
                    newVisiableArray.push(hideArray[i]);
                    Ext.getCmp(hideArray[i]).hide();
                }
            } else {
                for (var k = 0; k < newVisiableArray.length; k++) {
                    if (newVisiableArray[k] == hideArray[i]) {
                        Ext.getCmp(hideArray[i]).show();
                    }
                }
            }
        }
    }

    var CM = grid.getColumnModel();
    var CM_COUNT = CM.getColumnCount();
    for (var j = 0; j < CM_COUNT; j++) {
        var OLD_WIDTH = CM.getColumnWidth(j);
        if (CM.getDataIndex(j) && CM.getDataIndex(j) != "") {
            if (!SHOW_BIG_GRID_FLG) {
                grid.getView().forceFit = true;
                CM.setColumnWidth(j, OLD_WIDTH);
            }
            else {

                grid.getView().forceFit = false;
                CM.setColumnWidth(j, OLD_WIDTH);
            }
        }
    }

    if (SHOW_BIG_GRID_FLG) {
        grid.setWidth(oldWidth);
        grid.setHeight(oldHeight);
        Ext.getCmp(obj.caller.id).setWidth(oldWidth + 20)
    }
    else {
        grid.setWidth(screenWidth);
        grid.setHeight(screenHeight - 400);

        Ext.getCmp(obj.caller.id).setWidth(screenWidth)
    }

    if (!SHOW_BIG_GRID_FLG) {
        SHOW_BIG_GRID_FLG = true;
    } else {
        SHOW_BIG_GRID_FLG = false;
    }

    var spans = document.getElementsByTagName("button");
    for (var i = 0; i < spans.length; i++) {
        if (spans[i].innerHTML == "放大显示") {
            spans[i].innerHTML = "缩小显示";
        } else if (spans[i].innerHTML == "缩小显示") {
            spans[i].innerHTML = "放大显示";
        }
    }
    return;
    /////下面是完美的代码






    SHOW_BIG_GRID_FLG_DO = true;
    var divs = document.getElementsByTagName("div");
    var spans = document.getElementsByTagName("button");
    var screenWidth = screen.width - 60;
    var screenHeight = screen.height - 400;
    var widthDiff = screenWidth - oldWidth;

    for (var i = 0; i < divs.length; i++) {
        if (!SHOW_BIG_GRID_FLG) {
            var oldKey = (oldWidth + "").substring(0, 1);
            if (divs[i].style && divs[i].style.width) {
                var tempWidth = divs[i].style.width + "";
                tempWidth = tempWidth.replace("px", "");
                var widthNum = parseInt(tempWidth, 10);
                if (widthNum <= oldWidth && (oldWidth - 50) <= widthNum && tempWidth.indexOf(oldKey) == 0) {
                    widthNum += widthDiff;
                    divs[i].style.width = widthNum + "px";
                }
            }
        } else {
            if (divs[i].style && divs[i].style.width) {
                var tempWidth = divs[i].style.width + "";
                tempWidth = tempWidth.replace("px", "");
                var widthNum = parseInt(tempWidth, 10);
                widthNum = widthNum - widthDiff;
                if (widthNum <= oldWidth && (oldWidth - 50) <= widthNum) {
                    divs[i].style.width = widthNum + "px";
                }
            }
        }
    }

    if (!SHOW_BIG_GRID_FLG) {
        grid.setHeight(screenHeight);
    } else {
        grid.setHeight(oldHeight);
    }

    for (var i = 0; i < spans.length; i++) {
        if (spans[i].innerHTML == "放大显示") {
            spans[i].innerHTML = "缩小显示";
        } else if (spans[i].innerHTML == "缩小显示") {
            spans[i].innerHTML = "放大显示";
        }
    }

    if (hideArray) {
        for (var i = 0; i < hideArray.length; i++) {
            if (hideArray[i] != "") {
                if (Ext.getCmp(hideArray[i])) {
                    if (!SHOW_BIG_GRID_FLG) {
                        Ext.getCmp(hideArray[i]).hide();
                    } else {
                        Ext.getCmp(hideArray[i]).show();
                    }
                }
            }
        }
    }

    var slefFrom = WhiteShell.FormAssembly.businessForm;
    if (newHideArray && slefFrom != null && (!slefFrom.isOriginate() && slefFrom.getViewState() != "republish")) {
        if (isFirstShowBigFlg) {
            for (var i = 0; i < newHideArray.length; i++) {
                if (newHideArray[i] != "") {
                    if (Ext.getCmp(newHideArray[i])) {
                        if (!SHOW_BIG_GRID_FLG) {
                            if (Ext.getCmp(newHideArray[i]).isVisible()) {
                                Ext.getCmp(newHideArray[i]).hide();
                                newVisiableArray.push(newHideArray[i]);
                            }
                        } else {
                            Ext.getCmp(newHideArray[i]).show();
                        }
                    }
                }
            }
            isFirstShowBigFlg = false;
        } else {
            for (var i = 0; i < newVisiableArray.length; i++) {
                if (!SHOW_BIG_GRID_FLG) {
                    Ext.getCmp(newVisiableArray[i]).hide();
                } else {
                    Ext.getCmp(newVisiableArray[i]).show();
                }
            }
        }
    }

    if (!SHOW_BIG_GRID_FLG) {
        SHOW_BIG_GRID_FLG = true;
    } else {
        SHOW_BIG_GRID_FLG = false;
    }
    SHOW_BIG_GRID_FLG_DO = false;
}
//#endregion

//#region HY.ChooseWidget
Ext.namespace('HY.ChooseWidgetMgr');
//管理资源选择面板
HY.ChooseWidgetMgr = Ext.apply(new Ext.util.MixedCollection(), {
    //可一次性注入多个已生成或者尚未生成的选择控件
    register: function () {
        for (var i = 0, s; (s = arguments[i]); i++) {
            this.add(s);
        }
    },
    unregister: function () {
        for (var i = 0, s; (s = arguments[i]); i++) {
            this.remove(this.lookup(s));
        }
    },
    //获取对象，如果是未初始化的可以动态初始化，预置的配置也可以动态初始化，以后的则返回已有对象
    lookup: function (id) {
        if (!Ext.isObject(id))
            id = this.get(id);
        if (!(id && id.events)) {
            id = Ext.create(id, id.xtype || 'chooseresources');
            this.register(id);
        }
        return id;
    }
});
HY.ChooseWidgetMgr.reg = HY.ChooseWidgetMgr.register;
HY.ChooseWidgetMgr.unreg = HY.ChooseWidgetMgr.unregister;

Ext.namespace('HY.ChooseWidget');
HY.ChooseWidget.SelectedRecord2String = function (records, keys, sp) {
    if (!sp)
        sp = ',';
    var fileds = {};
    Ext.each(records, function (record) {
        for (var i = 0; i < keys.length; i++) {
            if (!fileds[keys[i]])
                fileds[keys[i]] = [];
            fileds[keys[i]].push(record.get(keys[i]));
        }
    });
    for (var i = 0; i < keys.length; i++) {
        fileds[keys[i]] = fileds[keys[i]].join(sp);
    }
    return fileds
}
//#endregion

//控件中添加入常用列表的方法 added by liyi on 2010.06.01
Ext.namespace('HY.RowCloseIcon');
HY.RowCloseIcon = function (config) {
    Ext.apply(this, config);
};
Ext.extend(HY.RowCloseIcon, Ext.util.Observable, {
    imgIcon: 'mygrid-close',
    init: function (grid) {
        this.grid = grid;
        Ext.apply(this.grid.viewConfig, {
            templates: {
                row: new Ext.Template(
				    '<div class="x-grid3-row {alt} ffffff" style="{tstyle}"><table class="x-grid3-row-table" border="0" cellspacing="0" cellpadding="0" style="{tstyle}">',
				    '<tbody><tr>{cells}<td class="' + this.imgIcon + ' x-grid3-row-shortcut-delete" style="visibility:hidden;cursor:pointer;margin:3px 4px 0 0;padding:0;"></td></tr>',
				    (this.grid.viewConfig.enableRowBody ? '<tr class="x-grid3-row-body-tr" style="{bodyStyle}"><td colspan="{cols}" class="x-grid3-body-cell" tabIndex="0" hidefocus="on"><div class="x-grid3-row-body">{body}</div></td></tr>' : ''),
				    '</tbody></table></div>'
			    )
            }
        });
        //this.cm = grid.getColumnModel();
        this.grid.on('render', function () {
            var mainBody = this.grid.getView().mainBody;
            mainBody.on('mousedown', this.onMousedown, this.grid.getView());
            mainBody.on('mouseover', this.onMouseover, this.grid.getView());
            mainBody.on('mouseout', this.onMouseout, this.grid.getView());
        }, this);
    },
    onMousedown: function (e, t) {
        if (e.button === 0 && t.className.indexOf('x-grid3-row-shortcut-delete') > 0) { // Only fire if left-click
            e.stopEvent();
            var row = e.getTarget('.x-grid3-row');
            if (row) {
                var index = row.rowIndex;
                this.grid.getStore().removeAt(index);
            }
        }
    },
    onMouseover: function (e, t) {
        var row;
        if ((row = this.findRowIndex(t)) !== false) {
            var rowDom = this.getRow(row);
            if (Ext.fly(rowDom).child('.x-grid3-row-shortcut-delete'))
                Ext.fly(rowDom).child('.x-grid3-row-shortcut-delete').show();
        }
    },
    onMouseout: function (e, t) {
        var row;
        if ((row = this.findRowIndex(t)) !== false) {
            var rowDom = this.getRow(row);
            if (Ext.fly(rowDom).child('.x-grid3-row-shortcut-delete'))
                Ext.fly(rowDom).child('.x-grid3-row-shortcut-delete').hide();
        }
    }
});

Ext.namespace('HY.NewRowCloseIcon');
HY.NewRowCloseIcon = function (config) {
    Ext.apply(this, config);
};
Ext.extend(HY.NewRowCloseIcon, Ext.util.Observable, {
    imgIcon: 'mygrid-close',
    init: function (grid) {
        this.grid = grid;
        this.grid.on('render', function () {
            var mainBody = this.grid.getView().mainBody;
            mainBody.on('mousedown', this.onMousedown, this);
            mainBody.on('mouseover', this.onMouseover, this);
            mainBody.on('mouseout', this.onMouseout, this);
        }, this);
    },
    onMousedown: function (e, t) {
        if (e.button === 0 && t.className.indexOf('x-grid3-row-editdefaultemp') >= 0) { // Only fire if left-click
            e.stopEvent();
            var row = e.getTarget('.x-grid3-row');
            if (row) {
                var index = row.rowIndex;
                this.grid.getStore().removeAt(index);
            }
        }
    },
    onMouseover: function (e, t) {
        var row;
        if ((row = this.grid.getView().findRowIndex(t)) !== false) {
            var rowDom = this.grid.getView().getRow(row);
            Ext.fly(rowDom).child('.' + this.imgIcon).show();
        }
    },
    onMouseout: function (e, t) {
        var row;
        if ((row = this.grid.getView().findRowIndex(t)) !== false) {
            var rowDom = this.grid.getView().getRow(row);
            Ext.fly(rowDom).child('.' + this.imgIcon).hide();
        }
    }
});

HY.debug = function () {
    return {
        Log: function (msg) {
            if (window.console)
                console.log(msg);
        },
        Error: function (msg) {
            if (window.console)
                console.log('Error: ' + msg);
        }
    };
} ();
HY.Log = HY.debug.Log;
HY.Error = HY.debug.Error;


//资源等选择组件数据格式转换方法
HY.ChooseWidget.SelectedObj2Array = function (o, sp) {
    if (!sp)
        sp = ',';
    var items = {};
    var keys = [];
    var length = 0;
    for (var key in o) {
        keys.push(key);
        if (!o[key])
            return null;
        items[key] = o[key].split(sp);
        length = items[key].length;
    }

    var records = [];
    for (var i = 0; i < length; i++) {
        var record = {};
        for (var j = 0; j < keys.length; j++) {
            record[keys[j]] = items[keys[j]][i];
        }
        records.push(record);
    }
    return records;
}

HY.ChooseWidget.SelectedRecord2String = function (records, keys, sp) {
    if (!sp)
        sp = ',';
    var fileds = {};
    Ext.each(records, function (record) {
        for (var i = 0; i < keys.length; i++) {
            if (!fileds[keys[i]])
                fileds[keys[i]] = [];
            fileds[keys[i]].push(record.get(keys[i]));
        }
    });
    for (var i = 0; i < keys.length; i++) {
        fileds[keys[i]] = fileds[keys[i]].join(sp);
    }
    return fileds
}


//同步请求后台数据
function Ext_Ajax_syncrequest(o) {

    var params = "";
    var obj = "";
    if (o.params) {
        for (var p in o.params) {
            params += "&" + p + "=" + o.params[p];
        }
    }
    try {
        var conn = Ext.lib.Ajax.getConnectionObject().conn;
        conn.open("GET", o.url + "?method=" + o.method + params + "&guid=" + (new Date()).getTime(), false);
        conn.send(null);
        obj = conn.responseText == '' ? {} : Ext.decode(conn.responseText);
    } catch (e) {
        if (o.error) {
            o.error(e);
        }
    }
    if (o.success) {
        o.success(obj);
    }
}


Ext.namespace('UBI.TriggerField');
UBI.TriggerField = Ext.extend(Ext.form.TriggerField, {
    triggerClass: 'x-form-hypropertyfield',
    initComponent: function () {
        UBI.TriggerField.superclass.initComponent.call(this);
        this.addEvents(
            'triggerclick'
        );
    },
    onTriggerClick: function (cmp, e) {
        if (this.readOnly || this.disabled) {
            return;
        }
        this.fireEvent('triggerclick', this, e);
        this.el.focus();
    },
    setValue: function (v) {
        var old = this.getValue();
        UBI.TriggerField.superclass.setValue.call(this, v);
        this.fireEvent('change', this, v, old);
    }
});
Ext.reg('hytriggerfield', UBI.TriggerField);

//图片组件
HY.Image = Ext.extend(Ext.BoxComponent, {
    src: Ext.BLANK_IMAGE_URL,
    constructor: function (config) {
        config.autoEl = {
            tag: 'img',
            src: config.src || this.src || Ext.BLANK_IMAGE_URL
        };
        HY.Image.superclass.constructor.call(this, config);
    }
});
Ext.reg("hyimage", HY.Image);

Ext.form.ActionField = Ext.extend(Ext.form.TriggerField, {
    triggerClass: 'x-form-hypropertyfield',
    beforeBlur: Ext.emptyFn,
    bindData: Ext.emptyFn,
    isViewAutoVisible: true,
    initView: function () {
        return null;
    },
    getView: function () {
        return this.view;
    },
    validateBlur: function (e) {
        return !this.view || !this.view.isVisible();
    },
    onDestroy: function () {
        Ext.destroy(
                this.view
            );
        Ext.form.ActionField.superclass.onDestroy.call(this);
    },
    doShow: Ext.emptyFn,
    onTriggerClick: function () {
        if (!this.view) {
            this.view = this.initView();
        }
        this.bindData();
        if (this.isViewAutoVisible && this.view.show) {
            this.view.show();
            this.view.setZIndex(this.gridEditor.el.getZIndex() + 10);
        } else {
            this.doShow();
        }
        this.mon(Ext.getDoc(), {
            scope: this,
            mousewheel: this.closeView,
            mousedown: this.closeView
        });
    },
    closeView: function (e) {
        var view = this.view;
        if (!e.within(this.wrap) && !view.el.contains(e.target) && !(view.mask && view.mask.contains(e.target)) && this.validateBlur(e)) {
            this.beforeBlur(e);
            if (this.isViewAutoVisible && view.show) {
                view.hide();
            }
        }
    },

    //复合类型值-----------------------------
    displayText: '',
    wrapFormat: '{0}',
    enableKeyEvents: true,
    initEvents: function () {
        Ext.form.ActionField.superclass.initEvents.call(this);
        this.dqTask = new Ext.util.DelayedTask(this.initQuery, this);
        if (!this.enableKeyEvents) {
            this.mon(this.el, 'keyup', this.onKeyUp, this);
        }
    },
    enforcementType: '', //强制类型转换TypeInteger, TypeBoolean, TypeString
    getDisplay: function (jsonValue) {
        var text;
        if (Ext.isObject(jsonValue)) {
            text = jsonValue.Display || jsonValue.Value;
        } else {
            text = jsonValue;
        }

        if (this.isBasicType(jsonValue))
            return text.toString();
        else
            return String.format(this.wrapFormat, text);
    },
    isBasicType: function (value) {
        var type = this.typeOf(value);
        var index = Ext.StoreMgr.get('variableType').findBy(function (record) {
            if (record.get('category') == 'Basic' && record.get('type') == type) {
                return true;
            }
        });
        return index != -1;
    },
    typeOf: function (value) {
        if (!!this.enforcementType) {
            return this.enforcementType;
        }
        var type;
        if (Ext.isString(value) && (value === '' || value.length == 50)) {//debug临时判断50位code*************
            type = 'TypeString';
        } else if (Ext.isObject(value)) {
            type = value.Type;
        } else if (Ext.isNumber(value) || /^(-?\d+)(\.\d+)?$/.test(value)) {
            //如果值不是json则判断对象类型，生成基本类型格式
            type = 'TypeInteger';
        } else if (Ext.isNumber(value) || value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
            type = 'TypeBoolean';
        } else {
            type = 'TypeString';
        }

        return type;
    },
    convertBaseType: function (jsonValue) {
        if (Ext.isObject(jsonValue))
            return jsonValue;

        var type;
        if (Ext.isString(jsonValue) && (jsonValue === '' || jsonValue.length == 50)) {//debug临时判断50位code*************
            type = { Type: 'TypeString', ReturnType: 'TypeString', Value: jsonValue };
        } else if (!!this.enforcementType) {
            type = { Type: this.enforcementType, ReturnType: this.enforcementType, Value: jsonValue }
        } else if (Ext.isNumber(jsonValue) || /^(-?\d+)(\.\d+)?$/.test(jsonValue)) {
            //如果值不是json则判断对象类型，生成基本类型格式
            type = { Type: 'TypeInteger', ReturnType: 'TypeInteger', Value: parseFloat(jsonValue) };
        } else if (Ext.isNumber(jsonValue) || jsonValue.toLowerCase() === 'true' || jsonValue.toLowerCase() === 'false') {
            type = { Type: 'TypeBoolean', ReturnType: 'TypeBoolean', Value: (jsonValue === true || jsonValue === 'true') };
        } else {
            type = { Type: 'TypeString', ReturnType: 'TypeString', Value: jsonValue };
        }
        return type;
    },
    getValue: function () {
        if (this.value) {
            return Ext.isDefined(this.value) ? this.convertBaseType(this.value) : '';
        } else {
            return Ext.form.ActionField.superclass.getValue.call(this);
        }
    },
    setValue: function (jsonValue) {
        var oldValue = this.oValue, displayValue = '';
        if (Ext.isEmpty(jsonValue)) {
            this.oValue = null;
        } else {
            this.oValue = this.convertBaseType(jsonValue);
            displayValue = this.getDisplay(jsonValue)
        }
        Ext.form.ActionField.superclass.setValue.call(this, displayValue);
        this.value = this.oValue;
        this.updateFieldClass(oldValue);
        return this;
    },
    updateFieldClass: function (oldValue) {
        if (this.rendered) {
            if (oldValue && oldValue.Type) {
                var oldClassName = 'x-field-valuetype-' + oldValue.Type;
                this.el.removeClass(oldClassName);
            }
            if (this.value && this.value.Type) {
                var newClassName = 'x-field-valuetype-' + this.value.Type;
                this.el.addClass(newClassName);
            }
            if (this.value && this.isBasicType(this.value)) {
                this.el.removeClass('x-field-type-flag');
            } else {
                this.el.addClass('x-field-type-flag');
            }
        }
    },
    onKeyUp: function (e) {
        var k = e.getKey();
        //键入BACKSPACE或非特殊键的任意键，视为连续输入，延迟dqTask去执行initQuery方法
        if (this.readOnly !== true && (k == e.BACKSPACE || !e.isSpecialKey())) {
            this.lastKey = k;
            this.dqTask.delay(this.queryDelay);
        }
        Ext.form.ActionField.superclass.onKeyUp.call(this, e);
    },
    initQuery: function () {
        this.doQuery(this.getRawValue());
    },
    doQuery: function (v) {
        //当输入时，需要判断变量类型
        var oldValue = this.oValue;
        this.value = this.oValue = this.convertBaseType(v);
        this.updateFieldClass(oldValue);
    },
    onDestroy: function () {
        if (this.dqTask) {
            this.dqTask.cancel();
            this.dqTask = null;
        }
        Ext.destroy(
                    this.keyNav,
                    this.oValue
                );
        Ext.form.ActionField.superclass.onDestroy.call(this);
    }
});
Ext.reg('actionfield', Ext.form.ActionField);

Ext.namespace('UBI.Xml');
UBI.Xml = {
    selectNodes: function (xml, path) {
        if (Ext.isIE && !Ext.isIE9) {
            return xml.selectNodes(path);
        } else {
            return xml.querySelectorAll(path);
        }
    },
    selectSingleNode: function (xml, path) {
        if (Ext.isIE && !Ext.isIE9) {
            return xml.selectSingleNode(path);
        } else {
            return xml.querySelector(path);
        }
    },
    serializeToString: function (xml) {
        if (Ext.isIE && !Ext.isIE9) {
            return xml.xml;
        } else {
            var serializer = new XMLSerializer();
            return serializer.serializeToString(xml);
        }
    },
    getNodeValue: function (node) {
        if (Ext.isIE && !Ext.isIE9) {
            return node.text;
        } else {
            if (node.childNodes.length != 0 && node.childNodes[0].nodeName == "#text") {
                return node.childNodes[0].nodeValue;
            } else {
                return node.nodeValue;
            }
        }
    }
};


Ext.grid.ComboColumn = Ext.extend(Ext.grid.Column, {
    constructor: function (cfg) {
        Ext.grid.ComboColumn.superclass.constructor.call(this, cfg);
        var combo = this.editor;
        var r2 = this.renderer;
        this.renderer = function (value, metaData, record, rowIndex, colIndex, store) {
            if (combo) {
                var comborecord = combo.findRecord(combo.valueField, value);
                if (comborecord) {
                    record.data[this.displayIndex] = comborecord.get(combo.displayField);
                }
            }
            var v = record.get(this.displayIndex) || value || '';
            if (r2)
                return r2(v, metaData, record, rowIndex, colIndex, store);
            return v;
        };
    }
});
Ext.grid.Column.types['combocolumn'] = Ext.grid.ComboColumn;
