class Wysiwyg 
{
	constructor(container, options)
	{
		document.execCommand('styleWithCSS', false, true);

		this.container = container;
		this.element = document.createElement('div');
		this.toolbar = this.initOptions(options || {});

		this.element.setAttribute('contenteditable', 'true');
		this.element.innerText = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.';

		this.toolbar.element.classList.add('toolbar');

		this.container.appendChild(this.toolbar.element);
		this.container.appendChild(this.element);

		this.initToolbar();
	}

	availableButtons(key)
	{
		let buttons = {
			'bold': new CommandButton('bold', { cssClasses: ['fa-bold'] }),
			'italic': new CommandButton('italic', { cssClasses: ['fa-italic'] }),
			'underline': new CommandButton('underline', { cssClasses: ['fa-underline'] }),
			'separator': new Separator(),
			'fontsize': new FontSizeButton({ wysiwygElem: this.element }),
			'fontfamily': new FontFamilyButton(),
			'forecolor': new ColorCommandButton('foreColor', { cssClasses: ['fa-font'] }),
			'backcolor': new ColorCommandButton('backColor', {
				cssClasses: ['fa-highlighter', 'backColor']
			}),
			'strikethrough': new CommandButton('strikeThrough', { cssClasses: ['fa-strikethrough'] }),
			'superscript': new CommandButton('superscript', { cssClasses: ['fa-superscript'] }),
			'subscript': new CommandButton('subscript', { cssClasses: ['fa-subscript'] }),
			'ul': new CommandButton('insertUnorderedList', { cssClasses: ['fa-list-ul'] }),
			'ol': new CommandButton('insertOrderedList', { cssClasses: ['fa-list-ol'] }),
			'outdent': new CommandButton('outdent', { cssClasses: ['fa-outdent'] }),
			'indent': new CommandButton('indent', { cssClasses: ['fa-indent'] }),
			'left': new CommandButton('justifyLeft', { cssClasses: ['fa-align-left'] }),
			'center': new CommandButton('justifyCenter', { cssClasses: ['fa-align-center'] }),
			'right': new CommandButton('justifyRight', { cssClasses: ['fa-align-right'] }),
			'full': new CommandButton('justifyFull', { cssClasses: ['fa-align-justify'] }),
			'undo': new CommandButton('undo', { cssClasses: ['fa-undo'] }),
			'redo': new CommandButton('redo', { cssClasses: ['fa-redo'] }),
			'removeformat': new CommandButton('removeFormat', { cssClasses: ['fa-ban'] }),
		}

		return buttons[key];
	}

	getDefaults()
	{
		return {
			element: document.createElement('div'),
			buttons: ['bold', 'italic', 'underline', 'separator',
				'fontsize', 'fontfamily', 'forecolor', 'backcolor', 'separator',
				'strikethrough', 'superscript', 'subscript', 'separator',
				'ul', 'ol', 'outdent', 'indent', 'separator',
				'left', 'center', 'right', 'full', 'separator',
				'undo', 'redo', 'removeformat'
			]
		};
	}

	initOptions(options)
	{
		let defaults = this.getDefaults();
		let fButtons = options.buttons || defaults.buttons;

		let initButtons = [];
		for (let i = 0; i < fButtons.length; i++)
		{
			initButtons.push(this.availableButtons(fButtons[i]));
		}

		let element = options.element || defaults.element;

		return {
			element: element,
			buttons: initButtons
		};
	}

	initToolbar()
	{
		let thisRef = this;
		this.toolbar.buttons.forEach(function (button)
		{
			thisRef.toolbar.element.appendChild(button.element);
		})
	}
}

class CommandButton
{
	constructor(command, options)
	{
		this.command = command;
		this.element = document.createElement(options.tag || 'div');
		this.cssClasses = ['button', 'fa'].concat(options.cssClasses || []);

		let thisRef = this;
		this.cssClasses.forEach(function (cssClass)
		{
			thisRef.element.classList.add(cssClass);
		});

		delete options.cssClasses;
		delete options.tag;

		this.options = {};
		for (let key in options)
		{
			this.options[key] = options[key];
		}

		this.init();
	}

