import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaArrowLeft, FaStar, FaComment, FaHistory } from 'react-icons/fa';
import { supabase } from '@/supabase';
import { format } from 'date-fns';

type Idea = {
  id: string;
  title: string;
  description: string;
  posted_by: string;
  required_resources: any;
  evaluation_data?: {
    score: number;
    comment: string;
    evaluated_at: string;
    evaluated_by: string;
  }[];
};

export default function IdeaEvaluate() {
  const router = useRouter();
  const { id } = router.query;
  
  const [idea, setIdea] = useState<Idea | null>(null);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchIdea();
    }
  }, [id]);

  const fetchIdea = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setIdea(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idea) return;

    try {
      const user = await supabase.auth.getUser();
      const newEvaluation = {
        score,
        comment,
        evaluated_at: new Date().toISOString(),
        evaluated_by: user.data.user?.id
      };

      const evaluationData = idea.evaluation_data || [];
      evaluationData.push(newEvaluation);

      const { error } = await supabase
        .from('ideas')
        .update({ evaluation_data: evaluationData })
        .eq('id', id);

      if (error) throw error;

      router.push(`/ideas/${id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="min-h-screen h-full flex items-center justify-center">読み込み中...</div>;
  if (error) return <div className="min-h-screen h-full flex items-center justify-center text-red-500">{error}</div>;
  if (!idea) return <div className="min-h-screen h-full flex items-center justify-center">アイデアが見つかりません</div>;

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href={`/ideas/${id}`} className="inline-flex items-center text-blue-600 mb-6">
          <FaArrowLeft className="mr-2" />
          戻る
        </Link>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">{idea.title}</h1>
          <p className="text-gray-600 mb-4">{idea.description}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaStar className="mr-2 text-yellow-400" />
            評価を入力
          </h2>

          <form onSubmit={handleSubmitEvaluation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                評価スコア (1-5)
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setScore(value)}
                    className={`p-2 rounded ${
                      score === value ? 'bg-blue-500 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                フィードバックコメント
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full h-32 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              評価を送信
            </button>
          </form>
        </div>

        {idea.evaluation_data && idea.evaluation_data.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaHistory className="mr-2 text-gray-400" />
              評価履歴
            </h2>

            <div className="space-y-4">
              {idea.evaluation_data.map((eval, index) => (
                <div key={index} className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span className="font-medium">{eval.score}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(new Date(eval.evaluated_at), 'yyyy/MM/dd HH:mm')}
                    </span>
                  </div>
                  <p className="text-gray-600">{eval.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}