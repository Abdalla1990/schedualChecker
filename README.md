# Appointment Schedual Checker

this is an Algorithem to check schedualed items , 

Rules: 
enquired data should have the following format:
Days : Sat, Sun, Mon, Tues, Wed, Thurs, Fri
Time : 05:00-05:20
EX. `Day 05:00-05:20`

to give a range of days : `Day1-Day5 05:00-05:20`
not specifying a time makes the whole day available
Ex. `Sat` = `Sat 00:00-24:00`

you can specify different days for the same item as follows 
`Day,Day5-Day1 05:00-05:20 | Day4 00:00-24:00 `

Please find a sample of how the data can look like in the Json file named `2-data.json`

Your enquiry should be places in `test-data.json`

### How To Use It :

To Run the algorithem : 

1- clone the repo 
2- go to the root of the folder 
3- run `npm install` to install the node modules 
4-  run `node ./index.js`
