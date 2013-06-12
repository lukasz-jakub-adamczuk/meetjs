createServiceCircle = function(name, x, y) {
	
	var service = d3.select('.circles').append('g')
		.attr('class', name);
		
	service.append('circle')
		.attr('r', 10)
		.attr('cx', x)
		.attr('cy', y)
		.style('fill', '#aaa')
		.transition()
			.duration(2000)
			.attr('r', 50);
	
	service.append('text')
		.attr('text-anchor', 'middle')
		.style('fill', 'black')
		.attr('transform', 'translate(' + x + ',' + (y+6) + ')')
		.transition()
			.delay(1000)
		.text(name);
	
	service.append('text')
		.attr('class', 'uu')
		.attr('text-anchor', 'middle')
		.attr('transform', 'translate(' + x + ',' + (y-12) + ')')
		.transition()
			.delay(2000)
		.text('uu');
	
	service.append('text')
		.attr('class', 'pv')
		.attr('text-anchor', 'middle')
		.attr('transform', 'translate(' + x + ',' + (y+24) + ')')
		.transition()
			.delay(2000)
		.text('pv');
};

redrawServiceCircle = function(service, previous, current) {
	
	//console.log('redraw ' + service);
	if (changeRadius) {
	service.select('circle')
		.transition()
			.duration(500)
			.style('fill', loadColors(current))
			.attr('r', current);
	}
	
	service.select('text.uu')
		.transition()
		.delay(500)
			.text(current);
	
	service.select('text.pv')
		.transition()
		.delay(500)
			.text(Math.floor(current*1.25));
};

calculateRadius = function(name) {
	var service = d3.select(name);
	
	var previous = service.select('circle').attr('r');
	var current;
	//current = Math.floor(Math.random() * 100);
	
	var direction = Math.round(Math.random());
	
	if (direction) {
		current = parseInt(previous) + Math.floor(Math.random() * 15);
	} else {
		current = parseInt(previous) - Math.floor(Math.random() * 15);
	}
	
	console.warn('NAME: ' + name + ', PREV:' + previous + ', NEXT: ' + current);

	
	if (current <= 30) {
		current = 30;
	}
	if (current >= 100) {
		current = 100;
	}
	
	//console.warn(previous);
	//console.warn(current);
	
	redrawServiceCircle(service, previous, current);
};


