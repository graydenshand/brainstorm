import React from 'react';
import 'styles/tailwind.generated.css';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

// Pages
import Home from 'pages/Home';
import Session from 'pages/Session';
import Page404 from 'pages/Page404';

function App() {
  return (
    <div className="App">
        
        <Router>
          <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/:session_id" component={Session} />


          <Route>
            <Page404 />
          </Route>
          </Switch>
        </Router>
    </div>
  );
}

export default App;
