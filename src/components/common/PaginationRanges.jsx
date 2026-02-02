import React from 'react';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';

const PaginationRanges = ({
  count = 1,
  page = 1,
  onChange,
  variant = 'text',
  color = 'primary',
  siblingCount = 1,
  boundaryCount = 1,
  hideIfSinglePage = true,
  stackProps = {},
  paginationProps = {},
}) => {
  if (hideIfSinglePage && count <= 1) {
    return null;
  }

  return (
    <Stack direction="row" justifyContent="center" {...stackProps}>
      <Pagination
        count={count}
        page={page}
        onChange={onChange}
        variant={variant}
        color={color}
        siblingCount={siblingCount}
        boundaryCount={boundaryCount}
        sx={{
          '& .MuiPaginationItem-root.Mui-selected': {
            backgroundColor: '#1F6FEB',    
            color: '#ffffff',                  
            '&:hover': {
                backgroundColor: '#1F6FEB',
              },
          },
        }}
        {...paginationProps}
      />
    </Stack>
  );
};

export default PaginationRanges;
