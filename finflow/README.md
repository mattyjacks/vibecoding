# FinFlow

FinFlow is an independent, fictional private equity deal lab created by MattyJacks.com and inspired by Finrow.pro. Use fictional data only. The workspace starts with 50 deals and includes screening, diligence, underwriting, committee decisions, conditional closing, quarterly portfolio reporting, and fictional exits.

## Run locally

Run these commands from the FinFlow directory with Node.js 22 or newer. For a fresh source copy, copy .env.example to .env and set the key and demo password in the local .env file.

```powershell
node build-worker.mjs
node --env-file=.env serve.mjs
```

Open [FinFlow on loopback](http://127.0.0.1:8766/frp2/index.html). The same site also responds at [the server root](http://127.0.0.1:8766/). The ignored `.env` file supplies `OPENAI_API_KEY`, `DEMO_PASSWORD`, and optional `OPENAI_MODEL`. The default model is `gpt-6-luna`. The OpenAI assessment sends bundled fictional data and the numeric and categorical buy-box settings. Deal workflow and saved assessments are stored in the current browser.

Edit the standalone HTML files in this directory. Shared client files are in `dist/`. The build also emits the Worker entry point at `dist/server/index.js`.

## Present the demo

Open the Demo walkthrough from the pipeline and select **Start clean rehearsal**. The new tab starts from the default buy box and 50 fictional deals. Follow Ridgeline from evidence review to underwriting, committee, closing, and portfolio. Rehearsal work stays in the rehearsal tab.

## Verify and package

```powershell
node verify.mjs
tar.exe -czf dist/server/finflow-release.tar.gz .openai/hosting.json dist/server/index.js
tar.exe -tzf dist/server/finflow-release.tar.gz
```

Verification checks client rendering, the fictional deal catalog, underwriting calculations, and a mocked OpenAI response. It also checks that `.env` is inaccessible. In the Sites checkout, the deployment archive contains the Sites manifest and built Worker. Source handoffs exclude private Sites configuration. Private Sites deployment uses the release's matching source commit and server-side runtime secrets for `OPENAI_API_KEY` and `DEMO_PASSWORD`.
