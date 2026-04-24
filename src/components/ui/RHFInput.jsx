import { Controller } from 'react-hook-form';
import Input from './Input';

/**
 * RHFInput
 * ─────────────────────────────────────────────────────────────
 * Adapter that wires our existing <Input> into react-hook-form
 * without forcing consumers to hand-glue `register()` + error
 * lookups at every site.
 *
 * Usage:
 *   const { control, formState } = useForm({ resolver: yupResolver(schema) });
 *   <RHFInput control={control} errors={formState.errors} name="email" label="Email" />
 *
 * Props are pass-through to <Input>, so you can use `textarea`, `type`,
 * `placeholder`, `iconLeft`, `maxLength`, etc. The `errors` prop should
 * be `formState.errors`; this component resolves `errors[name]?.message`
 * for the right field. Alternatively you can pass `error` directly.
 */
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
