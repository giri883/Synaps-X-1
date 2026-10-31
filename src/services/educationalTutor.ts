/**
 * Educational Tutor Service for Synapse X Central AI
 * Generates structured, high-quality lessons following the pedagogical framework:
 * - Simple Intuitive Definition
 * - Step-by-Step Conceptual Breakdown
 * - Real-World Analogies & Practical Examples
 * - Key Mathematical Formulas / Code Snippets (with variable explanations)
 * - Summary & Practice Questions
 */

export function generateTutorExplanation(topic: string, rawPrompt: string, userProfile?: any): string {
  const lower = (topic + ' ' + rawPrompt).toLowerCase();
  const studentName = userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'Student';

  // 1. THERMODYNAMICS (General / Comprehensive)
  if (lower.includes('thermodynamic') && !lower.includes('first law')) {
    return `### 🌡️ Understanding Thermodynamics: A Complete Lesson

Hello ${studentName}! Let's break down **Thermodynamics** step-by-step from fundamental principles to real-world applications.

---

#### 1. 🎯 What is Thermodynamics?
**Thermodynamics** (from Greek *therme* = heat, *dynamis* = power) is the branch of physics and engineering that studies how **heat**, **work**, **temperature**, and **energy** interact and convert from one form to another.

In simple terms: It is the science of how heat moves and how we can harness heat to do useful work (like driving a car, powering a jet engine, or keeping food cool in a refrigerator).

---

#### 2. 🔬 The Four Foundational Laws

Thermodynamics is governed by four fundamental laws:

1. **Zeroth Law (Thermal Equilibrium & Temperature)**:
   - *If System A is in thermal equilibrium with System B, and B is in equilibrium with System C, then A is in equilibrium with C.*
   - **Why it matters**: This defines what a **thermometer** actually measures!

2. **First Law (Conservation of Energy)**:
   - *Energy cannot be created or destroyed; it can only change form.*
   - **Equation**: 
     $$\\Delta U = Q - W$$
     - $\\Delta U$ = Change in the system's internal energy (Joules)
     - $Q$ = Heat added **to** the system (Joules)
     - $W$ = Work done **by** the system on its surroundings (Joules)

3. **Second Law (Entropy & Direction of Processes)**:
   - *The total entropy (disorder) of an isolated system always increases over time ($\\Delta S \\ge 0$).*
   - Heat flows **spontaneously** only from hotter bodies to colder bodies — never the reverse without external work!

4. **Third Law (Absolute Zero)**:
   - *As temperature approaches absolute zero ($0\\text{ K} = -273.15^\\circ\\text{C}$), the entropy of a pure crystalline substance approaches zero ($S \\to 0$).*
   - It is physically impossible to reach absolute zero in a finite number of steps.

---

#### 3. 💡 Everyday Analogy: The Cup of Hot Chai
Imagine holding a steaming cup of tea in a cool classroom:
- **Heat Transfer**: Thermal energy flows naturally from the hot chai ($80^\\circ\\text{C}$) into the cooler surrounding air ($24^\\circ\\text{C}$).
- **Why doesn't the cold air heat the tea back up?** That would satisfy the First Law (energy conserved), but it violates the **Second Law** (entropy must increase). Nature requires heat to disperse.

---

#### 4. 📐 Key Mathematical Formulas
| Concept | Formula | Meaning |
| :--- | :--- | :--- |
| **First Law** | $\\Delta U = Q - W$ | Internal energy change = Heat absorbed minus Work done |
| **Heat Transfer** | $Q = m \\cdot c \\cdot \\Delta T$ | Heat = mass $\\times$ specific heat capacity $\\times$ temperature change |
| **Entropy Change** | $dS = \\frac{dQ_{rev}}{T}$ | Infinitesimal entropy change under reversible process |
| **Carnot Max Efficiency** | $\\eta_{max} = 1 - \\frac{T_C}{T_H}$ | Maximum theoretical efficiency of any heat engine |

---

#### 5. 📝 Quick Summary
- **Energy is conserved** (First Law).
- **Quality of energy degrades / entropy increases** (Second Law).
- **Absolute zero cannot be reached** (Third Law).

#### 🧠 Self-Check Practice Questions:
1. *If 500 J of heat is added to a gas piston and the gas expands doing 200 J of work on the piston, what is the change in internal energy $\\Delta U$?* *(Answer: $500 - 200 = 300\\text{ J}$)*
2. *Why can no real heat engine ever be 100% efficient?*

Feel free to ask me to deep-dive into any specific law or solve a problem together!`;
  }

  // 2. FIRST LAW OF THERMODYNAMICS
  if (lower.includes('first law of thermodynamic')) {
    return `### ⚡ The First Law of Thermodynamics: Conservation of Energy

Hello ${studentName}! Let's master the **First Law of Thermodynamics**.

---

#### 1. 🎯 Core Definition
The **First Law of Thermodynamics** is the law of **conservation of energy** applied to thermal systems:
> *The net change in internal energy of a closed system is equal to the heat transferred into the system minus the work done by the system on its surroundings.*

$$\\Delta U = Q - W$$

---

#### 2. 🔬 Understanding the Variables & Sign Conventions
- **$\\Delta U$ (Internal Energy)**: The total kinetic + potential energy of all molecules in the system.
  - $\\Delta U > 0$: System heats up / gains internal energy.
  - $\\Delta U < 0$: System cools down / loses internal energy.
- **$Q$ (Heat)**:
  - $Q > 0$: Heat added **to** the system (endothermic).
  - $Q < 0$: Heat released **from** the system (exothermic).
- **$W$ (Work)**:
  - $W > 0$: Work done **by** the system (expansion, e.g., gas pushes a piston outward).
  - $W < 0$: Work done **on** the system (compression, e.g., you push the piston inward).

---

#### 3. 💡 Concrete Example: The Bicycle Tire Pump
When you vigorously pump air into a bicycle tire:
1. You perform work $W$ **on** the gas ($W$ is negative from the gas's perspective).
2. The compression happens quickly, so minimal heat $Q$ escapes immediately.
3. According to $\\Delta U = Q - W$, since $W < 0$, $\\Delta U = 0 - (-W) = +W$.
4. **Result**: The base of the pump feels noticeably warm in your hand because your mechanical work directly increased the gas's internal energy!

---

#### 4. 📐 Special Thermodynamic Processes
- **Isothermal** (Constant Temperature, $\\Delta T = 0 \\implies \\Delta U = 0$):
  $$Q = W$$
  (All heat absorbed goes entirely into doing work).
- **Adiabatic** (No heat exchange, $Q = 0$):
  $$\\Delta U = -W$$
- **Isochoric** (Constant Volume, $\\Delta V = 0 \\implies W = 0$):
  $$\\Delta U = Q$$
  (All heat added increases internal energy and temperature).
- **Isobaric** (Constant Pressure, $P = \\text{const}$):
  $$W = P \\cdot \\Delta V$$

---

#### 5. 🧠 Self-Check Question
*A sealed cylinder with a movable piston absorbs $850\\text{ J}$ of heat while expanding and performing $320\\text{ J}$ of mechanical work. What is the change in internal energy?*
$$\\Delta U = Q - W = 850 - 320 = 530\\text{ J}$$`;
  }

  // 3. HEAT VS TEMPERATURE
  if (lower.includes('heat') && lower.includes('temperature')) {
    return `### 🔥 Heat vs. Temperature: The Critical Distinction

Hello ${studentName}! Confusing **Heat** and **Temperature** is one of the most common pitfalls in science. Let's make the difference crystal clear.

---

#### 1. 🎯 Direct Comparison
| Feature | 🌡️ Temperature | ♨️ Heat |
| :--- | :--- | :--- |
| **Definition** | The **average kinetic energy** of individual molecules in a substance. | The **total thermal energy transferred** between substances due to a temperature difference. |
| **Type of Property** | Intensive property (does NOT depend on mass or sample size). | Extensive property (depends on mass, material, and temperature change). |
| **SI Unit** | Kelvin ($\\text{K}$) or Celsius ($^\\circ\\text{C}$) | Joules ($\\text{J}$) or Calories ($\\text{cal}$) |
| **Instrument** | Measured directly with a **Thermometer**. | Calculated via **Calorimetry** ($Q = mc\\Delta T$). |
| **Direction** | Indicates thermal state. | Flows spontaneously from higher temperature to lower temperature. |

---

#### 2. 💡 The Teaspoon vs. The Bathtub Analogy
- A **teaspoon of boiling water** ($100^\\circ\\text{C}$):
  - **High temperature**: The molecules are vibrating extremely fast.
  - **Low heat capacity / low total energy**: It only contains a few drops of water, so it cannot warm up a cold room.
- A **lukewarm swimming pool** ($28^\\circ\\text{C}$):
  - **Lower temperature**: Molecules are moving slower on average than in the boiling water.
  - **Massive amount of heat**: Because of its huge mass ($100,000\\text{ kg}$), it stores vastly more total thermal energy!

---

#### 3. 📐 Mathematical Relationship
Heat transfer causes temperature change according to:
$$Q = m \\cdot c \\cdot \\Delta T$$
- $Q$ = Heat transferred (Joules)
- $m$ = Mass (kg)
- $c$ = Specific heat capacity ($\\text{J}/(\\text{kg}\\cdot\\text{K})$)
- $\\Delta T = T_{final} - T_{initial}$ = Temperature change

---

#### 4. 📝 Quick Rule of Thumb
- **Temperature** is *how hot or cold* something is.
- **Heat** is *the energy that moves* because of that temperature difference.`;
  }

  // 4. SQL JOINS
  if (lower.includes('sql join') || lower.includes('sql joins') || (lower.includes('sql') && lower.includes('join'))) {
    return `### 🗄️ SQL Joins Explained Simply: The Complete Guide

Hello ${studentName}! In relational databases, data is split across multiple normalized tables. **SQL JOINs** allow you to combine records from two or more tables based on a related column.

---

#### 1. 🎯 The Four Essential Types of JOINs
Let's consider two sample tables:
- **\`Students\`**: \`id\`, \`name\`, \`course_id\`
- **\`Courses\`**: \`id\`, \`course_title\`

\`\`\`
Students:                     Courses:
id | name    | course_id      id | course_title
1  | Saran   | 101            101| Data Structures
2  | Priya   | 102            102| Operating Systems
3  | Alex    | NULL           103| Machine Learning
\`\`\`

---

#### 2. 🔬 Syntax & How Each JOIN Works

##### A. INNER JOIN (Only matching records)
Returns rows when there is a match in **both** tables.
\`\`\`sql
SELECT Students.name, Courses.course_title
FROM Students
INNER JOIN Courses ON Students.course_id = Courses.id;
\`\`\`
*Result:*
- Saran $\\to$ Data Structures
- Priya $\\to$ Operating Systems
*(Alex is omitted because course_id is NULL; Machine Learning is omitted because no student has enrolled yet).*

##### B. LEFT JOIN (All left rows + matches from right)
Returns **all** rows from the left table, with \`NULL\` where there is no right-table match.
\`\`\`sql
SELECT Students.name, Courses.course_title
FROM Students
LEFT JOIN Courses ON Students.course_id = Courses.id;
\`\`\`
*Result:*
- Saran $\\to$ Data Structures
- Priya $\\to$ Operating Systems
- Alex $\\to$ \`NULL\`

##### C. RIGHT JOIN (All right rows + matches from left)
Returns **all** rows from the right table, with \`NULL\` for unmatched left rows.
\`\`\`sql
SELECT Students.name, Courses.course_title
FROM Students
RIGHT JOIN Courses ON Students.course_id = Courses.id;
\`\`\`
*Result:*
- Saran $\\to$ Data Structures
- Priya $\\to$ Operating Systems
- \`NULL\` $\\to$ Machine Learning

##### D. FULL OUTER JOIN (Everything from both)
Combines all rows from both tables, filling \`NULL\` on either side where no match exists.

---

#### 3. 💡 Visual Memory Trick
- **INNER**: The intersection ($A \\cap B$).
- **LEFT**: Everything in Circle A ($A$), with Circle B details when available.
- **RIGHT**: Everything in Circle B ($B$), with Circle A details when available.
- **FULL OUTER**: The union ($A \\cup B$).

---

#### 4. 🧠 Practice Question
*Which JOIN would you use to list all registered students, even those who have not enrolled in any course yet?*
*(Answer: \`LEFT JOIN\` from Students to Courses).*`;
  }

  // 5. RECURSION
  if (lower.includes('recursion') || lower.includes('recursive')) {
    return `### 🔁 Mastering Recursion: Concept, Stack & Code

Hello ${studentName}! Let's understand **Recursion** intuitively and systematically.

---

#### 1. 🎯 What is Recursion?
In Computer Science, **recursion** is a programming technique where a function solves a problem by **calling itself** on smaller instances of the same problem.

---

#### 2. 🔬 The Two Invariant Rules of Every Recursive Function
Every correct recursive function must have two components:
1. **The Base Case**: The terminating condition that returns a value directly without making further recursive calls. (Without this, you get a \`StackOverflowError\`!).
2. **The Recursive Step**: The logic that reduces the problem towards the base case and calls itself.

---

#### 3. 💡 Classic Example: Factorial ($N!$)
Mathematically:
- $0! = 1$ (Base Case)
- $N! = N \\times (N - 1)!$ (Recursive Step)

\`\`\`typescript
function factorial(n: number): number {
  // 1. Base Case
  if (n <= 1) {
    return 1;
  }
  // 2. Recursive Step
  return n * factorial(n - 1);
}
\`\`\`

#### 4. 🥞 The Call Stack Visualized
When you call \`factorial(3)\`:
\`\`\`
factorial(3) calls factorial(2)  [Pushed onto Call Stack]
  factorial(2) calls factorial(1) [Pushed onto Call Stack]
    factorial(1) returns 1        [Base Case Reached! Stack Unwinds]
  factorial(2) returns 2 * 1 = 2
factorial(3) returns 3 * 2 = 6
\`\`\`

---

#### 5. ⏱️ Complexity Considerations
- **Time Complexity**: Proportional to total recursive calls ($O(N)$ for factorial, $O(2^N)$ for naive Fibonacci).
- **Space Complexity**: Memory used on the call stack is $O(\\text{max recursion depth})$. Always watch out for stack overflow when $N > 10,000$.`;
  }

  // 6. GENERAL COMPREHENSIVE TUTOR TEMPLATE FOR ANY OTHER TOPIC
  const cleanTitle = topic.charAt(0).toUpperCase() + topic.slice(1);
  return `### 📚 Understanding ${cleanTitle}: Concept & Breakdown

Hello ${studentName}! Let's break down **${cleanTitle}** step-by-step.

---

#### 1. 🎯 Core Definition
**${cleanTitle}** is a fundamental concept. At its core, it represents how systems, algorithms, or physical phenomena operate under structured rules.

---

#### 2. 🔬 Key Principles & Breakdown
When studying **${cleanTitle}**, consider these core pillars:
1. **The Foundation**: How the basic state or underlying structure is initialized and defined.
2. **The Mechanism**: The step-by-step transition or transformation rules that govern behavior.
3. **The Invariants**: What properties must remain true throughout the operation or process.

---

#### 3. 💡 Real-World Analogy
Think of **${cleanTitle}** like an organized assembly line or an automated relay:
- Each stage receives input from the preceding phase.
- It performs a specialized transformation according to invariant rules.
- It passes the refined output to the next stage, minimizing friction and maximizing clarity.

---

#### 4. 📝 Practical Summary & Key Takeaways
- Always identify the **base inputs** and **expected outputs**.
- Pay attention to boundary conditions, edge cases, and constraints.
- Test your understanding by walking through a simple example with pen and paper!

Would you like me to dive deeper into any specific subtopic, provide code examples, or give you a practice problem on **${cleanTitle}**?`;
}
