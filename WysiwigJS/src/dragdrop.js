class Drag
{
	constructor(elements, options)
	{
		this.draggables = elements;
		this.dropzone = this.getOption(options, 'dropzone', 'dropzone');
		this.dropElements = document.querySelectorAll('.' + this.dropzone);
		this.dragged = null;
		this.dragpreview = null;
		this.droppreview = null;

		for (let i = 0; i < this.draggables.length; i++)
		{
			this.draggables[i].draggable = true;
			this.draggables[i].addEventListener('dragstart', this.dragStart.bind(this));
		}

		for (let i = 0; i < this.dropElements.length; i++)
		{
			this.dropElements[i].addEventListener('dragenter', this.dragEnter.bind(this));
			this.dropElements[i].addEventListener("dragleave", this.dragLeave.bind(this));
			this.dropElements[i].addEventListener('drop', this.drop.bind(this));
			this.dropElements[i].addEventListener("dragover", this.dragOver.bind(this));
			this.dropElements[i].addEventListener('drag', this.drag.bind(this));
		}
	}

	getOption(options, key, defaults)
	{
		if (options && options[key])
		{
			return options[key];
		}
		return defaults;
	}

	isDropZone(el)
	{
		return el.classList.contains(this.dropzone);
	}

	dragStart(e)
	{
		console.log('DragStart', e);
		this.dragged = e.target;
		this.dragpreview = this.dragged.cloneNode(true);
		this.dragpreview.style.backgroundColor = "blue";
		this.dragpreview.style.position = "fixed";
		this.dragpreview.style.top = (-this.dragged.offsetHeight) + "px";
		this.dragpreview.style.right = (-this.dragged.offsetWidth) + "px";
		this.dragpreview.style.zIndex = "-1";
		document.body.appendChild(this.dragpreview);
		e.dataTransfer.setDragImage(this.dragpreview, 0, 0);
		this.droppreview = this.dragged.cloneNode(true);

		let thisRef = this;
		setTimeout(function ()
		{
			thisRef.dragged.style.display = "none";
		}, 1);
	}

	drag(e)
	{
		e.preventDefault();
		let closestElement = document.elementFromPoint(e.clientX, e.clientY);
		console.log('Drag', e, closestElement, e.currentTarget);
	}

	dragOver(e)
	{
		e.preventDefault();
		let i = 1;
		if (!this.isDropZone(e.currentTarget)) return;

		let closestElement = document.elementFromPoint(e.clientX, e.clientY);
		console.log('DragOver', e, closestElement, e.currentTarget);
		if (e.currentTarget.isEqualNode(closestElement))
		{
			e.currentTarget.appendChild(this.droppreview);
		}
		else
		{
			closestElement.parentNode.insertBefore(this.droppreview, closestElement)
		}
	}

	dragEnter(e)
	{
		e.preventDefault();
		if (!this.isDropZone(e.target)) return;

		console.log('DragEnter', e);
	}

	dragLeave(e)
	{
		if (!this.isDropZone(e.target)) return;

		console.log('DragLeave', e);
	}

	drop(e)
	{
		if (!this.isDropZone(e.currentTarget)) return;

		console.log('Drop', e);
		this.droppreview.parentNode.replaceChild(this.dragged, this.droppreview);
		this.dragged.style.display = "";
		this.dragged = null;
		this.dragpreview.parentNode.removeChild(this.dragpreview);
		this.dragpreview = null;
		this.droppreview.parentNode.removeChild(this.droppreview);
		this.droppreview = null;
	}
}