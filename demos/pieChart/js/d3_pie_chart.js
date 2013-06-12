function createPie(data, chart, arc, arc2, pie, total, title, show_total) {
	var colors = d3.scale.category10();
	
	var g = chart.selectAll('.arc')
		.data(pie(data))
		.enter()
		.append('g')
			.attr('class', 'arc');
	
	g.append('path')
		.attr('d', arc)
		.style('opacity', 0)
			.transition()
			//.duration(1111)
			.duration(function(d) { return d.data.key * 1250; })
				.style('opacity', 1)
				.style('fill', function(d) { return colors(d.data.key); });
	
	g.append('text')
		.attr('transform', function(d) { return 'translate(' + arc2.centroid(d) + ')'; })
		.attr('dy', '.35em')
		.style('text-anchor', 'middle')
		.text(function(d) { if (d.data.percent > 1) { return d.data.percent + '%'; } });
	if (show_total) {
	chart.append('text')
		.attr('class', 'title')
		.attr('dy', '-1em')
		.style('font-size', '1.25em')
		.style('text-anchor', 'middle')
		.text(title);
	
	chart.append('text')
		.attr('class', 'total')
		.attr('dy', '.5em')
		.style('font-size', '3em')
		.style('text-anchor', 'middle')
		.text(total);
	}
}

function updatePie(data, chart, total) {
	
	chart.select('text.total').text(total);
	
	pie.value(function(d) { return d.value; });
	path = chart.datum(data).selectAll('path').data(pie);
	path.attr('d', arc);
	
	var g = chart.selectAll('.arc');
	
	chart.selectAll('.arc text')
		.data(pie(data))
		.attr('transform', function(d) { return 'translate(' + arc2.centroid(d) + ')'; })
		.attr('dy', '.35em')
		.style('text-anchor', 'middle')
		.text(function(d) { if (d.data.percent > 1) { return d.data.percent + '%'; } });
	
}

function prepareData(data) {
	var total = {
		today: data.total.today,
		all: data.total.all
	};
	
	var today = d3.map(data.today).entries().map(
		function(d) {
			return {
				"key": d.key,
				"value": d.value,
				"percent": Math.round(d.value/data.total.today*100)
			}
		}
	);
	
	var all = d3.map(data.all).entries().map(
		function(d) {
			return {
				"key": d.key,
				"value": d.value,
				"percent": Math.round(d.value/data.total.all*100)
			}
		}
	);
	res = {};
	res.today = today;
	res.all = all;
	res.total = total;
	
	return res;
}

function calculateData(data) {
	var total = {
		today: data.total.today,
		all: data.total.all
	};
	
	var today = data.today.map(
		function(d) {
			return {
				"key": d.key,
				"value": d.value,
				"percent": Math.round(d.value/data.total.today*100)
			}
		}
	);
	
	var all = data.all.map(
		function(d) {
			return {
				"key": d.key,
				"value": d.value,
				"percent": Math.round(d.value/data.total.all*100)
			}
		}
	);
	res = {};
	res.today = today;
	res.all = all;
	res.total = total;
	
	return res;
}

function randomizePie() {
	var n = Math.floor(Math.random()*10);
	
	var total = {
		today: data.total.today += n,
		all: data.total.all += n
	};
	
	var scale = d3.scale.linear()
		.domain([0, 1])
		.range([0, data.all.length]);
	
	var idx = Math.floor(scale(Math.random()));
	
	data.today[idx].value += n;
	data.all[idx].value += n;
	
	return {'all': data.all, 'today': data.today, 'total': total};
		
}



