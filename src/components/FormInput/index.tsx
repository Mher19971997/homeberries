import React from 'react';
import { Box, OutlinedInput, InputAdornment, IconButton } from '@mui/material';

interface FormInputProps {
  name?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  Icon?: React.ReactElement;
  fullWidth?: boolean;
  error?: boolean;
  onChange?: () => void;
  inputHeight?: string;
  inputRadius?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  name,
  type,
  placeholder,
  onChange,
  error,
  value,
  Icon,
  fullWidth = false,
  inputHeight,
  inputRadius
}) => {
  return (
    <OutlinedInput
      error={error}
      type={type}
      fullWidth={fullWidth}
      sx={{
        borderRadius: inputRadius ?? '10px',
        height: inputHeight ?? '50px',
        backgroundColor: '#FFF',
        border: '1px solid #999'
      }}
      required
      placeholder={placeholder}
      value={value}
      id={name}
      name={name}
      onChange={onChange}
      endAdornment={
        <InputAdornment position='end'>
          <IconButton edge='end'>{Icon}</IconButton>
        </InputAdornment>
      }
    />
  );
};

export default FormInput;
