import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaUserCircle, FaTools, FaLightbulb, FaTasks, FaHandshake, FaComments, FaChartBar, FaCog } from 'react-icons/fa';
import { createClient } from '@/supabase';

type MenuItem = {
  label: string;
  path: string;
  icon: JSX.Element;
  roles: string[];
  subItems?: MenuItem[];
};

const menuItems: MenuItem[] = [
  {
    label: 'プロフィール管理',
    path: '/profiles',
    icon: <FaUserCircle className="w-5 h-5" />,
    roles: ['all'],
    subItems: [
      { label: 'プロフィール一覧', path: '/profiles', icon: <FaUserCircle />, roles: ['all'] },
      { label: '経歴情報管理', path: '/profiles/career', icon: <FaUserCircle />, roles: ['all'] }
    ]
  },
  {
    label: 'スキル管理',
    path: '/skills',
    icon: <FaTools className="w-5 h-5" />,
    roles: ['all'],
    subItems: [
      { label: 'スキル一覧', path: '/skills', icon: <FaTools />, roles: ['all'] },
      { label: 'スキル登録', path: '/skills/register', icon: <FaTools />, roles: ['all'] },
      { label: 'スキル検索', path: '/skills/search', icon: <FaTools />, roles: ['all'] }
    ]
  },
  {
    label: '課題・アイデア',
    path: '/challenges',
    icon: <FaLightbulb className="w-5 h-5" />,
    roles: ['all'],
    subItems: [
      { label: '課題一覧', path: '/challenges', icon: <FaTasks />, roles: ['all'] },
      { label: 'アイデア一覧', path: '/ideas', icon: <FaLightbulb />, roles: ['all'] }
    ]
  },
  {
    label: 'マッチング',
    path: '/matching',
    icon: <FaHandshake className="w-5 h-5" />,
    roles: ['all'],
    subItems: [
      { label: 'マッチング検索', path: '/matching/search', icon: <FaHandshake />, roles: ['all'] },
      { label: 'チーム編成支援', path: '/matching/team-building', icon: <FaHandshake />, roles: ['manager'] }
    ]
  },
  {
    label: 'コミュニケーション',
    path: '/messages',
    icon: <FaComments className="w-5 h-5" />,
    roles: ['all'],
    subItems: [
      { label: 'メッセージ', path: '/messages', icon: <FaComments />, roles: ['all'] },
      { label: 'グループチャット', path: '/messages/group', icon: <FaComments />, roles: ['all'] }
    ]
  },
  {
    label: 'データ分析',
    path: '/analytics',
    icon: <FaChartBar className="w-5 h-5" />,
    roles: ['hr', 'manager'],
    subItems: [
      { label: 'スキルマップ分析', path: '/analytics/skill-map', icon: <FaChartBar />, roles: ['hr'] },
      { label: 'シナジー効果分析', path: '/analytics/synergy', icon: <FaChartBar />, roles: ['manager'] },
      { label: '人材活用レポート', path: '/analytics/talent-report', icon: <FaChartBar />, roles: ['hr'] },
      { label: 'スキルギャップ分析', path: '/analytics/skill-gap', icon: <FaChartBar />, roles: ['hr'] }
    ]
  },
  {
    label: 'システム管理',
    path: '/admin',
    icon: <FaCog className="w-5 h-5" />,
    roles: ['admin'],
    subItems: [
      { label: 'アクセス権限設定', path: '/admin/access-control', icon: <FaCog />, roles: ['admin'] }
    ]
  }
];

type SidebarProps = {
  userRole: string;
};

const Sidebar = ({ userRole }: SidebarProps) => {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleExpand = (path: string) => {
    setExpandedItems(prev =>
      prev.includes(path)
        ? prev.filter(item => item !== path)
        : [...prev, path]
    );
  };

  const hasAccess = (roles: string[]) => {
    return roles.includes('all') || roles.includes(userRole);
  };

  const isActiveLink = (path: string) => {
    return router.pathname === path;
  };

  return (
    <div className={`bg-white shadow-lg h-full min-h-screen transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="mt-4">
        {menuItems.map((item) => (
          hasAccess(item.roles) && (
            <div key={item.path}>
              <div
                onClick={() => toggleExpand(item.path)}
                className={`
                  flex items-center px-4 py-3 cursor-pointer
                  ${isActiveLink(item.path) ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}
                `}
              >
                <div className="mr-3">{item.icon}</div>
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.subItems && (
                      <span className={`transform transition-transform ${expandedItems.includes(item.path) ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    )}
                  </>
                )}
              </div>
              
              {!isCollapsed && item.subItems && expandedItems.includes(item.path) && (
                <div className="ml-4 pl-4 border-l border-gray-200">
                  {item.subItems.map((subItem) => (
                    hasAccess(subItem.roles) && (
                      <Link href={subItem.path} key={subItem.path}>
                        <div className={`
                          flex items-center px-4 py-2 my-1 rounded-md cursor-pointer
                          ${isActiveLink(subItem.path) ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}
                        `}>
                          <div className="mr-3">{subItem.icon}</div>
                          <span>{subItem.label}</span>
                        </div>
                      </Link>
                    )
                  ))}
                </div>
              )}
            </div>
          )
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;