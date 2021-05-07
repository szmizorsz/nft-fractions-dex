import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Box } from '@material-ui/core';

const NFTDescription = ({ name, description }) => {

    return (
        <>
            <Box mt={3}><Typography variant="h5" >{name}</Typography></Box>
            <Box mt={3} mb={3}><Typography>{description}</Typography></Box>
        </>
    )
}

export default NFTDescription;