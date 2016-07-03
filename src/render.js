
import { diff, diffSVG } from './index';

export function render (parent, el, originalPos) {
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

      oldComponent.update && oldComponent.update(attrs, ...children);

      el = oldComponent.render(attrs, ...children);
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

      el = component.render(attrs, ...children);
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
        component.init && component.init(attrs, ...children);
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
