Blockly.Blocks['arraystoreappenddata'] = {
    init: function () {
        this.appendDummyInput()
        .appendField(new Blockly.FieldImage(imgurl, 25, 25, "选择"))
        .appendField(new Blockly.FieldTextInput("ArrayStore"), "id")
        .appendField(".appendData");

        this.appendStatementInput("RECORDS")
        .setCheck("arrayrecord_row")
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(UBI.statementColor);
        this.setMutator(new Blockly.Mutator(["arrayrecord_row"]));
    }
};
Blockly.JavaScript['arraystoreappenddata'] = function (block) {
    var v = Blockly.JavaScript.statementToCode(block, "RECORDS");
    var id = block.getFieldValue('id');

    if (v.length > 0)
        v = v.substring(0, v.length - 1);
    var code = 'Ext.StoreMgr.get("' + id + '").appendData([' + v + ']);';
    return code;
};


Blockly.Blocks['arrayrecord_row'] = {
    init: function () {
        this.appendStatementInput("fields")
        .setCheck("arrayfield")
        .appendField("row");
        this.setPreviousStatement(true, ['arrayrecord_row']);
        this.setNextStatement(true, "arrayrecord_row");
        this.setColour(UBI.statementColor);
        //this.setOutput(true, "String");
        this.setTooltip('');
    },
    onchange: function () {
        var a = !1,
      b = this;
        do {
            if (-1 != this.Store_TYPES.indexOf(b.type)) {
                a = !0;
                break
            }
            b = b.getSurroundParent()
        } while (b);
        a ? this.setWarningText(null) : this.setWarningText('此模块仅可用在ArrayStore中!')
    },
    Store_TYPES: ["arraystoreappenddata"]
};
Blockly.JavaScript['arrayrecord_row'] = function (block) {
    var v = Blockly.JavaScript.statementToCode(block, "fields");
    if (v.length > 0)
        v = v.substring(0, v.length - 1);
    var code = '[' + v + '],';
    return code;
};

Blockly.Blocks['arrayfield'] = {
    init: function () {
        this.appendDummyInput()
        .appendField("value:")
        .appendField(new Blockly.FieldTextInput(""), "value");
        this.setPreviousStatement(true, ['arrayfield']);
        this.setNextStatement(true, "arrayfield");
        this.setColour(UBI.dummyinputColor);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
    }
};
Blockly.JavaScript['arrayfield'] = function (block) {
    var text_name = block.getFieldValue('name');
    var text_value = block.getFieldValue('value');
    var v = '\'' + text_value + '\',';
    return v;
};

Blockly.Blocks['jsonstoreappenddata'] = {
    init: function () {

        this.appendDummyInput()
        .appendField(new Blockly.FieldImage(imgurl, 25, 25, "选择"))
        .appendField(new Blockly.FieldTextInput("JsonStore"), "id")
        .appendField(".appendData");

        this.appendStatementInput("rows")
        .setCheck("row");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(UBI.statementColor);
        this.setTooltip('');
    }
};
Blockly.JavaScript['jsonstoreappenddata'] = function (block) {
    var v = Blockly.JavaScript.statementToCode(block, "rows");
    var id = block.getFieldValue('id');

    if (v.length > 0)
        v = v.substring(0, v.length - 1);
    var code = 'Ext.StoreMgr.get("' + id + '").appendData([' + v + ']);';
    return code;
};

Blockly.Blocks['row'] = {
    init: function () {
        this.appendStatementInput("fields")
        .setCheck("field")
        .appendField("row");
        this.setPreviousStatement(true, "row");
        this.setNextStatement(true, "row");
        this.setColour(UBI.statementColor);
        this.setTooltip('');
    }
};
Blockly.JavaScript['row'] = function (block) {
    var v = Blockly.JavaScript.statementToCode(block, "fields");
    if (v.length > 0)
        v = v.substring(0, v.length - 1);
    var code = '{' + v + '},';
    return code;
};

Blockly.Blocks['field'] = {
    init: function () {
        this.appendDummyInput()
        .appendField("name:")
        .appendField(new Blockly.FieldTextInput(""), "name")
        .appendField("value:")
        .appendField(new Blockly.FieldTextInput(""), "value");
        this.setPreviousStatement(true, "field");
        this.setNextStatement(true, "field");
        this.setColour(UBI.dummyinputColor);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
    }
};
Blockly.JavaScript['field'] = function (block) {
    var text_name = block.getFieldValue('name');
    var text_value = block.getFieldValue('value');
    // TODO: Assemble JavaScript into code variable.
    var v = text_name + ' : \'' + text_value + '\',';
    return v;
};

