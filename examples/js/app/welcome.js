$Page.define('welcome', {

    title: 'Welcome!',

    html: '<div class="page-ui">' +
            '<h1>Hello</h1>' +
            '<p>If you are use Server side rendering(PHP with Nginx、Apache...), here no need the index.html file.</p>' +
            '<a class="xfly-page__nav" href="see/you/again">Go to the Next page</a>' +
            '<a class="xfly-page__nav" href="page/with/args?key=Xfly">Go to the Next page with Args</a>' +
            '<br/>' +
            '<br/>' +
            '<br/>' +
            '<b>MORE EXAMPLE BE COMING SOON...</b>' +
          '</div>',

    onCreateView: function() {

    },

    onRendering: function() {

    },

    onRendered:function(){

    }
});