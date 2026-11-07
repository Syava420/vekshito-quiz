import fs from 'node:fs';

const filePath = 'C:\\Users\\Neuron\\Desktop\\ВЕКШИТО_Все_Выпуски_Текст.txt';
const raw = fs.readFileSync(filePath, 'utf8');

const videos = raw.split(/={40,}\r?\nРОЛИК:\s*/);
console.log(`Found ${videos.length} video chunks.`);

// Let's inspect 10 videos and check how questions are asked
for (let i = 1; i <= Math.min(10, videos.length - 1); i++) {
  const lines = videos[i].split(/\r?\n/);
  const title = lines[0].trim();
  const body = lines.slice(1).join(' ').replace(/\s+/g, ' ');
  
  // Find questions
  const questions = body.match(/[^.?!]{10,120}\?/g) || [];
  const validQs = questions.filter(q => {
    const lower = q.toLowerCase();
    return (
      (lower.includes('как называется') ||
       lower.includes('в каком году') ||
       lower.includes('кто написал') ||
       lower.includes('кто автор') ||
       lower.includes('сколько') ||
       lower.includes('столица') ||
       lower.includes('какой') ||
       lower.includes('какая') ||
       lower.includes('какое') ||
       lower.includes('что такое') ||
       lower.includes('формула')) &&
      !lower.includes('тебя зовут') &&
      !lower.includes('вас зовут') &&
      !lower.includes('денег') &&
      !lower.includes('настроение')
    );
  });

  console.log(`\n[${i}] ${title}`);
  console.log(`Found ${validQs.length} potential questions:`);
  validQs.slice(0, 4).forEach(q => console.log('  * ' + q.trim()));
}
