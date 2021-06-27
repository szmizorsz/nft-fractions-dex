import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Box } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

const NFTDescription = ({
    name,
    description,
    author,
    ownShares,
    totalShares,
    setTokenTransferAccrossChainsDialogOpen
}) => {

    const transferButtonDisplay = () => {
        if (ownShares > 0) {
            return <Box ml={30} >
                <Button size="small" color="primary" onClick={() => { setTokenTransferAccrossChainsDialogOpen(true) }}>
                    Transfer
                </Button>
            </Box>;
        }
    }

    return (
        <>
            <Box mt={1}><Typography variant="h5" >{name}</Typography></Box>
            <Box mt={3} mb={3}><Typography>{description}</Typography></Box>
            <Box mt={3} mb={3}><Typography>{author}</Typography></Box>
            <Box><Typography>Own/Total shares: {ownShares}/{totalShares}</Typography></Box>
            <Box mb={1}>
                <Grid container>
                    <Grid item xs={12} md={2}>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Box ml={10}><Typography>{transferButtonDisplay()}</Typography></Box>
                    </Grid>
                </Grid>
            </Box>
        </>
    )
}

export default NFTDescription;