import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/supabase';
import { FaSearch, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { BsStars } from 'react-icons/bs';

type UserSkill = {
  id: string;
  user_id: string;
  skill_id: string;
  level: number;
  years_of_experience: number;
}

type User = {
  id: string;
  employee_id: string;
  name: string;
  department: string;
  position: string;
  email: string;
}

type Skill = {
  id: string;
  name: string;
  category: string;
}

type SearchResult = {
  user: User;
  skill: Skill;
  level: number;
  years_of_experience: number;
}

export default function SkillSearch() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [minLevel, setMinLevel] = useState(1);
  const [department, setDepartment] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const departments = [
    '開発部',
    '営業部',
    'マーケティング部',
    '人事部',
    '総務部'
  ];

  const searchSkills = async () => {
    try {
      let query = supabase
        .from('user_skills')
        .select(`
          *,
          users (*),
          skills (*)
        `)
        .gte('level', minLevel);

      if (keyword) {
        query = query.textSearch('skills.name', keyword);
      }

      if (department) {
        query = query.eq('users.department', department);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedResults = data.map(item => ({
        user: item.users,
        skill: item.skills,
        level: item.level,
        years_of_experience: item.years_of_experience
      }));

      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Error searching skills:', error);
      // サンプルデータを表示
      setSearchResults([
        {
          user: {
            id: '1',
            employee_id: 'EMP001',
            name: '山田太郎',
            department: '開発部',
            position: 'シニアエンジニア',
            email: 'yamada@example.com'
          },
          skill: {
            id: '1',
            name: 'React',
            category: 'フロントエンド'
          },
          level: 4,
          years_of_experience: 5
        }
      ]);
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-50">
      {/* サイドバー */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-[#2C5282] transform transition-transform duration-300 ease-in-out z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 text-white">
          <button className="absolute top-4 right-4" onClick={() => setIsSidebarOpen(false)}>
            <FaTimes size={24} />
          </button>
          <div className="mt-8">
            <Link href="/profile" className="block py-2 hover:bg-blue-700 rounded px-4">
              プロフィール
            </Link>
            <Link href="/skills" className="block py-2 hover:bg-blue-700 rounded px-4">
              スキル一覧
            </Link>
            <Link href="/challenges" className="block py-2 hover:bg-blue-700 rounded px-4">
              課題一覧
            </Link>
            <Link href="/ideas" className="block py-2 hover:bg-blue-700 rounded px-4">
              アイデア一覧
            </Link>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="p-6">
        <div className="flex items-center mb-8">
          <button 
            className="mr-4 text-gray-600"
            onClick={() => setIsSidebarOpen(true)}
          >
            <FaBars size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">スキル検索</h1>
        </div>

        {/* 検索フォーム */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                スキルキーワード
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: React, Python など"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最小スキルレベル
              </label>
              <select
                value={minLevel}
                onChange={(e) => setMinLevel(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {[1, 2, 3, 4, 5].map((level) => (
                  <option key={level} value={level}>
                    レベル {level} 以上
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                部門
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">すべての部門</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={searchSkills}
              className="bg-[#2C5282] text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
            >
              <FaSearch className="mr-2" />
              検索する
            </button>
          </div>
        </div>

        {/* 検索結果 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">検索結果</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <FaUser className="text-gray-500 text-xl" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-lg">{result.user.name}</h3>
                    <p className="text-gray-600">{result.user.department} - {result.user.position}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center mb-2">
                    <BsStars className="text-yellow-400 mr-2" />
                    <span className="font-medium">{result.skill.name}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>レベル: {result.level}</span>
                    <span>経験年数: {result.years_of_experience}年</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {searchResults.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              検索条件に一致する結果が見つかりませんでした。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}