
import { el } from './index';

export function list (Component, data) {
  var results = new Array(data.length);

  for (var i = 0; i < results.length; i++) {
    results[i] = el(Component, data[i]);
  }

  return results;
}
