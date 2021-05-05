import React from 'react';
import Grid from '@material-ui/core/Grid';
import MenuBar from './components/MenuBar.js'
import Box from '@material-ui/core/Box';
import LoadingContainer from './components/ethereum/LoadingContainer.js';
import MyRoute from './components/MyRoute.js';

function App() {
  return (
    <div>
      <MenuBar />
      <Grid container>
        <Grid item md={2}></Grid>
        <Grid item xs={12} md={8}>
          <Box mt={10}>
            <div className="content">
              <MyRoute path="/ethereum/landing">
                <LoadingContainer />
              </MyRoute>
            </div>
          </Box>
        </Grid>
        <Grid item md={2}></Grid>
      </Grid>
    </div >

  );
}

export default App;
