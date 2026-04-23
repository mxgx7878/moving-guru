import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { SelectField } from '../../components/ui';
import { Modal, Button, Input, Toggle } from '../../components/ui';
import {
  JOB_TYPES, DURATION_OPTIONS, ROLE_TYPE_OPTIONS,
  QUALIFICATION_LEVELS, EMPTY_JOB_FORM,
} from '../../constants/jobConstants';
import { DISCIPLINE_CATEGORIES } from '../../data/disciplines';
import { validateJobForm } from '../../utils/validators';

// Shared Job Listing create/edit form used by studios. Extracted from the
// JobListings page so other surfaces (e.g. studio onboarding) can reuse it.
export default function JobForm({
  initial = EMPTY_JOB_FORM,
  saving = false,
  onCancel,
  onSubmit,
}) {
  const [form, setForm] = useState({ ...EMPTY_JOB_FORM, ...initial });
  const [errors, setErrors] = useState({});
  const [disciplineSearch, setDisciplineSearch] = useState('');
  const isEditing = Boolean(initial?.title);

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: '' }));
  };

  const toggleDiscipline = (d) => setForm((f) => ({
    ...f,
    disciplines: f.disciplines.includes(d)
      ? f.disciplines.filter((x) => x !== d)
      : [...f.disciplines, d],
  }));

  const handleSave = () => {
    const errs = validateJobForm(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({ ...form, vacancies: Number(form.vacancies) });
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
          <Button variant="primary" icon={Check} loading={saving} onClick={handleSave}>
            {isEditing ? 'Save Changes' : 'Post Listing'}
          </Button>
        </>
      }
    >
      {/* Listing type */}
      <div>
        <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Listing Type</label>
        <div className="grid grid-cols-3 gap-3">
          {JOB_TYPES.map((t) => (
            <button key={t.id} type="button"
              onClick={() => update('type', t.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all
                ${form.type === t.id ? 'text-white' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
              style={form.type === t.id ? { borderColor: t.color, backgroundColor: t.color } : undefined}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Title"
        value={form.title}
        onChange={(e) => update('title', e.target.value)}
        placeholder={form.type === 'swap'
          ? 'e.g. Pilates Instructor Swap — Bali ↔ Sydney'
          : 'e.g. Yoga Instructor Needed — Bali Studio'}
        accent="#2DA4D6"
        error={errors.title}
      />

      <Input
        textarea
        label="Role Description"
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
        rows={4}
        placeholder="Describe the role, what you're looking for, and what the instructor can expect..."
        accent="#2DA4D6"
        error={errors.description}
      />

      <div className="grid grid-cols-3 gap-4">
        <Input
          type="number"
          label="Vacancies"
          min={1}
          max={999}
          value={form.vacancies}
          onChange={(e) => update('vacancies', e.target.value)}
          accent="#2DA4D6"
          error={errors.vacancies}
          hint="Listing closes automatically once all positions are filled."
        />

        <div className="col-span-2">
          <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Position Type</label>
          <div className="flex flex-wrap gap-2">
            {ROLE_TYPE_OPTIONS.map((o) => (
              <button key={o.id} type="button"
                onClick={() => update('role_type', o.id)}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-all
                  ${form.role_type === o.id
                    ? 'bg-[#CCFF00] text-[#3E3D38] border-[#CCFF00]'
                    : 'bg-white border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <SelectField
        label="Qualification Required"
        value={form.qualification_level}
        onChange={(v) => update('qualification_level', v)}
        options={QUALIFICATION_LEVELS.map((q) => ({ value: q.id, label: q.label }))}
        placeholder="Select qualification"
        accent="#2DA4D6"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Location"
          value={form.location}
          onChange={(e) => update('location', e.target.value)}
          placeholder="e.g. Bali, Indonesia"
          accent="#2DA4D6"
        />
        <Input
          type="date"
          label="Start Date"
          value={form.start_date}
          onChange={(e) => update('start_date', e.target.value)}
          accent="#2DA4D6"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Duration"
          value={form.duration}
          onChange={(v) => update('duration', v)}
          options={DURATION_OPTIONS}
          placeholder="Select duration"
          accent="#2DA4D6"
        />
        <Input
          label="Compensation"
          value={form.compensation}
          onChange={(e) => update('compensation', e.target.value)}
          placeholder="e.g. $800/week + accommodation"
          accent="#2DA4D6"
        />
      </div>

      <Input
        textarea
        label="Additional Requirements"
        value={form.requirements}
        onChange={(e) => update('requirements', e.target.value)}
        rows={3}
        placeholder="Min 2 years experience, certification required, English fluency..."
        accent="#2DA4D6"
      />

      <Toggle label="Active/Inactive" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} />

      <div>
        <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Disciplines Needed</label>
        <input
          type="text"
          value={disciplineSearch}
          onChange={(e) => setDisciplineSearch(e.target.value)}
          placeholder="Search disciplines..."
          className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-2.5 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#2DA4D6] transition-all mb-2"
        />

        {form.disciplines.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {form.disciplines.map((d) => (
              <span key={d} className="flex items-center gap-1 px-2.5 py-1 bg-[#2DA4D6]/10 text-[#2DA4D6] rounded-full text-xs font-medium">
                {d}
                <button onClick={() => toggleDiscipline(d)} className="hover:text-red-500 transition-colors">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="max-h-40 overflow-y-auto space-y-3 border border-[#E5E0D8] rounded-xl p-3">
          {filteredDisciplines.map((cat) => (
            <div key={cat.label}>
              <p className="text-[9px] text-[#9A9A94] tracking-widest uppercase font-semibold mb-1.5">{cat.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map((d) => (
                  <button key={d} type="button" onClick={() => toggleDiscipline(d)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                      ${form.disciplines.includes(d)
                        ? 'bg-[#2DA4D6] text-white border-[#2DA4D6]'
                        : 'bg-white border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6]'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
