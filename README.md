Tapas-Editor
===

![NPM](https://img.shields.io/npm/v/tapas-editor.svg)
![License](https://img.shields.io/npm/l/tapas-editor.svg)
![Downloads](https://img.shields.io/npm/dt/tapas-editor.svg)

A React editor component based on [TinyMCE](https://www.tinymce.com).

Usage
---
``` javascript
import React from 'react';
import ReactDOM from 'react-dom';
import TapasEditor from 'tapas-editor';

class Editor extends React.Component {
  state = {
    content: 'Initial content',
  }

  handleChange = (content) => {
    this.setState({
      content,
    });
    console.log('Content changed.');
  }

  render() {
    return <TapasEditor onChange={this.handleChange} />
  }
}

ReactDOM.render(<Editor />, document.body);
```

Write your own plugins for `tinymce`:
``` javascript
import {tinymce} from 'tapas-editor';

tinymce.PluginManager.add('my_plugin', editor => {
  // Do stuff here
});
```

Development
---
``` sh
# Build
$ npm run build
# Run demo
$ npm start
```
