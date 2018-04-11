var tb = document.getElementById('toolbox');
var AngularBlockly;
var nowBlock;
var AngularMsg = [];
var targetBuilderTools;
var bool = false;
var defLang = 'zh_CN';

function blocklyGetJsCode() {
  var code = Blockly.JavaScript.workspaceToCode(Code.workspace);
  if (AngularMsg.length > 0) {
    alert(AngularMsg.join(','));
    AngularMsg = [];
    return '';
  }
  return code;
}

function changeXml(targetXml, rtl) {
  for (var i = 0; i < targetXml.length; i++) {
    var json = targetXml[i];
    if (json.scripts) {
      for (var key in json.scripts) {
        var regEnd = /_xml$/;
        if (regEnd.test(key)) {
          var text = json.scripts[key];
          var dom = Blockly.Xml.textToDom(text);
          if (Blockly.getMainWorkspace()) {
            Blockly.getMainWorkspace().clear();
          } else {
            Blockly.mainWorkspace = new Blockly.Workspace();
          }

          Blockly.Xml.domToWorkspace(Blockly.getMainWorkspace(), dom);
          var blocks = Blockly.getMainWorkspace().getAllBlocks();

          if (blocks.length > 0) {
            for (var j = 0; j < blocks.length; j++) {
              var b = blocks[j];
              if (!b.getField('COMPID')) {
                continue;
              }
              var name = b.getFieldValue('COMPID');
              var node = doGet(name, targetBuilderTools);
              if (node) {
                b.setFieldValue(node.attr.name, 'COMPID');
              }
            }

            json.scripts[key.replace('_xml', '')] = Blockly.JavaScript.workspaceToCode(Blockly.getMainWorkspace());
          } else {
            delete  json.scripts[key.replace('_xml', '')];
          }
        }
      }
    }
    if (json.children && json.children.length > 0) {
      changeXml(json.children, rtl);
    }
  }
}

function xmlToJs(targetXml) {
  if (!bool) {
    targetBuilderTools = targetXml;
    bool = true;
  }
  var rtl = Code.isRtl();
  changeXml(targetXml, rtl);

  if (AngularMsg.length > 0) {
    alert(AngularMsg.join(','));
    AngularMsg = [];
    return null;
  }
  return targetXml;
}

function doGet(name, datas) {
  if (datas && datas.length > 0) {
    for (var i = 0; i < datas.length; i++) {
      var child = datas[i];
      if (child.name === name) {
        return child;
      } else {
        if (child.children && child.children.length > 0) {
          const res = doGet(name, child.children);
          if (res) {
            return res;
          }
        }
      }
    }
  } else {
    return null;
  }
}


function loadXml(xml) {
  // Code.loadBlocks(xml);
  document.getElementById('tab_xml').className = 'tabon';
  Code.tabClick('blocks', xml);
}

function blocklyGetXmlCode() {
  // var txts = [];
  // if (Code.workspace.getAllBlocks() && Code.workspace.getAllBlocks().length > 0) {
  //   for (var i = 0; i < Code.workspace.getAllBlocks().length; i++) {
  //     var dom = Blockly.Xml.blockToDomWithXY(Code.workspace.getAllBlocks()[i]);
  //     var xmlText = Blockly.Xml.domToText(dom);
  //     txts.push(xmlText)
  //   }
  // }
  // return txts;

  var xmlDom = Blockly.Xml.workspaceToDom(Code.workspace);
  var xmlText = Blockly.Xml.domToText(xmlDom);
  return xmlText;
}

function blocklySetVal(key, val) {
  if (nowBlock) {
    if (nowBlock.type_ === 'jsArea') {
      nowBlock.getField(key).setValue(val);
    } else if (nowBlock.type_ === 'rest') {
      nowBlock.getField(key).setValue(val);
    } else {
      nowBlock.getField(key).setValue(val.data.id);
      nowBlock.getField(key).setText(val.data.id);
    }
  }
}

