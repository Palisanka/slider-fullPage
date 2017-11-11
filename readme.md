# Slider JS

> A full screen slider with gsap animation 

## Usage
```javascript
// with TweenMax.min.js
var slider = new Slider(".slider", {
	selector:'.slider',
	PaginationSelector:'.slider__navigation',
	paginationList:['Home', 'Item1', 'Item2', 'Item3'],
	arrows: false
});

document.querySelector('.button__scroll').addEventListener('click', function(){
	slider.moveToNext();
});
```

## Options

```javascript
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
```

## Methods

* init
* keyBinding
* makeActive
* move
* moveToNext
* moveToPrev
* isHome
* appendArrows
* appendPagination
* resize

With usefull utils methods.

Based on an other open source projet I can't find anymore, if you find it, please tell me.
