import PropTypes from 'prop-types';
import React from 'react';

class ReactIframe extends React.Component {

  constructor(props) {
    super(props);
    this.onPostMessage = this.onPostMessage.bind(this);
    this.postMessage = this.postMessage.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.origin = this.origin.bind(this);
    this.updateHeight = this.updateHeight.bind(this);
    this.ref = React.createRef();
    this.state = {
      height: this.props.height,
      width: this.props.width
    }
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props.message) === JSON.stringify(nextProps.message) ) {
      this.postMessage(nextProps.message.procedure, ...nextProps.message.arguments);
    }
  }

  origin() {
    const url = this.props.src.split('/');
    return `${url[0]}//${url[2]}`;
  }

  onLoad() {
    this.postMessage('');
  }  

  componentDidMount() {
    window.addEventListener('message', this.onPostMessage);
  }

  onPostMessage(event) {
    if (event.origin==this.origin()) {
      const message = JSON.parse(event.data);
      switch (message.procedure) {
        case 'setHeight':
          this.updateHeight(message.arguments[0]);
        break;
        case 'setWidth':
          this.updateWidth(message.arguments[0]);
        break;
        default:
          this.props.messageHandler(message);
      }
    }
  } 

  updateHeight(height) {
    if (this.props.allowUpdateHeight) {
      this.setState({height});
    }
  }

  updateWidth(width) {
    if (this.props.allowUpdateHeight) {
      this.setState({width});
    }    
  }

  postMessage(procedure, ...args) {
    const message = JSON.stringify({
      procedure,
      arguments: args
    });
    console.log(message);
    this.ref.current.contentWindow.postMessage(
      message,
      this.origin()
    );
  }

  render() {
    const {src} = this.props;
    return (
        <iframe 
          ref={this.ref}
          style={{
            width: this.state.width,
            height: this.state.height
          }}
          onLoad={this.onLoad}
          frameBorder={this.props.frameBorder}
          scrolling={this.props.scrolling}
          src={src}
        />
    );
  }
}

ReactIframe.defaultProps = {
  allowUpdateHeight: true,
  allowUpdateWidth: false,
  message: {
    procedure: null,
    arguments: null
  },
  height: '100vh',
  width: '100%',
  messageHandler: () => {},
  onLoadMessage: {
    procedure: null,
    arguments: null
  },
  frameBorder: '0',
  scrolling: 'no'
}

const messagePropType = PropTypes.shape({
  procedure: PropTypes.string,
  arguments: PropTypes.array
});

ReactIframe.propTypes = {
  allowUpdateHeight: PropTypes.bool,
  allowUpdateWidth: PropTypes.bool,
  onLoadMessage: messagePropType,
  height: PropTypes.string,
  width: PropTypes.string,
  messageHandler: PropTypes.func,
  message: messagePropType,
  frameBorder: PropTypes.string,
  scrolling: PropTypes.string,
  src: PropTypes.string.isRequired
}

export default ReactIframe;