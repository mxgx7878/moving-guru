import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Check, X } from 'lucide-react';

import { Modal, Button, RHFInput, SelectField, Toggle } from '../../components/ui';
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

  const type = watch('type');
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
          <div className="grid grid-cols-3 gap-3">
            {JOB_TYPES.map((t) => {
              const Icon = t.icon;
              const active = type === t.id;
              return (
                <Button
                  key={t.id}
                  type="button"
                  variant={active ? 'primary' : 'secondary'}
                  size="md"
                  fullWidth
                  icon={Icon}
                  onClick={() => setValue('type', t.id, { shouldValidate: true })}
                  style={active ? { borderColor: t.color, backgroundColor: t.color } : undefined}
                >
                  {t.label}
                </Button>
              );
            })}
          </div>
          {errors.type && <p className="text-red-500 text-xs mt-2">{errors.type.message}</p>}
        </div>

        <RHFInput control={control} errors={errors} name="title" label="Title"
          placeholder={type === 'swap'
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
            <div className="flex flex-wrap gap-2">
              {ROLE_TYPE_OPTIONS.map((o) => {
                const active = roleType === o.id;
                return (
                  <button key={o.id} type="button"
                    onClick={() => setValue('role_type', o.id, { shouldValidate: true })}
                    className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-all
                      ${active
                        ? 'bg-chartreuse text-ink border-chartreuse'
                        : 'bg-white border-edge text-ink-muted hover:border-ink'}`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
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
                <span key={d} className="flex items-center gap-1 px-2.5 py-1 bg-sky-soft text-sky-mg rounded-full text-xs font-medium">
                  {d}
                  <button type="button" onClick={() => toggleDiscipline(d)} className="hover:text-red-500 transition-colors">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="max-h-40 overflow-y-auto space-y-3 border border-edge rounded-xl p-3">
            {filteredDisciplines.map((cat) => (
              <div key={cat.label}>
                <p className="text-[9px] text-ink-soft tracking-widest uppercase font-semibold mb-1.5">{cat.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map((d) => (
                    <button key={d} type="button" onClick={() => toggleDiscipline(d)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                        ${disciplines.includes(d)
                          ? 'bg-sky-mg text-white border-sky-mg'
                          : 'bg-white border-edge text-ink-muted hover:border-sky-mg'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
