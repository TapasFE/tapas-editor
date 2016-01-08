Tapas-Editor
===

![NPM](https://img.shields.io/npm/v/tapas-editor.svg)

A React editor component based on [TinyMCE](https://www.tinymce.com).

Usage
---
``` javascript
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import TapasEditor from 'tapas-editor';

class App extends Component {
  render() {
    return <TapasEditor />;
  }
}

ReactDOM.render(<App />, document.body);
```

Write your own plugins for `tinymce`:
``` javascript
import {tinymce} from 'tapas-editor';

tinymce.PluginManager.add('my_plugin', editor => {
  // Do stuff here
});
```
