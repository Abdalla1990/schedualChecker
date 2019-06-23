
const { uniq, contains, flatten, map, pipe, filter, split } = require('ramda');
const days = ['Sat', 'Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri'];
const splitDaysBySpace = args => split(' ', args);
const flattenArray = args => [].concat.apply([], args);
const concatString = args => time => map( arg => arg + ' ' + time)(args);
const elementIsNotTime = element => element == undefined || element == '|' || element == ',' ;
const padNum = d => (d < 10) && d.toString().charAt('0') !== '0' ? '0' + d.toString() : d.toString();
const injectSequansedDays = (daysRange, time) => {
	const splittedDays = split('-',daysRange);
	let daysIndexed = [];
	// get the matching days indexs from the days array [day1-Day4] => [0][3]
	map( givenDay => days.map(( day,index ) => givenDay === day && daysIndexed.push(index) ))(splittedDays);
	
	let fullDaysRange = [];
	if(daysIndexed[0] < daysIndexed[1]) {
		// get the actual days based on the indexed range [Sat Sun Mon]
		fullDaysRange = days.slice(daysIndexed[0], daysIndexed[1]+1)
	}
		
	if(daysIndexed[0] > daysIndexed[1]) {
		// if we have [day6-day1] EX [Wed-Mon] 
		// slice wont work as we cant slice reversily so we need to manually push days to the array
		// we start by getting the days from the beginning of range to friday EX. [Wed Thurs Fri]
		for(let i = daysIndexed[0] ; i < 7 ; i++) {
			fullDaysRange.push(days[i]);
		}
		// then we get the days between Saturday and the end of range 
		for(let i = 0 ; i <= daysIndexed[1] ; i++) {
			fullDaysRange.push(days[i]);
		}
	}

	return concatString(fullDaysRange)(time);
}

const formatTime = args => {
	// console.log({ args })
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

			// [Day-Day,Day] => [Day-Day][Day]
			if(element.indexOf(',') > -1) {
				let splittedDays = split(',',element);
				let sequansedDays = [];
				
				// [Day1-Day3] ? => [Day1 Time] [Day2 Time] [Day3 Time]
				if(splittedDays[0].indexOf('-') > -1) {
					sequansedDays = injectSequansedDays(splittedDays[0], '00:00-24:00');
					splittedDays = splittedDays.slice(1);
				}else { // [Day] => [Day Time]
					sequansedDays = [splittedDays[0] + ' ' + '00:00-24:00'];
					splittedDays = splittedDays.slice(1);
				}
				// [Day] [Time] => [Day Time]
				const concattedDaysWithTime = concatString(splittedDays)(time);
				// add any sequansed days
				sequansedDays.length && concattedDaysWithTime.push(sequansedDays);
				return flattenArray(concattedDaysWithTime);
			}

			// [Day1-Day3] => [Day1 Time] [Day2 Time] [Day3 Time] 
			if( element.indexOf('-') > -1 && element.indexOf(':') === -1) {
				return injectSequansedDays(element, time);
			}

			//[Day][Time] => [Day Time]
			if(
				element.indexOf(',') === -1 && 
				element.indexOf('-') === -1 && 
				element.indexOf('|') === -1) {
				return [element + ' ' + time];
			}

			return element;
		}
	)
	
	// remove the separators left behind after formatting 
	// [Day Time] ',' [Day Time] => [Day Time] [Day Time]
	const cleanedUp = filter( element => typeof element === 'object')(formatted);
	// console.log(flattenArray(cleanedUp))
	return flattenArray(cleanedUp);
}

const checkTimeByHour = (day, enquiredTime, id) => {
	if(enquiredTime.indexOf('-') > -1) {
		// that means this is a range of houres we dont have to search in between hours
		return;
	}else {
		const enquiredDayAndHour = splitDaysBySpace(enquiredTime[0]);
		const enquiredDay = enquiredDayAndHour[0]
		const enquiredHoure = enquiredDayAndHour[1];

		const currentlySearchedDayAndTimeRange = splitDaysBySpace(day);
		const currentlySearchedDay = currentlySearchedDayAndTimeRange[0];
		const currentlySearchedTimeRange = currentlySearchedDayAndTimeRange[1];

		const checkIfMatchingDays = (day1, day2) => day1 === day2;
		const checkMatchingHours = (day, hour, timeRange) => {
			const query = hour.split(':')[0];
			const fullHours = pipe(
				split('-'),
				map(split(':')),
				flatten,
				args => {
					let fullList =[]
					for(let i = args[0] ; i <= args[2] ; i++){
						fullList.push({id,  indexedHour: `${padNum(i)}`});
					}
					return fullList;
				},
			)(timeRange);

			const hoursMatched = pipe(
				map(
					({ indexedHour, id}) => {
						return padNum(indexedHour) === padNum(query) && ['id: ' + id + ', datetime : ' + day + ' ' + timeRange]
					}
				),
				flatten,
				filter(arg => arg !== false)
			)(fullHours);
			return hoursMatched;
		}

		const isEnquiredDayMatching = checkIfMatchingDays(enquiredDay, currentlySearchedDay);
		const matchingSchedual = isEnquiredDayMatching && checkMatchingHours(enquiredDay, enquiredHoure, currentlySearchedTimeRange) ;

		return matchingSchedual;
	}
}

function schedual_filter(list, datetime) {
	const enquiredTime = formatTime(datetime);
	if(!enquiredTime) {
		return console.log(' Enquiry has a wrong format! ');
	}
	const formatData = pipe(
		// compine formatted times with their ids 
		map( item => {
			const time = formatTime(item[0]);
			const id = item[1].id;
			return ({id, time})
		}),
		// fetch found matches
		map( ({ time, id }) => map( day => { 
			// if enquiry has a time range Ex. [Day 13:00-15:00]
			// this should be enough to return matches
			if(contains(day, enquiredTime )) {
				return 'id: ' + id + ', datetime : ' + day;
			}
			// if enquiry has a specific hour Ex [Day 13:00]
			// then we need to go through all avaialble time ranges make a full list of hours
			//and then compare each hour to the enquiry and ge tthe ones that matche
			const matchingTimes = checkTimeByHour(day, enquiredTime, id);

			if(matchingTimes) {
				return matchingTimes
			}
			return '';
		})(time)),
		flatten,
		uniq,
		// cleans up the empty strings returned from unmatched arrays 
		// this is not best practise 
		// I should probably find a way to optimize this
		filter( arg=> arg === '' ? false: true),
	)(list);
	return formatData; 
}

module.exports = {
	schedual_filter,
	formatTime,
	checkTimeByHour,
}