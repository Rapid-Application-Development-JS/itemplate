# itemplate
Library for converting your templates into incremental-dom rendering functions.

This library makes it easy and comfortable to use [Incremental-DOM](https://github.com/google/incremental-dom) library.
It's converting ordinary 'underscore-type' templates into  Incremental-DOM templates.

[Example](http://rapid-application-development-js.github.io/itemplate/)

First step in order to use `itemplate` is creating your 'underscore-type' template, for example:

```html
<ul class='underscore-template'>
<% for(var i=0; i<100;length; i++) {%>
   <li><%= i %></li>
<% } %>
</ul>

```

and then compile it:

```javascript
    var render = itemplate.compile(document.getElementById('underscore-template').innerHTML, IncrementalDOM);
```

This steps will convert your template into Incremental-DOM template like this :

```javascript
elementOpen('ul');
for(var i=0; i<100; i++) {
    elementOpen('li');
        text(i);
      elementClose('li');
}
elementClose('ul');
```

The last step is rerendering your page with new data using `IncrementalDOM.patch` function

```javascript
    patch(document.querySelector('#container'), render, templateData);
```