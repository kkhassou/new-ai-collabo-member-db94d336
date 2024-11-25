import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/supabase';
import axios from 'axios';
import { FaUsers, FaChartLine, FaCheckCircle } from 'react-icons/fa';
import { IoMdSettings } from 'react-icons/io';
import { BsPersonBadge } from 'react-icons/bs';

type UserSkill = {
  id: string;
  user_id: string;
  skill_id: string;
  level: number;
  years_of_experience: number;
};

type User = {
  id: string;
  employee_id: string;
  name: string;
  department: string;
  position: string;
  email: string;
  hire_date: string;
  profile_data: any;
};

type TeamMember = {
  user: User;
  skills: UserSkill[];
  matchScore: number;
};

const TeamBuilding = () => {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [teamSize, setTeamSize] = useState(3);
  const [suggestedTeam, setSuggestedTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'AWS'
  ]);

  const generateTeam = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/matching/team-optimization', {
        projectName,
        requiredSkills,
        teamSize
      });
      setSuggestedTeam(response.data.team);
    } catch (error) {
      console.error('チーム生成エラー:', error);
      // サンプルデータ
      setSuggestedTeam([
        {
          user: {
            id: '1',
            employee_id: 'EMP001',
            name: '山田太郎',
            department: '開発部',
            position: 'シニアエンジニア',
            email: 'yamada@example.com',
            hire_date: '2020-04-01',
            profile_data: {}
          },
          skills: [],
          matchScore: 0.95
        },
        {
          user: {
            id: '2',
            employee_id: 'EMP002',
            name: '鈴木花子',
            department: '開発部',
            position: 'エンジニア',
            email: 'suzuki@example.com',
            hire_date: '2021-04-01',
            profile_data: {}
          },
          skills: [],
          matchScore: 0.88
        }
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <div className="flex">
        <aside className="w-64 h-screen bg-white shadow-lg fixed">
          <div className="p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">メニュー</h2>
            <nav>
              <Link href="/matching/search" className="flex items-center p-2 text-gray-600 hover:bg-blue-50 rounded">
                <FaChartLine className="mr-2" />
                マッチング検索
              </Link>
              <Link href="/matching/team-building" className="flex items-center p-2 text-blue-600 bg-blue-50 rounded">
                <FaUsers className="mr-2" />
                チーム編成支援
              </Link>
            </nav>
          </div>
        </aside>

        <main className="flex-1 ml-64 p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-8">チーム編成支援</h1>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">プロジェクト要件入力</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  プロジェクト名
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  必要スキル
                </label>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => {
                        if (requiredSkills.includes(skill)) {
                          setRequiredSkills(requiredSkills.filter(s => s !== skill));
                        } else {
                          setRequiredSkills([...requiredSkills, skill]);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-sm ${
                        requiredSkills.includes(skill)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  チーム規模
                </label>
                <select
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full p-2 border rounded-md"
                >
                  {[2, 3, 4, 5, 6].map((size) => (
                    <option key={size} value={size}>
                      {size}名
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={generateTeam}
                disabled={loading || !projectName || requiredSkills.length === 0}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300"
              >
                {loading ? '生成中...' : 'チーム構成を提案'}
              </button>
            </div>
          </div>

          {suggestedTeam.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">推奨チーム構成</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestedTeam.map((member) => (
                  <div
                    key={member.user.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center mb-3">
                      <img
                        src={`https://placehold.co/100x100`}
                        alt={member.user.name}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                      <div>
                        <h3 className="font-semibold">{member.user.name}</h3>
                        <p className="text-sm text-gray-600">{member.user.position}</p>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="text-sm text-gray-600">マッチ度</div>
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${member.matchScore * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(member.matchScore * 100)}%
                        </span>
                      </div>
                    </div>
                    <button className="text-blue-600 text-sm hover:underline">
                      プロフィールを表示
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeamBuilding;