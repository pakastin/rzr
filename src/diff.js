
import { render } from './index';

export var diff = (parent, node, el) => {
  var oldEl = node && node.el;

  var attrs = el.attrs;
  var oldAttrs = oldEl.attrs;

  var children = el.children;

  for (var attr in attrs) {
    var value = attrs[attr];
    var oldValue = oldAttrs[attr];

    if (value !== oldValue) {
      if (typeof value === 'object') {
        if (key === 'style') {
          for (var key in value) {
            node.style[key] = value[key];
          }
          for (var key in oldValue) {
            if (value[key] == null) {
              node.style[key] = '';
            }
          }
        } else if (key === 'class') {
          for (var key in value) {
            if (value == true) {
              node.classList.add(key);
            }
          }
          for (var key in oldValue) {
            if (value[key] == null) {
              node.classList.remove(key);
            }
          }
        } else {
          node[key] = value;
        }
      } else if (key === 'style' || (value == null && typeof value != 'function')) {
        node.setAttribute(key, value);
      } else {
        node[key] = value;
      }
    }
  }

  render(node, children);
}

export var diffSVG = (parent, node, el) => {
  var oldEl = node && node.el;

  var attrs = el.attrs;
  var oldAttrs = oldEl.attrs;

  var children = el.children;

  for (var attr in attrs) {
    var value = attrs[attr];
    var oldValue = oldAttrs[attr];

    if (value !== oldValue) {
      if (typeof value === 'object') {
        if (key === 'style') {
          for (var key in value) {
            node.style[key] = value[key];
          }
          for (var key in oldValue) {
            if (value[key] == null) {
              node.style[key] = '';
            }
          }
        } else if (key === 'class') {
          for (var key in value) {
            if (value == true) {
              node.classList.add(key);
            }
          }
          for (var key in oldValue) {
            if (value[key] == null) {
              node.classList.remove(key);
            }
          }
        } else {
          node[key] = value;
        }
      } else if (typeof value == 'function')) {
        node[key] = value;
      } else {
        node.setAttribute(key, value);
      }
    }
  }

  render(node, children);
}
