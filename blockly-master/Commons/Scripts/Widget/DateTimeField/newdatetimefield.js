// 命名空间归属
Ext.ns('Ext.ux.form');
// 在该命名空间内，开辟一个名为TimePickerField的区域，我们可以当他是一个时间选择器
Ext.ux.form.TimePickerField = function (config) {
    // 调用构造方法，也就是说定义了他的所属--this
    // this指的是什么呢？这里需要注意，首先这个东东属于这个类（对象），其次这个类（对象）在没有被调用之前或者实例之前是不会被构造的
    // 那么这个this实际上是指我们实例化后的datetimefield
    Ext.ux.form.TimePickerField.superclass.constructor.call(this, config);
}
// 给刚刚定义的TimePickerField加点菜吧。
// 首先它继承与Ext.form.Field，是一个扩展
Ext.extend(Ext.ux.form.TimePickerField, Ext.form.Field, {
    defaultAutoCreate: {
        tag: 'div'// 定义了一个DIV标签
    },
    cls: 'x-form-timepickerfield', // 它的样式
    hoursSpinner: null, // 属性：小时选择器
    minutesSpinner: null, // 属性：分钟选择器
    secondsSpinner: null, // 属性：秒选择器
    spinnerCfg: {
        width: 40// 选择器的宽度定位40px
    },

    // 约束：选择数值约束，如果小于最小值该如何，如果大于最大值该如何，这里的处理方式我详细说明一下（这个约束是触发的，我们输入的值或者我们点击上下箭头选择的值后都会进入该约束检查。）
    spinnerFixBoundries: function (value) {
        // 这里有可能会造成不解，我解释一下。
        // 如果我们选择秒的时候，有一个向上的箭头和向下的箭头，如果我点击向上的箭头则秒数加1，点击向下的箭头则秒数减1。
        // 如果我选择了59秒后，点击向上的箭头，由于时间秒数约束，不可能出现60，那我们要怎么办？会如何？当然是，58,59,0,1这样的序列
        // 所以最大值定义为59，如果超过59那么秒数归零，就是这个逻辑。
        if (value < this.field.minValue) {
            value = this.field.maxValue;
        }
        if (value > this.field.maxValue) {
            value = this.field.minValue;
        }
        // 这里返回了一个带有精度的值
        return this.fixPrecision(value);
    },
    // 渲染，这个没什么可说的了所有的渲染都差不多是位置和范围之类的
    onRender: function (ct, position) {
        Ext.ux.form.TimePickerField.superclass.onRender.call(this, ct, position);
        this.rendered = false;
        this.date = new Date();
        // 定义一个对象，他即将有三个属性，时分秒数值，往下看。
        var values = {};
        // 如果实例时已经被设定了初始值，那么将这些值赋予values这个对象中。
        // 再将这些值表示在时分秒选择器中
        if (this.value) {
            values = this._valueSplit(this.value);
            this.date.setHours(values.h);
            this.date.setMinutes(values.m);
            this.date.setSeconds(values.s);
            delete this.value;
        }
        // 如果实例时没被设定了初始值，简单了，时分秒选择器的初始值就不用改变了，只要values得到这些值备用即可
        else {
            values = {
                h: this.date.getHours(),
                m: this.date.getMinutes(),
                s: this.date.getSeconds()
            };
        }
        // 定义一个外围包裹，就是想把时分秒这三个选择器给包起来成为一组，下面会实例这三个选择器的，往下看。
        var spinnerWrap = Ext.DomHelper.append(this.el, {
            tag: 'div'
        });
        var cfg = Ext.apply({}, this.spinnerCfg, {
            renderTo: spinnerWrap,
            readOnly: this.readOnly,
            disabled: this.disabled,
            listeners: {
                spin: {
                    fn: this.onSpinnerChange,
                    scope: this
                },
                valid: {
                    fn: this.onSpinnerChange,
                    scope: this
                },
                afterrender: {
                    fn: function (spinner) {
                        spinner.wrap.applyStyles('float: left');
                    },
                    single: true
                }
            }
        });
        //为了支持 dateTimeFormat{Y-m-d H:i:s, Y-m-d H:i, Y-m-d H}
        var len = this.dateTimeFormat.length;
        var showhours, showminitues, showseconds;
        if (len == 11) {
            showhours = true;
            showminitues = true;
            showseconds = true;
        }
        else if (len == 9) {
            showhours = true;
            showminitues = true;
            showseconds = false;
        }
        else if (len == 7) {
            showhours = true;
            showminitues = false;
            showseconds = false;
        }
        else {
            showhours = false;
            showminitues = false;
            showseconds = false;
        }

        // 接下来实例（Ext.ux.form.SpinnerField）了几个选择器，时分秒。
        this.hoursSpinner = new Ext.ux.form.SpinnerField(Ext.apply({}, cfg, {
            minValue: 0,
            maxValue: 23,
            cls: 'first',
            hidden: !showhours,
            value: values.h
        }));
        this.minutesSpinner = new Ext.ux.form.SpinnerField(Ext.apply({}, cfg, {
            minValue: 0,
            maxValue: 59,
            hidden: !showminitues,
            value: values.m
        }));
        this.secondsSpinner = new Ext.ux.form.SpinnerField(Ext.apply({}, cfg, {
            minValue: 0,
            maxValue: 59,
            hidden: !showseconds,
            value: values.s
        }));
        Ext.DomHelper.append(spinnerWrap, {
            tag: 'div',
            cls: 'x-form-clear-left'
        });
        // 渲染完毕释放出去
        this.rendered = true;
    },
    // 如果实例时已经被设定了初始值，那么调用这个方法，将这些值赋予values这个对象中。
    _valueSplit: function (v) {
        var split = v.split(':');
        return {
            h: split.length > 0 ? split[0] : 0,
            m: split.length > 1 ? split[1] : 0,
            s: split.length > 2 ? split[2] : 0
        };
    },
    // 注意了，这里加了一个动作的监听，也可以说是自己弄了一个自定义监听
    onSpinnerChange: function () {
        if (!this.rendered) {
            return;
        }
        // 这里注册了这个监听类别，指明了监听的对象
        this.fireEvent('change', this, this.getRawValue());
    },
    // 禁用
    disable: function () {
        Ext.ux.form.TimePickerField.superclass.disable.call(this);
        this.hoursSpinner.disable();
        this.minutesSpinner.disable();
        this.secondsSpinner.disable();
    },
    // 解用
    enable: function () {
        Ext.ux.form.TimePickerField.superclass.enable.call(this);
        this.hoursSpinner.enable();
        this.minutesSpinner.enable();
        this.secondsSpinner.enable();
    },
    // 只读
    setReadOnly: function (r) {
        Ext.ux.form.TimePickerField.superclass.setReadOnly.call(this, r);
        this.hoursSpinner.setReadOnly(r);
        this.minutesSpinner.setReadOnly(r);
        this.secondsSpinner.setReadOnly(r);
    },
    // 清除所有的无效验证
    clearInvalid: function () {
        Ext.ux.form.TimePickerField.superclass.clearInvalid.call(this);
        this.hoursSpinner.clearInvalid();
        this.minutesSpinner.clearInvalid();
        this.secondsSpinner.clearInvalid();
    },
    // 拿到那个值，可以认为是vlaues对象
    getRawValue: function () {
        if (!this.hoursSpinner) {
            this.date = new Date();
            return {
                h: this.date.getHours(),
                m: this.date.getMinutes(),
                s: this.date.getSeconds()
            };
        }
        else {
            return {
                h: this.hoursSpinner.getValue(),
                m: this.minutesSpinner.getValue(),
                s: this.secondsSpinner.getValue()
            };
        }
    },
    // 赋值
    setRawValue: function (v) {
        this.hoursSpinner.setValue(v.h);
        this.minutesSpinner.setValue(v.m);
        this.secondsSpinner.setValue(v.s);
    },
    // 有效验证
    isValid: function (preventMark) {
        return this.hoursSpinner.isValid(preventMark) &&
        this.minutesSpinner.isValid(preventMark) &&
        this.secondsSpinner.isValid(preventMark);
    },
    // 验证
    validate: function () {
        return this.hoursSpinner.validate() &&
        this.minutesSpinner.validate() &&
        this.secondsSpinner.validate();
    },
    // 这里可以自己修改想要的格式，这个值将作为返回值到调用该类的元控件中也就是DateTimeField的实例
    getValue: function () {
        var v = this.getRawValue();
        return String.leftPad(v.h, 2, '0') + ':' +
        String.leftPad(v.m, 2, '0') +
        ':' +
        String.leftPad(v.s, 2, '0');
    },
    setValue: function (value) {
        if (!this.rendered) {
            this.value = value;
            return;
        }
        value = this._valueSplit(value);
        this.setRawValue(value);
        this.validate();
    }
});

