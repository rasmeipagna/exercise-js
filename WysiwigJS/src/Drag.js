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
		this.droppedInZone = false;

		this.mouseMoveBound = this.mouseMove.bind(this);
		this.mouseUpBound = this.mouseUp.bind(this);
		this.mouseUpDropZoneBound = this.mouseUpDropZone.bind(this);
		this.mouseMoveDropZoneBound = this.mouseMoveDropZone.bind(this);

		for (let i = 0; i < this.draggables.length; i++)
		{
			this.draggables[i].addEventListener('mousedown', this.mouseDown.bind(this));
		}
	}

	isDropZone(el)
	{
		return el.classList.contains(this.dropzone);
	}

	getOption(options, key, defaults)
	{
		if (options && options[key])
		{
			return options[key];
		}
		return defaults;
	}

	updateDragPreviewPosition(x, y)
	{
		this.dragpreview.style.left = (x - this.dragpreview.offsetWidth) + 'px';
		this.dragpreview.style.top = (y - this.dragpreview.offsetHeight) + 'px';
	}

	mouseDown(e)
	{
		console.log('MouseDown', e);
		this.dragged = e.currentTarget;

		this.dragpreview = this.dragged.cloneNode(true);
		this.dragpreview.style.position = "fixed";
		this.updateDragPreviewPosition(e.clientX, e.clientY);

		this.droppreview = this.dragged.cloneNode(true);

		document.body.appendChild(this.dragpreview);
		document.addEventListener('mousemove', this.mouseMoveBound);
		document.addEventListener('mouseup', this.mouseUpBound);

		for (let i = 0; i < this.dropElements.length; i++)
		{
			this.dropElements[i].addEventListener('mouseup', this.mouseUpDropZoneBound);
			this.dropElements[i].addEventListener('mousemove', this.mouseMoveDropZoneBound);
		}

		this.dragged.classList.add('dragged');
		this.dragpreview.classList.add('dragpreview');
		this.droppreview.classList.add('droppreview');
	}

	mouseMove(e)
	{
		console.log('MouseMove', e);
		if (this.dragpreview == null) return;

		this.updateDragPreviewPosition(e.clientX, e.clientY);
	}

	mouseMoveDropZone(e)
	{
		console.log('MouseMoveDropZone', e);

		if (!this.isDropZone(e.currentTarget)) return;

		let closestElement = document.elementFromPoint(e.clientX, e.clientY);

		if (e.currentTarget.isEqualNode(closestElement))
		{
			e.currentTarget.appendChild(this.droppreview);
		}
		else
		{
			if (e.clientX > (closestElement.offsetLeft + closestElement.offsetWidth / 2))
			{
				closestElement.parentNode.insertBefore(this.droppreview, closestElement.nextSibling)
			}
			else
			{
				closestElement.parentNode.insertBefore(this.droppreview, closestElement);
			}
		}
	}

	mouseUpDropZone(e)
	{
		console.log('MouseUpDropZone', e);

		if (!this.isDropZone(e.currentTarget)) return;

		this.droppreview.parentNode.replaceChild(this.dragged, this.droppreview);

		this.droppedInZone = true;
	}

	mouseUp(e)
	{
		console.log('MouseUp', e);

		this.dragpreview.parentNode.removeChild(this.dragpreview);
		this.dragpreview = null;

		if (this.droppreview.parentNode != null && this.droppreview.parentNode != null && this.droppreview.parentNode.contains(this.droppreview))
		{
			this.droppreview.parentNode.removeChild(this.droppreview);
		}
		this.droppreview = null;

		document.removeEventListener('mousemove', this.mouseMoveBound);
		document.removeEventListener('mouseup', this.mouseUpBound);
		for (let i = 0; i < this.dropElements.length; i++)
		{
			this.dropElements[i].removeEventListener('mouseup', this.mouseUpDropZoneBound);
			this.dropElements[i].removeEventListener('mousemove', this.mouseMoveDropZoneBound);
		}

		this.dragged.classList.remove('dragged');
		this.dragged = null;
	}
}