Blockly.Blocks['textsetvalue'] = {
    init: function () {
        this.appendValueInput()
        .appendField("setValue")
        .appendField(new Blockly.FieldTextInput(""), "v");
        this.setInputsInline(true);
        this.setOutput(true);
        this.setTooltip('');
        this.setColour(UBI.dummyinputColor);
        this.setHelpUrl('http://www.example.com/');
    }
};
Blockly.JavaScript['textsetvalue'] = function (block) {
    var v = block.getFieldValue('v');

    var code = '.setValue("' + v + '")';
    return [code];
};
Blockly.Blocks['numbersetvalue'] = {
    init: function () {
        this.appendValueInput("v")
        .setCheck("Number")
        .appendField("setValue");
        this.setInputsInline(true);
        this.setOutput(true);
        this.setColour(UBI.valueinputColor);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
    }
};
Blockly.JavaScript['numbersetvalue'] = function (block) {
    var v = Blockly.JavaScript.valueToCode(block, "v", 0)

    var code = '.setValue(' + v + ')';
    return [code];
};

// Ext.getCmp('id').getValue();
Blockly.Blocks['getvalue'] = {
    init: function () {
        this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput("cmp's id"), "cmpid")
        .appendField(".getVaue()");
        this.setOutput(true, 'getvalue');
        this.setColour(UBI.dummyinputColor);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
    }
};

Blockly.JavaScript['getvalue'] = function (block) {
    var text_name = block.getFieldValue('cmpid');
    var cmp = window.parent.Ext.getCmp(text_name);
    var v = cmp.getValue();
    if (typeof (v) != 'number') {
        v = '"' + v + '"';
    }
    // TODO: Change ORDER_NONE to the correct strength.
    return [v, Blockly.JavaScript.ORDER_ATOMIC];
};