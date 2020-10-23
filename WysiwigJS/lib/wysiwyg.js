'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Wysiwyg = function Wysiwyg(container) {
	_classCallCheck(this, Wysiwyg);

	this.container = container;
	this.element = document.createElement('div');

	this.element.setAttribute('contenteditable', 'true');
	this.element.innerText = 'ConentEditable';

	container.appendChild(this.element);
};