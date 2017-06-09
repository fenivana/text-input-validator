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
      if (!_this.input) return;

      // return cached result
      if (_this._lastValue === value) return _this._promise;

      _this._lastEvent = 'input';
      _this._lastValue = value;

      var promise = _this._promise = Promise.resolve(_this.input.constructor === Function ? _this.input(value) : _this.input.test(value)).then(function (valid) {
        // deal with async racing problem
        if (promise !== _this._promise) return _this._promise;

        if (valid !== _this._valid) {
          _this._valid = valid;
          _this.onValidityChange(valid);
        }

        return valid;
      });

      return promise;
    };

    this.check = function (value) {
      // if blur is not set, and input is set, use oninput() to check validity
      if (!_this.blur && _this.input) return _this.oninput(value

      // return cached result
      );if (_this._lastEvent === 'blur' && _this._lastValue === value) return _this._promise;

      _this._lastEvent = 'blur';
      _this._lastValue = value;

      var promise = _this._promise = Promise.resolve(
      // always resolve true if blur is not set
      !_this.blur || _this.blur.constructor === Function ? _this.blur(value) : _this.blur.test(value)).then(function (valid) {
        // deal with async racing problem
        if (promise !== _this._promise) {
          return _this._lastEvent === 'blur' ? _this._promise : _this.check(_this._lastValue);
        }

        if (valid !== _this._valid) {
          _this._valid = valid;
          _this.onValidityChange(valid);
        }

        return valid;
      });

      return promise;
    };
  }

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
    if (this._valid === valid) return;

    this._lastEvent = 'blur';
    this._valid = valid;
    this._promise = Promise.resolve(valid);
    this.onValidityChange(valid);
  };

  return _class;
}();

return _class;

})));
