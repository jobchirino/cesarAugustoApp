'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '@/lib/api';

interface MenuItem {
  name: string;
  icon: string;
  href?: string;
  submenu?: { name: string; href: string }[];
  requiresSuperAdmin?: boolean;
}

const menuItems: MenuItem[] = [
  { name: 'Inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', href: '/dashboard' },
  { 
    name: 'Estudiantes', 
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    submenu: [
      { name: 'Lista', href: '/dashboard/estudiantes' },
      { name: 'Agregar', href: '/dashboard/estudiantes/agregar' },
    ]
  },
  { name: 'Grados', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', href: '/dashboard/grados' },
  { name: 'Historial', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', href: '/dashboard/historial' },
  { name: 'Gestionar Usuarios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', href: '/dashboard/usuarios', requiresSuperAdmin: true },
];

interface SidebarProps {
  activeItem?: string;
}

export default function Sidebar({ activeItem = 'Inicio' }: SidebarProps) {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>('Estudiantes');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setIsSuperAdmin(data.id === 1);
        })
        .catch(() => setIsSuperAdmin(false));
    }
  }, []);

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('token');
    router.push('/login');
  };

  const isActive = (item: MenuItem) => {
    if (item.submenu) {
      return item.submenu.some(sub => activeItem === sub.name);
    }
    return activeItem === item.name;
  };

  return (
    <aside className="w-56 bg-blue-900 flex flex-col">
      <div className="p-4 flex items-center gap-2 border-b border-blue-800">
        <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <span className="text-white font-semibold text-sm">Cesar Augusto</span>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (item.requiresSuperAdmin && !isSuperAdmin) return null;
          
          return (
          <div key={item.name}>
            {item.submenu ? (
              <>
                <button
                  onClick={() => toggleSubmenu(item.name)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                    isActive(item)
                      ? 'bg-blue-800 text-white'
                      : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span>{item.name}</span>
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-transform ${openSubmenu === item.name ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openSubmenu === item.name && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.submenu.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={`block px-3 py-2 rounded-lg text-sm transition ${
                          activeItem === sub.name
                            ? 'bg-blue-700 text-white'
                            : 'text-blue-300 hover:bg-blue-800 hover:text-white'
                        }`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href || '/dashboard'}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  activeItem === item.name
                    ? 'bg-blue-800 text-white'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span>{item.name}</span>
              </Link>
            )}
          </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-blue-800">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-blue-200 hover:bg-blue-800 hover:text-white rounded-lg text-sm transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Salir</span>
        </button>
      </div>
    </aside>
  );
}
