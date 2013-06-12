function createChart(data, svg, params){
	var countries = [];
	var charts = [];
	var maxDataPoint = 0;
	
	/* Loop through first row and get each country 
		and push it into an array to use later */
	for (var prop in data[0]) {
		if (data[0].hasOwnProperty(prop)) {
			if (prop != 'date') {
				countries.push(prop);
			}
		}
	};
	
	var countriesCount = countries.length;
	var startdate = data[0].date;
	var enddate = data[data.length - 1].date;
	var chartHeight = height * (1 / countriesCount);
	
	/* Let's make sure these are all numbers, 
	we don't want javaScript thinking it's text 
	
	Let's also figure out the maximum data point
	We'll use this later to set the Y-Axis scale
	*/
	var sum = 0;
	
	data.forEach(function(d) {
		d.date = new Date(d.date);
		/*for (var prop in d) {
			if (d.hasOwnProperty(prop)) {
				d[prop] = parseFloat(d[prop]);
				
				if (d[prop] > maxDataPoint) {
					maxDataPoint = d[prop];
				}
			}
		}*/
		
		d['count'] = parseInt(d.count);
		if (d.count > maxDataPoint) {
			maxDataPoint = d.count;
		}
		sum = sum + d['count'];
		d.sum = sum;
		d.date = new Date(d.date);
		
	});
	
	// default range name
	//this.timewindow = typeof this.timewindow !== 'undefined' ? this.timewindow : 'month';
	
	charts.push(new Chart({
		data: data.slice(),
		id: 0,
		name: countries[0],
		width: width,
		height: height,
		conf: params,
		maxDataPoint: maxDataPoint,
		svg: svg,
		margin: margin,
		showBottomAxis: true
	}));
	
	var range = get_range(params.timewindow);
	
	// if timewindow is 'all'
	if (params.timewindow == 'all') {
		range = d3.extent(d3.extent(data.map(function(d) { return d.date; })));
		range[0] = new Date(range[0]);
		range[1] = new Date(range[1]);
	}
	
	// prepare defined range links
	drawDefinedWindows(params, data.length);
	
	/* Let's create the context brush that will 
	let us zoom and pan the chart */
	var contextXScale = d3.time.scale()
			.range([0, contextWidth])
			.domain(d3.extent(data.map(function(d) { return d.date; })));
	
	var contextAxis = d3.svg.axis()
			.scale(contextXScale)
			.tickFormat(d3.time.format(params.context.format))
			.tickSize(contextHeight)
			.tickPadding(-10)
			.orient('bottom');

	var brush = d3.svg.brush()
			.x(contextXScale)
			.extent(range)
			.on('brush', onBrush);

	var context = svg.append('g')
			.attr('class','context')
			.attr('transform', 'translate(' + (margin.left) + ',' + (height + margin.top + 30) + ')');

	context.append('g')
			.attr('class', 'x axis top')
			.attr('transform', 'translate(0,0)')
			.call(contextAxis);
										
	context.append('g')
			.attr('class', 'x brush')
			.call(brush)
			.selectAll('rect')
				.attr('y', 0)
				.attr('height', contextHeight);

	function onBrush() {
		/* this will return a date range to pass into the chart object */
		var b = brush.empty() ? contextXScale.domain() : brush.extent();
		
		//console.warn(b);
		charts[0].showOnly(b);
		//charts[0].redraw(b);
		
		d3.select('#'+params.prefix).selectAll('.time-windows span').attr('class', null);
	}
	
	function onClick() {
		var types = this.getAttribute('data-type').split('-');
		var range;
		
		if (types[0] == 'all') {
			range = [new Date(startdate), new Date(enddate)];
		} else {
			range = get_range(types[0]);
		}
		
		charts[0].redraw(range);
		
		d3.select('div[data-widget="'+params.widget+'"]').select('input[name="timewindow"]').attr('value', types[0]);
		var spans = d3.select('div[data-widget="'+params.widget+'"]').selectAll('.time-windows span').attr('class', null);
		this.setAttribute('class', 'active');
		
		brush.extent(range);
		d3.select('#'+params.prefix).select('.brush').call(brush);
	}
	
	function onSelectRange(){
		//var inputs = d3.select('#'+params.prefix).selectAll('.time-widths input');
		var start  = d3.select('div[data-widget="'+params.widget+'"]').select('.time-start').value();
		var stop   = d3.select('div[data-widget="'+params.widget+'"]').select('.time-stop').value();
		
		var range = [new Date(start), new Date(stop)];
		
		charts[0].redraw(range);
		
		brush.extent(range);
		d3.select('#'+params.prefix).select('.brush').call(brush);
	}
	
	d3.select('div[data-widget="'+params.widget+'"]').selectAll('.time-windows span').on('click', onClick);
	d3.select('div[data-widget="'+params.widget+'"]').selectAll('.time-range .button').on('click', onSelectRange);
}


