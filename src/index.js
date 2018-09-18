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
      width: this.props.width,
      loader: this.props.loader
    }
    this.url = this.props.src;
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
    this.setState({loader:''});
    if (this.props.onLoadMessage.procedure !== '') {
      this.postMessage(
        this.props.onLoadMessage.procedure,
        ...this.props.onLoadMessage.arguments
      );
    }
  }  

  componentDidMount() {
    window.addEventListener('message', this.onPostMessage);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.onPostmessage);
  }

  onPostMessage(event) {
    if (event.origin==this.origin()) {
      try {
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
      catch (error) {
        // silent
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
    this.ref.current.contentWindow.postMessage(
      message,
      this.origin()
    );
  }

  render() {
    const {src, frameBorder, scrolling, minHeight} = this.props;
    const {loader, width, height} = this.state;
    const inlineStyle = {
      width,
      height,
      minHeight
    };

    if (loader!='') {
      inlineStyle.backgroundImage = `url(${loader})`;
      inlineStyle.backgroundRepeat = 'no-repeat';
      inlineStyle.backgroundPosition = '50% 50%';
    };

    return (
        <iframe
          ref={this.ref}
          style={inlineStyle}
          onLoad={this.onLoad}
          frameBorder={frameBorder}
          scrolling={scrolling}
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
  height: 'calc(100vh-55px)',
  minHeight: 'calc(100vh - 55px)',
  width: '100%',
  loader: '',
  messageHandler: () => {},
  onLoadMessage: {
    procedure: '',
    arguments: []
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
  minHeight: PropTypes.string,
  width: PropTypes.string,
  messageHandler: PropTypes.func,
  message: messagePropType,
  loader: PropTypes.string,
  frameBorder: PropTypes.string,
  scrolling: PropTypes.string,
  src: PropTypes.string.isRequired
}

export default ReactIframe;