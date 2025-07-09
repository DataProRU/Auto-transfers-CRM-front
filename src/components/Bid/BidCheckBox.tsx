import { FormControlLabel, Checkbox } from '@mui/material';
import React from 'react';

interface BidCheckboxProps {
  checked: boolean;
  label: string;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

const BidCheckbox: React.FC<BidCheckboxProps> = ({
  checked = false,
  label,
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
    />
  );
};

export default BidCheckbox;
