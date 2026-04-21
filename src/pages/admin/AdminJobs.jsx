import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Briefcase, Search, Filter, X, Loader2, MapPin, Calendar, Users,
  Eye, EyeOff, Trash2, UserCheck, Lock, ChevronDown,
} from 'lucide-react';

import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import { Button } from '../../components/ui';
import { ConfirmModal } from '../../features/modals';
import { JOB_TYPES } from '../../constants/jobConstants';

// Admin job management — read + moderate every listing across the platform.
// Admins can deactivate spam/abusive listings, reactivate mistakes, or
// delete outright. All data comes from real API endpoints; no dummy fallback.
export default function AdminJobs() {
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [typeTab, setTypeTab] = useState('all');
  const [statusTab, setStatusTab] = useState('all');
  const [query, setQuery]     = useState('');
  const [mutatingId, setMutatingId] = useState(null);
  const [deletingTarget, setDeletingTarget] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    axiosInstance.get(API_ENDPOINTS.ADMIN_JOBS)
      .then(({ data }) => setJobs(data?.data?.jobs || data?.data || []))
      .catch((e) => setError(e?.response?.data?.message || 'Failed to load jobs.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return jobs.filter((j) => {
      const matchType = typeTab === 'all' || j.type === typeTab;
      const matchStatus =
        statusTab === 'all' ||
        (statusTab === 'active' && j.is_active !== false) ||
        (statusTab === 'inactive' && j.is_active === false) ||
        (statusTab === 'full' && (j.positions_filled || 0) >= (j.vacancies || 1));
      const matchQ = !q ||
        j.title?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        j.studio?.name?.toLowerCase().includes(q) ||
        j.studio?.studio_name?.toLowerCase().includes(q);
      return matchType && matchStatus && matchQ;
    });
  }, [jobs, typeTab, statusTab, query]);

  const counts = useMemo(() => ({
    all:      jobs.length,
    active:   jobs.filter((j) => j.is_active !== false).length,
    inactive: jobs.filter((j) => j.is_active === false).length,
    full:     jobs.filter((j) => (j.positions_filled || 0) >= (j.vacancies || 1)).length,
  }), [jobs]);

  const handleDeactivate = async (job) => {
    setMutatingId(job.id);
    try {
      await axiosInstance.patch(`${API_ENDPOINTS.ADMIN_JOB_DEACTIVATE}/${job.id}/deactivate`);
      setJobs((list) => list.map((j) => j.id === job.id ? { ...j, is_active: false } : j));
      toast.success('Listing deactivated.');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to deactivate listing.');
    } finally {
      setMutatingId(null);
    }
  };

  const handleActivate = async (job) => {
    setMutatingId(job.id);
    try {
      await axiosInstance.patch(`${API_ENDPOINTS.ADMIN_JOB_ACTIVATE}/${job.id}/activate`);
      setJobs((list) => list.map((j) => j.id === job.id ? { ...j, is_active: true } : j));
      toast.success('Listing activated.');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to activate listing.');
    } finally {
      setMutatingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTarget) return;
    const target = deletingTarget;
    setDeletingTarget(null);
    setMutatingId(target.id);
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.ADMIN_JOB_DELETE}/${target.id}`);
      setJobs((list) => list.filter((j) => j.id !== target.id));
      toast.success('Listing deleted.');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to delete listing.');
    } finally {
      setMutatingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#E89560]/10 rounded-2xl flex items-center justify-center">
            <Briefcase size={22} className="text-[#E89560]" />
          </div>
          <div>
            <p className="text-[#E89560] text-xs font-semibold tracking-widest uppercase mb-1">
              Admin &nbsp;/&nbsp; Job Management
            </p>
            <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Platform Job Listings</h1>
            <p className="text-[#6B6B66] text-xs mt-0.5">
              Moderate listings posted by studios. Deactivate spammy or abusive postings, or delete them entirely.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs: type */}
      <div className="flex flex-wrap gap-2">
        <TabButton active={typeTab === 'all'} onClick={() => setTypeTab('all')} label={`All (${counts.all})`} color="#3E3D38" />
        {JOB_TYPES.map((t) => {
          const c = jobs.filter((j) => j.type === t.id).length;
          return (
            <TabButton
              key={t.id}
              active={typeTab === t.id}
              onClick={() => setTypeTab(t.id)}
              label={`${t.label} (${c})`}
              icon={t.icon}
              color={t.color}
            />
          );
        })}
      </div>

      {/* Search + status */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 flex gap-3 flex-wrap">
        <div className="flex-1 flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-2.5 min-w-[220px]">
          <Search size={16} className="text-[#9A9A94]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, location, studio name..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4]" />
          {query && <button onClick={() => setQuery('')}><X size={14} className="text-[#9A9A94]" /></button>}
        </div>
        <div className="flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2">
          <Filter size={14} className="text-[#9A9A94]" />
          <select value={statusTab} onChange={(e) => setStatusTab(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-[#3E3D38] pr-2">
            <option value="all">All statuses ({counts.all})</option>
            <option value="active">Active ({counts.active})</option>
            <option value="inactive">Inactive ({counts.inactive})</option>
            <option value="full">Closed / Full ({counts.full})</option>
          </select>
          <ChevronDown size={14} className="text-[#9A9A94]" />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] flex items-center justify-center py-16">
          <Loader2 size={26} className="animate-spin text-[#E89560]" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-10 text-center">
          <p className="text-[#3E3D38] font-semibold">{error}</p>
          <button onClick={load} className="mt-3 text-sm text-[#2DA4D6] hover:underline">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] py-16 text-center">
          <Briefcase size={36} className="mx-auto text-[#C4BCB4] mb-3" />
          <p className="font-['Unbounded'] text-sm font-bold text-[#3E3D38]">No listings found</p>
          <p className="text-[#9A9A94] text-xs mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              busy={mutatingId === job.id}
              onDeactivate={() => handleDeactivate(job)}
              onActivate={() => handleActivate(job)}
              onDelete={() => setDeletingTarget(job)}
            />
          ))}
        </div>
      )}

      {deletingTarget && (
        <ConfirmModal
          title="Delete listing?"
          message={`Delete "${deletingTarget.title}"? This permanently removes it and any applicant history.`}
          confirmLabel="Delete"
          onCancel={() => setDeletingTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, label, icon: Icon, color = '#3E3D38' }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all
        ${active ? 'text-white border-transparent' : 'bg-white border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
      style={active ? { backgroundColor: color } : {}}>
      {Icon && <Icon size={13} />} {label}
    </button>
  );
}

function JobRow({ job, busy, onDeactivate, onActivate, onDelete }) {
  const typeInfo = JOB_TYPES.find((t) => t.id === job.type) || JOB_TYPES[0];
  const TypeIcon = typeInfo.icon;
  const vacancies = job.vacancies || 1;
  const filled = job.positions_filled || 0;
  const isFull = filled >= vacancies;
  const isActive = job.is_active !== false;

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all
      ${isActive ? 'border-[#E5E0D8]' : 'border-[#E5E0D8] opacity-80'}`}>
      {isFull && (
        <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-2 flex items-center gap-2 text-xs text-emerald-700">
          <Lock size={12} />
          <span className="font-semibold">Closed — all {vacancies} vacancy{vacancies !== 1 ? 'ies' : ''} filled.</span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: typeInfo.color }}>
                <TypeIcon size={10} /> {typeInfo.label}
              </span>
              {!isActive && !isFull && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBF8E4] text-[#9A9A94]">
                  Inactive
                </span>
              )}
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
                ${isFull ? 'bg-emerald-50 text-emerald-600' : 'bg-[#2DA4D6]/10 text-[#2DA4D6]'}`}>
                <UserCheck size={10} />
                {filled} of {vacancies} filled
              </span>
            </div>

            <h3 className="font-['Unbounded'] text-base font-black text-[#3E3D38] mb-1 truncate">
              {job.title}
            </h3>
            <p className="text-[11px] text-[#9A9A94] mb-2">
              Posted by <span className="font-semibold text-[#3E3D38]">
                {job.studio?.studio_name || job.studio?.name || 'Unknown studio'}
              </span>
              {job.created_at && (
                <> · {new Date(job.created_at).toLocaleDateString()}</>
              )}
            </p>
            <p className="text-[#6B6B66] text-sm line-clamp-2">{job.description}</p>

            <div className="flex flex-wrap items-center gap-4 mt-3">
              {job.location && (
                <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
                  <MapPin size={12} className="text-[#9A9A94]" /> {job.location}
                </div>
              )}
              {job.start_date && (
                <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
                  <Calendar size={12} className="text-[#9A9A94]" /> {job.start_date}
                </div>
              )}
              {(job.applicants_count || 0) > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-[#9A9A94]">
                  <Users size={12} /> {job.applicants_count} applicants
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            {isActive ? (
              <Button variant="secondary" size="xs" icon={EyeOff} loading={busy} onClick={onDeactivate}>
                Deactivate
              </Button>
            ) : (
              <Button variant="secondary" size="xs" icon={Eye} loading={busy} onClick={onActivate}>
                Activate
              </Button>
            )}
            <Button variant="outlineDanger" size="xs" icon={Trash2} loading={busy} onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
