import Link from 'next/link';
import { 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Lightbulb,
  ArrowRight,
  CheckCircle2 
} from 'lucide-react';

export default function Home() {
  const aiTools = [
    {
      icon: FileText,
      title: 'Tóm tắt văn bản',
      description: 'Rút gọn nội dung dài thành những ý chính',
      color: 'from-blue-500 to-cyan-500',
      href: '/tools/summary'
    },
    {
      icon: MessageSquare,
      title: 'Hỏi đáp thông minh',
      description: 'Đặt câu hỏi và nhận câu trả lời chi tiết',
      color: 'from-purple-500 to-pink-500',
      href: '/tools/questions'
    },
    {
      icon: Lightbulb,
      title: 'Giải thích khái niệm',
      description: 'Hiểu rõ bất kỳ chủ đề nào một cách đơn giản',
      color: 'from-amber-500 to-orange-500',
      href: '/tools/explain'
    },
    {
      icon: BookOpen,
      title: 'Viết lại nội dung',
      description: 'Chỉnh sửa và cải thiện văn bản của bạn',
      color: 'from-green-500 to-emerald-500',
      href: '/tools/rewrite'
    }
  ];

  const benefits = [
    'Học nhanh hơn với AI hỗ trợ 24/7',
    'Tiết kiệm thời gian nghiên cứu',
    'Hiểu sâu hơn với giải thích chi tiết',
    'Nâng cao kỹ năng tư duy phản biện'
  ];

  return (
    <div className="dark min-h-screen bg-gradient-to-b 
      from-slate-50 to-white dark:from-slate-900 
      dark:to-slate-800">
      
      {/* Header */}
      <header className="border-b dark:border-gray-800 
        bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 
          py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Hidn" className="w-8 h-8" />
            <span className="text-2xl font-bold text-gray-900 
              dark:text-white">Hidn</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium 
                text-gray-700 dark:text-gray-300 
                hover:text-indigo-600 dark:hover:text-indigo-400 
                transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium 
                bg-indigo-600 text-white rounded-lg 
                hover:bg-indigo-700 transition-colors 
                dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 
        py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 
          rounded-full bg-indigo-50 dark:bg-indigo-900/30 
          text-indigo-700 dark:text-indigo-300 text-sm 
          font-medium mb-6">
          <img src="/logo.svg" alt="Hidn" className="w-4 h-4" />
          Học thông minh hơn với AI
        </div>
        
        <h1 className="text-5xl sm:text-6xl font-bold 
          text-gray-900 dark:text-white mb-6 
          leading-tight">
          Tăng tốc học tập <br />
          <span className="bg-gradient-to-r from-indigo-600 
            to-purple-600 bg-clip-text text-transparent">
            với sức mạnh AI
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 
          mb-8 max-w-2xl mx-auto">
          Hidn giúp bạn học nhanh hơn, hiểu sâu hơn với các 
          công cụ AI thông minh. Tóm tắt, giải thích, hỏi đáp 
          - mọi thứ bạn cần trong một nền tảng.
        </p>

        <div className="flex justify-center gap-4 mb-12">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 
              bg-indigo-600 text-white rounded-xl font-semibold 
              hover:bg-indigo-700 transition-all hover:scale-105 
              shadow-lg hover:shadow-xl dark:bg-indigo-500 
              dark:hover:bg-indigo-600"
          >
            Dùng thử ngay
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#tools"
            className="inline-flex items-center gap-2 px-8 py-4 
              bg-white dark:bg-gray-800 text-gray-700 
              dark:text-gray-200 rounded-xl font-semibold 
              border-2 border-gray-200 dark:border-gray-700 
              hover:border-indigo-600 dark:hover:border-indigo-400 
              transition-all"
          >
            Khám phá công cụ
          </Link>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 
          gap-4 max-w-4xl mx-auto">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-4 py-3 
                bg-white dark:bg-gray-800 rounded-lg 
                border border-gray-100 dark:border-gray-700"
            >
              <CheckCircle2 className="w-5 h-5 text-green-600 
                dark:text-green-400 flex-shrink-0" />
              <span className="text-sm text-gray-700 
                dark:text-gray-300">
                {benefit}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* AI Tools Preview */}
      <section id="tools" className="max-w-7xl mx-auto px-4 
        sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 
            dark:text-white mb-4">
            Công cụ AI mạnh mẽ
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 
            max-w-2xl mx-auto">
            Trải nghiệm bộ công cụ AI được thiết kế đặc biệt 
            để hỗ trợ học tập hiệu quả
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aiTools.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <Link
                key={idx}
                href={tool.href}
                className="group relative p-8 bg-white 
                  dark:bg-gray-800 rounded-2xl border-2 
                  border-gray-100 dark:border-gray-700 
                  hover:border-transparent hover:shadow-2xl 
                  transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br 
                  ${tool.color} opacity-0 group-hover:opacity-10 
                  transition-opacity`} />
                
                <div className="relative">
                  <div className={`inline-flex p-3 rounded-xl 
                    bg-gradient-to-br ${tool.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 
                    dark:text-white mb-2 group-hover:text-indigo-600 
                    dark:group-hover:text-indigo-400 transition-colors">
                    {tool.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 
                    mb-4">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center gap-2 
                    text-indigo-600 dark:text-indigo-400 
                    font-medium group-hover:gap-3 transition-all">
                    Dùng thử
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 
        py-20">
        <div className="bg-gradient-to-br from-indigo-600 
          to-purple-600 rounded-3xl p-12 text-center 
          text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">
            Sẵn sàng học thông minh hơn?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl 
            mx-auto">
            Tham gia cùng hàng nghìn học viên đang sử dụng Hidn 
            để nâng cao hiệu quả học tập mỗi ngày.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 
              bg-white text-indigo-600 rounded-xl font-semibold 
              hover:bg-indigo-50 transition-all hover:scale-105 
              shadow-lg"
          >
            Bắt đầu miễn phí
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t dark:border-gray-800 
        bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 
          py-6 w-full">
          <div className="flex flex-col md:flex-row justify-between 
            items-center gap-4 h-full">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Hidn" className="w-6 h-6" />
              <span className="text-lg font-bold text-gray-900 
                dark:text-white">Hidn</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 self-center">
              © 2026 Hidn. Học thông minh hơn với AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
