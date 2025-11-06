import { Question } from '@/types';
import { MultipleChoice } from './MultipleChoice';
import { FillBlank } from './FillBlank';
import { TrueFalse } from './TrueFalse';
import { Matching } from './Matching';
import { ShortAnswer } from './ShortAnswer';

interface QuestionRendererProps {
  question: Question;
  userAnswer: any;
  showExplanation: boolean;
  onAnswerChange: (answer: any) => void;
}

export function QuestionRenderer({
  question,
  userAnswer,
  showExplanation,
  onAnswerChange,
}: QuestionRendererProps) {
  // Store question_type for use in default case (TypeScript exhaustive checking)
  const questionType = question.question_type;

  switch (questionType) {
    case 'multiple_choice':
      return (
        <MultipleChoice
          question={question}
          selectedAnswer={userAnswer}
          showExplanation={showExplanation}
          onAnswerSelect={onAnswerChange}
        />
      );

    case 'fill_blank':
      return (
        <FillBlank
          question={question}
          userAnswer={userAnswer || ''}
          showExplanation={showExplanation}
          onAnswerChange={onAnswerChange}
        />
      );

    case 'true_false':
      return (
        <TrueFalse
          question={question}
          selectedAnswer={userAnswer}
          showExplanation={showExplanation}
          onAnswerSelect={onAnswerChange}
        />
      );

    case 'matching':
      return (
        <Matching
          question={question}
          userMatches={userAnswer || {}}
          showExplanation={showExplanation}
          onMatchChange={onAnswerChange}
        />
      );

    case 'short_answer':
      return (
        <ShortAnswer
          question={question}
          userAnswer={userAnswer || ''}
          showExplanation={showExplanation}
          onAnswerChange={onAnswerChange}
        />
      );

    default:
      // Exhaustive check - this should never happen if all question types are handled
      const _exhaustiveCheck: never = questionType;
      return <div>Tuntematon kysymystyyppi: {String(_exhaustiveCheck)}</div>;
  }
}
