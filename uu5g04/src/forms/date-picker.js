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
import TextInput from './internal/text-input.js';
import TextInputMixin from './mixins/text-input-mixin.js'

import Context from "./form-context.js";

import './date-picker.less';

export const DatePicker = Context.withContext(
  createReactClass({
    //@@viewOn:mixins
    mixins: [
      UU5.Common.BaseMixin,
      UU5.Common.PureRenderMixin,
      UU5.Common.ElementaryMixin,
      UU5.Common.ScreenSizeMixin,
      TextInputMixin
    ],
    //@@viewOff:mixins

    //@@viewOn:statics
    statics: {
      tagName: ns.name("DatePicker"),
      classNames: {
        main: ns.css("datepicker"),
        open: ns.css("datepicker-open"),
        menu: ns.css("input-menu"),
        screenSizeBehaviour: ns.css("screen-size-behaviour")
      },
      defaults: {
        inputColWidth: "xs12 s4 m4 l3 xl3"
      },
      lsi: () => (UU5.Environment.Lsi.Forms.message)
    },
    //@@viewOff:statics

    //@@viewOn:propTypes
    propTypes: {
      value: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.string
      ]),
      dateFrom: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.string
      ]),
      dateTo: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.string
      ]),
      iconOpen: PropTypes.string,
      iconClosed: PropTypes.string,
      format: PropTypes.string,
      country: PropTypes.string,
      nanMessage: PropTypes.any,
      beforeRangeMessage: PropTypes.any,
      afterRangeMessage: PropTypes.any,
      parseDate: PropTypes.func,
      disableBackdrop: PropTypes.bool,
      valueType: PropTypes.oneOf(['string','date']),
      openToContent: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
      hideFormatPlaceholder: PropTypes.bool,
      showTodayButton: PropTypes.bool
    },
    //@@viewOff:propTypes

    //@@viewOn:getDefaultProps
    getDefaultProps() {
      return {
        value: null,
        dateFrom: null,
        dateTo: null,
        iconOpen: 'mdi-calendar',
        iconClosed: 'mdi-calendar',
        format: null,
        country: null,
        nanMessage: 'Please insert a valid date.',
        beforeRangeMessage: 'Date is out of range.',
        afterRangeMessage: 'Date is out of range.',
        parseDate: null,
        icon: 'mdi-calendar',
        disableBackdrop: false,
        valueType: null,
        openToContent: "xs",
        hideFormatPlaceholder: false,
        showTodayButton: false
      };
    },
    //@@viewOff:getDefaultProps

    //@@viewOn:standardComponentLifeCycle
    getInitialState() {
      return {
        format: this.props.format,
        country: this.props.country || UU5.Common.Tools.getLanguage()
      };
    },

    componentWillMount() {
      this._hasFocus = false;
      let value = this._getDateString(this.props.value) || this.props.value;
      let validationResult = this._validateOnChange({ value, event: null, component: this });

      if (validationResult) {
        this._updateState(validationResult);
      } else {
        value = this._getDateString(value);
        validationResult = this._validateDate({ value });
        if (validationResult.feedback === "initial") {
          validationResult.feedback = this.props.feedback || validationResult.feedback;
          validationResult.message = this.props.message || validationResult.message;
        }

        this._updateState(validationResult);
      }

      return this;
    },

    componentDidMount() {
      UU5.Environment.EventListener.registerDateTime(this.getId(), this._change);
    },

    componentWillReceiveProps(nextProps) {
      if (nextProps.controlled) {
        let value = this._hasInputFocus() && !(nextProps.value instanceof Date) ? nextProps.value : this._getDateString(nextProps.value) || nextProps.value;
        let validationResult = this._validateOnChange({ value, event: null, component: this }, true);

        if (validationResult) {
          this._updateState(validationResult);
        } else {
          value = this._getDateString(value);
          validationResult = this._validateDate({ value });
          if (validationResult.feedback === "initial") {
            validationResult.feedback = nextProps.feedback || validationResult.feedback;
            validationResult.message = nextProps.message || validationResult.message;
          }

          this._updateState(validationResult);
        }
      }

      return this;
    },

    componentWillUnmount() {
      this._removeEvent();
      UU5.Environment.EventListener.unregisterDateTime(this.getId(), this._change);
    },

    componentDidUpdate(prevProps, prevState) {
      if (this.isOpen()) {
        if ((this.state.screenSize === "xs" && prevState.screenSize !== "xs") || (this.state.screenSize !== "xs" && prevState.screenSize === "xs")) {
          this._open();
        }
      }
    },
    //@@viewOff:standardComponentLifeCycle

    //@@viewOn:interface
    toggle(setStateCallback) {
      this.setState((state) => {
        if (state.open) {
          this._removeEvent();
        } else {
          this._stopPropagation = true;
          this._addEvent();
        }
        return { open: !state.open };
      }, setStateCallback);
      return this;
    },

    parseDate(stringDate) {
      return this._parseDate(stringDate);
    },

    parseDateDefault(stringDate) {
      return UU5.Common.Tools.parseDate(stringDate, { format: this.state.format, country: this.state.country });
    },
    //@@viewOff:interface

    //@@viewOn:overridingMethods
    setFeedback_(feedback, message, value, setStateCallback) {
      value = this._hasInputFocus() && !(value instanceof Date) ? value : this._getDateString(value) || value;
      this.setFeedbackDefault(feedback, message, value, setStateCallback);
    },

    setValue_(value, setStateCallback) {
      let _callCallback = typeof setStateCallback === "function";
      value = this._hasInputFocus() && !(value instanceof Date) ? value : this._getDateString(value) || value;
      if (!this._validateOnChange({ value }, false)) {
        if (this._checkRequired({ value })) {
          _callCallback = false;
          this._updateState(this._validateDate({ value }), setStateCallback);
        }
      }

      if (_callCallback) {
        // function _validateOnChange always calls a provided callback, therefore
        // this is a workaround to secure that we call it only once and a setState callback
        this.setState({}, setStateCallback);
      }

      return this;
    },

    getValue_() {
      let date;

      if (this.props.valueType == "date") {
        if (this.state.value instanceof Date) {
          date = this.state.value;
        } else {
          date = this._parseDate(this.state.value);
        }
      } else if (this.props.valueType == "string") {
        date = this._getDateString(this.state.value);
      } else {
        if (this.state.value instanceof Date) {
          date = this.state.value;
        } else {
          date = this._parseDate(this.state.value);
        }
      }

      return date;
    },

    onChangeDefault_(opt, setStateCallback) {
      let type = opt._data.type;

      if (type == "input") {
        this._onChangeInputDefault(opt, setStateCallback);
      } else if (type == "picker") {
        this._onChangePickerDefault(opt, setStateCallback);
      }
    },

    onBlurDefault_(opt) {
      let value = opt._data ? opt._data.value : opt.value;
      let formatedValue = this._getDateString(value);
      if (this._checkRequired({ value: formatedValue || value }) && !this.props.validateOnChange) {
        opt.value = formatedValue || value;
        opt.required = this.props.required;
        let blurResult = this.getBlurFeedback(opt);
        let result = this._validateDate(blurResult);

        this._updateState(result);
      } else {
        this.setState({ value: formatedValue || value });
      }
    },

    onFocusDefault_(opt) {
      let result = this.getFocusFeedback(opt);

      result && this._updateState(result);
    },

    open_(setStateCallback) {
      this._addEvent();
      this.openDefault(() => this._open(setStateCallback));
    },

    close_(setStateCallback) {
      this._removeEvent();
      this.closeDefault(() => this._close(setStateCallback));
    },
    //@@viewOff:overridingMethods

    //@@viewOn:componentSpecificHelpers
    _getEventPath(e) {
      let path = [];
      let node = e.target;
      while (node != document.body && node != document.documentElement && node) {
        path.push(node);
        node = node.parentNode;
      }
      return path;
    },

    _findTarget(e) {
      let labelMatch = "[id='" + this.getId() + "'] label";
      let inputMatch = "[id='" + this.getId() + "'] input";
      let pickerMatch = "[id='" + this.getId() + "'] .uu5-forms-input-menu";
      let result = {
        component: false,
        input: false,
        label: false,
        picker: false
      }
      let eventPath = this._getEventPath(e);
      eventPath.every((item) => {
        let functionType = item.matches ? "matches" : "msMatchesSelector";
        if (item[functionType]) {
          if (item[functionType](labelMatch)) {
            result.label = true;
            result.component = true;
          } else if (item[functionType](inputMatch)) {
            result.input = true;
            result.component = true;
          } else if (item[functionType](pickerMatch)) {
            result.picker = true;
            result.component = true;
          } else if (item === this._root) {
            result.component = true;
            return false;
          }
          return true;
        } else {
          return false;
        }
      });

      return result;
    },

    _handleClick(e) {
      // This function can be called twice if clicking inside the component but it doesnt do anything in that case
      let clickData = this._findTarget(e);
      let opt = { value: this.state.value, event: e, component: this };

      if (!(clickData.input || clickData.picker) && !this.props.disableBackdrop) {
        if (this.isOpen()) {
          this.close(() => this._onBlur(opt));
        }
      } else if (!(clickData.input || clickData.picker) && this.props.disableBackdrop) {
        this._onBlur(opt);
      }
    },

    _addEvent() {
      window.addEventListener("click", this._handleClick, true);
    },

    _removeEvent() {
      window.removeEventListener("click", this._handleClick, true);
    },

    _change(opt) {
      this._onChangeFormat(opt);
    },

    _onChangeFormat(opt, setStateCallback) {
      let format = opt.format === undefined ? this.state.format : opt.format;
      let country = opt.country === undefined ? this.state.country : (opt.country ? opt.country.toLowerCase() : opt.country);
      let value = this._getDateString(this.state.value, format, country);
      this._updateState({
        value,
        format,
        country,
      }, setStateCallback);
    },

    _open(setStateCallback) {
      if (this._popover) {
        this._popover.open({
        onClose: this._close,
        aroundElement: this._textInput.findDOMNode(),
        position: "bottom",
        offset: this._shouldOpenToContent() ? 0 : 4,
        preventPositioning: this._shouldOpenToContent()
      }, setStateCallback);
      } else if (typeof setStateCallback === "function") {
        setStateCallback();
      }
    },

    _close(setStateCallback) {
      if (this._popover) {
        this._popover.close(setStateCallback);
      } else if (typeof setStateCallback === "function") {
        setStateCallback();
      }
    },

    _shouldOpenToContent() {
      let result = false;

      if (typeof this.props.openToContent === "string") {
        let screenSize = this.getScreenSize();
        this.props.openToContent.trim().split(" ").some((size) => {
          if (screenSize == size) {
            result = true;
            return true;
          } else {
            return false;
          }
        })
      } else if (typeof this.props.openToContent === "boolean") {
        result = this.props.openToContent;
      }

      return result;
    },

    _updateState(newState, setStateCallback) {
      if (newState.value !== undefined) {
        if (newState.value === null) {
          newState.value = "";
        }
      } else {
        newState.value = this.state.value;
      }

      if (newState.message === undefined) {
        newState.message = this.state.message || null;
      }

      this.setState(newState, setStateCallback);
    },

    _onChange(e) {
      let opt = { value: e.target.value, event: e, component: this };
      let date = this._parseDate(opt.value);
      let formatedDate = date ? this._getDateString(date) : null;

      if (!opt.value || formatedDate) {
        if (!this.isComputedDisabled() && !this.isReadOnly()) {
          opt.required = this.props.required;
          let result = this.getChangeFeedback(opt);
          opt._data = { type: 'input', required: this.props.required, result: result, value: e.target.value };
          if (typeof this.props.onChange === 'function') {
            if (this.props.valueType == "date") {
              opt.value = date;
            }
            this.props.onChange(opt);
          } else {
            this.onChangeDefault(opt);
          }
        }
      } else {
        this._updateState({ value: opt.value });
      }
      return this;
    },

    _onChangeInputDefault(opt, setStateCallback) {
      let value = opt._data ? opt._data.value : opt.value;
      let _callCallback = typeof setStateCallback === "function";

      if (this.props.validateOnChange) {
        opt.value = opt._data.value;
        if (!this._validateOnChange(opt)) {
          if (this._checkRequired(opt)) {
            _callCallback = false;
            this._updateState(this._validateDate(opt), setStateCallback);
          }
        }
      } else {
        if (value) {
          if (this._checkRequired({ value: value })) {
            opt.required = this.props.required;
            opt.value = value;
            let result = this.getChangeFeedback(opt);
            _callCallback = false;
            this._updateState(result, setStateCallback);
          }
        } else {
          _callCallback = false;
          this.setState({ value }, setStateCallback);
        }
      }

      if (_callCallback) {
        setStateCallback();
      }

      return this;
    },

    _onChangePickerDefault(opt, setStateCallback) {
      this.setValue(opt.value, () => this.close(setStateCallback));

      return this;
    },

    _onFocus(opt) {
      if (!this._hasFocus) {
        this._hasFocus = true;
        if (!this.isReadOnly() && !this.isComputedDisabled()) {
          if (typeof this.props.onFocus === 'function') {
            this.props.onFocus(opt);
          } else {
            this.onFocusDefault(opt);
          }
        }
      }
    },

    _onBlur(opt) {
      if (this._hasFocus) {
        this._hasFocus = false;
        if (typeof this.props.onBlur === 'function') {
          this.props.onBlur(opt);
        } else {
          this.onBlurDefault(opt);
        }
      }
    },

    _hasInputFocus() {
      let result = false;

      if (this._textInput) {
        result = this._textInput.hasFocus();
      }

      return result;
    },

    _getDate(date) {
      if (typeof date === 'string') {
        date = this._parseDate(date);
      }
      return date;
    },

    _validateDate(opt) {
      let result = { ...opt };
      let date = this._parseDate(opt.value ? opt.value : this.state.value);
      result.feedback = result.feedback || "initial";
      result.message = result.message || null;

      if (opt.value && !date) {
        result.feedback = 'error';
        result.message = this.props.nanMessage;
      }

      if (date) {
        let dateFrom = this._getDateFrom(result.dateFrom);
        let dateTo = this._getDateTo(result.dateTo);
        if (dateFrom && date < dateFrom) {
          result.feedback = 'error';
          result.message = this.props.beforeRangeMessage;
        } else if (dateTo && date > dateTo) {
          result.feedback = 'error';
          result.message = this.props.afterRangeMessage;
        } else {
          result.feedback = result.feedback || "initial";
          result.message = result.message || null;
        }
      }

      return result;
    },

    _validateOnChange(opt, checkValue, setStateCallback) {
      let _callCallback = typeof setStateCallback === "function";
      let result;

      if (!checkValue || this._hasValueChanged(this.state.value, opt.value)) {
        result = typeof this.props.onValidate === 'function' ? this.props.onValidate(opt) : null;
        if (result && typeof result === 'object' && result.feedback) {
          _callCallback = false;
          this._updateState(result, setStateCallback);
        }
      }

      if (_callCallback) {
        setStateCallback();
      }

      return result;
    },

    _getFeedbackIcon() {
      return this.isOpen() ? this.props.iconOpen : this.props.iconClosed;
    },

    _onCalendarChange(opt) {
      let date = this._getDateString(opt.value);
      opt = { value: opt.value, event: opt.event, component: this, _data: { type: 'picker', value: date } };
      if (this.props.valueType === null || this.props.valueType == "string") {
        opt.value = date;
      }
      if (typeof this.props.onChange === 'function') {
        this.setState({ open: false }, () => this.props.onChange(opt));
      } else {
        this.onChangeDefault(opt);
      }
      return this;
    },

    _getDateFrom() {
      let dateFrom;
      if (this.props.dateFrom) {
        if (typeof this.props.dateFrom === 'string') {
          dateFrom = this._parseDate(this.props.dateFrom);
        } else if (this.props.dateFrom instanceof Date) {
          dateFrom = this.props.dateFrom;
        }
      }
      return dateFrom;
    },

    _getDateTo() {
      let dateTo;
      if (this.props.dateTo) {
        if (typeof this.props.dateTo === 'string') {
          dateTo = this._parseDate(this.props.dateTo);
        } else if (this.props.dateTo instanceof Date) {
          dateTo = this.props.dateTo;
        }
      }
      return dateTo;
    },

    _getCalendarProps() {
      let date = typeof this.getValue() === 'string' ? this._parseDate(this.getValue()) : this.getValue();

      return {
        className: this.getClassName().menu,
        value: date,
        dateFrom: this._getDateFrom(),
        dateTo: this._getDateTo(),
        hidden: !this.isOpen(),
        onChange: this._onCalendarChange,
        colorSchema: this.getColorSchema(),
        showTodayButton: this.props.showTodayButton
      };
    },

    _getDateString(value, format, country) {
      format = format || (this.state ? this.state.format : this.props.format);
      country = country || (this.state ? this.state.country : this.props.country);

      if (typeof value === "string") {
        // Value has to be parsed to date object so that the getDateString function can return it in a correct format as a string
        value = this._parseDate(value);
      }

      return UU5.Common.Tools.getDateString(value, { format, country });
    },

    _parseDate(dateString, format, country) {
      let date = null;

      if (this.props.parseDate && typeof this.props.parseDate === "function") {
        date = this.props.parseDate(dateString);
      } else {
        date = this._parseDateDefault(dateString, format, country);
      }

      return date;
    },

    _parseDateDefault(stringDate, format, country) {
      format = format || (this.state ? this.state.format : this.props.format);
      country = country || (this.state ? this.state.country : this.props.country);
      return UU5.Common.Tools.parseDate(stringDate, { format, country });
    },

    _getMainAttrs() {
      let attrs = this._getInputAttrs();
      attrs.id = this.getId();

      if (this.isOpen()) {
        attrs.className += ' ' + this.getClassName().open;
      }

      if (this._shouldOpenToContent()) {
        attrs.className += ' ' + this.getClassName().screenSizeBehaviour;
      }

      if (!this.isReadOnly() && !this.isComputedDisabled()) {
        let allowOpening = true;
        let handleMobileClick = (e) => {
          if (this.isOpen()) {
            e.target.focus();
            this.close();
          } else {
            document.activeElement.blur();
            e.target.blur();
          }

          UU5.Common.Tools.scrollToTarget(this.getId() + "-input", false, UU5.Environment._fixedOffset + 20);
        };

        let handleClick = (e) => {
          let clickData = this._findTarget(e.nativeEvent);

          if (this._shouldOpenToContent() && clickData.input) {
            handleMobileClick(e);
          }
          let opt = { value: this.state.value, event: e, component: this };
          if (clickData.input) {
            e.preventDefault();
            if (allowOpening && !this.isOpen()) {
              this.open(() => this._onFocus(opt));
            } else if (!this.isOpen()) {
              this._onFocus(opt);
            } else if (this.props.disableBackdrop) {
              this.close();
            }
            allowOpening = true;
          } else if (clickData.label) {
            allowOpening = false;
          }
        };

        attrs.onClick = (e) => {
          handleClick(e);
        };
      }

      return attrs;
    },

    _getPlaceholder() {
      let format = this.state.format || UU5.Environment.dateTimeFormat[this.state.country];
      format && (format = format.replace(/Y+/, "YYYY").replace(/y+/, "yy"));
      let placeholder;
      if (this.props.placeholder && format && !this.props.hideFormatPlaceholder) {
        placeholder = this.props.placeholder + ' - ' + format;
      } else if (format && !this.props.hideFormatPlaceholder) {
        placeholder = format;
      } else {
        placeholder = this.props.placeholder;
      }
      return placeholder;
    },

    _getPopoverProps() {
      let props = {};

      props.ref_ = ref => this._popover = ref;
      props.forceRender = true;
      props.disableBackdrop = true;
      props.shown = this.isOpen();

      return props;
    },
    //@@viewOff:componentSpecificHelpers

    //@@viewOn:render
    render() {
      let inputId = this.getId() + '-input';

      let inputAttrs = this.props.inputAttrs;
      inputAttrs = UU5.Common.Tools.merge({ autoComplete: "off" }, inputAttrs);

      inputAttrs.className === "" ? delete inputAttrs.className : null;
      return (
        <div {...this._getMainAttrs()} ref={(comp) => this._root = comp}>
          {this.getLabel(inputId)}
          {this.getInputWrapper([
            <TextInput
              id={inputId}
              name={this.props.name || inputId}
              value={this.state.value}
              placeholder={this._getPlaceholder()}
              type='text'
              onChange={this._onChange}
              onKeyDown={this.onKeyDown}
              mainAttrs={inputAttrs}
              disabled={this.isComputedDisabled()}
              readonly={this.isReadOnly()}
              icon={this._getFeedbackIcon()}
              iconClickable={false}
              loading={this.isLoading()}
              ref_={(item) => this._textInput = item}
              feedback={this.getFeedback()}
              borderRadius={this.props.borderRadius}
              elevation={this.props.elevation}
              bgStyle={this.props.bgStyle}
              inputWidth={this._getInputWidth()}
              colorSchema={this.props.colorSchema}
            />,
            <UU5.Bricks.Popover {...this._getPopoverProps()}>
              {
                this.isOpen() ? (
                    <UU5.Bricks.Calendar {...this._getCalendarProps()} />
                ) : null
              }
            </UU5.Bricks.Popover>
          ])}
        </div>
      );
    }
    //@@viewOn:render
  })
);

export const Datepicker = DatePicker;

export default DatePicker;
