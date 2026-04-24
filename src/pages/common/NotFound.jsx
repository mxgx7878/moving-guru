import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Compass } from 'lucide-react';
import { ROLE_THEME } from '../../config/portalConfig';
import { Button } from '../../components/ui';

// Generic 404. Surfaces a reasonable "home" based on the role of the
// current user (if signed in) — falls back to /login for anonymous.
export default function NotFound() {
  const navigate = useNavigate();
  const { user, token } = useSelector((s) => s.auth);

  const homePath = user?.role
    ? (ROLE_THEME[user.role]?.defaultPath || '/')
    : (token ? '/' : '/login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-6 font-dm">
      <div className="max-w-md w-full bg-white rounded-2xl border border-edge shadow-sm p-8 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-coral-soft flex items-center justify-center mb-4">
          <Compass size={26} className="text-coral" />
        </div>
        <p className="font-unbounded text-xs tracking-widest uppercase text-coral mb-2">
          Error 404
        </p>
        <h1 className="font-unbounded text-2xl font-black text-ink mb-2">
          Page not found
        </h1>
        <p className="text-ink-muted text-sm mb-6">
          The page you were looking for has moved, been renamed, or never existed.
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Button variant="secondary" size="md" icon={ArrowLeft} onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Link to={homePath}>
            <Button variant="primary" size="md">Take me home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
