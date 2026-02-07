import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function Navigation({ isOpen = true, onClose }: NavigationProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'DASHBOARD' },
    { path: '/employees', label: 'EMPLOYEES' },
    { path: '/attendance', label: 'ATTENDANCE' },
    { path: '/attendance/bulk', label: 'BULK ATTENDANCE' },
    { path: '/attendance/reports', label: 'REPORTS' },
  ];

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <nav className={`
      fixed md:relative top-0 left-0 h-full z-50
      w-64 border-r border-border bg-surface
      flex flex-col
      transition-transform duration-150 ease-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      {/* App Title */}
      <div className="p-4 mb-4 shrink-0">
        <h1 className="text-hierarchy-1">HRMS LITE</h1>
      </div>

      {/* Navigation Links - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`block px-4 py-2 border transition-all duration-150 ${
                    isActive
                      ? 'border-systemBlue bg-systemBlue text-background'
                      : 'border-border text-text hover:border-text hover:bg-text hover:text-[#000000]!'
                  }`}
                >
                  [ {item.label} ]
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
