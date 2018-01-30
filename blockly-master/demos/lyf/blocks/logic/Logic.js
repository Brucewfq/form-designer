Blockly.Blocks['logicexp'] = {
  init: function() {
    this.appendStatementInput("ItemA");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["and", "&&"], ["or", "||"]]), "LogicOP");
    this.appendStatementInput("ItemB");
    this.setPreviousStatement(true);
    this.setColour(160);
    this.setTooltip('逻辑表达式');
  }
};
Blockly.CSharp['logicexp'] = function(block) {
  var statements_itema = Blockly.CSharp.statementToCode(block, 'ItemA');
  var lop = block.getFieldValue('LogicOP');
  var statements_itemb = Blockly.CSharp.statementToCode(block, 'ItemB');
  // TODO: Assemble JavaScript into code variable.
  var code = '(' + statements_itema + ' ' + lop + statements_itemb +')';
  return code;
};

Blockly.Blocks['compareexp'] = {
  init: function() {
    this.appendStatementInput("ItemA");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([[">", ">"], ["<", "<"], ["=", "="], ["<=", "<="], [">=", ">="]]), "LogicOP");
    this.appendStatementInput("ItemB");
    this.setPreviousStatement(true);
    this.setColour(160);
    this.setTooltip('比较表达式');
  }
};
Blockly.CSharp['compareexp'] = function(block) {
  var statements_itema = Blockly.CSharp.statementToCode(block, 'ItemA');
  var lop = block.getFieldValue('LogicOP');
  var statements_itemb = Blockly.CSharp.statementToCode(block, 'ItemB');
  // TODO: Assemble JavaScript into code variable.
  var code = '(' + statements_itema + ' ' + lop + statements_itemb +')';
  return code;
};

Blockly.Blocks['expitem'] = {
  init: function() {
  	var a = new Blockly.FieldTextInput("");
  	a.EDITABLE = !0;
  	
    this.appendDummyInput()
        .appendField("Display")
        .appendField(a, "Display");
    this.appendDummyInput()
        .appendField("Value")
        .appendField(new Blockly.FieldTextInput(""), "Value");
    this.setPreviousStatement(true);
    this.setColour(160);
    this.setTooltip('表达式项');
  }
};
Blockly.CSharp['expitem'] = function(block) {
  var text_display = block.getFieldValue('Display');
  var text_value = block.getFieldValue('Value');
  // TODO: Assemble JavaScript into code variable.
  var code = text_value;
  return code;
};

Blockly.Blocks['not'] = {
  init: function() {
    this.appendStatementInput("not")
        .appendField("非");
    this.setPreviousStatement(true);
    this.setColour(160);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.CSharp['not'] = function(block) {
  var statements_not = Blockly.CSharp.statementToCode(block, 'not');
  // TODO: Assemble JavaScript into code variable.
  var code = '!' + statements_not;
  return code;
};