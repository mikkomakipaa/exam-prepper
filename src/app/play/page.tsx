'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getRecentQuestionSets } from '@/lib/supabase/queries';
import { QuestionSet } from '@/types';
import { Loader2, BookOpen, Clock, BarChart3, Star } from 'lucide-react';

type BrowseState = 'loading' | 'loaded' | 'error';

export default function PlayBrowsePage() {
  const router = useRouter();
  const [state, setState] = useState<BrowseState>('loading');
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadQuestionSets = async () => {
      try {
        setState('loading');
        const sets = await getRecentQuestionSets(50); // Load last 50 sets

        if (sets.length === 0) {
          setError('Ei vielä kysymyssarjoja. Luo ensimmäinen!');
        }

        setQuestionSets(sets);
        setState('loaded');
      } catch (err) {
        console.error('Error loading question sets:', err);
        setError('Kysymyssarjojen lataaminen epäonnistui');
        setState('error');
      }
    };

    loadQuestionSets();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fi-FI', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getDifficultyStars = (difficulty: string) => {
    const difficultyMap: Record<string, number> = {
      helppo: 1,
      normaali: 2,
      vaikea: 3,
      mahdoton: 4,
    };
    const starCount = difficultyMap[difficulty] || 2;

    return (
      <div className="flex items-center gap-1">
        {[...Array(4)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < starCount
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getSubjectLabel = (subject: string) => {
    const labels: Record<string, string> = {
      english: '🇬🇧 Englanti',
      math: '🔢 Matematiikka',
      history: '📜 Historia',
      society: '🏛️ Yhteiskuntaoppi',
    };
    return labels[subject] || subject;
  };

  // Loading screen
  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="w-96 shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-teal-500" />
            <p className="text-xl font-bold text-purple-700">Ladataan kysymyssarjoja...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-lg mb-6 border-0">
          <CardHeader className="bg-gradient-to-r from-cyan-500 via-teal-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl flex items-center gap-2 text-white">
              <BookOpen className="w-8 h-8" />
              Koekertaaja
            </CardTitle>
            <CardDescription className="text-white text-lg font-medium">
              Valitse koealue
            </CardDescription>
          </CardHeader>
        </Card>

        {state === 'error' && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {questionSets.length === 0 && state === 'loaded' && (
          <Alert className="mb-6">
            <AlertDescription>
              Ei vielä kysymyssarjoja. Luo ensimmäinen kysymyssarja!
            </AlertDescription>
          </Alert>
        )}

        {questionSets.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-purple-900 mb-4">
              Koealueet ({questionSets.length})
            </h2>

            {questionSets.map((set) => (
              <Card
                key={set.id}
                className="shadow-md hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] touch-manipulation border-0 bg-white/80 backdrop-blur-sm"
                onClick={() => router.push(`/play/${set.code}`)}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-3">
                        <h3 className="text-xl md:text-2xl font-bold text-purple-700">
                          {set.name}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-3 mb-3">
                        <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          {getSubjectLabel(set.subject)}
                        </span>
                        {set.grade && (
                          <span className="bg-violet-100 text-violet-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            📚 Luokka {set.grade}
                          </span>
                        )}
                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          {set.question_count} kysymystä
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-600">Vaikeustaso:</span>
                        {getDifficultyStars(set.difficulty)}
                      </div>

                      {(set.topic || set.subtopic) && (
                        <p className="text-sm text-gray-600 mt-2">
                          📖 {[set.topic, set.subtopic].filter(Boolean).join(' → ')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="px-8"
          >
            Takaisin valikkoon
          </Button>
        </div>
      </div>
    </div>
  );
}