// 下面就没什么好说的了，就是将上面自定义的类（对象），成为一个总选择器一部分。
Ext.form.TimePickerField = Ext.ux.form.TimePickerField;
Ext.reg('timepickerfield', Ext.form.TimePickerField);
Ext.ns('Ext.ux.form');
Ext.DateTimePicker = Ext.extend(Ext.DatePicker, {
    timeFormat: 'g:i:s A',
    timeLabel: '时间',
    timeWidth: 100,
    initComponent: function () {
        Ext.DateTimePicker.superclass.initComponent.call(this);
        this.id = Ext.id();
    },
    onRender: function (container, position) {
        Ext.DateTimePicker.superclass.onRender.apply(this, arguments);
        var table = Ext.get(Ext.DomQuery.selectNode('table tbody', container.dom));
        if (this.dateTimeFormat.length >= 7) {
            var tfEl = Ext.DomHelper.insertBefore(table.last(), {
                tag: 'tr',
                children: [{
                    tag: 'td',
                    cls: 'x-date-bottom',
                    html: this.timeLabel,
                    style: 'width:30;'
                }, {
                    tag: 'td',
                    cls: 'x-date-bottom ux-timefield',
                    colspan: '2'
                }]
            }, true);

            this.tf.render(table.child('td.ux-timefield'));
            var p = this.getEl().parent('div.x-layer');
            if (p) {
                p.setStyle("height", p.getHeight() + 31);
            }
        }
    },
    setValue: function (value) {
        var old = this.value;
        if (!this.tf) {
            this.tf = new Ext.ux.form.TimePickerField({ dateTimeFormat: this.dateTimeFormat });
            this.tf.ownerCt = this;
        }
        this.value = this.getDateTime(value);
    },
    getDateTime: function (value) {
        if (this.tf) {
            var dt = new Date();
            var timeval = this.tf.getValue();
            value = Date.parseDate(value.format(this.dateFormat) + ' ' + this.tf.getValue(), this.format);
        }
        return value;
    },
    selectToday: function () {
        if (this.todayBtn && !this.todayBtn.disabled) {
            this.value = this.getDateTime(new Date());
            this.fireEvent("select", this, this.value);
        }
    }, update: function (date, forceRefresh) {
        if (this.rendered) {
            var vd = this.activeDate, vis = this.isVisible();
            this.activeDate = date;
            if (!forceRefresh && vd && this.el) {
                var t = date.getTime();
                if (vd.getMonth() == date.getMonth() && vd.getFullYear() == date.getFullYear()) {
                    this.cells.removeClass('x-date-selected');
                    this.cells.each(function (c) {
                        if (c.dom.firstChild.dateValue == t) {
                            c.addClass('x-date-selected');
                            if (vis && !this.cancelFocus) {
                                Ext.fly(c.dom.firstChild).focus(50);
                            }
                            return false;
                        }
                    }, this);
                    return;
                }
            }
            var days = date.getDaysInMonth(),
                firstOfMonth = date.getFirstDateOfMonth(),
                startingPos = firstOfMonth.getDay() - this.startDay;

            if (startingPos < 0) {
                startingPos += 7;
            }
            days += startingPos;

            var pm = date.add('mo', -1),
                prevStart = pm.getDaysInMonth() - startingPos,
                cells = this.cells.elements,
                textEls = this.textNodes,

                d = (new Date(pm.getFullYear(), pm.getMonth(), prevStart, this.initHour)),
                today = new Date().clearTime().getTime(),
                sel = date.clearTime(true).getTime(),
                //min = this.minDate ? this.minDate.clearTime(true) : Number.NEGATIVE_INFINITY,
                //max = this.maxDate ? this.maxDate.clearTime(true) : Number.POSITIVE_INFINITY,
                min = this.minDate ? this.minDate.clearTime(true) : Number.NEGATIVE_INFINITY,
                max = this.maxDate ? this.maxDate : Number.POSITIVE_INFINITY,
                ddMatch = this.disabledDatesRE,
                ddText = this.disabledDatesText,
                ddays = this.disabledDays ? this.disabledDays.join('') : false,
                ddaysText = this.disabledDaysText,
                format = this.format;

            if (this.showToday) {
                var td = new Date().clearTime(),
                    disable = (td < min || td > max ||
                    (ddMatch && format && ddMatch.test(td.dateFormat(format))) ||
                    (ddays && ddays.indexOf(td.getDay()) != -1));

                if (!this.disabled) {
                    this.todayBtn.setDisabled(disable);
                    this.todayKeyListener[disable ? 'disable' : 'enable']();
                }
            }

            var setCellClass = function (cal, cell) {
                cell.title = '';
                var t = d.clearTime(true).getTime();
                cell.firstChild.dateValue = t;
                if (t == today) {
                    cell.className += ' x-date-today';
                    cell.title = cal.todayText;
                }
                if (t == sel) {
                    cell.className += ' x-date-selected';
                    if (vis) {
                        Ext.fly(cell.firstChild).focus(50);
                    }
                }
                //var mint = min.getTime ? min.getTime() : min;
                if (t < min) {
                    cell.className = ' x-date-disabled';
                    cell.title = cal.minText;
                    return;
                }
                if (t > max) {
                    cell.className = ' x-date-disabled';
                    cell.title = cal.maxText;
                    return;
                }
                if (ddays) {
                    if (ddays.indexOf(d.getDay()) != -1) {
                        cell.title = ddaysText;
                        cell.className = ' x-date-disabled';
                    }
                }
                if (ddMatch && format) {
                    var fvalue = d.dateFormat(format);
                    if (ddMatch.test(fvalue)) {
                        cell.title = ddText.replace('%0', fvalue);
                        cell.className = ' x-date-disabled';
                    }
                }
            };

            var i = 0;
            for (; i < startingPos; i++) {
                textEls[i].innerHTML = (++prevStart);
                d.setDate(d.getDate() + 1);
                cells[i].className = 'x-date-prevday';
                setCellClass(this, cells[i]);
            }
            for (; i < days; i++) {
                var intDay = i - startingPos + 1;
                textEls[i].innerHTML = (intDay);
                d.setDate(d.getDate() + 1);
                cells[i].className = 'x-date-active';
                setCellClass(this, cells[i]);
            }
            var extraDays = 0;
            for (; i < 42; i++) {
                textEls[i].innerHTML = (++extraDays);
                d.setDate(d.getDate() + 1);
                cells[i].className = 'x-date-nextday';
                setCellClass(this, cells[i]);
            }

            this.mbtn.setText(this.monthNames[date.getMonth()] + ' ' + date.getFullYear());

            if (!this.internalRender) {
                var main = this.el.dom.firstChild,
                    w = main.offsetWidth;
                this.el.setWidth(w + this.el.getBorderWidth('lr'));
                Ext.fly(main).setWidth(w);
                this.internalRender = true;



                if (Ext.isOpera && !this.secondPass) {
                    main.rows[0].cells[1].style.width = (w - (main.rows[0].cells[0].offsetWidth + main.rows[0].cells[2].offsetWidth)) + 'px';
                    this.secondPass = true;
                    this.update.defer(10, this, [date]);
                }
            }
        }
    }
});
Ext.reg('datetimepickerfield', Ext.DateTimePicker);
if (parseInt(Ext.version.substr(0, 1), 10) > 2) {
    Ext.menu.DateTimeItem = Ext.DateTimePicker;
    Ext.override(Ext.menu.DateMenu, {
        initComponent: function () {
            this.on('beforeshow', this.onBeforeShow, this);
            if (this.strict = (Ext.isIE7 && Ext.isStrict)) {
                this.on('show', this.onShow, this, {
                    single: true,
                    delay: 20
                });
            }
            Ext.apply(this, {
                plain: true,
                showSeparator: false,
                items: this.picker = new Ext.DatePicker(Ext.apply({
                    internalRender: this.strict || !Ext.isIE,
                    ctCls: 'x-menu-date-item'
                }, this.initialConfig))
            });
            Ext.menu.DateMenu.superclass.initComponent.call(this);
            this.relayEvents(this.picker, ["select"]);
            this.on('select', this.menuHide, this);
            if (this.handler) {
                this.on('select', this.handler, this.scope || this);
            }
        }
    });
}
else {
    Ext.menu.DateTimeItem = function (config) {
        Ext.menu.DateTimeItem.superclass.constructor.call(this, new Ext.DateTimePicker(config), config);
        this.picker = this.component;
        this.addEvents('select');

        this.picker.on("render", function (picker) {
            picker.getEl().swallowEvent("click");
            picker.container.addClass("x-menu-date-item");
        });

        this.picker.on("select", this.onSelect, this);
    };

    Ext.extend(Ext.menu.DateTimeItem, Ext.menu.DateMenu, {
        onSelect: function (picker, date) {
            this.fireEvent("select", this, date, picker);
            Ext.menu.DateTimeItem.superclass.handleClick.call(this);
        }
    });
}

