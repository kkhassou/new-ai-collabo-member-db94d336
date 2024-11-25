import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import Link from 'next/link';
import {
  FaChartLine,
  FaUsers,
  FaFileAlt,
  FaFilter,
  FaDownload,
  FaSidebar,
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

type UserData = {
  id: string;
  name: string;
  department: string;
  position: string;
  skillGrowth: number;
  utilizationRate: number;
};

const TalentReport = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('全部門');
  const [period, setPeriod] = useState('6');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const sampleData = [
    { month: '1月', 活用率: 65, 成長度: 72 },
    { month: '2月', 活用率: 68, 成長度: 75 },
    { month: '3月', 活用率: 75, 成長度: 78 },
    { month: '4月', 活用率: 78, 成長度: 80 },
    { month: '5月', 活用率: 82, 成長度: 83 },
    { month: '6月', 活用率: 85, 成長度: 87 },
  ];

  const departmentData = [
    { department: '営業部', 活用率: 85, 成長度: 87 },
    { department: '開発部', 活用率: 90, 成長度: 85 },
    { department: '人事部', 活用率: 75, 成長度: 80 },
    { department: '企画部', 活用率: 82, 成長度: 78 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: usersData, error } = await supabase
          .from('users')
          .select('*');

        if (error) throw error;

        // サンプルデータ加工処理
        const processedData = usersData?.map(user => ({
          id: user.id,
          name: user.name,
          department: user.department,
          position: user.position,
          skillGrowth: Math.floor(Math.random() * 30) + 70,
          utilizationRate: Math.floor(Math.random() * 30) + 70,
        })) || [];

        setUsers(processedData);
      } catch (error) {
        console.error('データ取得エラー:', error);
      }
    };

    fetchData();
  }, []);

  const handleExportReport = () => {
    alert('レポートが出力されました');
  };

  return (
    <div className="min-h-screen h-full bg-gray-50 flex">
      {/* サイドバー */}
      <div
        className={`bg-[#2C5282] text-white h-screen fixed left-0 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h2 className={`${isSidebarOpen ? 'block' : 'hidden'} font-bold`}>
              人材活用システム
            </h2>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <FaSidebar />
            </button>
          </div>
          <nav className="mt-8">
            <Link
              href="/analytics/talent-report"
              className="flex items-center gap-3 p-3 rounded hover:bg-[#4299E1] transition-colors"
            >
              <FaChartLine />
              {isSidebarOpen && <span>人材活用レポート</span>}
            </Link>
            {/* 他のナビゲーションリンク */}
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div
        className={`flex-1 ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        } transition-all duration-300`}
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">人材活用レポート</h1>
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 bg-[#2C5282] text-white px-4 py-2 rounded hover:bg-[#4299E1] transition-colors"
            >
              <FaDownload />
              レポート出力
            </button>
          </div>

          {/* フィルター部分 */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-500" />
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="border rounded p-2"
                >
                  <option value="全部門">全部門</option>
                  <option value="営業部">営業部</option>
                  <option value="開発部">開発部</option>
                  <option value="人事部">人事部</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">期間:</span>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="border rounded p-2"
                >
                  <option value="3">3ヶ月</option>
                  <option value="6">6ヶ月</option>
                  <option value="12">12ヶ月</option>
                </select>
              </div>
            </div>
          </div>

          {/* グラフ表示部分 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">月次推移</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sampleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="活用率"
                      stroke="#2C5282"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="成長度"
                      stroke="#48BB78"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">部門別分析</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="活用率" fill="#2C5282" />
                    <Bar dataKey="成長度" fill="#48BB78" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 個人別分析表 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">個人別分析</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      名前
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      部署
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      役職
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      スキル成長率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      活用率
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.skillGrowth}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.utilizationRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentReport;