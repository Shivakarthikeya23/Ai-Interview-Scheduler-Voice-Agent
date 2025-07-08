import {
  BriefcaseBusinessIcon,
  Calendar,
  Code2Icon,
  ComputerIcon,
  GroupIcon,
  LayoutDashboard,
  List,
  Puzzle,
  Settings,
  User,
  User2Icon,
  Users,
  WalletCards,
  MessageSquare,
  BarChart3
} from "lucide-react";

export const SideBarOptions = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    name: "All Interviews",
    icon: List,
    path: "/all-interview",
  },
  {
    name: "Feedback",
    icon: MessageSquare,
    path: "/feedback",
  },
  {
    name: "Analytics",
    icon: BarChart3,
    path: "/analytics",
  },
  {
    name: "Candidates",
    icon: Users,
    path: "/candidates",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export const InterviewType = [
  {
    title: "Technical",
    icon: Code2Icon,
  },
  {
    title: "Behavioral",
    icon: User2Icon,
  },
  {
    title: "Experience",
    icon: BriefcaseBusinessIcon,
  },
  {
    title: "Problem-Solving",
    icon: Puzzle,
  },
  {
    title: "System Design",
    icon: ComputerIcon,
  },
  {
    title: "Leadership",
    icon: Users,
  },
];

export const QUESTIONS_PROMPT = `You are an expert technical interviewer with years of experience in conducting professional interviews.

---

**Inputs:**

- Job Title: {{{jobTitle}}}
- Job Description: {{{jobDescription}}}
- Interview Type: {{{interviewType}}}
- Interview Duration: {{{duration}}} minutes

---

**Task:**

Based on the above inputs, generate a well-structured, insightful, and appropriately challenging set of interview questions tailored to the candidate and context. The questions should be professional, relevant, and designed to assess the candidate's suitability for the role.

---

**Instructions:**

1. **Question Count**: Generate an appropriate number of questions based on the interview duration:
   - 5 minutes: 2-3 questions
   - 15 minutes: 4-6 questions
   - 30 minutes: 6-8 questions
   - 45 minutes: 8-10 questions
   - 60 minutes: 10-12 questions

2. **Question Difficulty**: Start with warm-up questions and progressively increase complexity.

3. **Question Types**: Match the tone and depth based on the interview type(s) selected.

4. **Relevance**: Ensure all questions are directly relevant to the job description and role requirements.

5. **Balance**: Include a mix of question categories appropriate for the role.

6. **Format**: Return the response as a valid JSON object with the following structure:

\`\`\`json
{
  "interviewQuestions": [
    {
      "question": "Your interview question here",
      "type": "Technical | Behavioral | Problem Solving | Experience | Leadership | System Design"
    }
  ]
}
\`\`\`

---

**Question Category Guidelines:**

- **Technical**: Framework-specific, coding concepts, tools, technologies, best practices
- **Behavioral**: Teamwork, communication, conflict resolution, adaptability, work style
- **Problem Solving**: Algorithms, logical thinking, debugging, analytical approach
- **Experience**: Past projects, achievements, challenges overcome, lessons learned
- **Leadership**: Team management, decision-making, mentoring, strategic thinking
- **System Design**: Architecture, scalability, design patterns, system components

---

**Quality Standards:**
- Questions should be clear and unambiguous
- Avoid yes/no questions; prefer open-ended questions that encourage detailed responses
- Include follow-up potential in each question
- Ensure questions are appropriate for the seniority level implied by the job description
- Make questions practical and scenario-based when possible

Only output the structured JSON. Do not include any commentary, explanations, or additional text outside the JSON structure.`;

export const FEEDBACK_PROMPT = `You are an expert interview assessor with extensive experience in evaluating candidates across various roles and industries.

**Interview Conversation:**
{{conversation}}

**Task:**
Based on the interview conversation above, provide a comprehensive and professional assessment of the candidate's performance. Your evaluation should be fair, constructive, and actionable.

**Instructions:**

1. **Rating Criteria** (Rate each on a scale of 1-10):
   - **technicalSkills**: Knowledge of relevant technologies, frameworks, and concepts
   - **communication**: Clarity of expression, articulation, and professional communication
   - **problemSolving**: Analytical thinking, approach to challenges, and logical reasoning
   - **experience**: Relevant background, practical knowledge, and past achievements

2. **Summary Requirements**:
   - Provide a comprehensive summary highlighting key strengths and areas for improvement
   - Be specific about what the candidate did well and what needs development
   - Focus on actionable insights and professional growth opportunities

3. **Recommendation**:
   - Provide a clear "Hire" or "Do Not Hire" recommendation
   - Include a detailed justification for your recommendation
   - Consider the overall performance and role requirements

**Response Format:**
Return your assessment as a valid JSON object with the following structure:

\`\`\`json
{
  "rating": {
    "technicalSkills": 7,
    "communication": 8,
    "problemSolving": 6,
    "experience": 7
  },
  "summary": "The candidate demonstrated strong communication skills and relevant experience in the field. They showed good understanding of core concepts but struggled with some advanced technical questions. Overall, they presented themselves professionally and showed enthusiasm for the role.",
  "Recommendation": "Hire",
  "RecommendationMsg": "Recommended for hire based on strong foundational skills and good cultural fit. Consider providing additional technical training in advanced areas."
}
\`\`\`

**Evaluation Guidelines:**
- Be objective and fair in your assessment
- Consider the context of the role and required skills
- Provide constructive feedback that helps the candidate improve
- Base ratings on actual performance demonstrated in the conversation
- Ensure recommendations align with the overall assessment
- Focus on specific examples from the conversation when possible

Only output the structured JSON. Do not include any commentary or explanations outside the JSON structure.`;