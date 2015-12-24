import React, {Component} from 'react';
import TinyMCE from 'react-tinymce';
import {requireTheme, requireSkin, requirePlugins} from './utils';

requireTheme();
requireSkin();
requirePlugins([
  'searchreplace',
  'autoresize',
]);

const defaultConfig = {
  // Avoid `skin` to be loaded from URL
  skin: false,
};

class TapasEditor extends Component {
  static propTypes = {
    config: React.PropTypes.object,
    content: React.PropTypes.string,
    onChange: React.PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.config = Object.assign({}, defaultConfig, this.props.config);
  }

  render() {
    return (
      <TinyMCE
      config={this.config}
      content={this.props.content}
      onChange={this.props.onChange}
      />
    );
  }
}

export default TapasEditor;
