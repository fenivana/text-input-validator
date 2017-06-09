export default class {
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
  constructor({ input = null, blur = null, onValidityChange }) {
    this.input = input
    this.blur = blur
    this.onValidityChange = onValidityChange

    // the default validity state is null
    // so when oninput() or onblur() get called first time
    // onValidityChange() will always be called
    this._valid = null

    this._promise = null
    this._lastValue = null
    this._lastEvent = null

    this.oninput = value => {
      if (!this.input) return

      // return cached result
      if (this._lastValue === value) return this._promise

      this._lastEvent = 'input'
      this._lastValue = value

      const promise = this._promise = Promise.resolve(
        this.input.constructor === Function ? this.input(value) : this.input.test(value)
      ).then(valid => {
        // deal with async racing problem
        if (promise !== this._promise) return this._promise

        if (valid !== this._valid) {
          this._valid = valid
          this.onValidityChange(valid)
        }

        return valid
      })

      return promise
    }

    this.check = value => {
      // if blur is not set, and input is set, use oninput() to check validity
      if (!this.blur && this.input) return this.oninput(value)

      // return cached result
      if (this._lastEvent === 'blur' && this._lastValue === value) return this._promise

      this._lastEvent = 'blur'
      this._lastValue = value

      const promise = this._promise = Promise.resolve(
        // always resolve true if blur is not set
        !this.blur || this.blur.constructor === Function ? this.blur(value) : this.blur.test(value)
      ).then(valid => {
        // deal with async racing problem
        if (promise !== this._promise) {
          return this._lastEvent === 'blur' ? this._promise : this.check(this._lastValue)
        }

        if (valid !== this._valid) {
          this._valid = valid
          this.onValidityChange(valid)
        }

        return valid
      })

      return promise
    }
  }

  /*
    Set new rules for input and blur events
  */
  setRules({ input, blur }) {
    if (input !== undefined) {
      this.input = input
      if (this._lastEvent === 'input') this._lastValue = null
    }

    if (blur !== undefined) {
      this.blur = blur
      if (this._lastEvent === 'blur') this._lastValue = null
    }
  }

  /*
    Set validity of the input control.

    Arguments:
      valid: same as input and blur option of constructor

    If valid is not equal to current state, onValidityChange callback will be called.
  */
  setValidity(valid) {
    if (this._valid === valid) return

    this._lastEvent = 'blur'
    this._valid = valid
    this._promise = Promise.resolve(valid)
    this.onValidityChange(valid)
  }
}
