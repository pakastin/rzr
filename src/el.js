
export function el (tagName, attrs, ...children) {
  for (var key in attrs) {
    if (key === 'style') {
      var value = attrs.style;

      if (typeof value === 'string') {
        attrs.style = parseStyleString(value);
      }
    } else if (key === 'class') {
      var value = attrs.class;

      if (typeof value === 'string') {
        attrs.class = parseClassString(value);
      }
    }
  }

  return {
    tagName,
    attrs: attrs || {},
    children
  }
}

export function parseStyleString (styleString) {
  var split = styleString.split(';');
  var result = {};

  for (var i = 0; i < split.length; i++) {
    var part = split[i].split(':');
    var key = dashedToCamelCase(part[0].trim());

    result[key] = part.slice(1).join(':').trim();
  }

  return result;
}

export function parseClassString (classString) {
  var split = classString.split(' ');
  var result = {};

  for (var i = 0; i < split.length; i++) {
    result[split[i]] = true;
  }

  return result;
}

function dashedToCamelCase (str) {
  var result = [];

  for (var i = 0; i < str.length; i++) {
    if (str[i] === '-') {
      if (i > 0) {
        result[i++] = str[i].toUpperCase();
      } else {
        result[i++] = str[i];
      }
    } else {
      result[i] = str[i];
    }
  }
  return result.join('');
}
