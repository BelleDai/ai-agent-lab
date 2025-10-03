export interface TextChunk {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
}

export function simpleSemanticChunk(text: string, options?: { chunkSize?: number; overlap?: number }): TextChunk[] {
  const chunkSize = options?.chunkSize ?? 700;
  const overlap = options?.overlap ?? 100;
  const chunks: TextChunk[] = [];
  let pointer = 0;
  let index = 0;

  while (pointer < text.length) {
    const end = Math.min(pointer + chunkSize, text.length);
    const chunkText = text.slice(pointer, end);
    chunks.push({
      id: `chunk-${index}`,
      text: chunkText.trim(),
      startIndex: pointer,
      endIndex: end,
    });
    pointer = end - overlap;
    if (pointer < 0) {
      pointer = 0;
    }
    index += 1;
  }

  return chunks.filter((chunk) => chunk.text.length > 0);
}
