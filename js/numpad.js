/*
 *  jquery-boilerplate - v4.0.0
 *  A jump-start for jQuery plugins development.
 *  http://jqueryboilerplate.com
 *
 *  Made by Zeno Rocha
 *  Under MIT License
 */
// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;( function( $, window, document, undefined ) {

    "use strict";

        // undefined is used here as the undefined global variable in ECMAScript 3 is
        // mutable (ie. it can be changed by someone else). undefined isn't really being
        // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
        // can no longer be modified.

        // window and document are passed through as local variable rather than global
        // as this (slightly) quickens the resolution process and can be more efficiently
        // minified (especially when both are regularly referenced in your plugin).

        // Create the defaults once
        var pluginName = "numpad",
            version = '1.0.0',
            defaults = {
                show: "click",
                // if this function returns false, it will not show
                onBeforeShow: null,
                // if this function returns false, it will not close
                onBeforeClose: null,
                //
                onClose: null
            },
            $_wrap = null;

        // The actual plugin constructor
        function Plugin ( element, options ) {
            this.element = element;

            // jQuery has an extend method which merges the contents of two or
            // more objects, storing the result in the first object. The first object
            // is generally empty as we don't want to alter the default options for
            // future instances of the plugin
            this.settings = $.extend( {}, defaults, options );
            this._defaults = defaults;
            this._name = pluginName;
            this.init();
        }

        //
        function getPopupContainer(plugin) {
            var $wrap = $('.np-wrap');
            if ($wrap.length == 0) {
                // create
                $wrap = $(
                    '<div class="np-wrap" style="display: none;">'
                        +'<div class="np-overlay np-fade"></div>'
                        +'<div class="np-popup np-scale">'
                            +'<div class="np-hdr">'
                                +'<div class="np-value np-placeholder">0,00</div>'
                            +'</div>'
                            +'<div class="np-body">'
                                +'<div class="np-tbl">'
                                    +'<div class="np-row">'
                                        +'<div class="np-btn np-unselectable" data-val="7">7</div><div class="np-btn np-unselectable" data-val="8">8</div><div class="np-btn np-unselectable" data-val="9">9</div>'
                                    +'</div>'
                                    +'<div class="np-row">'
                                        +'<div class="np-btn np-unselectable" data-val="4">4</div><div class="np-btn np-unselectable" data-val="5">5</div><div class="np-btn np-unselectable" data-val="6">6</div>'
                                    +'</div>'
                                    +'<div class="np-row">'
                                        +'<div class="np-btn np-unselectable" data-val="1">1</div><div class="np-btn np-unselectable" data-val="2">2</div><div class="np-btn np-unselectable" data-val="3">3</div>'
                                    +'</div>'
                                    +'<div class="np-row">'
                                        +'<div class="np-btn np-unselectable" data-val="sep">,</div><div class="np-btn np-unselectable" data-val="0">0</div><div class="np-btn np-unselectable np-del-btn" data-val="del">&larr;</div>'
                                    +'</div>'
                                +'</div>'
                            +'</div>'
                            +'<div class="np-ftr">'
                                +'<div class="np-btn-f np-unselectable np-cancel-btn" data-val="cancel">Cancel</div>'
                                +'<div class="np-btn-f np-unselectable np-save-btn" data-val="save">Save</div>'
                            +'</div>'
                        +'</div>'
                    +'</div>'
                );
                $('body').append($wrap);
                // bindings
                $wrap.on('click', function(event) {
                    if ($(event.target).hasClass('np-overlay')) {
                        $(this).find('.np-cancel-btn')
                            .trigger('click');
                    }
                });
                $wrap.on('click', '.np-btn', function(event) {
                    var $val = $_wrap.find('.np-value'),
                        $btn = $(this),
                        clickedVal = $btn.data('val'),
                        val = $val.text();
                    if ($val.hasClass('np-placeholder')) {
                        $val.removeClass('np-placeholder');
                        val = '';
                    }
                    switch (clickedVal) {
                        case 'del':
                            val = val.substr(0, val.length - 1);
                            if (val == '') {
                                val = '0';
                            }
                            $val.text(val);
                            break;
                        case 'sep':
                            if (val.indexOf(',') == -1) {
                                if (val == '')
                                    val = '0';
                                $val.text(val + ',');
                            }
                            break;
                        default:
                            var parts = val.split(',');
                            if (parts.length == 1)
                                parts.push('');
                            var hasSep = val.indexOf(',') != -1;
                            // not let more than 2 digits after ,
                            if (parts[1].length < 2) {
                                // trim leading zeros before ,
                                parts[0] = parts[0].replace(/^0+/, '');
                                if (hasSep && parts[0].length == 0)
                                    parts[0] = '0';
                                val = hasSep ? parts.join(',') : parts[0];
                                val += clickedVal;
                                $val.text(val);
                            }
                    }
                    $btn.trigger('blur');
                });
                // on cancel button click
                $wrap.on('click', '.np-cancel-btn', function(event) {
                    if (typeof plugin.settings.onBeforeClose == 'function') {
                        if (!plugin.settings.onBeforeClose({button: 'cancel', value: ''}, plugin))
                            return;
                    }
                    plugin.hidePopup('cancel');
                });
                // on save button click
                $wrap.on('click', '.np-save-btn', function(event) {
                    if (typeof plugin.settings.onBeforeClose == 'function') {
                        if (!plugin.settings.onBeforeClose({button: 'save', value: $wrap.find('.np-value').text()}, plugin))
                            return;
                    }
                    plugin.hidePopup('save');
                });
            }
            $_wrap = $wrap;
            return $wrap;
        }

        // Avoid Plugin.prototype conflicts
        $.extend( Plugin.prototype, {
            init: function() {
                // instance: this
                // settings: this.settings
                // instance methods: this.<method>

                // show event handler
                $(this.element).on(this.settings.show, function(e){
                    var plugin = $.data( this, "plugin_" + pluginName );
                    plugin.showPopup();
                });
            },
            showPopup: function() {
                var $wrap = getPopupContainer(this),
                    ww = $wrap.width(),
                    wh = $wrap.height();

                if (typeof this.settings.onBeforeShow == 'function') {
                    if (!this.settings.onBeforeShow({}, this))
                        return;
                }

                $wrap.show()
                    .find('.np-overlay, .np-popup')
                    .addClass('np-show');

                var $popup = $wrap.find('.np-popup'),
                    w = $popup.width(),
                    h = $popup.height();                

                $popup.css({
                    top: wh / 2 - h / 2,
                    left: ww / 2 - w / 2
                });
            },
            hidePopup: function(closeType) {
                closeType = closeType || 'cancel';
                var self = this;
                if ($_wrap) {
                    $_wrap.find('.np-overlay, .np-popup')
                        .removeClass('np-show');
                    setTimeout(function(){
                        $_wrap.hide(function(){

                            if (typeof self.settings.onClose == 'function') {
                                self.settings.onClose({type: closeType, value: $_wrap.find('.np-value').text()}, self);
                            }

                            $_wrap.remove();
                            $_wrap = null;
                        });
                    }, 200);
                }
            },
            setValue: function(value) {
                if (/^\d+(,\d{0,2})?$/.test(value)) {
                    $_wrap.find('.np-value')
                        .text(value)
                        .removeClass('np-placeholder');
                }
            }
        } );

        // plugin wrapper preventing against multiple instantiations
        $.fn[ pluginName ] = function( options, args ) {
            args = args || {};
            // plugin api
            if (typeof options == 'string' && this.length == 1) {
                var plugin = this.data( "plugin_" + pluginName );
                if (plugin) {
                    switch (options) {
                        case 'showPopup':
                            plugin.showPopup();
                            break;
                        case 'hidePopup':
                            plugin.hidePopup();
                            break;
                        case 'setValue':
                            plugin.setValue(args.value || '');
                            break;
                    }
                    return this;
                }
            }

            // instantiation
            return this.each( function() {
                if ( !$.data( this, "plugin_" + pluginName ) ) {
                    $.data( this, "plugin_" +
                        pluginName, new Plugin( this, options ) );
                }
            } );
        };

        // 
        $(document).on('keydown', function(event) {
            //console.log(event.which)
            var keyMap = {
                48: '0',
                49: '1',
                50: '2',
                51: '3',
                52: '4',
                53: '5',
                54: '6',
                55: '7',
                56: '8',
                57: '9',
                8: 'del', // backspace
                188: 'sep', // ,
                27: 'cancel', // escape
                13: 'save' // enter
            };
            if ($_wrap) {
                if (typeof keyMap[event.which] != 'undefined') {
                    $_wrap.find('[data-val="' + keyMap[event.which] + '"]')
                        .trigger('click')
                        .addClass('clicked');
                }
            }
        });
        $(document).on('keyup', function(event) {
            if ($_wrap) {
                $_wrap.find('.np-btn').removeClass('clicked');
            }
        });


} )( jQuery, window, document );
