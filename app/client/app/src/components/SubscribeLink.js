import React from 'react';

export default class SubscribeLink extends React.Component {
  render() {
    return (
      <a {...this.props} href="#" title="Subscribe" className={"text-green-500 hover:text-green-700 flex items-center " + (this.props.className ? this.props.className : '')}>
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        <p className="text-xs font-semibold uppercase leading-wider">Send me the results</p>
        <span ref={this.ref} className="hidden">{window.location.href}
        </span>
      </a>
    )
  }
}
