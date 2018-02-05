! function () {
    var template = function () {
        return {
            html:

            '<div class="page-ui">' +
                '<h1>This view last updated at ' + new Date + '</h1>' +
                '<hr/>' +
                '<a id="reload_trigger" href="">Touch to reload</a>' +
                '<a class="xfly-page__back" href="">Get back</a>' +
            '</div>'
        }
    };

    $Page.define('reload', {
        onCreateView: function() {
            this.render( template() );
        },

        onRendered: function() {
            var me = this;

            $('#reload_trigger').on( 'click', function () {
                me.reload();

                return false;
            } );
        },

        onReload: function () {
            /* To clear that the exist view Before re-render */
            $('.page-ui').remove();

            this.render( template() );
        }
    });
}();