	init()
	{
		this.mouseDownEvent();
		this.commandEvent();
	}

	mouseDownEvent()
	{
		this.element.addEventListener('mousedown', function (e)
		{
			e.preventDefault();
		});
	}

	commandEvent()
	{
		this.element.addEventListener('click', function ()
		{
			document.execCommand(thisRef.command);
		});
	}
}

class ColorCommandButton extends CommandButton
{
	constructor(command, options)
	{
		if (options == undefined || options == null)
		{
			options = {};
		}
		options.tag = options.tag || 'label';
		options.cssClasses = ['colorButton'].concat(options.cssClasses || []);
		super(command, options);		
	}

	init()
	{
		this.input = document.createElement('input');
		this.input.setAttribute('type', 'color');

		this.element.appendChild(this.input);

		this.mouseDownEvent();
		this.commandEvent();
	}

	mouseDownEvent()
	{
		let thisRef = this;
		this.element.addEventListener('mousedown', function (e)
		{
			e.preventDefault();
			thisRef.input.click();
		});
	}

	commandEvent()
	{
		let thisRef = this;
		this.input.addEventListener('input', function ()
		{
			document.execCommand(thisRef.command, false, thisRef.input.value);
			thisRef.input.parentNode.style.color = thisRef.input.value;
		});
	}
}

class FontSizeButton extends CommandButton
{
	constructor(options)
	{
		if (options == undefined || options == null)
		{
			options = {};
		}
		options.tag = 'select';
		options.sizes = options.sizes || [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
		super('fontSize', options);
	}

	init()
	{
		let thisRef = this;

		this.options.sizes.forEach(function (size)
		{
			let opt = document.createElement('option');
			opt.setAttribute('value', size);
			opt.innerText = size;
			thisRef.element.appendChild(opt);
		});

		this.commandEvent();
	}

	commandEvent()
	{
		let thisRef = this;
		this.element.addEventListener('change', function ()
		{
			thisRef.setFontSize.call(thisRef, thisRef.element.value);
		});
	}

	setFontSize(size)
	{
		let defSize = parseInt(document.queryCommandValue("fontsize"));
		defSize = defSize == 7 ? defSize - 1 : defSize + 1;
		document.execCommand('styleWithCSS', false, false);
		document.execCommand('fontSize', false, defSize);

		let changedElems = this.options.wysiwygElem.querySelectorAll("font[size='" + defSize + "']");
		for (let i = 0; i < changedElems.length; i++)
		{
			let newNode = document.createElement("span");
			newNode.setAttribute("style", "font-size:" + size + "px");
			newNode.innerHTML = changedElems[0].innerHTML;
			this.options.wysiwygElem.replaceChild(newNode, changedElems[0]);
		}
		document.execCommand('styleWithCSS', false, true);
	}
}

class FontFamilyButton extends CommandButton
{
	constructor(options)
	{
		if (options == undefined || options == null)
		{
			options = {};
		}
		options.tag = 'select';
		options.fonts = options.fonts || ['Roboto', 'Arial', 'Calibri', 'Times New Roman', 'Helvetia', 'Comic Sans MS', 'Fantasy', 'cursive', 'monospace'];
		super('fontName', options);
	}

	init()
	{
		let thisRef = this;

		this.options.fonts.forEach(function (font)
		{
			let opt = document.createElement('option');
			opt.setAttribute('value', font);
			opt.innerText = font;
			thisRef.element.appendChild(opt);
		});

		this.commandEvent();
	}

	commandEvent()
	{
		let thisRef = this;
		this.element.addEventListener('change', function ()
		{
			document.execCommand('fontName', false, thisRef.element.value);
		});
	}
}

class Separator extends CommandButton
{
	constructor(options)
	{
		if (options == undefined || options == null)
		{
			options = {};
		}
		options.cssClasses = ['separator'].concat(options.cssClasses || []);
		options.tag = options.tag || 'span';
		super('', options);

		this.init();
	}

	init()
	{
		this.element.classList.remove('button', 'fa');
	}
}