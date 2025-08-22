import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { observer } from 'mobx-react-lite';
import { useEffect, useState, type SyntheticEvent } from 'react';

interface OptionType {
  id?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface ComboboxProps<T extends OptionType> {
  onChange: (selectedId: number | null) => void;
  fetchOptions: (withParams: boolean) => Promise<void>;
  options: T[];
  isLoading: boolean;
  label?: string;
  width?: number | string;
  value?: number;
  error?: boolean;
  helperText?: string;
  getOptionLabel?: (option: T) => string;
  disabled?: boolean;
  filter?: boolean;
  initialData?: T;
}

const Combobox = observer(function Combobox<T extends OptionType>({
  onChange,
  fetchOptions,
  options,
  isLoading,
  label = '',
  width = 250,
  value,
  error = false,
  helperText = '',
  getOptionLabel = (option) => option.name || '',
  disabled = false,
  filter = false,
  initialData,
}: ComboboxProps<T>) {
  const [isFetched, setIsFetched] = useState(false);
  const [selectedOption, setSelectedOption] = useState<T | null>(null);

  /**
   * Синхронизирует выбранную опцию с value, options и initialData
   */
  useEffect(() => {
    if (value != null) {
      const found = options.find((o) => o.id === value);
      if (found) {
        setSelectedOption(found);
      } else if (initialData) {
        setSelectedOption(initialData);
      } else {
        setSelectedOption(null);
      }
    } else {
      setSelectedOption(null);
    }
  }, [value, options, initialData]);

  /**
   * Обработчик открытия комбобокса.
   * При первом открытии вызывает fetchOptions.
   */
  const handleOpen = () => {
    if (!isFetched) {
      fetchOptions(filter);
      setIsFetched(true);
    }
  };

  /**
   * Обработчик изменения выбранной опции.
   * @param {SyntheticEvent<Element, Event>} _event - Событие изменения
   * @param {T | null} option - Новая выбранная опция
   */
  const handleChange = (
    _event: SyntheticEvent<Element, Event>,
    option: T | null
  ) => {
    setSelectedOption(option);
    if (option && option.id) {
      onChange(option.id);
    } else {
      onChange(null);
    }
  };

  return (
    <Autocomplete
      disablePortal
      options={options}
      getOptionLabel={getOptionLabel}
      onOpen={handleOpen}
      onChange={handleChange}
      value={selectedOption}
      sx={{ width }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={error}
          helperText={helperText}
        />
      )}
      loading={isLoading}
      disabled={disabled}
    />
  );
});

export default Combobox;
