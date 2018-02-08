# Xfly
A SPA framework for the Mobile Web.

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
* Reduce costs(eg. CDN、Bandwidth...)
* Focus your things, no matter that routing、flow and MORE...
* Lightweight(15KB compressed, gzip enabled be better)

# Getting started
**1: Prepare for your playground**

* Server:
```smartyconfig
Ngingx OR Apache
```
* Zepto lib are required

**2: Define the page model**

**IMPORTANT**: 
* every DOMs of page, there are need to add the "page-ui" class at root element.
* If you do not explicitly call **render** method or configure the **html** property, And the Xfly will sends an XHR request based on the current **path** to get the view.
```js
$Page.define('you.path.name', {

    title: 'You first page',

    html: '<div class="page-ui">' +
            '<h1>Hello</h1>' +
            '<a class="xfly-page__nav" data-if="hasMember" href="you/primary/page" data-else-href="you/second/page">Go to the Next page</a>' +
          '</div>',

    onCreateView: function() {
        // Or here call render method to organization you DOM
        // this.render( { url / html: '' } ); 
    },

    onRendering: function() {

    },

    onRendered: function() {
        // Tip: Easy way to get the queries string
        var args = this.getArgs();
        
        console.log( 'The key value is ' + args[ 'key' ] );
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

**Forward(with Logic Expression):**
```html
<a class="xfly-page__nav" data-if="hasMember" href="you/primary/page" data-else-href="you/second/page">Go to the Next page</a>
```
OR
```js
go( 'you.primary.page' );
```
**Backward:**
```html
<a class="xfly-page__back" href="">Get back</a>
```
OR
```js
back();
```
**3: Almost done**

Be careful the Browser Cache, good luck for YOUR.


# Examples
See the [https://c-ong.github.io](https://c-ong.github.io) OR the [examples code](https://github.com/c-ong/c-ong.github.io/tree/master/js/app) dir.

![Xfly](https://github.com/c-ong/xfly/blob/master/screenshots/xfly.png?raw=true)


# Documents

## Page model props

* `title` `String` Title of the page
* `html` `String` Used as view of the page
* `trigger` `Object` Define a trigger 
```javascript
 trigger: { 
     on:    'home', 
     state: 'show', 
     do:    function() {} 
}
 ```
...


## Page instance methods

In composing...

## Global configs

In composing...

## Global methods

In composing...

# Tips
* If your are running without server-side render, you can provide a custom 404 page for general solution, just like this [404.html](https://github.com/c-ong/c-ong.github.io/blob/master/404.html).

# Road map

## In-progress

* [x] Scroll restoration supported
* [x] Simple logic express support for nav forward link

## Planned

* [ ] Failure handle while fetch the view
* [ ] Desktop browser supported(like IE)
* [ ] State-full triggers supported
* [ ] Specific page extension name supported(eg. article.html、detail.php...)
* [ ] document.baseURI support(for Sub path)

## More

* For more features, you wishing, leave you idea


# Legacy version is here(Hash based)
Click to get the [base.fly](https://github.com/c-ong/starter/tree/dev/app/scripts).




# License
Licensed under the MIT license.