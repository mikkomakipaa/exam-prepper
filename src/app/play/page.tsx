'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getRecentQuestionSets } from '@/lib/supabase/queries';
import { QuestionSet, Difficulty } from '@/types';
import { Loader2, BookOpen, Clock, BarChart3, Star, ChevronDown, ChevronUp } from 'lucide-react';

type BrowseState = 'loading' | 'loaded' | 'error';

interface GroupedQuestionSets {
  key: string;
  name: string;
  subject: string;
  topic?: string;
  subtopic?: string;
  grade?: number;
  sets: QuestionSet[];
}

export default function PlayBrowsePage() {
  const router = useRouter();

  const [state, setState] = useState<BrowseState>('loading');
  const [groupedSets, setGroupedSets] = useState<GroupedQuestionSets[]>([]);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  const difficultyLabels: Record<string, string> = {
    helppo: 'Helppo',
    normaali: 'Normaali',
    vaikea: 'Vaikea',
    mahdoton: 'Mahdoton',
  };

  const difficultyColors: Record<string, { bg: string; hover: string; text: string }> = {
    helppo: { bg: 'bg-green-500', hover: 'hover:bg-green-600', text: 'text-green-700' },
    normaali: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-blue-700' },
    vaikea: { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', text: 'text-orange-700' },
    mahdoton: { bg: 'bg-red-500', hover: 'hover:bg-red-600', text: 'text-red-700' },
  };

  const difficultyEmojis: Record<string, string> = {
    helppo: '😊',
    normaali: '🎯',
    vaikea: '💪',
    mahdoton: '🔥',
  };

  useEffect(() => {
    const loadQuestionSets = async () => {
      try {
        setState('loading');
        const sets = await getRecentQuestionSets(100); // Load more sets

        // Group question sets by name, subject, topic, subtopic
        const grouped = sets.reduce((acc, set) => {
          const key = `${set.name}|${set.subject}|${set.topic || ''}|${set.subtopic || ''}`;

          if (!acc[key]) {
            acc[key] = {
              key,
              name: set.name,
              subject: set.subject,
              topic: set.topic,
              subtopic: set.subtopic,
              grade: set.grade,
              sets: [],
            };
          }

          acc[key].sets.push(set);
          return acc;
        }, {} as Record<string, GroupedQuestionSets>);

        const groupedArray = Object.values(grouped);

        if (groupedArray.length === 0) {
          setError('Ei vielä kysymyssarjoja. Luo ensimmäinen!');
        }

        setGroupedSets(groupedArray);
        setState('loaded');
      } catch (err) {
        console.error('Error loading question sets:', err);
        setError('Kysymyssarjojen lataaminen epäonnistui');
        setState('error');
      }
    };

    loadQuestionSets();
  }, []);

  const getSubjectLabel = (subject: string) => {
    const labels: Record<string, string> = {
      english: '🇬🇧 Englanti',
      math: '🔢 Matematiikka',
      history: '📜 Historia',
      society: '🏛️ Yhteiskuntaoppi',
    };
    return labels[subject] || subject;
  };

  const toggleExpand = (key: string) => {
    setExpandedKey(expandedKey === key ? null : key);
  };

  const getAvailableDifficulties = (sets: QuestionSet[]) => {
    return ['helppo', 'normaali', 'vaikea', 'mahdoton'].filter(difficulty =>
      sets.some(set => set.difficulty === difficulty)
    );
  };

  // Loading screen
  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-600" />
          <p className="text-lg text-gray-600">Ladataan aihealueita...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-7 h-7 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Valitse aihealue</h1>
          </div>
          <p className="text-gray-600">Valitse ensin aihealue, sitten vaikeustaso</p>
        </div>

        {state === 'error' && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {groupedSets.length === 0 && state === 'loaded' && (
          <Alert className="mb-6">
            <AlertDescription>
              Ei vielä kysymyssarjoja. Luo ensimmäinen kysymyssarja!
            </AlertDescription>
          </Alert>
        )}

        {groupedSets.length > 0 && (
          <div className="space-y-3">
            {groupedSets.map((group) => {
              const isExpanded = expandedKey === group.key;
              const availableDifficulties = getAvailableDifficulties(group.sets);

              return (
                <div
                  key={group.key}
                  className="border border-gray-200 rounded-xl overflow-hidden transition-all"
                >
                  {/* Topic Card */}
                  <button
                    onClick={() => toggleExpand(group.key)}
                    className="w-full text-left p-5 hover:bg-purple-50/50 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors mb-3">
                          {group.name}
                        </h3>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-sm text-gray-600">
                            {getSubjectLabel(group.subject)}
                          </span>
                          {group.grade && (
                            <span className="text-sm text-gray-500">
                              • Luokka {group.grade}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            • {availableDifficulties.length} vaikeustasoa
                          </span>
                        </div>

                        {(group.topic || group.subtopic) && (
                          <p className="text-sm text-gray-500 mt-2">
                            {[group.topic, group.subtopic].filter(Boolean).join(' → ')}
                          </p>
                        )}
                      </div>

                      {/* Expand Icon */}
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Difficulty Selector - Expanded */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 bg-gray-50 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-3 font-medium">
                        Valitse vaikeustaso:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {availableDifficulties.map((difficulty) => {
                          const set = group.sets.find(s => s.difficulty === difficulty);
                          const colors = difficultyColors[difficulty];
                          const emoji = difficultyEmojis[difficulty];

                          return (
                            <Button
                              key={difficulty}
                              onClick={() => set && router.push(`/play/${set.code}`)}
                              className={`${colors.bg} ${colors.hover} text-white py-4 rounded-lg font-semibold transition-all`}
                            >
                              <span className="text-xl mr-2">{emoji}</span>
                              {difficultyLabels[difficulty]}
                            </Button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {group.sets[0]?.question_count || 0} kysymystä per taso
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            className="text-gray-600 hover:text-gray-900"
          >
            ← Takaisin valikkoon
          </Button>
        </div>
      </div>
    </div>
  );
}
