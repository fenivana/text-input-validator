# text-input-validator
Text input validator

## Usage
See file `examples/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<script src="../dist/TextInputValidator.js"></script>
</head>

<body>
<p>Email: <input type="text" id="foo"> <span id="error-foo"></span></p>
<p><button onclick="forceSetError()">force set error</button></p>

<script>
function isRegistered(email) {
  // emulate a remote API call
  return new Promise(resolve => {
    setTimeout(() => {
      const registeredEmail = [
        'foo@example.com',
        'bar@example.com'
      ]

      resolve(registeredEmail.includes(email))
    }, 300)
  })
}

const validator = new TextInputValidator({
  element: document.getElementById('foo'),

  input: /(?!.*[-_.+@]{2,})(?!^[-_.+@])^[-_.+a-z0-9]+(@([-.a-z0-9]+)?)?$/i,

  blur: function(email) {
    return /(?!.*[-_.+@]{2,})(?!^[-_.+@])^[-_.+a-z0-9]+@[-.a-z0-9]+\.[a-z]+$/i.test(email) && isRegistered(email).then(reged => !reged || 'this email has been taken')
  },

  onValidityChange(e) {
    document.getElementById('error-foo').textContent = e ? e.message || 'invalid' : ''
  }
})

function forceSetError() {
  validator.setValidity('force error')
}
</script>
</body>
</html>

</script>
</body>
</html>
```

## APIs

### new TextInputValidate({ element, input, blur, onValidityChange })

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


### textInputValidate.check(force = true)

Validate manually.

Arguments:
  force: force call onValidityChange callback.

Returns promise. Resolve to null for valid or Error object for invalid.


### textInputValidate.setRules({ input, blur })

Set new rules for input and blur


### textInputValidate.setValidity(validity)

Set validity of the input control.

Arguments:
  validity:
    true: valid
    false: invalid
    String: invalid, and set error.message

If validity is not equal to current state(validation state not same, or error message not same), onValidityChange callback will be called.


### textInputValidate.on()

Turn on validator


### textInputValidate.off()

Turn off validator


## Build

```
npm run build
```


## License
MIT
