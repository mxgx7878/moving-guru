import { Controller } from 'react-hook-form';
import Input from './Input';

export default function RHFInput({
  control,
  name,
  errors,
  defaultValue = '',
  rules,
  ...inputProps
}) {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      render={({ field }) => (
        <Input
          {...inputProps}
          name={field.name}
          value={field.value ?? ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          error={errors?.[name]?.message}
        />
      )}
    />
  );
}
