const assert = require('assert');
const { formatTime, schedual_filter, checkTimeByHour } = require('../dateChecker.js');

describe('formatTime', function() {
  describe('passing only day without specific time', function() {
    const result = formatTime('Mon');
    it('should return dateTime in standard format [Day Time]', function() {
      assert.deepEqual(result, ['Mon 00:00-24:00']);
    });
  });

  describe('passing a rang of days without specific time', function() {
    const result = formatTime('Sat-Mon');
    const expected = [ 'Sat 00:00-24:00', 'Sun 00:00-24:00', 'Mon 00:00-24:00' ]
    it('should return all days included in the given range with dateTime in standard format [Day Time][Day Time] ...', function() {
      assert.deepEqual(result, expected);
    });
  });

  describe('passing a comma separated string of days', function() {
    const result = formatTime('Sat,Mon 10:00-24:00');
    const expected = ['Mon 10:00-24:00' ,'Sat 00:00-24:00']
    it('should return each day separately and add timing if not avaialble', function() {
      assert.deepEqual(result, expected);
    });
  });

});

describe('schedual_filter', function() {
  const Data = [
    ["Mon,Sun 11:30-21:00", { "id": "a" }],
    ["Tues-Thurs 12:00-13:00 | Sun 04:00-08:00", { "id": "b" }],
    ["Mon-Wed,Fri 01:00-22:00 | Thurs 15:00-16:00 | Sat-Sun 10:00-24:00",
        { "id": "c" }
    ],
    ["Wed 00:00-24:00", { "id": "d" }],
    ["Mon-Sun", { "id": "e" }],
    ["Tues 05:00-05:20 | Mon-Wed 05:30-12:00", { "id": "f" }],
    ["Sat,Sun 00:01-00:02 | Fri-Sat 0:30-17:00", { "id": "g" }],
    ["Wed 00:01-00:02 | Fri-Sat 0:30-17:00", { "id": "h" }]
  ]

  describe('passing only day without specific time', function() {
    const result = schedual_filter(Data, 'Mon');
    it('should fetch any item availble for all day long', function() {
      assert.deepEqual(
        result, 
        [ 'id: a, datetime : Mon 00:00-24:00',
          'id: c, datetime : Mon 00:00-24:00',
          'id: e, datetime : Mon 00:00-24:00' 
        ]
      );
    });
  });

  describe('passing a day with a specific hour', function() {
    const result = schedual_filter(Data, 'Mon 13:00');
    it('should fetch any item availble for that specific hour', function() {
      assert.deepEqual(
        result, 
        [ 'id: a, datetime : Mon 00:00-24:00',
          'id: c, datetime : Mon 00:00-24:00',
          'id: e, datetime : Mon 00:00-24:00' 
        ]
      );
    });
  });

  describe('passing a range of days with a range of hours', function() {
    const result = schedual_filter(Data, 'Thurs-Mon 13:00-22:30');
    it('should fetch any item availble for that specific range', function() {
      assert.deepEqual(
        result, 
        [ 'id: b, datetime : Thurs 12:00-13:00',
          'id: e, datetime : Thurs 00:00-24:00'
        ],
      );
    });
  });
});

describe('checkTimeByHour', function() {
  describe('passing day and time range and enquiry', function() {
    const dayAvailability = 'Mon 00:00-24:00';
    const result = checkTimeByHour(dayAvailability, 'Sun 11:30' , 'test');
    it('should return false  if the hour is not withing the time range ', function() {
      assert.deepEqual(result, false);
    });
  });

  describe('passing time range and enquiry', function() {
    const dayAvailability = 'Sun 11:30-21:00';
    const result = checkTimeByHour(dayAvailability, ['Sun 11:30'], 'test');
    it('should return the matching times if the hour is  withing the time range ', function() {
      assert.deepEqual(result, [ 'id: test, datetime : Sun 11:30-21:00' ]);
    });
  });
});