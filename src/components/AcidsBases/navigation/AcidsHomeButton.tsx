import { House } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTapAction } from '../hooks/useTapAction';

type AcidsHomeButtonProps = {
   targetPath?: string;
};

export const AcidsHomeButton = ({ targetPath = '/acids/chapters' }: AcidsHomeButtonProps) => {
   const navigate = useNavigate();
   const tap = useTapAction(() => navigate(targetPath));

   return (
      <button
         type="button"
         onClick={tap.onClick}
         onTouchEnd={tap.onTouchEnd}
         aria-label="Open chapters"
         className="w-10 h-10 rounded-lg border border-gray-300 bg-white flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
      >
         <House className="w-5 h-5 text-gray-900" />
      </button>
   );
};

export default AcidsHomeButton;
