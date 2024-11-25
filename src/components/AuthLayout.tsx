import { ReactNode } from "react";
import { FaUser } from "react-icons/fa";
import Image from "next/image";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
}

const AuthLayout = ({ children, title }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <FaUser className="text-blue-600 text-2xl" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">{title}</h2>
          <div className="mt-4">
            <Image
              src="/logo.png"
              alt="Company Logo"
              width={150}
              height={40}
              className="mx-auto"
            />
          </div>
        </div>

        <div className="mt-8">
          {children}
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                社内人材マッチングシステム
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>© 2024 Your Company. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;