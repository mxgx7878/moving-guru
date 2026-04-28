import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Check, X } from 'lucide-react';

import { Modal, Button, RHFInput, SelectField, Toggle, IconButton, ToggleChip, ChipGroup } from '../../components/ui';
import {
  JOB_TYPES, DURATION_OPTIONS, ROLE_TYPE_OPTIONS,
  QUALIFICATION_LEVELS, EMPTY_JOB_FORM,
} from '../../constants/jobConstants';
import { DISCIPLINE_CATEGORIES } from '../../data/disciplines';
import { jobSchema } from './schemas/entitySchema';

// Shared Job Listing create/edit form used by studios. Uses yup + RHF
// for validation; controlled via <Controller> for non-text inputs like
// the discipline chips and type picker.
export default function JobForm({
  initial = EMPTY_JOB_FORM,
  saving = false,
  onCancel,
  onSubmit,
}) {
  const isEditing = Boolean(initial?.title);
  const [disciplineSearch, setDisciplineSearch] = useState('');

  const {
    control, handleSubmit, watch, setValue, formState: { errors },
  } = useForm({
    resolver: yupResolver(jobSchema),
    defaultValues: { ...EMPTY_JOB_FORM, ...initial },
  });

  const types = watch('types') || [];
  const roleType = watch('role_type');
  const disciplines = watch('disciplines') || [];

  const toggleDiscipline = (d) => {
    const next = disciplines.includes(d)
      ? disciplines.filter((x) => x !== d)
      : [...disciplines, d];
    setValue('disciplines', next, { shouldValidate: true });
  };

  const submit = (values) => {
    onSubmit({ ...values, vacancies: Number(values.vacancies) });
  };

  const filteredDisciplines = DISCIPLINE_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter((d) => !disciplineSearch || d.toLowerCase().includes(disciplineSearch.toLowerCase())),
  })).filter((cat) => cat.items.length > 0);

  return (
    <Modal
      open
      size="lg"
      onClose={onCancel}
      title={isEditing ? 'Edit Listing' : 'Post a New Listing'}
      bodyClassName="p-6 space-y-5 max-h-[70vh] overflow-y-auto"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" icon={Check} loading={saving} onClick={handleSubmit(submit)}>
            {isEditing ? 'Save Changes' : 'Post Listing'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-5">
        {/* Listing type */}
        <div>
          <label className="block text-[10px] font-bold text-ink-soft tracking-widest uppercase mb-2">Listing Type</label>
            <p className="text-[10px] text-ink-soft mb-2">
    Pick one or more — you can offer the same role as both Direct Hire and a Swap.
  </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {JOB_TYPES.map((t) => {
              const Icon = t.icon;
              const active = types.includes(t.id);
              return (
                <Button
                  key={t.id}
                  type="button"
                  variant={active ? 'primary' : 'secondary'}
                  size="md"
                  fullWidth
                  icon={Icon}
                 onClick={() => {
                  const next = active
                    ? types.filter((x) => x !== t.id)
                    : [...types, t.id];
                  setValue('types', next, { shouldValidate: true });
                }}
                  style={active ? { borderColor: t.color, backgroundColor: t.color } : undefined}
                >
                  {t.label}
                </Button>
              );
            })}
          </div>
          {errors.type && <p className="text-red-500 text-xs mt-2">{errors.type.message}</p>}
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={types.includes('energy_exchange')}
          onChange={(e) => {
            const next = e.target.checked
              ? [...types.filter((t) => t !== 'energy_exchange'), 'energy_exchange']
              : types.filter((t) => t !== 'energy_exchange');
            setValue('types', next, { shouldValidate: true });
          }}
          className="mt-0.5 w-3.5 h-3.5 rounded border-[#E5E0D8] accent-[#6BE6A4] flex-shrink-0"
        />
        <span className="text-xs text-[#6B6B66] leading-snug">
          Also open to energy exchange options
          <span className="block text-[10px] text-[#9A9A94] mt-0.5">
            Optional — exchange opportunities for when other paths aren't viable.
          </span>
        </span>
      </label>

        <RHFInput control={control} errors={errors} name="title" label="Title"
          placeholder={types.includes('swap')
            ? 'e.g. Pilates Instructor Swap — Bali ↔ Sydney'
            : 'e.g. Yoga Instructor Needed — Bali Studio'}
          accent="#2DA4D6" />

        <RHFInput control={control} errors={errors} name="description" textarea rows={4}
          label="Role Description"
          placeholder="Describe the role, what you're looking for, and what the instructor can expect..."
          accent="#2DA4D6" />

        <div className="grid grid-cols-3 gap-4">
          <RHFInput control={control} errors={errors} name="vacancies" type="number" min={1} max={999}
            label="Vacancies" accent="#2DA4D6"
            hint="Listing closes automatically once all positions are filled." />

          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-ink-soft tracking-widest uppercase mb-2">Position Type</label>
            <ChipGroup
              options={ROLE_TYPE_OPTIONS}
              value={roleType}
              onChange={(v) => setValue('role_type', v, { shouldValidate: true })}
              tone="chartreuse"
            />
          </div>
        </div>

        <Controller
          control={control}
          name="qualification_level"
          render={({ field }) => (
            <SelectField
              label="Qualification Required"
              value={field.value}
              onChange={field.onChange}
              options={QUALIFICATION_LEVELS.map((q) => ({ value: q.id, label: q.label }))}
              placeholder="Select qualification"
              accent="#2DA4D6"
            />
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <RHFInput control={control} errors={errors} name="location" label="Location"
            placeholder="e.g. Bali, Indonesia" accent="#2DA4D6" />
          <RHFInput control={control} errors={errors} name="start_date" type="date"
            label="Start Date" accent="#2DA4D6" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="duration"
            render={({ field }) => (
              <SelectField
                label="Duration"
                value={field.value}
                onChange={field.onChange}
                options={DURATION_OPTIONS}
                placeholder="Select duration"
                accent="#2DA4D6"
              />
            )}
          />
          <RHFInput control={control} errors={errors} name="compensation" label="Compensation"
            placeholder="e.g. $800/week + accommodation" accent="#2DA4D6" />
        </div>

        <RHFInput control={control} errors={errors} name="requirements" textarea rows={3}
          label="Additional Requirements"
          placeholder="Min 2 years experience, certification required, English fluency..."
          accent="#2DA4D6" />

        <Controller
          control={control}
          name="is_active"
          render={({ field }) => (
            <Toggle label="Active/Inactive" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
          )}
        />

        <div>
          <label className="block text-[10px] font-bold text-ink-soft tracking-widest uppercase mb-2">Disciplines Needed</label>
          <input
            type="text"
            value={disciplineSearch}
            onChange={(e) => setDisciplineSearch(e.target.value)}
            placeholder="Search disciplines..."
            className="w-full bg-warm-bg border border-edge rounded-xl px-4 py-2.5 text-sm text-ink placeholder-ink-faint focus:outline-none focus:border-sky-mg transition-all mb-2"
          />

          {disciplines.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {disciplines.map((d) => (
                <ToggleChip
                  key={d}
                  active
                  tone="softBlue"
                  size="md"
                  onClick={() => toggleDiscipline(d)}
                  onRemove={() => toggleDiscipline(d)}
                >
                  {d}
                </ToggleChip>
              ))}
            </div>
          )}

          <div className="max-h-40 overflow-y-auto space-y-3 border border-edge rounded-xl p-3">
            {filteredDisciplines.map((cat) => (
              <div key={cat.label}>
                <p className="text-[9px] text-ink-soft tracking-widest uppercase font-semibold mb-1.5">{cat.label}</p>
                <ChipGroup
                  options={cat.items}
                  value={disciplines}
                  onChange={(next) => setValue('disciplines', next, { shouldValidate: true })}
                  multiple
                  tone="blue"
                  size="md"
                  className="gap-1.5"
                />
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
