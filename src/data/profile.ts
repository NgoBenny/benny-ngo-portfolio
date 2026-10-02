export const profile = {
  name: 'Benny Ngo',
  email: 'bkvngo@gmail.com',
  location: 'Santa Clara, California',
  headline: 'Building useful software, from data to interface.',
  introduction: 'Computer science master’s student at Georgia Tech focused on software engineering and applied AI. I build real-time applications, machine learning pipelines, and full-stack products.',
  availability: 'Seeking software engineering & AI/ML internships',
  github: 'https://github.com/NgoBenny',
  linkedin: 'https://www.linkedin.com/in/benny-ngo01/',
  about: [
    'I like the whole journey: turning a question into a model, connecting that model to an application, and making the result useful to someone. Sports analytics is one place I explore that intersection—through live NBA probabilities and pre-fight UFC predictions.',
    'I earned my computer science degree at San José State and am now pursuing a master’s at Georgia Tech, specializing in artificial intelligence. Teaching Python and tutoring computer science taught me to make complicated ideas easier to understand. I bring that same care to the software I build.',
  ],
  education: [
    { institution: 'Georgia Institute of Technology', qualification: 'M.S. Computer Science · Artificial Intelligence', date: 'Expected May 2028' },
    { institution: 'San José State University', qualification: 'B.S. Computer Science · GPA 3.83', date: 'May 2025' },
  ],
  experience: [
    { role: 'Computer Science Tutor', organization: 'San José State University', date: 'Jan — May 2025', description: 'Helped students work through data structures, programming fundamentals, and debugging in one-on-one and group sessions.' },
    { role: 'Python Instructor', organization: 'Futurebytes', date: 'Jun — Aug 2024', description: 'Taught foundational and advanced Python, developing exercises and projects for students with different levels of experience.' },
  ],
  skills: [
    { title: 'Programming languages', items: ['Python', 'TypeScript', 'JavaScript', 'Java', 'C / C++', 'C#', 'SQL', 'HTML / CSS'] },
    { title: 'Applications & game development', items: ['React', 'Next.js', 'Node.js', 'Flask', 'Tailwind CSS', 'Unity', 'REST / JSON APIs', 'WebSockets'] },
    { title: 'Data & machine learning', items: ['PyTorch', 'scikit-learn', 'XGBoost', 'Pandas / NumPy', 'Matplotlib', 'Feature engineering', 'Chronological evaluation', 'Model calibration', 'Data pipelines'] },
    { title: 'AI & developer workflows', items: ['OpenAI / Anthropic APIs', 'RAG pipelines', 'Vector databases', 'MCP servers', 'Prompt engineering', 'Agent skills', 'Claude Code / Codex'] },
    { title: 'Databases & persistence', items: ['PostgreSQL', 'MySQL', 'SQLite', 'MongoDB', 'Prisma', 'Relational data modeling'] },
    { title: 'Engineering & delivery', items: ['Git / GitHub', 'Docker', 'AWS / Azure', 'Vercel', 'Linux / Unix', 'CI/CD', 'Automated testing', 'Debugging', 'Technical communication'] },
  ],
} as const;
