import Spinner from './Spinner';
import { useSelector } from 'react-redux';
import { STATUS } from '../../constants/apiConstants';

export default function FullPageLoader() {
  const { status } = useSelector((state) => state.auth);

  if (status !== STATUS.LOADING) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 shadow-xl flex flex-col items-center gap-3">
        <Spinner />
        <p className="text-[#3E3D38] text-sm font-medium">Please wait...</p>
      </div>
    </div>
  );
}
