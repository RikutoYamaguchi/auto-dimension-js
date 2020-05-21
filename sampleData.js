const fs = require('fs');
const generate = require('./generageSampleData');
const toCsv = require('array-to-csv');

const csv = toCsv(generate({
  dataKeys: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'],
  dataLength: 10
}));

fs.writeFile('./sampleData.csv', csv, err => {
  if (err) throw err;

  console.log('Complete! Generated sample data.');
});
