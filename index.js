const fs = require('fs-extra');
const { schedual_filter } = require('./dateChecker');
fs.readJson('./data.json').then((json) => {
	fs.readJson('./test-data.json').then(({test}) => {
		const appointements = schedual_filter(json, test);
		console.log( {appointements} );
	}).catch((err) => console.log(err))
}).catch((err) => console.log(err));
