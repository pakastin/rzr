
import { el } from './index';

export function list (Component, data, key) {
  var results = new Array(data.length);

  for (var i = 0; i < results.length; i++) {
    var item = data[i];

    if (key) {
      results[i] = el(Component, { ...item, key: item[key] });
    } else {
      results[i] = el(Component, item);
    }
  }

  return results;
}
