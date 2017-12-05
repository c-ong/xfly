$Page.define('multi.instance', {

    multitask: true,    /* REQUIRED */

    onCreateView: function() {
        this.render( { html:
            '<div class="page-ui">' +
                '<h1>This view was created at ' + new Date + '</h1>' +
                '<p>NOTE: When args is different, a new instance is created.</p>' +
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