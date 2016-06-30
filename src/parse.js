
import { render } from './index';

export var parse = (el) => {
  var node = document.createElement(el.tagName);
  var attrs = el.attrs;

  node.el = el;

  for (var key in attrs) {
    var value = attrs[key];

    if (typeof value === 'object') {
      if (key === 'style') {
        for (var key in value) {
          node.style[key] = value[key];
        }
      } else if (key === 'class') {
        for (var key in value) {
          node.classList.add(key);
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

  var children = el.children;

  for (var i = 0; i < children.length; i++) {
    var child = children[i];

    if (child instanceof Node) {
      node.appendChild(child);
    } else if (typeof child === 'string' || typeof child === 'number') {
      node.appendChild(document.createTextNode(child));
    } else {
      render(node, child, i);
    }
  }

  return node;
}

export var parseSVG = (el) => {
  var node = document.createElementNS('http://www.w3.org/2000/svg', el.tagName);

  node.el = el;

  var attrs = el.attrs;

  for (var key in attrs) {
    var value = attrs[key];

    if (typeof value === 'object') {
      if (key === 'style') {
        for (var key in value) {
          node.style[key] = value[key];
        }
      } else if (key === 'class') {
        for (var key in value) {
          node.classList.add(key);
        }
      } else {
        node[key] = value;
      }
    } else if (typeof value === 'function') {
      node[key] = value;
    } else {
      node.setAttribute(key, value);
    }
  }

  var children = el.children;

  for (var i = 0; i < children.length; i++) {
    var child = children[i];

    if (child instanceof Node) {
      node.appendChild(child);
    } else if (typeof child === 'string') {
      node.appendChild(document.createTextNode(child));
    } else {
      render(node, child, i);
    }
  }

  return node;
}
