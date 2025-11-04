'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QuestionRenderer } from '@/components/questions/QuestionRenderer';
import { ProgressBar } from '@/components/play/ProgressBar';
import { ResultsScreen } from '@/components/play/ResultsScreen';
import { useGameSession } from '@/hooks/useGameSession';
import { getQuestionSetByCode } from '@/lib/supabase/queries';
import { QuestionSetWithQuestions } from '@/types';
import { Loader2, List } from 'lucide-react';

type PlayState = 'loading' | 'error' | 'playing' | 'results';

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [state, setState] = useState<PlayState>('loading');
  const [questionSet, setQuestionSet] = useState<QuestionSetWithQuestions | null>(null);
  const [error, setError] = useState('');

  const {
    currentQuestion,
    currentQuestionIndex,
    selectedQuestions,
    userAnswer,
    showExplanation,
    score,
    answers,
    isLastQuestion,
    totalPoints,
    currentStreak,
    bestStreak,
    setUserAnswer,
    submitAnswer,
    nextQuestion,
    startNewSession,
  } = useGameSession(questionSet?.questions || []);

  // Load question set
  useEffect(() => {
    const loadQuestionSet = async () => {
      try {
        setState('loading');
        const data = await getQuestionSetByCode(code);

        if (!data) {
          setError(`Kysymyssarjaa ei löytynyt koodilla: ${code}`);
          setState('error');
          return;
        }

        setQuestionSet(data);
        setState('playing');
      } catch (err) {
        console.error('Error loading question set:', err);
        setError('Kysymyssarjan lataaminen epäonnistui');
        setState('error');
      }
    };

    if (code) {
      loadQuestionSet();
    }
  }, [code]);

  // Start new session when question set loads
  useEffect(() => {
    if (questionSet && state === 'playing' && selectedQuestions.length === 0) {
      startNewSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionSet, state]);

  const handleSubmitAnswer = () => {
    submitAnswer();
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      setState('results');
    } else {
      nextQuestion();
    }
  };

  const handlePlayAgain = () => {
    startNewSession();
    setState('playing');
  };

  const handleBrowseQuestionSets = () => {
    router.push('/play');
  };

  const handleBackToMenu = () => {
    router.push('/');
  };

  // Loading screen
  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="w-96 shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-teal-500" />
            <p className="text-xl font-bold text-purple-700">Ladataan kysymyssarjaa...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error screen
  if (state === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50 p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onClick={handleBackToMenu} className="mt-4">
                Palaa valikkoon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Results screen
  if (state === 'results') {
    return (
      <ResultsScreen
        score={score}
        total={selectedQuestions.length}
        answers={answers}
        totalPoints={totalPoints}
        bestStreak={bestStreak}
        onPlayAgain={handlePlayAgain}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  // Playing screen - show loading while session initializes
  if (!currentQuestion || selectedQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="w-96 shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-teal-500" />
            <p className="text-xl font-bold text-purple-700">Valmistellaan kysymyksiä...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Streak Banner */}
        {currentStreak >= 3 && !showExplanation && (
          <div className="mb-4 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500 text-white rounded-lg p-4 text-center animate-bounce shadow-lg">
            <span className="text-2xl font-bold">🔥 {currentStreak} oikein putkeen!</span>
          </div>
        )}

        {/* Points and Progress Display */}
        <div className="mb-4 flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md border-0">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm text-purple-600 font-medium">Pisteet</div>
              <div className="text-2xl font-bold text-purple-700">💎 {totalPoints}</div>
            </div>
            {currentStreak > 0 && (
              <div className="text-center">
                <div className="text-sm text-orange-600 font-medium">Putki</div>
                <div className="text-2xl font-bold text-orange-600">🔥 {currentStreak}</div>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-teal-600 font-medium">Edistyminen</div>
            <div className="text-lg font-bold text-teal-700">
              {currentQuestionIndex + 1} / {selectedQuestions.length}
            </div>
          </div>
        </div>

        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-cyan-500 via-teal-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-white font-bold">
              {currentQuestion.question_text}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <QuestionRenderer
              question={currentQuestion}
              userAnswer={userAnswer}
              showExplanation={showExplanation}
              onAnswerChange={setUserAnswer}
            />

            {showExplanation && (
              <>
                {answers[answers.length - 1]?.isCorrect && (
                  <Alert className="bg-green-50 border-green-300">
                    <AlertDescription className="text-base">
                      <strong className="block mb-2 text-green-700 text-xl">
                        🎉 Oikein! +{answers[answers.length - 1]?.pointsEarned || 10} pistettä
                      </strong>
                      {(answers[answers.length - 1]?.streakAtAnswer ?? 0) >= 3 && (
                        <div className="text-sm text-orange-600 font-bold mb-2">
                          🔥 Putki bonus +5 pistettä!
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                {!answers[answers.length - 1]?.isCorrect && (
                  <Alert className="bg-red-50 border-red-300">
                    <AlertDescription className="text-base">
                      <strong className="block mb-2 text-red-700 text-xl">
                        📚 Oppimiskohta:
                      </strong>
                    </AlertDescription>
                  </Alert>
                )}
                <Alert className="bg-blue-50 border-blue-200 mt-3">
                  <AlertDescription className="text-base">
                    <strong className="block mb-2">Selitys:</strong>
                    {currentQuestion.explanation}
                  </AlertDescription>
                </Alert>
              </>
            )}

            <div className="pt-4 space-y-3">
              {!showExplanation ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={
                    userAnswer === null ||
                    userAnswer === '' ||
                    (typeof userAnswer === 'object' && Object.keys(userAnswer).length === 0)
                  }
                  className="w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-purple-600 hover:from-cyan-600 hover:via-teal-600 hover:to-purple-700 text-lg py-6 min-h-[56px] touch-manipulation"
                >
                  Tarkista vastaus
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-lg py-6 min-h-[56px] touch-manipulation"
                >
                  {isLastQuestion ? '🎯 Katso tulokset' : 'Seuraava kysymys ▶️'}
                </Button>
              )}
              <Button
                onClick={handleBrowseQuestionSets}
                variant="outline"
                className="w-full text-base py-4 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 min-h-[48px] touch-manipulation"
              >
                <List className="w-4 h-4 mr-2" />
                Valitse koealue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
