$Page.define('welcome', {

    title: 'Welcome!',

    html: '<div class="page-ui">' +
            '<h1>Hello</h1>' +
            '<p>If you are using Server side render(PHP with Nginx、Apache...), here is no need the index.html file.</p>' +
            '<a class="xfly-page__nav" href="see/you/again">Go to Next page</a>' +
            '<a class="xfly-page__nav" href="page/with/args?key=Xfly">Page take Args</a>' +
            '<a class="xfly-page__nav" href="multi/instance?key=primary">Page with Multi-instance</a>' +
            '<a class="xfly-page__nav" href="multi/instance?key=second">Page with Multi-instance 2</a>' +
            '<a class="xfly-page__nav" href="reload">Next page(Reload)</a>' +
            '<br/>' +
            '<br/>' +
            '<br/>' +
            '<b>MORE EXAMPLES BE COMING SOON...</b>' +
          '</div>',

    onCreateView: function() {

    },

    onRendering: function() {

    },

    onRendered: function() {

    }
});