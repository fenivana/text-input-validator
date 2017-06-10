import Core from './Core'

export default class extends Core {
  constructor({ input, blur, onValidityChange, element }) {
    super({ input, blur, onValidityChange })

    this.element = element

    let composing
    this._compositionstart = () => composing = true
    this._compositionend = () => composing = false

    this._oninput = () => {
      if (!composing) super.checkOnInput(this.element.value)
    }

    this._onblur = () => this.check()

    this.on()
  }

  check() {
    if (this.element.checkValidity()) return super.check(this.element.value)
    else return this.setValidity(false)
  }

  // Turn on validator
  on() {
    this.element.addEventListener('input', this._oninput)
    this.element.addEventListener('blur', this._onblur)
    this.element.addEventListener('compositionstart', this._compositionstart)
    this.element.addEventListener('compositionend', this._compositionend)
  }

  // Turn off validator
  off() {
    this.element.removeEventListener('input', this._oninput)
    this.element.removeEventListener('change', this._onblur)
    this.element.removeEventListener('compositionstart', this._compositionstart)
    this.element.removeEventListener('compositionend', this._compositionend)
  }
}