Ext.menu.DateTimeMenu = function (config) {
    Ext.menu.DateTimeMenu.superclass.constructor.call(this, config);
    this.plain = true;
    var di = new Ext.menu.DateTimeItem(config);
    this.add(di);
    this.picker = di;
    this.relayEvents(di, ["select"]);

    this.on('beforeshow', function () {
        if (this.picker) {
            this.picker.hideMonthPicker(true);
        }
    }, this);
};
Ext.extend(Ext.menu.DateTimeMenu, Ext.menu.Menu, {
    cls: 'x-date-menu',
    beforeDestroy: function () {
        this.picker.destroy();
    },
    hide: function (deep) {
        if (this.picker.tf.innerList) {
            if ((Ext.EventObject.within(this.picker.tf.innerList)) || (Ext.get(Ext.EventObject.getTarget()) == this.picker.tf.innerList))
                return false;
        }
        if (this.el && this.isVisible()) {
            this.fireEvent("beforehide", this);
            if (this.activeItem) {
                this.activeItem.deactivate();
                this.activeItem = null;
            }
            this.el.hide();
            this.hidden = true;
            this.fireEvent("hide", this);
        }
        if (deep === true && this.parentMenu) {
            this.parentMenu.hide(true);
        }
    }
});

Ext.ux.form.DateTimeField = Ext.extend(Ext.form.DateField, {
    //默认显示小时
    dateTimeFormat: 'Y-m-d H',
    dateFormat: 'Y-m-d',
    timeFormat: 'H:i:s',
    defaultAutoCreate: {
        tag: "input",
        type: "text",
        size: "20",
        autocomplete: "off"
    },
    initComponent: function () {
        Ext.ux.form.DateTimeField.superclass.initComponent.call(this);
        this.format = this.dateFormat + ' ' + this.timeFormat;
        this.afterMethod('afterRender', function () {
            this.getEl().applyStyles('top:0');
        });
    },
    getValue: function () {
        return this.parseDate(Ext.form.DateField.superclass.getValue.call(this)) || '';
    },
    //重写转换日期方法
    parseDate: function (value) {
        //为了支持 dateTimeFormat{Y-m-d H:i:s, Y-m-d H:i, Y-m-d H}
        if (value) {
            if (value.length == 13)
                value += ':00:00';
            if (value.length == 16)
                value += ':00';
        }

        if (!value || Ext.isDate(value)) {
            return value;
        }

        var v = this.safeParse(value, this.format),
            af = this.altFormats,
            afa = this.altFormatsArray;

        if (!v && af) {
            afa = afa || af.split("|");

            for (var i = 0, len = afa.length; i < len && !v; i++) {
                v = this.safeParse(value, afa[i]);
            }
        }
        return v;
    },
    onTriggerClick: function () {
        if (this.disabled) {
            return;
        }
        if (this.menu == null) {
            this.menu = new Ext.menu.DateTimeMenu({ dateTimeFormat: this.dateTimeFormat});
        }
        Ext.apply(this.menu.picker, {
            minDate: this.minValue,
            maxDate: this.maxValue,
            disabledDatesRE: this.ddMatch,
            disabledDatesText: this.disabledDatesText,
            disabledDays: this.disabledDays,
            disabledDaysText: this.disabledDaysText,
            format: this.format,
            timeFormat: this.timeFormat,
            dateFormat: this.dateFormat,
            showToday: this.showToday,
            minText: String.format(this.minText, this.formatDate(this.minValue)),
            maxText: String.format(this.maxText, this.formatDate(this.maxValue))
        });
        if (this.menuEvents) {
            this.menuEvents('on');
        }
        else {
            this.menu.on(Ext.apply({}, this.menuListeners, {
                scope: this
            }));
        }
        this.menu.picker.setValue(this.getValue() || new Date());
        this.menu.show(this.el, "tl-bl?");
    },
    //重写formatDate
    formatDate: function (date) {
        if (!this.dateTimeFormat)
            this.dateTimeFormat = this.format;
        return Ext.isDate(date) ? date.dateFormat(this.dateTimeFormat) : date;
    },
    getString: function () {
        if (!this.dateTimeFormat)
            this.dateTimeFormat = this.format;
        return this.getValue() == '' ? '' : this.getValue().format(this.dateTimeFormat);
    },
    getErrors: function (value) {
        var errors = Ext.form.DateField.superclass.getErrors.apply(this, arguments);

        value = this.formatDate(value || this.processValue(this.getRawValue()));

        if (value.length < 1) {
            return errors;
        }

        var svalue = value;
        value = this.parseDate(value);
        if (!value) {
            errors.push(String.format(this.invalidText, svalue, this.format));
            return errors;
        }

        var time = value.getTime();
        //直接比较所日期完整值，来实现结果比对.
        if (this.minValue && time < this.minValue.getTime()) {
            errors.push(String.format(this.minText, this.formatDate(this.minValue)));
        }

        if (this.maxValue && time > this.maxValue.getTime()) {
            errors.push(String.format(this.maxText, this.formatDate(this.maxValue)));
        }

        if (this.disabledDays) {
            var day = value.getDay();

            for (var i = 0; i < this.disabledDays.length; i++) {
                if (day === this.disabledDays[i]) {
                    errors.push(this.disabledDaysText);
                    break;
                }
            }
        }

        var fvalue = this.formatDate(value);
        if (this.disabledDatesRE && this.disabledDatesRE.test(fvalue)) {
            errors.push(String.format(this.disabledDatesText, fvalue));
        }

        return errors;
    }
});
Ext.reg('datetimefield', Ext.ux.form.DateTimeField);

