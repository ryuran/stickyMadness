/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var APP = APP || {};

	window.Sticky = __webpack_require__(1);


	// MEDIA QUERY DEFINITION

	APP.mediaQuery = {};
	APP.mediaQuery.lg = window.matchMedia('(min-width: 1024px)');

	APP.stickyElem = document.querySelector('.js-stickable');
	APP.stickyElem.promArr = [];
	APP.stickyElem.images = APP.stickyElem.querySelectorAll('img');


	var header = document.getElementById('header');

	// PROMISE API

	APP.imgPromise = function (img) {

		return new Promise(function (resolve, reject) {
			img.addEventListener('load', function (e) {
				// we can do more but keep it simple for the sake of the demo
				resolve(img);
			}, false);
		});
	};

	// Create array of promises

	Array.prototype.forEach.call(APP.stickyElem.images, function (img, i) {
		// Stacking promise

		APP.imgPromise(img).then(function (rep) {
			rep.parentNode.classList.remove('loading');
		});

		APP.stickyElem.promArr.push(APP.imgPromise(img));
	});

	// Wait for all promise to be resolved

	Promise.all(APP.stickyElem.promArr).then(function () {

		if (APP.mediaQuery.lg.matches && !APP.stickyElem.sticky) {
			// a l'init on instancie sticky si il est null et qu on est dans la bonne MQ
			APP.stickyElem.sticky = new window.Sticky(APP.stickyElem,
				{
					offsetTop: function () {
						return header.offsetHeight;
					},

					onInit: function(){ console.log('onInit')}, // (element)
					onEnabling: function(){ console.log('onEnabling')}, // (element)
					onDisabling: function(){ console.log('onDisabling')}, // (element)
					onStick: function(){ console.log('onStick')}, // (element)
					onUnStick: function(){ console.log('onUnStick')}, // (element)
					onStuck: function(){ console.log('onStuck')}, // (element)
					onUnStuck: function(){ console.log('onUnStuck')} // (element)
				}
			);
		}

		APP.mediaQuery.lg.addListener(function (e) {

			if (e.matches) {
				if (!APP.stickyElem.sticky) {
					console.log('Match la MQ et sticky non instancié => on init');
					APP.stickyElem.sticky = new window.Sticky(APP.stickyElem);
				}
				else {
					console.log('Match la MQ et sticky DEJA instancié => on l’enable');
					APP.stickyElem.sticky.enable();
				}
			}
			else {
				console.log('Ne Match pas la MQ et est instancié donc on disable');
				APP.stickyElem.sticky.disable();
			}
		});
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory) {
	    if (true) {
	        // AMD
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
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

				console.log(this.position, this.offsetTop);

				console.log('limit : ', this.limitTop, this.limitBottom);

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
				if (!this.isStucked && this.position.bottom >= this.limitBottom) {
					this.el.classList.add(this.options.stuckClass);
					this.options.onStuck(this.el);
				}

				// ON DESTUCK
				if (this.isStucked && this.position.offsetTop >= this.offsetTop) {
					this.el.classList.remove(this.options.stuckClass);
					this.options.onUnStuck(this.el);
				}

				this.ticking = false;
			};

			return Sticky;

		})(window, document);
	}));


/***/ },
/* 2 */
/***/ function(module, exports) {

	// element-closest | CC0-1.0 | github.com/jonathantneal/closest

	if (typeof Element.prototype.matches !== 'function') {
		Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.webkitMatchesSelector || function matches(selector) {
			var element = this;
			var elements = (element.document || element.ownerDocument).querySelectorAll(selector);
			var index = 0;

			while (elements[index] && elements[index] !== element) {
				++index;
			}

			return Boolean(elements[index]);
		};
	}

	if (typeof Element.prototype.closest !== 'function') {
		Element.prototype.closest = function closest(selector) {
			var element = this;

			while (element && element.nodeType === 1) {
				if (element.matches(selector)) {
					return element;
				}

				element = element.parentNode;
			}

			return null;
		};
	}


/***/ }
/******/ ]);