/*
jquery-gradient-progress-bar - jQuery Plugin to draw animated progress bars with
gradient fill.

(Based on the excellent http://kottenator.github.io/jquery-circle-progress/)

URL:
Author: Lisandro Grassini
Version: 1.0
License: MIT
*/
(function($) {
    function GradientProgressBar(config) {
        this.init(config);
    }

    GradientProgressBar.prototype = {

        /**
         * This is the only required option. It should be from 0.0 to 1.0
         * @type {number}
         */
        value: 0.0,

        /**
         * Size of the progress bar in pixels
         * @type {number}
         */
        size: 100.0,

        /**
         * Width of the bar. By default it's auto-calculated as 1/14 of size, but you may set it explicitly in pixels
         * @type {number|string}
         */
        thickness: 'auto',

        /**
         * Fill of the bar. You may set it to:
         *   - solid color:
         *     - { color: '#3aeabb' }
         *     - { color: 'rgba(255, 255, 255, .3)' }
         *   - linear gradient (left to right):
         *     - { gradient: ['#3aeabb', '#fdd250'], gradientAngle: Math.PI / 4 }
         *     - { gradient: ['red', 'green', 'blue'], gradientDirection: [x0, y0, x1, y1] }
         */
        fill: {
            gradient: ['#3aeabb', '#fdd250']
        },

        /**
         * Color of the "empty" bar. Only a color fill supported by now
         * @type {string}
         */
        emptyFill: 'rgba(0, 0, 0, .1)',

        /**
         * Animation config (see jQuery animations: http://api.jquery.com/animate/)
         */
        animation: {
            duration: 1200,
            easing: 'gradientProgressBarEasing'
        },

        /**
         * Default animation starts at 0.0 and ends at specified `value`. Let's call this direct animation.
         * Also you may specify any other value from 0.0 to 1.0
         * @type {number}
         */
        animationStartValue: 0.0,

        /**
         * Bar line cap ('butt', 'round' or 'square')
         * Read more: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D.lineCap
         * @type {string}
         */
        lineCap: 'butt',


        /**
         * @protected
         */
        constructor: GradientProgressBar,

        /**
         * Container element. Should be passed into constructor config
         * @protected
         * @type {jQuery}
         */
        el: null,

        /**
         * Canvas element. Automatically generated and prepended to the {@link GradientProgressBar.el container}
         * @protected
         * @type {HTMLCanvasElement}
         */
        canvas: null,

        /**
         * 2D-context of the {@link GradientProgressBar.canvas canvas}
         * @protected
         * @type {CanvasRenderingContext2D}
         */
        ctx: null,

        /**
         * Fill of the main progress bar. Automatically calculated, depending on {@link GradientProgressBar.fill} option
         * @protected
         * @type {string|CanvasGradient|CanvasPattern}
         */
        barFill: null,

        /**
         * Last rendered frame value
         * @protected
         * @type {number}
         */
        lastFrameValue: 0.0,

        /**
         * Init/re-init the widget
         * @param {object} config - Config
         */
        init: function(config) {
            $.extend(this, config);
            this.initWidget();
            this.initFill();
            this.draw();
        },

        /**
         * @protected
         */
        initWidget: function() {
            var canvas = this.canvas = this.canvas || $('<canvas>').prependTo(this.el)[0];
            canvas.width = this.size;
            canvas.height = this.getThickness();
            this.ctx = canvas.getContext('2d');
        },

        /**
         * This method sets {@link GradientProgressBar.barFill}
         * It could do this async (on image load)
         * @protected
         */
        initFill: function() {
            var self = this,
                fill = this.fill,
                ctx = this.ctx,
                size = this.size;

            if (!fill)
                throw Error("The fill is not specified!");

            if (fill.color)
                this.barFill = fill.color;

            if (fill.gradient) {
                var gr = fill.gradient;

                if (gr.length == 1) {
                    this.barFill = gr[0];
                } else if (gr.length > 1) {
                    var ga = fill.gradientAngle || 0, // gradient direction angle; 0 by default
                        gd = fill.gradientDirection || [
                            size / 2 * (1 - Math.cos(ga)), // x0
                            size / 2 * (1 + Math.sin(ga)), // y0
                            size / 2 * (1 + Math.cos(ga)), // x1
                            size / 2 * (1 - Math.sin(ga))  // y1
                        ];

                    var lg = ctx.createLinearGradient.apply(ctx, gd);

                    for (var i = 0; i < gr.length; i++) {
                        var color = gr[i],
                            pos = i / (gr.length - 1);

                        if ($.isArray(color)) {
                            pos = color[1];
                            color = color[0];
                        }

                        lg.addColorStop(pos, color);
                    }

                    this.barFill = lg;
                }
            }
        },

        draw: function() {
            if (this.animation)
                this.drawAnimated(this.value);
            else
                this.drawFrame(this.value);
        },

        /**
         * @protected
         * @param {number} v - Frame value
         */
        drawFrame: function(v) {
            this.lastFrameValue = v;
            this.ctx.clearRect(0, 0, this.size, this.getThickness());
            this.drawEmptyBar(v);
            this.drawBar(v);
        },

        /**
         * @protected
         * @param {number} v - Frame value
         */
        drawBar: function(v) {
            var ctx = this.ctx,
                t = this.getThickness(),
                x = 0,
                y = this.getThickness() / 2;

            ctx.save();
            ctx.beginPath();

            if(this.lineCap == 'round') {
              x = this.getThickness() / 2;
            }

            ctx.moveTo(x, y);
            ctx.lineTo(this.size * v, y);

            ctx.lineWidth = t;
            ctx.lineCap = this.lineCap;
            ctx.strokeStyle = this.barFill;
            ctx.stroke();
            ctx.restore();
        },

        /**
         * @protected
         * @param {number} v - Frame value
         */
        drawEmptyBar: function(v) {
            var ctx = this.ctx,
                t = this.getThickness(),
                x = 0,
                y = this.getThickness() / 2;

            if (v < 1) {
                ctx.save();
                ctx.beginPath();

                ctx.moveTo(x, y);
                ctx.lineTo(this.size, y);

                ctx.lineWidth = t;
                ctx.strokeStyle = this.emptyFill;
                ctx.stroke();
                ctx.restore();
            }
        },

        /**
         * @protected
         * @param {number} v - Value
         */
        drawAnimated: function(v) {
            var self = this,
                el = this.el,
                canvas = $(this.canvas);

            // stop previous animation before new "start" event is triggered
            canvas.stop(true, false);
            el.trigger('progress-bar-animation-start');

            canvas
                .css({ animationProgress: 0 })
                .animate({ animationProgress: 1 }, $.extend({}, this.animation, {
                    step: function (animationProgress) {
                        var stepValue = self.animationStartValue * (1 - animationProgress) + v * animationProgress;
                        self.drawFrame(stepValue);
                        el.trigger('progress-bar-animation-progress', [animationProgress, stepValue]);
                    }
                }))
                .promise()
                .always(function() {
                    // trigger on both successful & failure animation end
                    el.trigger('progress-bar-animation-end');
                });
        },

        /**
         * @protected
         * @returns {number}
         */
        getThickness: function() {
            return $.isNumeric(this.thickness) ? this.thickness : this.size / 14;
        },

        getValue: function() {
            return this.value;
        },

        setValue: function(newValue) {
            if (this.animation)
                this.animationStartValue = this.lastFrameValue;
            this.value = newValue;
            this.draw();
        }
    };

    //-------------------------------------------- Initiating jQuery plugin --------------------------------------------
    $.gradientProgressBar = {
        // Default options (you may override them)
        defaults: GradientProgressBar.prototype
    };

    // ease-in-out-cubic
    $.easing.gradientProgressBarEasing = function(x, t, b, c, d) {
        if ((t /= d / 2) < 1)
            return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    };

    /**
     * Draw animated progress bar with gradient fill.
     *
     * Appends <canvas> to the element or updates already appended one.
     *
     * If animated, throws 3 events:
     *
     *   - progress-bar-animation-start(jqEvent)
     *   - progress-bar-animation-progress(jqEvent, animationProgress, stepValue) - multiple event;
     *                                                                        animationProgress: from 0.0 to 1.0;
     *                                                                        stepValue: from 0.0 to value
     *   - progress-bar-animation-end(jqEvent)
     *
     * @param configOrCommand - Config object or command name
     *     Example: { value: 0.75, size: 50, animation: false };
     *     you may set any public property (see above);
     *     `animation` may be set to false;
     *     you may use .gradientProgressBar('widget') to get the canvas
     *     you may use .gradientProgressBar('value', newValue) to dynamically update the value
     *
     * @param commandArgument - Some commands (like 'value') may require an argument
     */
    $.fn.gradientProgressBar = function(configOrCommand, commandArgument) {
        var dataName = 'gradient-progress-bar',
            firstInstance = this.data(dataName);

        if (configOrCommand == 'widget') {
            if (!firstInstance)
                throw Error('Calling "widget" method on not initialized instance is forbidden');
            return firstInstance.canvas;
        }

        if (configOrCommand == 'value') {
            if (!firstInstance)
                throw Error('Calling "value" method on not initialized instance is forbidden');
            if (typeof commandArgument == 'undefined') {
                return firstInstance.getValue();
            } else {
                var newValue = arguments[1];
                return this.each(function() {
                    $(this).data(dataName).setValue(newValue);
                });
            }
        }

        return this.each(function() {
            var el = $(this),
                instance = el.data(dataName),
                config = $.isPlainObject(configOrCommand) ? configOrCommand : {};

            if (instance) {
                instance.init(config);
            } else {
                var initialConfig = $.extend({}, el.data());
                if (typeof initialConfig.fill == 'string')
                    initialConfig.fill = JSON.parse(initialConfig.fill);
                if (typeof initialConfig.animation == 'string')
                    initialConfig.animation = JSON.parse(initialConfig.animation);
                config = $.extend(initialConfig, config);
                config.el = el;
                instance = new GradientProgressBar(config);
                el.data(dataName, instance);
            }
        });
    };
})(jQuery);
