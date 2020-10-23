
class Helper
{
	static getOption(options, key, defaults)
	{
		if (options && options[key])
		{
			return options[key];
		}
		return defaults;
	}

	static appendElement(container, tag, classes = '', attributes = {}, innerText = '')
	{
		let newElement = document.createElement(tag);
		if (classes !== '')
		{
			Helper.appendCssClass(newElement, classes);
		}
		if (attributes !== {})
		{
			Helper.appendAttributes(newElement, attributes);
		}
		newElement.innerText = innerText;
		container.appendChild(newElement);
		return newElement;
	}

	static appendCssClass(elem, cssClass)
	{
		let cls = cssClass.split(' ');
		for (let i = 0; i < cls.length; i++)
		{
			elem.classList.add(cls[i]);
		}
	}

	static appendAttributes(elem, attributes)
	{
		for (let key in attributes)
		{
			elem.setAttribute(key, attributes[key]);
		}
	}

	static degToRad(deg)
	{
		return deg * Math.PI / 180;
	}

	static setSizes(element, width, height)
	{
		element.style.width = width + 'px';
		element.style.height = (height || width) + 'px';
	}

	static toggleClass(elem, cssClass, force)
	{
		if (force)
		{
			elem.classList.add(cssClass);
		}
		else
		{
			elem.classList.remove(cssClass);
		}
	}
}