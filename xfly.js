/**
 * @fileoverview 该代码包含以下内容:
 *
 * 1: 基本函数;
 * 2: Dialog 实现(使用参与 index.html 例子);
 * 3: Page 实现(使用参与下面注释 及 index.html 例子);
 *
 * ============ 以下将介绍如何定义 page 模型  ============
 *
 * 定义一个 Page 实例并以指定的 ID 来标识。
 *
 * <pre>
 * e.g:
 *
 * 1: 定义一个 page:
 * 
 *
 * $Page.define(
 *      'namespace.views.about',      // page 唯一标识，必选项
 *
 *      {
 *           title:    'Untitled',    // 标题用于显示在支持的浏览器上
 *
 *           multitask: 1,            // 标明该 page 是否支持多实例,
 *                                    // 既 Multiple Instances, 此项与
 *                                    // clearContentOnLeave 互斥
 *
 *           args:     {key: 'value'} // 参数对儿
 *
 *           returnable: false,       // 是否可后退(默认)
 *
 *           requires: {String/[]},   // 依赖项
 *
 *           html/url: 'URL or HTML', // 完整 URL 或 HTML 片段
 *
 *           trigger: { on: 'home', state: 'show', do: function() {} },
 *
 *           onAttach: function() {
 *              // page 容器被添加到 DOM 中后会调用
 *           },
 *
 *           onCreate: function() {
 *              // 当 page 被创建时调用该 callback
 *           },
 *
 *           onCreateView: function() {
 *           },
 *
 *           onStart: function() {
 *           },
 *
 *           onResume: function() {
 *              // page 被恢复, 也就是可见状态
 *           },
 *
 *           // -------------- 以下为对应的周期 callback -----------------
 *
 *           onPause: function() {
 *              // 当 page 不可见时会调用该 callback
 *           },
 *
 *           onStop: function() {
 *              // 如果要对一个 page 执行 destroy 操作会调用该 callback
 *           },
 *
 *           onDestroyView: function() {
 *           },
 *
 *           onDestroy: function() {
 *           },
 *
 *           onDetach: function() {
 *              // 这是 destroy 的最后一步环节, 将容器从 DOM 中移出
 *           },
 *
 *           // -------------- 以下为 reload 对应的 callback ------------
 *
 *           onReload: function() {
 *              // 你可以这里实现 reload 操作
 *           },
 *
 *           // -------------- 以下为 Render 对应的 callback ------------
 *
 *           onPrerender: function(container) {
 *              // 开始 Render 操作, 比如你可以在上里作一些 Reset 操作
 *           },
 *
 *           onRendered: function(container) {
 *              // Render 操作已交付至浏览器, 你可以在这里对你的 DOM 进行操作,
 *              // 如果你 DOM 的 id 不是唯一的那么请基于 container 进行查找,
 *              // 如若不是我们也建议您基于该 container 进行查找以便提升速度,
 *              // 另外我们也对 page 实例开放了 getContainer() 方法, 只
 *              // 是你需要注意调用的环节, 如还没有进行过 attach 操作, 我们不
 *              // 建议调用该方法.
 *
 *              // e.g.
 *              console.dir( $( '#idx', container ) );
 *           }
 *      } );
 *
 * 调用该 fn 会创建一个 page 的实例, 该实例开放以下方法:
 *
 *  1: setTitle                         设置该 page 对应的标题
 *  2: isVisible                        判断该 page 是否可见
 *  3: getArgs                          获取参数对儿
 *  4: render                           渲染 UI 依照给定的参数类型
 *  5: getContainer                     获取 page 的容器
 *  6: hasContent                       是否内容已经加载
 *  7: reload                           重新加载 content
 *  8: [put, get, has, remove, clear]   Storage 相关的方法
 *
 * 2: 对 $Page 进行全局配置, 例如指定: listener, property 等;
 *
 * $Page.config( {
 *      // 标识是否启用 lazy 模式
 *      lazyModeEnabled: true,
 *
 *      // 启用 lazy 模式后对要加载的代码进行路径规则, 目前仅支持简单的通配符 **, 以下例子将
 *      // 可以匹配 module.a, module.a.b 等以 module 开头的 Page.
 *      paths: {
 *          'module**': 'other/'
 *      },
 *
 *      // 部分 Lazy 加载的 Page 全局版本号
 *      lazyPageVerCode: 123456789,
 *
 *      // 会在 page 切换之前调用, 其中 currently 指当前的 page,
 *      // upcoming 指即将呈现的 page.
 *      onBeforePageChange: function(currently, upcoming) {
 *          Do something here...
 *      },
 *
 *      // 会在 page 切换完成之后调用(既切换效果呈现完毕之后), older 切换之前
 *      // 的 page, currently 指切换之后的 page.
 *      onAfterPageChange: function(older, currently) {
 *          Do something here...
 *      },
 *
 *      // 会在当前 page 内容加载完成之后调用
 *      onCurrentlyPageContentLoaded: function() {
 *          Do something here...
 *      }
 *  } );
 *
 *  3: Page 的导向
 *
 *  1): go 用于前往指定的 page, 该 fn 接受3个参数 (id, args, animation) 其 id 为
 *      必选, args 为传递的参数, animation 则为强制使用的 animation;
 *
 *  2): back 请求后退操作;
 * </pre>
 *
 * Created by xong on 10/29/15.
 *
 * @dependents Zepto | jQuery
 */
