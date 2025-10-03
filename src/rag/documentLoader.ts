import { promises as fs } from 'fs';

export interface LoadedDocument {
  text: string;
  warnings: string[];
}

async function loadPdf(path: string): Promise<LoadedDocument> {
  const buffer = await fs.readFile(path);
  try {
    const pdfParse = await import('pdf-parse');
    const parsed = await pdfParse.default(buffer);
    return { text: parsed.text, warnings: [] };
  } catch (error) {
    const warning =
      'pdf-parse dependency is not available. Falling back to UTF-8 decoding which only works for text-based PDFs.';
    return { text: buffer.toString('utf8'), warnings: [warning] };
  }
}

async function loadText(path: string): Promise<LoadedDocument> {
  const text = await fs.readFile(path, 'utf8');
  return { text, warnings: [] };
}

export async function loadDocument(path: string): Promise<LoadedDocument> {
  if (path.endsWith('.pdf')) {
    return loadPdf(path);
  }
  return loadText(path);
}
