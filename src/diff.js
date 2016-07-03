
import { render } from './index';

export function diff (parent, node, el) {
  var oldEl = (node && node.el) || {};

  var attrs = el.attrs;
  var oldAttrs = oldEl.attrs || {};

  var children = el.children;

  for (var attr in attrs) {
    var value = attrs[attr];
    var oldValue = oldAttrs[attr];

    if (value !== oldValue) {
      if (typeof value === 'object') {
        if (attr === 'style') {
          for (var key in value) {
            node.style[key] = value[key];
          }
          for (var key in oldValue) {
            if (value[key] == null) {
              node.style[key] = '';
            }
          }
        } else if (attr === 'class') {
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
          node[attr] = value;
        }
      } else if (attr === 'style' || (node[attr] == null && typeof value != 'function')) {
        node.setAttribute(attr, value);
      } else {
        node[attr] = value;
      }
    }
  }

  if (typeof children === 'string' || typeof children === 'number') {
    node.textContent = children;
  } else if (children) {
    render(node, children);
  } else {
    render(node, []);
  }
}

export function diffSVG (parent, node, el) {
  var oldEl = (node && node.el) || {};

  var attrs = el.attrs;
  var oldAttrs = oldEl.attrs || {};

  var children = el.children;

  for (var attr in attrs) {
    var value = attrs[attr];
    var oldValue = oldAttrs[attr];

    if (value !== oldValue) {
      if (typeof value === 'object') {
        if (attr === 'style') {
          for (var key in value) {
            node.style[key] = value[key];
          }
          for (var key in oldValue) {
            if (value[key] == null) {
              node.style[key] = '';
            }
          }
        } else if (attr === 'class') {
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
          node[attr] = value;
        }
      } else if (typeof value == 'function') {
        node[attr] = value;
      } else {
        node.setAttribute(attr, value);
      }
    }
  }

  if (typeof children === 'string' || typeof children === 'number') {
    node.textContent = children;
  } else if (children) {
    render(node, children);
  } else {
    render(node, []);
  }
}
