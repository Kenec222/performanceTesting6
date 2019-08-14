/**
 * Copyright (C) 2019 Unicorn a.s.
 *
 * This program is free software; you can use it under the terms of the UAF Open License v01 or
 * any later version. The text of the license is available in the file LICENSE or at www.unicorn.com.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See LICENSE for more details.
 *
 * You may contact Unicorn a.s. at address: V Kapslovne 2767/2, Praha 3, Czech Republic or
 * at the email: info@unicorn.com.
 */

import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import * as UU5 from "uu5g04";
import ns from "./forms-ns.js";
import "uu5g04-bricks";

import ControlsMixin from './mixins/controls-mixin.js';
import './controls.less';

const buttonPropTypes = PropTypes.shape({
  size: PropTypes.oneOf(['s', 'm', 'l', 'xl']),
  content: PropTypes.any,
  colorSchema: PropTypes.oneOf(UU5.Environment.colorSchema),
  bgStyle: PropTypes.oneOf(['filled', 'outline', 'transparent', 'underline'])
});

export const Controls = createReactClass({

  //@@viewOn:mixins
  mixins: [ControlsMixin],
  //@@viewOff:mixins

  //@@viewOn:statics
  statics: {
    tagName: ns.name("Controls"),
    classNames: {
      main: ns.css("controls")
    },
    lsi: () => (UU5.Environment.Lsi.Forms.controls),
    defaults: {
      reset: { bgStyle: "transparent" },
      validate: { bgStyle: "transparent" },
      submit: { colorSchema: "primary" },
      cancel: { }
    }
  },
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {
    buttonSubmitProps: buttonPropTypes,
    buttonCancelProps: buttonPropTypes,
    buttonResetProps: buttonPropTypes,
    buttonValidateProps: buttonPropTypes,
    buttonReset: PropTypes.bool,
    buttonValidate: PropTypes.bool
  },
 //@@viewOff:propTypes

  //@@viewOn:getDefaultProps
  getDefaultProps () {
    return {
      buttonReset: false,
      buttonValidate: false,
      buttonSubmitProps:null,
      buttonCancelProps:null,
      buttonValidateProps:null,
      buttonResetProps:null
    };
  },
  //@@viewOff:getDefaultProps

  //@@viewOn:standardComponentLifeCycle
  getInitialState() {
    return this._mergeButtonsState();
  },

  componentWillReceiveProps(nextProps){
    if(this.props.controlled){
      this.setState(this._mergeButtonsState(nextProps));
    }
  },
  //@@viewOff:standardComponentLifeCycle

  //@@viewOn:interface
  //@@viewOff:interface

  //@@viewOn:overridingMethods
  //@@viewOff:overridingMethods

  //@@viewOn:componentSpecificHelpers
  _save() {
    let form = this.getForm();
    form.save();

    return this;
  },

  _getMainPropsToPass() {
    let props = this.getMainPropsToPass();
    props.disabled = false;

    return props;
  },

  _getButtonKeyName(buttonName) {
    let uppercasedButtonName = buttonName.charAt(0).toUpperCase() + buttonName.slice(1);
    return `button${uppercasedButtonName}Props`;
  },

  _constructButtonState(buttonName, props = this.props) {
    let buttonState = UU5.Common.Tools.merge({}, this.getDefault(buttonName), props[this._getButtonKeyName(buttonName)]);
    buttonState.content = buttonState.content || this.getLsiComponent(buttonName === "submit" ? "ok" : buttonName); // For some reason Lsi for a submit button is called "ok"
    return buttonState;
  },

  _getButtonState(buttonName) {
    let buttonState = this.state[this._getButtonKeyName(buttonName)];
    buttonState.disabled = typeof buttonState.disabled === "boolean" ? buttonState.disabled : this.isDisabled();
    return buttonState;
  },

  _mergeButtonsState(props = this.props) {
    let newState = {};
    ["reset", "validate", "submit", "cancel"].forEach(buttonName => {
      let buttonState = this._constructButtonState(buttonName, props);
      newState[this._getButtonKeyName(buttonName)] = buttonState;
    });

    return newState;
  },
  //@@viewOff:componentSpecificHelpers

  //@@viewOn:render
  render() {
    return (
      <UU5.Common.Div {...this._getMainPropsToPass()}>
        {(this.props.buttonReset) &&
          <UU5.Bricks.Button
            {...this._getButtonState("reset")}
            onClick={() => this.getForm().reset()}
          />
        }

        {(this.props.buttonValidate) && <UU5.Bricks.Button
          {...this._getButtonState("validate")}
            onClick={() => this.getForm().validate()}
        />}
        <UU5.Bricks.Button
          {...this._getButtonState("cancel")}
          onClick={() => this.getForm().cancel()}
        />
        <UU5.Bricks.Button
          {...this._getButtonState("submit")}
          onClick={this._save}
        />
      </UU5.Common.Div>
    );
  }
  //@@viewOff:render
});

export default Controls;
