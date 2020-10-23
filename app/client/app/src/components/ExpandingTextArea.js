// Textarea element who's height grows with the size of it's contents
import React from 'react';

export default class ExpandingTextArea extends React.Component {

  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.resize = this.resize.bind(this);
    this.delayedResize = this.delayedResize.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  resize() {
    let textarea = this.ref.current;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + "px";
  }

  delayedResize() {
    window.setTimeout(this.resize, 0);
  }

  handleKeyDown(e) {
    // cmd+enter
    if (e.keyCode == 13 && e.metaKey && this.props.submitForm) {
  		this.props.submitForm(e);
  	} else {
      this.delayedResize();
    }
  }


  componentDidUpdate() {
    // resize after updating props
    this.resize();
  }

  render() {
    let minHeight = "150px";
    if (this.props.minHeight) {
      minHeight = this.props.minHeight
    }
    return (
      <div>
        <textarea
          {...this.props}
          ref={this.ref}
          onKeyDown={this.handleKeyDown}
          onCut={this.delayedResize}
          onPaste={this.delayedResize}
          onDrop={this.delayedResize}
          onChange={(e) => {this.resize(); if (this.props.handleChange) { this.props.handleChange(e) };}}
          style={{minHeight: minHeight}}
          value={this.props.text}
        >{this.props.text}
        </textarea>
        <p className="text-sm text-red-500 -mt-2">{this.props.errorText}</p>
      </div>
    )
  }
}