function blocklyInit(angularComp, defaultXml, objectData) {
  AngularBlockly = angularComp;
  var category = [];
  var categoryXml = '';

  if (objectData && objectData.length > 0) {
    for (var i = 0; i < objectData.length; i++) {
      eval(objectData[i].generatorStub);
      eval(objectData[i].languageCode);

      if (!category[objectData[i].type]) {
        category[objectData[i].type] = [objectData[i]];
      } else {
        category[objectData[i].type].push(objectData[i])
      }
    }

    for (var key in category) {
      categoryXml += "<category id='cat" + key + "' name='" + key + "' colour='260'>";
      for (var k = 0; k < category[key].length; k++) {
        categoryXml += "<block type='" + category[key][k].blockType + "'></block>"
      }
      categoryXml += '</category>';
    }
  }


  var obj = {
    media: 'assets/media/', toolbox: `<xml id="toolbox" style="display: none">
    <category id="catLogic" name="Logic" colour="210">
      <block type="controls_if"></block>
      <block type="logic_compare"></block>
      <block type="logic_operation"></block>
      <block type="logic_negate"></block>
      <block type="logic_boolean"></block>
      <block type="logic_null"></block>
      <block type="logic_ternary"></block>
    </category>
    <category id="catLoops" name="Loops" colour="120">
      <block type="controls_repeat_ext">
        <value name="TIMES">
          <shadow type="math_number">
            <field name="NUM">10</field>
          </shadow>
        </value>
      </block>
      <block type="controls_whileUntil"></block>
      <block type="controls_for">
        <value name="FROM">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="TO">
          <shadow type="math_number">
            <field name="NUM">10</field>
          </shadow>
        </value>
        <value name="BY">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
      </block>
      <block type="controls_forEach"></block>
      <block type="controls_flow_statements"></block>
    </category>
    <category id="catMath" name="Math" colour="230">
      <block type="math_number"></block>
      <block type="math_arithmetic">
        <value name="A">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="B">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
      </block>
      <block type="math_single">
        <value name="NUM">
          <shadow type="math_number">
            <field name="NUM">9</field>
          </shadow>
        </value>
      </block>
      <block type="math_trig">
        <value name="NUM">
          <shadow type="math_number">
            <field name="NUM">45</field>
          </shadow>
        </value>
      </block>
      <block type="math_constant"></block>
      <block type="math_number_property">
        <value name="NUMBER_TO_CHECK">
          <shadow type="math_number">
            <field name="NUM">0</field>
          </shadow>
        </value>
      </block>
      <block type="math_change">
        <value name="DELTA">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
      </block>
      <block type="math_round">
        <value name="NUM">
          <shadow type="math_number">
            <field name="NUM">3.1</field>
          </shadow>
        </value>
      </block>
      <block type="math_on_list"></block>
      <block type="math_modulo">
        <value name="DIVIDEND">
          <shadow type="math_number">
            <field name="NUM">64</field>
          </shadow>
        </value>
        <value name="DIVISOR">
          <shadow type="math_number">
            <field name="NUM">10</field>
          </shadow>
        </value>
      </block>
      <block type="math_constrain">
        <value name="VALUE">
          <shadow type="math_number">
            <field name="NUM">50</field>
          </shadow>
        </value>
        <value name="LOW">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="HIGH">
          <shadow type="math_number">
            <field name="NUM">100</field>
          </shadow>
        </value>
      </block>
      <block type="math_random_int">
        <value name="FROM">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="TO">
          <shadow type="math_number">
            <field name="NUM">100</field>
          </shadow>
        </value>
      </block>
      <block type="math_random_float"></block>
    </category>
    <category id="catText" name="Text" colour="160">
      <block type="text"></block>
      <block type="text_join"></block>
      <block type="text_append">
        <value name="TEXT">
          <shadow type="text"></shadow>
        </value>
      </block>
      <block type="text_length">
        <value name="VALUE">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
      <block type="text_isEmpty">
        <value name="VALUE">
          <shadow type="text">
            <field name="TEXT"></field>
          </shadow>
        </value>
      </block>
      <block type="text_indexOf">
        <value name="VALUE">
          <block type="variables_get">
            <field name="VAR">text</field>
          </block>
        </value>
        <value name="FIND">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
      <block type="text_charAt">
        <value name="VALUE">
          <block type="variables_get">
            <field name="VAR">text</field>
          </block>
        </value>
      </block>
      <block type="text_getSubstring">
        <value name="STRING">
          <block type="variables_get">
            <field name="VAR">text</field>
          </block>
        </value>
      </block>
      <block type="text_changeCase">
        <value name="TEXT">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
      <block type="text_trim">
        <value name="TEXT">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
      <block type="text_print">
        <value name="TEXT">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
      <block type="text_prompt_ext">
        <value name="TEXT">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
    </category>
    <category id="catLists" name="Lists" colour="260">
      <block type="lists_create_with">
        <mutation items="0"></mutation>
      </block>
      <block type="lists_create_with"></block>
      <block type="lists_repeat">
        <value name="NUM">
          <shadow type="math_number">
            <field name="NUM">5</field>
          </shadow>
        </value>
      </block>
      <block type="lists_length"></block>
      <block type="lists_isEmpty"></block>
      <block type="lists_indexOf">
        <value name="VALUE">
          <block type="variables_get">
            <field name="VAR">list</field>
          </block>
        </value>
      </block>
      <block type="lists_getIndex">
        <value name="VALUE">
          <block type="variables_get">
            <field name="VAR">list</field>
          </block>
        </value>
      </block>
      <block type="lists_setIndex">
        <value name="LIST">
          <block type="variables_get">
            <field name="VAR">list</field>
          </block>
        </value>
      </block>
      <block type="lists_getSublist">
        <value name="LIST">
          <block type="variables_get">
            <field name="VAR">list</field>
          </block>
        </value>
      </block>
      <block type="lists_split">
        <value name="DELIM">
          <shadow type="text">
            <field name="TEXT">,</field>
          </shadow>
        </value>
      </block>
    </category>
    <category id="catColour" name="Colour" colour="20">
      <block type="colour_picker"></block>
      <block type="colour_random"></block>
      <block type="colour_rgb">
        <value name="RED">
          <shadow type="math_number">
            <field name="NUM">100</field>
          </shadow>
        </value>
        <value name="GREEN">
          <shadow type="math_number">
            <field name="NUM">50</field>
          </shadow>
        </value>
        <value name="BLUE">
          <shadow type="math_number">
            <field name="NUM">0</field>
          </shadow>
        </value>
      </block>
      <block type="colour_blend">
        <value name="COLOUR1">
          <shadow type="colour_picker">
            <field name="COLOUR">#ff0000</field>
          </shadow>
        </value>
        <value name="COLOUR2">
          <shadow type="colour_picker">
            <field name="COLOUR">#3333ff</field>
          </shadow>
        </value>
        <value name="RATIO">
          <shadow type="math_number">
            <field name="NUM">0.5</field>
          </shadow>
        </value>
      </block>
    </category>
    <sep></sep>
    <category id="catVariables" name="Variables" colour="330" custom="VARIABLE"></category>
    <category id="catFunctions" name="Functions" colour="290" custom="PROCEDURE"></category>
    <category id="catEvents" name="JsFunctions" colour="260">
      <block type="component_action"></block>
      <block type="component_setValue"></block>
      <block type="component_getValue"></block>
      <block type="component_jsArea"></block>
      <block type="component_showWin"></block>
      <block type="rule_rest"></block>
    </category>
    ` + categoryXml + `
  </xml>`
  }
  //var workspace = Blockly.inject('blocklyDiv',obj);
  Code.init(obj, defaultXml);
}

