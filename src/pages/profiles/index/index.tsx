import { useEffect, useState } from 'react'
import { supabase } from '@/supabase'
import Link from 'next/link'
import { FiEdit, FiSearch, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { BiSortAlt2 } from 'react-icons/bi'

type Profile = {
  id: string
  name: string
  department: string
  position: string
  email: string
  profile_data: {
    avatar_url?: string
  }
}

const ProfileList = () => {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<keyof Profile>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [departmentFilter, setDepartmentFilter] = useState('')
  
  const itemsPerPage = 10

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, department, position, email, profile_data')

      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error('Error fetching profiles:', error)
      // サンプルデータ
      setProfiles([
        {
          id: '1',
          name: '山田太郎',
          department: '開発部',
          position: 'シニアエンジニア',
          email: 'yamada@example.com',
          profile_data: { avatar_url: 'https://placehold.co/100x100' }
        },
        // ... その他のサンプルデータ
      ])
    }
  }

  const filteredProfiles = profiles
    .filter(profile => 
      profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(profile => 
      !departmentFilter || profile.department === departmentFilter
    )
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      return sortDirection === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue))
    })

  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage)
  const paginatedProfiles = filteredProfiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const departments = Array.from(new Set(profiles.map(p => p.department)))

  const handleSort = (field: keyof Profile) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">プロフィール一覧</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="検索..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-64">
              <select
                className="w-full p-2 border rounded-md"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">部署で絞り込み</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    プロフィール
                  </th>
                  {['department', 'position', 'email'].map((field) => (
                    <th
                      key={field}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort(field as keyof Profile)}
                    >
                      <div className="flex items-center">
                        {field === 'department' ? '部署' : field === 'position' ? '役職' : 'メールアドレス'}
                        <BiSortAlt2 className="ml-1" />
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedProfiles.map((profile) => (
                  <tr key={profile.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={profile.profile_data?.avatar_url || "https://placehold.co/100x100"}
                            alt={profile.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{profile.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {profile.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {profile.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {profile.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/profiles/${profile.id}/edit`} className="text-blue-600 hover:text-blue-900">
                        <FiEdit className="inline-block" /> 編集
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                全{filteredProfiles.length}件中 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProfiles.length)}件を表示
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <FiChevronLeft />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileList