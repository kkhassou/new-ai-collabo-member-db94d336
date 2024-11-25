import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/supabase';
import Link from 'next/link';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { FaList, FaUser, FaLightbulb, FaComments, FaChartBar } from 'react-icons/fa';

const SkillRegister = () => {
  const router = useRouter();
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState(1);
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'プログラミング',
    'データベース',
    'インフラ',
    'ネットワーク',
    'セキュリティ',
    'マネジメント',
    'その他'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }

      // スキルの登録
      const { data: skillData, error: skillError } = await supabase
        .from('skills')
        .insert([
          { name: skillName, category }
        ])
        .select()
        .single();

      if (skillError) throw skillError;

      // ユーザースキルの登録
      const { error: userSkillError } = await supabase
        .from('user_skills')
        .insert([
          {
            user_id: user.id,
            skill_id: skillData.id,
            level,
            years_of_experience: yearsOfExperience
          }
        ]);

      if (userSkillError) throw userSkillError;

      router.push('/skills');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800">スキル管理システム</h2>
        </div>
        <nav className="mt-4">
          <Link href="/profile" className="flex items-center px-4 py-3 hover:bg-gray-100">
            <FaUser className="mr-3" />
            プロフィール
          </Link>
          <Link href="/skills" className="flex items-center px-4 py-3 bg-blue-50 text-blue-600">
            <FaList className="mr-3" />
            スキル管理
          </Link>
          <Link href="/ideas" className="flex items-center px-4 py-3 hover:bg-gray-100">
            <FaLightbulb className="mr-3" />
            アイデア管理
          </Link>
          <Link href="/communication" className="flex items-center px-4 py-3 hover:bg-gray-100">
            <FaComments className="mr-3" />
            コミュニケーション
          </Link>
          <Link href="/analytics" className="flex items-center px-4 py-3 hover:bg-gray-100">
            <FaChartBar className="mr-3" />
            データ分析
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href="/skills" className="text-gray-600 hover:text-gray-800 mr-4">
              <FiArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">新規スキル登録</h1>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                スキル名
              </label>
              <input
                type="text"
                required
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: Python"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                カテゴリー
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                レベル（1-5）
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>初級</span>
                <span>中級</span>
                <span>上級</span>
                <span>エキスパート</span>
                <span>マスター</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                経験年数
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                required
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 2.5"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <FiSave className="mr-2" />
                {loading ? '保存中...' : '保存する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SkillRegister;