# Xfly
This is SPA framework for the lite Web App with Morden browser.

# Features
* Page life-cycle supported(refer Android、iOS);
* SEO friendly(Server side render needed);
* Pre-load;
* Lazy load;
* Multi-instance;
* Simple trigger are supported;
* LRU Histories maintain strategy;
* Single page reload(On demand);
* Easy way for Query string accessing;

# Why Xfly?
* Enhancement that responsiveness for fast
* State-driven programing(similar Native App)
* Make your DOMs be Pretty and Clean
* Reduce the resources request
* Focus your things, no matter that routing、flow and MORE...

# Getting started
**1: Prepare for your playground**

* Server:
```smartyconfig
Ngingx OR Apache
```
* Zepto or jQuery lib are required

**2: Define the page model**

**IMPORTANT**: every DOMs of page, there are need to add the "page-ui" class at root element
```js
$Page.define('you.path.name', {

    title: 'You first page',

    html: '<div class="page-ui">' +
            '<h1>Hello</h1>' +
            '<a class="xfly-page__nav" href="you/other/page">Go to the Next page</a>' +
          '</div>',

    onCreateView: function() {
        // Or here call render method to organization you DOM
        // this.render( { url / html: '' } ); 
    },

    onRendering: function() {

    },

    onRendered: function() {

    },
    
    onResume: function () {
        console.log( this.id + ' be resumed.' );
    },

    onPause: function () {
        console.log( this.id + ' be paused.' );
    }
});
```

**2: Navigation behavior**

**Forward:**
```html
<a class="xfly-page__nav" href="you/other/page">Go to the Next page</a>'
```
OR
```js
go( 'you.other.page' );
```
**Backward:**
```html
<a class="xfly-page__back" href="">Get back</a>'
```
OR
```js
back();
```
**3: Almost done**

Be careful the Browser Cache, good luck for YOUR.


# Examples
See the [examples](https://github.com/c-ong/xfly/tree/master/examples) dir.


# Legacy version is here(Hash based)
Click to get the [base.fly](https://github.com/c-ong/starter/tree/dev/app/scripts).




# License
Licensed under the MIT license.