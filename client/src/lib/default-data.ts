import { ThoughtPattern, Meditation } from "@/types";

// Default thought patterns
export const defaultThoughtPatterns: ThoughtPattern[] = [
  {
    id: 1,
    name: "Catastrophizing",
    description: "Believing something is far worse than it actually is",
    examples: [
      "If I fail this test, my whole future is ruined",
      "My heart is racing, I must be having a heart attack"
    ],
    reframeStrategies: [
      "Consider the actual likelihood of the worst-case scenario",
      "Ask yourself what a friend would say about this situation",
      "Focus on what you can control rather than what you can't"
    ]
  },
  {
    id: 2,
    name: "Mind Reading",
    description: "Assuming you know what others are thinking without evidence",
    examples: [
      "She didn't respond to my text, she must be mad at me",
      "Everyone at the party thinks I'm boring"
    ],
    reframeStrategies: [
      "Challenge the assumption by seeking evidence",
      "Consider alternative explanations for the behavior",
      "Ask directly instead of assuming"
    ]
  },
  {
    id: 3,
    name: "Black & White Thinking",
    description: "Seeing things in absolute, all-or-nothing terms",
    examples: [
      "Either I do this perfectly or I'm a complete failure",
      "If you're not with me, you're against me"
    ],
    reframeStrategies: [
      "Look for the gray areas and middle ground",
      "Use a scale from 0-100 instead of all-or-nothing",
      "Accept that most things exist on a spectrum"
    ]
  },
  {
    id: 4,
    name: "Emotional Reasoning",
    description: "Believing that what you feel must be true",
    examples: [
      "I feel stupid, so I must be stupid",
      "I feel like a burden, so I must be bothering everyone"
    ],
    reframeStrategies: [
      "Identify the emotion and separate it from facts",
      "Ask what evidence exists beyond the feeling",
      "Consider how you'd evaluate the situation without the emotion"
    ]
  }
];

// Default meditations
export const defaultMeditations: Meditation[] = [
  {
    id: 1,
    title: "Sleep Well",
    description: "A gentle meditation to help you drift into restful sleep",
    duration: 300, // 5 minutes
    category: "Sleep",
    audioUrl: undefined
  },
  {
    id: 2,
    title: "Anxiety Relief",
    description: "Calm your mind and reduce anxiety with this short practice",
    duration: 180, // 3 minutes
    category: "Anxiety",
    audioUrl: undefined
  },
  {
    id: 3,
    title: "Morning Focus",
    description: "Start your day with clarity and intention",
    duration: 240, // 4 minutes
    category: "Focus",
    audioUrl: undefined
  },
  {
    id: 4,
    title: "Gratitude Practice",
    description: "Cultivate appreciation for the good in your life",
    duration: 300, // 5 minutes
    category: "Gratitude",
    audioUrl: undefined
  }
];
