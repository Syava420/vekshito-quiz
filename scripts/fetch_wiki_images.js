import fs from 'node:fs';
import path from 'node:path';

const TITLES = [
  // Literature & History portraits
  { file: 'gagarin.jpg', title: 'Yuri_Gagarin' },
  { file: 'pushkin.jpg', title: 'Alexander_Pushkin' },
  { file: 'tolstoy.jpg', title: 'Leo_Tolstoy' },
  { file: 'chekhov.jpg', title: 'Anton_Chekhov' },
  { file: 'peter_great.jpg', title: 'Peter_the_Great' },
  { file: 'catherine_great.jpg', title: 'Catherine_the_Great' },
  { file: 'lenin.jpg', title: 'Vladimir_Lenin' },
  { file: 'nicholas_ii.jpg', title: 'Nicholas_II_of_Russia' },

  // Geography flags
  { file: 'flag_brazil.png', title: 'Flag_of_Brazil' },
  { file: 'flag_japan.png', title: 'Flag_of_Japan' },
  { file: 'flag_canada.png', title: 'Flag_of_Canada' },
  { file: 'flag_korea.png', title: 'Flag_of_South_Korea' },
  { file: 'flag_germany.png', title: 'Flag_of_Germany' },
  { file: 'flag_france.png', title: 'Flag_of_France' },
  { file: 'flag_argentina.png', title: 'Flag_of_Argentina' },
  { file: 'flag_uk.png', title: 'Flag_of_the_United_Kingdom' },

  // Art & Culture paintings
  { file: 'mona_lisa.jpg', title: 'Mona_Lisa' },
  { file: 'starry_night.jpg', title: 'The_Starry_Night' },
  { file: 'girl_with_peaches.jpg', title: 'Girl_with_Peaches' },
  { file: 'morning_in_pine_forest.jpg', title: 'Morning_in_a_Pine_Forest' },
  { file: 'ninth_wave.jpg', title: 'The_Ninth_Wave' },

  // Astronomy
  { file: 'saturn.jpg', title: 'Saturn' },
  { file: 'mars.jpg', title: 'Mars' },
  { file: 'jupiter.jpg', title: 'Jupiter' }
];

const destDir = path.resolve('assets/images');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

async function run() {
  for (const item of TITLES) {
    const targetFile = path.join(destDir, item.file);
    if (fs.existsSync(targetFile)) {
      console.log(`- Skipping ${item.file} (already exists)`);
      continue;
    }
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
