import { Subject } from '@/types';
import { getSubject } from '@/config/subjects';

interface QuestionCountSelectorProps {
  subject: Subject;
  questionCount: number;
  onQuestionCountChange: (count: number) => void;
}

export function QuestionCountSelector({
  subject,
  questionCount,
  onQuestionCountChange,
}: QuestionCountSelectorProps) {
  const subjectConfig = getSubject(subject);
  const min = subjectConfig?.minQuestionCount || 20;
  const max = subjectConfig?.maxQuestionCount || 100;

  return (
    <div>
      <label className="block text-lg font-bold mb-3 text-gray-800">
        🔢 Kysymysten määrä: {questionCount}
      </label>
      <div className="space-y-3">
        <input
          type="range"
          min={min}
          max={max}
          step={10}
          value={questionCount}
          onChange={(e) => onQuestionCountChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>{min} kysymystä</span>
          <span>{max} kysymystä</span>
        </div>
      </div>
    </div>
  );
}
