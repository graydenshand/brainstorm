import React from 'react';


export default class PostCount extends React.Component {
  render() {
    return (
      <div {...this.props}>
        <div className="text-center">
          <p className="text-green-800 text-xs font-semibold uppercase leading-wider">Ideas Generated</p>
          <p className="font-semibold text-green-700 text-center">{this.props.count}</p>
        </div>
      </div>
    )
  }
}
