# idom-template

> Now you can speed up and optimize your application, which once used standard templates by incremental DOM. You may read more about it [here](https://medium.com/google-developers/introducing-incremental-dom-e98f79ce2c5f).

Library for converting your HTML or templates ([ejs](http://www.embeddedjs.com/)/[underscore templates](http://underscorejs.org/#template) or like) into [incremental-DOM by Google](http://google.github.io/incremental-dom/) rendering functions.

*You can use this library with any framework with you want.*

###Example
The simplest example of use looks like this, **html**:

```html
<div id="container"></div>
<script type="x-template" id="underscore-template">
    <div> <%- data.listTitle %></div>
    <ul>
        <%  var showFootnote = false;
            data.listItems.forEach(function(listItem, i) {
        %>
        <li class="row <%=(i % 2 == 1 ? ' even' : '')%>">
            <%- listItem.name %>
            <% if (listItem.hasOlympicGold){
            showFootnote = true; %>
            <em>*</em>
            <% } %>
        </li>
        <%  }); %>
    </ul>

    <% if (showFootnote){ %>
    <p style="font-size: 12px ;">
        <em>* Olympic gold medalist</em>
    </p>
    <% } %>
</script>
```
**javascript**:

```javascript
var templateData = {
    listTitle: "Olympic Volleyball Players",
    listItems: [
        {
            name: "Misty May-Treanor",
            hasOlympicGold: true
        },
        {
            name: "Kerri Walsh Jennings",
            hasOlympicGold: true
        },
        {
            name: "Jennifer Kessy",
            hasOlympicGold: false
        },
        {
            name: "April Ross",
            hasOlympicGold: false
        }
    ]
};

var templateStr = document.getElementById('underscore-template').innerHTML;
var renderFn = itemplate.compile(templateStr, IncrementalDOM);

IncrementalDOM.patch(document.querySelector('#container'), renderFn, templateData);
```

In this case your template will be compiled by **idom-template** into the following JS function:
 
```javascript
function (data) {
    var o = lib.elementOpen, c = lib.elementClose, t = lib.text, v = lib.elementVoid;
    o('div');
    t(data.listTitle);
    c('div');
    o('ul');
    var showFootnote = false;
    data.listItems.forEach(function (listItem, i) {
        o('li', null, null, 'class', 'row ' + (i % 2 == 1 ? ' even' : ''));
        t(listItem.name);
        if (listItem.hasOlympicGold) {
            showFootnote = true;
            o('em');
            t('*');
            c('em');
        }
        c('li');
    });
    c('ul');
    if (showFootnote) {
        o('p', null, null, 'style', 'font-size: 12px ;');
        o('em');
        t('* Olympic gold medalist');
        c('em');
        c('p');
    }
}
```
> Take note that the dependencies: *[lib](http://google.github.io/incremental-dom/)*(incremental-dom library) и *[helpers](#helpers)* are ejected with closure. The same closure contains the creation of  *[static arrays](#static)*, when you use them for the array of static attributes.
> 
> As opposed to underscore.js, **compilation of comments does not take place**!

This one and more complicated examples can be viewed in the directory **[examples](https://github.com/Rapid-Application-Development-JS/itemplate/tree/master/examples)**.

You may also compare the performance of BackboneJS, BackboneJS + incremental-dom, ReactJS 0.13.3: **[DEMO](http://rapid-application-development-js.github.io/itemplate/)**

## npm
More over then include library directly, You also can use `npm` for installation:

```bash
npm install idom-template --save
```

## Include
```html
    <script src="../lib/incremental-dom.js"></script>
    <script src="../lib/itemplate.js"></script>
```

## Use

```javascript
var templateStr = document.getElementById('underscore-template').innerHTML;
var renderFn = itemplate.compile(templateStr, IncrementalDOM);

patch(containerElement, renderFn, templateData);
```
> You should consider the following issues:
>
* You should be careful with the `'` symbol in templates; if it's mentioned in the text, it should be screened as `\'`. This will be fixed in further versions.
* The data is transferred to the template as one object; so if you don't want to transfer data via closure in templates, you should work with one object that will be transferred as a [**parameter**](#parameterName) to `path`.

####unwrap
Be careful, if the second parameter is absent during the compilation of the template, which means you won't transmit the link to the library:

```javascript
var renderFn = itemplate.compile(templateStr[, IncrementalDOM]);
```

In this case it's not a rendering function that will be compiled, it will be just a function without closure and wrapping:

```javascript
function (data, lib, helpers){
        // throw error or something if not lib and helpers
        var o=lib.elementOpen,c=lib.elementClose,t=lib.text,v=lib.elementVoid;
        o('div', null, null, 'class', 'box');
            t( data.content );
        c('div');
        helpers['my-console']({data:7+8});
}
```

In this case you should call it and transmit compilation parameters as follows:

```javascript
patch(document.getElementById('container'), function () {
    template(data, IncrementalDOM, customHelpers);
});
```
It allows to work with templates with more flexibility; for example, call several templates in one rendering function, or introduce additional logic, such as filtration etc.

###Options
You may set compiling option as object to the library:

```javascript
itemplate.options({
	//...
});
```
Where:

* **parameterName**<a name="parameterName"></a> - name of the data object, which is transferred to the render function.
* **template** (*interpolate*, *escape*, *evaluate*) - regular expression of your templates; you may change them, so that the compiler will process your template syntax. 
> Take note that compilation is carried out in the following order: *interpolate*, *escape*, *evaluate*. In further versions we plan to provide an opportunity of changing the sequence of template processing.

* **escape**, **MAP** - regular expression and MAP for processing the *escape* template in the following way:
* 
```javascript
function escapeHTML(s) {
    return s.replace(options.escape, function (c){
        return options.MAP[c];
    });
}
```
* **accessory** (*open*, *close*) - service lines for processing *interpolate*, *escape* templates; it's better not to modify them.
* <a name="static_attr"></a>**staticKey** - attribute name for static attributes array generation in current tag. See [static attributes](#static). 


By default the options have the following values:

```javascript
 {
    BREAK_LINE: /(\r\n|\n|\r)\s{0,}/gm,
    // prepare options
    template: {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    },
    order: ['interpolate', 'escape', 'evaluate'],
    evaluate: {
        name: 'script',
        open: '<script>',
        close: '</script>'
    },
    accessory: {
        open: '{%',
        close: '%}'
    },
    // build options
    emptyString: true,
    staticKey: 'key',
    staticArray: 'static-array',
    nonStaticAttributes: ['id', 'name'],
    parameterName: 'data',
    parentParameterName: 'parent',
    renderContentFnName: 'content',
    // tags parse rules
    textSaveTags: ['pre', 'code'],
    voidRequireTags: ['input', 'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'keygen', 'link', 'meta',
        'param', 'source', 'track', 'wbr'],
    debug: false
}
```
You may modify any option.

###<a name="static"></a>Static attributes
Arrays of static attributes are used to [save memory](http://google.github.io/incremental-dom/#rendering-dom/statics-array).

For generation of a static array, you should select the `static-key` attribute from element attriibutes and add it to the template tag.

The value of this attribute will become the name of the static array:

* in case the value is not specified, the array will be generated, and its name will be a unique generated line.
* in case different tags contain the same name of the static array, the same array will be used for all of these elements. This generated array will be based on **all** static attributes of the **last** tag with this key in the template.
* the name of the attribute can be changed in [options](#static_attr).

**Example**

If you compile the function of the following template:

```ejs
    <div class="box" key="box_class" data-key="my-custom-key"
         style="top: <%= data.top %>px; left: <%= data.left %>px; background: rgb(0,0,<%= data.color %>);">
        <%= data.content %>
    </div>
```
You will get the result:

```javascript
(function (lib, helpers) {
    var box_class = ['class', 'box', 'data-key', 'my-custom-key'];
    return function (data) {
        var o = lib.elementOpen, c = lib.elementClose, t = lib.text, v = lib.elementVoid;
        o('div', 'ZYjoAthjdzUz', box_class, 'style', 'top: ' + data.top + 'px; left: ' + data.left + 'px; background: rgb(0,0,' + data.color + ');');
        t(data.content);
        c('div');
    }
})(IncrementalDOM, {
    // ... helpers object
});
```
It's important to understand that arrays of static attributes are unqiue for every **template**. If you use the same key name in different templates, there will be different arrays with different values.
 
> Take note that:
> 
* if you use an array of static attributes, a **[key](http://google.github.io/incremental-dom/#api/elementOpen)** for this element will be generated automatically.
* an array of static attributes is generated automatically from all element attributes, in which dynamic data from JS is not used. That's why if there is an identical array name, all elements with the same name of the array of static attributes will have the same number of attributes with the same value. That is: with the identical array of static attributes in different elements, you will not be able to add one more static attribute to any specific element. We are planning to correct this as soon as possible.

###<a name="helpers"></a>Helpers
There is an option of injecting JS functions as a part of the compiled template.

For that purpose we use **self-closing** tag (with `/`). All attributes of this tag will be moved to the JS function as a data object with keys, which are attributes of the tag.

That is, upon registering the following helper:

```javascript
itemplate.registerHelper('my-console', function (attrs) {
    console.log(attrs);
});
```
...where the first parameter is the helper name, and the second one is the JS function.

In this case, in order to call the helper it will suffice to indicate the tag is your template:

```ejs
<!-- ... -->
<my-console id="console_1" data="<%=7+8%>"/>
<!-- ... -->
```
Every time the template is rendered, the registered function will be executed in the place where the given tag is inserted. This is what will be in the console:

```javascript 
{id: 'console_1', data: 15}
```
This option can be used in the following ways:

**Insertion of templates:**

You may register any rendering function of incremental DOM as a helper. In this case external templates will be inserted into the rendering function.

For example, having registered the following template as a helper:

```javascript
 var footnoteRenderFn = itemplate.compile(footnoteTemplate, IncrementalDOM);
 itemplate.registerHelper('my-footnote', footnoteRenderFn);
```

You will be able to simply insert it in another template in the following way `.ejs`:

```ejs
<my-footnote listItems="<%=data.listItems%>"/>
```

**Auxiliary logic of templates:**

It's similarly possible to describe **synchronous** auxiliary logic using helpers.

```javascript
var itemRenderFn = itemplate.compile(itemTemplate, IncrementalDOM);
itemplate.registerHelper('my-list', function (attrs) {
    elementOpen('ul');
    _.each(attrs.listItems, function (listItem, i) {
        // render single list item
        itemRenderFn({
            i: i,
            name: listItem.name,
            hasOlympicGold: listItem.hasOlympicGold
        });
    });
    elementClose('ul');
});
```
The following line in your template will be responsible for full rendering of the `.ejs` list:

```ejs
<my-list listItems="<%=data.listItems%>"/>
```
Examples of use of helpers can be viewed in the directory **[examples](https://github.com/Rapid-Application-Development-JS/itemplate/tree/master/examples)**

> Please consider:
> 
* data in `helpers` can be transmitted only via tag attributes. For example, the internal template will have access only to the data received via attributes.
* `helpers` are not `web-components`, so they work only if you have registered *helper* beforehand, and then compiled the template that uses it. 