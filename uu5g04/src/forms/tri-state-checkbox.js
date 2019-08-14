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
import "uu5g04-bricks";
import ns from "./forms-ns.js";
import ClassNames from "../core/common/class-names.js";

import InputMixin from './mixins/input-mixin.js';
import Loading from './internal/loading.js';

import Context from "./form-context.js";

import './tri-state-checkbox.less';

export const TriStateCheckbox = Context.withContext(
  createReactClass({
    //@@viewOn:mixins
    mixins: [
      UU5.Common.BaseMixin,
      UU5.Common.PureRenderMixin,
      UU5.Common.ElementaryMixin,
      UU5.Common.ColorSchemaMixin,
      InputMixin
    ],
    //@@viewOff:mixins

    //@@viewOn:statics
    statics: {
      tagName: ns.name("TriStateCheckbox"),
      classNames: {
        main: ns.css("tri-state-checkbox"),
        button: ns.css("tri-state-checkbox-button"),
        right: ns.css("input-label-right"),
        rightWrapper: ns.css("right-wrapper"),
        checked: ns.css("tri-state-checkbox-checked"),
        unChecked: ns.css("tri-state-checkbox-unchecked"),
        indeterminate: ns.css("tri-state-checkbox-indeterminate"),
        loading: ns.css("input-loading-icon")
      },
      defaults: {
        onIcon: 'mdi-check',
        indeterminateIcon: "mdi-stop",
        offIcon: ""
      },
      lsi: () => UU5.Environment.Lsi.Forms.message
    },
    //@@viewOff:statics

    //@@viewOn:propTypes
    propTypes: {
      value: PropTypes.oneOf([true, false, null]),
      onIcon: PropTypes.string,
      offIcon: PropTypes.string,
      indeterminateIcon: PropTypes.string,
      labelPosition: PropTypes.oneOf(['left', 'right']),
      bgStyleChecked: PropTypes.oneOf(["filled", "outline"]),
      bgStyleIndeterminate: PropTypes.oneOf(["filled", "outline"])
    },
    //@@viewOff:propTypes

    //@@viewOn:getDefaultProps
    getDefaultProps () {
      return {
        value: null,
        onIcon: '',
        offIcon: '',
        indeterminateIcon: '',
        labelPosition: 'left',
        bgStyleChecked: "outline",
        bgStyleIndeterminate: "outline"
      };
    },
    //@@viewOff:getDefaultProps

    //@@viewOn:standardComponentLifeCycle
    componentWillMount() {
      if (this.props.onValidate && typeof this.props.onValidate === "function") {
        this._validateOnChange({ value: this.state.value, event: null, component: this });
      }
    },

    componentWillReceiveProps(nextProps) {
      if (nextProps.controlled) {
        if (this.props.onValidate && typeof this.props.onValidate === 'function') {
          this._validateOnChange({ value: nextProps.value, event: null, component: this }, true);
        } else {
          this.setState({ value: nextProps.value });
        }
      }
    },

    //@@viewOff:standardComponentLifeCycle

    //@@viewOn:interface
    onChangeDefault(opt, setStateCallback) {
      if (this.props.onValidate && typeof this.props.onValidate === "function") {
        this._validateOnChange({ value: opt.value, event: opt.event, component: this }, setStateCallback);
      } else {
        let result = this.getChangeFeedback(opt);
        this.setState({
          feedback: result.feedback,
          message: result.message,
          value: result.value
        }, setStateCallback);
      }
      return this;
    },
    //@@viewOff:interface

    //@@viewOn:overridingMethods
    focus_() {
      this._focusElement.focus();
      return this;
    },

    getInputWidth_() {
      return this.props.inputWidth === "auto" ? null : this.props.inputWidth;
    },
    //@@viewOff:overridingMethods

    //@@viewOn:componentSpecificHelpers
    _validateOnChange(opt, checkValue, setStateCallback) {
      let _callCallback = typeof setStateCallback === "function";

      if (!checkValue || this._hasValueChanged(this.state.value, opt.value)) {
        let result = this.props.onValidate && typeof this.props.onValidate === "function" ? this.props.onValidate(opt) : null;
        if (result) {
          if (typeof result === 'object') {
            if (result.feedback) {
              _callCallback = false;
              this.setFeedback(result.feedback, result.message, result.value, setStateCallback);
            } else {
              _callCallback = false;
              this.setState({ value: opt.value }, setStateCallback);
            }
          } else {
            this.showError('validateError', null, { context: { event: opt.event, func: this.props.onValidate, result: result } });
          }
        }
      }

      if (_callCallback) {
        setStateCallback();
      }

      return this;
    },

    _changeValueOnChange() {
      let value;
      if (this.state.value === null) {
        value = true;
      } else if (this.state.value === true) {
        value = false;
      } else value = null;
      return value;
    },

    _onChange(e){
      let opt = { value: this._changeValueOnChange(), event: e, component: this };
      if (!this.isComputedDisabled() && !this.isReadOnly() && !this.isLoading()) {
        if (typeof this.props.onChange === 'function') {
          this.props.onChange(opt);
        } else {
          this.onChangeDefault(opt);
        }
      }

      return this;
    },

    isValid() {
      let feedback = this.getFeedback();
      let result = true;

      if (this.props.required && this.state.value === null) {
        this.setError(this.props.requiredMessage || this.getLsiComponent('requiredMessage'));
        result = false;
      } else if (feedback === 'error') {
        result = false;
      } else if (typeof this.isValid_ === 'function') {
        result = this.isValid_();
      }

      if (result && typeof this.props.onValidate === 'function') {
        let validation = this.props.onValidate(value, this);
        if (validation && typeof validation === 'object') {
          if (validation.feedback === 'error') {
            result = false;
          }
        }
      }
      return result;
    },

    _getEventPath(e) {
      let path = [];
      let node = e.target;
      while (node != document.body && node != document.documentElement && node) {
        path.push(node);
        node = node.parentNode;
      }
      return path;
    },

    _getMainAttrs(){
      let mainAttrs = this._getInputAttrs();

      if (this.state.value === null) {
        mainAttrs.className += ' ' + this.getClassName("indeterminate");

        if (this.props.bgStyleIndeterminate) {
          mainAttrs.className += " " + ClassNames[this.props.bgStyleIndeterminate];
        }
      }

      if (this.state.value === true) {
        mainAttrs.className += ' ' + this.getClassName("checked");

        if (this.props.bgStyleChecked) {
          mainAttrs.className += " " + ClassNames[this.props.bgStyleChecked];
        }
      }

      if (this.state.value === false) {
        mainAttrs.className += ' ' + this.getClassName("unChecked");

        mainAttrs.className += " " + ClassNames["outline"];
      }

      if (this.props.labelPosition === 'right') {
        mainAttrs.className += ' ' + this.getClassName().right;
      }

      let handleClick = (e) => {
        let matches = this._getEventPath(e).some((item) => {
          let functionType = item.matches ? "matches" : "msMatchesSelector";
          if (item[functionType]) {
            return item[functionType]("button.uu5-forms-tri-state-checkbox-button, .uu5-forms-label");
          } else {
            return false;
          }
        });
        if (matches) {
          this._onChange(e);
        }
      }

      mainAttrs.onClick = (e) => {
        handleClick(e);
      };

      return mainAttrs;
    },

    _getIcon() {
      let icon;

      if (this.state.value === null) {
        icon = this.props.indeterminateIcon || this.getDefault("indeterminateIcon");
      } else if (this.state.value === true) {
        icon = this.props.onIcon || this.getDefault("onIcon");
      } else if (this.state.value === false) {
        icon = this.props.offIcon || this.getDefault("offIcon");
      }

      return <UU5.Bricks.Icon icon={icon} />;
    },

    _getWrapperAttrs() {
      let attrs = {};

      attrs.className = this.getClassName("rightWrapper");

      if (this.props.inputWidth) {
        attrs.style = { width: this.getInputWidth_() };
      }

      return attrs;
    },
    //@@viewOff:componentSpecificHelpers
    //@@viewOn:render
    render() {
      let inputId = this.getId() + '-input';
      let label = this.getLabel(inputId);
      let result;

      if (this.isLoading()) {
        result = <Loading className={this.getClassName("loading")} id={this.getId()} />;
      } else {
        result =
          (<UU5.Bricks.Button
            className={this.getClassName().button}
            colorSchema="custom"
            disabled={this.isComputedDisabled()}
            mainAttrs={UU5.Common.Tools.merge({disabled: this.isReadOnly() || this.isComputedDisabled()},this.props.inputAttrs)}
            content={this._getIcon()}
            ref_={(button) => this._focusElement = button}
          />)
        }

      return (
        <div {...this._getMainAttrs()}>
          {this.props.labelPosition === 'left' && label}
          {this.getInputWrapper(
            <UU5.Bricks.Div {...this._getWrapperAttrs()}>
              {result}
              {this.props.labelPosition === 'right' && label}
            </UU5.Bricks.Div>
          )}
        </div>
      );
    }
    //@@viewOn:render
  })
);

export default TriStateCheckbox;
