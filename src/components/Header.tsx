import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FiBell, FiMenu, FiX, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { supabase } from '@/supabase';

type UserInfo = {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
};

type NotificationInfo = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

type HeaderProps = {
  user: UserInfo;
  notifications: NotificationInfo[];
};

const Header: FC<HeaderProps> = ({ user, notifications }) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const menuItems = [
    { label: 'プロフィール', href: '/profiles' },
    { label: 'スキル', href: '/skills' },
    { label: '課題', href: '/challenges' },
    { label: 'アイデア', href: '/ideas' },
    { label: 'マッチング', href: '/matching' },
    { label: 'メッセージ', href: '/messages' },
    { label: '分析', href: '/analytics' },
  ];

  return (
    <header className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              className="sm:hidden p-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            
            <Link href="/" className="flex items-center">
              <Image
                src="https://placehold.co/40x40"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="ml-2 text-xl font-bold text-gray-800">Skill Link</span>
            </Link>

            <nav className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    router.pathname.startsWith(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                className="p-2 rounded-full hover:bg-gray-100 relative"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              >
                <FiBell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-2 hover:bg-gray-50 ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <Image
                  src={user.avatar_url || "https://placehold.co/32x32"}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user.name}
                </span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    href={`/profiles/${user.id}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FiUser className="mr-2" /> プロフィール
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FiSettings className="mr-2" /> 設定
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FiLogOut className="mr-2" /> ログアウト
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  router.pathname.startsWith(item.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;