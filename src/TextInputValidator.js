export default class {
  /*
    Arguments:
      opts = {
        element: DOM Element,
        input: RegExp | function(value),
        blur: RegExp | function(value),
        onValidityChange(valid)
      }

      element: the input element

      input: RegExp or function. Optional. Rule for checking on input.
        It can return immediately or return a promise that resolves with value:
          true: valid
          false: invalid
          null | undefined: initial state
          other types: your custom state, e.g. invalid message, password strength, etc.

      blur: Rule for checking on blur. Optional. Similar to input. Will also check the standard HTML5 validating attributes (such as "required" and "pattern") via HTMLInputElement.checkValidity()

      onValidityChange(valid): callback function.
        arguments:
          valid: the result given by input and blur
  */
  constructor(opts) {
    Object.assign(this, opts)
    this.valid = null
    this._promise = null
    this._oldValue = null

    let composing

    this._oninput = () => {
      if (!this.input || composing || this.element.value === this._oldValue) return

      this._oldValue = null

      Promise.resolve(
        this.input.constructor === Function ? this.input(this.element.value) : this.input.test(this.element.value)
      ).then((valid = null) => {
        if (this.valid !== valid) {
          this.valid = valid
          this.onValidityChange(valid)
        }

        return valid
      })
    }

    this._onblur = () => {
      this.check(false)
    }

    this._compositionstart = () => composing = true
    this._compositionend = () => composing = false

    this.on()
  }

  /*
    Validate manually.

    Arguments:
      force: force to call onValidityChange callback.

    Returns promise.
  */
  check(force = true) {
    if (this.element.value === this._oldValue) {
      if (force) this.onValidityChange(this.valid)
      return this._promise
    }

    this._oldValue = this.element.value
    this._promise = Promise.resolve(
      this.element.checkValidity() &&
      (!this.blur || (this.blur.constructor === Function ? this.blur(this.element.value) : this.blur.test(this.element.value)))
    ).then((valid = null) => {
      if (force || this.valid !== valid) {
        this.valid = valid
        this.onValidityChange(valid)
      }

      return valid
    })
    return this._promise
  }

  /*
    Set new rules for input and blur
    arguments:
      rules = {
        input,
        blur
      }
  */
  setRules(rules) {
    Object.assign(this, rules)
    if (rules.blur && this._oldValue !== null && document.activeElement !== this.element) {
      this._oldValue = null
      this._onblur()
    } else if (rules.input && document.activeElement === this.element) {
      this._oninput()
    }
  }

  /*
    Set validity of the input control.

    Arguments:
      valid: same as input and blur option of constructor

    If valid is not equal to current state, onValidityChange callback will be called.
  */
  setValidity(valid = null) {
    if (this.valid !== valid) {
      this.valid = valid
      this._promise = Promise.resolve(valid)
      this.onValidityChange(valid)
    }
  }

  /*
    Turn on validator
  */
  on() {
    this.element.addEventListener('input', this._oninput)
    this.element.addEventListener('blur', this._onblur)
    this.element.addEventListener('compositionstart', this._compositionstart)
    this.element.addEventListener('compositionend', this._compositionend)
  }

  /*
    Turn off validator
  */
  off() {
    this.element.removeEventListener('input', this._oninput)
    this.element.removeEventListener('change', this._onblur)
    this.element.removeEventListener('compositionstart', this._compositionstart)
    this.element.removeEventListener('compositionend', this._compositionend)
  }
}
