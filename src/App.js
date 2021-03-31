import React from 'react';
import Grid from '@material-ui/core/Grid';
import MenuBar from './components/MenuBar.js'
import Box from '@material-ui/core/Box';
import {
  HashRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import LandingPage from './components/ethereum/LandingPage.js';

function App() {
  return (
    <div>
      <Router>
        <MenuBar />
        <Grid container>
          <Grid item md={2}></Grid>
          <Grid item xs={12} md={8}>
            <Box mt={10}>
              <div className="content">
                <Switch>
                  <Route path="/ethereum/landing">
                    <LandingPage />
                  </Route>
                </Switch>
              </div>
            </Box>
          </Grid>
          <Grid item md={2}></Grid>
        </Grid>
      </Router>
    </div>

  );
}

export default App;
