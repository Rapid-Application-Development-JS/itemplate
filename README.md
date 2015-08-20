# itemplate
Library for converting your templates into incremental-dom rendering functions.
## Demo
[test](http://rapid-application-development-js.github.io/itemplate/)

This library makes it easy and comfortable to use [Incremental-DOM](https://github.com/google/incremental-dom) library that optimizes work with DOM. It's converting ordinary 'underscore-type' templates into  Incremental-DOM templates.

In order to use `itemplate` you should compile your 'underscore-type' template:

```javascript
    var render = itemplate.compile(document.getElementById('underscore-template').innerHTML, IncrementalDOM);
```

The last step is rerendering your page with new data using `IncrementalDOM.patch` function

```javascript
    patch(document.querySelector('#container'), render, templateData);
```