import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaArrowLeft, FaTags, FaExclamationCircle } from 'react-icons/fa';
import { supabase } from '@/supabase';
import { BsFillFileEarmarkTextFill, BsLightningChargeFill } from 'react-icons/bs';

const ChallengePost = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('中');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const { data: skills, error } = await supabase
        .from('skills')
        .select('id, name, category');

      if (error) throw error;
      setAvailableSkills(skills || []);
    } catch (error) {
      console.error('スキル取得エラー:', error);
      setAvailableSkills([
        { id: '1', name: 'JavaScript', category: 'プログラミング' },
        { id: '2', name: 'Python', category: 'プログラミング' },
        { id: '3', name: 'デザイン思考', category: 'ビジネススキル' },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('ユーザーが認証されていません');

      const { error } = await supabase.from('challenges').insert([
        {
          title,
          description,
          posted_by: user.id,
          status: '未着手',
          required_skills: selectedSkills,
        },
      ]);

      if (error) throw error;

      router.push('/challenges');
    } catch (error) {
      console.error('課題投稿エラー:', error);
      setError('課題の投稿に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/challenges" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            <FaArrowLeft />
            <span>課題一覧に戻る</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-8 text-gray-800">新規課題の投稿</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                課題タイトル *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="課題のタイトルを入力してください"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                課題の詳細 *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="課題の詳細な内容を記述してください"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                必要なスキル
              </label>
              <div className="grid grid-cols-3 gap-2">
                {availableSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className={`p-2 border rounded-md cursor-pointer ${
                      selectedSkills.includes(skill.id)
                        ? 'bg-blue-100 border-blue-500'
                        : 'border-gray-300 hover:border-blue-500'
                    }`}
                    onClick={() => {
                      setSelectedSkills((prev) =>
                        prev.includes(skill.id)
                          ? prev.filter((id) => id !== skill.id)
                          : [...prev, skill.id]
                      );
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <FaTags className="text-gray-500" />
                      <span>{skill.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                優先度
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="高">高</option>
                <option value="中">中</option>
                <option value="低">低</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center gap-2">
                <FaExclamationCircle />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? '投稿中...' : '課題を投稿する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChallengePost;