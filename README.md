# Appointment Schedual Checker

This is an Algorithem to check schedualed items. 

Rules:

Enquired data should have the following format:
Days : Sat, Sun, Mon, Tues, Wed, Thurs, Fri
Time : a range of hours (will only match the exact range ) Ex. [05:00-05:20] Or a specific hour (will only match the hour and ignore the minites) Ex. [13:00]

EXAMPLES :  `Day 05:00-05:20` , `Day 13:00`

To give a range of days : `Day1-Day5 05:00-05:20`
not specifying a time makes the whole day available
Ex. `Sat` = `Sat 00:00-24:00`

You can specify different days for the same item as follows: 
`Day,Day5-Day1 05:00-05:20 | Day4 00:00-24:00 `

Please find a sample of how the data can look like in the Json file named `2-data.json`

Your enquiry should be places in `test-data.json`

### Wishlist : 

1- The app should be developed to compare minutes if a specific houre given

2- the app should be able to compare given hour for days range,  Ex.`[Day1-Day2 13:00]` currently this won't work, however `[Day1-Day3 13:00-15:00]` will match the exact time rang and days.

### How To Use It :

To Run the algorithem : 

1- clone the repo

2- go to the root of the folder 

3- run `npm install` to install the node modules 

4-  run `npm run start` or run `node ./index.js` from the root of the project

### test 

The package includes unite testing for a few functions in the algorithem

To run the test :run  `npm run test` in the root firectory of the project.
