import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaSearch, FaEnvelope, FaEnvelopeOpen, FaClock } from 'react-icons/fa';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { supabase } from '@/supabase';

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  sent_at: string;
  read_at: string | null;
  sender?: {
    name: string;
  };
  receiver?: {
    name: string;
  };
};

const MessagesPage = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        fetchMessages(user.id);
      }
    };
    fetchCurrentUser();
  }, []);

  const fetchMessages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(name),
          receiver:users!receiver_id(name)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // サンプルデータ
      setMessages([
        {
          id: '1',
          sender_id: '123',
          receiver_id: '456',
          content: 'プロジェクトの進捗について',
          sent_at: '2024-01-20T10:00:00',
          read_at: null,
          sender: { name: '山田太郎' },
          receiver: { name: '鈴木花子' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.sender?.name.includes(searchQuery) ||
    message.receiver?.name.includes(searchQuery)
  );

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">メッセージ一覧</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="メッセージを検索..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {message.read_at ? (
                        <FaEnvelopeOpen className="text-gray-400" />
                      ) : (
                        <FaEnvelope className="text-blue-500" />
                      )}
                      <span className="font-semibold">
                        {message.sender_id === currentUserId
                          ? `To: ${message.receiver?.name}`
                          : `From: ${message.sender?.name}`}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaClock className="mr-1" />
                      {format(new Date(message.sent_at), 'MM/dd HH:mm', { locale: ja })}
                    </div>
                  </div>
                  <p className="text-gray-700 line-clamp-2">{message.content}</p>
                </div>
              ))}
              
              {filteredMessages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  メッセージが見つかりません
                </div>
              )}
            </div>
          )}
        </div>

        <div className="fixed bottom-8 right-8">
          <button
            onClick={() => router.push('/messages/new')}
            className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;