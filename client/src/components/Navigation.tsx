import { useLocation } from "wouter";
import { Home, QrCode, Gift, User } from "lucide-react";
import { Link } from "wouter";

export default function Navigation() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t-2 border-orange-500">
      <div className="flex">
        <Link href="/" className="flex-1">
          <button className="w-full py-4 px-3 text-center">
            <Home className={`w-5 h-5 mx-auto mb-1 ${
              isActive('/') ? 'text-orange-500' : 'text-slate-400'
            }`} />
            <span className={`text-xs font-medium ${
              isActive('/') ? 'text-orange-500' : 'text-slate-400'
            }`}>
              Home
            </span>
          </button>
        </Link>
        
        <Link href="/scan" className="flex-1">
          <button className="w-full py-4 px-3 text-center">
            <QrCode className={`w-5 h-5 mx-auto mb-1 ${
              isActive('/scan') ? 'text-orange-500' : 'text-slate-400'
            }`} />
            <span className={`text-xs font-medium ${
              isActive('/scan') ? 'text-orange-500' : 'text-slate-400'
            }`}>
              Scan
            </span>
          </button>
        </Link>
        
        <Link href="/rewards" className="flex-1">
          <button className="w-full py-4 px-3 text-center">
            <Gift className={`w-5 h-5 mx-auto mb-1 ${
              isActive('/rewards') ? 'text-orange-500' : 'text-slate-400'
            }`} />
            <span className={`text-xs font-medium ${
              isActive('/rewards') ? 'text-orange-500' : 'text-slate-400'
            }`}>
              Rewards
            </span>
          </button>
        </Link>
        
        <Link href="/profile" className="flex-1">
          <button className="w-full py-4 px-3 text-center">
            <User className={`w-5 h-5 mx-auto mb-1 ${
              isActive('/profile') ? 'text-orange-500' : 'text-slate-400'
            }`} />
            <span className={`text-xs font-medium ${
              isActive('/profile') ? 'text-orange-500' : 'text-slate-400'
            }`}>
              Profile
            </span>
          </button>
        </Link>
      </div>
    </nav>
  );
}
