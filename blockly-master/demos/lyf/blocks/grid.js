Blockly.Blocks['grid'] = {
    init: function () {
        this.appendDummyInput()
        .appendField("grid")
        .appendField(new Blockly.FieldTextInput(""), "v");
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
        this.setColour(UBI.dummyinputColor);
        this.setHelpUrl('http://www.example.com/');
    }
};
Blockly.JavaScript['grid'] = function (block) {
    var v = block.getFieldValue('v');

    var code = 'setValue("' + v + '")';
    return [code];
};

Blockly.Blocks['gridsum'] = {
    init: function () {
        this.appendDummyInput()
        .appendField(new Blockly.FieldImage(imgurl, 25, 25, "选择"))
        .appendField("grid")
        .appendField(new Blockly.FieldTextInput(""), "cmpid");
        this.appendValueInput("colName")
        .appendField("列求和");

        this.setInputsInline(true);
        this.setOutput(true);
        this.setColour(UBI.dummyinputColor);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
    }
};
Blockly.JavaScript['gridsum'] = function (block) {
    var text_gridid = block.getFieldValue('cmpid');
    var text_colname = Blockly.JavaScript.valueToCode(block, "colName", 0)
    // TODO: Assemble JavaScript into code variable.
    var code = 'function(){    var sum  = 0.0;\n    try{\n        var store = Ext.getCmp("' + text_gridid + '").getStore();\n        store.each(function(r){\n            var i = r.get(' + text_colname + ');\n            sum += parseFloat(i);\n        })\n    }\n    catch(r)\n    {\n            sum = 0.0;\n    }\n    return sum.toFixed(2);\n}()';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};


Blockly.Blocks['aftereditparam'] = {
    init: function () {
        this.appendDummyInput()
        .appendField("afteredit参数");
        this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["grid", "grid"], ["正在编辑的record", "record"], ["正在编辑的字段名", "field"], ["正在设置的值", "value"], ["在编辑之前的原始值", "originalValue"], ["grid行索引", "row"], ["grid列索引", "column"]]), "e");

        this.setOutput(true);
        this.setColour(UBI.dummyinputColor);
        this.setTooltip('');
    }
};

Blockly.JavaScript['aftereditparam'] = function (block) {
    var argV = block.getFieldValue('e');
    // TODO: Assemble JavaScript into code variable.
    var code = 'function(){\n  var e = ubiEventArgs[0];\n return e.' + argV + ';\n}()';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};