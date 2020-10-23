class Clock
{
	constructor(options)
	{
		this.container = Helper.getOption(options, 'container', document.body);
		this.clockcontainer = Helper.appendElement(this.container, 'div', 'clockcontainer');
		this.settings = {};
		this.initSettings();

		this.outerRad = Helper.getOption(options, 'outerRad', 150);
		this.innerRad = Helper.getOption(options, 'innerRad', 150);

		let outerSize = Math.max(this.outerRad, this.innerRad) * 2;
		Helper.setSizes(this.clockcontainer, outerSize);

		this.clock = Helper.appendElement(this.clockcontainer, 'div', 'clock');
		Helper.setSizes(this.clock, this.outerRad * 2);

		this.numbers = [];

		this.background = Helper.appendElement(this.clock, 'div', 'background');
		this.topleft = Helper.appendElement(this.clock, 'div', 'topleft');
		this.topright = Helper.appendElement(this.clock, 'div', 'topright');
		this.bottomleft = Helper.appendElement(this.clock, 'div', 'bottomleft');
		this.bottomright = Helper.appendElement(this.clock, 'div', 'bottomright');

		this.initScale(options);
		this.initNumbers();

		let tickingNoiseOptions = Helper.getOption(options, 'tickingnoiseseconds', {});
		this.tickingNoiseSeconds = false;
		if (Helper.getOption(tickingNoiseOptions, 'enabled', false))
		{
			this.tickingNoiseSeconds = new Audio(Helper.getOption(tickingNoiseOptions, 'src', 'src/media/clock-tick1.wav'));
		}

		document.body.click();
		this.initHands(options);

		this.updateSettings();

	}

	initScale(options)
	{
		let scaleOptions = Helper.getOption(options, 'scales', {});
		for (let i = 0; i < 60; i++)
		{
			let isMain = i % 5 === 0;
			let scale = Helper.appendElement(this.clock, 'div', 'scale');
			scale.style.height = Helper.getOption(scaleOptions, isMain ? 'mainrad' : 'minorrad', this.outerRad) + 'px';
			let scaleSub = Helper.appendElement(scale, 'div', isMain ? 'maintick' : '');
			Helper.setSizes(scaleSub, Helper.getOption(scaleOptions, 'width', 2), Helper.getOption(scaleOptions, 'height', isMain ? 20 : 10))
			scale.style.transform = 'translate(-50%, -100%) rotate(' + (6 * i) + 'deg)';
		}
	}

	initNumbers()
	{
		for (let i = 0; i < 12; i++)
		{
			this.numbers.push(new Number({
				number: i + 1,
				distance: this.innerRad
			}));
			this.clock.appendChild(this.numbers[i].element);
		}
	}

	initHands(options)
	{

		let hourhandOptions = Helper.getOption(options, 'hourhand', {});
		this.hourhand = new Hand({
			classes: 'hourhand',
			type: 'hour',
			width: Helper.getOption(hourhandOptions, 'width', 10),
			height: Helper.getOption(hourhandOptions, 'height', this.innerRad)
		});
		this.clock.appendChild(this.hourhand.hand);

		let minutehandOptions = Helper.getOption(options, 'minutehand', {});
		this.minutehand = new Hand({
			classes: 'minutehand',
			type: 'minute',
			parentHand: this.hourhand,
			width: Helper.getOption(minutehandOptions, 'width', 10),
			height: Helper.getOption(minutehandOptions, 'height', this.innerRad)
		});
		this.clock.appendChild(this.minutehand.hand);

		let secondhandOptions = Helper.getOption(options, 'secondhand', {});
		this.secondhand = new Hand({
			classes: 'secondhand',
			type: 'second',
			parentHand: this.minutehand,
			width: Helper.getOption(secondhandOptions, 'width', 10),
			height: Helper.getOption(secondhandOptions, 'height', this.innerRad)
		});
		this.clock.appendChild(this.secondhand.hand);
	}

	initSettings()
	{
		this.settings.container = Helper.appendElement(this.clockcontainer, 'div', 'settings');
		this.settings.enableSound = Helper.appendElement(Helper.appendElement(this.settings.container, 'label', 'button fas fa-volume-off'), 'input', 'enableSound', {
			type: 'checkbox',
		});
		this.settings.enableSound.addEventListener('click', this.updateSettings.bind(this));

	}

	updateSettings()
	{
		let soundEnabled = this.settings.enableSound.checked;
		this.secondhand.sound = soundEnabled ? this.tickingNoiseSeconds : false;
		Helper.toggleClass(this.settings.enableSound.parentElement, 'active', soundEnabled);
		Helper.toggleClass(this.settings.enableSound.parentElement, 'fa-volume-off', !soundEnabled);
		Helper.toggleClass(this.settings.enableSound.parentElement, 'fa-volume-up', soundEnabled);
	}
}

class Number
{
	constructor(options)
	{
		this.number = options.number;
		this.element = document.createElement('div');
		this.element.classList.add('number');
		this.element.setAttribute('data-number', this.number);

		this.distance = options.distance;

		let x = this.distance * Math.sin(Helper.degToRad(30 * this.number));
		let y = this.distance * Math.cos(Helper.degToRad(30 * this.number));
		this.element.style.transform = this.getTransform(x, -y);
	}

	getTransform(x, y)
	{
		return 'translate(-50%, -50%) translate(' + x + 'px, ' + y + 'px)';
	}
}

class Hand
{
	constructor(options)
	{
		this.hand = document.createElement('div');
		Helper.setSizes(this.hand, options.width, options.height);

		this.type = options.type;
		Helper.appendCssClass(this.hand, options.classes);

		this.parentHand = options.parentHand;
		this.sound = Helper.getOption(options, 'sound', false);

		this.updateAngle();

		if (this.type === 'second')
		{
			this.intervall = this.setTimer();
		}
	}

	setTimer()
	{
		return setInterval(this.updateAngle.bind(this), 1000);
	}

	updateAngle()
	{
		let angle = this.calcDeg();
		if (angle === 0)
		{
			this.hand.style.transitionDuration = '0s';
		}
		this.hand.style.transform = 'translate(-50%, -100%) rotate(' + angle + 'deg)';
		if (angle > 1)
		{
			this.hand.style.transitionDuration = '';
		}
		if (this.sound)
		{
			this.sound.play();
		}
	}

	calcDeg()
	{
		switch (this.type)
		{
			case 'hour':
				return this.calcDegHour();
			case 'minute':
				return this.calcDegMinute();
			case 'second':
				return this.calcDegSeconds();
		}

		return 0;
	}

	calcDegHour()
	{
		let hour = 0;
		let minutes = 0;
		let date = new Date();
		hour = date.getHours() % 12;
		minutes = date.getMinutes();

		return 360 * ((hour + minutes / 60) / 12);
	}

	calcDegMinute()
	{
		let minutes = 0;
		let date = new Date();
		minutes = date.getMinutes();

		this.parentHand.updateAngle();

		return 360 * (minutes / 60);
	}

	calcDegSeconds()
	{
		let seconds = 0;
		let date = new Date();
		seconds = date.getSeconds();

		if (seconds === 0)
		{
			this.parentHand.updateAngle();
		}

		return 360 * (seconds / 60);
	}
}