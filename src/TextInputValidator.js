function error(e) {
  // true: valid, false: invalid
  if (e.constructor === Boolean) return e ? null : new Error()
  // e is error message
  else return new Error(e)
}

function notEqual(e1, e2) {
  return (e1 && e1.message) !== (e2 && e2.message)
}

export default class {
  /*
    Arguments:
      opts = {
        element: DOM Element,
        input: RegExp | function(value),
        blur: RegExp | function(value),
        onValidityChange(error)
      }

      element: the input element

      input: RegExp or function. Optional. Rule for checking on input.
        It can return immediately or return a promise that resolves with value:
          true: valid
          false: invalid
          String: invalid, and set error.message

      blur: Rule for checking on blur. Optional. Similar to input. Will also check the standard HTML5 validating attributes (such as "required" and "pattern") via HTMLInputElement.checkValidity()

      onValidityChange(error): callback function.
        arguments:
          error: null for valid. Error object for invalid
  */
  constructor(opts) {
    Object.assign(this, opts)
    this.error = null
    this._promise = null
    this._oldValue = null

    let composing

    this._oninput = () => {
      if (composing || this.element.value === this._oldValue) return

      this._oldValue = null

      Promise.resolve(!this.input || (this.input.constructor === Function ? this.input(this.element.value) : this.input.test(this.element.value))).then(e => {
        e = error(e)

        if (notEqual(this.error, e)) {
          this.error = e
          this.onValidityChange(e)
        }

        return e
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

    Returns promise. Resolve to null for valid or Error object for invalid.
  */
  check(force = true) {
    if (this.element.value === this._oldValue) {
      if (force) this.onValidityChange(this.error)
      return this._promise
    }

    this._oldValue = this.element.value
    this._promise = Promise.resolve(this.element.checkValidity() && (!this.blur || (this.blur.constructor === Function ? this.blur(this.element.value) : this.blur.test(this.element.value)))).then(e => {
      e = error(e)

      if (force || notEqual(this.error, e)) {
        this.error = e
        this.onValidityChange(e)
      }

      return e
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
      validity:
        true: valid
        false: invalid
        String: invalid, and set error.message

    If validity is not equal to current state(validation state not same, or error message not same), onValidityChange callback will be called.
  */
  setValidity(validity) {
    const e = error(validity)

    if (notEqual(this.error, e)) {
      this.error = e
      this._promise = Promise.resolve(e)
      this.onValidityChange(e)
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
