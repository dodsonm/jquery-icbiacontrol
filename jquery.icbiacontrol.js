/*jslint browser: true */
(function ($, window, document) {
	'use strict';

	var IcbiaControl, controlMap;

	IcbiaControl = function () {};

	IcbiaControl.prototype = {
		optionAttributePrefix: 'data-icbiacontrol-',
		initialize: function ($el, options) {
			this.$el = $el;
			this.options = $.extend(this.defaultOptions, this.getHtmlOptions(), options);
			this.$el
				.change($.proxy(this.changeHandler, this))
				.focus($.proxy(this.focusHandler, this))
				.blur($.proxy(this.blurHandler, this));
			this.wrap();
			this.updateHitArea();
			this.updateWidget();
		},

		blurHandler: function (event) {
			this.wrapper.removeClass('focus');
		},

		focusHandler: function (event) {
			this.wrapper.addClass('focus');
		},

		changeHandler: function (event) {
			this.updateWidget();
		},

		updateWidget: $.noop,

		updateHitArea: function () {
			this.$el
				.css({
					width: this.widget.width(),
					height: this.widget.height()
				});
		},

		getHtmlOptions: function () {
			var self = this,
			    opts = {};
			$.each(this.$el[0].attributes, function (i, attr) {
				if (attr.name.indexOf(self.optionAttributePrefix) !== -1) {
					opts[attr.name.substr(self.optionAttributePrefix.length)] = attr.value;
				}
			});
			return opts;
		},

		defaultOptions: {
		},

		createWidget: function () {
			var wt = this.options.widgetTemplate,
			    widget = typeof wt === 'function' ? wt() : $($(wt).html());

			return widget
				.removeAttr(this.optionAttributePrefix + 'widgetTemplate')
				.addClass('icbiacontrol-widget')
				.addClass('icbia' + this.controlName + '-widget');
		},

		wrap: function () {
			if (!this.wrapper) {
				this.widget = this.createWidget();
				this.wrapper = $('<span class="icbiacontrol"></span>')
					.addClass('icbia' + this.controlName)
					.css({
						position: 'relative',
						display: 'inline-block'
					})
					.append(this.widget)
					.insertBefore(this.$el)
					.append(
						this.$el.css({
							position: 'absolute',
							border: '1px solid #fff',  // To force the dimensions to take effect.
							top: 0,
							left: 0,
							opacity: 0
						})
					);
			}
		}
	};


	IcbiaControl.extend = function (attrs) {
		var SuperClass = this,
		    ctor = function () {};
		ctor.prototype = new SuperClass();
		ctor.prototype.constructor = ctor;
		$.extend(ctor.prototype, attrs);
		return ctor;
	};


	controlMap = {
		'select': IcbiaControl.extend({
			controlName: 'select',
			defaultOptions: $.extend({}, IcbiaControl.prototype.defaultOptions, {
				widgetTemplate: function () {
					return $(' ' +
							'<span>                                                        ' +
							'    <span class="icbiaselect-display-wrapper">                ' +
							'        <span class="icbiaselect-display"></span>             ' +
							'    </span>                                                   ' +
							'    <span class="icbiaselect-arrow"><i></i></span>            ' +
							'</span>                                                       '
						);
				}
			}),
			updateWidget: function () {
				var label = this.$el.find('option:selected').html();
				this.widget.find('.icbiaselect-display').html(label || '&nbsp;');
				this.updateHitArea();
			}
		}),
		'input[type=checkbox]': IcbiaControl.extend({
			controlName: 'checkbox',
			defaultOptions: $.extend({}, IcbiaControl.prototype.defaultOptions, {
				widgetTemplate: function () {
					return $('<span><i></i></span>');
				}
			}),
			updateWidget: function () {
				var isChecked = this.$el.is(':checked');
				this.wrapper
					.addClass(isChecked ? 'checked' : 'unchecked')
					.removeClass(isChecked ? 'unchecked' : 'checked');
				this.updateHitArea();
			}
		}),
		'input[type=radio]': IcbiaControl.extend({
			controlName: 'radio',
			defaultOptions: $.extend({}, IcbiaControl.prototype.defaultOptions, {
				widgetTemplate: function () {
					return $('<span><i></i></span>');
				}
			}),
			updateWidget: function () {
				var isChecked = this.$el.is(':checked'),
					siblings = this.$el.attr('name'); // potentially going to use this to target sibling buttons for update
				this.wrapper
					.addClass(isChecked ? 'checked' : 'unchecked')
					.removeClass(isChecked ? 'unchecked' : 'checked');
				this.updateHitArea();
			}
		})
	};


	function createIcbiaControl($el, options) {
		var plugin;
		$.each(controlMap, function (selector, Cls) {
			if ($el.is(selector)) {
				plugin = new Cls();
				plugin.initialize($el, options);
				return false;
			}
		});

		if (!plugin) {
			$.error('There\'s no control for the ' + $el.prop('tagName') + ' element ' + $el);
		}

		return plugin;
	}


	$.extend($.fn, {
		icbiaControl: function (optionsOrMethod) {
			var returnValue = this,
			    args = arguments;
			this.each(function (i, el) {
				var $el = $(el),
				    plugin = $el.data('icbiaControl'),
				    method = typeof optionsOrMethod === 'string' ? optionsOrMethod : null,
				    options = method === null ? optionsOrMethod || {} : {};

				if (!plugin) {
					if (method) {
						$.error('You can\'t call the icbiaControl method "' + method
								+ '" without first initializing the plugin by calling '
								+ 'icbiaControl() on the jQuery object.');
					} else {
						plugin = createIcbiaControl($el, options);
						$el.data('icbiaControl', plugin);
					}
				} else if (method) {
					if (typeof plugin[method] !== 'function') {
						$.error('Method "' + method + '" does not exist on jQuery.icbiaControl');
					} else {
						// NOTE: If you call a method that returns a value, you will only get the result from the last item in the collection.
						returnValue = plugin[method].apply(plugin, Array.prototype.slice.call(args, 1));
					}
				}
			});
			return returnValue;
		}
	});
}(this.jQuery, window, document));
