const fs = require('fs-extra');
const { uniq, contains, flatten, map, pipe, filter, split } = require('ramda');
const days = ['Sat', 'Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri'];
const splitDaysBySpace = args => split(' ', args);
const flattenArray = args => [].concat.apply([], args);
const concatString = args => time => map( day => day + ' ' + time)(args);
const elementIsNotTime = element => element == undefined || element == '|' || element == ',' ;

if (!String.prototype.isInList) {
	String.prototype.isInList = function() {
		let value = this.valueOf();
		for (let i = 0, l = arguments.length; i < l; i += 1) {
			if (arguments[i] === value) return value ;
		}
		return false;
	}
}

const injectSequansedDays = (element, time) => {
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

const formatTime = args => {
	// split by Space => EX. [Day,Day-Day] [Time] [ | ] [Day-Day] [Time]
	const splitted = splitDaysBySpace(args);
	/*we check the splittedArray by elements

		* before anything we check the following element, and determin 
		if its a separator (, or |)  or a sequanser(-) if not 
		that means its the current element time otherwise the current element should 
		have the standard time 00:00-24:00 

		Then : 

		1- if the element has (,) => [day, day] splitting by (,)it will give us [day],[day]
			then we always check if there is a time in the next element, if not :
			that means the this is a day without time wwe should make it look like this:
			[Day 00:00-24:00]
		2- if the element has (-) => [day-day] this is a range of days, we should make
			a sequanse of days based on the range given and then check if there is time associated to it
			otherwise we make it follow the format [Day 00:00-24:00]
		3- if the element doesnt have neither (,) , (|) nor (-) that means its a single day
			we check for the next element if its a time we just pass them in the format [Day time]
			if not we pass them in the standard format [Day 00:00-24:00]

	*/
	const formatted = splitted.map(
		(element, index) => {
			const nextElement = splitted[index + 1];
			const time = elementIsNotTime(nextElement) ? '00:00-24:00' : nextElement;

			// [Day-Day,Day] =>[Day-Day][Day]
			if(element.indexOf(',') > -1) {
				let splittedDays = split(',',element);
				let sequnsedDays = [];
				
				// [Day1-Day3] ? => [Day1 Time] [Day2 Time] [Day3 Time]
				if(splittedDays[0].indexOf('-') > -1) {
					sequnsedDays = injectSequansedDays(splittedDays[0], '00:00-24:00');
					splittedDays = splittedDays.slice(1);
				}else { // [Day] => [Day Time]
					sequnsedDays = [splittedDays[0] + ' ' + '00:00-24:00'];
					splittedDays = splittedDays.slice(1);
				}
				// [Day] [Time] => [Day Time]
				const concattedDaysWithTime = concatString(splittedDays)(time);
				// add any sequansed days
				sequnsedDays.length && concattedDaysWithTime.push(sequnsedDays);
				return flattenArray(concattedDaysWithTime);
			}

			// [Day1-Day3] => [Day1 Time] [Day2 Time] [Day3 Time] 
			if( element.indexOf('-') > -1 && element.indexOf(':') === -1) {
				return injectSequansedDays(element, time);
			}

			//[Day][Time] => [Day Time]
			if(element.indexOf(',') === -1 && element.indexOf('-') === -1 && element.indexOf('|') === -1) {
				return [element + ' ' + time];
			}

			return element;
		}
	)
	
	// remove the separators left behind after formatting 
	// [Day Time] ',' [Day Time] => [Day Time] [Day Time]
	const cleanedUp = filter( element => typeof element === 'object')(formatted);
	return flattenArray(cleanedUp);
}

function schedual_filter(list, datetime) {
	const enquiredTime = formatTime(datetime);
	const formatData = pipe(
		// compine formatted times with their ids 
		map( item => {
			const time = formatTime(item[0]);
			const id = item[1].id;
			return ({id, time})
		}),
		// fetch found matches  
		map( ({ time, id }) => map( day => { 
			if(contains(day, enquiredTime )) {
				return 'id: ' + id + ', datetime : ' + day;
			}
			return '';
		})(time)),
		flatten,
		uniq,
		// cleans up the empty strings returned from un mattched arrays 
		// this is not best practise 
		// I should probably find a way to optimize this
		filter( arg=> arg === '' ? false: true),
	)(list);
	return formatData; 
}

fs.readJson('./2-data.json').then((json) => {
	fs.readJson('./test-data.json').then(({test}) => {
		const appointements = schedual_filter(json, test);
		console.log( {appointements} );
	})
})