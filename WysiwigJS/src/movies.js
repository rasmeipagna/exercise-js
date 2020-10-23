class MovieChart {
	constructor(elem) {
		this.container = d3.select(elem);
		this.width = 800;
		this.height = 600;
		this.currentPage = 1;
		this.currentGenre = null;

		//this.getGenres()
		//	.then(data => this.drawGenres.call(this, data));
		this.keywordContainer = this.createKeyWordsContainer();
	}

	format() {
	}

	color() {
		return d3.scaleOrdinal().range(d3.schemeCategory10);
	}

	fillKeyWordList(data) {
		console.log(data);
		let keyWordList = this.keywordContainer.select('ul');

		keyWordList.html(null);
		keyWordList.selectAll('li')
			.data(data.results)
			.enter()
			.append('li')
			.text(d => d.name);
	}

	createKeyWordsContainer() {
		let thisRef = this;

		let kcontainer = this.container.append('div')
			.attr('class', 'keywords');

		let keyWordInput = kcontainer.append('input')
			.attr('type', 'text')
			.attr('class', 'keywords')
			.on('keyup', function (e) {
				thisRef.searchKeyWords(this.value)
					.then(data => thisRef.fillKeyWordList.call(thisRef, data));
			});

		let keyWordlist = kcontainer.append('ul');

		return kcontainer;
	}

	searchKeyWords(query) {
		return fetch(this.getUrl("search/keyword", { query: query }))
			.then(response => response.json());
	}

	drawGenres(data) {
		let thisRef = this;
		let radius = 50;
		let diameter = 2 * radius;
		let strokeWidth = diameter / 10;
		let cols = Math.ceil(this.width / (diameter + 2 * strokeWidth));
		let rows = Math.round(data['genres'].length / cols);

		let clr = this.color();
		let svg = this.container.append('svg')
			.attr("width", this.width)
			.attr("height", rows * (diameter + 2 * strokeWidth));

		let gx = (i) => (i % cols) * (diameter + 1 * strokeWidth) + strokeWidth;
		let gy = (i) => Math.trunc(i / cols) * (diameter + 1 * strokeWidth) + strokeWidth;

		let groups = svg.selectAll('.genreGroup')
			.data(data['genres'])
			.enter()
			.append('g')
			.attr('class', 'genreGroup')
			.attr('transform', (d, i) => 'translate(' + gx(i) + ',' + gy(i) + ')')
			.on('mouseenter', function (e, i) {
				let circle = d3.select(this).select('circle');
				circle
					.attr('stroke', d3.rgb(clr(i)).darker(0.7))
					.attr('fill', d3.rgb(clr(i)).brighter(0.4));
			})
			.on('mouseleave', function (e, i) {
				let circle = d3.select(this).select('circle');
				circle
					.attr('stroke', d3.rgb(clr(i)).darker(0.4))
					.attr('fill', clr(i));
			})
			.on('click', function (e) {
				thisRef.currentPage = 1;
				thisRef.currentGenre = e.id;
				thisRef.getMoviesByGenre(thisRef.currentGenre, thisRef.currentPage)
					.then(data => thisRef.updateResultTable.call(thisRef, data));
			});

		groups.append('circle')
			.attr('cx', radius)
			.attr('cy', radius)
			.attr('r', radius)
			.attr('stroke-width', strokeWidth)
			.attr('stroke', (d, i) => d3.rgb(clr(i)).darker(0.4))
			.attr('fill', (d, i) => clr(i));

		groups.append('text')
			.text(d => d.name)
			.attr('x', radius)
			.attr('y', radius)
			.attr('dominant-baseline', 'central')
			.attr('text-anchor', 'middle')
			.attr('textLength', diameter - strokeWidth)
			.attr('lengthAdjust', 'spacingAndGlyphs');
	}

	getUrl(action, params) {
		let key = "api_key=fa832f0f6b441ec182a73313dd02603b";
		let baseUrl = "https://api.themoviedb.org/3/";
		let query = "";
		for (let p in params) {
			query += p + "=" + params[p] + "&";
		}

		return baseUrl + action + "?" + query + key;
	}

	getImageUrl(image, width) {
		let baseURL = 'https://image.tmdb.org/t/p/';
		return baseURL + (width || 'w185') + '/' + image;
	}

	getGenres() {
		return fetch(this.getUrl("genre/movie/list", {}))
			.then(response => response.json());
	}

	getMoviesByGenre(genreID, page) {
		return fetch(this.getUrl("discover/movie", { with_genres: genreID, page: page }))
			.then(response => response.json());
	}

	updateResultTable(data) {
		let thisRef = this;

		let mapping = [
			{ title: 'ID', value: d => d['id'] },
			{ title: 'Title', value: d => d['title'] },
			{ title: '', value: d => '<img src="' + this.getImageUrl(d['poster_path']) + '" >' },
			{ title: 'Description', value: d => d['overview'] }
		];

		let table = this.container.select('table');
		if (table.empty()) {
			table = this.createTableElements(this.container);
		}

		let thead = table.select('thead');
		let tbody = table.select('tbody');

		thead.html(null);

		let pager = this.createPager(thead, data, mapping);

		thead.append('tr')
			.attr('class', 'header')
			.selectAll('th')
			.data(mapping.map(t => t.title))
			.enter()
			.append('th')
			.text(d => d);

		tbody.html(null);
		let rows = tbody.selectAll('tr')
			.data(data.results)
			.enter()
			.append('tr');

		rows
			.selectAll('td')
			.data(function (d) {
				return mapping.map(v => v.value(d));
			})
			.enter()
			.append('td')
			.html(d => {
				return d;
			});


	}

	createTableElements(container) {

		let table = container.append('table')
			.attr('class', 'resultTable');
		table.append('thead');
		table.append('tbody');

		return table;
	}

	createPager(thead, data, mapping) {
		let thisRef = this;
		let pager = thead.append('tr')
			.attr('class', 'pager')
			.append('td')
			.attr('colspan', Object.keys(mapping).length);

		let updatePage = (thisRef, page) => {
			thisRef.currentPage = page;
			thisRef.getMoviesByGenre(thisRef.currentGenre, thisRef.currentPage)
				.then(data => thisRef.updateResultTable.call(thisRef, data));
		}

		pager.append('div')
			.attr('class', 'prev fas fa-angle-double-left')
			.on('click', function () {
				if (thisRef.currentPage == 1) {
					return;
				}
				updatePage(thisRef, 1);
			});

		pager.append('div')
			.attr('class', 'prev fas fa-angle-left')
			.on('click', function () {
				if (thisRef.currentPage == 1) {
					return;
				}
				updatePage(thisRef, thisRef.currentPage - 1);
			});

		pager.append('div')
			.attr('class', 'pageNumber')
			.text(data.page + '/' + data.total_pages);

		pager.append('div')
			.attr('class', 'next fas fa-angle-right')
			.on('click', function () {
				if (thisRef.currentPage == data.total_pages) {
					return;
				}
				updatePage(thisRef, thisRef.currentPage + 1);
			});

		pager.append('div')
			.attr('class', 'next fas fa-angle-double-right')
			.on('click', function () {
				if (thisRef.currentPage == data.total_pages) {
					return;
				}
				updatePage(thisRef, data.total_pages);
			});

		return pager;
	}
}


class Node {
	constructor(value) {
		this.prev = null;
		this.next = null;
		this.value = value;
	}
}

class LinkedList {
	constructor() {
		this.first = null;
		this.last = null;
	}

	isEmpty() {
		return this.first == null && this.last == null;
	}

	push(item) {
		let newItem = new Node(item);

		if (this.isEmpty()) {
			this.first = newItem;
			this.last = newItem;
		}
		else {
			this.last.next = newItem;
			newItem.prev = this.last;
			this.last = newItem;
		}
	}

	pop() {
		let value = this.last.value;
		this.last = this.last.prev;
		if (!this.isEmpty()) {
			this.last.next = null;
		}
		else {
			this.first = null;
		}
		return value;
	}
}