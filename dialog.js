/**
 * ----------------------------------------------------------------------------
 *                              Dialog module
 *        Note: This is untested code, do not be used for You prod project.
 * ----------------------------------------------------------------------------
 *
 * @deprecated
 */
;!function(xfly, undefined) {
    'use strict';

    /* 版本号 */
    var VERSION = '0.1.50';

    var _       = xfly || {};

    var win     = window;
    var doc     = win.document;

    var emptyFn = $.noop;

    var ua      = navigator.userAgent.toLowerCase(),
        os      = {},
        browser = {},

        /* 这取自于 zepto 以后可能完全使用 zepto.detect */
        android = ua.match( /(Android);?[\s\/]+([\d.]+)?/ig ),
        ipad    = ua.match( /(iPad).*OS\s([\d_]+)/ig ),
        ipod    = ua.match( /(iPod)(.*OS\s([\d_]+))?/ig ),
        iphone  = ! ipad && ua.match(/( iPhone\sOS)\s([\d_]+)/ig ),

        /* 是否为微信环境 */
        wechat  = ua.match( /MicroMessenger\/([\d.]+)/ig ),
        /* 是否为 Tencent X 系统浏览器(目前为 X5) */
        qqx5    = ua.match( /MQQBrowser\/([\d.]+)/ig );

    if ( android ) {
        os.android  = !! 1;
        os.version  = android[ 2 ];

        /* FIXME(XCL): 考虑到大部分国产 Android 设备 CSS Animation 性能不佳, 固此
         *             禁用部分 FX
         */
        /*$.fx.off    = !! 1;*/
    } else {
        os.android = !! 0;
    }

    if ( iphone && ! ipod ) {
        os.ios = os.iphone = !! 1;
        iphone[ 2 ] && ( os.version = iphone[ 2 ].replace( /_/g, '.' ) );
    }
    if ( ipad ) {
        os.ios = os.ipad = !! 1;
        ipad[ 2 ] && ( os.version = ipad[ 2 ].replace( /_/g, '.' ) );
    }
    if ( ipod ) {
        os.ios = os.ipod = !! 1;
        ipod[ 3 ] && ( os.version = ipod[ 3 ] ? ipod[ 3 ].replace( /_/g, '.' ) : null );
    }
    'ios' in os || ( os.ios = !! 0 );

    /* 是否运行于微信 WebView 环境 */
    browser.wechat  = !! wechat;
    /* QQ X5 浏览器 */
    browser.qqx5    = !! qqx5;

    /* 一些判断类型的函数 */
    var isUndefined = function(who) { return who === void 0 },
        isString    = function(who) { return 'string' === typeof who },
        isNumber    = function(who) { return ! isUndefined( who )
            && 'number' === typeof who },
        /* 判断是否为 DOM */
        isDom       = function(who) { return $.isPlainObject( who )
            && who.nodeType > 0 },

        /* 抛出未实现异常, 仅用于开发期间防止无效的调用 */
        throwNiyError = function() { throw new Error( 'Not implement yet!' ) };

    /**
     * 执行一个 GET 请求.
     * @deprecated
     */
    function get(/* url, data, success, error, dataType */) {
        return $.ajax( _parse_args.apply( null, arguments ) );
    }

    /**
     * 执行一个 POST 请求.
     * @deprecated
     */
    function post(/* url, data, success, error, dataType */) {
        var options = _parse_args.apply( null, arguments );
        options.dataType = 'POST';

        $.ajax( options );
    }

    function _parse_args(url, data, success, error, dataType) {
        if ( $.isFunction( data ) ) {
            dataType    = error;
            error       = success;
            success     = data;
            data        = void 0;
        }
        if ( ! $.isFunction( success ) ) {
            dataType    = error;
            error       = dataType;
            success     = void 0;
        }
        if ( ! $.isFunction( error ) ) {
            dataType    = error;
            error       = void 0;
        }

        return {
            url:        url,
            data:       data,
            success:    success,
            error:      error,
            dataType:   dataType
        };
    }

    /* Super global */
    var $global             = {};

    /* 我们 xfly 开放的 fn 及 property */
    _.undefined             = undefined;
    _.emptyFn               = emptyFn;
    _.noop                  = emptyFn;
    _.win                   = win;

    /* 是否为开发模式(待移除) */
    _.dev                   = !! 0;

    /* 用于判断类型的函数 */
    _.isUndefined           = isUndefined;
    _.isString              = isString;
    _.isNumber              = isNumber;
    _.isDom                 = isDom;

    _.throwNiyError         = throwNiyError;

    /* HTTP 请求 */
    _.get                   = get;
    _.post                  = post;

    /* Runtime Env */
    _.os                    = os;
    _.browser               = browser;

    /* Animation timing(Default) */
    _.cubic_bezier          = 'cubic-bezier(.4, 0, .2, 1)';
    _.brisk_cubic_bezier    = 'cubic-bezier(.1,.5,.1,1)';

    /* Used for WeChat Auth */
    _.ORIGIN_URL            = location.href;

    /**
     * The root of UIs
     * @type {DomElement}
     * @private
     */
    _._viewport             = void 0;

    /* --------------------------------------------------------------------- */

    /* Extend */
    /* 可见 DOM 的根节点 */
    _.ID_VIEWPORT           = 'xfly_viewport';
    /* Dialog 元素 */
    _.ID_DIALOG             = 'xfly_dialog';
    _.ID_DIALOG_MASK        = 'dialog_mask';
    /* FIXME(XCL): 由于布局未知原因导致动画不理想, 这里暂时不在嵌套 DOM */
    _.ID_FRAGMENT_ROOT      = 'xfly_pages';

    /* Layer manager */
    /* hasTopLayer */

    _.DIALOG_WRAPPER        = 'dialog_wrapper';
    /* DIALOG_STACK         = 'dialog_stack', */
    _.DIALOG_MASK           = 'dialog_mask';
    _.DIALOG                = 'dialog';
    _.FRAGMENT              = 'page';
    _.FRAGMENTS             = 'page_root';

    /* --------------------------------------------------------------------- */

    var Z_IDX_FIXED     = 0,
        Z_IDX_MIN       = 1,
        Z_IDX_MAX       = 2,
        Z_IDX_CURRENT   = 3;

    /**
     * 这里定义着所有 UI 的叠放次序.
     * @type {{dialog: number[], dialog_mask: number[], dialog_wrapper:
     *     number[]}}
     */
    var zIndexes = {
        /* fixed, min, max, current */

        dialog_wrapper  : [ 0, 1002, 2000, 1002 ],
        /* dialog_stack    : [ 1, 1001, 1001, 1001 ], */
        dialog_mask     : [ 1, 1000, 1000, 1000 ],
        /* container */
        dialog          : [ 1, 999,  999,  999  ],

        page            : [ 0, 1,    200,  1    ],
        /* container */
        page_root       : [ 1, 0,    0,    0    ]
    };

    /* --------------------------------------------------------------------- */

    /**
     * 分配一个 z-index 用于 UI 的呈现。
     *
     * @param component
     * @returns {*}
     * @private
     */
    _.alloZIndex = function(component) {
        if ( ! component || ! zIndexes[ component ] )
            throw new TypeError( 'Invalid component' );

        var info    = zIndexes[ component ];

        var current = info[ Z_IDX_CURRENT ],    /* 当前值 */
            next    = current;

        if ( info[ Z_IDX_FIXED ] )
            return next;

        if ( current >= info[ Z_IDX_MAX ] ) {
            next = current = info[ Z_IDX_CURRENT ] = info[ Z_IDX_MIN ];
        } else {
            next = info[ Z_IDX_CURRENT ] = current + 1;
        }

        return next;
    };

    /**
     * 合成一个用于 Zepto 的 ID Selector。
     * @param id
     * @returns {string}
     * @private
     */
    _.idSelector = function(id) {
        return '#' + id;
    };

    _.isShowing = function(z_obj/*Zepto*/) {
        return z_obj && 'none' !== z_obj.css( 'display' );
    };

    /* --------------------------------------------------------------------- */

    /**
     * 隐藏 Keyboard.
     *
     * @param {Element} trigger input 元素,如: textarea, input
     */
    win.hide_keyboard = function(trigger) {
        isDom( trigger ) && trigger[ 'blur' ] && trigger.blur();

        document.body.focus();
    };

    /**
     * 当你要执行的操作依赖外部代码, 且又不知外面代码何时载入完成时, 可考虑使用这个 fn, 这里会
     * 按一秒的间隔去调用 checker, 当 checker 返回 true 时, 会调用你指定的 callback, 注
     * 意这仅会调用一次你的 callback, 如:
     * <pre>
     *     case_run( function() {
     *         return 'same_field' in window
     *     },
     *     function() {
     *         alert( 'Found same_field.' );
     *     } );
     * </pre>
     *
     * @param checker 一个 fn 需要有有效的返回值
     * @param callback
     * @param context
     * @param max_check 最大检测次数
     */
    win.case_run = function(checker, callback, context, max_check) {
        var ctx = context || window;

        var timer_id;
        var checking_count = max_check;

        var watcher = function() {
            if ( ! timer_id )
                return;

            if ( checking_count ) {
                if ( ! ( --checking_count ) ) {
                    clearInterval( timer_id );
                    timer_id = void 0;
                }
            }

            if ( checker.call( ctx ) ) {
                if ( timer_id ) {
                    clearInterval( timer_id );
                    timer_id = void 0;
                }

                callback.call( ctx );
            }
        };

        timer_id = setInterval( watcher, 1e3 );   /* 目前检测间隔为 1 秒 */

        watcher();

        return timer_id;
    };

    /* --------------------------------------------------------------------- */

    var _loader = doc.getElementsByTagName('head')[0];

    var _import = function(res, delay) {
        delay
            ? setTimeout( function() {
                _loader.appendChild( res )
            }, delay )
            : _loader.appendChild( res );
    };

    /**
     * 加载 Javascript 资源.
     *
     * @param src
     * @param callback
     * @param delay
     */
    win.import_script = function(src, callback, delay) {
        /* TODO(XCL): callback 处理 */
        if ( isNumber( callback ) ) {
            delay       = callback;
            callback    = void 0;
        }

        var script;

        /* 加载遇到错误 */
        function error(event) {
            event = event || win.event;

            script.onload = script.onreadystatechange = script.onerror = null;
        }

        /* 加载完成 */
        function process(event) {
            event = event || win.event;

            if ( event.type === 'load'
                || ( /loaded|complete/.test( script.readyState )
                    && ( ! doc.documentMode || doc.documentMode < 9 ) ) ) {
                script.onload = script.onreadystatechange = script.onerror = null;

                callback && callback();
            }
        }

        script          = doc.createElement('script');
        script.type     = 'text/javascript';
        script.src      = src;

        script.onload   = script.onreadystatechange = process;
        script.onerror  = error;

        /* 以异步方式载入 */
        script.async    = ! 0;

        _import( script, delay );
    };

    /**
     * 加载 Style 资源.
     *
     * @param href
     * @param delay
     */
    win.import_style = function(href, delay) {
        var style = doc.createElement('link');

        style.rel   = 'stylesheet';
        style.type  = 'text/css';
        style.href  = href;

        style.async = !! 1;

        _import( style, delay );
    };

    /* --------------------------------------------------------------------- */

    win.load_asset = function(url, callback) {
        if ( /\.css[^\.]*$/.test( url ) ) {
            win.import_style( url );
        }
        else {
            callback = callback || _.noop;

            win.import_script( url, callback );
        }
    };

    /* --------------------------------------------------------------------- */

    /* FIXME(XCL): 考虑 App 注入场景 */
    /* 放置于 window 域 */
    xfly || (win.xfly = _);
}(window['xfly']);

