import React from 'react';

export default class Loading extends React.Component {

  render() {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="flex justify-center items-center w-64 h-64 bg-green-500 rounded-full">
          <h1 className="max-w-screen-md mx-auto text-center font-semibold py-10 text-gray-50 uppercase leading-none tracking-wide">Timed Brainstorm</h1>
        </div>
      </div>
    )
  }
}
