import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/supabase';
import { FiSend, FiPaperclip, FiUsers, FiCheck, FiCheckAll } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';

type Message = {
  id: string;
  sender_id: string;
  content: string;
  sent_at: string;
  read_at: string | null;
};

type User = {
  id: string;
  name: string;
};

export default function GroupChat() {
  const router = useRouter();
  const { id: groupId } = router.query;
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (groupId) {
      fetchMessages();
      fetchUsers();
    }
  }, [groupId]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('receiver_id', groupId)
      .order('sent_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name');

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    setUsers(data || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: 'current-user-id', // 実際のユーザーIDに置き換える
          receiver_id: groupId,
          content: newMessage,
          sent_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Error sending message:', error);
      return;
    }

    setNewMessage('');
    setSelectedFile(null);
    fetchMessages();
  };

  return (
    <div className="min-h-screen h-full flex bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">プロジェクトチャット</h2>
          </div>
          <nav className="flex-1 overflow-y-auto">
            <div className="p-4">
              <Link href="/messages" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
                メッセージ一覧
              </Link>
              <Link href="/profile" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
                プロフィール
              </Link>
            </div>
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">グループチャット</h1>
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <FiUsers size={24} />
          </button>
        </header>

        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === 'current-user-id' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender_id === 'current-user-id'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    <p>{message.content}</p>
                    <div className="text-xs mt-1 flex items-center justify-end">
                      <span className="mr-2">
                        {new Date(message.sent_at).toLocaleTimeString()}
                      </span>
                      {message.read_at ? <FiCheckAll /> : <FiCheck />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="メッセージを入力..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <FiPaperclip
                    size={24}
                    className="text-gray-500 hover:text-gray-700"
                  />
                </label>
                <button
                  onClick={sendMessage}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <FiSend size={20} />
                </button>
              </div>
              {selectedFile && (
                <div className="mt-2 flex items-center">
                  <span className="text-sm text-gray-600">{selectedFile.name}</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <IoMdClose size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {showMembers && (
            <div className="w-64 bg-white border-l border-gray-200 p-4">
              <h2 className="text-lg font-semibold mb-4">メンバー一覧</h2>
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {user.name[0]}
                    </div>
                    <span>{user.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}