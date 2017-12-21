/**
 * ----------------------------------------------------------------------------
 *                              Dialog module
 *        Note: This is untested code, do not be used for You prod project.
 * ----------------------------------------------------------------------------
 *
 * @deprecated
 */
!function($x/*, undefined*/) {
    'use strict';

    var isArray     = $x.isArray,
        isFunction  = $x.isFunction,
        isUndefined = $x.isUndefined,
        _idSelector = $x._idSelector;

    /**
     * 全部 Dialog
     * @type {Array}
     * @private
     */
    var _dialogs    = {};

    /**
     * The root of dialog element
     * @type {HTMLElement}
     * @private
     */
    var _dialog_root;

    /**
     * The mask of dialog
     * @type {HTMLElement}
     * @private
     */
    var _dialog_mask;

    /**
     * 当前 Dialog
     *
     * @type {Dialog}
     * @private
     */
    var _dialog_current;

    /**
     * The wrapper of Dialog.
     *
     * @type {HTMLElement}
     * @private
     */
    var _DIALOG_WRAPPER_TEMPLATE;

    function _dialog_idx(stackId) {
        return 'xfly-layout--dialog_' + stackId;
    }

    function _ensure_dialog_base() {
        _dialog_root || /*$( _idSelector( ID_DIALOG ) ).length || */_prepare_dialog();
    }

    function _prepare_dialog() {
        _DIALOG_WRAPPER_TEMPLATE =
            $( '<div class="dialog-wrapper" id="dialog_wrapper"><div id="dialog_body"></div></div>' );

        _dialog_root = $( _idSelector( $x.ID_DIALOG ) );
        _dialog_mask = $( _idSelector( $x.ID_DIALOG_MASK ) );

        _dialog_mask.on( 'click', _handle_mask_tap );

        _dialog_root.css( 'z-index', $x._alloZIndex( $x.DIALOG ) );
        _dialog_mask.css( 'z-index', $x._alloZIndex( $x.DIALOG_MASK ) );
    }

    /**
     * 处理 Mask Touch 事件。
     * @private
     */
    function _handle_mask_tap() {
        /* 点击 mask 时取消 dialog */
        _dialog_current
        && _dialog_current.cancelable
        && _dialog_current.cancel();
    }

    /**
     * 创建一个 Dialog
     *
     * @returns { {id,
     *          show: Function,
     *          cancel: Function,
     *          dismiss: Function,
     *          _el_: {dialog: (*|jQuery|HTMLElement),
     *          mask: (*|jQuery|HTMLElement),
     *          wrapper: (*|jQuery|HTMLElement)}}|*}
     * @private
     */
    function _build(html, cancelable, actions) {
        var model;

        _ensure_dialog_base();

        isArray( cancelable ) && (actions = cancelable, cancelable = void 0);

        /* 分配一个 id 实际上就是 z-index */
        var stackId = $x._alloZIndex( $x.DIALOG_WRAPPER );

        /* 通过 clone 来快速获得 DOM 元素 */
        var wrapper = _DIALOG_WRAPPER_TEMPLATE.clone();

        wrapper.css( 'z-index', stackId );

        model = {
            id:         stackId,
            cancelable: !! cancelable || 1, /* 是否可取消 */
            dismissed:  0,                  /* 是否已被 dismiss */
            _el_:       { wrapper: wrapper }
        };

        /* 对 Dialog 开放的方法 */
        var methods = [
            [ 'show',       show    ],
            [ 'cancel',     cancel  ],
            [ 'dismiss',    dismiss ]
        ];
        methods.forEach( function(fn) {
            model[ fn[ 0 ] ] = fn[ 1 ]
        } );

        _dialogs[ _dialog_idx( stackId ) ] = model;

        /* 填充 Dialog 内容 */
        html && wrapper.find( '#dialog_body').html( html );

        /* 添加到 Dialog 根节点 */
        _dialog_root.append( wrapper );

        actions && _setup_actions_if_necessary( model, actions );

        return model;
    }

    function _setup_actions_if_necessary(model, actions) {
        var ctx = model._el_.wrapper;
        var id, callback, target;

        actions.forEach( function(action) {
            id          = action[ 'id' ];
            callback    = action[ 'callback' ];

            if ( id && callback ) {
                target = $( '#' + id, ctx );

                target.on( 'click', function() {
                    callback.call( model );
                } );
            }
        } );
    }

    /**
     * 取消 Dialog。
     *
     * @returns {dialog}
     */
    function cancel() {
        var el = this._el_;

        if ( ! $x._isShowing( el.wrapper ) )
            return;

        ! el.dismissed && _hide_wrapper_only.call( this );

        _dialog_mask.animate(
            'dialog-mask-out',
            $.fx.speeds.fast,
            'linear',
            function() {
                _dialog_mask.hide();
                _dialog_root.hide();

                /* Reset the opacity prop */
                /* el.wrapper.css( { opacity: 1 } );
                el.wrapper.hide() */
            } );

        _dialog_current = void 0;

        return this;
    }

    function _hide_mask() {}

    function _hide_wrapper_only() {
        var el = this._el_;

        /* properties, duration, ease, callback, delay */
        el.wrapper.animate(
            { opacity: .1 },
            $.fx.speeds.fast,
            /*'cubic-bezier(0.4, 0, 0.2, 1)'*/'ease-out',
            function() {
                /* Reset the opacity prop */
                el.wrapper.hide();
                el.wrapper.css( { opacity: 1 } );
            } );

        return this;
    }

    /**
     * 呈现 Dialog。
     *
     * @returns {dialog}
     */
    function show() {
        var current = _dialog_current;

        /* 清当前 dialog */
        (current && this != current)
        && _hide_wrapper_only.call( current );

        var el = this._el_;

        if ( el.dismissed )
            return;

        if ( current ) {
            _dialog_mask.show();
            _dialog_root.show();

            /* properties, duration, ease, callback, delay */
            _dialog_mask.animate(
                'dialog-mask-in',
                $.fx.speeds.slow,
                /*'cubic-bezier(0.4, 0, 0.2, 1)'*/'linear' );
        }

        el.wrapper.show();

        /* Vertical Center */
        var margin = (_dialog_root.height() / 2) - (el.wrapper.height() / 2);
        el.wrapper.css( 'margin-top', margin + 'px' );

        return _dialog_current = this;
    }

    /**
     * 取消 Dialog 并移出对应的 DOM 元素
     */
    function dismiss() {
        var el = this._el_;

        /* 如果已经操作过 dismiss 则不在执行 */
        if ( el.dismissed )
            return;

        /* 设置 dismiss 标识 */
        el.dismissed = ! 0;

        /* 取消 */
        this.cancel();

        /* 移除 DOM */
        el.wrapper.remove();

        delete _dialogs[ _dialog_idx( this.id ) ];
    }

    /**
     * 初始化一个 Dialog 实例，你可以调用内建的方法来实现 show、cancel、dismiss 操作。
     *
     * @param html HTML 片段
     * @param cancelable 是否可以被取消当点击 Mask 时
     * @param actions
     * @returns { {id,
     *            show: Function,
     *            cancel: Function,
     *            dismiss: Function,
     *            _el_: {dialog: (*|jQuery|HTMLElement),
     *            mask: (*|jQuery|HTMLElement),
     *            wrapper: (*|jQuery|HTMLElement)}}|* }
     */
    $x.dialog = function(html, cancelable, actions) {
        return _build( html, cancelable, actions );
    };

    /* TODO(XCL): Auto dismiss */
}(xfly);