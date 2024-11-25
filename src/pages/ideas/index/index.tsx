import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiSearch, FiFilter, FiPlus } from 'react-icons/fi';
import { BiSort } from 'react-icons/bi';
import { supabase } from '@/supabase';

const IdeaList = () => {
  const router = useRouter();
  const [ideas, setIdeas] = useState([]);
  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select(`
          id,
          title,
          description,
          posted_by,
          required_resources,
          users (name)
        `);

      if (error) throw error;
      setIdeas(data || []);
      setFilteredIdeas(data || []);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      // サンプルデータ
      const sampleData = [
        {
          id: 1,
          title: 'AIを活用した業務効率化',
          description: '社内業務プロセスの自動化案',
          posted_by: 'user1',
          required_resources: { skills: ['AI', 'プロジェクト管理'], budget: '500万円' },
          users: { name: '山田太郎' }
        },
        // ...他のサンプルデータ
      ];
      setIdeas(sampleData);
      setFilteredIdeas(sampleData);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterIdeas(term, selectedCategory);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterIdeas(searchTerm, category);
  };

  const handleSort = (sortType) => {
    setSortBy(sortType);
    let sorted = [...filteredIdeas];
    switch (sortType) {
      case 'latest':
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
    }
    setFilteredIdeas(sorted);
  };

  const filterIdeas = (term, category) => {
    let filtered = ideas;
    if (term) {
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(term.toLowerCase()) ||
        idea.description.toLowerCase().includes(term.toLowerCase())
      );
    }
    if (category !== 'all') {
      filtered = filtered.filter(idea =>
        idea.required_resources.skills.includes(category)
      );
    }
    setFilteredIdeas(filtered);
  };

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Head>
        <title>アイデア一覧 | 社内マッチングシステム</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">アイデア一覧</h1>
          <Link href="/ideas/new" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <FiPlus className="mr-2" />
            新規アイデア投稿
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="アイデアを検索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  className="appearance-none px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pr-8"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="all">全カテゴリー</option>
                  <option value="AI">AI</option>
                  <option value="業務効率化">業務効率化</option>
                  <option value="プロジェクト管理">プロジェクト管理</option>
                </select>
                <FiFilter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              <div className="relative">
                <select
                  className="appearance-none px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pr-8"
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                >
                  <option value="latest">最新順</option>
                  <option value="oldest">古い順</option>
                </select>
                <BiSort className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map((idea) => (
              <Link href={`/ideas/${idea.id}`} key={idea.id} className="block">
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{idea.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{idea.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <img
                        src="https://placehold.co/32x32"
                        alt={idea.users?.name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span>{idea.users?.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {idea.required_resources?.skills?.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaList;