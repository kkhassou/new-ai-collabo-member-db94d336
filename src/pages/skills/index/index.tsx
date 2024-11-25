import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/supabase';
import { FaSearch, FaPlus, FaFilter, FaStar } from 'react-icons/fa';
import { BiCategoryAlt } from 'react-icons/bi';

type Skill = {
  id: string;
  name: string;
  category: string;
  level?: number;
  years_of_experience?: number;
};

export default function SkillList() {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const { data: skillsData, error } = await supabase
        .from('skills')
        .select(`
          id,
          name,
          category,
          user_skills (
            level,
            years_of_experience
          )
        `);

      if (error) throw error;

      const formattedSkills = skillsData.map(skill => ({
        ...skill,
        level: skill.user_skills[0]?.level || 0,
        years_of_experience: skill.user_skills[0]?.years_of_experience || 0
      }));

      setSkills(formattedSkills);
      setFilteredSkills(formattedSkills);
      
      const uniqueCategories = [...new Set(skillsData.map(skill => skill.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching skills:', error);
      // サンプルデータの表示
      const sampleSkills = [
        { id: '1', name: 'JavaScript', category: 'プログラミング', level: 4, years_of_experience: 3 },
        { id: '2', name: 'Python', category: 'プログラミング', level: 3, years_of_experience: 2 },
        { id: '3', name: 'Project Management', category: 'マネジメント', level: 5, years_of_experience: 5 },
      ];
      setSkills(sampleSkills);
      setFilteredSkills(sampleSkills);
      setCategories(['プログラミング', 'マネジメント']);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterSkills(query, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    filterSkills(searchQuery, category);
  };

  const filterSkills = (query: string, category: string) => {
    let filtered = skills;
    
    if (query) {
      filtered = filtered.filter(skill =>
        skill.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (category !== 'all') {
      filtered = filtered.filter(skill => skill.category === category);
    }

    setFilteredSkills(filtered);
  };

  const renderStars = (level: number) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={`inline ${
          index < (level || 0) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">スキル一覧</h1>
          <Link
            href="/skills/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <FaPlus /> スキル登録
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="スキルを検索..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <div className="md:w-64">
              <div className="relative">
                <select
                  className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="all">すべてのカテゴリー</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <BiCategoryAlt className="absolute left-3 top-3 text-gray-400" />
                <FaFilter className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    スキル名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    カテゴリー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    レベル
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    経験年数
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSkills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {skill.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {skill.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(skill.level || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {skill.years_of_experience} 年
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
}