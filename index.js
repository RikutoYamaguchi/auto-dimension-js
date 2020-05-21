const fs = require('fs');
const _ = require('lodash');
const anyToJson = require('anytojson');

/**
 * コレクション配列からキー一覧を返す
 * @param arr
 * @returns {string[]}
 */
const collectionKeys = arr => {
  return Object.keys(arr[0])
};

/**
 * キーのパターン数を返す
 * @param keys
 * @param pick 選定する数
 */
const keyPatternLength = (keys, pick = 2) => {
  let n = 1;
  let keysLength = keys.length;
  for (let i = 0; i < pick; i++) {
    n = (keysLength - i) * n;
  }
  return n / pick;
};

/**
 * キーのパターン配列を返す
 * @param keys
 */
const keyPatterns = keys => {
  const pattern = [];
  for (let i = 0; i < keys.length - 1; i++) {
    for (let l = i+1; l < keys.length; l++) {
      pattern.push([keys[i], keys[l]]);
    }
  }
  return pattern;
};

/**
 * 配列の平均値を求める
 * @param arr
 * @returns {number}
 */
const average = arr => {
  return _.round(_.divide(_.sum(arr), arr.length), 4);
};

/**
 * 相関係数をパターンに応じて計算する
 * @param data
 * @param patterns
 */
const generateCorrelationCoefficients = (data, patterns) => {
  const correlationCoefficients = [];
  _.each(patterns, keys => {
    // dataを複製
    let _data = _.clone(data);

    const key1 = keys[0];
    const key2 = keys[1];
    // console.log(key1, key2);

    // 値を変換
    _data = _.map(_data, value => {
      value[key1] = value[key1].replace(/[^0-9]/g, '');
      value[key2] = value[key2].replace(/[^0-9]/g, '');
      return value;
    });

    // 平均値計算
    const key1Avr = average(_(_data).map(key1).map(value => +value).value());
    const key2Avr = average(_(_data).map(key2).map(value => +value).value());
    // console.log(key1Avr, key2Avr);

    // 偏差計算
    _data = _.map(_data, row => {
      row.deviation = {
        [key1]: +row[key1] - key1Avr,
        [key2]: +row[key2] - key2Avr
      };
      return row;
    });

    // 分散計算
    const key1Dispersion = _(_data).map(row => {
      return Math.pow(row.deviation[key1], 2)
    }).sum() / _data.length;
    const key2Dispersion = _(_data).map(row => {
      return Math.pow(row.deviation[key2], 2)
    }).sum() / _data.length;
    // console.log(key1Dispersion, key2Dispersion);

    // 標準偏差計算
    const key1Deviation = Math.sqrt(key1Dispersion);
    const key2Deviation = Math.sqrt(key2Dispersion);

    // 共分散計算
    const covariance = _(_data).map(row => {
      return row.deviation[key1] * row.deviation[key2];
    }).sum() / _data.length;

    // 相関係数
    const correlationCoefficient = covariance / (key1Deviation * key2Deviation);

    correlationCoefficients.push(correlationCoefficient);
  });

  return correlationCoefficients;
};

anyToJson.csv({ path: './sampleData.csv' }, dataArr => {
  // key取得
  const keys = collectionKeys(dataArr);
  // console.log(keys);

  // keyの組わせ配列取得
  const patterns = keyPatterns(keys);
  // console.log(patterns);

  // 相関係数保存
  const correlationCoefficients = generateCorrelationCoefficients(dataArr, patterns);

  // ランキング出力
  const ranking = _(patterns).map((pattern, i) => {
    return {
      keyPair: pattern,
      correlationCoefficient: correlationCoefficients[i],
      absCorrelationCoefficient: Math.abs(correlationCoefficients[i])
    };
  }).orderBy(['absCorrelationCoefficient'], ['desc']).value();

  console.log('================ 相関係数ランキング ================');
  _.each(ranking, (r, i) => {
    let message = `${i+1}: `;
    if (r.correlationCoefficient === 0) {
      message += `「${r.keyPair[0]}」と「${r.keyPair[1]}」の組み合わせは絶望的に相関していません。`;
    } else if (r.correlationCoefficient > 0) {
      message += `「${r.keyPair[0]}」と「${r.keyPair[1]}」の組み合わせは相関係数が「${r.correlationCoefficient}」でした。`;
    } else {
      message += `「${r.keyPair[0]}」と「${r.keyPair[1]}」の組み合わせは相関係数が「${r.correlationCoefficient}」でした。`;
    }

    if (r.correlationCoefficient >= 0.7) {
      message += "\n   かなりの正の相関が見られます。"
    } else if (r.correlationCoefficient >= 0.4) {
      message += "\n   そこそこの正の相関が見られます。"
    } else if (r.correlationCoefficient > 0) {
      message += "\n   すこしだけ正の相関が見られます。"
    }

    if (r.correlationCoefficient <= -0.7) {
      message += "\n   かなりの負の相関が見られます。"
    } else if (r.correlationCoefficient <= -0.4) {
      message += "\n   そこそこの負の相関が見られます。"
    } else if (r.correlationCoefficient < 0) {
      message += "\n   すこしだけ負の相関が見られます。"
    }

    console.log(message)
  });

});