const _ = require('lodash');

const config = {
  dataKeys: ['a', 'b', 'c', 'd' ,'e', 'f', 'g'],
  dataLength: 1,
  valueRange: [0, 100]
};

function generate (dataKeys = config.dataKeys, dataLength = config.dataLength, valueRange = config.valueRange) {
  const dataArr = [dataKeys];

  for(let i = 0; i < dataLength; i++) {
    const data = [];
    for(let c = 0; c < dataKeys.length; c++) {
      data[c] = _.random(valueRange[0], valueRange[1]);
    }
    dataArr.push(data);
  }

  return dataArr;
}

module.exports = function ({ dataKeys, dataLength, valueRange } = {}) {
  return generate(dataKeys, dataLength, valueRange);
};
