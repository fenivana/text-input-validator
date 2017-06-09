import Core from './Core'

export default class extends Core {
  constructor({ input, blur, onValidityChange, element }) {
    super({ input, blur, onValidityChange })

    this.element = element

    let composing
    this._compositionstart = () => composing = true
    this._compositionend = () => composing = false

    this.oninput = () => {
      if (!composing) super.oninput(this.element.value)
    }

    this.check = () => {
      if (!this.element.checkValidity()) {
        this.setValidity(false)
        return Promise.resolve(false)
      } else {
        return super.check(this.element.value)
      }
    }

    this.on()
  }

  // Turn on validator
  on() {
    this.element.addEventListener('input', this.oninput)
    this.element.addEventListener('blur', this.onblur)
    this.element.addEventListener('compositionstart', this._compositionstart)
    this.element.addEventListener('compositionend', this._compositionend)
  }

  // Turn off validator
  off() {
    this.element.removeEventListener('input', this.oninput)
    this.element.removeEventListener('change', this.onblur)
    this.element.removeEventListener('compositionstart', this._compositionstart)
    this.element.removeEventListener('compositionend', this._compositionend)
  }
}
