import { Answer } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, CheckCircle2, XCircle, Zap, Flame } from 'lucide-react';

interface ResultsScreenProps {
  score: number;
  total: number;
  answers: Answer[];
  totalPoints: number;
  bestStreak: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export function ResultsScreen({
  score,
  total,
  answers,
  totalPoints,
  bestStreak,
  onPlayAgain,
  onBackToMenu,
}: ResultsScreenProps) {
  const percentage = Math.round((score / total) * 100);

  // Determine celebration level
  const getCelebration = () => {
    if (percentage === 100) return { emoji: '🌟', text: 'TÄYDELLINEN SUORITUS!', color: 'from-yellow-400 via-amber-400 to-orange-500' };
    if (percentage >= 90) return { emoji: '⭐', text: 'ERINOMAISTA!', color: 'from-emerald-400 via-teal-400 to-cyan-500' };
    if (percentage >= 80) return { emoji: '🎉', text: 'HIENOA TYÖTÄ!', color: 'from-cyan-500 via-teal-500 to-purple-600' };
    if (percentage >= 60) return { emoji: '👍', text: 'HYVÄ SUORITUS!', color: 'from-purple-500 via-violet-500 to-fuchsia-600' };
    return { emoji: '💪', text: 'HARJOITTELE LISÄÄ!', color: 'from-pink-500 via-rose-500 to-purple-600' };
  };

  const celebration = getCelebration();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-2xl border-0">
          <div className={`bg-gradient-to-r ${celebration.color} text-white rounded-t-lg p-8 text-center`}>
            <div className="flex justify-center mb-4 animate-bounce">
              <div className="text-8xl drop-shadow-lg">{celebration.emoji}</div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">{celebration.text}</h1>
            <div className="text-white space-y-2">
              <p className="text-3xl font-bold drop-shadow-md">
                {score} / {total} oikein ({percentage}%)
              </p>
              <div className="flex justify-center gap-6 mt-4">
                <div className="bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
                  <div className="text-sm font-medium">Pisteet</div>
                  <div className="text-2xl font-bold">💎 {totalPoints}</div>
                </div>
                {bestStreak > 0 && (
                  <div className="bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
                    <div className="text-sm font-medium">Paras putki</div>
                    <div className="text-2xl font-bold">🔥 {bestStreak}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-4 bg-white/80 backdrop-blur-sm">
            {/* Achievement badges */}
            {percentage === 100 && (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-lg p-4 text-center shadow-md">
                <div className="text-4xl mb-2">🏆</div>
                <p className="font-bold text-yellow-900 text-lg">Saavutus avattu: Täydellisyys!</p>
              </div>
            )}
            {bestStreak >= 5 && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-400 rounded-lg p-4 text-center shadow-md">
                <div className="text-4xl mb-2">🔥</div>
                <p className="font-bold text-orange-900 text-lg">Saavutus avattu: Tuliputki!</p>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              <h3 className="font-bold text-lg text-purple-700">Vastausten yhteenveto:</h3>
              {answers.map((answer, index) => (
                <Card
                  key={index}
                  className={
                    answer.isCorrect
                      ? 'border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50'
                      : 'border-rose-300 bg-gradient-to-r from-red-50 to-rose-50'
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      {answer.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{answer.questionText}</p>
                        {!answer.isCorrect && (
                          <p className="text-sm text-gray-600 mt-1">
                            Oikea vastaus:{' '}
                            <span className="font-semibold">
                              {typeof answer.correctAnswer === 'object'
                                ? JSON.stringify(answer.correctAnswer)
                                : answer.correctAnswer}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={onPlayAgain}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 min-h-[56px] text-lg touch-manipulation shadow-md"
              >
                🎮 Pelaa uudestaan
              </Button>
              <Button
                onClick={onBackToMenu}
                variant="outline"
                className="flex-1 min-h-[56px] text-lg border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 touch-manipulation shadow-md"
              >
                🏠 Palaa valikkoon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
