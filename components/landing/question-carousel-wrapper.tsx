import { getQuestionSets } from "@/lib/actions/question-sets";
import { getQuestions } from "@/lib/actions/questions";
import { QuestionCarousel } from "./question-carousel";

export async function QuestionCarouselWrapper() {
  // Get question sets
  const questionSetsResult = await getQuestionSets();
  
  if (!questionSetsResult.success || questionSetsResult.questionSets.length === 0) {
    return null;
  }

  // Find the Jesus question set (prefer Jesus over Bible Basics)
  const jesusQuestionSet = questionSetsResult.questionSets.find(
    (set) => set.tier === "free" && set.name.toLowerCase().includes("jesus")
  );

  const questionSet = jesusQuestionSet || questionSetsResult.questionSets.find(
    (set) => set.tier === "free"
  ) || questionSetsResult.questionSets[0];

  // Fetch more questions to find ones with verse references
  // We'll fetch up to 20 questions to find 3 with verse references
  const questionsResult = await getQuestions(questionSet.id, 1, 20);

  if (!questionsResult.success || questionsResult.questions.length === 0) {
    return null;
  }

  // Filter to only questions with verse references
  const questionsWithVerses = questionsResult.questions.filter(
    (q) => q.scriptureReference && q.scriptureReference.trim().length > 0
  );

  if (questionsWithVerses.length === 0) {
    return null;
  }

  // Find the "Jesus wept" / "shortest verse" question
  const jesusWeptQuestion = questionsWithVerses.find(
    (q) => q.questionText.toLowerCase().includes("shortest verse") || 
           q.questionText.toLowerCase().includes("jesus wept")
  );

  // Build the final array: start with Jesus wept question, then add 2 more
  let finalQuestions: typeof questionsWithVerses = [];
  
  if (jesusWeptQuestion) {
    finalQuestions.push(jesusWeptQuestion);
    // Add 2 more questions (excluding the Jesus wept one)
    const otherQuestions = questionsWithVerses.filter(
      (q) => q.id !== jesusWeptQuestion.id
    ).slice(0, 2);
    finalQuestions.push(...otherQuestions);
  } else {
    // If we can't find the Jesus wept question, just take first 3
    finalQuestions = questionsWithVerses.slice(0, 3);
  }

  // Ensure we have exactly 3 questions
  if (finalQuestions.length < 3 && questionsWithVerses.length >= 3) {
    // Fill up to 3 if we have more available
    const needed = 3 - finalQuestions.length;
    const usedIds = new Set(finalQuestions.map(q => q.id));
    const additional = questionsWithVerses
      .filter(q => !usedIds.has(q.id))
      .slice(0, needed);
    finalQuestions.push(...additional);
  }

  return <QuestionCarousel questions={finalQuestions.slice(0, 3)} />;
}

