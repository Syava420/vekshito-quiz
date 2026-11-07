import fs from 'node:fs';

const p = 'C:\\Users\\Neuron\\Desktop\\ВЕКШИТО_Биология_и_Химия_текст.txt';
if (fs.existsSync(p)) {
  const c = fs.readFileSync(p, 'utf8');
  console.log('Биология_и_Химия lines:', c.split('\n').length);
  console.log('First 500 chars:\n', c.slice(0, 500));
} else {
  console.log('File does not exist');
}
