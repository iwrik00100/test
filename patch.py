# -*- coding: utf-8 -*-

with open('C:/Users/Deepayan/Downloads/claudeapptestingforeps/ver1.7/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace the Pollinations function with HuggingFace
old = '''async function _invokeViaPollinationsAI(pre, output) {
  const messages = [
    { role: 'system', content: _SYSTEM_PROMPT },
    ..._chatHistory
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);
  let res;
  try {
    res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, model: 'openai', private: true }),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) throw new Error(`Pollinations returned HTTP ${res.status}`);

  const text = await res.text();
  if (!text || text.startsWith('{')) {
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = null; }
    if (parsed?.error) throw new Error(`Pollinations error: ${parsed.error}`);
  }

  pre.textContent = text;
  output.scrollTop = output.scrollHeight;
  return text.trim();
}'''

new = '''async function _invokeViaHuggingFace(pre, output) {
  const HF_KEY = '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';
  const HF_URL = 'https://router.huggingface.co/v1/chat/completions';

  const messages = [
    { role: 'system', content: _SYSTEM_PROMPT },
    ..._chatHistory
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);
  let res;
  try {
    res = await fetch(HF_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HF_KEY}`
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-72B-Instruct',
        messages,
        max_tokens: 2048
      }),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HuggingFace returned HTTP ${res.status}: ${err.slice(0,200)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || 'No response received.';
  pre.textContent = text;
  output.scrollTop = output.scrollHeight;
  return text.trim();
}'''

js = js.replace(old, new)

# Update the router function name
js = js.replace(
    "return await _invokeViaPollinationsAI(pre, output);",
    "return await _invokeViaHuggingFace(pre, output);"
)

with open('C:/Users/Deepayan/Downloads/claudeapptestingforeps/ver1.7/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print('patched:', '_invokeViaHuggingFace' in js and '_invokeViaPollinationsAI' not in js)
