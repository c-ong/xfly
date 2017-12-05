$Page.define('welcome', {

    title: 'Welcome!',

    html: '<div class="page-ui">' +
            '<h1>Hello</h1>' +
            '<p>If you are using Server side render(PHP with Nginx、Apache...), here is no need the index.html file.</p>' +
            '<a class="xfly-page__nav" href="see/you/again">Go to the Next page</a>' +
            '<a class="xfly-page__nav" href="page/with/args?key=Xfly">Go to the Next page with Args</a>' +
            '<a class="xfly-page__nav" href="multi/instance?key=primary">Go to the Next page with Multi-instance</a>' +
            '<a class="xfly-page__nav" href="multi/instance?key=second">Go to the Next page with Multi-instance 2</a>' +
            '<br/>' +
            '<br/>' +
            '<br/>' +
            '<b>MORE EXAMPLES BE COMING SOON...</b>' +
          '</div>',

    onCreateView: function() {

    },

    onRendering: function() {

    },

    onRendered:function(){

    }
});