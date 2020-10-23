import React from 'react';
import {Redirect} from 'react-router-dom';

//Components
import ExpandingTextArea from 'components/ExpandingTextArea';

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      titleError: "",
      description: "",
      durationDays: 0,
      durationHours: 1,
      durationMinutes: 0,
      durationError: "",
      email: "",
      emailError: "",
    }
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handleDurationDaysChange = this.handleDurationDaysChange.bind(this);
    this.handleDurationHoursChange = this.handleDurationHoursChange.bind(this);
    this.handleDurationMinutesChange = this.handleDurationMinutesChange.bind(this);
    this.durationSeconds = this.durationSeconds.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.formIsValid = this.formIsValid.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.formIsValid()) {
      const duration = this.durationSeconds();
      this.newSession()
        .then(data => {
          this.addEmail(data.session_id)
          .then(response => {
            window.location.pathname = "/" + data.session_id
          })
          .catch(error => console.log(error))
        })
        .catch(error => console.log(error))
    }
  }

  async newSession() {
    const opts = {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        title: this.state.title,
        duration: this.durationSeconds(),
        description: this.state.description
      })
    }
    const response = await fetch(process.env.REACT_APP_API_URL + "/session/", opts);
    return response.json();
  }

  async addEmail(session_id) {
    const opts = {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: this.state.email
    }
    const response = await fetch(process.env.REACT_APP_API_URL + "/session/" + session_id + "/email", opts);
    return response.json();
  }

  durationSeconds() {
    const duration = (this.state.durationDays * 24 * 60 * 60) + (this.state.durationHours * 60 * 60) + (this.state.durationMinutes * 60)
    return duration
  }

  formIsValid() {
    let validated = true
    // title not empty
    if (this.state.title === '') {
      this.setState({titleError: "Title is required"})
      validated = false
    }
    // duration > 0 seconds
    if (this.durationSeconds() <= 0) {
      this.setState({durationError: "No duration set"})
      validated = false
    }

    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(this.state.email)) {
      this.setState({emailError: "Invalid email address"});
      validated = false
    }
    return validated
  }

  handleTitleChange(e) {
    this.setState({title: e.target.value})
  }

  handleEmailChange(e) {
    this.setState({email: e.target.value})
  }

  handleDescriptionChange(e) {
    this.setState({description: e.target.value})
  }

  handleDurationDaysChange(e) {
    this.setState({durationDays: parseInt(e.target.value)})
  }

  handleDurationHoursChange(e) {
    this.setState({durationHours: parseInt(e.target.value)})
  }

  handleDurationMinutesChange(e) {
    this.setState({durationMinutes: parseInt(e.target.value)})
  }

  render() {
    let date = new Date();
    let dateToday = date.toISOString().split('T')[0];
    let dateMax = new Date();
    dateMax.setTime(dateMax.getTime() + (24*50*60*1000) * 7) // 7 days
    dateMax = dateMax.toISOString().split('T')[0]

    return (
      <div className="bg-gray-800 min-h-screen text-green-800 flex justify-center items-center">
        <div className="max-w-screen-xl mx-auto md:grid md:grid-cols-3 md:grid-flow-col-dense bg-white rounded">
          <form className="bg-gray-100 p-5 md:col-start-3 rounded-r py-10 md:py-5" onSubmit={this.handleSubmit}>
            <h1 className="text-3xl mb-4 text-green-700 font-black leading-none">
              Start a new <br/>brainstorming session
            </h1>
            <div>
              <label for="titleInput" className="text-lg font-semibold" >Title</label>
              <input type="text" id="titleInput" value={this.state.title} onChange={this.handleTitleChange} className="w-full border border-gray-500 rounded py-1 px-2 focus:border-white  outline-none focus:shadow-outline" />
              <p className="text-sm text-red-500">{this.state.titleError}</p>
            </div>
            <div className="mt-4">
              <label for="descriptionInput" className="text-lg font-semibold">Description</label>
              <ExpandingTextArea id="descriptionInput" value={this.state.description} minHeight="100px" handleChange={this.handleDescriptionChange} className="w-full border border-gray-500 rounded py-1 px-2 focus:border-white  outline-none focus:shadow-outline"></ExpandingTextArea>
            </div>
            <div className="mt-4">
              <label className="text-lg font-semibold">Duration</label>
              <div className="flex justify-between items-center">
                <div className="w-full mr-6">
                  <label for="durationDaysInput" className="text-xs font-semibold uppercase text-green-500 tracking-wider" >Days</label>
                  <input type="number" id="durationDaysInput" placeholder="days" onChange={this.handleDurationDaysChange} min="0" max="6" value={this.state.durationDays} className="w-full border border-gray-500 rounded py-1 px-2 focus:border-white  outline-none focus:shadow-outline" />
                </div>
                <div className="w-full mx-6">
                <label for="durationHoursInput" className="text-xs font-semibold uppercase text-green-500 tracking-wider" >Hours</label>
                  <input type="number" id="durationHoursInput" placeholder="hours" onChange={this.handleDurationHoursChange} min="0" max="23" value={this.state.durationHours} className="w-full border border-gray-500 rounded py-1 px-2 focus:border-white  outline-none focus:shadow-outline" />
                </div>
                <div className="w-full ml-6">
                  <label for="durationMinutesInput" className="text-xs font-semibold uppercase text-green-500 tracking-wider" >Minutes</label>
                  <input type="number" id="durationMinutesInput" placeholder="minutes" onChange={this.handleDurationMinutesChange} min="0" max="59" value={this.state.durationMinutes} className="w-full border border-gray-500 rounded py-1 px-2 focus:border-white  outline-none focus:shadow-outline" />
                </div>
              </div>
              <p className="text-sm text-red-500">{this.state.durationError}</p>
            </div>
            <div className="mt-4">
              <div className='flex items-center'>
                <label for="emailInput" className="text-lg font-semibold ">Email</label>
              </div>
              <input type="text" id="emailInput" name="email" value={this.state.email} placeholder="bob@example.com" onChange={this.handleEmailChange} className="w-full border border-gray-500 rounded py-1 px-2 focus:border-white  outline-none focus:shadow-outline" />
              <p className="text-sm">We'll email you the results</p>
              <p className="text-sm text-red-500">{this.state.emailError}</p>
            </div>
            <div className="flex items-center my-5 text-yellow-600 p-2 border border-yellow-500 bg-yellow-50 rounded">
              <svg class="w-6 h-6 mr-2 flex-shrink-0 flex-grow-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p className="leading-tight font-semibold ">Please note, you cannot change these fields after your session has started.</p>
            </div>
            <div className="flex justify-center mt-8">
              <button className="w-full sm:w-auto bg-green-700 px-8 py-4 mb-10 md:mb-0 text-lg tracking-wide font-bold text-white  hover:bg-green-500 transition-colors duration-400 rounded">Start Session</button>
            </div>
          </form>
          <div className="md:col-span-2 md:col-start-1 bg-green-700 text-green-50 md:grid md:grid-cols-2 p-5 rounded-l">
            <div className="px-2 pt-10 md:pt-0">
              <p className="text-xl mb-3 font-semi-bold">Welcome to <strong>Timed Brainstorm,</strong> a free and open source tool for collaboratively generating ideas.</p>
              <p className="text-xl mb-3 font-semi-bold">You can start a new brainstorming session using the form on this page.</p>
              <p className="text-xl mb-3 font-semi-bold">Once you've created your session, you can <strong>invite others to the page by sharing the session URL.</strong></p>
              <p className="text-xl mb-3 font-semi-bold"><strong>Users post anonymously.</strong> This helps generate more ideas faster. However, it also means you must be careful about sharing your session link. Anyone with the link can anonymously contribute to your session.</p>
              <p className="text-xl mb-3 font-semi-bold">After your session has ended, <strong>we'll send you an email with the results for your records. Then, all of the data from your session is erased&mdash;</strong>we only retain statistics on session such as the number of ideas generated.</p>
            </div>
            <div className="px-2">
              <p className="text-xl mb-3 font-semi-bold">Thanks for visiting the site. If you find it useful, please donate to charity and share it with your friends.</p>
              <p className="text-xl mb-3 font-semi-bold">You can view the code for this app on <a href="https://github.com/graydenshand/brainstorm" target="_blank" className="underline">GitHub</a>.</p>
              <p className="text-xl mb-3 font-semi-bold">And you can email me feedback or bug reports at <a href="mailto:hello@timedbrainstorm.com" target="_blank" className="underline">hello@timedbrainstorm.com</a>.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
