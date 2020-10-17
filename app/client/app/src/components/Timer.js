import React from 'react';

export default class Timer extends React.Component {
  // Take an end time, return a timer that counts down days hours minutes seconds until end time
  constructor(props) {
    super(props);
    this.state = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      intervalId: null,
      ttl: 0
    }
    this.calculateTimeComponents = this.calculateTimeComponents.bind(this);
    this.startTimer = this.startTimer.bind(this);
  }

  componentDidMount() {
    this.startTimer()
  }

  componentWillUnmount() {
    window.clearInterval(this.state.intervalId)
  }

  calculateTimeComponents() {
    const endTime = new Date(this.props.endTime * 1000);
    const now = new Date();
    let ttl = (endTime - now) / 1000
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    if (ttl > 0) {
      days = Math.floor(ttl / (3600*24));
			hours = Math.floor(ttl % (3600*24) / 3600);
			minutes = Math.floor(ttl % 3600 / 60);
			seconds = Math.floor(ttl % 60);
    }
    this.setState({
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      ttl: ttl
    })
  }

  startTimer() {
    this.calculateTimeComponents();
    var intervalId = setInterval(this.calculateTimeComponents, 1000);
    this.setState({intervalId: intervalId});
  }

  pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  render() {
    let days = `${this.state.days}d`
    if (this.state.ttl < 3600 * 24) {
      days = ''
    }
    let hours = `${this.state.hours}h`
    if (this.state.ttl < 3600) {
      hours = ''
    }
    let minutes = `${this.state.minutes}m`
    if (this.state.ttl < 60 || this.state.ttl > 3600*24) {
      minutes = ''
    }
    let seconds = `${this.pad(this.state.seconds, 2, '0')}s`
    if (this.state.ttl > 60*10) {
      seconds = ''
    }
    return (
      <div {...this.props}>
        <div className="text-center">
          <p className="text-green-800 text-xs font-semibold uppercase leading-wider">Time Remaining</p>
          <p className="font-semibold text-green-700">{days} {hours} {minutes} {seconds}</p>
        </div>
      </div>
    )
  }
}
