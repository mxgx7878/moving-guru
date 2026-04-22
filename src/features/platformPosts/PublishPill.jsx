import { StatusPill } from '../../components/ui';
import { PUBLISH_STATUS_CONFIG } from '../../constants/postConstants';

// Dedicated wrapper around StatusPill so callers just pass a post and the
// Published/Draft vocabulary stays owned by this module.
export default function PublishPill({ status }) {
  const key = status === 'published' ? 'published' : 'draft';
  return <StatusPill status={key} config={PUBLISH_STATUS_CONFIG} size="xs" />;
}
