import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';
import Link from 'next/link';
import { FaChartLine, FaUsers, FaRegChartBar, FaCog } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SynergyAnalysis = () => {
  const [period, setPeriod] = useState('1month');
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [kpiData, setKpiData] = useState(null);
  const [synergyData, setSynergyData] = useState(null);

  useEffect(() => {
    fetchDepartments();
    fetchAnalyticsData();
  }, [period, selectedDepartments]);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('department')
        .distinct();
      
      if (error) throw error;
      
      const uniqueDepartments = [...new Set(data.map(item => item.department))];
      setDepartments(uniqueDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments(['営業部', '開発部', '人事部', '経営企画部']);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*');

      if (error) throw error;

      // サンプルデータの生成
      const sampleKpiData = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [{
          label: 'KPI達成率',
          data: [65, 72, 78, 85, 82, 90],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      };

      const sampleSynergyData = {
        labels: ['営業×開発', '開発×人事', '人事×企画', '企画×営業'],
        datasets: [{
          label: 'シナジー効果スコア',
          data: [85, 65, 75, 80],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        }]
      };

      setKpiData(sampleKpiData);
      setSynergyData(sampleSynergyData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-[#2C5282] text-white p-4">
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">データ分析</h2>
            <nav>
              <Link href="/analytics/dashboard" className="flex items-center p-2 hover:bg-[#4299E1] rounded">
                <FaChartLine className="mr-2" /> ダッシュボード
              </Link>
              <Link href="/analytics/synergy" className="flex items-center p-2 bg-[#4299E1] rounded">
                <FaUsers className="mr-2" /> シナジー効果
              </Link>
              <Link href="/analytics/skills" className="flex items-center p-2 hover:bg-[#4299E1] rounded">
                <FaRegChartBar className="mr-2" /> スキル分析
              </Link>
              <Link href="/analytics/settings" className="flex items-center p-2 hover:bg-[#4299E1] rounded">
                <FaCog className="mr-2" /> 設定
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">シナジー効果分析</h1>

          {/* Filter Controls */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分析期間
                </label>
                <select
                  className="w-full border rounded-md p-2"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="1month">1ヶ月</option>
                  <option value="3months">3ヶ月</option>
                  <option value="6months">6ヶ月</option>
                  <option value="1year">1年</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  対象部門
                </label>
                <select
                  className="w-full border rounded-md p-2"
                  multiple
                  value={selectedDepartments}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setSelectedDepartments(values);
                  }}
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">KPI達成状況</h3>
              {kpiData && <Line data={kpiData} />}
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">部門間シナジー効果</h3>
              {synergyData && <Bar data={synergyData} />}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-6 mt-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="text-lg font-semibold mb-2">総合スコア</h4>
              <p className="text-3xl font-bold text-[#4299E1]">85.2</p>
              <p className="text-sm text-gray-500">前月比 +5.3%</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="text-lg font-semibold mb-2">協業プロジェクト数</h4>
              <p className="text-3xl font-bold text-[#4299E1]">24</p>
              <p className="text-sm text-gray-500">前月比 +3</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="text-lg font-semibold mb-2">生産性向上率</h4>
              <p className="text-3xl font-bold text-[#4299E1]">12.8%</p>
              <p className="text-sm text-gray-500">前月比 +2.1%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SynergyAnalysis;