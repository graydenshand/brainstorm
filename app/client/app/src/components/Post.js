import React from 'react';


export default class Post extends React.Component {
  render() {
    return (
      <div className="my-10 whitespace-pre-wrap">
        {this.props.children}
      </div>
    )
  }
}
