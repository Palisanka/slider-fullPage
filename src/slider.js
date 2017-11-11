;(function() {
  'use strict';

  // Utilities helpers
  var utils = {

		// Extend an object to another one
    // From http://stackoverflow.com/questions/11197247/javascript-equivalent-of-jquerys-extend-method
    extend: function(defaults, options) {
      if (typeof(options) !== 'object') {
        options = {};
      }

      for (var key in options) {
        if (defaults.hasOwnProperty(key)) {
          defaults[key] = options[key];
        }

      }

      return defaults;

    },

		// Returns a function, that, as long as it continues to be invoked, will not
		// be triggered. The function will be called after it stops being called for
		// N milliseconds. If `immediate` is passed, trigger the function on the
		// leading edge, instead of the trailing.
    debounce: function(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this,
          args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      }
    },

    setStyle: function(el, property, value) {
      el.style[property.charAt(0).toLowerCase() + property.slice(1)] = value;

    },

		// Add webkit/moz/ms and other vendors to css property
    setVendor: function(el, property, value) {
      el.style[property.charAt(0).toLowerCase() + property.slice(1)] = value;
      el.style['webkit' + property] = value;
      el.style['moz' + property] = value;
      el.style['ms' + property] = value;
      el.style['o' + property] = value;
    },

		// Check if the el has the className
    hasClass: function(el, className) {
      if (el.classList) {
        return el.classList.contains(className);
      } else {
        return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
      }

    },

		// Add the className to the el
    addClass: function(el, className) {
      if (el.classList) {
        el.classList.add(className);
      } else if (!utils.hasClass(el, className)) {
        el.className += " " + className;
      }
    },

		// Remove the className to the el
    removeClass: function(el, className) {
      if (el.classList) {
        el.classList.remove(className)
      } else if (utils.hasClass(el, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
        el.className = el.className.replace(reg, ' ');
      }

    },

  };

	// Core function Slider
	// Define defaults, main variables and init()
  function Slider(element, options) {

    var defaults = {
      sliderSelector: '.slider',
			paginationSelector: '.slider__navigation',

      // Greensock options
      ease: 'SlowMo',
      easeType: 'easeOut',
      duration: 1,

      nextHtml: '',
      prevHtml: '',
      paginationHtml: '',
			isMoving: false,

      arrows: true,
      keyboard: true,
      pagination: true,
			paginationList: [],
			isHome: true,

      onLeave: null,
      afterLoad: null,

    };

		// Define global settings with defaults or user options
		this.settings = utils.extend(defaults, options);


    // Element
    this.el = document.querySelector(element);
    // body
    this.body = document.querySelector('body');
    // Container
    this.container = this.el.querySelector(this.settings.sliderSelector + '__container');
    // Sliders
    this.items = this.el.querySelectorAll(this.settings.sliderSelector + '__item');
		// Projets
		this.projets = {
			title :  document.getElementsByClassName('project__container__title'),
			infos :  document.getElementsByClassName('project__container__infos'),
			img :  document.getElementsByClassName('project__container__img')
		};

    //init
    this.init();

    return this;

  };

	// Init / Launch
  Slider.prototype.init = function() {

    this.index = 0;
    this.slideHeight = parseInt(getComputedStyle(this.items[0]).height);

		if (this.settings.arrows) {
      this.appendArrows();
    }

    if (this.settings.pagination) {
      this.appendPagination();
    }

    this.keyBinding();
    this.makeActive(this.index);

    if (typeof this.settings.afterLoad === 'function') {
      this.settings.afterLoad(this.index);
    }

  };

	// Add listeners on arrow / pagination
  Slider.prototype.keyBinding = function() {
    var self = this;

		// swipe
		(function swipeInit(){
			document.addEventListener('touchstart', handleTouchStart, false);
			document.addEventListener('touchmove', handleTouchMove, false);

			var xDown = null;
			var yDown = null;

			function handleTouchStart(evt) {
			    xDown = evt.touches[0].clientX;
			    yDown = evt.touches[0].clientY;
			};

			function handleTouchMove(evt) {
			    if ( ! xDown || ! yDown ) {
			        return;
			    }

			    var xUp = evt.touches[0].clientX;
			    var yUp = evt.touches[0].clientY;

			    var xDiff = xDown - xUp;
			    var yDiff = yDown - yUp;

			    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
			        if ( xDiff > 0 ) {
			            /* left swipe */
			        } else {
			            /* right swipe */
			        }
			    } else {
			        if ( yDiff > 0 ) {
								console.log('pass');
								self.moveToNext();
			        } else {
								self.moveToPrev();
			        }
			    }
			    /* reset values */
			    xDown = null;
			    yDown = null;
			};
		})();

		// scroll
		(function scrollInit(){

			// var wheel
			var mouseWheelEvt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
			if (document.attachEvent) //if IE (and Opera depending on user setting)
			document.attachEvent("on"+mouseWheelEvt, displaywheel)
			else if (document.addEventListener) //WC3 browsers
			document.addEventListener(mouseWheelEvt, displaywheel, false)

			// function to move on wheel event
			function displaywheel(e){
		    var evt=window.event || e //equalize event object
		    var delta=evt.detail? evt.detail*(-30) : evt.wheelDelta //check for detail first so Opera uses that instead of wheelDelta

				if(!self.settings.isMoving){
					if(delta<=-30){ // 30 est la résistance du scroll
						self.moveToNext();
					} else if(delta>=30){
						self.moveToPrev();
					}
				}
			}
		})();

		// keyboad
    if (this.settings.keyboard) {
      // document.addEventListener('keydown', this.keyboard.bind(this));
			document.addEventListener('keydown', function(event){
				if (event.keyCode === 37 || event.keyCode === 38) {
					self.moveToPrev();
				}

				if (event.keyCode === 39 || event.keyCode === 40) {
					self.moveToNext();

				}
			});
    }

		// arrows
    if (this.settings.arrows) {
      this.settings.nextHtml.addEventListener('click', this.moveToNext.bind(this));
      this.settings.prevHtml.addEventListener('click', this.moveToPrev.bind(this));
    }

		// pagination
    if (this.settings.pagination) {
      var paginationLinks = document.querySelectorAll(this.settings.paginationSelector+' li a');

      for (var i = 0; i < paginationLinks.length; i++) {

        (function(index) {

					paginationLinks[i].addEventListener('click', function(event) {
            self.move(index);
            event.preventDefault();
          });

        })(i); // end function

      } // end for()

    }

    window.addEventListener('resize', this.resize.bind(this), false);

  };

	// set is-active class
  Slider.prototype.makeActive = function(index) {
    var self = this;

    if (this.settings.pagination) {
			var paginationLinks = document.querySelectorAll(this.settings.paginationSelector+' li a');
    }

		// removeClass 'is-active'
    for (var i = 0; i < this.items.length; i++) {
      utils.removeClass(this.items[i], 'is-active');
      if (this.settings.pagination) {
				console.log(paginationLinks[i]);
        utils.removeClass(paginationLinks[i], 'is-active');
      }
    }

		// addClass 'is-active'
    utils.addClass(this.items[index], 'is-active');
    if (this.settings.pagination) {
      utils.addClass(paginationLinks[index], 'is-active');
    }

  };

	// gsap anim to scroll and to make appear a project
  Slider.prototype.move = function(index) {

    var self = this;

		self.settings.isMoving = true;

		var tl_scroll = new TimelineLite();
		var tl_project = new TimelineLite();

		if(this.projets.title[index-1]){
			var title = this.projets.title[index-1];
			var infos = this.projets.infos[index-1];
			var img = this.projets.img[index-1];
			tl_project.set([title, infos],{autoAlpha:0});
		}

    if (!utils.hasClass(this.items[index], 'is-active')) {

      tl_scroll.eventCallback('onStart', function() {

        if (self.settings.arrows) {
          utils.setStyle(self.settings.prevHtml, 'pointerEvents', 'none');
          utils.setStyle(self.settings.nextHtml, 'pointerEvents', 'none');
        }

        if (self.settings.pagination) {
          // utils.setStyle(this.settings.paginationHtml, 'pointerEvents', 'none');
        }

      });

      if (typeof self.settings.onLeave === 'function') {
        tl_scroll.add(self.settings.onLeave(self.index));
      }

      tl_scroll.to(this.container, this.settings.duration, {
        y: -index * this.slideHeight,
        ease: this.settings.ease + '.' + this.settings.easeType,
      }, '-=0.5');

      if (typeof self.settings.afterLoad === 'function') {
        tl_scroll.add(self.settings.afterLoad(index));
      }

			// Callback after the scroll
      tl_scroll.eventCallback('onComplete', function() {

				self.settings.isMoving = false;

				if(title) {
					tl_project.fromTo(title,0.5,{y:-150,autoAlpha:0},{y:0,autoAlpha:1})
					.fromTo(infos,0.5,{x:-100,autoAlpha:0},{x:0,autoAlpha:1});
				}

        if (self.settings.arrows) {
          utils.setStyle(self.settings.prevHtml, 'pointerEvents', 'auto');
          utils.setStyle(self.settings.nextHtml, 'pointerEvents', 'auto');
        }

        if (self.settings.pagination) {
          utils.setStyle(self.settings.paginationHtml, 'pointerEvents', 'auto');
        }

      });

    }

    this.index = index;

    this.makeActive(this.index);

    return tl_scroll;

  };

  Slider.prototype.moveToNext = function(index) {
    if ((this.index + 1) < this.items.length) {
      this.move(this.index + 1);
			if (!(this.index == 0)) {
				this.isHome(false);
			}
    }

  };

  Slider.prototype.moveToPrev = function() {
    if (this.index > 0) {
      this.move(this.index - 1);
			if (this.index == 0){
				this.isHome(true);
			}
    }

  };

	Slider.prototype.isHome = function(bool) {
    // if (bool == true) {
		// 	utils.removeClass(this.settings.paginationHtml, 'is-active');
    // } else {
		// 	utils.addClass(this.settings.paginationHtml, 'is-active');
		// }
  };

  Slider.prototype.appendArrows = function() {
    var arrows = document.createElement('div');
    arrows.setAttribute('class', 'slider-controls');

    var next = document.createElement('button');
    next.setAttribute('type', 'button');
    next.setAttribute('class', 'next');

    var prev = document.createElement('button');
    prev.setAttribute('type', 'button');
    prev.setAttribute('class', 'previous');

    this.el.appendChild(arrows);

    var controlsElement = this.el.querySelector('.slider-controls');
    controlsElement.appendChild(next);
    controlsElement.appendChild(prev);

    this.settings.nextHtml = next;
    this.settings.prevHtml = prev;

  };

  Slider.prototype.appendPagination = function() {
    var paginationList = '';

		if (this.settings.paginationList[0]) {
			console.log(this.settings.paginationList);
			for (var i = 0; i < this.items.length; i++) {
				paginationList += '<li><a data-index=\"' + i + '\" href=\"#' + i + '"\>' + this.settings.paginationList[i] + '</a></li>';
			}
		} else {
			for (var i = 0; i < this.items.length; i++) {
				if(i==0){
					paginationList += '<li><a data-index=\"' + i + '\" href=\"#' + i + '"\>Home</a></li>';
				} else {
					paginationList += '<li><a data-index=\"' + i + '\" href=\"#' + i + '"\>' + i + ' / ' + (this.items.length-1) + '</a></li>';
				}
			}
		}


    this.settings.paginationHtml = document.createElement('ul');
    this.settings.paginationHtml.setAttribute('class', 'slider__navigation');
    this.settings.paginationHtml.innerHTML = paginationList;

    this.body.appendChild(this.settings.paginationHtml);

  };

  Slider.prototype.resize = utils.debounce(function() {
    var self = this;

    self.slideHeight = parseInt(getComputedStyle(this.items[0]).height);

    var sliderOffset = self.slideHeight * self.index + 1;

    utils.setVendor(self.container, 'Transform', 'matrix(1, 0, 0, 1, -' + sliderOffset + ', 0)');

  }, 10);

  window.Slider = Slider;

}(window));
