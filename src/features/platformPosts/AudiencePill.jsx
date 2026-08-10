import { Chip } from '../../components/ui';
import { POST_AUDIENCE_OPTIONS } from '../../constants/postConstants';

export default function AudiencePill({ audience }) {
  const meta = POST_AUDIENCE_OPTIONS.find((o) => o.id === audience) || POST_AUDIENCE_OPTIONS[0];
  return <Chip icon={meta.icon} size="xs">{meta.label}</Chip>;
}
