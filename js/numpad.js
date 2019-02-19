/*
 *  Based on jquery-boilerplate - v4.0.0
 *  A jump-start for jQuery plugins development.
 *  http://jqueryboilerplate.com
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
                // show on this event
                show: "click",
                // if true, empty value is allowed. Otherwise it will be forced to zero
                allowEmpty: true,
                // allow decimals
                allowDecimals: true,
                // number of decimals after comma
                precision: 2,
                // comma|dot
                decimalSeparator: 'comma', 
                // if this function returns false, it will not show
                onBeforeShow: null,
                // if this function returns false, it will not close
                onBeforeClose: null,
                //
                onClose: null,
                // Cancel button
                cancelLabel: 'Cancel',
                // Save button
                saveLabel: 'Save',
                // Full clear button
                clearLabel: '&#10006;',
                // Erase one symbol button
                eraseLabel: '&larr;'
            },
            $_wrap = null,
            _value = '';

        // The actual plugin constructor
        function Plugin ( element, options ) {
            this.element = element;
            this.$element = $(element);

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
                var separatorDisplay, separatorValue;
                if (plugin.settings.decimalSeparator == 'dot') {
                    separatorDisplay = '.';
                    separatorValue = 'separator-dot';
                } else {
                    separatorDisplay = ',';
                    separatorValue = 'separator-comma';
                }
                // create
                $wrap = $(
                    '<div class="np-wrap" style="display: none;">'
                        +'<div class="np-overlay np-fade"></div>'
                        +'<div class="np-popup np-scale">'
                            +'<div class="np-hdr">'
                                +'<div class="np-value np-placeholder"></div>'
                                +'<div class="np-btn np-unselectable np-clear-btn" data-val="clear">' + plugin.settings.clearLabel + '</div>'
                            +'</div>'
                            +'<div class="np-body">'
                                +'<div class="np-tbl">'
                                    +'<div class="np-row">'
                                        +'<div class="np-col np-btn np-unselectable" data-val="7">7</div><div class="np-col np-btn np-unselectable" data-val="8">8</div><div class="np-col np-btn np-unselectable" data-val="9">9</div>'
                                    +'</div>'
                                    +'<div class="np-row">'
                                        +'<div class="np-col np-btn np-unselectable" data-val="4">4</div><div class="np-col np-btn np-unselectable" data-val="5">5</div><div class="np-col np-btn np-unselectable" data-val="6">6</div>'
                                    +'</div>'
                                    +'<div class="np-row">'
                                        +'<div class="np-col np-btn np-unselectable" data-val="1">1</div><div class="np-col np-btn np-unselectable" data-val="2">2</div><div class="np-col np-btn np-unselectable" data-val="3">3</div>'
                                    +'</div>'
                                    +'<div class="np-row">'
                                        +(plugin.settings.allowDecimals 
                                            ? '<div class="np-col np-btn np-unselectable" data-val="' + separatorValue + '">' + separatorDisplay + '</div>' 
                                            : '<div class="np-col np-unselectable">&nbsp;</div>')
                                        +'<div class="np-col np-btn np-unselectable" data-val="0">0</div>'
                                        +'<div class="np-col np-btn np-unselectable np-del-btn" data-val="del">' + plugin.settings.eraseLabel + '</div>'
                                    +'</div>'
                                +'</div>'
                            +'</div>'
                            +'<div class="np-ftr">'
                                +'<div class="np-btn-f np-unselectable np-cancel-btn" data-val="cancel">' + plugin.settings.cancelLabel + '</div>'
                                +'<div class="np-btn-f np-unselectable np-save-btn" data-val="save">' + plugin.settings.saveLabel + '</div>'
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
                        isPlaceholder = $val.hasClass('np-placeholder'),
                        val = isPlaceholder ? '' : $val.text(),
                        separator = plugin.settings.decimalSeparator == 'dot' ? '.' : ',';
                    switch (clickedVal) {
                        case 'clear':
                            val = '';
                            break;
                        case 'del':
                            if (!isPlaceholder) {
                                val = val ? val.substr(0, val.length - 1) : '';
                            }
                            break;
                        case 'separator-comma':
                        case 'separator-dot':
                            if (isPlaceholder) {
                                $val.removeClass('np-placeholder');
                                val = '';
                            }
                            if (val.indexOf(separator) == -1) {
                                if (val == '')
                                    val = '0';
                                val += separator;
                            }
                            break;
                        default:
                            if (isPlaceholder) {
                                $val.removeClass('np-placeholder');
                                val = '';
                            }
                            var parts = val.split(separator);
                            if (parts.length == 1)
                                parts.push('');
                            var hasSep = val.indexOf(separator) != -1;
                            // not let more than 2 digits after ,
                            if (parts[1].length < 2) {
                                // trim leading zeros before ,
                                parts[0] = parts[0].replace(/^0+/, '');
                                if (hasSep && parts[0].length == 0)
                                    parts[0] = '0';
                                val = hasSep ? parts.join(separator) : parts[0];
                                val += clickedVal;
                            }
                    }
                    plugin.setValue(val);
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

                var elmType = this.getElementTag();
                if (elmType == 'input' || elmType == 'textarea') {
                    this.$element.prop('readonly', true);
                }

                // show event handler
                this.$element.on(this.settings.show, function(e){
                    var plugin = $.data( this, "plugin_" + pluginName );
                    plugin.showPopup();
                });
            },
            getElementTag: function() {
                return this.element.tagName.toLowerCase();
            },
            showPopup: function() {
                var $wrap = getPopupContainer(this),
                    ww = $wrap.width(),
                    wh = $wrap.height(),
                    value;

                var elmType = this.getElementTag();
                if (elmType == 'input' || elmType == 'textarea') {
                    value = this.$element.val();
                } else {
                    value = this.$element.text();
                }
                this.setValue(value, true);

                // value may be set in onBeforeShow
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
                    // update element value
                    if (closeType == 'save') {
                        var elmType = this.getElementTag();
                        _value = this.formatValue(_value);
                        if (elmType == 'input' || elmType == 'textarea') {
                            this.$element.val(_value);
                        } else {
                            this.$element.text(_value);
                        }
                    }
                    $_wrap.find('.np-overlay, .np-popup')
                        .removeClass('np-show');
                    setTimeout(function(){
                        $_wrap.hide(function(){

                            if (typeof self.settings.onClose == 'function') {
                                self.settings.onClose({type: closeType, value: _value}, self);
                            }

                            $_wrap.remove();
                            $_wrap = null;
                            _value = '';
                        });
                    }, 200);
                }
            },
            formatValue: function(value) {
                var separator = this.settings.decimalSeparator == 'dot' ? '.' : ',',
                    precision = this.settings.precision,
                    regex = new RegExp('^\\d+(' + separator + '\\d{0,' + precision + '})?$');
                if (!regex.test(value)) {
                    value = value.replace(new RegExp('[^0-9' + separator + ']', 'g'), '');
                }
                if (regex.test(value)) {
                    if (this.settings.allowDecimals) {
                        var parts = value.split(separator);
                        if (parts.length == 1) {
                            parts[1] = '';
                        }
                        if (parts[1].length < precision) {
                            for (var i = 0; i <= precision - parts[1].length; i ++) {
                                parts[1] += '0';
                            }
                        }
                        value = parts.join(separator);
                    } else {
                        value = value.replace(new RegExp(separator + '\\d*$'), '');
                    }
                } else {
                    value = '';
                }
                return value;
            },
            getPlaceholder: function() {
                var separator = this.settings.decimalSeparator == 'dot' ? '.' : ',',
                    precision = this.settings.precision,
                    placeholder = '0';
                if (this.settings.allowDecimals) {
                    placeholder += separator;
                    for (var i = 0; i <= precision; i ++) {
                        placeholder += '0';
                    }
                }
                return placeholder;
            },
            setValue: function(value, doFormat) {
                var separator = this.settings.decimalSeparator == 'dot' ? '.' : ',',
                    precision = this.settings.precision,
                    placeholder = this.getPlaceholder(),
                    regex = new RegExp('^\\d+(' + separator + '\\d{0,' + precision + '})?$'),
                    clearButton = $_wrap.find('.np-clear-btn');
                doFormat = doFormat || false;
                _value = doFormat ? this.formatValue(value) : value;
                var $v = $_wrap.find('.np-value');
                if (_value == '') {
                    if (this.settings.allowEmpty) {
                        $v.text('')
                            .removeClass('np-placeholder');
                    } else {
                        $v.text(placeholder)
                            .addClass('np-placeholder');
                    }
                    clearButton.fadeOut(150);
                } else {
                    $v.text(_value)
                        .removeClass('np-placeholder');
                    clearButton.fadeIn(150);
                }
            }
        } );

        // plugin wrapper preventing multiple instantiations
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
                            plugin.setValue(args.value || '', true);
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
                188: 'separator-comma', // ,
                190: 'separator-dot', // .
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