;!function(xfly) {
    'use strict';

    /* 版本号 */
    var VERSION = '0.1.48';

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
        isArray     = $.isArray,
        isNumber    = function(who) { return ! isUndefined( who )
            && 'number' === typeof who },
        isFunction  = $.isFunction,
        /* 判断是否为 DOM */
        isDom       = function(who) { return $.isPlainObject( who )
            && who.nodeType > 0 },

        /* FIXME(XCL): 这里我们使用 JSON.stringify 给出的结果来计算 hash code, 数据结构较为简单 */
        stringify   = JSON.stringify
        /*(function(JSON) {
            return (JSON && 'stringify' in JSON) ? JSON.stringify : function (map) {
                var buffer = [];

                for ( var key in map ) {
                    if ( map.hasOwnProperty( key ) )
                        buffer.push( key, ':', stringify( map[ key ] ) );
                }

                return '{' + buffer.join( ',' ) + '}';
            }
        })(JSON)*/,

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
        if ( isFunction( data ) ) {
            dataType    = error;
            error       = success;
            success     = data;
            data        = void 0;
        }
        if ( ! isFunction( success ) ) {
            dataType    = error;
            error       = dataType;
            success     = void 0;
        }
        if ( ! isFunction( error ) ) {
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
    var $global     = {};

    /* 我们 xfly 开放的 fn 及 property */
    _.undefined     = void 0;
    _.emptyFn       = emptyFn;
    _.noop          = emptyFn;
    _.win           = win;

    /* 是否为开发模式(待移除) */
    _.dev           = !! 0;

    /* 用于判断类型的函数 */
    _.isUndefined   = isUndefined;
    _.isString      = isString;
    _.isArray       = isArray;
    _.isFunction    = isFunction;
    _.isNumber      = isNumber;
    _.isDom         = isDom;

    /* 低版本可能没有提供 JSON.stringify */
    _.stringify     = stringify;

    _.throwNiyError = throwNiyError;

    /* HTTP 请求 */
    _.get           = get;
    _.post          = post;

    /* Runtime Env */
    _.os            = os;
    _.browser       = browser;

    /* Animation timing(Default) */
    _.cubic_bezier          = 'cubic-bezier(.4, 0, .2, 1)';
    _.brisk_cubic_bezier    = 'cubic-bezier(.1,.5,.1,1)';
    
    _.ORIGIN_URL            = location.href;

    /* 提供了短名方法,用于访问 console 方法 */
    /*
    log: console ? function(msg) {
        xfly.dev && console.log( msg )
    } : emptyFn,
    dir: console ? function(obj) {
        xfly.dev && console.dir( obj )
    } : emptyFn,
    error: console ? function(msg) {
        xfly.dev && console.error( msg )
    } : emptyFn
    */

    /**
     * The root of UIs
     * @type {DomElement}
     * @private
     */
    _._viewport        = void 0;

    /* --------------------------------------------------------------------- */

    /* Extend */
    /* 可见 DOM 的根节点 */
    _.ID_VIEWPORT      = 'xfly_viewport';
    /* Dialog 元素 */
    _.ID_DIALOG        = 'xfly_dialog';
    _.ID_DIALOG_MASK   = 'dialog_mask';
    /* FIXME(XCL): 由于布局未知原因导致动画不理想, 这里暂时不在嵌套 DOM */
    _.ID_FRAGMENT_ROOT = 'xfly_pages';

    /* Layer manager */
    /* hasTopLayer */

    _.DIALOG_WRAPPER  = 'dialog_wrapper';
    /* DIALOG_STACK  = 'dialog_stack', */
    _.DIALOG_MASK     = 'dialog_mask';
    _.DIALOG          = 'dialog';
    _.FRAGMENT        = 'page';
    _.FRAGMENTS       = 'page_root';

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
    _._alloZIndex = function(component) {
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
    _._idSelector = function(id) {
        return '#' + id;
    };

    _._isShowing = function(z_obj/*Zepto*/) {
        return z_obj && 'none' !== z_obj.css( 'display' );
    };

    /* --------------------------------------------------------------------- */

    /**
     * 隐藏 Keyboard.
     *
     * @param {Element} trigger input 元素,如: textarea, input
     */
    win.hide_keyboard = function(trigger) {
        isDom( trigger ) && 'blur' in trigger && trigger.blur();
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

/**
 * ----------------------------------------------------------------------------
 *                              Page module
 * ----------------------------------------------------------------------------
 */
!function($x/*, undefined*/) {
    'use strict';
    
    /* @type {SessionStorage} Shortcut of the sessionStorage object */
    var ss;
    
    var SESSION_CURRENT_STATE   = '!#';

    var win             = $x.win,

        _alloZIndex     = $x._alloZIndex,
        _idSelector     = $x._idSelector,
        isShowing       = $x._isShowing,
        isString        = $x.isString,
        isPlainObject   = $.isPlainObject;

    /* 标识 Env 是否支持 History API */
    var history_api_supported               = 'onpopstate' in win,
        session_storage_supported           = !! 0,
        persistent_session_stack_idx_offset = 0,
        scroll_restoration_supported        = 'scrollRestoration' in history;

    /**
     * 以 #! 打头的 hash 可识别为我们的 page 导向.
     *
     * @type {string}
     * @const
     * @private
     */
    var _FRAGMENT_HASH_STRIPPER          = '#!',

        /* 这是一个特殊的 hash 它用于后退操作 */
        _MAGIC_BACK_HASH                 = _FRAGMENT_HASH_STRIPPER + '-',
        _SCROLL_RESTORATION_FOR_REDIRECT = '#xsrfr';
    
    /**
     * Used for history API
     * @const
     * @private
     */
    var _STANDARD_BACK          = -1,

        _MAGIC_BACK_FIRER       = -2;

    /**
     * 记录转化后的 hash 值, 及参数.
     *
     * @type {string}
     * @private
     */
    var _ROUTE                  = 'hash',

        /* Route 的参数 */
        _ROUTE_ARGS             = 'args',

        /* Page 的唯一标识 */
        _ID                     = 'id',

        /* Window 标题 */
        _TITLE                  = 'title',

        /* 在配置中 HTML 与 URL 只选其一, 默认使用 HTML */
        _HTML                   = 'html',
        _URL                    = 'url',

        /* Page 指定的切换效果 */
        _ANIMATION              = 'animation',
        /* 临时覆盖的切换效果 */
        _OVERRIDDEN_ANIMATION   = '_force_anima',
        _BACK_STACK_TARGET_ID   = '_',

        /* 依赖项 */
        _REQUIRES               = 'requires',
        
        _SCROLLER               = 'scroller';
        
    var _CFG_LAZY_MODE_ENABLED  = 'lazyModeEnabled';
    
    /**
     * 一些常量。
     * @type {string}
     * @private
     * @const
     */
    var _STACK_INDEX_           = '_stck_idx_',
        _EL_                    = '_el_',
        _LAYOUT_                = '_lyt_',
        _LAYOUT_ID_             = '_lyt_id_',
        _STATE_                 = '_stt_', /* initial value is INITIALIZING */
        /* 可能的父级 page */
        _PARENT_                = '_parent_',
        _SCROLL_POSITION_Y_     = '_s_p_y_';

    var _RENDER_CALLED_         = '_rndr_clld_';

    /* 是否支持多实例(Multiple instance) */
    var _MULTIPLE_INSTANCES     = 'multitask',
    /* _IS_DERIVE_              = '_derive_', */ /* 是识是否为派生实例 */
        _DERIVE_ID_             = '_derive_id_'; /* 派生后的实例 ID */

    /* 标识是否内容加载完成 */
    var _FLAG_CONTENT_LOADED    = '_cnt_ld_',
        /* 标识 Page 是否实例化 */
        _FLAG_INSTANTIATED      = '_nstnttd_',
        /* 标识 Page 实例是否需要延迟 reload */
        _FLAG_POST_RELOAD       = '_pst_rld_';

    var _CREATE                 = 'create',
        _CREATE_VIEW            = 'createView',
        _START                  = 'start',
        _ATTACH                 = 'attach',
        _RESUME                 = 'resume',     /* page 被恢复 */
        _PAUSE                  = 'pause',      /* page 不可见 */
        _DETACH                 = 'detach',
        _STOP                   = 'stop',
        _DESTROY_VIEW           = 'destroyView',
        _DESTROY                = 'destroy';

    var _RELOAD                 = 'reload';     /* 重载 */

    /**
     * 一个 page 从定义到销毁将会执行以下这些过程.
     *
     * @type {Array}
     * @const
     * @private
     */
    var LIFECYCLE_METHODS =
            [
                _CREATE,
                    _CREATE_VIEW,
                        _START,
                            _ATTACH,
                                _RESUME,
                                _PAUSE,
                            _DETACH,
                        _STOP,
                    _DESTROY_VIEW,
                _DESTROY
            ];

    /* Render 对应的 Callback */
    var _PRERENDER_HANDLER = 'onPrerender',
        _RENDERING_HANDLER  = 'onRendering',
        _RENDERED_HANDLER   = 'onRendered';

    var _ON_RELOAD          = 'onReload';

    /**
     * 这个 LIFECYCLE_METHODS 对应的 Callback.
     *
     * @type {Array}
     * @const
     * @private
     */
    var SUPPORTED_HANDLERS = [
        'onCreate',
            'onCreateView',
                'onStart',
                    'onAttach',
                        'onResume',
                        'onPause',
                    'onDetach',
                'onStop',
            'onDestroyView',
        'onDestroy',
        
        /* Before & After Rendering */
        _PRERENDER_HANDLER, _RENDERING_HANDLER, _RENDERED_HANDLER,
        
        /* Will invoke when reload occur */
        _ON_RELOAD
    ];

    /**
     * LIFECYCLE_METHODS 与 SUPPORTED_HANDLERS 映射关系.
     *
     * @type {{Map}}
     * @private
     */
    var METHOD_HANDLERS_MAPPING = (function (life_cycle, handlers) {
        var mapping = {};
    
        life_cycle.forEach( function(lifecycle, idx) {
            mapping[ lifecycle ] = handlers[ idx ];
        } );
        
        return mapping;
    })( LIFECYCLE_METHODS, SUPPORTED_HANDLERS );

    /**
     * pages 的根节点.
     *
     * @type {Page}
     * @private
     */
    var _page_root;

    /**
     * page DOM 节点模板.
     *
     * @type {DOM}
     * @private
     */
    var _FRAGMENT_TEMPLATE;

    /**
     * page 容器.
     *
     * @type {Map}
     * @private
     */
    var _pages      = {},
        _handlers   = {};

    /**
     * 目前我们支持 4 种切换效果.
     *
     * @enum {string}
     * @const
     */
    var fx = {
        slide:  'slide', /* 左右滑动切换   */
        cover:  'cover', /* 从下至上的覆盖  */
        fade:   'fade',  /* fade-in-out  */
        none:   'none'   /* 无切换效果     */
    };

    /**
     * 将 fx 置为全局可见
     * @global
     */
    win.fx = fx;

    /* ------------------------------------------------------------------------
     *                     以上为一些 fn 的引用, 及常量, 容器的定义
     * --------------------------------------------------------------------- */

    /**
     * 当前 page。
     *
     * @type {Page}
     * @private
     */
    var _current;
    
    var _sandbox_dom_container = {};
    
    /* Unique identifier of Page */
    function _page_sequence_token(id, args) {
        return 'xfly-page__' + hash_code( _calculate_derive_key( id, args ) );
    }

    /**
     * 是否有默认 Page.
     *
     * @return {boolean}
     * @private
     */
    function _has_page() {
        return !! _current;
    }

    function _add(page) {
        _pages[ _get_id( page ) ] = page;
    }

    function _get_id(page) {
        return page[ _is_derive( page ) ? _DERIVE_ID_ : _ID ];
    }

    function _get_id_for_handlers(page) {
        return page[ _ID ];
    }

    /**
     * 是否 Page 已经定义。
     *
     * @param {string} id
     * @returns {boolean}
     * @private
     */
    function _exist(id) {
        return id in _pages;
    }

    /**
     * 从集合中取 page 的实例 根据指定的 id, 如: about.
     *
     * ui.view#hash
     * ui.view#343434344
     *
     * @param {string} id
     * @returns {*}
     */
    function _get_page(id) {
        return _pages[ id ];
    }
    
    /* Page 的容器 */
    function _prepare() {
        /* TODO: Progress status */
        _FRAGMENT_TEMPLATE = $( '<div class="xfly-page"></div>' );

        /* Page 根节点 */
        $x._viewport = $( _idSelector( $x.ID_VIEWPORT ) );
    }

    function _ensure() {
        $x._viewport || _prepare();
    }

    /* --------------------------------------------------------------------- */

    //function attach(page) {
    //    /* XXX(XCL): DOM 节点, 如果为祖先级实例则该 DOM 只会被用于 clone */
    //    /*(frag[ _EL_ ] = {})[ _LAYOUT_ ] = layout[ 0 ];*/
    //
    //    if ( is_sandbox_mode() ) {
    //        if ( _has_page_content( page ) )
    //            restore_page_elements.call( page );
    //    } else {
    //        /* 用于容纳 page 内容 */
    //        var layout;
    //
    //        if ( _has_layout_id( page ) ) {
    //            layout = get_layout.call( page );
    //        } else {
    //            layout = _FRAGMENT_TEMPLATE.clone();
    //
    //            /* 设置 layout id */
    //            _set_up_layout_id( page, layout );
    //
    //            layout.appendTo( $x._viewport );
    //        }
    //
    //        layout.css( 'z-index', page[ _STACK_INDEX_ ] );
    //    }
    //
    //    _invoke_handler( page, _ATTACH );
    //}

    //function create(page) {
    //    _invoke_handler( page, _CREATE );
    //}

    //function create_view(page) {
    //    /* 若有后置 reload  */
    //    page[ _FLAG_POST_RELOAD ] && ( page[ _FLAG_POST_RELOAD ] = !! 0 );
    //    /* 重置 called flag */
    //    page[ _RENDER_CALLED_ ] = !! 0;
    //
    //    _invoke_handler( page, _CREATE_VIEW );
    //
    //    if ( ! page[ _RENDER_CALLED_ ] ) {
    //        _invoke_render( page, { url: _build_url_for_render( page ) } );
    //    }
    //}

    //function start(page) {
    //    _invoke_handler( page, _START );
    //}

    //function resume(page) {
    //    _exec_pending_actions( page );
    //
    //    /* 更新 title */
    //    _trigger_update_title( page[ _TITLE ] || $Page.title );
    //
    //    _invoke_handler( page, _RESUME );
    //
    //    /* FIXME(XCL): 未知原因 scroller 无法滚动，这里 refresh 可暂时解决 */
    //    _update_scroller_enabled( page[ _SCROLLER ], true );
    //    /*var scroller = page[ _SCROLLER ];
    //    if ( scroller && scroller.length ) {
    //        var x;
    //
    //        for ( var idx in scroller ) {
    //            x = scroller[ idx ];
    //
    //            x.enable();
    //
    //            x.refresh();
    //            x.hasVerticalScroll || (x.hasVerticalScroll = !! 1);
    //            scroller[ idx ] = x;
    //        }
    //    }*/
    //}

    /* --------------------------------------------------------------------- */
    
    function _update_scroller_enabled(scrollers, enabled) {
        if ( scrollers && scrollers.length ) {
            for ( var idx in scrollers ) {
                if ( enabled )  scrollers[ idx ].enable();
                else            scrollers[ idx ].disable();
            }
        }
    }
    
    /* --------------------------------------------------------------------- */
    
    function _perform_reload(page) {
        /* 重置 called flag */
        page[_RENDER_CALLED_] = !! 0;
        
        _invoke_handler_with_share_mode( page, _ON_RELOAD );
    
        /* 若 Page 未实现 onReload handler 则这里作默认处理 */
        if ( ! page[_RENDER_CALLED_] ) {
            _invoke_render( page, {
                url:    _build_url_for_render( page ),
                reload: 1
            } );
        }
    }
    
    /* --------------------------------------------------------------------- */
    
    function _exec_pending_actions(page) {
        /* FIXME(XCL): Indicator the Page have pending deferred reload... */
        if ( page[ _FLAG_POST_RELOAD ] ) {
            page[ _FLAG_POST_RELOAD ] = !! 0;
            
            _perform_reload( page );
        }
    }

    function _trigger_reload(page, args) {
        if ( isPlainObject( args ) )
            _override_args( _get_id( page ), args );

        if ( ! page[ _FLAG_INSTANTIATED ] )
            return;
    
        if ( is_sandbox_mode() ) {
            if ( _current === page ) {
                _perform_reload( page );
            } else {
                /* 后置 reload */
                _set_up_post_reload( page );
            }
        } else {
            var layout = get_layout.call( page );
    
            if ( layout.length ) {
                if ( $x._isShowing( layout ) ) {
                    _perform_reload( page );
                } else {
                    _set_up_post_reload( page );
                }
            }
        }
    }

    /* --------------------------------------------------------------------- */

    /* NOTE(XCL): This just reference the android Fragment state. */
    var INVALID_STATE   = -1,
        INITIALIZING    = 0, /* Not yet created. */
        CREATED         = 1, /* Created. */
        STOPPED         = 2, /* Fully created, not started. */
        STARTED         = 3, /* Created and started, not resumed. */
        ATTACHED        = 4, /* The page has attached to the window. */
        RESUMED         = 5; /* Created started and resumed. */
    
    function _state_to_string(state) {
        switch ( state ) {
            default:    return 'INVALID_STATE';
                
            case 0:     return 'INITIALIZING';
            case 1:     return 'CREATED';
            case 2:     return 'STOPPED';
            case 3:     return 'STARTED';
            case 4:     return 'ATTACHED';
            case 5:     return 'RESUMED';
        }
    }

    /**
     * 变更 page 状态(从当前状态到指定的状态)。
     *
     * @param page
     * @param new_state
     * @private
     */
    function _move_to_state(page, new_state) {
        //console.log( 'move_to_state: page = %s, state = %s, new_state = %s',
        //    page[ _ID ],
        //    _state_to_string( page[ _STATE_ ] ),
        //    _state_to_string( new_state ) );
        
        if ( ! ( _STATE_ in page ) ) {
            page[ _STATE_ ] = INVALID_STATE;
        }

        /* 正向周期 */
        if ( page[ _STATE_ ] < new_state ) {
            if ( INVALID_STATE === page[ _STATE_ ] )
                page[ _STATE_ ] = INITIALIZING;
            
            switch ( page[ _STATE_ ] ) {
                case INITIALIZING:
                    _invoke_handler( page, _CREATE );
                case CREATED:
                    if ( new_state > CREATED ) {
                        /* 若有后置 reload  */
                        page[ _FLAG_POST_RELOAD ] && ( page[ _FLAG_POST_RELOAD ] = !! 0 );
                        /* 重置 called flag */
                        page[ _RENDER_CALLED_ ] = !! 0;

                        _invoke_handler( page, _CREATE_VIEW );

                        if ( ! page[ _RENDER_CALLED_ ] && page[ _HTML ] )
                            _invoke_render( page, { html: page[_HTML] } );

                        if ( ! page[ _RENDER_CALLED_ ] ) {
                            _invoke_render( page, { url: _build_url_for_render( page ) } );
                        }
                    }
                case ATTACHED:
                case STOPPED:
                    if ( new_state > STOPPED )
                        _invoke_handler( page, _START );
                case STARTED:
                    if ( new_state > STARTED ) {
                        /* XXX(XCL): DOM 节点, 如果为祖先级实例则该 DOM 只会被用于 clone */
                        /*(frag[ _EL_ ] = {})[ _LAYOUT_ ] = layout[ 0 ];*/
    
                        if ( is_sandbox_mode() ) {
                            if ( _has_page_content( page ) )
                                restore_page_elements.call( page );
                        } else {
                            /* 用于容纳 page 内容 */
                            var layout;
        
                            if ( _has_layout_id( page ) ) {
                                layout = get_layout.call( page );
                            } else {
                                layout = _FRAGMENT_TEMPLATE.clone();
            
                                /* 设置 layout id */
                                _set_up_layout_id( page, layout );
            
                                layout.appendTo( $x._viewport );
                            }
        
                            layout.css( 'z-index', page[ _STACK_INDEX_ ] );
                        }
    
                        _invoke_handler( page, _ATTACH );
                        
                        /* ------------------------------------------------- */
                        
                        _exec_pending_actions( page );
    
                        /* 更新 title */
                        _trigger_update_title( page[ _TITLE ] || $Page.title );
    
                        _invoke_handler( page, _RESUME );
    
                        /**
                         * FIXME(XCL): 未知原因 scroller 无法滚动，这里 refresh
                         *             可暂时解决
                         */
                        _update_scroller_enabled( page[ _SCROLLER ], true );
                    }
            }
        }
        /* 逆向周期 */
        else if ( page[ _STATE_ ] > new_state ) {
            switch ( page[ _STATE_ ] ) {
                case RESUMED:
                    if ( new_state < RESUMED ) {
                        _update_scroller_enabled( page[ _SCROLLER ], false );
    
                        _invoke_handler( page, _PAUSE );
    
                        /* ------------------------------------------------- */

                        page[ _SCROLL_POSITION_Y_ ] = _obtain_scroll_position_y();
    
                        _invoke_handler( page, _DETACH );

                        save_page_elements.call( page,
                            collect_current_page_elements().remove() );
                    }
                case ATTACHED:
                    if ( new_state < ATTACHED )
                        _invoke_handler( page, _STOP );
                case STARTED:
                case STOPPED:
                    if ( new_state < STOPPED)
                        _invoke_handler( page, _DESTROY_VIEW );
                case CREATED:
                    if ( new_state < CREATED )
                        _invoke_handler( page, _DESTROY );
            }
        }
        
        /* Store the new state */
        page[ _STATE_ ] = new_state;
    }

    function trigger_events() {}
    
    /**
     * 调用 page 指定的 handler。
     *
     * @param page context
     * @param fn string OR array
     * @private
     */
    function _invoke_handler(page, fn) {
        var ordered_handlers    = $.isArray( fn ) ? fn : [ fn ];
        var registered_handlers = _get_handlers( page ),
            handler_name;
                
        if ( ! registered_handlers )
            return;
        
        for ( var idx in ordered_handlers ) {
            handler_name = METHOD_HANDLERS_MAPPING[ ordered_handlers[ idx ] ];
    
            handler_name in registered_handlers
                && registered_handlers[ handler_name ]
                    .apply( page, 3 in arguments ? arguments.slice( 2 ) : [] );
        }
    }
    
    /* 设置一个后置 reload Task. */
    function _set_up_post_reload(page) {
        page[ _FLAG_POST_RELOAD ] = !! 1;
    }
    
    /**
     * 调用指定的 handler 以多实例模式。
     *
     * @param page
     * @param handler_name
     * @private
     */
    function _invoke_handler_with_share_mode(page, handler_name) {
        var registered_handlers = _get_handlers( page );
    
        registered_handlers
            && handler_name in registered_handlers
            && registered_handlers[ handler_name ]
                .apply( page, 3 in arguments ? arguments.slice( 2 ) : [] );
    }

    /**
     * 获取指定 page 的 callback(s).
     *
     * @param page
     * @returns {map}
     * @private
     */
    function _get_handlers(page) {
        return _handlers[ _get_id_for_handlers( page ) ];
    }

    /* --------------------------------------------------------------------- */

    /**
     * 是否强制 Render 哪怕 View 不可见.
     *
     * @type {boolean}
     * @private
     */
    var _force_render = !! 0;

    function _invoke_render(page, data) {
        page.render( data );
    }

    /**
     * 开始 render.
     * @private
     */
    function pre_render() {
        _invoke_render_handler( this, _PRERENDER_HANDLER );
    }
    
    /**
     * Render 操作已交付至浏览器.
     * @private
     */
    function rendered() {
        _invoke_render_handler( this, _RENDERING_HANDLER );
        _fix_scroll( this );
        _invoke_render_handler( this, _RENDERED_HANDLER );
    }

    /* FIXME(XCL): Fix scroll problem when you work with iScroll. */
    function _fix_scroll(page) {
        var container = page.getContainer();
        var scroll_dom = $( '.page-scroller', container );

        if ( scroll_dom.length ) {
            var scrolls = [];
            
            var options = {
                probeType:      3,
                mouseWheel:     true,
                /* FIXME(XCL): 启用 bounce 在 UC 环境会导致 Header 或 tooter 不可见 */
                bounce:         false,
                click:          true,
                /*eventPassthrough: false,
                scrollX:        true,
                scrollY:        true,
                preventDefault: false*/
                /* FIXME(XCL): 解决 form field 在获取 focus 后，点击任意元素都会唤出键盘的问题
                preventDefault: xfly.os.ios || false,*/
                keyBindings:    true
            };
            
            scroll_dom
                .each( function ( idx, dom ) {
                    var self = $( this );
                    var wrapper = self.parent( '.page-scroll-wrapper' );
                    
                    if ( ! wrapper.length ) {
                        wrapper = self
                            .wrap( '<div class="page-scroll-wrapper"></div>' )
                            .parent( '.page-scroll-wrapper' );
                    }
                    
                    scrolls.push( new IScroll( wrapper[ 0 ], options ) );
            } );
    
            page[ _SCROLLER ] = scrolls;
        }
    }

    function _invoke_render_handler(page, handler) {
        /* 目前针对多实例 page 我们采用的是 handler 共享机制 */
        var handlers = _get_handlers( page );

        handlers
            && handler in handlers
                && handlers[ handler ]
                    .call( page, get_layout.call( page ) );
    }

    /**
     * 获取 page 的容器.
     *
     * @returns {HtmlElement}
     */
    function get_container() {
        return get_layout.call( this )[ 0 ];
    }
    
    /**
     * 是否有 Content(Inner view).
     *
     * @param page
     * @returns {boolean}
     * @private
     */
    function _has_page_content(page) {
        if ( is_sandbox_mode() ) {
            var layout_id = get_layout_id.call( page );
            
            /* NOTE(XCL): 值为 undefined 时, 标识 page 的内容已通过网络加载完成. */
            return layout_id && layout_id in _sandbox_dom_container;
        } else {
            var layout = get_layout.call( page );
            return layout.length && layout[ 0 ].parentNode && '' !== layout.html();
        }
    }

    /**
     * 返回 page 容器, 这是一个 ZeptoCollection 类型的数据.
     *
     * NOTE(XCL): Not applied on Sandbox mode;
     *
     * @returns {ZeptoCollection}
     */
    function get_layout() {
        return $( '#x_f' + this[ _EL_ ][ _LAYOUT_ID_ ] );
    }
    
    /**
     * 获取 layout id。
     *
     * @returns {string}
     */
    function get_layout_id() {
        return this[ _EL_ ]
            && this[ _EL_ ][ _LAYOUT_ID_ ]
            && String( this[ _EL_ ][ _LAYOUT_ID_ ] );
    }
    
    /* TODO(XCL): Just dumping some state or data Of the page(s)... */
    /*win.dump = function () { console.dir( _sandbox_dom_container ); };*/
    
    /**
     * 为 page 设置唯一的 DOM ID。
     *
     * @param page
     * @param layout
     * @private
     */
    function _set_up_layout_id(page, layout) {
        var id = page[ _ID ];
        
        var instance_id;    /* 单实例即指 id 本身 */
        var layout_id;
        
        instance_id = _is_support_multi_instance( id )
            ? _calculate_derive_key( id, page[ _ROUTE_ARGS ] )
            : id;
        
        layout_id = hash_code( instance_id );
        
        /* 为 DOM 设置 id */
        if ( ! is_sandbox_mode() )
            layout.attr( 'id', 'x_f' + layout_id );
        
        page[ _EL_ ][ _LAYOUT_ID_ ] = layout_id;
        
        /* XXX(XCL):添加一个元素, 仅标识 page 内容已经加载完成 */
        _sandbox_dom_container[ layout_id ] = void 0;
    }
    
    function _has_layout_id(page) {
        return page[ _EL_ ] && page[ _EL_ ][ _LAYOUT_ID_ ];
    }

    /**
     * 退回上一级并销毁自身, 如果当前 view 为根级, 则不会执行该操作并返回 false.
     *
     * @returns {boolean}
     */
    function finish() {
        if ( ! can_back() )
            return !! 0;

        if ( is_sandbox_mode() ) {
            var back_before = _current;

            back();
            _schedule_destroy( back_before );
        } else {
            _schedule_destroy( _current );
            back();
        }

        return !! 1;
    }

    function _finish_and_go(id, args) {
        if ( _has_page_trans_in_processing() )
            return;

        /* TODO: current -> update hash direct */
        if ( _exist( id ) ) {
            if ( args ) {
                _override_args( id, args );
                _perform_finish_and_go.call( _get_page( id ) );
            }
        }
    }

    function _perform_finish_and_go() {
        /* hide current */
        /* show next */

        /* destroy current */
        /* pop current */

        var current = _current,
            next    = this,

            /* 是否有默认 view(Stack-based) */
            first   = ! _has_page(),
            /* 要前往的 page */
            layout  = get_layout.call( next );

        /* 是否在操作本身 */
        if ( first || current && next == current )
            $x.throwNiyError();

        _begin_trans();

        _cas_stack_if_necessary( current, next );

        /* 暂停当前 page */
        _move_to_state( current, STARTED );
        /* 隐藏当前 page */
        _hide( current, _FROM_STACK_YES, /*firer*/1 );

        /* FIXME(XCL): 不管是否被暂停这里绝对执行恢复操作 */
        _move_to_state( next, RESUMED );

        /* 呈现下一个 page */
        _show( next, /*_TRANSITION_SLIDE, */_FROM_STACK_NO );

        /* 销毁 current */
        current && _schedule_destroy( current );

        _current = next;

        /* 更新至 location.hash */
        _apply_hash( _current );

        ALWAYS_POST_COMMIT_ON_BACK || _end_trans();
    }

    /**
     * 设置当前 title.
     *
     * @param title
     */
    function set_title(title) {
        document.title = title;
    }

    function _trigger_update_title(title) {
        set_title( title );
    }

    function _is_in_back_stack() {}

    function _has_page_trans_in_processing() {
        return _in_transaction_;
    }

    /**
     * 是否可以进行后退操作.
     *
     * @returns {boolean}
     */
    function can_back() {
        return ! _has_page_trans_in_processing() && _has_back_stack_records();
    }

    /**
     * 是否 Back stack 中有记录.
     *
     * @returns {boolean}
     * @private
     */
    function _has_back_stack_records() {
        return 0 in _back_stack;
    }

    /* 标识操作从 URI 触发 */
    var _OP_FROM_URI = 1;

    /**
     * 请求进行后退操作, 如果 BackStack 有可用的记录.
     */
    function back(from_uri/* allowUpToHome */) {
        /*console.log("InProcessing %s, fromUri %s, backStack %s",
            _hasPageTransInProcessing(), fromUri, _hasBackStackRecords() );*/

        /*if ( ! canBack() )*/
        if ( _has_page_trans_in_processing() )
            return;

        /* FIXME(XCL): 目前暂时处理从 URI 触发的 Navigate up 操作 */
        if ( from_uri && ! _has_back_stack_records() && _config['home'] ) {
            _navigate_up_to( _config.home );
            return;
        }

        /* 暂时用 History API */
        history.go( from_uri ? _MAGIC_BACK_FIRER : _STANDARD_BACK );
        /* _performBack() */
    }

    /**
     * 以 Backward 形式切到指定的 page.
     *
     * @param up 这个即指当前 page 定义的 parent, 如果没有指定则使用默认的 home
     * @private
     */
    var/*function*/ _navigate_up_to = _perform_navigate_up_to;/*(up) {
        _performNavigateUpTo(up)
    }*/

    function _perform_navigate_up_to(up) {
        _perform_go.call( _get_page( up ), /*fromUri*/1, /*animation*/fx.slide, /*reverse*/1 );
    }

    /* --------------------------------------------------------------------- */

    /**
     * To render using the html snippet(Mean: Inner view).
     *
     * @param data
     * @private
     */
    function _render_with_html(data) {
        /* 通知更新 Content loaded 标识 */
        _notify_content_was_loaded( this );
    
        /* TODO(XCL): 如果 DOM 没有附载到 Document 则需要添加至其中... */
        if ( is_sandbox_mode() ) {
            /*var is_first_page = $.isEmptyObject( _sandbox_dom_container );*/
            
            _set_up_layout_id( this );

            /*if ( ! is_first_page ) {*/
            /* 是否为当前 Page, 是当前则更新，反则放置于 Sandbox 容器 */
            if ( _current == void 0                 /* First booting */
                || INITIALIZING == this[ _STATE_ ]  /* Rendering with static html OR onCreateView */
                || _current == this ) {             /* Reloading */
                /* 对于 reload 模式，需将现有 View 移除 */
                if ( data[ 'reload' ] )
                    $x._viewport.children( '.page-ui' ).remove();

                $x._viewport.append( data[ _HTML ] );
            } else {
                /* NOTE(XCL): 这里放置的为 Raw HTML。 */
                _sandbox_dom_container[ get_layout_id.call( this ) ] = data[ _HTML ];
            }
            /*}*/
        } else {
            get_layout.call( this ).html( data[ _HTML ] );
        }
    }

    /**
     * 试图从远程服务上获取 View 内容.
     *
     * @param data
     * @private
     */
    function _render_with_url(data) {
        var target = this;

        $x.get( data[ _URL ], function(response) {
            var reload_flag = data[ 'reload' ] || 0;
            
            /* 填充 HTML 片段 */
            (data = {})[ _HTML ] = response;
            
            data.reload = reload_flag;

            _invoke_render( target, data );
        } );
    }

    function _apply_new_args(page) {
        /* TODO(XCL): 是否需要 new_state */
        if ( history_api_supported ) {
            history.replaceState(
                _new_state(),
                page[ _TITLE ],
                _build_url_for_render( page )
            );
        }
    }

    /* TODO: */
    var _apply_hash = _sync_hash_to_browser;

    /**
     * 构建一个 hash 串用于更新至浏览器
     *
     * @param page
     * @returns {string}
     * @private
     */
    function _build_special_hash_by_page(page) {
        var fragSpec = {};

        fragSpec[ _ROUTE ]      = page[ _ROUTE ];
        fragSpec[ _ROUTE_ARGS ] = page[ _ROUTE_ARGS ];

        return _build_special_hash( fragSpec );
    }

    /* Note: Used for Hash mode */
    function _build_special_hash(frag_spec) {
        /* #!id:args */
        var x = [ _FRAGMENT_HASH_STRIPPER, frag_spec[ _ROUTE ] ];

        if ( frag_spec[ _ROUTE_ARGS ] ) {
            x.push( _ARG_STRIPPER );
            x.push( _args_urlify( frag_spec[ _ROUTE_ARGS ] ) );
        }

        return x.join( '' );
    }

    function _sync_hash_to_browser(page) {
        location.hash = _build_special_hash_by_page( page );
    }

    /* TODO(XCL): Renaming the fn name to forward */
    /**
     * 进行 page 切换操作.
     *
     * @param {string} id 指定 page 的 id
     * @param {Map} args 参数(optional)
     * @param {boolean} from_uri 是否从 uri 触发(optional)
     * @param {string} animation 切换效果(optional)
     * @private
     */
    function _request_go(id, args, from_uri, /* fromUser, zIndex, */animation) {
        if ( _has_page_trans_in_processing() ) {
            _postpone_page_for_trans_end( id, args, from_uri, animation );

            return;
        }

        if ( ! _exist( id ) ) {
            if ( _config[ _CFG_LAZY_MODE_ENABLED ] ) {
                _setup_pending_page( id, args, from_uri, animation );
            }

            return;
        }
        
        /* id, args, ?, ? */
        if ( isPlainObject( args ) ) {
            _override_args( id, args );
        }
        /* id, animation */
        else if ( isString( args ) ) {
            animation   = args;
            from_uri    = args = void 0;
        }
        /* id, ?, ? */
        else if ( $x.isUndefined( args ) ) {
            /**
             * animation   = from_uri;
             * fromUri     = args;
             * args        = void 0;
             */
        }

        /* id, args, animation */
        if ( isString( from_uri ) ) {
            animation   = from_uri;
            from_uri    = void 0;
        }

        if ( _is_support_multi_instance( id ) )
            _go_next_with_multi_mode( id, args, /*from_user*/0, from_uri, animation );
        else
            _go_next( id, args, /*from_user*/0, from_uri, animation );
    }

    /**
     * TODO(XCL): 暂时未实现多实例 reload.
     *
     * @param id
     * @param args
     * @private
     */
    function _reload(id, args) {
        _exist( id ) && _trigger_reload( _get_page( id ), args );
    }

    /* --------------------------------------------------------------------- */

    /* TODO(XCL): */
    function check_runtime() {
        /* Object.keys && onhashchange && onpopstate && JSON && more... */
    }

    function sort(args) {
        var ordered = void 0;
        var keys    = Object.keys( args );

        if ( ! (0 in keys) ) {
            throw new Error( "Args can't be null#" + args );
        }

        ordered = {};

        keys.sort().forEach( function(key) {
            ordered[ key ] = args[ key ];
        } );

        return ordered;
    }

    /**
     * 计算 string 的 hashcode.
     *
     * 参考:
     * http://web.archive.org/web/20130703081745/http://www.cogs.susx.ac.uk/courses/dats/notes/html/node114.html
     * @param str
     * @returns {number}
     */
    function hash_code(str) {
        var hash = 0;

        if ( ! (0 ^ str.length) )
            return hash;

        var idx;

        for ( idx = 0; idx < str.length; idx++ ) {
            hash = 31 * hash + str.charCodeAt( idx );

            /* Convert to 32bit integer */
            hash |= 0;
        }

        return hash;
    }

    /**
     * 判断指定 page 是否支持多实例.
     *
     * @param id
     * @returns {boolean}
     * @private
     */
    function _is_support_multi_instance(id) {
        /* derive */
        return !! _get_page( id )[ _MULTIPLE_INSTANCES ];
    }

    /**
     * 是否为派生的 page.
     *
     * @param {Page} page
     * @returns {boolean}
     * @private
     */
    function _is_derive(page) {
        return page
            /*&& _DERIVE_ID_ in page*/
            && page[ _DERIVE_ID_ ];
    }
    
    /**
     * { key: 'value' } => key=value
     *
     * @param args
     * @returns {string}
     * @private
     */
    function _flatten_args(args) {
        try {
            return $x.stringify( sort( args ) );
        } catch (ignored) {
            return void 0;
        }
    }

    function _calculate_derive_key(id, args) {
        var flattenedArgs = _flatten_args( args );

        if ( ! flattenedArgs )
            return id;

        return [ id, _DERIVE_DELIMITER, hash_code( flattenedArgs ) ].join( '' );
    }

    /**
     * 用于间隔实例 hash.
     *
     * @type {string}
     * @private
     */
    var _DERIVE_DELIMITER = "#";

    /* --------------------------------------------------------------------- */

    /* 标识是否正在进行界面切换 */
    var _in_transaction_ = !! 0,

        /* 记录开始切换界面的时间 */
        _trans_tag_stamp;

    /* 标识永远后置提交事务 */
    var ALWAYS_POST_COMMIT_ON_BACK = !! 1;

    function _begin_trans() {
        _in_transaction_ || (_in_transaction_ = !! 1);
    }

    function _end_trans() {
        /* FIXME(XCL): 这里绝对解释无论是否已处于锁态 */
        _in_transaction_ = !! 0;
    
        _settle_delayed_page_if_necessary();

        _on_trans_ended();
    }

    function _dump_trans(tag) {
        /*if ( 'Begin' == tag ) {
            _trans_tag_stamp = 'trans-' + ( new Date() ).getTime();
            console.time( _trans_tag_stamp );
            console.log("Dump-Trans: %s %s at ", tag, _in_transaction_, _trans_tag_stamp);
        } else if ( 'End' == tag ) {
            console.log("Dump-Trans: %s %s", tag, _in_transaction_);
            console.timeEnd(_trans_tag_stamp)
        } else {
            console.log("Dump-Trans: %s %s", tag, _in_transaction_);
        }*/
    }

    /**
     * 构建一个 animation-name 用于效果呈现, 如 page-slide-enter.
     *
     * @param {string} fx
     * @param {boolean} forward
     * @param {boolean} rear
     * @returns {string}
     * @private
     */
    function _build_animation_name(fx, forward, rear) {
        var key = [ 'page-', fx, '-' ];

        /* 是否应用于 back stack */
        if ( forward ) {
            key.push( rear ? 'pop-exit' : 'enter'       );
        } else {
            key.push( rear ? 'exit'     : 'pop-enter'   );
        }

        return key.join( '' );
    }

    /**
     * 分解 fx, 如果正确则返回, 反则返回默认值.
     *
     * @param fx
     * @returns {string}
     * @private
     */
    function _resolve_fx(fx) {
        return fx && fx in win.fx ? fx : win.fx.slide;
    }

    /**
     * 是否没有切换效果?
     *
     * @param transition
     * @returns {boolean}
     * @private
     */
    function _is_transition_none(transition) {
        return _TRANSITION_UNSET === transition;
    }

    function _build_transition(fx, forward) {
        /* enter, popExit, popEnter, exit */
        if ( ! $x.isString( fx ) )
            return _TRANSITION_NONE;

        var scheme = _transits[ _resolve_fx( fx ) ];

        /**
         *              front        rear
         * ---------------------------------
         * forward:     enter    <-> popExit
         * backward:    popEnter <-> exit
         */
        var checkRear  = forward ? 'popExit' : 'exit',
            checkFront = forward ? 'enter'   : 'popEnter';

        var rear  = scheme[checkRear ] && _build_animation_name( fx, forward, 1 );
        var front = scheme[checkFront] && _build_animation_name( fx, forward, 0 );

        return {
            rear:   rear,
            front:  front,
            ease:   scheme['ease'] || $x.cubic_bezier
        };
    }

    function _check() {}

    /**
     * notifyContentWasLoaded
     * did content loaded
     * onAnimationEnd
     * onBeforePageChange
     * onAfterPageChange
     * hasContent
     */

    /**
     * 配置 page 全局事件 listener.
     *
     * @type {Map}
     * @private
     */
    var _config = {
        /**
         * paths: {
         *      'activity**': '/activity/'
         * }
         */

        /**
         * 标识是否支持 lazy 加载模式(默认不启用)
         * lazyModeEnabled:                 !! 0,
         */

        /**
         * 默认的 Home id
         * home:                           void 0,

         * onBeforePageChange:             void 0,
         * onAfterPageChange:              void 0,
         * onCurrentlyPageContentLoaded:   void 0
         */
    };

    /**
     * 我们使用嵌套数组来存储 patterns 及对应的 bast_path, 用于对资源加载路径进行区分.
     * @type {Array}
     */
    var _path_patterns;
    var _global_lazy_page_version_code;

    function _resolve_configs() {
        if ( ! _config )
            return;

        /* 如果启用 lazy mode 则对 paths 进行解析 */
        if ( _config[ _CFG_LAZY_MODE_ENABLED ] && _config['paths'] ) {
            var paths = _config.paths;
            var pattern;

            _path_patterns = [];

            /**
             * Wildcards:
             * activity**   =>  /^activity(w|d|.)+/g
             */
            Object.keys( paths ).forEach( function(key) {
                pattern = key;

                /* 将通配符转换为表达式(Wildcards => Expression) */
                ( -1 ^ pattern.indexOf('**') )
                    && ( pattern = pattern.replace('**', '(w|d|.)') );

                _path_patterns.push( [
                    new RegExp( '^' + pattern + '+' ),
                    paths[ key ]
                ] );
            } );
            
            _global_lazy_page_version_code = _config[ 'lazyPageVerCode' ];
        }
    }

    /**
     * 为 $Page 配置全局的 listener 及属性.
     *
     * @param {Map} new_config
     */
    function config(new_config) {
        _config = new_config;

        _resolve_configs();
    }

    /* 用于填补什么都不做的 callback/fn */
    var noop = $x.noop;

    /**
     * page 切换之前.
     *
     * @param {Page} currently
     * @param {Page} upcoming
     * @private
     */
    function _on_before_page_change(currently, upcoming) {
        (_config['onBeforePageChange'] || noop)( currently, upcoming );
    }

    /**
     * page 切换之后.
     *
     * @param {Page} older
     * @param {Page} currently
     * @private
     */
    function _on_after_page_change(older, currently) {
        (_config['onAfterPageChange'] || noop)( older, currently );
    }

    /**
     * 当前 page 加载完成后调用.
     *
     * @private
     */
    function _on_current_page_content_loaded() {
        (_config['onCurrentPageContentLoaded'] || noop)();
    }

    function _dispatch_event(event) {}

    function _build_event() {}

    /**
     * 执行 Go 操作.
     *
     * @param {boolean} from_uri 默认是通过 $Page.go 来调用.
     * @param {string} animation
     * @param {boolean} reverse 标识是否执行反向的切换效果, 如果下一个即将呈现的 page
     *                  支持 animation
     * @private
     */
    function _perform_go(from_uri, animation, reverse) {
        var current         = _current,         /* 当前 page, 也旨即将隐藏的 */
            is_first_page   = ! _has_page(),    /* 是否有默认 view(Stack-based) */
            next            = this;             /* 要前往的 page */
    
        var transit,
            postpone_commit_trans = 0;            /* 标识是否为后置结束事务 */
            
        /* ------------------------------------------------------------------ */

        /* 是否在操作本身 */
        if ( current && next === current )
            return;
    
        /* 标识即将呈现的 Page 实例已初始化 */
        _mark_was_instantiated( next );

        /* Dispatching the page change before event */
        _on_before_page_change( current, next );

        var fire_after_page_change_event = function() {
            _on_after_page_change( current, next );
        };

        /**
         * 关于切换效果:
         * 0: 首个 page 不应该被加载动画;
         * 1: override 优先;
         * 2: 其次是 Front page 的 animation 定义;
         * 3: 默认的(slide);
         */
        if ( is_first_page ) {
            transit = _build_transition( _TRANSIT_NONE );

            /* 不启用动画, hidden 后也就无需 endTrans */
            postpone_commit_trans = 0;
        } else {
            if ( animation ) {
                animation = _resolve_fx( animation );
                /* XXX(XCL): Remember the animation of overridden */
                /*next[ _OVERRIDDEN_ANIMATION ] = animation;*/
            } else {
                animation = _get_animation( next );
            }

            transit = _build_transition( animation,
                                        reverse
                                            ? _BACKWARD
                                            : _FORWARD
                                        );
            
            postpone_commit_trans = !! transit.rear;
        }

        /* 是否启用动画(首个 page 不应该被加载动画) */
        /* $x.isUndefined( transit ) && (transit = ! first); */

        _begin_trans();

        /**
         * hide -> rear
         * show -> front
         * 应用 animation 时亦是如此
         */
        is_sandbox_mode() || _cas_stack_if_necessary(
            reverse ? next    : current,
            reverse ? current : next
        );
    
        /* onVisibilityChanged */

        if ( is_sandbox_mode() ) {
            /* 隐藏当前 page */
            if ( current )
                _move_to_state( current, STARTED );
        } else {
            _move_to_state( next, RESUMED );

            /* 隐藏当前 page */
            if ( current ) {
                _move_to_state( current, STARTED );

                _hide(
                    current /*, _FROM_STACK_YES, end_trans_needed */,
                    transit,
                    fire_after_page_change_event
                );
            }
        }

        /* FIXME(XCL): 不管是否被暂停这里绝对执行恢复操作 */
        _move_to_state( next, RESUMED );

        /* 呈现下一个 page */
        _show( next, transit/*, _FROM_STACK_NO*/ );

        /* 加入 BackStack */
        if ( current && ! is_first_page ) {
            /**
             * if ( is_sandbox_mode() && session_storage_supported ) {
             *   var state = _new_state();
             *
             *   state.href = location.href;
             *   ss.setItem( SESSION_CURRENT_STATE, JSON.stringify( state ) );
             * }
             */
            
            _add_to_back_stack( current, animation );
            
            /* TODO(XCL): 混合模式处理 */
            /* history_api_supported && _setup_current_state( next, fromUri ); */
        } else {
            /* history_api_supported && _setup_initial_state( next, fromUri ); */
        }

        _current = next;
        
        /* 更新 location */
        _update_location( _FORWARD, _current );

        /**
         * 如果 trans 为后置提交, 那么这里将不在处理, 注意 Rear 与 Front 效果呈现时序
         * 有可能不一致.
         */
        if ( is_sandbox_mode() || ! postpone_commit_trans ) {
            /* 标识 trans 完成 */
            _end_trans();

            /* 触发 onAfterPageChange 事件 */
            fire_after_page_change_event();
        }
        
        /*postCommitTrans || _endTrans();*/
    }

    function _setup_current_state(target, from_uri) {
        var state   = _new_state(),
            title   = target[ _TITLE ],
            hash    = _build_special_hash_by_page( target );

        if ( from_uri )
            history.replaceState( state, title, hash );
        else
            _push_state( state, title, hash );

         _current_state = state;
    }

    function _setup_initial_state(/* page */initial, from_uri) {
        var state               = {};
            state[ _BSR_IDX ]   = _FIRST_STATE;

        /**
         * Chrome 45 (Version 45.0.2454.85 m) started throwing an error,
         * Uncaught SecurityError: Failed to execute 'replaceState' on
         * 'History': A history state object with URL
         * 'file:///usr/local/page.html#p=v' cannot be created in a document
         * with origin 'null'.
         * Ref(Axure)
         */
        /* TODO(XCL): We should use window.location.replace to fix that the
                      browser doesn't support state replace issue. */
        history.replaceState(
            state,
            initial[ _TITLE ],
            _build_special_hash_by_page( initial )
        );

        _current_state = state/*history.state*/;
    }

    /**
     * 获取用于 page 的切换效果, 优先取 Overridden 之后的 animation, 如果没有则取其
     * 自身定义的, 再者取返回默认值.
     *
     * @param page
     * @returns {string}
     * @private
     */
    function _get_animation(page) {
        /*var fx;

        if ( _OVERRIDDEN_ANIMATION in page ) {
            fx = page[ _OVERRIDDEN_ANIMATION ];
            delete page[ _OVERRIDDEN_ANIMATION ];
        }*/
        if ( /*fx || */! (_ANIMATION in page) )
            return fx.slide;

        return page[ _ANIMATION ];
    }

    /**
     * 执行后退操作.
     *
     * @param animation (string)
     * @private
     */
    function _perform_back(animation) {
        if ( ! can_back() )
            return;

        /* 当前 page, 也旨即将隐藏的 */
        var current = _current,
            next;

        /* Back stack record */
        var bsr     = _pop_back_stack();
            next    = _get_page( bsr[ _BACK_STACK_TARGET_ID ] );

        /* Dispatching the page change before event */
        _on_before_page_change( current, next );

        var fire_page_change_after_event = function() {
            _on_after_page_change( current, next );
        };

        /**
         * 切换效果
         * rear: page-exit, front: page-pop-enter
         */
        animation = _OVERRIDDEN_ANIMATION in bsr
                        ? bsr[ _OVERRIDDEN_ANIMATION ]
                        : _get_animation( current );

        var transit                 = _build_transition( animation, _BACKWARD ),
            /* 标识是否为后置结束事务 */
            postpone_commit_trans   = !! transit.rear;

        _begin_trans();

        /* FIXME(XCL): 后退操作这里的 stack 是个例外, 即将呈现的不能置于量上层 */
        is_sandbox_mode() || _cas_stack_if_necessary( next, current );

        /* Step 1: 暂停当前的 page */
        _move_to_state( current, STARTED );
    
        /* 隐藏当前 page */
        is_sandbox_mode() || _hide( current, transit
            /* _FROM_STACK_NO, */ /* endTransNeeded */ /* 1 */,
            fire_page_change_after_event );

        /* Step 2: 恢复 get back 的目标 */
        _move_to_state( next, RESUMED );

        /* 呈现下一个 page */
        _show( next, transit/*_TRANSITION_SLIDE, _FROM_STACK_YES*/ );

        _current = next;

        /* Step 3: 支持 history 则不需要手动更新 hash */
        _update_location( _BACKWARD, _current );

        if ( is_sandbox_mode || ! postpone_commit_trans ) {
            _end_trans();

            fire_page_change_after_event();
        }
        
        /*postponeCommitTrans*/ /*ALWAYS_POST_COMMIT_ON_BACK*/ /*|| _endTrans();*/

        /* TODO(XCL): 对于非 multitask 的后退操作, 如果在后退之前 args 被更新则需要同步 hash */
        if ( ! _is_derive( _current ) ) {
            var currentlyArgs = _extract_args( location.href );
            
            if ( ! _is_same_args( _current[ _ROUTE_ARGS ], currentlyArgs ) ) {
                _apply_new_args( _current );
            }

            /**
             * Used for hash mode.
             *
             * var currentlyArgs = _extract_args( location.hash );
             * if ( ! _is_same_args( next[ _ROUTE_ARGS ], currentlyArgs ) ) {
             *   _apply_hash( _current );
             * }
             */
        }
    }

    /**
     * TODO(XCL): 该 fn 未曾使用。
     * finish -> back && destroy
     */
    function _destroy(id) {
        var current = _current;
        var target  = _get_page( id );

        /* TODO: 不允许移除顶级 page */
        if ( current === target ) {
        }
    
        _invoke_handler( target, [ _STOP, _DESTROY_VIEW, _DESTROY, _DETACH ] );
        
        if ( is_sandbox_mode() ) {
            var layout_id = get_layout_id.call( target );
            
            _sandbox_dom_container[ layout_id ] = void 0;
            /* FIXME(XCL): 这里 delete 掉可能会导致 Page 加载两次(reload 被调用的前提下) */
            delete _sandbox_dom_container[ layout_id ];
        } else {
            /* DOM 移除 */
            get_layout.call( target ).remove();
        }

        target[ _EL_ ]              = {};
        target[ _RENDER_CALLED_ ]   = !! 0;
        
        /*delete _pages[ id ]*/
    }

    function _perform_destroy(id) {
        _exist( id ) && _destroy( id );
    }

    function _schedule_destroy(who) {
        var id = who[ _ID ];

        var trigger = 0;
        
        if ( ! is_sandbox_mode() ) {
            trigger = $.fx.speeds.slow * ( $.fx.off ? .2 : 1.2 )
                        /*$.fx.speeds.slow * 10 + 25*/;
        }

        /* 记录 task 以备意外清空下取消 */
        who['destroy_task_id'] = setTimeout( function() {
            _perform_destroy( id );
        }, trigger );
    }

    function _request_destroy(id) {}

    /* --------------------------------------------------------------------- */

    /* 标识是否有切换效果 */
    var _TRANSIT_YES    = !! 1;
    var _TRANSIT_NONE   = ! _TRANSIT_YES;

    function _make_animation_scheme(/* enter, popExit, popEnter, exit, ease */) {
        var ret;

        if ( 1 === arguments.length )
            return arguments[ 0 ];

        ret = {
            /* forward */
            enter:      arguments[ 0 ],
            popExit:    arguments[ 1 ],

            /* backward */
            popEnter:   arguments[ 2 ],
            exit:       arguments[ 3 ]
        };

        arguments[4] && (ret['ease'] = arguments[4]);

        return ret;
    }

    /**
     * 指定切换动作对应的4个环节是否需要
     * @type {{AnimationScheme}}
     * @private
     */
    var _transits = {};

    /* OPEN, CLOSE, FADE, SLIDE */
    var /*_TRANSITION_SLIDE   = 1,*/
        _TRANSITION_NONE    = 0,

        /* 进栈 或 出栈 */
        _FROM_STACK_YES     = 1,
        _FROM_STACK_NO      = 0;

    /* 制导方向(Forward OR Backward) */
    var _FORWARD            = 1,
        _BACKWARD           = _FORWARD - 1;

    /* 界面切换效果没设置 */
    var _TRANSITION_UNSET = {
        rear:   0,
        front:  0
    };

    function _show(target, transit/*, from_stack */) {
        var layout = get_layout.call( target );

        /* Show the dom */
        layout.show();

        transit.front
            &&
            layout.animate(
                transit.front,
                $.fx.speeds.slow,
                transit.ease/*$x.cubic_bezier*//*'linear'*/
            );

        /* 提取并执行触发器定义的操作 */
        _fire_trigger_if_necessary.call( target, 'show' );
    }

    function _fire_trigger_if_necessary(state) {
        /* 待触发的 trigger 队列 */
        var triggers = _extract_triggers( this[ _ID ], state );
        
        /* 没有与之关联的 trigger */
        if ( ! triggers )
            return;

        var idx,        /* 触发器队列索引 */
            trigger,    /* 具体的触发器   */
            action;     /* callback     */

        for ( idx in triggers ) {
            trigger = triggers  [ idx       ];
            action  = trigger   [ 'action'  ];

            /* 如果 action 为 fn 则直接执行 */
            $x.isFunction( action ) && ( action() );
        }
    }

    /**
     * 隐藏 page.
     *
     * @param target
     * @param transit 动画
     * @param firer 用于触发事件(optional)
     * @private
     */
    function _hide(target, transit, firer) {
        var layout = get_layout.call( target );

        if ( transit.rear ) {
            /* properties, duration, ease, callback, delay */
            layout.animate(
                transit.rear,
                $.fx.speeds.slow,
                transit.ease/*$x.cubic_bezier*//*'linear'*/,
                function () {
                    if ( ! is_sandbox_mode() )
                        layout.hide();

                    _end_trans();

                    firer && firer();
                }
            );
        } else {
            if ( ! is_sandbox_mode() )
                layout.hide();
        }
    }

    /* --------------------------------------------------------------------- */

    /* FIXME: 相同 hash 不同参数不列为一个新的 Back stack record. */
    var _back_stack = [];

    /**
     * 将 page 添加至 BackStack, 并返回 stack 的数量.
     * @param page
     * @param animation
     * @returns {BackStackRecord}
     * @private
     */
    function _add_to_back_stack(page, animation) {
        /**
         * var top    = _back_stack.length && _back_stack[ _back_stack - 1 ];
         * var at_top = top && top[ _STACK_INDEX_ ] == page[ _ID ];
        
         * if ( at_top ) {
         *   if ( ! _is_support_multi_instance( page[ _ID ] ) )
         *       return null;
         * }
         */
    
        return _push( page, animation );
    }

    function _push_state(state, title, url_or_hash) {
        state[ _SCROLL_POSITION_Y_ ] = _obtain_scroll_position_y();

        _persistent_state( state, title, url_or_hash );
    
        /* TODO(XCL): Session Or Local Storage */
        history.pushState( state, title, url_or_hash );
    }
    
    function _persistent_state_for_redirect(url) {
        _push_state( _new_state(), '', url )
    }

    var _PERSISTENT_STATE_SEPARATOR = ' ';

    /**
     * 首页无需 history.pushState
     *
     * @param state
     * @param title
     * @param url_or_hash
     * @private
     */
    function _persistent_state(state, title, url_or_hash) {
        if ( session_storage_supported ) {
            var stack_idx_for_persistent = persistent_session_stack_idx_offset++;
    
            ss.setItem( '#' + stack_idx_for_persistent,
                encodeURI( url_or_hash ) +      /* URL */
                _PERSISTENT_STATE_SEPARATOR +
                state[ _SCROLL_POSITION_Y_ ]    /* Y of Scroll position */
            );

            ss.setItem( SESSION_CURRENT_STATE, stack_idx_for_persistent );
    
            _scheduling_for_remove_eldest_state();
        }
    }
    
    /**
     * 最大保持的有效可后退的 History 记录。
     *
     * @type {number}
     * @const
     */
    var MAX_STATE_HISTORY_KEEP = 100;
    
    var check_state_timer;
    
    /**
     * 移除陈旧的 History 记录。
     *
     * @private
     */
    function _scheduling_for_remove_eldest_state() {
        if ( check_state_timer ) {
            check_state_timer = clearTimeout( check_state_timer );
        }
        
        check_state_timer = setTimeout( function () {
            check_state_timer = void 0;
            
            if ( ss.length / 2 > MAX_STATE_HISTORY_KEEP ) {
                var current_state_idx   = parseInt( ss.getItem( SESSION_CURRENT_STATE ) );
                var records             = [];
                
                for ( var key in ss ) {
                    if ( 0 === key.indexOf( '#') ) {
                        records.push( parseInt( key.substr( 1 ) ) );
                    }
                }
                
                records.sort( function ( a, b ) {
                    return b - a;
                } );
                
                var start_offset;
                for ( var idx = 0; idx < records.length; idx++ ) {
                    if ( current_state_idx === records[ idx ] ) {
                        start_offset = idx + MAX_STATE_HISTORY_KEEP;
    
                        if ( records.length <= start_offset ) {
                            return;
                        }
                        
                        break;
                    }
                }
                
                for ( var idx = start_offset; idx < records.length; idx++ ) {
                    ss.removeItem( '#' + records[ idx ] );
                }
            }
        }, 0 );
    }

    function _update_location(action, page) {
        if ( history_api_supported ) {
            if ( _BACKWARD !== action ) {
                _push_state(
                    _new_state(),
                    page[ _TITLE ],
                    _build_url_for_render( page )
                );
            }
        } else {
            /* 更新至 location.hash(此后 hash 将被变更) */
            _apply_hash( page );
        }
    }

    function _cas_stack_if_necessary(/* zepto */r, /* zepto */f) {
        if ( ! r )
            return;

        var back  = r[ _STACK_INDEX_ ],
            front = f[ _STACK_INDEX_ ];

        if ( front > back )
            return;

        front = front ^ back;
        back  = back ^ front;
        front = front ^ back;

        r[ _STACK_INDEX_ ] = back;
        f[ _STACK_INDEX_ ] = front;

        get_layout.call( r ).css( 'z-index', back );
        get_layout.call( f ).css( 'z-index', front );
    }

    /**
     * 取出上一个暂停的 page.
     *
     * @returns {page}
     * @private BackStackRecord
     */
    function _pop_back_stack() {
        return _pop();
    }

    function _push(page, animation) {
        var bsr = {};

        bsr[ _BACK_STACK_TARGET_ID ] = _get_id( page );

        /* XXX(XCL): Remember the animation of overridden */
        animation && (bsr[ _OVERRIDDEN_ANIMATION ] = animation);

        return _back_stack[ _back_stack.length ] = bsr;
    }

    function _pop() {
        return _back_stack.pop();
    }

    /* --------------------------------------------------------------------- */

    ///**
    // * page 被暂停.
    // *
    // * @param page
    // */
    //function pause(page) {
    //    _update_scroller_enabled( page[ _SCROLLER ], false );
    //
    //    _invoke_handler( page, _PAUSE );
    //}

    ///**
    // * page 被停止.
    // *
    // * @param page
    // */
    //function stop(page) {
    //    _invoke_handler( page, _STOP );
    //}

    //function destroy_view(page) {
    //    _invoke_handler( page, _DESTROY_VIEW );
    //}

    //function destroy(page) {
    //    _invoke_handler( page, _DESTROY );
    //}

    //function detach(page) {
    //    _invoke_handler( page, _DETACH );
    //    save_page_elements.call( page, collect_current_page_elements().remove() );
    //}

    /* --------------------------------------------------------------------- */

    function _resolve_requires(requires) {
        /* TODO(XCL): adv */
    }

    function _import_requires_if_necessary(requires) {
        /* TODO(XCL): adv */
    }

    function _settle_handlers(id, handlers) {
        var map = _handlers[ id ] = {};

        if ( isPlainObject( handlers ) ) {
            SUPPORTED_HANDLERS.forEach( function ( fn ) {
                (fn in handlers) && (map[ fn ] = handlers[ fn ]);
            } );
        }
    }

    function _build_derive(source_id, derive_id, args) {
        var derive = _copy_by_clone( _get_page( source_id ) );

        /* ----------------------------------------------------------------- */

        /* 对一个 page 开放的实例方法 */
        /*_bindMethods( derive );*/

        /* 派生的标识(用到标识唯一) */
        Object.defineProperty(
            derive,
            _DERIVE_ID_,
            { value: derive_id, writable: 0 }
        );

        /* 赋于新的 stack index, 实际上就是 z-index */
        derive[ _STACK_INDEX_ ] = _alloZIndex( $x.FRAGMENT );
        /* XXX: DOM 节点, 如果为祖先级实例则该 DOM 只会被用于 clone */
        derive[ _EL_ ] = {};
        /*(derive[ _EL_ ] = {})[ _LAYOUT_ ] = _FRAGMENT_TEMPLATE.clone()[ 0 ];*/

        /* To retain the arguments if present. */
        derive[ _ROUTE_ARGS ] = args;
    
        /**
         * 填充 HTML 片段，如果已指定该字段
         * if ( _HTML in derive ) {
         *   _invokeRender( derive );
         *   _renderWithHtml.call( derive, { html: derive[ _HTML ] } );
         * } else if ( _URL in derive ) {
         *   _invokeRender( derive );
         *   _renderWithUrl.call( derive, { url: derive[ _URL ] } );
         * }
         */

        /* 将 clone 的 page 放入容器 */
        _add( derive );

        return derive;
    }

    function _copy_by_clone(source) {
        var clone = new Page();

        /* Inherit: 处理依赖项 */
        /* Inherit: 处置 Handlers */

        /* Id 也复制但不使用 */
        _copy_if_exist( source, clone, _ID );

        /* 标题 */
        _copy_if_exist( source, clone, _TITLE );

        /* 解析后的 hash, xfly.ui.home -> xfly/ui/home */
        _copy_if_exist( source, clone, _ROUTE );

        /* 是否支持多实例, 如支持多实例则祖先仅终不会被添加至 DOM 中 */
        _copy_if_exist( source, clone, _MULTIPLE_INSTANCES );

        /* ----------------------------------------------------------------- */

        /* HTML 片段或 URL，如果已指定该字段 */
        if ( _HTML in source )
            clone[ _HTML ] = source[ _HTML ];
        else if ( _URL in source )
            clone[ _URL ] = source[ _URL ];

        return clone;
    }

    function _copy_if_exist(source, dest, key) {
        key in source && (dest[ key ] = source[ key ]);
    }

    /* ------------------------ Page class { ---------------------------- */

    /**
     * The Page model.
     *
     * @constructor
     */
    var Page = function() {
        /* Constructor */

        /* Attributes 容器 */
        this.attributes = {};
    };
    
    /* 为 page 实例开放的方法 */
    (function (/* Page.prototype */_) {
        /**
         * 填充内容, 可以传入 HTML 片段或 URL.
         *
         * { html: html }
         * { url: url, param: params }
         *
         * @param {object} data
         * @return {Page}
         */
        _.render = function (data) {
            /* TODO: URL 支持参数 */
            if ( _force_render && ! get_container.call( this ).parentNode )
                throw new Error( "You haven't call the show method with this page!" );

            var is_first_page = $.isEmptyObject( _sandbox_dom_container );
            
            /* To indicate the render is called */
            this[ _RENDER_CALLED_ ] = !! 1;

            /* 是否能够立刻请求进行 render 操作 */
            var immediate = is_first_page || data && _HTML in data;

            /* Before rendering */
            immediate && pre_render.call( this, data );

            /* Rendering */
            immediate
                ? _render_with_html.call( this, data )
                : ( _URL in data && _render_with_url.call( this, data ) );

            /* After rendered */
            immediate && rendered.call( this, data );
            
            return this;
        };

        /**
         * 设置当前 title, 注意不是所有的场景都支持,如: 微信.
         *
         * @param {string} title
         * @reture {Page}
         */
        _.setTitle = function (title) {
            set_title( title );
            
            return this;
        };

        /**
         * 当前 page 是否可见.
         *
         * @returns {boolean}
         */
        _.isVisible = function () {
            var layout = get_layout();
            
            return layout.length
                && isShowing( layout );
        };
    
        /**
         * 设置 Args。
         *
         * @param {Map} args
         * @returns {Page}
         */
        _.setArgs = function(args) {
            if ( isPlainObject( args ) ) {
                var merging = this.getArgs() || {} ;
                
                Object.keys( args ).forEach( function (key) {
                    merging[ key ] = args[ key ];
                } );
                
                _override_args( _get_id( this ), merging );
    
                if ( _current == this && history_api_supported ) {
                    history.replaceState(
                        history.state || _new_state(),     /* state */
                        this[ _TITLE ],                    /* title */
                        _build_url_for_render( this )      /* url */
                    );
                }
            }
         
            return this;
        };

        /**
         * 获取参数对儿.
         *
         * @returns {Map}
         */
        _.getArgs = function () {
            return this[ _ROUTE_ARGS ];
        };

        /**
         * 获取 page 的容器.
         *
         * @returns {HtmlElement}
         */
        _.getContainer = get_container;
    
        /**
         * 获取 page 的 Scroller 实例数组。
         *
         * @returns {Array}
         */
        _.getScrolls = function () {
            return this[ _SCROLLER ] || [];
        };

        /**
         * 返回一个标识, 标识是否没有内容被成功加载.
         *
         * @returns {boolean}
         */
        _.hasContent = function () {
            return this[ _FLAG_CONTENT_LOADED ];
        };
    
        /**
         * 请求进行 Reload 操作。
         *
         * @param {Map} [args]
         */
        _.reload = function (args) {
            _reload( this[ _ID ], args );
        };
    
        // TODO(XCL):
        _.runWithGlobalEach = $x.throwNiyError;
    
        /**
         * 执行 DOM find 操作于全局已加载的 Page。
         *
         * @param {string} selector
         * @returns {Zepton collection}
         */
        _.findInGlobal = function (selector) {
            /* 优先遍历当前 Page */
            var result_collection = $( selector );

            var z;
            var collection_of_page;
            
            Object.keys( _sandbox_dom_container ).forEach( function (key) {
                z = _sandbox_dom_container[ key ];
                
                if ( z ) {
                    collection_of_page = z.find( selector );

                    if ( collection_of_page.length )
                        result_collection = result_collection.concat(
                            collection_of_page );
                }
            } );
            
            return result_collection.length
                        ? $( result_collection )
                        : result_collection;
        };

        /**
         * 放置 key-value 对儿.
         *
         * @param {string} key
         * @param {*} value
         * @returns {Page}
         */
        _.put = function(key, value) {
            if ( null != key )
                this.attributes[key] = value;
            
            return this;
        };

        /**
         * 获取一个事先存入的 attr.
         *
         * @param {string} attr
         * @returns {*}
         */
        _.get = function(attr) {
            return this.attributes[ attr ];
        };

        /**
         * 判断指定的 attr 是否存在.
         *
         * @param {string} attr
         * @returns {boolean}
         */
        _.has = function(attr) {
            return null != this.get( attr );
        };

        /**
         * 移除指定的 attr.
         *
         * @param {string} attr
         * @returns {Page}
         */
        _.remove = function(attr) {
            if ( this.has( attr ) )
                delete this.attributes[ attr ];

            return this;
        };

        /**
         * 清空全部的 attributes.
         * @return {Page}
         */
        _.clear = function() {
            this.attributes = {};
            
            return this;
        };
    })(Page.prototype);

    /* ------------------------ Page class } ---------------------------- */

    function _is_new(frag) {
        return ! ( _ID in frag );
    }

    /* 指代将会在代码加载完成后 OR 某个特定事件结束后才呈现的 page */
    var _pending_page_info;

    function _setup_pending_page( id, args, from_uri, animation ) {
        _pending_page_info = {
            id:         id,
            args:       args,
            fromUri:    from_uri,
            animation:  animation
        };
        
        _load_module( id );
    }
    
    function _setup_pending_boot_page( id, callback ) {
        _load_module( id, callback );
    }
    
    function _load_module( id, callback ) {
        /* 查找路径前缀 */
        var base_paths      = _find_base_path_if_needed( id );
    
        var js_path         = '';
        var css_path;
    
        /*  FIXME(XCL): 对于 Page 代码可能需要 Version code */
        var cache_control   = '';
    
        if ( base_paths ) {
            if ( ! $.isArray( base_paths ) )
                base_paths = [ base_paths ];
        
            if ( base_paths.length > 0 )
                js_path = base_paths[ 0 ];
            if ( base_paths.length > 1 )
                css_path = base_paths[ 1 ];
        
            _global_lazy_page_version_code
                && ( cache_control = '?_=' + _global_lazy_page_version_code );
        }
    
        /* Loading the style first, then script */
        css_path && load_asset( css_path + id + '.css' + cache_control );
        load_asset( js_path + id + '.js' + cache_control, callback );
    }

    /**
     * 查找指定 Page 用来加载资源的路径.
     *
     * @param id
     * @returns {Array|string} 路径前缀
     * @private
     */
    function _find_base_path_if_needed(id) {
        for ( var idx in _path_patterns ) {
            if ( _path_patterns[ idx ][ 0 ].test( id ) )
                return _path_patterns[ idx ][ 1 ];
        }

        /* 没有任何有效的 path 规划 */
        return '';
    }

    function _should_lazy_load(id) {
        return '' !== _find_base_path_if_needed( id );
    }
    
    function _postpone_page_for_trans_end( id, args, from_uri, animation ) {
        _pending_page_info = {
            id:         id,
            args:       args,
            fromUri:    from_uri,
            animation:  animation
        }
    }
    
    function _settle_delayed_page_if_necessary() {
        _pending_page_info
            && _settle_pending_page_if_necessary( _pending_page_info.id );
    }

    function _settle_pending_page_if_necessary(id) {
        if ( ! _pending_page_info || id !== _pending_page_info.id )
            return;

        var immediate = _pending_page_info;
        
        /* 标记已处理 */
        _pending_page_info = void 0;

        _request_go(
            immediate.id,
            immediate.args,
            immediate.fromUri,
            immediate.animation
        );
    }

    /**
     * 构建一个 page.
     *
     * @param {string} id 唯一的 page 标识,如: ui.about
     * @param {Map} props page 的配置数据
     * @returns {Page}
     * @private
     */
    function _register(id, /* properties */props) {
        /* TODO(XCL): validate the view id */
        if ( ! isString( id ) )
            throw Error( "Invalid id(" + id + ")" );

        if ( $x.isUndefined( props ) )
            throw Error( "Must be specify the props for " + id );


        /* TODO(XCL): 延迟初始化 */
        _ensure();


        /* Page 如果已经定义过则无需再次定义 */
        var page = _exist( id )
            ? _get_page( id )
            : new Page();
        
        /* TODO(XCL): 已经存在的是否允许更新 */
        if ( ! _is_new( page ) )
            return page;

        /* TODO: 这样会造成祖级元素无法被合理使用 */
        /* 是否为祖先级实例 */
        var isAncestor = _MULTIPLE_INSTANCES in props
            && !! props[ _MULTIPLE_INSTANCES ];

        /* 分配一个 idx 实际上就是 z-index */
        var stackIdx = _alloZIndex( $x.FRAGMENT ),
            requires;

        /**
         * 用于容纳 page 内容
         *
         * var layout   = _FRAGMENT_TEMPLATE.clone();
         */

        /* 处理依赖项 */
        isPlainObject( props )
            && _REQUIRES in props
                && ( requires = _resolve_requires( props.requires ) );

        /* ----------------------------------------------------------------- */

        /* 对一个 page 开放的实例方法 */

        /* 处置 Handlers */
        _settle_handlers( id, props );

        /* 初始化依赖项 */
        requires && _import_requires_if_necessary( requires );

        /* ----------------------------------------------------------------- */

        /* Page 的 id */
        page[ _ID ]             = id;
        /* 叠放次序 */
        page[ _STACK_INDEX_ ]   = stackIdx;

        /* XXX(XCL): DOM 节点, 如果为祖先级实例则该 DOM 只会被用于 clone */
        page[ _EL_ ] = {};

        /* 标题 */
        isString( props[ _TITLE ] )
            && (page[ _TITLE ] = props[ _TITLE ]);

        /* 解析后的 hash, xfly.ui.home -> xfly/ui/home */
        page[ _ROUTE ] = _make_id_as_xpath_route( id );

        /* To retain the arguments if present. */
        _ROUTE_ARGS in props
            && (page[ _ROUTE_ARGS ] = props[ _ROUTE_ARGS ]);

        /* 是否支持多实例, 如支持多实例则祖先仅终不会被添加至 DOM 中 */
        isAncestor
            && Object.defineProperty(
                page,
                _MULTIPLE_INSTANCES,
                { value: 1, writable: 0 }
            );

        /* 解析切换效果配置 */
        _settle_animation( page, props );

        /* ----------------------------------------------------------------- */

        /* 填充 HTML 片段，如果已指定该字段 */
        if ( _HTML in props ) {
            page[ _HTML ] = props[ _HTML ];
            // _invoke_render( page, page );
        } else if ( _URL in props ) {
            page[ _URL ] = props[ _URL ];
            // _invoke_render( page, page );
        }

        /* ----------------------------------------------------------------- */

        /* Experiment: 解析 trigger */
        _register_triggers_if_necessary( page, props );

        /* ----------------------------------------------------------------- */

        /* 将定义的 page 放入容器 */
        _add( page );

        /**
         * 呈现默认 View 如果没有有效的 view id 被指定
         *
         * FIXME(XCL): 暂时从 bootstrap 调用, 以在 register 过程中调用一些未加载的
         *              page
         *
         * ! hasPagePresented && _setupTopIfMatch( frag )
         */

        _settle_pending_page_if_necessary( id );

        return page;
    }
    
    /**
     * 注册 trigger 如果 props 中包含该配置节点。
     *
     * @param {Page} frag
     * @param {Map} props
     * @private
     */
    function _register_triggers_if_necessary(frag, props) {
        var triggerDirective = props['trigger'];

        if ( triggerDirective ) {
            /* TODO(XCL): show:observable */
            var on      = triggerDirective['on'],
                state   = triggerDirective['state'],
                action  = triggerDirective['action'];

            if ( on && state && action ) {
                var host    = _triggers[on];

                /* 首次开劈空间(trigger 被触发完了以后应该释放空间) */
                if ( ! host )
                    _triggers[on] = host = {};

                var stack = host[state];

                /* 该 state 首个 trigger */
                if ( ! stack )
                    host[state] = stack = [];

                var trigger = {
                    target: frag[ _ID ],
                    action: action
                };

                /* 不设置 once 默认指只触发一次 */
                triggerDirective[ 'once' ]
                        && (trigger['once'] = !! 1);/* listen once */

                stack.push( trigger );
            }
        }
    }

    /**
     * 提取依赖当前 page 的 triggers.
     *
     * @param _host
     * @param state
     * @returns {Array}
     * @private
     */
    function _extract_triggers(_host, state) {
        var host = _triggers[_host],
            result;

        /* TODO(XCL): 是否有必要触发一次后移除 */
        if ( host ) {
            var origin = host[ state ],
                trigger;

            /* Clone */
            result = origin.slice( 0 );

            var idx;

            /* 移除只触发一次的 trigger */
            for ( idx in origin ) {
                trigger = origin[ idx ];

                if ( trigger && trigger['once'] )
                    origin.splice( idx, 1 );
            }

            /* 如果有只触发一次的 trigger 被移除, 则需要同步至 _triggers */
            origin.length != result.length
                && (_triggers[ host ] = host[ state ] = origin);
        }

        return result;
    }

    /**
     * 存放 triggers.
     *
     * @type {Map{Map{Array}}}
     * @private
     */
    var _triggers = {};

    /**
     * 当一个 page 被定义为支持 pre-load 时该标识默认为 true(也就是 props 中已经指
     * 定 html 或 url).
     *
     * @param page
     * @private
     */
    function _mark_content_was_loaded(page) {
        page[ _FLAG_CONTENT_LOADED ] = !! 1;
    }
    
    /**
     * 标记 Page 的实例已初始化。
     *
     * @param page
     * @private
     */
    function _mark_was_instantiated(page) {
        page[ _FLAG_INSTANTIATED ] = !! 1;
    }

    /**
     * 通知有 page 加载内容完成.
     *
     * @param page
     * @private
     */
    function _notify_content_was_loaded(page) {
        _mark_content_was_loaded( page );

        if ( _current == page ) {
            _on_current_page_content_loaded();
        }
    }

    /**
     * 解析切换效果配置.
     *
     * @param page
     * @param props
     * @private
     */
    function _settle_animation(page, props) {
        if ( ! ( _ANIMATION in props ) )
            return;

        page[ _ANIMATION ] = _resolve_fx( props[ _ANIMATION ] );
    }

    /**
     * 拼装一个 Router hash 值, 用于区分常规 hash 我们的 hash 则以 !# 开头.
     *
     * @param id
     * @returns {string}
     * @private
     */
    function _convert_id_to_hash(id) {
        return _FRAGMENT_HASH_STRIPPER + id;
    }

    function _convert_hash_to_id(hash) {
        return hash.substr( 2 );
    }

    /**
     * 判断是否为用于 page 操控的 hash.
     *
     * @param route A special hash of Page model
     * @returns {boolean}
     * @private
     */
    function _is_special_raw_route(route) {
        /* TODO(XCL): 重新定义 Magic back */
        return is_native_mode()
                ? !! 1
                : route && '!' === route.charAt( 1 );
    }

    /**
     * 判断是否为 View hash.
     *
     * @param route
     * @returns {boolean}
     * @private
     */
    function _is_page_route(/* RawHash */route) {
        return _is_special_raw_route( route ) && ! _is_magic_back_route( route );
    }

    /**
     * 判断是否为作用于返回的特殊 hash.
     *
     * @param hash
     * @returns {*|boolean}
     * @private
     */
    function _is_magic_back_route(hash) {
        return _MAGIC_BACK_HASH === hash;
    }

    /**
     * This is just convert the id to Canonicalized forms.
     * e.g.: app.tour -> app/tour
     *
     * @param id
     * @returns {string}
     * @private
     */
    function _make_id_as_xpath_route(id) {
        return /\.+/g.test( id )
            ? ( id.replace( /\./g, '/' ) )
            : id;
    }

    /**
     * 将 Page xpath 风格的 id 转化为'命名空间'形式的 id, 如: view/home -> view.home.
     *
     * @param hash
     * @returns {XML|string|void}
     * @private
     */
    function _make_route_identify(hash) {
        return /\/+/g.test( hash )
            ? ( hash.replace( /\//g, '.' ) )
            : hash;
    }

    /**
     * 覆盖指定 page 的 args.
     *
     * @param id
     * @param args
     * @private
     */
    function _override_args(id, args) {
        /* TODO(XCL): 校验参数的合法性 */
        var x = _get_page( id );
        
        x && (x[ _ROUTE_ARGS ] = args);
    
        /**
         * TODO(XCL): 是否也同步将 localSession state 更新.
         *
         * if ( _current == x && history_api_supported ) {
         *    history.replaceState(
         *        history.state || _new_state(),
         *        x[ _TITLE ],
         *        _build_url_for_render( x )
         *    );
         * }
         */
    }

    /**
     * 分解 hash, 将从 URL 截取的 hash 片段分解为有效的 view id 及其参数.
     *
     * @param href_or_hash
     * @returns {PageSpec}
     * @private
     */
    function _resolve_frag_spec(href_or_hash) {
        return {
            hash: _extract_route( href_or_hash ),
            args: _extract_args ( href_or_hash )
        };
    }

    /**
     * 判断指定的 hash 是否包含参数.
     *
     * @param href_or_hash {string} 来自 location 的 hash.
     * @returns {boolean}
     * @private
     */
    function _has_args(href_or_hash) {
        return is_native_mode()
                ? 1
                : -1 ^ href_or_hash.indexOf( _ARG_STRIPPER );
    }

    var _ARG_VALUE_EMPTY = '';

    /**
     * 从 href 或 hash 提取参数, 并以 key-value 形式返回.
     *
     * @param href_or_hash
     * @returns {Map} or null
     * @private
     */
    function _extract_args(href_or_hash) {
        if ( ! _has_args( href_or_hash ) )
            return void 0;

        return is_native_mode()
            ? _extract_route_from_link( href_or_hash ).args
            : _decode_args(
                href_or_hash.substr(
                    1 + href_or_hash.indexOf( _ARG_STRIPPER ) ) );
    }

    /**
     * 将 hash 参数 URL 化 { a: 'a', b: 'b'} -> a=a&b=b.
     *
     * @param {String} args
     * @returns {string}
     * @private
     */
    function _args_urlify(args) {
        return $.param( args ).replace( /%5B%5D/g, '[]' );
    }

    /**
     * 分隔 hash 与其参数.
     * @type {string}
     * @private
     */
    var _ARG_STRIPPER = ':';

    /**
     * 提取 hash.
     *
     * @param href_or_hash
     * @returns {string}
     * @private
     */
    function _extract_route(href_or_hash) {
        return _has_args( href_or_hash )
            ? href_or_hash.slice( 2, href_or_hash.indexOf( _ARG_STRIPPER ) )
            : href_or_hash.slice( 2 );
    }

    /**
     * 是否参数相同.
     *
     * @param l
     * @param r
     * @returns {boolean}
     * @private
     */
    function _is_same_args(l, r) {
        return $x.stringify( l ) === $x.stringify( r );
    }

    /**
     * 判断两个 hash 是否完全相同.
     *
     * @param l
     * @param r
     * @returns {boolean}
     * @private
     */
    function _is_same_page_spec(l, r) {
        return l
            && r
                && l[ _ROUTE ] === r[ _ROUTE ]
                    && _is_same_args( l[ _ROUTE_ARGS ], r[ _ROUTE_ARGS ] );
    }

    /**
     * Called only once.
     *
     * @param page
     * @private
     */
    function _setup_top_if_match(page) {
        if ( ! _ORIGIN_HASH )
            return;

        var originHash = _ORIGIN_HASH[ _ROUTE ],
            originArgs = _ORIGIN_HASH[ _ROUTE_ARGS ];

        if ( originHash === page[ _ROUTE ] ) {
            /* 更新 args */
            _override_args( page[ _ID ], originArgs );
            
            _request_go( page[ _ID ] );
        }
    }

    /* --------------------------------------------------------------------- */

    /**
     * BUG(s):
     * $xfly.get -> error;
     * finish 销毁过晚;
     * 快速点击 UI 将不可见;
     * 多实例首次 URI 加载, 不走 multitask mode;
     * 多实例跳转后, 再后退动画不误;
     * 通过 beginWith multitask 根实例可能不会被创建;
     *
     */

    /* 使用 multitask 时会导致 loading indicator 二次呈现; */

    /**
     * TODO:
     * Hybrid mode
     * Fake go(switch)
     * observer for load trigger(Once OR Ever)(Loading Strategy)
     * {fade: true}
     * bind
     * page listener
     * 支持停用动画
     * handling unknown id
     * progress status
     * root color
     * parentable -> back(TaskStackBuilder)
     * url with args
     * clearContentOnLeave
     * destroyOnLeave
     * open page
     * show page
     * reveal page
     * present page
     * appear page
     * parent accessed by ref
     * detectHashChange => onHashChange
     * title => selector
     */

    /* --------------------------------------------------------------------- */

    function _process_state() {}

    var _LISTEN_WINDOW_POP_STATE    = 'popstate';

    /* Backstack Record */
    var _BSR_IDX                    = _STACK_INDEX_,
        /* 首次加载的 view */
        _FIRST_STATE                = 0;

    /* 当前状态 */
    var _current_state              = {};
    
    /**
     * 创建 state 用于 History.
     *
     * @param animation
     * @returns {Object}
     * @private
     */
    function _new_state(animation) {
        var state = {};

        state[ _BSR_IDX ] = _back_stack.length ? _back_stack.length - 1 : 0;

        return state;
    }
    
    /**
     * 是否为后退 action.
     *
     * @param {PopStateEvent} event
     * @returns {boolean}
     * @private
     */
    function _is_backward(event) {
        var current = _current_state;

        return _FIRST_STATE === current[ _BSR_IDX ]
            || event.state[ _BSR_IDX ] === 0
            || event.state[ _BSR_IDX ] < current[ _BSR_IDX ];
    }
    
    /**
     * 处理后退 action.
     *
     * @param {PopStateEvent} event
     * @private
     */
    function _handle_backward(event) {
        if ( history_api_supported || event.state[ _BSR_IDX ] in _back_stack )
            _perform_back();
    }

    /* XXX(XCL): 是否应该支持 forward 操作 */
    function _handle_forward(event) {}
    
    /**
     * 是否为有效的 State pop event。
     *
     * @param {PopStateEvent} event
     * @returns {*|boolean}
     * @private
     */
    function _check_state_event(event) {
        return event['state'] && _BSR_IDX in event['state'];
    }

    /* TODO(XCL): 如果跳转到其它页面当后退至当前页面则可能 stack 丢失(RELOAD) */
    /* TODO(XCL): 若 history 有多项记录, 此时 reload 会导致无法进行后退操作(BackStack 为空) */
    var _pop_state_handler = function(event) {
        /**
         * FIXME(XCL): 如果正在进行 trans 时触发 pop state 则说明是为了修正来自用户的
         *              快速 touch 操作来的 page 无跳转的问题, 此时仅仅是进行
         *              pop back 操作
         */
        if ( ! _check_state_event( event ) )
            return;

        /* FIXME(XCL): To handling the state loss... */
        if ( ! _back_stack.length ) {
            /* FIXME(XCL): 若开启 reload 则在部分设备，后退时会 reload */
            if ( session_storage_supported ) {
                /* TODO(XCL): reload 操作是否需要清楚该值 */
                var last_state = ss.getItem( SESSION_CURRENT_STATE );

                if ( last_state ) {
                    var previous_state = ss.getItem( '#' + --persistent_session_stack_idx_offset );
    
                    if ( previous_state ) {
                        var url;

                        ss.setItem( SESSION_CURRENT_STATE,
                            persistent_session_stack_idx_offset );

                        /* Compatible with V1 state (URL only) */
                        if ( ~ previous_state.indexOf( _PERSISTENT_STATE_SEPARATOR ) ) {
                            var state = previous_state.split( _PERSISTENT_STATE_SEPARATOR );

                            url = decodeURI( state[ 0 ] );
                            _setup_scroll_restoration_for_redirect( state[ 1 ] );
                        } else {
                            url = previous_state;
                        }

                        location.href = decodeURI( url );

                        return;
                    } else {
                        location.reload();
                    }
                    
                    //if ( last_state && 'href' in last_state ) {
                    //    if ( location.href != last_state.href ) {
                    //        location.reload();
                    //    } else {
                    //        location.href = last_state.href;
                    //    }
                    //}
                }
            }

            return;
        }

        _is_backward( event )
            ? _handle_backward( event )
            : _handle_forward( event );

        /**
         * FIXME(XCL): Trying to prevent the user backward operation
         * if ( 'onpopstate' in window ) {
         *    history.pushState( null, null, location.href );
         *
         *    window.addEventListener( 'popstate', function () {
         *        FIXME: To override the history state
         *        history.pushState( null, null, location.href )
         *    } )
         *  }
         */
    };

    /* --------------------------------------------------------------------- */

    /**
     * 依赖该事件进行 page 导向
     * @type {string}
     * @private
     */
    var _LISTENER_HASH_CHANGE = 'onhashchange';

    /**
     * 记录初始 hash
     * @private
     */
    var _ORIGIN_HASH = _is_page_route( location.hash )
                        ? _resolve_frag_spec( location.hash )
                        : void 0;

    var _on_trans_ended = function() {
        _handle_delayed_hash_change_event();
    };

    /**
     * 延迟处理 hash change 事件.
     *
     * @private
     */
    var _handle_delayed_hash_change_event = function() {
        if ( ! _delayed_route_change_event )
            return;

        var oldFragSpec = _delayed_route_change_event.oldInnerRoute,
            newRawRoute = _delayed_route_change_event.newRawRoute;

        /* 标记 delayed event 已处理 */
        _delayed_route_change_event = void 0;

        _handle_navigation_change( oldFragSpec, newRawRoute );
    };

    /**
     * 将指定的 hash change 事件延迟处理.
     *
     * @param old_frag_spec
     * @param new_raw_route
     * @private
     */
    function _post_delayed_navigation_change_event(old_frag_spec, new_raw_route) {
        _delayed_route_change_event = {
            oldInnerRoute:  old_frag_spec,
            newRawRoute:    new_raw_route
        };
    }

    var _roll_back_for_uri_nav = function() {
        /*history.back();*/
        /**
         * var rewind = _convertCurrentlyHashToInner();
         * rewind && ( location.hash = _buildInnerHash( rewind ) );
         */
    };
    var _detect_backward_for_uri = void 0;
    var _roll_back;

    /**
     * 用于对我们再次包装的 HashChangeEvent 进行延迟处理.
     *
     * @type {object}
     * @private
     */
    var _delayed_route_change_event = void 0;

    /**
     * 提取当前 page 的 FragSpec.
     *
     * @returns {PageSpec}
     * @private
     */
    function _get_current_page_spec() {
        var data;

        if ( _current ) {
            (data = {})[_ROUTE]  = _current[_ROUTE];
            data[_ROUTE_ARGS]    = _current[_ROUTE_ARGS];
        }

        return data;
    }

    function _get_navigation() {
        return is_native_mode()
            ? location.pathname + location.search
            : location.hash;
    }
    
    /**
     * 获取当前 route.
     *
     * @returns {{target: string, args: *}}
     * @private
     */
    function _get_current_route() {
        return {
            target: _make_route_identify( sanitize( location.pathname ) ),
            args:   _decode_args( location.search.substr( 1 ) )
        };
    }
    
    /**
     * 从一个 link 中提取 route 信息。
     *
     * @param {string} href
     * @returns {{target: (XML|string|void), args: *}}
     * @private
     */
    function _extract_route_from_link(href) {
        var query_mark_idx  = href.indexOf( '?' ),
            hash_idx        = href.indexOf( '#' );

        var target,
            args;

        /* 移除 hash 部分 */
        if ( ~ hash_idx )
            href = href.substring( 0, hash_idx );

        /* 如果有参数 */
        if ( ~ query_mark_idx ) {
            target  = sanitize( href.substring( 0, query_mark_idx ) );
            args    = _decode_args( href.substr( query_mark_idx + 1 ) );
        } else {
            target  = sanitize( href );
            args    = void 0;
        }

        return {
            target: _make_route_identify( target ),
            args:   args
        };
    }

    /**
     * 对 Page 的 args 进行解码。
     *
     * e.g: key=value&key2=value2 => { key: value, key2: value2 }
     *
     * @param {string} args_sequence
     * @returns {Map|undefined}
     * @private
     */
    function _decode_args(args_sequence) {
        var args    = {},

            /* 统计条数 */
            counter = 0,

            array   = args_sequence.replace( /\[\]/g, '' ).split( '&' ),

            /* 索引, 参数对儿, 参数名, 参数, 数组 */
            idx, pair, key, value, set;
        
        /* 用于保留单元素的数组类型 */
        var array_typed;
        
        if ( array.length ) {
            array_typed = {};
            
            /* 不区分数组/非数组 */
            var uniform_args = args_sequence.split( '&' ),
                explain;
            
            for ( idx in uniform_args ) {
                pair = uniform_args[ idx ];
                
                explain = pair.split( '[]=' );
                
                if ( explain.length === 2 && ! ( explain[ 0 ] in array_typed ) ) {
                    array_typed[ explain[ 0 ] ] = 1;
                }
            }
        }

        for ( idx in array ) {
            pair    = array[ idx ].split( '=' );

            key     = pair[ 0 ];
            value   = pair[ 1 ] && decodeURIComponent( pair[ 1 ] );

            if ( ! key )
                continue;

            if ( key in args ) {
                set = args[ key ];

                set.push( value );

                args[ key ] = set;
            } else {
                args[ key ] = array_typed[ key ] ? [ value ] : value;
            }
    
            counter++;
        }

        return counter ? args : void 0;
    }

    /**
     * 当 hash 变更时调用该 fn.
     *
     * @private
     */
    var _on_navigation_change = function(/* hashChangeEvent */) {
        /* TODO(XCL): Checking for URL changed event with interval fn */

        /* 变更之前的 FragSpec */
        var oldFragSpec = _get_current_page_spec(),
            /* 当前 Browser 中的 hash */
            newRawRoute = _get_navigation();

        /* TODO(XCL): Check for transaction timed out... */
        if ( _has_page_trans_in_processing() ) {
            /* TODO(XCL): postDelayed */
            _post_delayed_navigation_change_event( oldFragSpec, newRawRoute );

            return;
        }

        _handle_navigation_change( oldFragSpec, newRawRoute );
    };

    /**
     * 处理 hash 变更事件.
     *
     * @param old_frag_spec {PageSpec}
     * @param new_raw_route {string}
     * @private
     */
    function _handle_navigation_change(old_frag_spec, /*currently*/new_raw_route) {
        if ( ! _is_special_raw_route( new_raw_route ) )
            return;

        _process_frag_sepc_changed_event( old_frag_spec, new_raw_route );
    }

    /* TODO(XCL): To detect the history back act. */
    function _process_frag_sepc_changed_event(old_frag_spec, /*currently*/new_raw_hash) {
        /* 是否为 up 操作 */
        if ( _is_magic_back_route( new_raw_hash ) ) {
            _trigger_go_back( _OP_FROM_URI );
        }
        /* 是否为 page hash */
        else if ( _is_page_route( new_raw_hash ) ) {
            /* TODO(XCL): Filtering and Sanitizing */
            var resolvedNewFragSpec = _resolve_frag_spec( new_raw_hash );

            /* 是否 hash 真的需要更新 */
            /* 暂时使用 History API */
            if ( ! _is_same_page_spec( old_frag_spec, resolvedNewFragSpec ) ) {
                _trigger_go_next( resolvedNewFragSpec, /* from_user */1, /* from_uri */1 );
                // _detect_backward_for_uri = _currentState;
            }
        }
    }

    /* _triggerLoadPage */
    /* triggerBackward */

    /**
     * 前往指定的 page.
     *
     * @param hash {PageSpec}
     * @param from_user {boolean} 是否来自用户的形为
     * @param from_uri {boolean}
     * @private
     */
    var _trigger_go_next = function(/*FragSpec*/hash, from_user, from_uri) {
        var id = _make_route_identify( hash[ _ROUTE ] );

        _request_go( id, hash[_ROUTE_ARGS], from_uri );

        /*if ( _isSupportMultiInstance( id ) )
            _goNextWithMultiMode( id, hash[ _ARGS ], fromUser, fromUri );
        else
            _goNext( id, hash[ _ARGS ], fromUser, fromUri );*/
    };

    /* TODO(XCL): boot in #!- */
    var _trigger_go_back = function() {
        back( _OP_FROM_URI );
    };

    function _go_next_with_multi_mode(id, args, from_user, from_uri, animation) {
        /**
         * Step 1: 是否支持多实例
         * Step 2: 如果支持看实例是否被创建
         * Step 3: 前往实例
         */

        /**
         * 对于多实例 page 我们使用在其基本 id 之上加 args 的 hash 用于区分，
         * 如：ui.view#123456
         */
        var deriveId = _calculate_derive_key( id, args );

        /* XXX(XCL): 实际上我们是依赖 args 的不同来维护多实例，但这并不意味着允许 args 为 null */
        if ( id === deriveId ) {
            _go_next( id, args, from_user, from_uri, animation );
            return;
        }

        _exist( deriveId ) || _build_derive( id, deriveId, args );

        _perform_go.call( _get_page( deriveId ), from_uri, animation );
    }

    /**
     * 前往下一步 page.
     *
     * @param id
     * @param args (optional)
     * @param from_user (optional)
     * @param from_uri (optional)
     * @param animation (optional)
     * @private
     */
    function _go_next(id, args, from_user, from_uri, animation) {
        /* TODO(XCL): 更新 args, 这里可能为重复的操作... */
        args && _override_args( id, args );

        /* 前往该 view */
        _perform_go.call( _get_page( id ), from_uri, animation );
    }

    /**
     * 设置 GPU 硬件加速开启状态.
     *
     * @param viewport
     * @param enabled
     */
    function set_gpu_accelerated_composite_enabled(viewport, enabled) {
        var flag = 'x-ui';

        viewport = $( viewport );

        if ( enabled )
            viewport.hasClass( flag ) || viewport.addClass( flag );
        else
            viewport.hasClass( flag ) && viewport.removeClass( flag );
    }

    /* --------------------------------------------------------------------- */
    
    function collect_current_page_elements() {
        return $x._viewport.children( '.page-ui' );
    }
    
    function restore_page_elements() {
        var layout_id       = get_layout_id.call( this );
        var saved_elements  = _sandbox_dom_container[ layout_id ];
        
        if ( saved_elements ) {
            if ( $x.isString( saved_elements ) )
                saved_elements = $( saved_elements );
            
            /* Attach to the viewport */
            saved_elements.appendTo( $x._viewport );
            _sandbox_dom_container[ layout_id ] = void 0;
        }

        (_SCROLL_POSITION_Y_ in this)
            && ( _restore_scroll_position( this[ _SCROLL_POSITION_Y_ ] ) );
    }
    
    function save_page_elements(saved_elements) {
        _sandbox_dom_container[ get_layout_id.call( this ) ] = saved_elements;
    }
    
    /* --------------------------------------------------------------------- */

    function _restore_scroll_position(y) {
        window.scrollTo( 0, y );
    }

    function _obtain_scroll_position_y() {
        return window.scrollY;
    }
    
    function _setup_scroll_restoration_for_redirect(future_y) {
        ss.setItem( _SCROLL_RESTORATION_FOR_REDIRECT, future_y );
    }
    
    function _perform_scroll_restore_after_redirect_if_needed() {
        var y = ss.getItem( _SCROLL_RESTORATION_FOR_REDIRECT );

        if ( y ) {
            ss.remove( _SCROLL_RESTORATION_FOR_REDIRECT );

            _restore_scroll_position( y );
        }
    }

    /* --------------------------------------------------------------------- */

    /**
     * TODO(XCL): Mixed props
     *
     * $Page.define( ['home', 'about'] );
     * $Page.define( ['home', 'about'], { onRendered: function() {} } );
     *
     * @public
     */
    $x.page = function(id, props) {
        /* TODO: alias, short */
        if ( $x.isArray( id ) ) {
            var pages = [];
            
            props = props || {};
            
            for ( var idx in id ) {
                pages.push( _register( id[ idx ], props ) );
            }
            
            return pages;
        }
        
        return _register( id, props );
    };
    
    /* ------------------------------------------------------------------------
     *                              Exposed for global
     * --------------------------------------------------------------------- */
    
    /**
     * $Page 开放的静态 fn, 用于定义, 跳转控制.
     *
     * @type { {
     *          config:         {Map},
     *          title:          string,
     *          define:         (xfly.page|*),
     *          bootstrap:      win.$Page.bootstrap,
     *          go:             win.$Page.go,
     *          goWithoutFx:    win.$Page.goWithoutFx,
     *          canBack:        can_back,
     *          back:           back,
     *          reload:         _reload,
     *          update:         throwNiyError,
     *          finish:         win.$Page.finish,
     *          finishAndGo:    win.$Page.finishAndGo,
     *          destroy:        throwNiyError
     * } }
     *
     * @global
     */
    win.$Page = {

        /**
         * 对 $Page 进行全局配置, 例如指定: listener, property 等
         */
        config:     config,

        /**
         * 默认 title(初始为 host 页面 title)
         */
        title:      document.title,

        /**
         * 定义一个 page 模型.
         *
         * @param id 用来标识 page 的唯一
         * @param {Map} props 定义 page 配置及 handler.
         * @returns {object} 一个 page 实例
         */
        define:     $x.page,

        /**
         * 启动 page 如果当前 location.hash 不含有效的 hash 则使用指定的作
         * 为初始 page.
         *
         * @param id
         * @param args
         * @deprecated
         */
        bootstrap:  function(id, args) {
            //if ( _ORIGIN_HASH ) {
            //    id      = _make_route_identify( _ORIGIN_HASH[ _ROUTE ] );
            //    args    = _ORIGIN_HASH[ _ROUTE_ARGS ]
            //}
            
            /* TODO(XCL): */
            //_request_go( id, args, /* from_uri */0 );
        },

        /**
         * 呈现指定的 page, 如: ui.about.
         *
         * @param id
         * @param args
         */
        go:         _request_go,

        /**
         * 呈现指定的 page 但不启用动画.
         *
         * @param id
         * @param args
         */
        goFast:     function(id, args) {
            _request_go( id, args, /* from_uri = 0, */ fx.none );
        },

        /**
         * 判断是否有前一个 page, 如果有则可以执行返回操作.
         *
         * @return {boolean}
         */
        canBack:    can_back,

        /**
         * 请求进行后退操作, 如果 BackStack 有可用的记录.
         *
         * @return {boolean} true 说明后退操作有效, 反则无效
         */
        back:       back,

        /**
         * 通知 page 更新.
         *
         * @param id
         * @param args
         */
        reload:     _reload,

        /**
         * 可以向 page 传递一些参数用来更新.
         *
         * @param id
         * @param args
         * @deprecated
         */
        update:     $x.throwNiyError,

        /**
         * 销毁当前 page & 返回上一级.
         * Note: 如果当前为根级则该方法不会被执行
         *
         * @deprecated
         */
        finish:     finish,

        /**
         * 销毁当前 page & 前往指定 page.
         * Note: 如果当前为根级则该方法不会被执行
         *
         * @param id
         * @param args
         * @deprecated
         */
        finishAndGo: $x.throwNiyError,

        /**
         * 回收一个 page.
         *
         * @param id
         * @deprecated
         */
        destroy:    $x.throwNiyError
    };

    /* ---------------------------------------------------------------------- */

    /**
     * 为 $Page[go, back] 添加短名方法.
     *
     * @type {function}
     * @global
     */
    win.go          = _request_go;
    
    /**
     * 以没有切换效果的模式前往下一个 page
     * @global
     */
    win.goFast      = win.$Page.goFast;
    
    /**
     * 后退操作
     * @global
     */
    win.back        = back;
    
    /**
     * 结束当前 Page
     * @global
     */
    win.finish      = finish;

   /* ----------------------------------------------------------------------- */
    
    /**
     * Xfly 支持的模式。
     *
     * @const
     * @type {number}
     */
    var HASH    = 0,    /* Older browser */
        NATIVE  = 1,
        HYBRID  = 99,
        SANDBOX = 999;  /* Modern browser */

    /* 标识处理导航的模式 */
    var mode    = SANDBOX;
    
    /**
     * 是否为非 hash 模式。
     *
     * @returns {boolean}
     */
    function is_native_mode() { return mode == NATIVE; }
    
    function is_sandbox_mode() { return mode == SANDBOX; }

    /**
     * 对 route 进行过滤, 返回一个严格的 route(xpath)
     *
     * @param src
     * @returns {string}
     */
    function sanitize(src) {
        if ( src.length == 1 && '/' == src )
            return '';

        if ( '/' == src.charAt( 0 ) )
            src = src.substr( 1 );

        if ( '/' == src.charAt( src.length - 1 ) )
            src = src.substr( 0, src.length - 1 );

        return src;
    }

    function _find_page_dom() {}

    /* 根级 Page 标识(这是一个特例, 实际定义的 Page 可能为 home/main) */
    var ROOT = '/';
    
    /**
     * 构建一个 URL 用于 Pulling 远程的 DOM tree.
     *
     * @param {Page} page
     * @returns {string}
     * @private
     */
    function _build_url_for_render(page) {
        var args = page[ _ROUTE_ARGS ];

        return ROOT + _make_id_as_xpath_route( page[_ID] )
            + ( args ? '?' + _args_urlify( args ) : '' );
    }

    function _is_page_navigation_link($link) {
        return $link.is( '.xfly-page__nav' ) || $link.is( '.xfly-page__back' );
    }
    
    /**
     * 处理 link 点击事件。
     *
     * @param {Zepto} $link
     * @returns {boolean}
     * @private
     */
    function _process_page_navigation_link($link) {
        var href = $link.attr( 'href' );
        
        if ( $link.is( '.xfly-page__nav' ) && href ) {
            var route = _extract_route_from_link( href );
            
            _request_go( route.target, route.args );
            
            return !! 1;
        }
        else if ( $link.is( '.xfly-page__back' )
            || ~ ( href || '' ).indexOf( '#!-' ) ) {
            history.back();
            
            return !! 1;
        }
        
        /* 是否为站内常规 Hyper Link */
        if ( 0 === ( href || '' ).indexOf( '/' ) )
            _persistent_state_for_redirect( href );
    }
    
    /* ----------------------------------------------------------------------- /
     *                       以下为 Swipe to refresh 扩展提供支持                /
     * ---------------------------------------------------------------------- */
    
    /**
     * 获取当前 page.
     *
     * @returns {page}
     * @global
     */
    win.getCurrentPage = function() {
        return _current;
    };
    
    /* ---------------------------------------------------------------------- */
    
    _transits[ fx.slide ] = _make_animation_scheme(
        _TRANSIT_YES, _TRANSIT_YES,
        _TRANSIT_YES, _TRANSIT_YES );
    _transits[ fx.cover ] = _make_animation_scheme(
        _TRANSIT_YES, _TRANSIT_YES,
        _TRANSIT_YES, _TRANSIT_YES,
        $x.brisk_cubic_bezier );
    _transits[ fx.fade ] = _make_animation_scheme(
        _TRANSIT_YES, _TRANSIT_NONE,
        _TRANSIT_YES, _TRANSIT_NONE );
    _transits[ fx.none ] = _make_animation_scheme(
        _TRANSIT_NONE );
    
    try {
        var check = 'xfly.ss';
        
        ss = sessionStorage;
        
        ss.setItem( check, 1 );
        ss.removeItem( check );
        
        persistent_session_stack_idx_offset
            = parseInt( ss.getItem( SESSION_CURRENT_STATE ) ) || 0;
        
        session_storage_supported = !! 1;
    } catch(e) {}

    /* ----------------------------------------------------------------------- /
     *                    BOOT LOADER(we started from here)                    /
     * ---------------------------------------------------------------------- */
    $( function() {
        var route = _get_current_route();

        if ( 0 && ROOT === route.target ) {
            /* 装载默认的 page */
        }
        else {
            /* TODO(XCL): 处理热加载... */
            var boot_loader = function () {
                var first,
                    layout;
                
                var pageId;
    
                /* To apply the params as args */
                _override_args( route.target, route.args );
    
                if ( _is_support_multi_instance( route.target ) ) {
                    /* TODO(XCL): Generate the drive */
        
                    /**
                     * 对于多实例 page 我们使用在其基本 id 之上加 args 的 hash 用于区分，
                     * 如：ui.view#123456
                     */
                    var deriveId =
                            _calculate_derive_key( route.target, route.args );
        
                    /**
                     * XXX: 实际上我们是依赖 args 的不同来维护多实例，但这并不意味着允
                     *      许 args 为 null。
                     */
                    if ( route.target === deriveId ) {
                        pageId = route.target;
                    } else {
                        if ( ! _exist( deriveId ) )
                            _build_derive( route.target, deriveId, route.args );
            
                        pageId = deriveId;
                    }
                } else {
                    pageId = route.target;
                }
    
                /* Assign for current */
                first   = _get_page( pageId );
                layout  = $( '.xfly-page' );

                if ( ! is_sandbox_mode() ) {
                    layout.css( 'z-index', first[ _STACK_INDEX_ ] );
                }
                
                /* 标识 Page 实例已初始化 */
                _mark_was_instantiated( first );
    
                /* ----- 如果为首次呈现则需要执行一系列的初始动作 Lifecycle { ---- */
    
                /* FIXME(XCL): 不管是否被暂停这里绝对执行恢复操作 */
                _move_to_state( first, RESUMED );
    
                /* ---------------------- Lifecycle } ----------------------- */
    
                if ( history_api_supported ) {
                    /*_add_to_back_stack( first );*/
        
                    /* FIXME(XCL): Set up the initiate state */
                    history.replaceState(
                        _new_state(),
                        first[ _TITLE ],
                        _build_url_for_render( first )
                    );
                }
    
                /* 设为当前 page */
                _current                    = first;
                _current_state[ _BSR_IDX ]  = _FIRST_STATE;
    
                if ( session_storage_supported ) {
                    var last_state = ss.getItem(
                        '#' + ss.getItem( SESSION_CURRENT_STATE ) );
                    
                    /* 是否为 Redirect 行为 */
                    if ( last_state ) {
                        /* 是否为 F5 OR Control + F5 操作 */
                        if ( decodeURI( last_state )
                            !== _build_url_for_render( _current ) ) {
                            // _persistent_state(
                            //     _current_state,
                            //     document.title,
                            //     _build_url_for_render( _current )
                            // );
                        }
                    } else {
                        _persistent_state(
                            _current_state,
                            '',
                            _build_url_for_render( _current )
                        );
                    }
                }
            };
            
            /* 关联 page 实例 */
            if ( _exist( route.target ) ) {
                boot_loader();
            } else {
                _should_lazy_load( route.target )
                    && _setup_pending_boot_page( route.target, boot_loader );
            }
        }
    
        /* TODO(XCL): addEventListener */
        /*_LISTENER_HASH_CHANGE in win && ( window[ _LISTENER_HASH_CHANGE ] =
            _on_navigation_change );*/
    
        /* 用来处理全部 link 的点击事件 */
        $( document ).on( 'click', 'a', function(e) {
            return ! _process_page_navigation_link( $( e.currentTarget ) );
        } );
    
        /* Manipulating the browser history */
        history_api_supported
            && ( window.addEventListener( _LISTEN_WINDOW_POP_STATE, _pop_state_handler ) );

        /* Handle the scroll restoration after redirect if needed */
        if ( scroll_restoration_supported ) {
            history.scrollRestoration = 'manual';

            session_storage_supported
                && ( _perform_scroll_restore_after_redirect_if_needed() );
        }
    
        /**
         * 差集
         *
         * window.diff_set = function(left, right) {
         *   var map_l = {}, map_r = {};
         *
         *  for ( var idx in left ) {
         *      map_l[ left[ idx ] ] = !! 0;
         *  }
         *  for ( var idx in right ) {
         *      if ( map_r[ right[ idx ] ] = right[ idx ] in map_l ) {
         *          map_l[ right[ idx ] ] = !! 1;
         *     }
         * }
         *
         *        for ( var idx in left ) {
         *           if ( ! map_l[ left[ idx ] ] ) {
         *              map_l[ left[ idx ] ] = left[ idx ] in map_r;
         *         }
         *    }
         *
         *    console.dir( map_l );
         *    console.dir( map_r );
         * };
         *
         * function intersection_set(left, right) {
         * }
         */
    
        /**
         * 配置 CSS Transform 硬件加速
         * (function(viewport) {
         *    set_gpu_accelerated_compositing_enabled( viewport, 0 );
         *    set_gpu_accelerated_compositing_enabled( viewport, ! ($x.os.ios && $x.browser.qqx5) );
         * }(document.body));
         */
    
        /* -------------------- 实现 scroll end 事件侦测 ---------------------- */
        
        /*var max_scroll_y = document.body.clientHeight - window.screen.height;*/
    
        /* 记录最后 scroll 的 y 值 */
        var last_scroll_y;
        /* Timer id 用于检测滚动停止 */
        var scroll_end_checker;
    
        function prepare_checking_for_scroll_end() {
            remove_scroll_end_checker();
        
            scroll_end_checker = setTimeout( function () {
                if ( last_scroll_y === window.scrollY ) {
                    remove_scroll_end_checker();
                
                    $x._viewport.trigger( 'scroll:end', last_scroll_y );
                }
            }, 100 );
        }
    
        function remove_scroll_end_checker() {
            if ( scroll_end_checker ) {
                clearTimeout( scroll_end_checker );
                scroll_end_checker = void 0;
            }
        }
    
        $( window ).on( 'scroll', function () {
            last_scroll_y = window.scrollY;
            prepare_checking_for_scroll_end();
        } );
    } );
}(xfly);