!function($x/*, undefined*/) {
    'use strict';

    var isArray     = $.isArray,
        isFunction  = $.isFunction,
        isUndefined = $x.isUndefined,
        _idSelector = $x.idSelector;


    /* NOTE: 低版本可能没有提供 JSON.stringify */
    /* FIXME(XCL): 这里我们使用 JSON.stringify 给出的结果来计算 hash code, 数据结构较为简单 */
    var stringify   = JSON.stringify
        /*(function(JSON) {
            return (JSON && 'stringify' in JSON) ? JSON.stringify : function (map) {
                var buffer = [];

                for ( var key in map ) {
                    if ( map.hasOwnProperty( key ) )
                        buffer.push( key, ':', stringify( map[ key ] ) );
                }

                return '{' + buffer.join( ',' ) + '}';
            }
        })(JSON)*/;

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
        _dialog_root || /*$( idSelector( ID_DIALOG ) ).length || */_prepare_dialog();
    }

    function _prepare_dialog() {
        _DIALOG_WRAPPER_TEMPLATE =
            $( '<div class="dialog-wrapper" id="dialog_wrapper"><div id="dialog_body"></div></div>' );

        _dialog_root = $( idSelector( $x.ID_DIALOG ) );
        _dialog_mask = $( idSelector( $x.ID_DIALOG_MASK ) );

        _dialog_mask.on( 'click', _handle_mask_tap );

        _dialog_root.css( 'z-index', $x.alloZIndex( $x.DIALOG ) );
        _dialog_mask.css( 'z-index', $x.alloZIndex( $x.DIALOG_MASK ) );
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

        $.isArray( cancelable ) && (actions = cancelable, cancelable = void 0);

        /* 分配一个 id 实际上就是 z-index */
        var stackId = $x.alloZIndex( $x.DIALOG_WRAPPER );

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

        if ( ! $x.isShowing( el.wrapper ) )
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