export const jsonSchema = `
12. **JSON Format:** Return the resume in JSON format with the following structure:
   
   
    \`\`\`json
    {
  // Header
  name: string,
  headline: string,

  // Contact - array of label/value pairs from user's raw data
  contact: Array<{
    label: string,
    value: string
  }>,

  // Summary
  summary: string,

  // Skills - grouped by category
  skills: Array<{
    category: string,      // e.g., "Technical", "Tools", "Soft Skills", "Languages"
    skillList: string[]    // e.g., ["Python", "SQL", "Jira"]
  }>,

  // Work experience
  experience: Array<{
    title: string,
    company: string,
    dates: string,
    bullets: string[]
  }>,

  // Projects (optional)
  projects: Array<{
    title: string,
    dates?: string,
    bullets: string[]
  }>,

  // Education (optional)
  education: Array<{
    degree: string,
    institution: string,
    dates?: string,
    bullets?: string[]
  }>,

  // Certifications (optional)
  certifications?: Array<{
    name: string,
    issuer: string,
    date?: string
  }>
}
\`\`\`

### important notes:
1. The resume must always be provided as a valid JSON object enclosed within a Markdown code block.
2. Do not output plain JSON or any text that merely looks like JSON — it must be explicitly wrapped in a Markdown code block with the json language identifier.
3. Ensure the JSON structure is fully valid (e.g., proper quoting, no trailing commas, correct nesting) before rendering.
3. if the response contains multiple  json code blocks always put the json resume first else it will cause system failure
`;
