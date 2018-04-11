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

goog.provide('Blockly.Blocks.component');

goog.require('Blockly.Blocks');


Blockly.Blocks.logic.HUE = 210;

Blockly.Blocks['component_action'] = {

  init: function() {
    var me = this;
    this.setColour(Blockly.Blocks.logic.HUE);
    this.appendDummyInput()
        .appendField('让组件')
        .appendField(new Blockly.FieldDialog([['','组件选择']], null, me), 'COMPID')
        .appendField(' ')
        .appendField(new Blockly.FieldDropdown([['隐藏','hide()'],['显示','show()'],['只读','setReadOnly(true)'],['可编辑','setReadOnly(false)']]), 'ACTION');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.Blocks['component_setValue'] = {

  init: function() {
    var me = this;
    this.setColour(Blockly.Blocks.logic.HUE);
    this.appendDummyInput()
      .appendField('给组件')
      .appendField(new Blockly.FieldDialog([['','组件选择']], null, me), 'COMPID')
      .appendField('赋值为');
    this.appendValueInput('IN');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.Blocks['component_getValue'] = {

  init: function() {
    var me = this;
    this.setColour(Blockly.Blocks.logic.HUE);
    this.appendDummyInput()
      .appendField('获取组件')
      .appendField(new Blockly.FieldDialog([['','组件选择']], null, me), 'COMPID')
      .appendField('的值');
    this.setOutput(true);
  }
};

Blockly.Blocks['component_showWin'] = {

  init: function() {
    var me = this;
    this.setColour(Blockly.Blocks.logic.HUE);
    this.appendDummyInput()
      .appendField('打开窗口')
      .appendField(new Blockly.FieldDialog([['','window选择']], null, me, 'showWin'), 'COMPID');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.Blocks['component_jsArea'] = {

  init: function() {
    var me = this;
    this.setColour(Blockly.Blocks.logic.HUE);
    this.appendDummyInput()
      .appendField('填充js代码')
      .appendField(new Blockly.FieldDialog([['','']], null, me, 'jsArea'), 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.Blocks['rule_rest'] = {
  // init: function () {
  //   var me = this;
  //   this.setColour(290);
  //   this.appendDummyInput()
  //     .appendField('访问服务端rest接口')
  //     .appendField(new Blockly.FieldDialog([['','选择rest']], null, me, 'rest'), 'NAME');
  //     // .appendField(new Blockly.SelectWin('', function (data) {
  //     //   if (data) {
  //     //     this.setValue(data);
  //     //     this.setText(data.displayName[Blockly.Drools.defLang] || '');
  //     //     me.appendArgInput(data.reqParameters, data.rspParameters);
  //     //   }
  //     // }, 'rest'), 'NAME');
  //   this.setPreviousStatement(true);
  //   this.setNextStatement(true);
  //   this.contextMenu = true;
  //   this.setTooltip('通过系统服务获取相关数据');
  //   this.arguments_ = [];
  // },
  init: function () {
    var me = this;
    this.respName = 'r_'+(new Date().getTime());
    this.setColour(290);
    this.appendDummyInput()
      .appendField('访问服务端rest接口')
      .appendField(new Blockly.FieldDialog([['','']], null, me, 'rest'), 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.contextMenu = true;
    this.setTooltip('通过系统服务获取相关数据');
  },
  appendArgInput: function (args, returns, respName) {
    if (this.getInput('NOARG')) {
      this.removeInput('NOARG');
    }
    if (this.argNums && this.argNums > 0) {
      for (var i = 0; i < this.argNums; i++) {
        this.removeInput('ARG'+i);
        this.removeInput('dummy' + i);
      }
    }
    this.argNums = 0;
    if (args && args[0]) {
      for (var key in args[0]) {
        var argObj = args[0][key];
        if (argObj && argObj.length > 0) {
          for (var i = 0; i < argObj.length; i++) {
            if (argObj[i].isHidden) {
              continue;
            }
            this.argNums ++;
            this.appendDummyInput('dummy' + i);
            this.appendValueInput('ARG'+i)
              .appendField('参数' + this.argNums + ':')
              .appendField(argObj[i].name, 'ARGNAME'+i)
              .appendField((argObj[i].description ? '【'+argObj[i].description+'】' : '' ) + ', 类型:'+ (argObj[i].type || '未知'))
              .appendField('是')
              .setAlign(1);
          }
        } else {
          this.appendDummyInput('NOARG')
            .appendField('不需要传入参数');
        }
      }

    } else {
      this.appendDummyInput('NOARG')
        .appendField('不需要传入参数');
    }

    if (this.getInput('success')) {
      this.removeInput('success');
    }
    if (this.getInput('failure')) {
      this.removeInput('failure');
    }

    this.appendStatementInput('success')
      .appendField('success: (jsondata)');
    this.appendStatementInput('failure')
      .appendField('failure: (jsondata)');
  }
};
