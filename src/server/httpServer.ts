import { createServer, Server, IncomingMessage, ServerResponse } from 'http';
import { ToolRegistry } from './toolRegistry.js';

export interface ToolServerOptions {
  port?: number;
  registry: ToolRegistry;
}

export class ToolHttpServer {
  private readonly port: number;
  private readonly registry: ToolRegistry;
  private server?: Server;

  constructor(options: ToolServerOptions) {
    this.port = options.port ?? 8080;
    this.registry = options.registry;
  }

  start(): Promise<void> {
    if (this.server) {
      return Promise.resolve();
    }

    this.server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      if (req.method === 'GET' && req.url === '/healthz') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
      }

      if (req.method === 'GET' && req.url === '/tools') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ tools: this.registry.list() }));
        return;
      }

      if (req.method === 'POST' && req.url === '/call-tool') {
        const body = await readJson(req);
        try {
          const result = await this.registry.execute(body.toolName, body.arguments, {
            requestId: req.headers['x-request-id']?.toString(),
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: (error as Error).message }));
        }
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    });

    return new Promise((resolve) => {
      this.server?.listen(this.port, () => resolve());
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }
      this.server.close((error) => {
        if (error) {
          reject(error);
        } else {
          this.server = undefined;
          resolve();
        }
      });
    });
  }
}

function readJson(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    req
      .on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
      .on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        try {
          const parsed = raw.length ? JSON.parse(raw) : {};
          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}
