/**
 * Get placeholder question sets for display
 * For MVP, we use placeholders. In production, these will be fetched from the database.
 */
export function getPlaceholderQuestionSets() {
  return [
    {
      id: "gospels",
      title: "Gospels: Life of Jesus",
      description: "Questions about the life, ministry, and teachings of Jesus Christ",
      question_count: 20,
      tier_required: "free" as const,
      is_published: true,
      isComingSoon: false,
    },
    {
      id: "old-testament-heroes",
      title: "Old Testament Heroes",
      description: "Stories of faith, courage, and God's faithfulness in the Old Testament",
      question_count: 20,
      tier_required: "free" as const,
      is_published: false,
      isComingSoon: true,
    },
    {
      id: "miracles-parables",
      title: "Miracles & Parables",
      description: "The miracles Jesus performed and the parables He taught",
      question_count: 20,
      tier_required: "pro" as const,
      is_published: false,
      isComingSoon: true,
    },
    {
      id: "new-testament-church",
      title: "New Testament Church",
      description: "The early church, apostles, and the spread of the Gospel",
      question_count: 20,
      tier_required: "pro" as const,
      is_published: false,
      isComingSoon: true,
    },
    {
      id: "bible-basics",
      title: "Bible Basics",
      description: "Fundamental Bible knowledge for beginners",
      question_count: 20,
      tier_required: "free" as const,
      is_published: false,
      isComingSoon: true,
    },
  ];
}

