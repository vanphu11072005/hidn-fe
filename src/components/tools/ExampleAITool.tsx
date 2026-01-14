'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCreditCheck } from '@/hooks/useCreditCheck';
import { 
  InsufficientCreditsModal 
} from '@/components/credit';

/**
 * Example AI Tool Component with Credit System Integration
 * 
 * This demonstrates how to:
 * 1. Check credits before API call
 * 2. Handle insufficient credits
 * 3. Refresh credits after success
 * 4. Show appropriate error messages
 */

export function ExampleAITool() {
  const { user, refreshCredits } = useAuth();
  const { checkCredits, creditCosts } = useCreditCheck();
  
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal state
  const [showInsufficientModal, setShowInsufficientModal] = 
    useState(false);
  const [creditInfo, setCreditInfo] = useState({
    required: 0,
    available: 0,
  });

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      // 1️⃣ FRONTEND CHECK: Validate credits before API call
      const check = checkCredits('summary');
      
      if (!check.hasEnough) {
        setCreditInfo({
          required: check.required,
          available: check.available,
        });
        setShowInsufficientModal(true);
        setLoading(false);
        return;
      }

      // 2️⃣ CALL API: Make the actual AI request
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/summary`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            mode: 'normal',
          }),
        }
      );

      const data = await response.json();

      // 3️⃣ BACKEND CHECK: Handle 402 (insufficient credits)
      if (response.status === 402) {
        setCreditInfo({
          required: data.required || 1,
          available: data.available || 0,
        });
        setShowInsufficientModal(true);
        setLoading(false);
        return;
      }

      // Handle other errors
      if (!response.ok) {
        throw new Error(data.message || 'Failed to process');
      }

      // 4️⃣ SUCCESS: Update UI and refresh credits
      setResult(data.data.summary);
      
      // Refresh credits in auth context (updates header)
      await refreshCredits();

      // Optional: Show success message with credits used
      console.log(
        `✅ Used ${data.data.creditsUsed} credits. ` +
        `Remaining: ${data.data.remainingCredits}`
      );

    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">
          Tóm tắt thông minh
        </h2>

        {/* Credit Display */}
        {user && creditCosts && (
          <div className="mb-4 flex items-center justify-between 
            p-3 bg-blue-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">
                Credits hiện có
              </p>
              <p className="text-xl font-bold text-blue-600">
                {user.credits.totalCredits}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Chi phí công cụ này
              </p>
              <p className="text-lg font-semibold text-primary">
                {creditCosts.summary} credit
              </p>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Văn bản cần tóm tắt
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg 
              focus:ring-2 focus:ring-blue-500 min-h-[150px]"
            placeholder="Nhập hoặc paste văn bản..."
            disabled={loading}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border 
            border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
          className="w-full bg-blue-600 text-white py-3 
            rounded-lg font-semibold hover:bg-blue-700 
            disabled:bg-gray-300 disabled:cursor-not-allowed
            transition-colors"
        >
          {loading ? 'Đang xử lý...' : 'Tạo tóm tắt'}
        </button>

        {/* Result */}
        {result && (
          <div className="mt-6 p-4 bg-green-50 border 
            border-green-200 rounded-lg">
            <h3 className="font-semibold mb-2 text-green-900">
              Kết quả:
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {result}
            </p>
          </div>
        )}
      </div>

      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={showInsufficientModal}
        onClose={() => setShowInsufficientModal(false)}
        required={creditInfo.required}
        available={creditInfo.available}
        toolName="Tóm tắt thông minh"
      />
    </div>
  );
}
