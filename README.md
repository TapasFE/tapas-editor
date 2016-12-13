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

// Import tinymce first
import 'tinymce';
import 'tinymce/themes/modern/theme';
import 'tinymce/skins/lightgray/skin.min.css';

// Import tinymce plugins
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/searchreplace';
// Import buggy tinymce plugins
import 'imports?this=>window!tinymce/plugins/paste';

// Import TapasEditor
import TapasEditor from 'tapas-editor';

import contentStyle from 'css!tinymce/skins/lightgray/content.min.css';
const config = {
  content_style: contentStyle.map(item => item[1]).join(''),
};

class Editor extends React.Component {
  state = {
    content: 'Initial content',
  }

  handleChange = content => {
    this.setState({
      content,
    });
    console.log('Content changed.');
  }

  render() {
    return <TapasEditor onChange={this.handleChange} />
  }
}

ReactDOM.render(<Editor config={config} />, document.body);
```

Development
---
``` sh
# Build library
$ npm run build

# Run demo
$ npm start
```
