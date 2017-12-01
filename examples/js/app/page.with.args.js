$Page.define('page.with.args', {

    onCreateView: function() {
        /* Tip: Easy way to get the query string */
        var args = this.getArgs();

        this.render( { html:
            '<div class="page-ui">' +
                '<h1>Got the arg is ' + args[ 'key' ] + '</h1>' +
                '<hr/>' +
                '<a class="xfly-page__back" href="">Get back</a>' +
            '</div>'
        } );
    },

    onRendering: function() {

    },

    onRendered:function(){

    }
});