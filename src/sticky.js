(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['element-closest'], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory(require('element-closest'));
    } else {
        // Browser globals (root is window)
        root.Sticky = factory();
    }
}(this, function () {

	return (function (window, document) {

		var defaultOptions = {
			stickClass: 'js-sticked',
			stuckClass: 'js-stuck',
			limitSelector: '.js-sticky-container', // must be a ancestor of el

			offsetTop: 0,

			limitTop: function (stickyObject) {
				return stickyObject.el.parentNode.getBoundingClientRect().top + stickyObject.getScrollY();
			},
			limitBottom: function (stickyObject) {
				return stickyObject.limit.getBoundingClientRect().bottom + stickyObject.scrollY;
			},

			// callbacks
			onInit: function(){}, // (element)
			onEnabling: function(){}, // (element)
			onDisabling: function(){}, // (element)
			onStick: function(){}, // (element)
			onUnStick: function(){}, // (element)
			onStuck: function(){}, // (element)
			onUnStuck: function(){} // (element)
		};

		// utils
		function isFunction(f) {
			return f && Object.prototype.toString.call(f) === '[object Function]';
		}

		function extend(out) {
			out = out || {};

			for (var i = 1; i < arguments.length; i++) {
				if (!arguments[i])
				continue;

				for (var key in arguments[i]) {
					if (arguments[i].hasOwnProperty(key)) {
						out[key] = arguments[i][key];
					}
				}
			}

			return out;
		}

		// @contructor
		function Sticky(el, opt) {

			this.options = extend({}, defaultOptions, opt);

			this.el = el;

			this.limit = this.el.closest(this.options.limitSelector);

			this.getLimitTop = function () {
				return isFunction(this.options.limitTop) ? this.options.limitTop(this) : this.options.limitTop;
			}.bind(this);

			this.getLimitBottom = function () {
				return isFunction(this.options.limitBottom) ? this.options.limitBottom(this) : this.options.limitBottom;
			}.bind(this);

			this.getOffsetTop = function () {
				return isFunction(this.options.offsetTop) ? this.options.offsetTop(this) : this.options.offsetTop;
			}.bind(this);

			this.scrollY = 0;

			this.offsetTop = 0;

			this.position= {
				offsetTop: 0,
				top: 0,
				bottom: 0
			};

			this.isSticked = false;
			this.isStucked = false;

			this.ticking = false;
			this.raf = null; // Request Animation Frame

			this.enabled = false;

			this.init();
		}

		Sticky.prototype.init = function init() {
			this.options.onInit(this);

			this.updateLimit();

			if(!this.enabled &&  this.el.offsetHeight < (this.limitBottom - this.limitTop)){
				this.enable();
			}
		};

		Sticky.prototype.onScroll = function onScroll() {
			this.getScrollY();
			this.requestTick();
		};

		Sticky.prototype.getScrollY = function getScrollY() {
			this.scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
			return this.scrollY;
		};

		Sticky.prototype.onResize = function onResize() {
			// refresh calculation
			this.updateLimit();
			this.updateOffset();
			this.updatePosition();
		};

		Sticky.prototype.requestTick = function requestTick() {
			if (!this.ticking) {
				this.raf = window.requestAnimationFrame(this.stickOrStuck.bind(this));
				this.ticking = true;
			}
		};

		Sticky.prototype.disable = function disable() {
			// remove event handler and clean class relative to the sticky state
			window.removeEventListener('scroll', this.onScroll);
			window.removeEventListener('resize', this.onResize);

			this.el.classList.remove(this.options.stickClass);
			this.el.classList.remove(this.options.stuckClass);

			this.el.style.removeProperty('top');

			this.options.onDisabling(this);

			this.enabled = false;
		};

		Sticky.prototype.enable = function enable() {
			this.options.onEnabling(this);

			this.updatePosition();
			this.updateOffset();

			this.onScroll();

			this.onScroll = this.onScroll.bind(this);
			this.onResize = this.onResize.bind(this);

			window.addEventListener('scroll', this.onScroll);
			window.addEventListener('resize', this.onResize);

			this.enabled = true;
		};

		Sticky.prototype.updateLimit = function updateLimit() {
			this.limitTop = this.getLimitTop(this);
			this.limitBottom = this.getLimitBottom(this);
		};

		Sticky.prototype.updateOffset = function updateOffset() {
			this.offsetTop = this.getOffsetTop(this);
		};

		Sticky.prototype.updatePosition =  function updatePosition() {
			this.position.offsetTop = this.el.getBoundingClientRect().top;
			this.position.top = this.position.offsetTop + this.scrollY;
			this.position.bottom = this.position.top + this.el.offsetHeight;
		}

		Sticky.prototype.stickOrStuck = function stickOrStuck()  {
			// console.log('scrollHandler is fired');

			this.isSticked = this.el.classList.contains(this.options.stickClass);
			this.isStucked = this.el.classList.contains(this.options.stuckClass);

			// only calcul position relative to vewport
			this.updatePosition();

			if(this.el.offsetHeight >= (this.limitBottom - this.limitTop)) {
				this.disable();
				return;
			}

			// ON STICK
			if (!this.isSticked && this.position.offsetTop < this.offsetTop) {
				this.el.classList.add(this.options.stickClass);
				this.options.onStick(this.el);
				this.el.style.top = this.offsetTop + 'px';
			}

			// ON DESTICK
			if (this.isSticked && this.position.top <= this.limitTop) {
				this.el.classList.remove(this.options.stickClass);
				this.options.onUnStick(this.el);
				this.el.style.removeProperty('top');
			}

			// ON STUCK
			if (!this.isStucked && this.position.bottom > this.limitBottom) {
				this.el.classList.add(this.options.stuckClass);
				this.options.onStuck(this.el);
			}

			// ON DESTUCK
			if (this.isStucked && this.position.offsetTop > this.offsetTop) {
				this.el.classList.remove(this.options.stuckClass);
				this.options.onUnStuck(this.el);
			}

			this.ticking = false;
		};

		return Sticky;

	})(window, document);
}));
