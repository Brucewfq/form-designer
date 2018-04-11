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
 * @fileoverview Dropdown input field.  Used for editable titles and variables.
 * In the interests of a consistent UI, the toolbox shares some functions and
 * properties with the context menu.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldDialog');

goog.require('Blockly.Field');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.userAgent');


/**
 * Class for an editable dropdown field.
 * @param {(!Array.<!Array.<string>>|!Function)} menuGenerator An array of options
 *     for a dropdown list, or a function which generates these options.
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected, with the newly selected value as its sole argument.
 *     If it returns a value, that value (which must be one of the options) will
 *     become selected in place of the newly selected option, unless the return
 *     value is null, in which case the change is aborted.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldDialog = function(menuGenerator, opt_validator, block, type) {
  this.block_ = block;
  this.type_ = type;
  this.menuGenerator_ = menuGenerator;
  this.trimOptions_();
  var firstTuple = this.getOptions_()[0];

  // Call parent's constructor.
  Blockly.FieldDialog.superClass_.constructor.call(this, firstTuple[1],
    opt_validator);
};
goog.inherits(Blockly.FieldDialog, Blockly.Field);

/**
 * Horizontal distance that a checkmark ovehangs the dropdown.
 */
Blockly.FieldDialog.CHECKMARK_OVERHANG = 25;

/**
 * Android can't (in 2014) display "▾", so use "▼" instead.
 */
Blockly.FieldDialog.ARROW_CHAR = goog.userAgent.ANDROID ? '\u25BC' : '\u25BE';

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldDialog.prototype.CURSOR = 'default';

/**
 * Install this dropdown on a block.
 * @param {!Blockly.Block} block The block containing this text.
 */
Blockly.FieldDialog.prototype.init = function(block) {

  this.arrow_ = Blockly.createSvgElement('tspan', {}, null);
  this.arrow_.appendChild(document.createTextNode(
    block.RTL ? Blockly.FieldDialog.ARROW_CHAR + ' ' :
      ' ' + Blockly.FieldDialog.ARROW_CHAR));
  Blockly.FieldDialog.superClass_.init.call(this, block);
  // Add dropdown arrow: "option ▾" (LTR) or "▾ אופציה" (RTL)
  if (this.sourceBlock_) {
    // Dropdown has already been initialized once.
    return;
  }
  // Force a reset of the text to add the arrow.
  var text = this.text_;
  this.text_ = null;
  this.setText(text);
};

/**
 * Create a dropdown menu under the text.
 * @private
 */
Blockly.FieldDialog.prototype.showEditor_ = function() {
  if (AngularBlockly) {
    if (this.block_) {
      this.block_.type_ = this.type_;
    }
    AngularBlockly.showChoose(this.type_, this.value_);
    nowBlock = this.block_;
  }
};

/**
 * Factor out common words in statically defined options.
 * Create prefix and/or suffix labels.
 * @private
 */
Blockly.FieldDialog.prototype.trimOptions_ = function() {
  this.prefixField = null;
  this.suffixField = null;
  var options = this.menuGenerator_;
  if (!goog.isArray(options)) {
    return;
  }
  // Remove the prefix and suffix from the options.
  var newOptions = [];
  for (var x = 0; x < options.length; x++) {
    var text = options[x][0];
    var value = options[x][1];
    newOptions[x] = [text, value];
  }
  this.menuGenerator_ = newOptions;
};

/**
 * Return a list of the options for this dropdown.
 * @return {!Array.<!Array.<string>>} Array of option tuples:
 *     (human-readable text, language-neutral name).
 * @private
 */
Blockly.FieldDialog.prototype.getOptions_ = function() {
  if (goog.isFunction(this.menuGenerator_)) {
    return this.menuGenerator_.call(this);
  }
  return /** @type {!Array.<!Array.<string>>} */ (this.menuGenerator_);
};

/**
 * Get the language-neutral value from this dropdown menu.
 * @return {string} Current text.
 */
Blockly.FieldDialog.prototype.getValue = function() {
  return this.value_;

};

/**
 * Set the language-neutral value for this dropdown menu.
 * @param {string} newValue New value to set.
 */
Blockly.FieldDialog.prototype.setValue = function(newValue) {
  if (newValue === null || newValue === this.value_) {
    return;  // No change if null.
  }
  if (newValue && this.type_ === 'jsArea') {
    this.value_ = newValue;
    this.setText('已设置');
  } else if (newValue && this.type_ === 'rest') {
    if ('string' === typeof newValue) {
      this.value_ = newValue;
      var val = JSON.parse(newValue);
      this.setText(val.displayName[defLang] || '');
      this.sourceBlock_.appendArgInput(val.reqParameters, val.rspParameters, this.sourceBlock_.respName);
    } else {
      this.value_ = JSON.stringify(newValue);
      this.setText(newValue.displayName[defLang] || '');
      this.sourceBlock_.appendArgInput(newValue.reqParameters, newValue.rspParameters, this.sourceBlock_.respName);
    }

  } else {
    this.value_ = newValue;
    this.setText(newValue);
  }
};

/**
 * Set the text in this field.  Trigger a rerender of the source block.
 * @param {?string} text New text.
 */
Blockly.FieldDialog.prototype.setText = function(text) {
  if (this.sourceBlock_ && this.arrow_) {
    // Update arrow's colour.
    this.arrow_.style.fill = this.sourceBlock_.getColour();
  }
  if (text === null || text === this.text_) {
    // No change if null.
    return;
  }
  this.text_ = text;
  this.updateTextNode_();
  if (this.textElement_) {
    // Insert dropdown arrow.
    if (this.sourceBlock_.RTL) {
      this.textElement_.insertBefore(this.arrow_, this.textElement_.firstChild);
    } else {
      this.textElement_.appendChild(this.arrow_);
    }
  }

  if (this.sourceBlock_ && this.sourceBlock_.rendered) {
    this.sourceBlock_.render();
    this.sourceBlock_.bumpNeighbours_();
  }
};

/**
 * Close the dropdown menu if this input is being deleted.
 */
Blockly.FieldDialog.prototype.dispose = function() {
  Blockly.WidgetDiv.hideIfOwner(this);
  Blockly.FieldDialog.superClass_.dispose.call(this);
};
