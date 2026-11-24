import { Button } from '../ui';

export default function AccessCheckError({ onRetry }) {
  return <div role="alert" className="rounded-2xl border border-edge bg-white p-6 text-ink space-y-3">
    <p>We couldn't check your subscription. Please try again.</p>
    <Button onClick={onRetry}>Try again</Button>
  </div>;
}
