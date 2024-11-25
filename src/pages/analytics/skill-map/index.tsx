import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/supabase';
import { FaChartPie, FaUsers, FaBuilding, FaDownload } from 'react-icons/fa';
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
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

export default function SkillMap() {
  const router = useRouter();
  const [department, setDepartment] = useState('all');
  const [skillCategory, setSkillCategory] = useState('all');
  const [visualizationType, setVisualizationType] = useState('radar');
  const [departments, setDepartments] = useState([]);
  const [skillCategories, setSkillCategories] = useState([]);
  const [skillData, setSkillData] = useState(null);

  useEffect(() => {
    fetchData();
  }, [department, skillCategory]);

  const fetchData = async () => {
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');
      
      const { data: skills, error: skillsError } = await supabase
        .from('skills')
        .select('*');
      
      const { data: userSkills, error: userSkillsError } = await supabase
        .from('user_skills')
        .select('*');

      if (usersError || skillsError || userSkillsError) throw new Error('データの取得に失敗しました');

      // 部門リストの作成
      const uniqueDepartments = [...new Set(users.map(user => user.department))];
      setDepartments(uniqueDepartments);

      // スキルカテゴリリストの作成
      const uniqueCategories = [...new Set(skills.map(skill => skill.category))];
      setSkillCategories(uniqueCategories);

      // データの集計処理
      const processedData = processSkillData(users, skills, userSkills);
      setSkillData(processedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      // サンプルデータの設定
      setSkillData(getSampleData());
    }
  };

  const processSkillData = (users, skills, userSkills) => {
    // 実際のデータ処理ロジックをここに実装
    return {
      labels: ['プログラミング', 'データベース', 'インフラ', 'マネジメント', 'コミュニケーション'],
      datasets: [{
        label: '平均スキルレベル',
        data: [4, 3, 5, 2, 4],
        backgroundColor: 'rgba(44, 82, 130, 0.2)',
        borderColor: 'rgba(44, 82, 130, 1)',
        borderWidth: 2,
      }]
    };
  };

  const getSampleData = () => {
    return {
      labels: ['プログラミング', 'データベース', 'インフラ', 'マネジメント', 'コミュニケーション'],
      datasets: [{
        label: '平均スキルレベル',
        data: [4, 3, 5, 2, 4],
        backgroundColor: 'rgba(44, 82, 130, 0.2)',
        borderColor: 'rgba(44, 82, 130, 1)',
        borderWidth: 2,
      }]
    };
  };

  const handleExport = () => {
    // レポート出力処理
    console.log('レポート出力');
  };

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <div className="flex">
        {/* サイドバー */}
        <div className="w-64 min-h-screen bg-[#2C5282] p-4">
          <div className="text-white text-xl font-bold mb-8">スキル分析</div>
          <nav>
            <Link href="/analytics/dashboard" className="flex items-center text-white mb-4 hover:bg-[#4299E1] p-2 rounded">
              <FaChartPie className="mr-2" />
              ダッシュボード
            </Link>
            <Link href="/analytics/skill-map" className="flex items-center text-white mb-4 bg-[#4299E1] p-2 rounded">
              <FaUsers className="mr-2" />
              スキルマップ
            </Link>
          </nav>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">スキルマップ分析</h1>

          {/* フィルター */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">部門</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="all">全部門</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">スキルカテゴリ</label>
                <select
                  value={skillCategory}
                  onChange={(e) => setSkillCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="all">全カテゴリ</option>
                  {skillCategories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">可視化タイプ</label>
                <select
                  value={visualizationType}
                  onChange={(e) => setVisualizationType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="radar">レーダーチャート</option>
                  <option value="bar">棒グラフ</option>
                </select>
              </div>
            </div>
          </div>

          {/* チャート表示 */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="h-[400px] flex items-center justify-center">
              {skillData && visualizationType === 'radar' ? (
                <Radar data={skillData} options={{
                  scales: {
                    r: {
                      min: 0,
                      max: 5,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }} />
              ) : skillData && (
                <Bar data={skillData} options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 5
                    }
                  }
                }} />
              )}
            </div>
          </div>

          {/* アクション */}
          <div className="flex justify-end">
            <button
              onClick={handleExport}
              className="flex items-center bg-[#2C5282] text-white px-4 py-2 rounded hover:bg-[#4299E1]"
            >
              <FaDownload className="mr-2" />
              レポート出力
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}