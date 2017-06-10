(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Core = factory());
}(this, (function () { 'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var _class = function () {
  /*
    Arguments:
      input: RegExp or function. Rule for checking on input. If ignored, call oninput() will do nothing.
        It can return immediately or return a promise that resolves with value:
          true: valid
          false: invalid
          null | undefined: initial state
          other types: your custom state, e.g. invalid message, password strength, etc.
       blur: Rule for checking on blur. Similar to input. If ignored, it will be set to the value of input option.
        If both input and blur haven't been set, the validity will always be true.
         can't use change event because the validity will wrong if
          1. typing a value that can pass the input checking rule but can't pass the change checking rule
          2. blur. the validity state will be invalid
          3. focus again, input any letter and delete, the validity state becomes valid
          4. blur. the change event won't fire because the value hasn't been changed, but the validity state is wrong.
       onValidityChange(valid): callback function.
        arguments:
          valid: the result given by input and blur
  */
  function _class(_ref) {
    var _this = this;

    var _ref$input = _ref.input,
        input = _ref$input === undefined ? null : _ref$input,
        _ref$blur = _ref.blur,
        blur = _ref$blur === undefined ? null : _ref$blur,
        onValidityChange = _ref.onValidityChange;
    classCallCheck(this, _class);

    this.input = input;
    this.blur = blur;
    this.onValidityChange = onValidityChange;

    // the default validity state is null
    // so when oninput() or onblur() get called first time
    // onValidityChange() will always be called
    this._valid = null;

    this._promise = null;
    this._lastValue = null;
    this._lastEvent = null;

    this.oninput = function (value) {
      _this.checkOnInput(value);
    };

    this.onblur = function (value) {
      _this.check(value);
    };
  }

  _class.prototype.checkOnInput = function checkOnInput(value) {
    var _this2 = this;

    if (!this.input) return;

    // return cached result
    if (this._lastValue === value) return this._promise;

    this._lastEvent = 'input';
    this._lastValue = value;

    var promise = this._promise = Promise.resolve(this.input.constructor === Function ? this.input(value) : this.input.test(value)).then(function (valid) {
      // deal with async racing problem
      if (promise !== _this2._promise) return _this2._promise;

      if (valid !== _this2._valid) {
        _this2._valid = valid;
        _this2.onValidityChange(valid);
      }

      return valid;
    });

    return promise;
  };

  _class.prototype.check = function check(value) {
    var _this3 = this;

    // if blur is not set, and input is set, use oninput() to check validity
    if (!this.blur && this.input) return this.oninput(value

    // return cached result
    );if (this._lastEvent === 'blur' && this._lastValue === value) return this._promise;

    this._lastEvent = 'blur';
    this._lastValue = value;

    var promise = this._promise = Promise.resolve(
    // always resolve true if blur is not set
    !this.blur || this.blur.constructor === Function ? this.blur(value) : this.blur.test(value)).then(function (valid) {
      // deal with async racing problem
      if (promise !== _this3._promise) {
        return _this3._lastEvent === 'blur' ? _this3._promise : _this3.check(_this3._lastValue);
      }

      if (valid !== _this3._valid) {
        _this3._valid = valid;
        _this3.onValidityChange(valid);
      }

      return valid;
    });

    return promise;
  };

  /*
    Set new rules for input and blur events
  */


  _class.prototype.setRules = function setRules(_ref2) {
    var input = _ref2.input,
        blur = _ref2.blur;

    if (input !== undefined) {
      this.input = input;
      if (this._lastEvent === 'input') this._lastValue = null;
    }

    if (blur !== undefined) {
      this.blur = blur;
      if (this._lastEvent === 'blur') this._lastValue = null;
    }
  };

  /*
    Set validity of the input control.
     Arguments:
      valid: same as input and blur option of constructor
     If valid is not equal to current state, onValidityChange callback will be called.
  */


  _class.prototype.setValidity = function setValidity(valid) {
    if (this._valid === valid) return this._promise;

    this._lastEvent = 'blur';
    this._valid = valid;
    this._promise = Promise.resolve(valid);
    this.onValidityChange(valid);
    return this._promise;
  };

  return _class;
}();

return _class;

})));
