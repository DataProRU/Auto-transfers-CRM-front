import { FormControlLabel, Checkbox } from '@mui/material';
import React from 'react';

interface BidCheckboxProps {
  checked: boolean;
  label: string;
  disabled?: boolean;
  visible?: boolean;
  onChange?: (checked: boolean) => void;
}

const BidCheckbox: React.FC<BidCheckboxProps> = ({
  checked = false,
  label,
  visible = true,
  disabled = false,
  onChange,
}) => {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
        />
      }
      label={label}
      sx={{
        display: visible ? 'block' : 'none',
      }}
    />
  );
};

export default BidCheckbox;
