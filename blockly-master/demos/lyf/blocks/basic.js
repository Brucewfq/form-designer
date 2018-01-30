
if(!UBI || !UBI.EmpInfo)
{
	UBI = {};
	UBI.EmpInfo ={Emp_Id: 'zzt', Emp_Name: '答复', Emp_AD_Account: 'ad112'};	
	UBI.currentForm = {procname: '测试流程',actname:'节点A', urlInfo:{} };
	UBI.currentForm.urlInfo = {viewStatus: 'viewStatus', procinstid:123, sn: '123_1', draftid:'asdwwewe', smdName:'测试流程_Smd'};
}
if(!UBI)
{
	UBI = {};
}
UBI.valueinputColor = 90;
UBI.dummyinputColor = 180;
UBI.statementColor = 270;
function toXml() {
  //var output = document.getElementById('importExport');
  var xml = Blockly.Xml.workspaceToDom(workspace);
  //output.value = Blockly.Xml.domToPrettyText(xml);
  //output.focus();
  //output.select();
  //taChange();
  var v = Blockly.Xml.domToPrettyText(xml);
  return v;
}

function fromXml(xml) {
  //var input = document.getElementById('importExport');
  xml = Blockly.Xml.textToDom(xml);
  Blockly.Xml.domToWorkspace(xml, workspace);
  //taChange();
}

function genCode() {
  // Generate JavaScript code and display it.
  Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
  var code = Blockly.JavaScript.workspaceToCode(workspace);
  
  
  //Blockly.CSharp.INFINITE_LOOP_TRAP = null;
  //var code = Blockly.CSharp.workspaceToCode(workspace);  
  
  return code;
}
var imgurl = 'http://thumbs.dreamstime.com/t/none-49783153.jpg';

function taChange() {
  var textarea = document.getElementById('importExport');
  if (sessionStorage) {
    sessionStorage.setItem('textarea', textarea.value);
  }
  var valid = true;
  try {
    Blockly.Xml.textToDom(textarea.value);
  } catch (e) {
    valid = false;
  }
  document.getElementById('import').disabled = !valid;
}


Blockly.Blocks.myblocks = {};
Blockly.Blocks.myblocks.HUE = 330;

Blockly.Blocks.myblocks_a = {
  init: function() {
    this.appendValueInput("winX")
        .setCheck("Number")
        .appendField("winX");
    this.appendValueInput("winY")
        .setCheck("Number")
        .appendField("winY");
    this.appendValueInput("acountCmpId")
        .setCheck("String")
        .appendField("Id");
    this.appendValueInput("acountWidth")
        .setCheck("Number")
        .appendField("Width");
    this.setPreviousStatement(true);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  },
   contextMenuType_: "myblocks_a",
};
Blockly.JavaScript.myblocks = {};
Blockly.JavaScript.myblocks_a = function(block) {
  var value_winx = Blockly.JavaScript.valueToCode(block, 'winX', Blockly.JavaScript.ORDER_ATOMIC);
  var value_winy = Blockly.JavaScript.valueToCode(block, 'winY', Blockly.JavaScript.ORDER_ATOMIC);
  var value_acountcmpid = Blockly.JavaScript.valueToCode(block, 'acountCmpId', Blockly.JavaScript.ORDER_ATOMIC);
  var value_acountwidth = Blockly.JavaScript.valueToCode(block, 'acountWidth', Blockly.JavaScript.ORDER_ATOMIC);
	// TODO: Assemble JavaScript into code variable.
  var code = ' Ext.getCmp('+value_acountcmpid+').setWidth('+value_acountwidth+');';
  code += 'Ext.getCmp(\'lg\').setPosition('+value_winx+', '+value_winy+')';
  return code;
}
Blockly.CSharp.myblocks_a = function(block) {
  var value_winx = Blockly.CSharp.valueToCode(block, 'winX', Blockly.JavaScript.ORDER_ATOMIC);
  var value_winy = Blockly.CSharp.valueToCode(block, 'winY', Blockly.JavaScript.ORDER_ATOMIC);
  var value_acountcmpid = Blockly.CSharp.valueToCode(block, 'acountCmpId', Blockly.JavaScript.ORDER_ATOMIC);
  var value_acountwidth = Blockly.CSharp.valueToCode(block, 'acountWidth', Blockly.JavaScript.ORDER_ATOMIC);
	// TODO: Assemble JavaScript into code variable.
  var code = ' Ext.getCmp('+value_acountcmpid+').setWidth('+value_acountwidth+');';
  code += 'Ext.getCmp(\'lg\').setPosition('+value_winx+', '+value_winy+')';
  return code;
}						

