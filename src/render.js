
import { parse, parseSVG, diff } from './index';

export var render = (parent, el, pos) => {
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

      oldComponent.update(attrs, ...children);

      el = oldComponent.render(attrs, ...children);
      el.component = oldComponent;
      el.componentClass = oldComponentClass;
      render(parent, el, pos++);
    } else {
      var componentClass = el.tagName;
      var component = new componentClass();
      var attrs = el.attrs;
      var children = el.children;

      el = component.render(attrs, ...children);
      el.component = component;
      el.componentClass = componentClass;

      component.init && component.init(attrs, ...children);

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

      component && component.mount && component.mount();
    }
  }

  if (originalPos == null) {
    var traverse = parent.childNodes[pos];

    while (traverse) {
      component.unmount && component.unmount();
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
