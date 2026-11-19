import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import worker from './dist/server/index.js';

const origin = 'http://127.0.0.1:8766';
createServer(async (incoming, outgoing) => {
  try {
    const hasBody = !['GET', 'HEAD'].includes(incoming.method);
    const request = new Request(new URL(incoming.url, origin), {
      method: incoming.method,
      headers: incoming.headers,
      ...(hasBody ? { body: Readable.toWeb(incoming), duplex: 'half' } : {})
    });
    const response = await worker.fetch(request, process.env);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) Readable.fromWeb(response.body).pipe(outgoing);
    else outgoing.end();
  } catch {
    outgoing.writeHead(500).end('Unexpected server error');
  }
}).listen(8766, '127.0.0.1', () => console.log('FinFlow demo at ' + origin));
