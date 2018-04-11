/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Logic blocks for Blockly.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.JavaScript.component');

goog.require('Blockly.JavaScript');


Blockly.JavaScript['component_action'] = function(block) {
  var value = block.getFieldValue('COMPID'),
      action = block.getFieldValue('ACTION'),
      code = '';
  if (value && value !== '组件选择') {
    var code = 'ref.' + value + '.' + action + ';';
  } else {
    AngularMsg.push('component_action 请在【对某组件操作】中选择选择组件，或者删除积木');
    return '';
  }
  return code + '\n';
};

Blockly.JavaScript['component_setValue'] = function(block) {
  var value = block.getFieldValue('COMPID'),
    code = '';
  var argument0 = Blockly.JavaScript.valueToCode(block, 'IN',
    Blockly.JavaScript.ORDER_NONE) || '\'\'';
  if (value && value !== '组件选择') {
    code = 'ref.' + value + '.setValue(' + argument0 + ');';
  } else {
    AngularMsg.push('component_setValue 请在【给组件赋值的积木】中选择选择组件，或者删除积木');
    return '';
  }
  return code + '\n';
};

Blockly.JavaScript['component_getValue'] = function(block) {
  var value = block.getFieldValue('COMPID'),
    code = '';
  if (value && value !== '组件选择') {
    code = 'ref.' + value + '.getValue()';
  } else {
    AngularMsg.push('component_getValue 请在【获取某组件值的积木】中选择选择组件，或者删除积木');
    return '';
  }
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['component_jsArea'] = function(block) {
  var code = block.getFieldValue('NAME') || '';
  if (code && code.endsWith(';')) {
    return code + '\n';
  }
  return code + ';\n';
};

Blockly.JavaScript['component_showWin'] = function(block) {
  var value = block.getFieldValue('COMPID'),
    code = '';
  if (value && value !== 'window选择') {
    var code = 'Ext.create({xclass: \'PAI.view.form.' + value + '\',\n'+
      'ownerForm: this.lookupController().getView(),\n' +
      'viewModel: this.lookupViewModel()}).show();';
  } else {
    AngularMsg.push('component_action 请在【对某组件操作】中选择选择组件，或者删除积木');
    return '';
  }
  return code + '\n';
};

Blockly.JavaScript['rule_rest'] = function(block) {
  var object = block.getFieldValue('NAME'),
      successCode = Blockly.JavaScript.statementToCode(block, 'success') || '',
      failureCode = Blockly.JavaScript.statementToCode(block, 'failure') || '';
  if (!object) {
    // TODO
    return '';
  }
  var service = JSON.parse(object);
  var params = '{';
  for (var i = 0; i < block.argNums; i++) {
    if (block.getInput('ARG'+i)) {
      var key = block.getFieldValue('ARGNAME'+i);
      if (!key) {
        continue;
      }
      var valCode = Blockly.JavaScript.valueToCode(block, 'ARG'+i, 99);
      // if (valCode === '') {
      //   valCode = '\'\'';
      // }
      if (!valCode) {
        continue;
      }
      params = params + '\'' + key + '\' : ' + valCode
      if (i < (block.argNums-1)) {
        params = params + ',';
      }
    }
  }
  params = params + '}';
  var code = 'Ext.PAIRest.request({\n' +
    '  ns: PAI.application.serviceUrl,\n' +
    '  url: \'' + service.service + service.apiUrl +'\',\n' +
    '  method: "POST",\n' +
    '  async: false,\n' +
    '  data: ' + params + ',\n' +
    '  success: function (jsondata) {\n' +
    successCode +
    '  },\n' +
    '  failure: function (jsondata) {\n' +
    failureCode +
    '  }\n' +
    '});\n';
  return code;
};
