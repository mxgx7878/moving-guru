import { Chip } from '../../components/ui';
import { POST_AUDIENCE_OPTIONS } from '../../constants/postConstants';

// Small neutral chip showing who the post is broadcast to.
export default function AudiencePill({ audience }) {
  const meta = POST_AUDIENCE_OPTIONS.find((o) => o.id === audience) || POST_AUDIENCE_OPTIONS[0];
  return <Chip icon={meta.icon} size="xs">{meta.label}</Chip>;
}
