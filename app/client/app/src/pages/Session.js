import React from 'react';
import {withRouter} from 'react-router-dom';
import io from 'socket.io-client';

// Components
import ExpandingTextArea from 'components/ExpandingTextArea';
import Timer from 'components/Timer';
import ShareLink from 'components/ShareLink';
import SubscribeLink from 'components/SubscribeLink';
import PostCount from 'components/PostCount';
import Post from 'components/Post';
import Loading from 'components/Loading';

// 404 Page
import Page404 from 'pages/Page404';

class Session extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      id: props.match.params.session_id,
      title: 'hello world',
      description: "Okay guys. This is the time that we need to think about our marketing strategy for 2021. Any ideas you have just throw them out and we'll sit down later to go through them",
      created_at: 1601505467.040055,
      duration: 500,
      emails: ['graydenshand@gmail.com'],
      posts: ["What would it look like if we did content marketing?", "Why don't alumni talk about us?"],
      newPostText: '',
      newPostTextError: '',
      showAlert: false,
      alertText: '',
      notFound: false,
      startLoad: false,
      endLoad: false,
      showEmailForm: false,
      emailFormInput: '',
      emailFormError: '',
    }
    this.handleNewPostChange = this.handleNewPostChange.bind(this);
    this.handleEmailFormChange = this.handleEmailFormChange.bind(this);
    this.addPost = this.addPost.bind(this);
    this.handleSubmitEmail = this.handleSubmitEmail.bind(this);
    this.toggleAlert = this.toggleAlert.bind(this);
    this.flashAlert = this.flashAlert.bind(this);
    this.toggleEmailForm = this.toggleEmailForm.bind(this);
    this.handleNewPostEvent = this.handleNewPostEvent.bind(this);
  }

  handleNewPostChange(e) {
    this.setState({newPostText: e.target.value})
  }

  handleEmailFormChange(e) {
    this.setState({emailFormInput: e.target.value})
  }

  addPost(e) {
    e.preventDefault();
    // Handle Errors
    if (this.state.newPostText === '') {
      this.setState({newPostTextError: 'Post body is empty'})
      return;
    } else if (this.state.posts.includes(this.state.newPostText)) {
      // Disallow duplicate posts
      this.setState({newPostTextError: 'This has already been posted'})
      return;
    } else {
      // Clear error message
      this.setState({newPostTextError: ''})
    }

    // Send websocket event to server
    this.socket.emit("post", {session_id: this.state.id, post: this.state.newPostText})

    // Update state
    this.setState((prevState) => {
      return {
        posts: [this.state.newPostText, ...prevState.posts],
        newPostText: ''
      }
    })
  }

  handleNewPostEvent(post) {
    console.log(post)
    this.setState((prevState) => {
      if (!prevState.posts.includes(post)) {
        return {
          posts: [post, ...prevState.posts],
        }
      }
    })
  }

  async addEmail() {
    const opts = {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: this.state.emailFormInput
    }
    const response = await fetch(process.env.REACT_APP_API_URL + "/" + this.state.id + "/email", opts);
    return response.json();
  }

  handleSubmitEmail(e) {
    e.preventDefault();
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(this.state.emailFormInput)) {
      // Send request to server
      this.addEmail()
        .then(data => {
          this.setState({emailFormInput: '', showEmailForm: false, emailFormError: ''})
          this.flashAlert('Email address added')
        })
        .catch(error => {
          console.log(error);
          this.setState({emailFormError: 'Something went wrong, please try again in a few minutes'})
        })
    } else {
      this.setState({emailFormError: 'Invalid email address'})
    }
  }

  loadSession() {
    this.setState({startLoad: true, endLoad: false})
    let session_id = this.props.match.params.session_id;
    console.log(process.env.REACT_APP_API_URL)
    fetch(`${process.env.REACT_APP_API_URL}/${session_id}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (data.created_at) {
          this.setState({created_at: data.created_at, duration: data.duration, title: data.title, description: data.description, posts: data.posts, endLoad: true});
        } else {
          this.setState({notFound: true, endLoad: true})
        }

      })
      .catch(error => console.log("error", error))
  }

  toggleAlert() {
    this.setState(prevState => {
      return {
        showAlert: !prevState.showAlert
      }
    })
  }

  toggleEmailForm() {
    this.setState(prevState => {
      return {
        showEmailForm: !prevState.showEmailForm
      }
    })
  }

  flashAlert(text) {
    this.setState({showAlert: true, alertText: text})
    setTimeout(this.toggleAlert, 1000)
  }

  componentDidMount() {
    this.loadSession();
    console.log("Establishing websocket connection")
    this.socket = io(`${process.env.REACT_APP_API_URL}`);
    this.socket.emit("join", {"session_id": this.state.id})
    this.socket.on("message", message=>console.log(message))
    this.socket.on("connect", ()=>console.log("Established websocket connection"))
    this.socket.on("post", post=>this.handleNewPostEvent(post))
  }

  render() {
    let posts = <p className="mt-16 text-center text-lg font-thin tracking-wide text-green-400">No one has posted yet, why not get things started?</p>
    if (this.state.posts.length > 0) {
      posts = []
      this.state.posts.forEach((post, index)=> {
        posts.push(<Post key={index}>{post}</Post>)
        if (index != this.state.posts.length - 1) {
          posts.push(<hr />)
        }
      })
    }
    if (!this.state.endLoad) {
      return ''
    }
    if (this.state.notFound) {
      return <Page404 />
    } else {
      return (
        <div className="bg-gray-50 min-h-screen  text-green-800">
          <div className="relative px-5">
            <h1 className="max-w-screen-md mx-auto text-center font-semibold py-10 text-green-500 uppercase leading-none tracking-wide">Timed Brainstorm</h1>
            <div className={"w-64 inset-x-0 mx-auto absolute top-10 z-10 flex justify-center text-center p-2 border-2 text-green-900 border-green-500 shadow bg-white rounded " + (this.state.showAlert ? '' : 'hidden')}>
              <p className="">
                {this.state.alertText}
              </p>
            </div>
            <div className="max-w-screen-md mx-auto text-green-900 pb-10">
              <div className="flex flex-wrap justify-around sm:grid sm:grid-cols-3 sm:grid-flow-col  -mt-5">
                <div className="sm:mt-5 mr-3 w-full flex justify-center sm:w-auto sm:inline-block sm:col-start-1">
                  <div >
                    <ShareLink flashAlert={() => this.flashAlert('Copied')} className="justify-center sm:justify-start"/>
                    <SubscribeLink onClick={this.toggleEmailForm} className="mt-1 justify-center sm:justify-start" />
                  </div>
                </div>
                <PostCount count={ this.state.posts.length } className="mt-5 sm:col-start-2 sm:text-center" />
                <Timer className="mt-5 sm:col-start-3 sm:flex sm:justify-end" endTime={this.state.created_at + this.state.duration}/>
              </div>
              <div className="">
                <h1 className="text-3xl font-black mt-3">
                  {this.state.title}
                </h1>
                <p className="mt-1">{this.state.description}</p>
              </div>
              <div className="mt-5">
                <ExpandingTextArea id="postInput" minHeight="67px" handleChange={this.handleNewPostChange} text={this.state.newPostText} errorText={this.state.newPostTextError} placeholder="Eureka!" name="post" className="w-full border border-gray-500 rounded py-1 px-2 mb-3 focus:border-white outline-none focus:shadow-outline"></ExpandingTextArea>
                <div className="flex justify-end">
                  <button onClick={this.addPost} className="w-full sm:w-auto bg-green-500 px-3 py-2 text-base font-semibold text-white hover:bg-green-700 rounded">Add Post</button>
                </div>
              </div>

              {posts}

            </div>

            <div className={"absolute top-0 sm:top-10 inset-x-0 bg-white rounded z-10 max-w-screen-sm mx-auto shadow px-5 py-3 " + (this.state.showEmailForm ? '' : 'hidden')}>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Subscribe to the results</h2>
                </div>
                <div className="p-2 cursor-pointer hover:bg-gray-50" onClick={this.toggleEmailForm}>
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                </div>
              </div>
              <p className="text-sm leading-5">Add your email below to receive the final results of this brainstorming session. Your email address will be erased from our system after we send you the results. <a href="#" className="text-green-500 hover:text-green-800">Privacy policy</a></p>
              <form onSubmit={this.handleSubmitEmail}>
                <div className="flex mt-4">
                  <input type='email' value={this.state.emailFormInput} onChange={this.handleEmailFormChange} name='email' placeholder='bob@example.com' className="w-full border border-gray-500 rounded py-1 px-2 focus:border-white  outline-none focus:shadow-outline" />
                  <button className="w-full sm:w-auto bg-green-500 px-3 py-2 ml-3 text-base tracking-wide font-bold text-white hover:bg-green-700 rounded">Subscribe</button>
                </div>
                <p className="text-xs text-red-500 leading-5">{this.state.emailFormError}</p>
              </form>
            </div>
          </div>

          {this.state.showEmailForm ? <div className="fixed top-0 h-screen w-full bg-black opacity-50" onClick={this.toggleEmailForm} /> : ''}
        </div>


      )
    }
  }
}

export default withRouter(Session)