var format_date = function(date) {
	return date.getFullYear() + '-' + ('0'+(date.getMonth()+1)).slice(-2) + '-' + ('0'+(date.getDate())).slice(-2);
};

var last_date_range = function(years, months, days) {
	var today = new Date();
	return [new Date(today.getFullYear() - years, today.getMonth() - months, today.getDate() - days, today.getHours(), today.getMinutes(), today.getSeconds()), today];
};

var get_range = function(timewindow) {
	var range = null;
	if (timewindow == 'day') {
		range = last_date_range(false, false, 1);
	}
	if (timewindow == 'week') {
		range = last_date_range(false, false, 7);
	}
	if (timewindow == 'month') {
		range = last_date_range(false, 1, false);
	}
	if (timewindow == 'quarter') {
		range = last_date_range(false, 3, false);
	}
	if (timewindow == 'year') {
		range = last_date_range(1, false, false);
	}
	return range;
};

var drawDefinedWindows = function(params, days) {
	var t = '<label>Time window:</label>';
	
	if (days >= 1) {
		t += '<span data-type="day-switch">last day</span> &bull; ';
	}
	if (days >= 7) {
		t += '<span data-type="week-switch">last week</span> &bull; ';
	}
	if (days >= 31) {
		t += '<span data-type="month-switch">last month</span> &bull; ';
	}
	if (days >= 90) {
		t += '<span data-type="quarter-switch">last quarter</span> &bull; ';
	}
	if (days >= 365) {
		t += '<span data-type="year-switch">last year</span> &bull; ';
	}
	t += '<span data-type="all-switch">all</span>';
	
	d3.select('div[data-widget="'+params.widget+'"]').select('.time-windows').html(t);
}

var usePoint = function(d, i, prf) {
	d3.select('#' + prf + ' .point-time').text(d.date.toDateString() + '');
	d3.select('#' + prf + ' .point-value').text(Math.round(d.count));
	d3.select('#' + prf + ' .point-sum').text(Math.round(d.sum));
	d3.select('#' + prf + '-c-' + i).attr('r', 2).attr('class', 'active');
	d3.select('#' + prf + '-d-' + i).attr('r', 2).attr('class', 'active');
	d3.select('#' + prf + '-l-' + i).style('stroke', '#888');
};

var clearPoint = function(d) {
	d3.selectAll('.point-time').text('');
	d3.selectAll('.point-value').text('');
	d3.selectAll('.point-sum').text('');
	d3.selectAll('circle').attr('r', 1).attr('class', null);
	d3.selectAll('.col').style('stroke', 'transparent');
	d3.selectAll('.line').style('stroke', 'transparent');
};



