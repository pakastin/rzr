# rzr
Turboboosted 2 KB virtual dom view library for browser &amp; node.js

## Installation
This is an early beta. For now install straight from Github:
```js
npm install pakastin/rzr
```

## Configuration
Change JSX pragma to `el` and remember to `import { el } from 'rzr'` every time you use JSX.

## Usage

```js
import { el, render } from 'rzr';

class Li {
  render(data, ...children) {
    return <li class="item" onclick={ this.onClick.bind(this) }>{ data.i }</li>
  }
  init(data, ...children) {
    console.log('created');
  }
  update(data, ...children) {
    console.log('updated');
  }
  mount() {
    console.log('mounted');
  }
  unmount() {
    console.log('unmounted');
  }
  onClick() {
    console.log(this);
  }
}

var data = new Array(1000);

for (var i = 0; i < data.length; i++) {
  data[i] = i;
}

render(document.body, <ul>
  { data.map(item => <Li i={ i }></Li>) }
</ul>);

setTimeout(function () {
  data.sort(() => Math.random() - 0.5);

  render(document.body, <ul>
    { data.map(item => <Li i={ i }></Li>) }
  </ul>);
}, 1000);
```

## State

You can save state to components' `this`.
