import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMenuContext } from '@/context/MenuContext';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { setSidebarOpen } = useMenuContext();

  const menuItems = [
    {
      href: '/dashboard',
      title: 'Dashboard',
    },
    {
      href: '/dashboard/users',
      title: 'Users',
    },
    {
      href: '/dashboard/auctions',
      title: 'Auctions',
    },
  ];

  return (
    <div className="flex flex-col h-3/4 bg-white  w-60 rounded-lg">
      <div className="flex items-center justify-center h-17 ">
        <span className="text-lg font-bold">Admin Panel</span>
      </div>
      <nav className="flex-grow">
        <ul className="py-4">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${pathname === item.href ? 'bg-gray-100 border-l-4 border-blue-500 border-r-4 border-blue-500' : ''}`}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className=" p-4">
        <Link
          href="/"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center text-gray-700 hover:text-gray-900 text-red-500"
        >
          <span>Back to Site</span>
        </Link>
      </div>
    </div>
  );
}
