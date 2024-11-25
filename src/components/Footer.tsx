import { FC } from 'react'
import Link from 'next/link'
import { FaLinkedin, FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa'

interface FooterProps {
  copyright?: string
  links?: LinkInfo[]
}

interface LinkInfo {
  text: string
  href: string
}

const defaultLinks = [
  { text: 'ホーム', href: '/' },
  { text: 'プロフィール', href: '/profiles' },
  { text: 'スキル管理', href: '/skills' },
  { text: '課題一覧', href: '/challenges' },
  { text: 'アイデア共有', href: '/ideas' }
]

const Footer: FC<FooterProps> = ({ 
  copyright = '© 2024 Skill Matching Platform. All rights reserved.',
  links = defaultLinks 
}) => {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">スキルマッチング</h3>
            <p className="text-sm">
              社内人材のスキルとアイデアを効果的にマッチングし、
              部門を越えたシナジーを創出するプラットフォーム
            </p>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">クイックリンク</h3>
            <ul className="space-y-2">
              {links.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition duration-150">
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold mb-4">サポート</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white transition duration-150">
                  ヘルプセンター
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition duration-150">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition duration-150">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition duration-150">
                  利用規約
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold mb-4">SNSでフォロー</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <FaTwitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaFacebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaLinkedin className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaInstagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-center text-gray-400 text-sm">
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer