import React from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';

const Loader = ({
  message = 'Loading...',
  fullscreen = false,
  size = 56,
  thickness = 4,
}) => {
  const containerStyles = fullscreen
    ? {
        position: 'fixed',
        inset: 0,
        minHeight: '100vh',
        width: '100%',
        zIndex: 9999,
        backgroundColor: 'rgba(249, 250, 255, 0.9)',
        backdropFilter: 'blur(3px)',
      }
    : {
        minHeight: 160,
        width: '100%',
        backgroundColor: 'transparent',
      };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        ...containerStyles,
      }}
    >
      <Stack spacing={2.5} alignItems="center">
        <CircularProgress
          size={size}
          thickness={thickness}
          sx={{ color: '#1F6FEB' }}
        />
        {message ? (
          <Typography
            variant="body1"
            sx={{
              color: '#1F2937',
              fontWeight: 600,
              textAlign: 'center',
              letterSpacing: 0.2,
            }}
          >
            {message}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
};

export default Loader;