function Chart(options){
	this.chartData = options.data;
	this.width = options.width;
	this.height = options.height;
	this.maxDataPoint = options.maxDataPoint;
	this.svg = options.svg;
	this.id = options.id;
	this.name = options.name;
	this.margin = options.margin;
	
	this.timewindow = options.conf.timewindow;
	this.conf = options.conf;
	
	var localName = this.name;
	
	/* XScale is time based */
	this.xScale = d3.time.scale()
		.range([0, this.width]);
	
	/* YScale is linear based */
	this.yScaleLeft = d3.scale.linear()
		.range([this.height,0]);
	
	/* YScale2 is linear based */
	this.yScaleRight = d3.scale.linear()
		.range([this.height,0]);
	
	// setting range beacause timewindow could be an 'all' 
	var range = get_range(this.timewindow);
	
	if (this.timewindow == 'all') {
		range = d3.extent(d3.extent(this.chartData.map(function(d) { return d.date; })));
		range[0] = new Date(range[0]);
		range[1] = new Date(range[1]);
	}
	
	var maxVal = d3.max(this.chartData.map(function(d) {
		if ((new Date(d.date)).getTime() > range[0].getTime() && (new Date(d.date)).getTime() <= range[1].getTime())  return d.count;
	}));
	
	var maxSum = d3.max(this.chartData.map(function(d) {
		if ((new Date(d.date)).getTime() > range[0].getTime() && (new Date(d.date)).getTime() <= range[1].getTime())  return d.sum;
	}));
	
	d3.select('div[data-widget="'+this.conf.widget+'"]').select('.time-windows span[data-type="' + this.timewindow + '-switch"]').attr('class', 'active');
	
	// set new max value at scale
	this.xScale.domain(range);
	this.yScaleLeft.domain([0, maxVal * 1.1]);
	this.yScaleRight.domain([0, maxSum * 1.1]);
	
	var xS = this.xScale;
	var yS1 = this.yScaleLeft;
	var yS2 = this.yScaleRight;
	
	// colors
	var colors = d3.scale.category10();
	
	d3.select('#' + this.conf.prefix + ' .point-value').style('color', colors(0));
	d3.select('#' + this.conf.prefix + ' .point-sum').style('color', colors(1));
	
	// where the line gets its properties, how it will be interpolated
	this.line = d3.svg.line()
		.x(function(d) { return xS(d.date); })
		.y(function(d) { return yS1(d.count); });
	
	if (this.conf.sum) {
		// sum
		this.sum = d3.svg.line()
			.x(function(d) { return xS(d.date); })
			.y(function(d) { return yS2(d.sum); });
	}
	
	/*
		This isn't required - it simply creates a mask. If this wasn't here,
		when we zoom/panned, we'd see the chart go off to the left under the y-axis 
	*/
	this.svg.append('defs').append('clipPath')
		.attr('id', 'clip-' + this.id)
		.append('rect')
			.attr('width', this.width)
			.attr('height', this.height);
	
	/*
		Assign it a class so we can assign a fill color
		And position it on the page
	*/
	this.chartContainer = this.svg.append('g')
		.attr('class', this.name.toLowerCase())
		.attr('transform', 'translate(' + this.margin.left + ',' + (this.margin.top + (this.height * this.id) + (10 * this.id)) + ')');

	/* We've created everything, let's actually add it to the page */
	this.chartContainer.append('path')
		.data([this.chartData])
		.attr('class', 'serie')
		.style('stroke', colors(0))
		.attr('clip-path', 'url(#clip-' + this.id + ')')
		.attr('d', this.line);
	
	this.chartContainer.append('path')
		.data([this.chartData])
		.attr('class', 'sum')
		.style('stroke', colors(1))
		.attr('clip-path', 'url(#clip-' + this.id + ')')
		.attr('d', this.sum);
	
	
	// cols
	var dataColsGroup = null;
	if (!dataColsGroup) {
		dataColsGroup = this.chartContainer.append('g')
			.attr('class', 'cols')
			.attr('clip-path', 'url(#clip-' + this.id + ')');
	}
			
	// lines
	var dataLinesGroup = null;
	if (!dataLinesGroup) {
		dataLinesGroup = this.chartContainer.append('g')
			.attr('class', 'lines')
			.attr('clip-path', 'url(#clip-' + this.id + ')');
	}
	
	if (this.conf.circles) {
		// circles
		var dataCirclesGroup = null;
		if (!dataCirclesGroup) {
			dataCirclesGroup = this.chartContainer.append('g')
				.attr('class', 'points serie')
				.attr('clip-path', 'url(#clip-' + this.id + ')');
		}
		if (this.conf.sum) {
			// sum circles
			var dataCirclesGroup = null;
			if (!dataCirclesGroup) {
				dataCirclesGroup = this.chartContainer.append('g')
					.attr('class', 'points sum')
					.attr('clip-path', 'url(#clip-' + this.id + ')');
			}
		}
	}
	
	this.xAxis = d3.svg.axis().scale(this.xScale).orient('bottom');
	this.yAxisLeft = d3.svg.axis().scale(this.yScaleLeft).orient('left').ticks(5);
	this.yAxisRight = d3.svg.axis().scale(this.yScaleRight).orient('right').ticks(5);
	
	// redraw chart
	this.redraw(range);
	
	// appending axes
	this.chartContainer.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + this.height + ')')
		.call(this.xAxis);
	
	this.chartContainer.append('g')
		.attr('class', 'y left axis')
		.attr('transform', 'translate(0,0)')
		.call(this.yAxisLeft);
	
	if (this.conf.sum) {
		this.chartContainer.append('g')
			.attr('class', 'y right axis')
			.attr('transform', 'translate(440,0)')
			.call(this.yAxisRight);
	}
