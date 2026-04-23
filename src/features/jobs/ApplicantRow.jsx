import { Mail } from 'lucide-react';
import { Avatar } from '../../components/ui';

const APPLICATION_STATUS = {
  pending:   { label: 'Pending',   cls: 'bg-[#2DA4D6]/10 text-[#2DA4D6]' },
  viewed:    { label: 'Viewed',    cls: 'bg-[#FBF8E4] text-[#6B6B66]'    },
  accepted:  { label: 'Hired',     cls: 'bg-emerald-50 text-emerald-600' },
  rejected:  { label: 'Declined',  cls: 'bg-red-50 text-red-500'         },
  withdrawn: { label: 'Withdrawn', cls: 'bg-gray-100 text-gray-500'      },
};

// Row shown in the Applicants list inside JobDetailDrawer.
export default function ApplicantRow({ app }) {
  const user = app.instructor || app.user || {};
  const name = user.name || 'Unknown';
  const cfg  = APPLICATION_STATUS[app.status] || {
    label: app.status || 'Pending',
    cls:   'bg-gray-100 text-gray-500',
  };

  return (
    <div className="flex items-center justify-between gap-3 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl p-3">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={name} />
        <div className="min-w-0">
          <p className="font-semibold text-[#3E3D38] text-xs truncate">{name}</p>
          {user.email && (
            <p className="text-[10px] text-[#9A9A94] flex items-center gap-1 truncate">
              <Mail size={9} /> {user.email}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.cls}`}>
          {cfg.label}
        </span>
        {app.created_at && (
          <span className="text-[10px] text-[#9A9A94] hidden sm:inline">
            {new Date(app.created_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
