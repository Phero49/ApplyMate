import { ref } from 'vue';
import { useAppContext, type Resume } from 'src/stores/appStore';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

const messages = ref<ChatMessage[]>([]);
const isStreaming = ref(false);
const error = ref<string | null>(null);
const selectedModel = ref('gemini-2.5-flash');

const availableModels = [
  { label: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' },
  { label: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro-preview-06-05' },
  { label: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
];

function buildSystemPrompt(resume: Resume): string {
  return `You are an expert resume writing assistant embedded in a resume builder application called ApplyMate. Your role is to help the user improve, edit, and optimize their resume content.

Here is the user's current resume data:
---
Name: ${resume.name}
Headline: ${resume.headline}
Summary: ${resume.summary}

Contact:
${resume.contact.map((c) => `  ${c.label}: ${c.value}`).join('\n')}

Skills:
${resume.skills.map((s) => `  ${s.category}: ${s.skillList.join(', ')}`).join('\n')}

Experience:
${resume.experience.map((e) => `  ${e.title} at ${e.company} (${e.dates})\n${e.bullets.map((b) => `    • ${b}`).join('\n')}`).join('\n\n')}

${resume.projects?.length ? `Projects:\n${resume.projects.map((p) => `  ${p.title} (${p.dates || 'N/A'})\n${p.bullets.map((b) => `    • ${b}`).join('\n')}`).join('\n\n')}` : ''}

${resume.education?.length ? `Education:\n${resume.education.map((e) => `  ${e.degree} — ${e.institution} (${e.dates || 'N/A'})`).join('\n')}` : ''}

${resume.certifications?.length ? `Certifications:\n${resume.certifications.map((c) => `  ${c.name} — ${c.issuer} (${c.date || 'N/A'})`).join('\n')}` : ''}

${resume.languages?.length ? `Languages:\n${resume.languages.map((l) => `  ${l.name}: ${l.level}`).join('\n')}` : ''}
---

Guidelines:
- Be concise but thorough in your suggestions
- Use industry best practices for resume writing
- When suggesting bullet points, use the STAR method (Situation, Task, Action, Result)
- Include quantifiable metrics when possible
- Format your responses with markdown for readability
- If asked to rewrite a section, provide the improved version directly
- You can suggest improvements, rewrite sections, or answer questions about resume best practices`;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

export function useChat() {
  async function sendMessage(userContent: string) {
    if (!userContent.trim() || isStreaming.value) return;

    error.value = null;

    // Add user message
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: userContent.trim(),
      timestamp: new Date(),
    };
    messages.value.push(userMsg);

    // Add placeholder assistant message
    const assistantMsg: ChatMessage = {
      id: generateId(),
      role: 'model',
      content: '',
      timestamp: new Date(),
      streaming: true,
    };
    messages.value.push(assistantMsg);

    isStreaming.value = true;

    try {
      const store = useAppContext();
      const systemPrompt = buildSystemPrompt(store.resume);

      // Build Gemini request contents (skip the current empty assistant message)
      const contents = messages.value
        .filter((m) => m.id !== assistantMsg.id)
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }));

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel.value}:streamGenerateContent?alt=sse&key=`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        let errMsg = `API Error (${response.status})`;
        try {
          const parsed = JSON.parse(errBody);
          errMsg = parsed.error?.message || errMsg;
        } catch {
          // use default
        }
        throw new Error(errMsg);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;
            try {
              const data = JSON.parse(jsonStr);
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                assistantMsg.content += text;
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      }

      assistantMsg.streaming = false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      error.value = msg;
      // Remove the empty assistant message on error
      if (!assistantMsg.content) {
        messages.value = messages.value.filter((m) => m.id !== assistantMsg.id);
      } else {
        assistantMsg.streaming = false;
      }
    } finally {
      isStreaming.value = false;
    }
  }

  function clearChat() {
    messages.value = [];
    error.value = null;
  }

  return {
    messages,
    isStreaming,
    error,
    selectedModel,
    availableModels,
    sendMessage,
    clearChat,
  };
}