/*	
	var legend = this.chartContainer.append('g')
		.attr('class','legend')
		.attr('transform', 'translate(300,10)');

	legend.append('cirle')
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('r', 5)
		.attr('fill', 'red')
		.attr('stroke-width', 2);
											
	legend.append('text')
		.attr('class','country-title')
		.attr('text-anchor', 'start')
		.attr('dy', 0)
		.attr('dx', 22)
		.text(this.name);
*/	
}

Chart.prototype.redraw = function(range) {
	// interactive dots
	this.chartContainer.selectAll('circle').remove();
	this.chartContainer.selectAll('.col').remove();
	this.chartContainer.selectAll('.line').remove();
	
	var maxVal = d3.max(this.chartData.map(function(d) {
		if ((new Date(d.date)).getTime() > range[0].getTime() && (new Date(d.date)).getTime() <= range[1].getTime())  return d.count;
	}));
	
	var maxSum = d3.max(this.chartData.map(function(d) {
		if ((new Date(d.date)).getTime() > range[0].getTime() && (new Date(d.date)).getTime() <= range[1].getTime())  return d.sum;
	}));
	
	// set new max value of scale
	this.xScale.domain(range);
	this.yScaleLeft.domain([0, maxVal * 1.1]);
	this.yScaleRight.domain([0, maxSum * 1.1]);
	
	var xS = this.xScale;
	var yS1 = this.yScaleLeft;
	var yS2 = this.yScaleRight;
	
	var colors = d3.scale.category10();
	
	var prf = this.conf.prefix;
	
	var prefix = function(idx) {
		return prf + idx;
	};
	
	// active area to hover point on chart
	var col = width / Math.floor((range[1] - range[0]) / 60 / 60 / 24 / 1000);
	
	d3.select('div[data-widget="'+this.conf.widget+'"]').select('.time-start').attr('value', format_date(range[0]));
	d3.select('div[data-widget="'+this.conf.widget+'"]').select('.time-stop').attr('value', format_date(range[1]));
	
	// interactive cols, lines and dots
	this.chartContainer.cols = this.chartContainer.select('.cols').selectAll('.col').data(this.chartData);
	this.chartContainer.cols
		.enter()
			.append('line')
				.attr('class', 'col')
				.style('opacity', 0.2)
				.style('stroke-width', col+'px')
				.attr('x1', function(d) { return xS(d.date) })
				.attr('y1', 0)
				.attr('x2', function(d) { return xS(d.date) })
				.attr('y2', height)
			.on('mouseover', function(d, i) { usePoint(d, i, prf); })
			.on('mouseout', function(d) { clearPoint(d); });
	
	this.chartContainer.lines = this.chartContainer.select('.lines').selectAll('.line').data(this.chartData);
	this.chartContainer.lines
		.enter()
			.append('line')
				.attr('class', 'line')
				.attr('id', function(d, i) { return prefix('-l-' + i); })
				.style('stroke-width', '1px')
				.attr('x1', function(d) { return xS(d.date) })
				.attr('y1', 0)
				.attr('x2', function(d) { return xS(d.date) })
				.attr('y2', height)
			.on('mouseover', function(d, i) { usePoint(d, i, prf); })
			.on('mouseout', function(d) { clearPoint(d); });
	
	if (this.conf.circles) {
		this.chartContainer.circles = this.chartContainer.select('.points.serie').selectAll('.point').data(this.chartData);
		this.chartContainer.circles
			.enter()
				.append('circle')
					.attr('id', function(d, i) { return prefix('-c-' + i); })
					.attr('class', 'point')
					.style('stroke', colors(0))
					.attr('cx', function(d) { return xS(d.date) })
					.attr('cy', function(d) { return yS1(d.count) })
					.attr('r', 1);
		
		if (this.conf.sum) {
			this.chartContainer.circles = d3.select('.points.sum').selectAll('.point').data(this.chartData);
			this.chartContainer.circles
				.enter()
				.append('circle')
					.attr('id', function(d, i) { return prefix('-d-' + i); })
					.attr('class', 'point')
					.style('stroke', colors(1))
					.attr('cx', function(d) { return xS(d.date) })
					.attr('cy', function(d) { return yS2(d.sum) })
					.attr('r', 1);
		}
	}
	// setting individual time ticks format
	var days = Math.floor((range[1] - range[0]) / 60 / 60 / 24 / 1000);

	if (days <= 7) {
		this.xAxis
			.ticks(d3.time.days)
			.tickFormat(d3.time.format('%b %d'));
	} else if (days <= 31) {
		this.xAxis
			.ticks(d3.time.mondays)
			.tickFormat(d3.time.format('%b %d'));
	} else if (days <= 365) {
		this.xAxis
			.ticks(d3.time.months)
			.tickFormat(d3.time.format('%b'));
	} else {
		this.xAxis
			.ticks(d3.time.years)
			.tickFormat(d3.time.format('%Y'));
	}
	
	// setting context extent
	if (typeof this.timewindow == 'string') {
		var contextXScale = d3.time.scale()
			.range([0, contextWidth])
			.domain(d3.extent(this.chartData.map(function(d) { return d.date; })));
			
		var brush = d3.svg.brush().x(contextXScale).extent(range);
		
		//d3.select('div[data-widget="'+this.conf.widget+'"]').select('.brush').call(brush);
		d3.select('#'+this.conf.prefix).select('.brush').call(brush);
		
	}
	
	// calling other elements
	this.chartContainer.select('.serie').data([this.chartData]).attr('d', this.line);
	this.chartContainer.select('.sum').data([this.chartData]).attr('d', this.sum);
	
	this.chartContainer.select('.x.axis').call(this.xAxis);
	this.chartContainer.select('.y.axis.left').call(this.yAxisLeft);
	this.chartContainer.select('.y.axis.right').call(this.yAxisRight);
}

// method to disable in the future
Chart.prototype.showOnly = function(timewindow) {
	// from context we can get [start, stop]
	if (typeof timewindow == 'object') {
		range = timewindow;
	} else {
		range = get_range(timewindow);
	}
	// use to axis format
	this.timewindow = timewindow;
	
	// redraw elements
	this.redraw(range);
}