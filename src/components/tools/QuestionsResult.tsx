'use client';

import React from 'react';
import { Copy, Save, Check, Loader2 } from 'lucide-react';
import { Question } from '@/types/ai.types';

interface QuestionsResultProps {
  questions: Question[];
  questionType: string;
  showAnswers: boolean;
  onToggleAnswers: () => void;
  saved: boolean;
  saving: boolean;
  onSave: () => Promise<void> | void;
  onCopy: () => Promise<void> | void;
}

export default function QuestionsResult({
  questions,
  questionType,
  showAnswers,
  onToggleAnswers,
  saved,
  saving,
  onSave,
  onCopy,
}: QuestionsResultProps) {
  return (
    <div 
      className="bg-white rounded-xl shadow-md p-6 border 
      border-gray-200 animate-in slide-in-from-bottom-4 
      duration-500"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 
          className="font-semibold text-primary flex 
          items-center gap-2"
        >
          <span className="text-green-600">✓</span>
          Kết quả
        </h3>

        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            disabled={saved || saving}
            className={`flex items-center gap-1.5 px-3 py-1.5 
              text-sm rounded-lg transition-all duration-200 ${
              saved
                ? 'bg-green-50 text-green-700 cursor-default'
                : 'hover:bg-blue-50 text-blue-600 hover:scale-105 active:scale-95'
            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={saved ? 'Đã lưu vào lịch sử' : 'Lưu vào lịch sử'}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-medium">Đang lưu...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                <span className="font-medium">Đã lưu</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span className="font-medium">Lưu lịch sử</span>
              </>
            )}
          </button>

          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 
              text-sm rounded-lg hover:bg-gray-100 transition-all 
              duration-200 hover:scale-105 active:scale-95"
          >
            <Copy className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700">Copy</span>
          </button>
        </div>
      </div>

      {/* Toggle show answers */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-gray-600">
          {questions.length} câu hỏi đã được tạo
        </span>
        <button
          onClick={onToggleAnswers}
          className="text-sm text-blue-600 hover:text-blue-700 
            font-medium"
        >
          {showAnswers ? '🙈 Ẩn đáp án' : '👁️ Hiện đáp án'}
        </button>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {questions.map((q, index) => (
          <QuestionCard
            key={index}
            question={q}
            index={index}
            showAnswer={showAnswers}
            type={questionType}
          />
        ))}
      </div>
    </div>
  );
}

// Question Card Component
interface QuestionCardProps {
  question: Question;
  index: number;
  showAnswer: boolean;
  type: string;
}

function QuestionCard({ 
  question, 
  index, 
  showAnswer, 
  type 
}: QuestionCardProps) {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 
      shadow-sm"
    >
      {/* Question */}
      <div className="flex gap-3">
        <span 
          className="flex-shrink-0 w-8 h-8 bg-blue-100 
          text-blue-600 rounded-full flex items-center 
          justify-center font-semibold text-sm"
        >
          {index + 1}
        </span>
        <div className="flex-1">
          <p className="text-primary font-medium mb-3">
            {question.question}
          </p>

          {/* MCQ Options */}
          {type === 'mcq' && question.options && (
            <div className="space-y-2 mb-3">
              {question.options.map((option, optIndex) => {
                const letter = String.fromCharCode(65 + optIndex);
                const isCorrect = showAnswer && 
                  (question.answer.includes(letter) || 
                   question.answer.includes(option));
                
                return (
                  <div
                    key={optIndex}
                    className={`flex items-start gap-2 p-2 
                      rounded-lg transition-colors ${
                      isCorrect 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <span className={`font-medium ${
                      isCorrect 
                        ? 'text-green-600' 
                        : 'text-gray-500'
                    }`}>
                      {letter}.
                    </span>
                    <span 
                      className={
                        isCorrect ? 'text-green-700' : ''
                      }
                    >
                      {option}
                    </span>
                    {isCorrect && (
                      <span 
                        className="ml-auto text-green-600"
                      >
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Answer (for non-MCQ or when shown) */}
          {showAnswer && (
            <div 
              className="mt-3 pt-3 border-t border-gray-100"
            >
              <div className="flex items-start gap-2">
                <span 
                  className="text-green-600 font-medium 
                  text-sm"
                >
                  Đáp án:
                </span>
                <span className="text-gray-700 text-sm">
                  {question.answer}
                </span>
              </div>
              
              {question.explanation && (
                <div className="flex items-start gap-2 mt-2">
                  <span 
                    className="text-blue-600 font-medium 
                    text-sm"
                  >
                    Giải thích:
                  </span>
                  <span className="text-gray-600 text-sm">
                    {question.explanation}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
