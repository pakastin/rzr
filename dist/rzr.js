(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.rzr = global.rzr || {})));
}(this, function (exports) { 'use strict';

  var el = function (tagName, attrs) {
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

  var parseStyleString = function (styleString) {
    var split = styleString.split(';');
    var result = {};

    for (var i = 0; i < split.length; i++) {
      var part = split[i].split(':');
      result[part[0]] = part[1];
    }

    return result;
  }

  var parseClassString = function (classString) {
    var split = classString.split(' ');
    var result = {};

    for (var i = 0; i < split.length; i++) {
      result[split[i]] = true;
    }

    return result;
  }

  var render = function (parent, el, pos) {
    var originalPos = pos;
    pos = pos || 0;
    var oldNode = parent.childNodes[pos];
    var oldEl = oldNode && oldNode.el

    if (typeof el.tagName === 'function') {
      if (oldEl && oldEl.componentClass && el.tagName === oldEl.componentClass) {
        var attrs = el.attrs;
        var children = el.children;
        var oldComponent = oldEl.component;
        var oldComponentClass = oldEl.componentClass;

        oldComponent.update.apply(oldComponent, [ attrs ].concat( children ));

        el = oldComponent.render.apply(oldComponent, [ attrs ].concat( children ));
        el.component = oldComponent;
        el.componentClass = oldComponentClass;
        render(parent, el, pos++);
      } else {
        var componentClass = el.tagName;
        var component = new componentClass();
        var attrs = el.attrs;
        var children = el.children;

        el = component.render.apply(component, [ attrs ].concat( children ));
        el.component = component;
        el.componentClass = componentClass;

        component.isMounted = false;

        render(parent, el, pos++);
      }
    } else if (el instanceof Array) {
      for (var i = 0; i < el.length; i++) {
        render(parent, el[i], pos++);
      }
    } else if (el instanceof Node) {
      if (oldNode) {
        parent.insertBefore(newNode, oldNode);
      } else {
        parent.appendChild(newNode);
      }
    } else if (typeof el === 'string' || typeof el === 'number') {
      parent.textContent = el;
    } else {
      var isSVG = (el.tagName === 'svg' || parent instanceof SVGElement);

      if (oldEl && el.tagName === oldEl.tagName && el.componentClass === oldEl.componentClass) {
        if (isSVG) {
          diffSVG(parent, oldNode, el);
        } else {
          diff(parent, oldNode, el);
        }
      } else {
        var newNode = isSVG ? parseSVG(el) : parse(el);
        var el = newNode.el;
        var component = el && el.component;

        if (oldNode) {
          parent.insertBefore(newNode, oldNode);
        } else {
          parent.appendChild(newNode);
        }

        if (component && component.isMounted) {
          component.dom = newNode;
          component.init && component.init.apply(component, [ attrs ].concat( children ));
          component.isMounted = true;
        }

        component && component.mount && component.mount();
      }
    }

    if (originalPos == null) {
      var traverse = parent.childNodes[pos];

      while (traverse) {
        component && component.unmount && component.unmount();
        notifyUnmount(traverse);
        parent.removeChild(traverse);

        traverse = next;
      }
    }
  }

  function notifyUnmount (child) {
    var traverse = child.firstChild;

    while (traverse) {
      var el = traverse.el;
      var component = el && el.component;

      component && component.unmount();
      notifyUnmount(traverse);

      traverse = next;
    }
  }

  var parse = function (el) {
    var node = document.createElement(el.tagName);
    var attrs = el.attrs;

    node.el = el;
    el.dom = node;

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

  var parseSVG = function (el) {
    var node = document.createElementNS('http://www.w3.org/2000/svg', el.tagName);

    node.el = el;
    el.dom = node;

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

  var diff = function (parent, node, el) {
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

  var diffSVG$1 = function (parent, node, el) {
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
        } else if (typeof value == 'function') {
          node[key] = value;
        } else {
          node.setAttribute(key, value);
        }
      }
    }

    render(node, children);
  }

  exports.el = el;
  exports.parseStyleString = parseStyleString;
  exports.parseClassString = parseClassString;
  exports.render = render;
  exports.parse = parse;
  exports.parseSVG = parseSVG;
  exports.diff = diff;
  exports.diffSVG = diffSVG$1;

  Object.defineProperty(exports, '__esModule', { value: true });

}));