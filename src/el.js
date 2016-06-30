
export var el = (tagName, attrs, ...children) => {
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

export var parseStyleString = (styleString) => {
  var split = styleString.split(';');
  var result = {};

  for (var i = 0; i < split.length; i++) {
    var part = split[i].split(':');
    result[part[0]] = part[1];
  }

  return result;
}

export var parseClassString = (classString) => {
  var split = classString.split(' ');
  var result = {};

  for (var i = 0; i < split.length; i++) {
    result[split[i]] = true;
  }

  return result;
}