Blockly.Blocks['reload'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("重加载");
        this.setOutput(true, 'reload');
        this.setColour(UBI.dummyinputColor);
        this.setTooltip('reload');
    }
};
Blockly.JavaScript['reload'] = function (block) {
    var statements_reloadinput = Blockly.JavaScript.statementToCode(block, 'reloadinput');
    var code = 'reload();\n';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['load'] = {
    init: function () {
        this.appendStatementInput("loadinput")
        .setCheck('params')
        .appendField("加载");
        this.setOutput(true, 'load');
        this.setColour(UBI.statementColor);
        this.setTooltip('load');
    }
};
Blockly.JavaScript['load'] = function (block) {
    var statements_loadinput = Blockly.JavaScript.statementToCode(block, 'loadinput');
    // TODO: Assemble JavaScript into code variable.
    var code = 'load(' + statements_loadinput + ');';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
Blockly.Blocks['params'] = {
    init: function () {
        this.appendStatementInput("paramsinput")
        .setCheck(['decimalparam', 'stringparam', 'cmpparam'])
        .appendField("参数");
        this.setPreviousStatement(true, 'params');
        this.setColour(UBI.statementColor);
        this.setTooltip('params');
    }
};
Blockly.JavaScript['params'] = function (block) {
    var parraystr = Blockly.JavaScript.statementToCode(block, 'paramsinput');
    //this.INDENT = '  '; stetement都会自动拼接
    if (parraystr.length > 0)
        parraystr = '{' + parraystr.substring(3) + '}'
    // TODO: Assemble JavaScript into code variable.
    var code = parraystr;
    // TODO: Change ORDER_NONE to the correct strength.
    return code;
};

Blockly.Blocks['decimalparam'] = {
    init: function () {
        this.appendDummyInput()
        .appendField("decimal参数")
        .appendField(new Blockly.FieldTextInput(""), "name")
        .appendField(new Blockly.FieldTextInput(""), "value");
        this.setPreviousStatement(true, ['decimalparam', 'stringparam', 'cmpparam']);
        this.setNextStatement(true, ['decimalparam', 'stringparam', 'cmpparam']);
        this.setColour(UBI.dummyinputColor);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
    }
};
Blockly.JavaScript['decimalparam'] = function (block) {
    var text_name = block.getFieldValue('name');
    //值如果是引用的表单变量则需要转换；
    var text_value = block.getFieldValue('value');
    // TODO: Assemble JavaScript into code variable.
    var code = ',' + text_name + ': ' + text_value;
    return code;
};
Blockly.Blocks['stringparam'] = {
    init: function () {
        this.appendDummyInput()
        .appendField("字符参数")
        .appendField(new Blockly.FieldTextInput(""), "name")
        .appendField(new Blockly.FieldTextInput(""), "value");
        this.setPreviousStatement(true, ['decimalparam', 'stringparam', 'cmpparam']);
        this.setNextStatement(true, ['decimalparam', 'stringparam', 'cmpparam']);
        this.setColour(UBI.dummyinputColor);
        this.setTooltip('stringparam');
    }
};
Blockly.JavaScript['stringparam'] = function (block) {
    var text_name = block.getFieldValue('name');
    //值如果是引用的表单变量则需要转换；
    var text_value = block.getFieldValue('value');
    // TODO: Assemble JavaScript into code variable.
    var code = ',' + text_name + ': "' + text_value + '"';
    return code;
};

Blockly.Blocks['cmpparam'] = {
    init: function () {
        this.appendValueInput("cmpparaminput")
        .setCheck('getvalue')
        .appendField("对象参数")
        .appendField(new Blockly.FieldTextInput(""), "name");
        this.setPreviousStatement(true, ['decimalparam', 'stringparam', 'cmpparam']);
        this.setNextStatement(true, ['decimalparam', 'stringparam', 'cmpparam']);
        this.setColour(UBI.valueinputColor);
        this.setTooltip('cmpparam');
    }
};

Blockly.JavaScript['cmpparam'] = function (block) {
    var text_name = block.getFieldValue('name');
    var value_cmpparaminput = Blockly.JavaScript.valueToCode(block, 'cmpparaminput', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    var code = ',' + text_name + ': ' + value_cmpparaminput;
    return code;
};

Blockly.Blocks['getfieldvalue'] = {
    init: function () {
        this.appendDummyInput()
        .appendField("get")
        .appendField(new Blockly.FieldTextInput(""), "fieldname");
        this.setOutput(true);
        this.setColour(UBI.dummyinputColor);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
    }
};
Blockly.JavaScript['getfieldvalue'] = function (block) {
    var fieldname = block.getFieldValue('fieldname');
    // TODO: Assemble JavaScript into code variable.
    var code = '.get("' + fieldname + '")';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['getfieldvalue_var'] = {
    init: function () {
        this.appendDummyInput()
        .appendField("get")
        .appendField(new Blockly.FieldVariable("item"), "fieldname");
        this.setOutput(true);
        this.setColour(90);
        this.setTooltip('');
    }
};
Blockly.JavaScript['getfieldvalue_var'] = function (block) {
    var variable_name = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('fieldname'), Blockly.Variables.NAME_TYPE);
    // TODO: Assemble JavaScript into code variable.
    var code = '.get(' + variable_name + ')';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['getrecord'] = {
    init: function () {
        this.appendDummyInput()
        .appendField("Store")
        .appendField(new Blockly.FieldTextInput(""), "storeid");
        this.appendValueInput("func")
        .appendField("getAt")
        .appendField(new Blockly.FieldVariable("index"), "index");
        this.setOutput(true);
        this.setColour(UBI.valueinputColor);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
    }
};

Blockly.JavaScript['getrecord'] = function (block) {
    var text_storeid = block.getFieldValue('storeid');
    var variable_index = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('index'), Blockly.Variables.NAME_TYPE);
    var func = Blockly.JavaScript.valueToCode(block, 'func', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    var code = 'Ext.StoreMgr.get("' + text_storeid + '").getAt(' + variable_index + ')' + func;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};