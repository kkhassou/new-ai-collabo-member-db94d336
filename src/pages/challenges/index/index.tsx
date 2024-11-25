import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { supabase } from '@/supabase';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import { BiSort } from 'react-icons/bi';

type Challenge = {
  id: string;
  title: string;
  description: string;
  status: string;
  posted_by: string;
  required_skills: any;
};

const ChallengesIndex: NextPage = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([]);
  const [statusFilter, setStatusFilter] = useState('全て');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('新着順');

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*');
      
      if (error) throw error;
      
      setChallenges(data || []);
      setFilteredChallenges(data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      // サンプルデータ
      const sampleData = [
        {
          id: '1',
          title: '営業部門のデジタル化推進',
          description: 'CRMシステムの導入と運用改善が必要',
          status: '対応中',
          posted_by: 'user123',
          required_skills: { skills: ['セールス', 'デジタルマーケティング'] }
        },
        {
          id: '2',
          title: '社内コミュニケーション改善',
          description: 'リモートワーク環境での情報共有効率化',
          status: '未対応',
          posted_by: 'user456',
          required_skills: { skills: ['コミュニケーション', 'プロジェクト管理'] }
        }
      ];
      setChallenges(sampleData);
      setFilteredChallenges(sampleData);
    }
  };

  useEffect(() => {
    let filtered = [...challenges];

    if (statusFilter !== '全て') {
      filtered = filtered.filter(challenge => challenge.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortOrder === '新着順') {
      filtered.sort((a, b) => b.id.localeCompare(a.id));
    }

    setFilteredChallenges(filtered);
  }, [statusFilter, searchQuery, sortOrder, challenges]);

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Head>
        <title>課題一覧 | スキルマッチング</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">課題一覧</h1>
          <Link href="/challenges/new" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <FiPlus className="mr-2" />
            新規課題投稿
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="課題を検索..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center">
                <FiFilter className="mr-2 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded-md px-3 py-2"
                >
                  <option value="全て">全てのステータス</option>
                  <option value="未対応">未対応</option>
                  <option value="対応中">対応中</option>
                  <option value="完了">完了</option>
                </select>
              </div>
              <div className="flex items-center">
                <BiSort className="mr-2 text-gray-500" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="border rounded-md px-3 py-2"
                >
                  <option value="新着順">新着順</option>
                  <option value="古い順">古い順</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タイトル</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">説明</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">必要スキル</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChallenges.map((challenge) => (
                  <tr key={challenge.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/challenges/${challenge.id}`} className="text-blue-600 hover:text-blue-800">
                        {challenge.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 truncate max-w-xs">
                        {challenge.description}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${challenge.status === '未対応' ? 'bg-red-100 text-red-800' :
                          challenge.status === '対応中' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                        {challenge.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {challenge.required_skills?.skills?.map((skill: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesIndex;