(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.rzr = global.rzr || {})));
}(this, function (exports) { 'use strict';

  function diff (parent, node, el) {
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
              if (value[key] !== (oldValue && oldValue[key])) {
                node.style[key] = value[key];
              }
            }
            for (var key in oldValue) {
              if (value[key] == null) {
                node.style[key] = '';
              }
            }
          } else if (attr === 'class') {
            for (var key in value) {
              if (key) {
                if (value[key] !== (oldValue && oldValue[key])) {
                  if (value[key]) {
                    node.classList.add(key);
                  } else {
                    node.classList.remove(key);
                  }
                }
              }
            }
            for (var key in oldValue) {
              if (key) {
                if (value[key] == null) {
                  node.classList.remove(key);
                }
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

  function diffSVG (parent, node, el) {
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

  function el (tagName, attrs) {
    var children = [], len = arguments.length - 2;
    while ( len-- > 0 ) children[ len ] = arguments[ len + 2 ];

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
      tagName: tagName,
      attrs: attrs || {},
      children: children
    }
  }

  function parseStyleString (styleString) {
    var split = styleString.split(';');
    var result = {};

    for (var i = 0; i < split.length; i++) {
      var part = split[i].split(':');
      var key = dashedToCamelCase(part[0].trim());

      result[key] = part.slice(1).join(':').trim();
    }

    return result;
  }

  function parseClassString (classString) {
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

  function list (Component, data, key) {
    var results = new Array(data.length);

    for (var i = 0; i < results.length; i++) {
      var item = data[i];

      if (key) {
        results[i] = el(Component, Object.assign({}, item, {key: item[key]}));
      } else {
        results[i] = el(Component, item);
      }
    }

    return results;
  }

  function render (parent, el, originalPos) {
    var pos = originalPos || 0;
    var oldNode = parent.childNodes[pos];
    var oldEl = oldNode && oldNode.el;
    var childLookup = parent.childLookup;

    if (el && typeof el.tagName === 'function') {
      var key = el.attrs.key;
      if (key != null) {
        oldEl = childLookup && childLookup[key];
      }
      if (oldEl && oldEl.componentClass && el.tagName === oldEl.componentClass) {
        var attrs = el.attrs;
        var children = el.children;
        var oldComponent = oldEl.component;
        var oldComponentClass = oldEl.componentClass;

        oldComponent.update && oldComponent.update.apply(oldComponent, [ attrs ].concat( children ));

        el = oldComponent.render.apply(oldComponent, [ attrs ].concat( children ));
        el.component = oldComponent;
        el.componentClass = oldComponentClass;

        if (key != null) {
          el.key = key;

          if (oldEl && oldEl.dom) {
            if (oldNode) {
              parent.insertBefore(oldEl.dom, oldNode);
            } else {
              parent.appendChild(oldEl.dom);
            }
          }
        }

        pos = render(parent, el, pos);
      } else {
        var componentClass = el.tagName;
        var component = new componentClass();
        var attrs = el.attrs;
        var children = el.children;

        el = component.render.apply(component, [ attrs ].concat( children ));
        el.component = component;
        el.componentClass = componentClass;

        if (key != null) {
          el.key = key;
        }

        pos = render(parent, el, pos);
      }
    } else if (el instanceof Array) {
      for (var i = 0; i < el.length; i++) {
        if (el[i] != null) pos = render(parent, el[i], pos);
      }
    } else if (el instanceof Node) {
      if (el !== oldNode) {
        if (oldNode) {
          parent.insertBefore(el, oldNode);
        } else {
          parent.appendChild(el);
        }
      }
      pos++;
    } else if (typeof el === 'string' || typeof el === 'number' || el instanceof Date) {
      var str = String(el);
      if (!oldNode || oldNode.textContent !== str) {
        pos = render(parent, document.createTextNode(str), pos);
      } else {
        pos++;
      }
    } else {
      var isSVG = (el.tagName === 'svg' || parent instanceof SVGElement);
      var currentNode = oldNode;

      if (el.key != null) {
        oldEl = childLookup && childLookup[el.key];
        oldNode = oldEl && oldEl.dom;
      }

      if (oldEl && oldNode && el.tagName === oldEl.tagName && el.componentClass === oldEl.componentClass) {
        if (isSVG) {
          diffSVG(parent, oldNode, el);
        } else {
          diff(parent, oldNode, el);
        }
        oldNode.el = el;
        el.dom = oldNode;
      } else {
        var newNode = isSVG ? document.createElementNS('http://www.w3.org/2000/svg', el.tagName) : document.createElement(el.tagName);
        isSVG ? diffSVG(parent, newNode, el) : diff(parent, newNode, el);
        newNode.el = el;
        el.dom = newNode;
        var component = el && el.component;

        if (currentNode) {
          parent.insertBefore(newNode, currentNode);
        } else {
          parent.appendChild(newNode);
        }

        if (component) {
          component.dom = newNode;
          component.init && component.init.apply(component, [ attrs ].concat( children ));
        }

        if (parent.parentNode) {
          component && component.mount && component.mount();
          notifyDown(newNode, 'mount');
        }
      }
      if (el.key != null) {
        childLookup || (childLookup = parent.childLookup = {});
        childLookup[el.key] = el;
      }
      pos++;
    }

    if (originalPos == null) {
      var traverse = parent.childNodes[pos];

      while (traverse) {
        var next = traverse.nextSibling;
        var el = traverse.el;
        var component = el && el.component;
        var key = el && el.key;

        if (key != null) {
          childLookup && (childLookup[key] = null);
        }

        component && component.unmount && component.unmount();
        notifyDown(traverse, 'unmount');
        parent.removeChild(traverse);

        traverse = next;
      }
    }
    return pos;
  }

  function notifyDown (child, eventName) {
    var traverse = child.firstChild;

    while (traverse) {
      var next = traverse.nextSibling;
      var el = traverse.el;
      var component = el && el.component;

      component && component[eventName] && component[eventName]();
      notifyDown(traverse, eventName);

      traverse = next;
    }
  }

  exports.diff = diff;
  exports.diffSVG = diffSVG;
  exports.el = el;
  exports.parseStyleString = parseStyleString;
  exports.parseClassString = parseClassString;
  exports.list = list;
  exports.render = render;

  Object.defineProperty(exports, '__esModule', { value: true });

}));