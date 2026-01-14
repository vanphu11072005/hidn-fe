import { Button } from '@/components/common';

export default function CreditsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary dark:text-white mb-2">
          Quản lý Credits
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Nạp credits và xem lịch sử sử dụng
        </p>
      </div>

      {/* Credit Balance */}
      <div className="bg-gradient-to-br from-blue-500 
        to-blue-600 p-8 rounded-lg text-white mb-6 dark:from-blue-700 dark:to-blue-800">
        <h2 className="text-lg font-medium mb-2">
          Số dư credits
        </h2>
        <div className="flex items-baseline space-x-2">
          <span className="text-5xl font-bold">15</span>
          <span className="text-xl">credits</span>
        </div>
        <div className="mt-4 flex items-center space-x-4 
          text-sm">
          <div>
            <span className="opacity-90">Miễn phí hôm nay: 
            </span>
            <span className="font-semibold">3</span>
          </div>
          <div>
            <span className="opacity-90">Đã mua: </span>
            <span className="font-semibold">12</span>
          </div>
        </div>
      </div>

      {/* Purchase Options */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-primary mb-4">
          Nạp credits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border 
            border-gray-200 dark:bg-[#0b1620] dark:border-gray-700">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary dark:text-white mb-2">
                10
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                credits
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-4">
                10.000đ
              </p>
              <Button variant="outline" className="w-full">
                Mua ngay
              </Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border-2 
            border-blue-500 relative dark:bg-[#0b1620] dark:border-blue-600">
            <div className="absolute -top-3 left-1/2 
              transform -translate-x-1/2 bg-blue-500 
              text-white text-xs px-3 py-1 rounded-full">
              Phổ biến
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary dark:text-white mb-2">
                50
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                credits
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-4">
                45.000đ
              </p>
              <Button variant="primary" className="w-full">
                Mua ngay
              </Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border 
            border-gray-200 dark:bg-[#0b1620] dark:border-gray-700">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary dark:text-white mb-2">
                100
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                credits
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-4">
                80.000đ
              </p>
              <Button variant="outline" className="w-full">
                Mua ngay
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Info */}
      <div className="bg-blue-50 p-6 rounded-lg border 
        border-blue-200 dark:bg-[#07151a] dark:border-blue-900">
        <h3 className="font-semibold text-primary dark:text-white mb-2">
          Thông tin về Credits
        </h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start">
            <span className="text-blue-600 dark:text-blue-300 mr-2">•</span>
            <span>
              Mỗi ngày nhận 3 credits miễn phí, reset lúc 
              00:00
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 dark:text-blue-300 mr-2">•</span>
            <span>
              Credits miễn phí không cộng dồn, dùng trước 
              credits đã mua
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 dark:text-blue-300 mr-2">•</span>
            <span>
              Credits đã mua không hết hạn, giữ vĩnh viễn
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 dark:text-blue-300 mr-2">•</span>
            <span>
              Thanh toán qua MoMo / ZaloPay
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
