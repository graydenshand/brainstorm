import React from 'react';

export default class ShareLink extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      copied: false
    }
    this.ref = React.createRef();
    this.copyText = this.copyText.bind(this);
  }

  copyToClipboard(str) {
	  const el = document.createElement('textarea');
	  el.value = str;
	  document.body.appendChild(el);
	  el.select();
	  document.execCommand('copy');
	  document.body.removeChild(el);
	};

  copyText(e) {
      e.preventDefault();
      const text = this.ref.current;
      this.copyToClipboard(text.innerHTML);
      this.setState({copied: true})
  }

  render() {
    return (
        <a {...this.props} href={window.location.href} title="Copy" onClick={(e) => {this.copyText(e); this.props.flashAlert();}} className={"text-green-500 hover:text-green-700 flex items-center " + (this.props.className ? this.props.className : '')}>
          {this.state.copied ? (
            <svg class="w-4 h-4 mr-1  flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
          ) : (
            <svg class="w-4 h-4 mr-1  flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
            </svg>
          )}
          <p className="text-xs font-semibold uppercase leading-wider">Share this link</p>
          <span ref={this.ref} className="hidden">{window.location.href}
          </span>

        </a>
    )
  }
}
