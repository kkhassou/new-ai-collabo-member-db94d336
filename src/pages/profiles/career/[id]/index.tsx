import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaUserTie, FaCertificate, FaGraduationCap, FaFileDownload } from 'react-icons/fa';
import { BiArrowBack } from 'react-icons/bi';
import { supabase } from '@/supabase';

const CareerPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [careerData, setCareerData] = useState({
    workHistory: [],
    certifications: [],
    trainings: []
  });
  
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    period: '',
    description: ''
  });
  
  const [certForm, setCertForm] = useState({
    name: '',
    issuedBy: '',
    acquisitionDate: ''
  });
  
  const [trainingForm, setTrainingForm] = useState({
    courseName: '',
    provider: '',
    completionDate: ''
  });

  useEffect(() => {
    const fetchCareerData = async () => {
      if (id) {
        const { data, error } = await supabase
          .from('users')
          .select('profile_data')
          .eq('id', id)
          .single();

        if (data) {
          setCareerData(data.profile_data?.career || {
            workHistory: [],
            certifications: [],
            trainings: []
          });
        }
      }
    };

    fetchCareerData();
  }, [id]);

  const handleCareerSubmit = async (e) => {
    e.preventDefault();
    const updatedWorkHistory = [...careerData.workHistory, formData];
    
    const { error } = await supabase
      .from('users')
      .update({
        profile_data: {
          ...careerData,
          workHistory: updatedWorkHistory
        }
      })
      .eq('id', id);

    if (!error) {
      setCareerData(prev => ({
        ...prev,
        workHistory: updatedWorkHistory
      }));
      setFormData({
        company: '',
        position: '',
        period: '',
        description: ''
      });
    }
  };

  const handleCertSubmit = async (e) => {
    e.preventDefault();
    const updatedCerts = [...careerData.certifications, certForm];
    
    const { error } = await supabase
      .from('users')
      .update({
        profile_data: {
          ...careerData,
          certifications: updatedCerts
        }
      })
      .eq('id', id);

    if (!error) {
      setCareerData(prev => ({
        ...prev,
        certifications: updatedCerts
      }));
      setCertForm({
        name: '',
        issuedBy: '',
        acquisitionDate: ''
      });
    }
  };

  const handleTrainingSubmit = async (e) => {
    e.preventDefault();
    const updatedTrainings = [...careerData.trainings, trainingForm];
    
    const { error } = await supabase
      .from('users')
      .update({
        profile_data: {
          ...careerData,
          trainings: updatedTrainings
        }
      })
      .eq('id', id);

    if (!error) {
      setCareerData(prev => ({
        ...prev,
        trainings: updatedTrainings
      }));
      setTrainingForm({
        courseName: '',
        provider: '',
        completionDate: ''
      });
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center">
          <Link href={`/profiles/${id}`} className="flex items-center text-blue-600 hover:text-blue-800">
            <BiArrowBack className="mr-2" />
            プロフィールに戻る
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 職務経歴セクション */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaUserTie className="mr-2 text-blue-600" />
              職務経歴
            </h2>
            <form onSubmit={handleCareerSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="会社名"
                  className="w-full p-2 border rounded"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="役職"
                  className="w-full p-2 border rounded"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="期間"
                  className="w-full p-2 border rounded"
                  value={formData.period}
                  onChange={(e) => setFormData({...formData, period: e.target.value})}
                />
              </div>
              <div>
                <textarea
                  placeholder="職務内容"
                  className="w-full p-2 border rounded"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                経歴を追加
              </button>
            </form>

            <div className="mt-4 space-y-2">
              {careerData.workHistory.map((history, index) => (
                <div key={index} className="border p-3 rounded">
                  <p className="font-bold">{history.company}</p>
                  <p>{history.position}</p>
                  <p className="text-sm text-gray-600">{history.period}</p>
                  <p className="text-sm">{history.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 資格情報セクション */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaCertificate className="mr-2 text-green-600" />
              保有資格
            </h2>
            <form onSubmit={handleCertSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="資格名"
                  className="w-full p-2 border rounded"
                  value={certForm.name}
                  onChange={(e) => setCertForm({...certForm, name: e.target.value})}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="発行機関"
                  className="w-full p-2 border rounded"
                  value={certForm.issuedBy}
                  onChange={(e) => setCertForm({...certForm, issuedBy: e.target.value})}
                />
              </div>
              <div>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={certForm.acquisitionDate}
                  onChange={(e) => setCertForm({...certForm, acquisitionDate: e.target.value})}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                資格を追加
              </button>
            </form>

            <div className="mt-4 space-y-2">
              {careerData.certifications.map((cert, index) => (
                <div key={index} className="border p-3 rounded">
                  <p className="font-bold">{cert.name}</p>
                  <p className="text-sm text-gray-600">{cert.issuedBy}</p>
                  <p className="text-sm">{cert.acquisitionDate}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 研修履歴セクション */}
          <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaGraduationCap className="mr-2 text-purple-600" />
              研修履歴
            </h2>
            <form onSubmit={handleTrainingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="研修名"
                  className="w-full p-2 border rounded"
                  value={trainingForm.courseName}
                  onChange={(e) => setTrainingForm({...trainingForm, courseName: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="提供機関"
                  className="w-full p-2 border rounded"
                  value={trainingForm.provider}
                  onChange={(e) => setTrainingForm({...trainingForm, provider: e.target.value})}
                />
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={trainingForm.completionDate}
                  onChange={(e) => setTrainingForm({...trainingForm, completionDate: e.target.value})}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
              >
                研修を追加
              </button>
            </form>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {careerData.trainings.map((training, index) => (
                <div key={index} className="border p-3 rounded">
                  <p className="font-bold">{training.courseName}</p>
                  <p className="text-sm text-gray-600">{training.provider}</p>
                  <p className="text-sm">{training.completionDate}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            className="bg-gray-800 text-white px-6 py-2 rounded-lg flex items-center mx-auto hover:bg-gray-900"
            onClick={() => {/* 経歴書出力ロジック */}}
          >
            <FaFileDownload className="mr-2" />
            経歴書を出力
          </button>
        </div>
      </div>
    </div>
  );
};

export default CareerPage;