import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="text-center p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">欢迎使用预约系统</h1>
        <Link 
          to="/calendar" 
          className="inline-block px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          进入预约日历
        </Link>
      </div>
    </div>
  );
}