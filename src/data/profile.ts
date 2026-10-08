export const profile = {
  name: 'Benny Ngo',
  email: 'bkvngo@gmail.com',
  location: 'Santa Clara, California',
  headline: 'Building useful software, from data to interface.',
  introduction: 'I’m a computer science master’s student at Georgia Tech studying AI. My projects include live sports dashboards, machine learning pipelines, and full-stack web apps.',
  availability: 'Seeking software engineering & AI/ML internships',
  github: 'https://github.com/NgoBenny',
  linkedin: 'https://www.linkedin.com/in/benny-ngo01/',
  about: [
    'I like working on both the model and the app around it. My NBA project follows win probabilities as a game unfolds; my UFC project estimates them before a fight. Both give me a way to work with sports data and build an interface people can explore.',
    'I earned my computer science degree at San José State and now study artificial intelligence at Georgia Tech. I’ve also taught Python and tutored computer science. Explaining code to students has helped me write clearer explanations in my own projects.',
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
