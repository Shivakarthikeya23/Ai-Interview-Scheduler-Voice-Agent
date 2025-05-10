import { BriefcaseBusinessIcon, Calendar, Code2Icon, ComputerIcon, GroupIcon, LayoutDashboard, List, Puzzle, Settings, User, User2Icon, Users, WalletCards } from "lucide-react";

export const SideBarOptions = [
    {
        name:'Dashboard',
        icon: LayoutDashboard,
        path: '/dashboard',
    },
    {
        name:'Scheduled Interview',
        icon: Calendar,
        path: '/scheduled-interview',
    },
    {
        name:'All Interview',
        icon: List,
        path: '/all-interview',
    },
    {
        name:'Billing',
        icon: WalletCards,
        path: '/billing',
    },
    {
        name:'Settings',
        icon: Settings,
        path: '/settings',
    },
]

export const InterviewType = [
    {
        title: 'Technical',
        icon: Code2Icon
    },
    {
        title: 'Behavioral',
        icon: User2Icon
    },
    {
        title: 'Experience',
        icon: BriefcaseBusinessIcon
    },
    {
        title: 'Problem-Solving',
        icon: Puzzle
    },
    {
        title: 'System Design',
        icon: ComputerIcon
    },
    {
        title: 'Leadership',
        icon: Users
    },
]

export const QUESTIONS_PROMPT = `You are an expert technical interviewer.

---

**Inputs:**

- Job Title: {{{jobTitle}}}
- Job Description: {{{jobDescription}}}
- Interview Type: {{{interviewType}}}
- Interview Duration: {{{duration}}} minutes

---

**Task:**

Based on the above inputs, generate a well-structured, insightful, and appropriately challenging set of interview questions tailored to the candidate and context.

---

**Instructions:**

1. Tailor the **number and complexity** of questions to fit the interview duration.
2. Match the tone and depth based on the **interview type** (e.g., "Technical", "Behavioral", "HR Screening", "System Design").
3. Ensure a balanced range of question categories relevant to the role.
4. Format the output as a **JSON object** with an array named \`interviewQuestions\`.

Each item in the array should follow this structure:

\`\`\`json
{
  "interviewQuestions": [
    {
      "question": "Your interview question here",
      "type": "Technical | Behavioral | Problem Solving | Experience | Leadership"
    }
  ]
}
\`\`\`

---

**Category Descriptions:**

- **Technical**: Frameworks, tools, languages, or platform-specific questions.
- **Problem Solving**: Algorithms, logic, system design, debugging scenarios.
- **Behavioral**: Teamwork, leadership, conflict resolution, communication.
- **Experience**: Role-based challenges, project retrospectives, achievements.
- **Leadership**: Strategy, decision-making, team guidance, accountability.

---

Only output the structured JSON. Avoid any commentary or explanation. Begin the interview with warm-up questions and increase in depth progressively.`;
