import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/supabase';
import { FiUsers, FiSettings, FiSave, FiSearch } from 'react-icons/fi';
import { BiGroup } from 'react-icons/bi';
import { MdSecurity } from 'react-icons/md';

type User = {
  id: string;
  employee_id: string;
  name: string;
  department: string;
  position: string;
  email: string;
  access_rights?: {
    admin: boolean;
    user_management: boolean;
    skill_management: boolean;
    challenge_management: boolean;
    idea_management: boolean;
  };
};

const AccessControl: NextPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  const handleAccessRightChange = (right: string) => {
    if (!selectedUser) return;
    setSelectedUser({
      ...selectedUser,
      access_rights: {
        ...selectedUser.access_rights,
        [right]: !selectedUser.access_rights?.[right as keyof typeof selectedUser.access_rights],
      },
    });
  };

  const saveAccessRights = async () => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('users')
        .update({ access_rights: selectedUser.access_rights })
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      setMessage('権限設定を保存しました');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving access rights:', error);
      setMessage('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-[#2C5282] text-white p-4">
          <div className="text-2xl font-bold mb-8">システム管理</div>
          <nav>
            <Link href="/admin/dashboard" className="flex items-center p-3 hover:bg-[#4299E1] rounded">
              <FiSettings className="mr-2" />
              ダッシュボード
            </Link>
            <Link href="/admin/access-control" className="flex items-center p-3 bg-[#4299E1] rounded">
              <MdSecurity className="mr-2" />
              アクセス権限設定
            </Link>
            <Link href="/admin/users" className="flex items-center p-3 hover:bg-[#4299E1] rounded">
              <FiUsers className="mr-2" />
              ユーザー管理
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">アクセス権限設定</h1>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="ユーザーを検索..."
                className="w-full p-3 pl-10 rounded-lg border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          {message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {message}
            </div>
          )}

          <div className="grid grid-cols-12 gap-6">
            {/* User List */}
            <div className="col-span-4">
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-4">ユーザー一覧</h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className={`p-3 rounded cursor-pointer hover:bg-gray-50 ${
                        selectedUser?.id === user.id ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.department}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Access Rights Matrix */}
            <div className="col-span-8">
              {selectedUser ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">権限設定: {selectedUser.name}</h2>
                    <button
                      onClick={saveAccessRights}
                      disabled={loading}
                      className="flex items-center px-4 py-2 bg-[#2C5282] text-white rounded hover:bg-[#4299E1] disabled:opacity-50"
                    >
                      <FiSave className="mr-2" />
                      保存
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedUser.access_rights?.admin || false}
                        onChange={() => handleAccessRightChange('admin')}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-semibold">システム管理者</div>
                        <div className="text-sm text-gray-600">すべての機能にアクセス可能</div>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedUser.access_rights?.user_management || false}
                        onChange={() => handleAccessRightChange('user_management')}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-semibold">ユーザー管理</div>
                        <div className="text-sm text-gray-600">ユーザー情報の編集・管理</div>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedUser.access_rights?.skill_management || false}
                        onChange={() => handleAccessRightChange('skill_management')}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-semibold">スキル管理</div>
                        <div className="text-sm text-gray-600">スキル情報の編集・管理</div>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedUser.access_rights?.challenge_management || false}
                        onChange={() => handleAccessRightChange('challenge_management')}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-semibold">課題管理</div>
                        <div className="text-sm text-gray-600">課題情報の編集・管理</div>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedUser.access_rights?.idea_management || false}
                        onChange={() => handleAccessRightChange('idea_management')}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-semibold">アイデア管理</div>
                        <div className="text-sm text-gray-600">アイデア情報の編集・管理</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  ユーザーを選択して権限を設定してください
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessControl;