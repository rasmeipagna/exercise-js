class GameOfLife {
	constructor(options) {
		this.container = Helper.getOption(options, 'container', Helper.appendElement(document.body, 'div', 'container'));
		this.rows = Helper.getOption(options, 'rows', 20);
		this.columns = Helper.getOption(options, 'columns', 30);
		this.cells = [];

		this.updateRowNumber(this.rows);
		this.updateColumnNumber(this.columns);

		this.updateCellElements();

		document.addEventListener('keyup', this.enterPressed.bind(this));
	}

	cellClick(row, column) {
		this.cells[row][column].classList.toggle('live');
		//this.cells[row][column].attributes['state'].value = '1';
	}

	enterPressed(e) {
		switch (e.key) {
			case "Enter":
				this.updateGrid();
				break;
			case "ArrowUp":
				this.updateRowNumber(++this.rows);
				break;
			case "ArrowDown":
				this.updateRowNumber(--this.rows);
				break;
			case "ArrowRight":
				this.updateColumnNumber(++this.columns);
				break;
			case "ArrowLeft":
				this.updateColumnNumber(--this.columns);
				break;
		}
	}

	updateRowNumber() {
		this.container.style.setProperty('--rows', this.rows);
		this.updateCellElements();
	}

	updateColumnNumber() {
		this.container.style.setProperty('--columns', this.columns);
		this.updateCellElements();
	}

	updateCellElements() {
		this.container.innerHTML = '';
		this.cells = [];
		for (let i = 0; i < this.rows; i++) {
			this.cells.push([]);
			for (let k = 0; k < this.columns; k++) {
				let cl = Helper.appendElement(this.container, 'div', 'cell');
				cl.addEventListener('click', this.cellClick.bind(this, i, k));
				this.cells[i].push(cl);
			}
		}
	}

	updateGrid() {
		console.time('updateState');
		for (let row = 0; row < this.cells.length; row++) {
			for (let column = 0; column < this.cells[row].length; column++) {
				this.updateState(row, column);
			}
		}
		console.timeEnd('updateState');
		console.time('updateState2');
		for (let row = 0; row < this.cells.length; row++) {
			for (let column = 0; column < this.cells[row].length; column++) {
				let el = this.cells[row][column];
				if (el.classList.contains('dies')) {
					el.classList.remove('live');
					el.classList.remove('dies');
				}
				else if (el.classList.contains('rebirth')) {
					el.classList.toggle('live', true);
					el.classList.remove('rebirth');
				}
			}
		}
		console.timeEnd('updateState2');
	}

	updateState(row, column) {
		let r = this.rows;
		let c = this.columns;
		let lives = 0;
		if (row > 0) {
			if (column > 0) {
				lives += this.doesCellLive(this.cells[row - 1][column - 1]);
			}
			lives += this.doesCellLive(this.cells[row - 1][column]);
			if (column < c - 1) {
				lives += this.doesCellLive(this.cells[row - 1][column + 1]);
			}
		}

		if (column > 0) {
			lives += this.doesCellLive(this.cells[row][column - 1]);
		}
		if (column < c - 1) {
			lives += this.doesCellLive(this.cells[row][column + 1]);
		}

		if (row < r - 1) {
			if (column > 0) {
				lives += this.doesCellLive(this.cells[row + 1][column - 1]);
			}
			lives += this.doesCellLive(this.cells[row + 1][column]);
			if (column < c - 1) {
				lives += this.doesCellLive(this.cells[row + 1][column + 1]);
			}
		}

		if (lives === 3) {
			this.cells[row][column].classList.toggle('rebirth', true);
		} else if (lives !== 2) {
			this.cells[row][column].classList.toggle('dies', true);
		}
	}

	doesCellLive(c) {
		return c.classList.contains('live') ? 1 : 0;
	}
}