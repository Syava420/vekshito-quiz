import fs from 'node:fs';
import path from 'node:path';

const IMAGES = [
  {
    name: 'gagarin.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Yuri_Gagarin_%281961%29_-_cropped.jpg/480px-Yuri_Gagarin_%281961%29_-_cropped.jpg'
  },
  {
    name: 'pushkin.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Alexander_Pushkin_by_O.Kiprensky_%281827%2C_Tretyakov_gallery%29.jpg/480px-Alexander_Pushkin_by_O.Kiprensky_%281827%2C_Tretyakov_gallery%29.jpg'
  },
  {
    name: 'tolstoy.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/L.N.Tolstoy_Prokudin-Gorsky.jpg/480px-L.N.Tolstoy_Prokudin-Gorsky.jpg'
  },
  {
    name: 'chekhov.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Anton_Chekhov_1889.jpg/480px-Anton_Chekhov_1889.jpg'
  },
  {
    name: 'flag_brazil.png',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/480px-Flag_of_Brazil.svg.png'
  },
  {
    name: 'flag_japan.png',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/480px-Flag_of_Japan.svg.png'
  },
  {
    name: 'flag_canada.png',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Flag_of_Canada_%28Pantone%29.svg/480px-Flag_of_Canada_%28Pantone%29.svg.png'
  },
  {
    name: 'flag_korea.png',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Flag_of_South_Korea.svg/480px-Flag_of_South_Korea.svg.png'
  }
];

const destDir = path.resolve('assets/images');

async function downloadAll() {
  for (const item of IMAGES) {
    const filePath = path.join(destDir, item.name);
    console.log(`Downloading ${item.name} from ${item.url}...`);
    try {
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'VekshitoQuizApp/1.0 (Educational trivia quiz; contact@example.com)'
        }
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      console.log(`✓ Saved ${item.name} (${buffer.length} bytes)`);
    } catch (err) {
      console.error(`✗ Error downloading ${item.name}:`, err.message);
    }
  }
}

downloadAll();
