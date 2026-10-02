import { fetchBreakingNewsServer } from './src/firebase.js';

async function run() {
  const data = await fetchBreakingNewsServer();
  console.log('DATA:', JSON.stringify(data, null, 2));
}

run();
