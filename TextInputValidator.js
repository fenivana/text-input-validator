(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.TextInputValidator = factory());
}(this, (function () { 'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};











var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var _class$2 = function () {
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

var _class = function (_Core) {
  inherits(_class, _Core);

  function _class(_ref) {
    var input = _ref.input,
        blur = _ref.blur,
        onValidityChange = _ref.onValidityChange,
        element = _ref.element;
    classCallCheck(this, _class);

    var _this = possibleConstructorReturn(this, _Core.call(this, { input: input, blur: blur, onValidityChange: onValidityChange }));

    _this.element = element;

    var composing = void 0;
    _this._compositionstart = function () {
      return composing = true;
    };
    _this._compositionend = function () {
      return composing = false;
    };

    _this.oninput = function () {
      if (!composing) _Core.prototype.oninput.call(_this, _this.element.value);
    };

    _this.check = function () {
      if (!_this.element.checkValidity()) {
        _this.setValidity(false);
        return Promise.resolve(false);
      } else {
        return _Core.prototype.check.call(_this, _this.element.value);
      }
    };

    _this.on();
    return _this;
  }

  // Turn on validator


  _class.prototype.on = function on() {
    this.element.addEventListener('input', this.oninput);
    this.element.addEventListener('blur', this.onblur);
    this.element.addEventListener('compositionstart', this._compositionstart);
    this.element.addEventListener('compositionend', this._compositionend);
  };

  // Turn off validator


  _class.prototype.off = function off() {
    this.element.removeEventListener('input', this.oninput);
    this.element.removeEventListener('change', this.onblur);
    this.element.removeEventListener('compositionstart', this._compositionstart);
    this.element.removeEventListener('compositionend', this._compositionend);
  };

  return _class;
}(_class$2);

return _class;

})));
