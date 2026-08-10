import { StatusPill } from '../../components/ui';
import { PUBLISH_STATUS_CONFIG } from '../../constants/postConstants';

export default function PublishPill({ status }) {
  const key = status === 'published' ? 'published' : 'draft';
  return <StatusPill status={key} config={PUBLISH_STATUS_CONFIG} size="xs" />;
}