function factoryInit(angularComp, defaultXml) {
  AngularBlockly = angularComp;
  var obj = {
    media: 'assets/media/', toolbox: `<xml id="toolbox" style="display: none">
    <category name="Input">
      <block type="input_value"></block>
      <block type="input_statement"></block>
      <block type="input_dummy"></block>
    </category>
    <category name="Field">
      <block type="field_static"></block>
      <block type="field_input"></block>
      <block type="field_angle"></block>
      <block type="field_dropdown"></block>
      <block type="field_checkbox"></block>
      <block type="field_colour"></block>
      <block type="field_variable"></block>
      <block type="field_image"></block>
    </category>
    <category name="Type">
      <block type="type_group"></block>
      <block type="type_null"></block>
      <block type="type_boolean"></block>
      <block type="type_number"></block>
      <block type="type_string"></block>
      <block type="type_list"></block>
      <block type="type_other"></block>
    </category>
    <category name="Colour" id="colourCategory">
      <block type="colour_hue"><mutation colour="20"></mutation><field name="HUE">20</field></block>
      <block type="colour_hue"><mutation colour="65"></mutation><field name="HUE">65</field></block>
      <block type="colour_hue"><mutation colour="120"></mutation><field name="HUE">120</field></block>
      <block type="colour_hue"><mutation colour="160"></mutation><field name="HUE">160</field></block>
      <block type="colour_hue"><mutation colour="210"></mutation><field name="HUE">210</field></block>
      <block type="colour_hue"><mutation colour="230"></mutation><field name="HUE">230</field></block>
      <block type="colour_hue"><mutation colour="260"></mutation><field name="HUE">260</field></block>
      <block type="colour_hue"><mutation colour="290"></mutation><field name="HUE">290</field></block>
      <block type="colour_hue"><mutation colour="330"></mutation><field name="HUE">330</field></block>
    </category>
  </xml>`
  }
  init(obj);
}
