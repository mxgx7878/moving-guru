import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Megaphone } from 'lucide-react';
import { toast } from 'sonner';

import { fetchAnnouncements } from '../../store/actions/postAction';
import { clearPostError } from '../../store/slices/postSlice';
import { STATUS } from '../../constants/apiConstants';
import { ROLE_THEME } from '../../config/portalConfig';
import {
  PageHeader, Toolbar, TabBar, EmptyState,
} from '../../components/ui';
import { AnnouncementCard } from '../../features/platformPosts';

const TYPE_TABS = [
  { id: 'all',          label: 'All' },
  { id: 'announcement', label: 'Announcements' },
  { id: 'news',         label: 'News' },
  { id: 'event',        label: 'Events' },
];

export default function Announcements() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { announcements, announcementsStatus, error } = useSelector((s) => s.post);

  const theme = ROLE_THEME[user?.role] || ROLE_THEME.instructor;

  const [typeTab, setTypeTab] = useState('all');
  const [query,   setQuery]   = useState('');

  useEffect(() => {
    const params = {};
    if (typeTab !== 'all') params.type = typeTab;
    if (query.trim())      params.q    = query.trim();
    dispatch(fetchAnnouncements(params));
  }, [dispatch, typeTab, query]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearPostError()); }
  }, [error, dispatch]);

  const { pinned, others } = useMemo(() => {
    const p = [], o = [];
    for (const a of announcements) (a.is_pinned ? p : o).push(a);
    return { pinned: p, others: o };
  }, [announcements]);

  // Tint tabs with the viewer's role accent so portal brand stays consistent.
  const tabs = TYPE_TABS.map((t) => ({ ...t, color: theme.accent }));

  const isLoading = announcementsStatus === STATUS.LOADING && announcements.length === 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <PageHeader
        icon={Megaphone}
        iconBg={`${theme.accent}15`}
        iconColor={theme.accent}
        eyebrow={theme.label}
        eyebrowColor={theme.accent}
        title="Announcements"
        description="Platform updates, events and news from the Moving Guru team."
      />

      <TabBar
        tabs={tabs}
        activeId={typeTab}
        onChange={setTypeTab}
      />

      <Toolbar
        search={{
          value: query,
          onChange: setQuery,
          placeholder: 'Search announcements...',
        }}
      />

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] flex items-center justify-center py-16">
          <div
            className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: theme.accent, borderTopColor: 'transparent' }}
          />
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E0D8]">
          <EmptyState
            icon={Megaphone}
            title="Nothing here yet"
            message="New announcements will appear here."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {pinned.length > 0 && (
            <>
              <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase px-2">
                Pinned
              </p>
              {pinned.map((p) => <AnnouncementCard key={p.id} post={p} pinned />)}
              {others.length > 0 && (
                <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase px-2 pt-2">
                  Latest
                </p>
              )}
            </>
          )}
          {others.map((p) => <AnnouncementCard key={p.id} post={p} />)}
        </div>
      )}
    </div>
  );
}
