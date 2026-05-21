export async function parseBackendError(res: Response): Promise<string> {
  try {
    const data = await res.clone().json();
    if (typeof data.message === 'string') return data.message;
    if (Array.isArray(data.message)) return data.message.join(', ');
    if (typeof data.error === 'string') return data.error;
  } catch {
    try {
      const text = await res.text();
      if (text) return text;
    } catch {
    }
  }
  return `Request failed (${res.status})`;
}
