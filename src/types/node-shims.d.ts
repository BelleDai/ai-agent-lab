declare const process: {
  env: Record<string, string | undefined>;
  exitCode?: number;
};

declare const Buffer: {
  from(input: string | ArrayBuffer | ArrayBufferView): any;
  concat(list: any[]): any;
  isBuffer(value: unknown): boolean;
};

declare module 'crypto' {
  export function randomUUID(): string;
}

declare module 'events' {
  export class EventEmitter {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    emit(event: string | symbol, ...args: any[]): boolean;
  }
}

declare module 'http' {
  import { EventEmitter } from 'events';

  export interface IncomingMessage extends EventEmitter {
    method?: string;
    url?: string;
    headers: Record<string, string | string[] | undefined>;
    on(event: 'data', listener: (chunk: any) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'error', listener: (error: any) => void): this;
  }

  export interface ServerResponse extends EventEmitter {
    writeHead(statusCode: number, headers: Record<string, string>): void;
    end(data?: string): void;
  }

  export type RequestListener = (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;

  export class Server extends EventEmitter {
    listen(port: number, callback?: () => void): Server;
    close(callback?: (error?: Error) => void): void;
  }

  export function createServer(listener: RequestListener): Server;
}

declare module 'fs' {
  export namespace promises {
    function readFile(path: string, options?: any): Promise<any>;
  }
}

declare module 'pdf-parse' {
  function pdfParse(buffer: any): Promise<{ text: string }>;
  export default pdfParse;
}

declare module 'zod' {
  export type infer<T> = any;
  export class ZodSchema<T> {
    parse(input: unknown): T;
    safeParse(input: unknown): { success: true; data: T } | { success: false; error: Error };
    toJSON(): unknown;
  }
  export function zodFactory(): ZodSchema<any>;
  export const z: any;
  export default z;
}