Blockly.Blocks['openurl'] = {
  init: function() {
    var ac = this.appendValueInput("url")
        .setCheck("String")
        .appendField("openurl");
		this.setPreviousStatement(true);
    //var c = new goog.events.FocusHandler(ac.getElement());
		//this.getHandler().listen(c, goog.events.FocusHandler.EventType.FOCUSOUT, function(){alert(1)})
    //goog.events.FocusHandler(ac);    
    this.setColour(UBI.valueinputColor);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
  //,
  //onchange: function(){
  	//alert(1);	
  //}
};
Blockly.JavaScript['openurl'] = function(block) {
  var value_url = Blockly.JavaScript.valueToCode(block, 'url', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'window.open(' + value_url + ',"","width=870,height=700,resizable=yes,fullScreen=yes")';
  return code;
};
Blockly.Blocks['ext_getcmp'] = {
  init: function() {
    this.appendValueInput("inputcmp")
    		.setCheck(['getvalue'])
        .appendField(new Blockly.FieldImage(imgurl, 25, 25, "选择"))
        .appendField("Ext对象")
        .appendField(new Blockly.FieldTextInput(""), "cmpid");
    this.setPreviousStatement(true, "String");
		this.setNextStatement(true);
    this.setColour(UBI.valueinputColor);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  },
  validate: function() {
      var cmpid = this.getFieldValue('cmpid');
      var valid = window.parent.Ext.getCmp(cmpid);
//      if (!valid && cmpid != '') 
//      {
//      	Ext.Msg.alert('提示','控件不存在! ' )
//      	this.setFieldValue('', 'cmpid');
//      }
      //this.setFieldValue(a, "NAME")
  },
  customAdd: function(){	
     this.removeInput("inputcmp1");
     this.appendValueInput("inputcmp1")
        .appendField("Ext对象11")
  },
  onchange: function(ev) {
  	this.validate();
  }
};
Blockly.JavaScript['ext_getcmp'] = function(block) {
  var text_cmpid = block.getFieldValue('cmpid');
  var a = Blockly.JavaScript.valueToCode(block, "inputcmp", 0)
  // TODO: Assemble JavaScript into code variable.
  var code = 'Ext.getCmp("' + text_cmpid + '")' + a + ';';
  return  code;
};

Blockly.Blocks['ext_storemgr'] = {
  init: function() {
    this.appendValueInput("inputcmp")
    		.setCheck(['reload', 'load'])
        .appendField("Store对象")
        .appendField(new Blockly.FieldTextInput(""), "id");
    this.setPreviousStatement(true);
		this.setNextStatement(true);
    this.setColour(UBI.valueinputColor);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  },
  onchange: function(ev) {
  	//this.validate();
  }
};
Blockly.JavaScript['ext_storemgr'] = function(block) {
  var text_cmpid = block.getFieldValue('id');
  var a = Blockly.JavaScript.valueToCode(block, "inputcmp", 0)
  // TODO: Assemble JavaScript into code variable.
  var code = 'Ext.StoreMgr.get("' + text_cmpid + '").' + a;
  return  code;
};


Blockly.Blocks['alert'] = {
  init: function() {
    this.appendValueInput("NAME")
        .appendField("alert");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(UBI.valueinputColor);
    this.setTooltip('');
  }
};
Blockly.JavaScript['alert'] = function(block) {
  var statements_name = Blockly.JavaScript.valueToCode(block, 'NAME');
//  var v = eval(statements_name);
//	if(typeof(v) == "string" && v == statements_name)
//		v = '"'+ v + '"'
//	else
//		v = statements_name;
  // TODO: Assemble JavaScript into code variable.
  var code = 'alert('+statements_name+');';
  return code;
};

Blockly.Blocks['convertstring'] = {
  init: function() {
    this.appendValueInput("val")
        .appendField("ConvertString");
    this.setOutput(true, "convertstring");
    this.setColour(UBI.valueinputColor);
    this.setTooltip('');
  }
};

Blockly.JavaScript['convertstring'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'val', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '"' + value_name + '"';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code.toString(), Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['convertint'] = {
  init: function() {
    this.appendValueInput("val")
        .appendField("ConvertInt");
    this.setOutput(true, "Number");
    this.setColour(UBI.valueinputColor);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['convertint'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'val', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '"' +eval(value_name) + '"';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code.toString(), Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['show'] = {
  init: function() {
    this.appendDummyInput('aa')
        .appendField("show");
    this.setOutput(true);
    this.setColour(180);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.JavaScript['show'] = function(block) {
  var code = 'show()';
  return [code];
};
Blockly.Blocks['hide'] = {
  init: function() {
    this.appendDummyInput('aa')
        .appendField("hide");
    this.setOutput(true);
    this.setColour(180);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.JavaScript['hide'] = function(block) {
  var code = 'hide()';
  return [code];
};
Blockly.Blocks['center'] = {
  init: function() {
    this.appendDummyInput('aa')
        .appendField("center");
    this.setOutput(true);
    this.setColour(180);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.JavaScript['center'] = function(block) {
  var code = 'center()';
  return [code];
};


//表单全局变量
Blockly.Blocks['form_var'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("表单全局变量")
        .appendField(new Blockly.FieldTextInput(""), "var");
    this.setOutput(true);
    this.setTooltip('');
    this.setColour(270);
  }
};
Blockly.JavaScript['form_var'] = function(block) {
  var v = block.getFieldValue('var');
  // TODO: Assemble JavaScript into code variable.
  var code = [v];
  return code;
};

//表单信息
Blockly.Blocks['form_info'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("表单信息")
        .appendField(new Blockly.FieldDropdown([["业务状态", "businessStatus"], ["流程名", "procname"], ["节点名", "actname"], 
        	["表单状态", "urlInfo.viewStatus"], ["流程实例ID", "urlInfo.procinstid"], ["SN", "urlInfo.sn"], 
        	["草稿ID", "urlInfo.draftid"],["SmartDSName", "smdName"] ])
    , "Emp_Pro");
    this.setOutput(true);
    this.setTooltip('');
    this.setColour(270);
  }
};
Blockly.JavaScript['form_info'] = function(block) {
  var dropdown_emp_pro = block.getFieldValue('Emp_Pro');
  // TODO: Assemble JavaScript into code variable.
  var code = ['UBI.currentForm.' + dropdown_emp_pro];
  return code;
};
//表单状态
Blockly.Blocks['form_status'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("表单状态")
        .appendField(new Blockly.FieldTextInput(""), "var");
    this.setOutput(true);
    this.setTooltip('');
    this.setColour(270);
  }
};
Blockly.JavaScript['form_status'] = function(block) {
  var v = block.getFieldValue('var');
  // TODO: Assemble JavaScript into code variable.
  var code = ['"' +v +'"'];
  return code;
};