/**
 * Database Validation Script
 *
 * This script validates all question sets and questions in the Supabase database.
 * It checks for:
 * - Missing or empty options for multiple_choice questions
 * - Missing correct_answer fields
 * - Missing explanation fields
 * - Invalid question types
 * - Empty pairs for matching questions
 * - Data integrity issues
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('');
  console.error('Please set the following environment variables:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.error('');
  console.error('You can either:');
  console.error('  1. Create a .env.local file (copy from .env.example)');
  console.error('  2. Run with: NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... npx tsx scripts/validate-database.ts');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ValidationIssue {
  severity: 'error' | 'warning';
  questionSetId: string;
  questionSetCode: string;
  questionSetName: string;
  questionId?: string;
  questionText?: string;
  questionType?: string;
  issue: string;
  details?: any;
}

const issues: ValidationIssue[] = [];

function addIssue(issue: ValidationIssue) {
  issues.push(issue);
  const icon = issue.severity === 'error' ? '❌' : '⚠️';
  console.log(`${icon} [${issue.questionSetCode}] ${issue.issue}`);
  if (issue.questionText) {
    console.log(`   Question: ${issue.questionText.substring(0, 80)}...`);
  }
  if (issue.details) {
    console.log(`   Details:`, issue.details);
  }
}

async function validateDatabase() {
  console.log('🔍 Starting database validation...\n');

  // Fetch all question sets
  const { data: questionSets, error: setsError } = await supabase
    .from('question_sets')
    .select('*')
    .order('created_at', { ascending: false });

  if (setsError) {
    console.error('❌ Error fetching question sets:', setsError);
    process.exit(1);
  }

  if (!questionSets || questionSets.length === 0) {
    console.log('ℹ️ No question sets found in database.');
    return;
  }

  console.log(`📊 Found ${questionSets.length} question sets\n`);

  // Validate each question set
  for (const questionSet of questionSets) {
    console.log(`\n📝 Validating: ${questionSet.name} (${questionSet.code})`);
    console.log(`   Subject: ${questionSet.subject}, Difficulty: ${questionSet.difficulty}`);

    // Fetch questions for this set
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('question_set_id', questionSet.id)
      .order('order_index', { ascending: true });

    if (questionsError) {
      addIssue({
        severity: 'error',
        questionSetId: questionSet.id,
        questionSetCode: questionSet.code,
        questionSetName: questionSet.name,
        issue: 'Failed to fetch questions',
        details: questionsError,
      });
      continue;
    }

    if (!questions || questions.length === 0) {
      addIssue({
        severity: 'warning',
        questionSetId: questionSet.id,
        questionSetCode: questionSet.code,
        questionSetName: questionSet.name,
        issue: 'Question set has no questions',
      });
      continue;
    }

    console.log(`   Questions: ${questions.length}`);

    // Check if question_count matches actual count
    if (questionSet.question_count !== questions.length) {
      addIssue({
        severity: 'warning',
        questionSetId: questionSet.id,
        questionSetCode: questionSet.code,
        questionSetName: questionSet.name,
        issue: `Question count mismatch: expected ${questionSet.question_count}, got ${questions.length}`,
      });
    }

    // Validate each question
    for (const question of questions) {
      validateQuestion(question, questionSet);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(80));

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  console.log(`\n✅ Validated ${questionSets.length} question sets`);
  console.log(`❌ Errors: ${errors.length}`);
  console.log(`⚠️  Warnings: ${warnings.length}`);

  if (issues.length === 0) {
    console.log('\n🎉 All validation checks passed!');
  } else {
    console.log('\n📋 Issues by Question Set:');
    const issuesBySet = new Map<string, ValidationIssue[]>();
    issues.forEach(issue => {
      const key = issue.questionSetCode;
      if (!issuesBySet.has(key)) {
        issuesBySet.set(key, []);
      }
      issuesBySet.get(key)!.push(issue);
    });

    issuesBySet.forEach((setIssues, code) => {
      const firstIssue = setIssues[0];
      console.log(`\n  ${code} - ${firstIssue.questionSetName}`);
      console.log(`    Errors: ${setIssues.filter(i => i.severity === 'error').length}`);
      console.log(`    Warnings: ${setIssues.filter(i => i.severity === 'warning').length}`);
    });
  }

  if (errors.length > 0) {
    console.log('\n❌ Validation failed with errors');
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log('\n⚠️  Validation completed with warnings');
    process.exit(0);
  } else {
    console.log('\n✅ Validation completed successfully');
    process.exit(0);
  }
}

function validateQuestion(question: any, questionSet: any) {
  const baseInfo = {
    questionSetId: questionSet.id,
    questionSetCode: questionSet.code,
    questionSetName: questionSet.name,
    questionId: question.id,
    questionText: question.question_text,
    questionType: question.question_type,
  };

  // Check required fields
  if (!question.question_text || question.question_text.trim() === '') {
    addIssue({
      ...baseInfo,
      severity: 'error',
      issue: 'Missing question text',
    });
  }

  if (!question.question_type) {
    addIssue({
      ...baseInfo,
      severity: 'error',
      issue: 'Missing question type',
    });
    return;
  }

  if (!question.explanation || question.explanation.trim() === '') {
    addIssue({
      ...baseInfo,
      severity: 'warning',
      issue: 'Missing explanation',
    });
  }

  // Validate based on question type
  switch (question.question_type) {
    case 'multiple_choice':
      validateMultipleChoice(question, baseInfo);
      break;
    case 'fill_blank':
      validateFillBlank(question, baseInfo);
      break;
    case 'true_false':
      validateTrueFalse(question, baseInfo);
      break;
    case 'matching':
      validateMatching(question, baseInfo);
      break;
    case 'short_answer':
      validateShortAnswer(question, baseInfo);
      break;
    default:
      addIssue({
        ...baseInfo,
        severity: 'error',
        issue: `Unknown question type: ${question.question_type}`,
      });
  }
}

function validateMultipleChoice(question: any, baseInfo: any) {
  if (!question.options) {
    addIssue({
      ...baseInfo,
      severity: 'error',
      issue: 'multiple_choice question missing options field',
    });
  } else if (!Array.isArray(question.options)) {
    addIssue({
      ...baseInfo,
      severity: 'error',
      issue: 'options field is not an array',
      details: { type: typeof question.options, value: question.options },
    });
  } else if (question.options.length === 0) {
    addIssue({
      ...baseInfo,
      severity: 'error',
      issue: 'multiple_choice question has empty options array',
    });
  } else if (question.options.length < 2) {
    addIssue({
      ...baseInfo,
      severity: 'warning',
      issue: `multiple_choice question has only ${question.options.length} option(s)`,
      details: { options: question.options },
    });
  } else if (question.options.some((opt: any) => !opt || opt.trim() === '')) {
    addIssue({
      ...baseInfo,
      severity: 'error',
      issue: 'multiple_choice question has empty option(s)',
      details: { options: question.options },
    });
  }

  if (!question.correct_answer) {
    addIssue({
      ...baseInfo,
      severity: 'error',
      issue: 'multiple_choice question missing correct_answer',
    });
  } else if (Array.isArray(question.options) && !question.options.includes(question.correct_answer)) {
    addIssue({
      ...baseInfo,
      severity: 'error',
      issue: 'correct_answer not found in options',
      details: {
        correct_answer: question.correct_answer,
        options: question.options
      },
    });
  }
}

function validateFillBlank(question: any, baseInfo: any) {
  if (!question.correct_answer) {
    addIssue({
      ...baseInfo,
      severity: 'error',
      issue: 'fill_blank question missing correct_answer',
    });
  } else if (typeof question.correct_answer !== 'string') {
    addIssue({
      ...baseInfo,
      severity: 'error',
      issue: 'fill_blank correct_answer must be a string',
      details: { type: typeof question.correct_answer },
    });
  }
}

function validateTrueFalse(question: any, baseInfo: any) {
  if (question.correct_answer === null || question.correct_answer === undefined) {
    addIssue({
      ...baseInfo,
      severity: 'error',
      issue: 'true_false question missing correct_answer',
    });
  } else if (typeof question.correct_answer !== 'boolean') {
    addIssue({
      ...baseInfo,
      severity: 'error',
      issue: 'true_false correct_answer must be a boolean',
      details: { type: typeof question.correct_answer, value: question.correct_answer },
    });
  }
}

function validateMatching(question: any, baseInfo: any) {
  if (!question.correct_answer) {
    addIssue({
      ...baseInfo,
      severity: 'error',
      issue: 'matching question missing correct_answer (pairs)',
    });
  } else if (!Array.isArray(question.correct_answer)) {
    addIssue({
      ...baseInfo,
      severity: 'error',
      issue: 'matching pairs must be an array',
      details: { type: typeof question.correct_answer },
    });
  } else if (question.correct_answer.length === 0) {
    addIssue({
      ...baseInfo,
      severity: 'error',
      issue: 'matching question has empty pairs array',
    });
  } else {
    // Validate each pair
    question.correct_answer.forEach((pair: any, index: number) => {
      if (!pair || typeof pair !== 'object') {
        addIssue({
          ...baseInfo,
          severity: 'error',
          issue: `matching question pair ${index} is invalid`,
          details: { pair },
        });
      } else {
        if (!pair.left || pair.left.trim() === '') {
          addIssue({
            ...baseInfo,
            severity: 'error',
            issue: `matching question pair ${index} has empty left value`,
            details: { pair },
          });
        }
        if (!pair.right || pair.right.trim() === '') {
          addIssue({
            ...baseInfo,
            severity: 'error',
            issue: `matching question pair ${index} has empty right value`,
            details: { pair },
          });
        }
      }
    });
  }
}

function validateShortAnswer(question: any, baseInfo: any) {
  if (!question.correct_answer) {
    addIssue({
      ...baseInfo,
      severity: 'error',
      issue: 'short_answer question missing correct_answer',
    });
  } else if (typeof question.correct_answer !== 'string') {
    addIssue({
      ...baseInfo,
      severity: 'error',
      issue: 'short_answer correct_answer must be a string',
      details: { type: typeof question.correct_answer },
    });
  }
}

// Run validation
validateDatabase().catch(error => {
  console.error('❌ Validation script failed:', error);
  process.exit(1);
});
