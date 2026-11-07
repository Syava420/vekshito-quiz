import fs from 'node:fs';
import path from 'node:path';

const TITLES = [
  { file: 'gagarin.jpg', title: 'Yuri_Gagarin' },
  { file: 'pushkin.jpg', title: 'Alexander_Pushkin' },
  { file: 'tolstoy.jpg', title: 'Leo_Tolstoy' },
  { file: 'chekhov.jpg', title: 'Anton_Chekhov' },
  { file: 'flag_brazil.png', title: 'Flag_of_Brazil' },
  { file: 'flag_japan.png', title: 'Flag_of_Japan' },
  { file: 'flag_canada.png', title: 'Flag_of_Canada' },
  { file: 'flag_korea.png', title: 'Flag_of_South_Korea' }
];

const destDir = path.resolve('assets/images');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

async function run() {
  for (const item of TITLES) {
    const targetFile = path.join(destDir, item.file);
    console.log(`Querying Wikipedia for "${item.title}"...`);
    try {
      const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(item.title)}&prop=pageimages&format=json&pithumbsize=400`;
      const apiRes = await fetch(apiUrl, {
        headers: { 'User-Agent': 'VekshitoQuiz/1.0 (educational; info@vekshito.app)' }
      });
      const data = await apiRes.json();
      const pages = data.query?.pages || {};
      const firstPage = Object.values(pages)[0];
      const thumbUrl = firstPage?.thumbnail?.source;

      if (!thumbUrl) {
        console.warn(`No thumbnail found for ${item.title}`);
        continue;
      }

      console.log(`Downloading thumbnail from ${thumbUrl}...`);
      const imgRes = await fetch(thumbUrl, {
        headers: { 'User-Agent': 'VekshitoQuiz/1.0 (educational; info@vekshito.app)' }
      });
      const buf = Buffer.from(await imgRes.arrayBuffer());
      fs.writeFileSync(targetFile, buf);
      console.log(`✓ Saved ${item.file} (${buf.length} bytes)`);
    } catch (err) {
      console.error(`✗ Error fetching ${item.title}:`, err.message);
    }
  }
  console.log('All downloads completed!');
}

run();