Ext.ux.MonthPickerPlugin = function () {
    var picker;
    var oldDateDefaults;

    this.init = function (pk) {
        picker = pk;
        picker.onTriggerClick = picker.onTriggerClick.createSequence(onClick);
        picker.getValue = picker.getValue.createInterceptor(setDefaultMonthDay).createSequence(restoreDefaultMonthDay);
        picker.beforeBlur = picker.beforeBlur.createInterceptor(setDefaultMonthDay).createSequence(restoreDefaultMonthDay);
    };

    function setDefaultMonthDay() {
        oldDateDefaults = Date.defaults.d;
        Date.defaults.d = 1;
        return true;
    }

    function restoreDefaultMonthDay(ret) {
        Date.defaults.d = oldDateDefaults;
        return ret;
    }

    function onClick(e, el, opt) {
        var p = picker.menu.picker;
        p.activeDate = p.activeDate.getFirstDateOfMonth();
        if (p.value) {
            p.value = p.value.getFirstDateOfMonth();
        }

        p.showMonthPicker();

        if (!p.disabled) {
            p.monthPicker.stopFx();
            p.monthPicker.show();

            p.mun(p.monthPicker, 'click', p.onMonthClick, p);
            p.mun(p.monthPicker, 'dblclick', p.onMonthDblClick, p);
            p.onMonthClick = p.onMonthClick.createSequence(pickerClick);
            p.onMonthDblClick = p.onMonthDblClick.createSequence(pickerDblclick);
            p.mon(p.monthPicker, 'click', p.onMonthClick, p);
            p.mon(p.monthPicker, 'dblclick', p.onMonthDblClick, p);
        }
    }

    function pickerClick(e, t) {
        var el = new Ext.Element(t);
        if (el.is('button.x-date-mp-cancel')) {
            picker.menu.hide();
        } else if (el.is('button.x-date-mp-ok')) {
            var p = picker.menu.picker;
            p.setValue(p.activeDate);
            p.fireEvent('select', p, p.value);
        }
    }

    function pickerDblclick(e, t) {
        var el = new Ext.Element(t);
        if (el.parent()
           && (el.parent().is('td.x-date-mp-month')
            || el.parent().is('td.x-date-mp-year'))) {

            var p = picker.menu.picker;
            p.setValue(p.activeDate);
            p.fireEvent('select', p, p.value);
        }
    }
};

Ext.preg('monthPickerPlugin', Ext.ux.MonthPickerPlugin);


Ext.override(Ext.form.DateField, {
    monthOnly: false,
    initComponent: function () {
        if (this.monthOnly)
            this.plugins = ['monthPickerPlugin'];

        Ext.form.DateField.superclass.initComponent.call(this);
    }
})
