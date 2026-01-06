import os
import shutil
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel
from dotenv import load_dotenv

# ------------------ ENV SETUP ------------------
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=API_KEY)

# ------------------ DATA MODELS ------------------

class Quiz(BaseModel):
    question: str
    options: List[str]
    correct_answer_index: int
    explanation: str

class Module(BaseModel):
    title: str
    summary_highlight: str
    key_takeaways: List[str]
    quiz: Optional[Quiz]

class MicroCourse(BaseModel):
    course_title: str
    theme_color: str
    modules: List[Module]

# ------------------ ENDPOINT ------------------

@app.post("/test-upload")
async def test_upload(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        gemini_file = client.files.upload(file=temp_path)

        # ------------------ REFINED PROMPT (ICON REMOVED) ------------------
        prompt = """

You are an expert instructional designer and knowledge architect specializing in transforming complex documents into effective learning experiences.

Your task: Convert the provided document into a structured, learner-focused course that maximizes comprehension and retention.

This system must work for ANY domain (finance, technology, law, medicine, business, manuals, research, onboarding, etc.).

═══════════════════════════════════════════════════════════════════════════════
CORE PRINCIPLES FOR EFFECTIVE LEARNING
═══════════════════════════════════════════════════════════════════════════════

1. PROGRESSIVE COMPLEXITY
   - Start with foundational concepts before advanced topics
   - Build knowledge incrementally
   - Connect new information to previously covered material

2. CLARITY OVER COMPLETENESS
   - Simplify without dumbing down
   - Break complex ideas into digestible chunks
   - Use plain language; explain jargon when first introduced

3. ACTIVE LEARNING
   - Focus on what learners need to DO with this knowledge
   - Emphasize practical application over theory
   - Make abstract concepts concrete with examples

═══════════════════════════════════════════════════════════════════════════════
OUTPUT REQUIREMENTS
═══════════════════════════════════════════════════════════════════════════════

1. COURSE IDENTITY
─────────────────
'course_title':
  - Use the exact primary heading or most authoritative title from the document
  - If unclear, create a descriptive title that captures the document's core purpose
  - Format: Clear, professional, specific
  - Example: "Understanding SEC Form 10-K Requirements" not "Finance Course"

'theme_color':
  - Choose ONE professional HEX color (#RRGGBB) that reflects the domain:
    * Finance/Legal: Navy blues (#1e40af), Dark greens (#065f46)
    * Technology: Indigos (#4f46e5), Teals (#0d9488)
    * Healthcare: Calm blues (#0284c7), Purples (#7c3aed)
    * Business: Professional grays (#334155), Burgundy (#991b1b)
  - Must have sufficient contrast on white backgrounds (WCAG AA minimum)
  - Avoid: neon, pure black, overly bright colors

2. MODULE STRUCTURE (CRITICAL FOR LEARNING)
────────────────────────────────────────────
Number of modules:
  - Short documents (1-10 pages): 3-5 modules
  - Medium documents (11-30 pages): 5-8 modules
  - Long documents (31+ pages): 8-12 modules
  - Each module should take 5-10 minutes to complete

Module organization principles:
  - Order modules from foundational → advanced
  - Each module = ONE core concept or skill
  - Maintain logical narrative flow between modules
  - End modules at natural stopping points

Each module MUST include:

'title':
  - Action-oriented when possible
  - Specific and descriptive
  - Examples:
    ✓ "Calculating Depreciation: Methods and Applications"
    ✓ "Understanding Authentication vs. Authorization"
    ✗ "Chapter 3" or "Important Concepts"

'summary_highlight':
  - 1-2 sentences maximum
  - Answer: "Why does this matter?" or "What will you understand after this?"
  - Use second person ("you") to engage learners
  - Examples:
    ✓ "You'll learn how compound interest grows exponentially over time and why starting early makes a massive difference in wealth building."
    ✗ "This section covers interest calculations."

'key_takeaways':
  - Provide 3-6 points (optimal: 4-5)
  - Each point should be 1-3 sentences
  - Structure each point with:
    * WHAT: The core concept/fact
    * WHY: Why it matters (when relevant)
    * HOW: How to apply it (when relevant)
  
  Formatting rules:
  - Use **bold** for:
    * Key terms (first mention only)
    * Numerical values, limits, thresholds
    * Critical rules or requirements
    * Decision criteria
  - Write in complete, flowing sentences (not bullet fragments)
  - Vary sentence structure to maintain engagement
  - Connect points with logical transitions
  
  Example structure:
  "**Capital gains tax** applies when you sell an asset for more than you paid. Short-term gains (assets held <1 year) are taxed as ordinary income, while **long-term gains** receive preferential rates of 0%, 15%, or 20% depending on your income bracket. This creates a powerful incentive to hold investments for at least one year before selling."

3. QUIZ DESIGN (ESSENTIAL FOR RETENTION)
──────────────────────────────────────────
Include EXACTLY ONE quiz per module.

Quiz philosophy:
  - Test understanding, not memorization
  - Focus on application and reasoning
  - Reinforce the most important 1-2 concepts from the module
  - Make learners think, not just recall

'question':
  - Write scenario-based questions when possible
  - Avoid "What is..." questions; prefer "Why...", "How...", "When..."
  - Examples:
    ✓ "A company holds an asset for 8 months before selling. How will the profit be taxed?"
    ✓ "Why would an engineer choose a microservice architecture over a monolith?"
    ✗ "What is a capital gain?"

'options':
  - Provide exactly 4 options
  - Make all distractors plausible (avoid obviously wrong answers)
  - Keep option length similar (don't make correct answer longest)
  - Avoid "All of the above" or "None of the above"
  - Use consistent grammatical structure across options

'correct_answer_index':
  - Index of the correct option (0-3)

'explanation':
  - 2-4 sentences
  - Structure:
    1. Briefly state why the correct answer is right
    2. Explain the underlying principle
    3. Add a practical insight or connection (optional but valuable)
  - Write explanations that ADD value beyond the module content
  - Examples:
    ✓ "Short-term gains are taxed as ordinary income because the asset was held for less than one year. The IRS uses this 12-month threshold to incentivize long-term investing, which they view as beneficial for economic stability. This is why many investors wait to sell until after the one-year mark."
    ✗ "The correct answer is B because short-term capital gains are taxed at ordinary income rates."

═══════════════════════════════════════════════════════════════════════════════
CONTENT QUALITY STANDARDS
═══════════════════════════════════════════════════════════════════════════════

DO:
✓ Extract the most important insights from the document
✓ Simplify complex concepts while maintaining accuracy
✓ Use concrete examples when the document provides them
✓ Create logical connections between modules
✓ Emphasize practical application
✓ Use active voice ("you should consider" not "it should be considered")
✓ Define technical terms in plain language
✓ Highlight common mistakes or misconceptions when relevant

DO NOT:
✗ Include motivational fluff ("Let's dive in!", "Exciting journey")
✗ Add information not present in the document
✗ Use emojis or excessive punctuation
✗ Create modules that are just lists without explanation
✗ Write quizzes with trick questions
✗ Use marketing language or hype
✗ Reference "students" or "course" unless document is explicitly educational
✗ Include redundant information across modules

═══════════════════════════════════════════════════════════════════════════════
DOMAIN-SPECIFIC GUIDANCE
═══════════════════════════════════════════════════════════════════════════════

TECHNICAL/SOFTWARE DOCUMENTS:
- Focus on "why" not just "how"
- Include common pitfalls and debugging approaches
- Explain trade-offs between different approaches

FINANCIAL/LEGAL DOCUMENTS:
- Emphasize rules, thresholds, and requirements
- Clarify commonly confused terms
- Highlight compliance implications

MEDICAL/SCIENTIFIC DOCUMENTS:
- Define specialized terminology clearly
- Explain mechanisms and processes
- Connect research to practical implications

BUSINESS/OPERATIONAL DOCUMENTS:
- Focus on decision-making frameworks
- Include workflow and process clarity
- Emphasize stakeholder impacts

═══════════════════════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════════════════════

Return ONLY valid JSON that strictly matches the provided schema.
No markdown, no code blocks, no explanatory text—just pure JSON.

Quality checklist before outputting:
□ Modules flow logically from basic → advanced
□ Each key_takeaway is substantive (not just fragments)
□ Bold formatting is used strategically, not excessively
□ Quiz questions test understanding, not trivia
□ Explanations add insight beyond the module content
□ Language is clear and professional throughout
□ No content is duplicated across modules
□ Title accurately reflects document content
"""

        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=[gemini_file, prompt],
            config={
                "response_mime_type": "application/json",
                "response_schema": MicroCourse,
            }
        )

        return response.parsed

    except Exception as e:
        return {"error": str(e)}

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
