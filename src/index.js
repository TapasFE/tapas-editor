import React from 'react';
import tinymce from './tinymce';
import './plugins/autofloat';
import './plugins/cursor';
import './plugins/image';
import './plugins/filter';
import {debounce} from './utils';

const getId = function () {
  function getId() {
    return `tapas-editor-${++ id}`;
  }
  let id = 0;
  return getId;
}();

const defaultConfig = {
  // Avoid `skin` to be loaded from URL
  skin: false,
};

class TapasEditor extends React.Component {
  static defaultProps = {
    config: {},
    content: '',
    events: {},
  };

  constructor(props) {
    super(props);
    // cache content to avoid repeated update due to differences caused by output rules
    this.content = props.content;
  }

  componentWillMount() {
    this.id = this.id || this.props.id || getId();
  }

  componentDidMount() {
    this.initEditor(this.props.config, this.props.content);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.config !== nextProps.config) {
      this.initEditor(nextProps.config, nextProps.content);
    } else if (this.content !== nextProps.content) {
      this.editor && this.setContent(this.content = nextProps.content || '');
    }
    if (this.props.id !== nextProps.id) {
      this.id = nextProps.id;
    }
  }

  shouldComponentUpdate(nextProps) {
    return this.content !== nextProps.content || this.props.config !== nextProps.config;
  }

  componentWillUnmount() {
    this.removeEditor();
  }

  render() {
    return this.props.config.inline ? (
      <div
        id={this.id}
        className={this.props.className}
        dangerouslySetInnerHTML={{__html: this.props.content}}
      />
    ) : (
      <textarea
        id={this.id}
        className={this.props.className}
      />
    );
  }

  setContent(content) {
    const {editor} = this;
    if (!editor) return;
    editor.setContent(content);
    editor.fire('TFilterHtml', {data: content});
  }

  initEditor(config, content) {
    this.initialized && this.removeEditor();
    const editorConfig = {
      ... defaultConfig,
      ... config,
      selector: `#${this.id}`,
      setup: (setup => {
        return editor => {
          const {events} = this.props;
          events && Object.keys(events)
          .forEach(type => {
            const handler = events[type];
            if (typeof handler === 'function') {
              editor.on(type, e => {
                handler(e, editor);
              });
            }
          });
          editor.on('init', () => {
            this.editor = editor;
            content && this.setContent(content);
          });
          editor.on('change', debounce(() => {
            // Set to `null` to mark a change in content
            this.content = null;
            // If `props.onChange` is provided, update cached content
            this.props.onChange && this.props.onChange(this.content = editor.getContent());
          }));
          setup && setup(editor);
        };
      })(config.setup),
    };
    tinymce.init(editorConfig);
    this.initialized = true;
  }

  removeEditor() {
    tinymce.EditorManager.execCommand('mceRemoveEditor', true, this.id);
    this.initialized = false;
    this.editor = null;
  }
}

export default TapasEditor;
