# RZR
Turboboosted 2 KB virtual dom view library for browser &amp; node.js

## Installation
This is an early beta. For now install straight from Github:
```js
npm install pakastin/rzr
```

## Configuration
Change JSX pragma to `el` and remember to `import { el } from 'rzr'` every time you use JSX.

## Example project
https://github.com/pakastin/rzr-example

## Usage

```js
import { el, list, render } from 'rzr';

class Li {
  render({ i }, ...children) {
    return <li class="item" onclick={ this.onClick.bind(this) }>{ i }</li>
  }
  init(data, ...children) {
    console.log('created', this.dom);
  }
  update(data, ...children) {
    console.log('updated', this.dom);
  }
  mount() {
    console.log('mounted', this.dom);
  }
  unmount() {
    console.log('unmounted', this.dom);
  }
  onClick() {
    console.log(this);
  }
}

var data = new Array(50);

for (var i = 0; i < data.length; i++) {
  data[i] = { i };
}

update();

function update () {
  var LEN = Math.random() * 25 + 25 | 0;
  
  render(document.body, <ul>
    { list(Li, data.slice(0, LEN) }
  </ul>);
  
  data.sort(() => Math.random() - 0.5);

  setTimeout(update, 1000);
}

```

## State

You can save state to components' `this`.

## Non-virtual-dom version
If you need mutability, check out [FRZR](https://frzr.js.org). You can also mix & match!
