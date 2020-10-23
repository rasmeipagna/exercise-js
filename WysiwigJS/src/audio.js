class AudioHelper
{
	constructor()
	{
		this.audio = new Audio('src/media/clock-tick1.wav');
		this.audio.autoplay = true;
		document.addEventListener('click', this.init.bind(this));
	}

	init()
	{
		//this.audio.play();
		this.audio.crossOrigin = "anonymous";
		this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		this.analyser = this.audioCtx.createAnalyser();

		this.source = this.audioCtx.createMediaElementSource(this.audio);
		this.source.connect(this.analyser);
		this.source.connect(this.audioCtx.destination);

		this.bufferLength = this.analyser.frequencyBinCount;
		this.dataArray = new Uint8Array(this.analyser.fftSize);

		this.canvasElement = Helper.appendElement(document.body, 'canvas', 'canvas');
		this.canvasElement.width = 600;
		this.canvasElement.height = 400;
		this.ctx = this.canvasElement.getContext("2d");

		window.requestAnimationFrame(this.draw.bind(this));
	}

	draw()
	{
		this.audio.play();
		this.analyser.getByteTimeDomainData(this.dataArray);
		this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
		this.ctx.beginPath();
		this.ctx.moveTo(this.canvasElement.width, this.canvasElement.height);
		this.ctx.lineTo(0, 0);

		let sliceWidth = this.canvasElement.width * 1.0 / this.bufferLength;
		let x = 0;
		for (let i = 0; i < this.bufferLength; i++)
		{

			let v = this.dataArray[i] / 128.0;
			let y = v * this.canvasElement.height / 2;

			if (i === 0)
			{
				this.ctx.moveTo(x, y);
			} else
			{
				this.ctx.lineTo(x, y);
			}

			x += sliceWidth;
		}

		this.ctx.stroke();

		window.requestAnimationFrame(this.draw.bind(this));
	}
}