import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { supabase } from '@/supabase';
import { FaChartLine, FaGraduationCap, FaUserCog } from 'react-icons/fa';
import { BiMenuAltLeft } from 'react-icons/bi';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

type Skill = {
  id: string;
  name: string;
  category: string;
};

type UserSkill = {
  id: string;
  user_id: string;
  skill_id: string;
  level: number;
  years_of_experience: number;
};

const SkillGapAnalysis: NextPage = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('*');

        const { data: userSkillsData, error: userSkillsError } = await supabase
          .from('user_skills')
          .select('*');

        if (skillsError || userSkillsError) throw new Error('データの取得に失敗しました');

        setSkills(skillsData || []);
        setUserSkills(userSkillsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        // サンプルデータをセット
        setSkills([
          { id: '1', name: 'JavaScript', category: 'プログラミング' },
          { id: '2', name: 'Python', category: 'プログラミング' },
          { id: '3', name: 'データ分析', category: 'アナリティクス' },
        ]);
        setUserSkills([
          { id: '1', user_id: '1', skill_id: '1', level: 3, years_of_experience: 2 },
          { id: '2', user_id: '1', skill_id: '2', level: 4, years_of_experience: 3 },
          { id: '3', user_id: '1', skill_id: '3', level: 2, years_of_experience: 1 },
        ]);
      }
    };

    fetchData();
  }, []);

  const gapData = {
    labels: skills.map(skill => skill.name),
    datasets: [
      {
        label: '必要スキルレベル',
        data: skills.map(() => 5),
        backgroundColor: 'rgba(66, 153, 225, 0.5)',
      },
      {
        label: '現在のスキルレベル',
        data: skills.map(skill => {
          const userSkill = userSkills.find(us => us.skill_id === skill.id);
          return userSkill?.level || 0;
        }),
        backgroundColor: 'rgba(72, 187, 120, 0.5)',
      },
    ],
  };

  const radarData = {
    labels: skills.map(skill => skill.name),
    datasets: [
      {
        label: 'スキルギャップ',
        data: skills.map(skill => {
          const userSkill = userSkills.find(us => us.skill_id === skill.id);
          return 5 - (userSkill?.level || 0);
        }),
        backgroundColor: 'rgba(66, 153, 225, 0.2)',
        borderColor: 'rgba(66, 153, 225, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen h-full bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-transform duration-300 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } z-50 w-64`}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">メニュー</h2>
          <nav>
            <Link href="/analytics/dashboard" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
              ダッシュボード
            </Link>
            <Link href="/analytics/skill-map" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
              スキルマップ
            </Link>
            <Link href="/analytics/synergy" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
              シナジー分析
            </Link>
            <Link href="/analytics/talent-report" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
              人材活用レポート
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        >
          <BiMenuAltLeft size={24} />
        </button>

        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">スキルギャップ分析</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ギャップ分析チャート */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaChartLine className="mr-2" />
                スキルレベル比較
              </h2>
              <Bar data={gapData} />
            </div>

            {/* レーダーチャート */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaUserCog className="mr-2" />
                ギャップ分布
              </h2>
              <Radar data={radarData} />
            </div>

            {/* 育成施策提案 */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaGraduationCap className="mr-2" />
                推奨育成施策
              </h2>
              <div className="space-y-4">
                {skills.map((skill) => {
                  const userSkill = userSkills.find(us => us.skill_id === skill.id);
                  const gap = 5 - (userSkill?.level || 0);
                  if (gap <= 0) return null;
                  
                  return (
                    <div key={skill.id} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-lg">{skill.name}</h3>
                      <p className="text-gray-600">
                        優先度: {gap >= 3 ? '高' : gap >= 2 ? '中' : '低'}
                      </p>
                      <p className="text-gray-600">
                        推奨アクション: {
                          gap >= 3 ? '集中的なトレーニングプログラムへの参加を推奨' :
                          gap >= 2 ? 'オンライン学習コースの受講を推奨' :
                          'セルフラーニング教材の活用を推奨'
                        }
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillGapAnalysis;