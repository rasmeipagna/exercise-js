function GetTestdata()
{
	let d = new Date();

	let addDays = function (date, days)
	{
		var result = new Date(date);
		result.setDate(result.getDate() + days);
		result.setHours(0, 0, 0, 0);
		return result;
	}

	return [
		{ datetime: addDays(d, 1), app_temp: 1 },
		{ datetime: addDays(d, 2), app_temp: 2 },
		{ datetime: addDays(d, 3), app_temp: 3 },
		{ datetime: addDays(d, 4), app_temp: 4 },
		{ datetime: addDays(d, 5), app_temp: 5 },
		{ datetime: addDays(d, 6), app_temp: 6 },
		{ datetime: addDays(d, 7), app_temp: 7 },
	];
}

class LineChart
{
	constructor(elem)
	{
		this.container = elem;
	}

	changeFunction(val)
	{
		switch (val)
		{
			case "0":
				this.fetchWeatherData('forecast/daily', { lat: '50.827845', lon: '12.9213697' }, ['temp', 'app_max_temp', 'app_min_temp'], '%Y-%m-%d');
				break;
			case "1":
				this.fetchWeatherData('forecast/3hourly', { lat: '50.827845', lon: '12.9213697' }, ['temp', 'app_temp'], '%Y-%m-%d:%H');
				break;
		}
	}

	getWeatherbitUrl(func, params, dateFormat)
	{
		let paramStr = '';
		for (let k in params)
		{
			paramStr += '&' + k + '=' + params[k];
		}

		return 'http://api.weatherbit.io/v2.0/' + func + '?key=3a229505bebb440da62c872e0cf1fd70' + paramStr;
	}

	fetchWeatherData(func, params, keys, dateFormat)
	{
		let url = this.getWeatherbitUrl(func, params);
		fetch(url)
			.then(response => response.json())
			.then(data => this.drawChart.call(this, data, keys, dateFormat));
	}

	drawChart(data, keys, dateFormat)
	{
		let thisRef = this;
		data = data.data;
		let svgWidth = 600, svgHeight = 400;
		let margin = { top: 20, right: 20, bottom: 30, left: 50 };
		let width = svgWidth - margin.left - margin.right;
		let height = svgHeight - margin.top - margin.bottom;
		let svg = d3.select(this.container)
			.attr("width", svgWidth)
			.attr("height", svgHeight);

		svg.html(null);

		//grouping
		let g = svg.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		let tooltip = svg.append("g")
			.attr("class", "tooltip");

		let parseDate = d3.timeParse(dateFormat);

		let xDomain = [0, 0];
		for (let i = 0; i < keys.length; i++)
		{
			let temp = d3.extent(data, d => d[keys[i]]);
			xDomain[0] = xDomain[0] > temp[0] ? temp[0] : xDomain[0];
			xDomain[1] = xDomain[1] < temp[1] ? temp[1] : xDomain[1];
		}
		console.log(xDomain);

		//scales
		let x = d3.scaleTime()
			.domain(d3.extent(data, d => parseDate(d.datetime)))
			.rangeRound([0, width]);
		let y = d3.scaleLinear()
			.domain(xDomain)
			.rangeRound([height, 0]);

		let m = function (key)
		{
			return {
				//draw line
				line: d3.line()
					.x(d => x(parseDate(d.datetime)))
					.y(d => y(d[key])),
			}
		}

		//append x-axis
		g.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x))
			.select(".domain")
			.remove();

		//append y-axis 
		g.append("g")
			.call(d3.axisLeft(y))
			.append("text")
			.attr("fill", "#000")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", "0.71em")
			.attr("text-anchor", "end")
			.text("Temp");

		for (let i = 0; i < keys.length; i++)
		{
			let pathGroup = g.append("g");

			pathGroup.append("path")
				.datum(data)
				.attr("fill", "none")
				.attr("stroke", "steelblue")
				.attr("stroke-linejoin", "round")
				.attr("stroke-linecap", "round")
				.attr("stroke-width", 3)
				.attr("stroke-opacity", 0.3)
				//.attr("title", d => 'temp')
				.attr("d", m(keys[i]).line)
				.on("mouseover", function (d)
				{
					d3.select(this).style("stroke-width", 6).attr("stroke-opacity", 1);
					thisRef.setTooltip(tooltip, [keys[i]]);
				})
				.on("mouseout", function (d)
				{
					d3.select(this).style("stroke-width", 3).attr("stroke-opacity", 0.3);
					thisRef.clearTooltip(tooltip);
				})
				.append('title')
				.text(keys[i]);

			pathGroup.selectAll(".dot")
				.data(data)
				.enter()
				.append("circle") // Uses the enter().append() method
				.attr("class", "dot") // Assign a class for styling
				.attr("cx", function (d) { return x(parseDate(d.datetime)) })
				.attr("cy", function (d) { return y(d[keys[i]]) })
				.attr("r", 5)
				.on("mouseover", function (d, e, f)
				{
					this.classList.add('hover');
					thisRef.setTooltip(tooltip, [d.datetime, d[keys[i]]]);
				})
				.on("mouseout", function ()
				{
					this.classList.remove('hover');
					thisRef.clearTooltip(tooltip);
				});
		}
	}

	setTooltip(tooltip, textlines)
	{
		let rect = tooltip.append("rect");
		let tooltipParent = tooltip.node().parentNode;
		let bboxParent = tooltipParent.getBBox();
		let mousePos = d3.mouse(tooltipParent);
		let x = mousePos[0];
		let y = mousePos[1];

		for (let i = 0; i < textlines.length; i++)
		{
			tooltip
				.append("text")
				.attr("x", x)
				.attr("y", y)
				.attr("dy", (i + 1) + 'em')
				.attr("font-family", "roboto")
				.text(textlines[i]);
		}

		let bbox = tooltip.node().getBBox();
		let padding = 5;
		rect.attr("x", bbox.x - padding)
			.attr("y", bbox.y - padding)
			.attr("rx", 10)
			.attr("ry", 10)
			.attr("width", bbox.width + (padding * 2))
			.attr("height", bbox.height + (padding * 2));

		if (bbox.x + bbox.width + (padding * 2) > bboxParent.x + bboxParent.width)
		{
			tooltip.attr("transform", "translate(-" + (20 + bbox.width) + ", 20)");
		}
		else
		{
			tooltip.attr("transform", "translate(20, 20)")
		}
	}

	clearTooltip(tooltip)
	{
		tooltip.html(null);
	}

}