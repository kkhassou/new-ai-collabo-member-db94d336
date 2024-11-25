import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaSearch, FaUser, FaStar, FaBriefcase, FaChartLine } from 'react-icons/fa';
import { supabase } from '@/supabase';

type MatchingResult = {
  id: string;
  name: string;
  department: string;
  matchScore: number;
  skills: { name: string; level: number }[];
};

const MatchingSearchPage = () => {
  const router = useRouter();
  const [searchType, setSearchType] = useState<'skill' | 'idea'>('skill');
  const [skillKeywords, setSkillKeywords] = useState('');
  const [minimumLevel, setMinimumLevel] = useState(1);
  const [department, setDepartment] = useState('');
  const [matchingResults, setMatchingResults] = useState<MatchingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          department,
          user_skills (
            skill_id,
            level
          )
        `);

      if (error) throw error;

      // サンプルデータ（実際のAPIレスポンスに合わせて調整）
      const sampleResults: MatchingResult[] = [
        {
          id: '1',
          name: '山田太郎',
          department: '開発部',
          matchScore: 95,
          skills: [
            { name: 'TypeScript', level: 4 },
            { name: 'React', level: 5 },
          ],
        },
        {
          id: '2',
          name: '鈴木花子',
          department: 'デザイン部',
          matchScore: 88,
          skills: [
            { name: 'UI/UX', level: 5 },
            { name: 'Figma', level: 4 },
          ],
        },
      ];

      setMatchingResults(sampleResults);
    } catch (error) {
      console.error('検索エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-50">
      {/* サイドバー */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg p-4">
        <div className="text-2xl font-bold text-blue-600 mb-8">SkillSync</div>
        <nav className="space-y-4">
          <Link href="/profile" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
            <FaUser />
            <span>プロフィール</span>
          </Link>
          <Link href="/matching/search" className="flex items-center space-x-2 text-blue-600 font-semibold">
            <FaSearch />
            <span>マッチング検索</span>
          </Link>
          <Link href="/challenges" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
            <FaBriefcase />
            <span>課題一覧</span>
          </Link>
          <Link href="/analytics" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
            <FaChartLine />
            <span>分析</span>
          </Link>
        </nav>
      </div>

      {/* メインコンテンツ */}
      <div className="ml-64 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">マッチング検索</h1>

        {/* 検索フォーム */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">検索タイプ</label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'skill' | 'idea')}
                className="w-full rounded-md border border-gray-300 p-2"
              >
                <option value="skill">スキルベース</option>
                <option value="idea">アイデアベース</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">スキルキーワード</label>
              <input
                type="text"
                value={skillKeywords}
                onChange={(e) => setSkillKeywords(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="例: TypeScript, React"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">最低スキルレベル</label>
              <input
                type="number"
                min="1"
                max="5"
                value={minimumLevel}
                onChange={(e) => setMinimumLevel(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">部署</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="例: 開発部"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {isLoading ? '検索中...' : '検索する'}
          </button>
        </div>

        {/* 検索結果 */}
        <div className="space-y-4">
          {matchingResults.map((result) => (
            <div key={result.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{result.name}</h3>
                  <p className="text-gray-600">{result.department}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <FaStar className="text-yellow-400" />
                  <span className="text-lg font-semibold">{result.matchScore}%</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill.name} Lv.{skill.level}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <Link
                  href={`/profile/${result.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  プロフィールを見る →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchingSearchPage;