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


# Getting started
**1: Prepare for your playground**

* Server:
```smartyconfig
Ngingx OR Apache
```
* Zepto or jQuery lib are required

**2: Define the page model**

**IMPORTANT**: every DOMs of page, there are need add to the "page-ui" class at root element
```javascript
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

Forward:
```html
<a class="xfly-page__nav" href="you/other/page">Go to the Next page</a>'
```
OR
```javascript
go( 'you.other.page' );
```
Backward:
```html
<a class="xfly-page__back" href="">Get back</a>'
```
OR
```javascript
back();
```
**3: Almost done**

Be careful the Browser Cache, good luck for YOUR.


# Examples
See the examples dir.


# Legacy version is here(Hash based)
Click to get the [base.fly](https://github.com/c-ong/starter/tree/dev/app/scripts).




# License
Licensed under the MIT license.