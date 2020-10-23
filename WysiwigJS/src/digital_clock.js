class DigitalClock
{
	constructor(options)
	{
		this.container = Helper.getOption(options, 'container', document.body);
		this.mainElement = Helper.appendElement(this.container, 'div', 'clockcontainer');

		this.settings = {};
		this.initSettings();

		this.hourMode = Helper.getOption(options, 'hourMode', 24);
		this.hours = [
			new SingleNumber({ container: this.mainElement }),
			new SingleNumber({ container: this.mainElement })
		];
		Helper.appendElement(this.mainElement, 'div', 'separator')
		this.minutes = [
			new SingleNumber({ container: this.mainElement }),
			new SingleNumber({ container: this.mainElement })
		];
		Helper.appendElement(this.mainElement, 'div', 'separator')
		this.seconds = [
			new SingleNumber({ container: this.mainElement }),
			new SingleNumber({ container: this.mainElement })
		];

		this.updateSeconds();
		this.updateMinutes(new Date());
		this.updateHours(new Date());

		this.intervall = null;
		this.setTimer();
		this.updateSettings(null, true);
	}

	initSettings()
	{
		//this.settings.container = Helper.appendElement(this.mainElement, 'div', 'settings');
		//this.settings.run = Helper.appendElement(Helper.appendElement(this.settings.container, 'label', 'button fas fa-stop'), 'input', 'enableSound', {
		//	type: 'checkbox',
		//});
		//this.settings.run.addEventListener('click', this.updateSettings.bind(this));
		//this.settings.run.checked = true;

	}

	updateSettings(e, inititial)
	{
		//let run = this.settings.run.checked;
		//if (!inititial)
		//{
		//	if (run)
		//	{
		//		this.setTimer();
		//	}
		//	else
		//	{
		//		this.stopTimer();
		//	}
		//}
		//Helper.toggleClass(this.settings.run.parentElement, 'active', run);
		//Helper.toggleClass(this.settings.run.parentElement, 'fa-play', !run);
		//Helper.toggleClass(this.settings.run.parentElement, 'fa-stop', run);
	}

	setTimer()
	{
		this.intervall = setInterval(this.updateSeconds.bind(this), 1000);
	}

	stopTimer()
	{
		clearInterval(this.intervall);
	}

	updateSeconds()
	{
		let date = new Date();
		let seconds = 0;

		seconds = date.getSeconds();

		this.seconds[0].setNumber(Math.floor(seconds / 10));
		this.seconds[1].setNumber(seconds % 10);

		if (seconds === 0)
		{
			this.updateMinutes(date);
		}
	}

	updateMinutes(date)
	{
		let minutes = 0;

		minutes = date.getMinutes();

		this.minutes[0].setNumber(Math.floor(minutes / 10));
		this.minutes[1].setNumber(minutes % 10);

		if (minutes === 0)
		{
			this.updateHours(date);
		}
	}

	updateHours(date)
	{
		let hours = 0;

		hours = date.getHours() % this.hourMode;

		this.hours[0].setNumber(Math.floor(hours / 10));
		this.hours[1].setNumber(hours % 10);
	}
}

class SingleNumber
{
	constructor(options)
	{
		this.container = Helper.appendElement(Helper.getOption(options, 'container', document.body), 'div', 'number');
		this.lines = [
			Helper.appendElement(this.container, 'div', 'line top'),
			Helper.appendElement(this.container, 'div', 'vline topleft'),
			Helper.appendElement(this.container, 'div', 'vline topright'),
			Helper.appendElement(this.container, 'div', 'line middle'),
			Helper.appendElement(this.container, 'div', 'vline bottomleft'),
			Helper.appendElement(this.container, 'div', 'vline bottomright'),
			Helper.appendElement(this.container, 'div', 'line bottom')
		];
		this.number = Helper.getOption(options, 'number', 0);

		this.setNumber(this.number);
	}

	setNumber(number)
	{
		this.number = number;

		let actives = [false, false, false, false, false, false, false];

		switch (this.number)
		{
			case 0:
				actives = [true, true, true, false, true, true, true];
				break;
			case 1:
				actives = [false, false, true, false, false, true, false];
				break;
			case 2:
				actives = [true, false, true, true, true, false, true];
				break;
			case 3:
				actives = [true, false, true, true, false, true, true];
				break;
			case 4:
				actives = [false, true, true, true, false, true, false];
				break;
			case 5:
				actives = [true, true, false, true, false, true, true];
				break;
			case 6:
				actives = [true, true, false, true, true, true, true];
				break;
			case 7:
				actives = [true, false, true, false, false, true, false];
				break;
			case 8:
				actives = [true, true, true, true, true, true, true];
				break;
			case 9:
				actives = [true, true, true, true, false, true, true];
				break;
		}

		for (let i = 0; i < actives.length; i++)
		{
			Helper.toggleClass(this.lines[i], 'active', actives[i]);
		}
	}
}

class TimerClock extends DigitalClock
{
	constructor()
	{
		super();

		this.stopTimer();
		this.secondsNumber = 0;
		this.minutesNumber = 0;
		this.hoursNumber = 0;

		this.settings.run.checked = false;
		this.updateSettings(null);
		this.updateSeconds()

	}

	updateSeconds()
	{
		this.seconds[0].setNumber(Math.floor(this.secondsNumber / 10));
		this.seconds[1].setNumber(this.secondsNumber % 10);

		if (this.secondsNumber === 0)
		{
			this.updateMinutes();
		}

		this.secondsNumber = ++this.secondsNumber % 60;
	}

	updateMinutes()
	{
		this.minutes[0].setNumber(Math.floor(this.minutesNumber / 10));
		this.minutes[1].setNumber(this.minutesNumber % 10);

		if (this.minutesNumber === 0)
		{
			this.updateHours();
		}
		this.minutesNumber = ++this.minutesNumber % 60;
	}

	updateHours()
	{
		this.hours[0].setNumber(Math.floor(this.hoursNumber / 10));
		this.hours[1].setNumber(this.hoursNumber % 10);

		this.hoursNumber = ++this.hoursNumber % 24;
	}
}