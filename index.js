const fs = require('fs-extra');
const { uniq, contains, flatten, map, pipe, filter, split } = require('ramda');
const days = ['Sat', 'Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri'];

if (!String.prototype.isInList) {
	String.prototype.isInList = function() {
		let value = this.valueOf();
		for (let i = 0, l = arguments.length; i < l; i += 1) {
			if (arguments[i] === value) return value ;
		}
		return false;
	}
}

const splitDays = args => split(' ', args);
const flattenArray = args => [].concat.apply([], args);
const concatString = args => time => map( day => day + ' ' + time)(args);
const formatTime = args => {
	const splitted = splitDays(args);
	const formatted = splitted.map(
		(element, index) => {
			const time = splitted[index + 1] == undefined ||
				splitted[index + 1] == '|' || 
				splitted[index + 1] == ','
				? '00:00-24:00' : splitted[index + 1];

			if(element.indexOf(',') > -1) {
				const splittedDays = split(',',element);
				const concattedDaysWithTime = concatString(splittedDays)(time);
				return concattedDaysWithTime;
			}

			if( element.indexOf('-') > -1 && element.indexOf(':') === -1) {
				const splittedDays = split('-',element);
				
				let daysIndexed = [];
				map( givenDay => days.map(( day,index ) => givenDay === day && daysIndexed.push(index) ))(splittedDays);
				
				let daysRange = [];
				if(daysIndexed[0] < daysIndexed[1]) {
					daysRange = days.slice(daysIndexed[0], daysIndexed[1]+1)
				}
					
				if(daysIndexed[0] > daysIndexed[1]) {

					for(let i = daysIndexed[0] ; i < 7 ; i++) {
						daysRange.push(days[i]);
					}
					for(let i = 0 ; i <= daysIndexed[1] ; i++) {
						daysRange.push(days[i]);
					}
				}

				return concatString(daysRange)(time);
			}

			if(element.indexOf(',') === -1 && element.indexOf('-') === -1 && element.indexOf('|') === -1) {
				return [element + ' ' + time];
			}

			return element;
		}
	)
	
	const cleanedUp = filter( element => typeof element === 'object')(formatted);
	console.log( flattenArray(cleanedUp) )
	return flattenArray(cleanedUp);
}

function schedual_filter(list, datetime) {
	const enquiredTime = formatTime(datetime);
	const formatData = pipe(
		map( item => {
			const time = formatTime(item[0]);
			const id = item[1].id;
			return ({id, time})
		}),
		map( ({ time, id }) => map( day => { 
			if(contains(day, enquiredTime )) {
				return 'id: ' + id + ', datetime : ' + day;
			}
			return '';
		})(time)),
		flatten,
		uniq,
		filter( arg=> arg === '' ? false: true),
	)(list);
	return formatData;
}

fs.readJson('./2-data.json').then((json) => {
	fs.readJson('./test-data.json').then(({test}) => {
		const appointement = schedual_filter(json, test);
		// console.log( appointement );
	})
})