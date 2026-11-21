import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { names, bios } from './personas.js';
export const interestNames = [
  'Hiking',
  'Photography',
  'Jazz',
  'Museums',
  'Coffee',
  'Gaming',
  'Cooking',
  'Cinema',
  'Board games',
  'Reading',
  'Cycling',
  'Yoga',
  'Dancing',
  'Travel',
  'Design',
  'Swimming',
  'Pottery',
  'Live music',
  'Baking',
  'Tennis',
  'Science',
  'Gardening',
  'Theatre',
  'Climbing',
  'Languages',
  'Basketball',
  'Piano',
  'Volunteering',
];
const districts = [
  'Central',
  'Sheung Wan',
  'Wan Chai',
  'Causeway Bay',
  'Kennedy Town',
  'Sai Ying Pun',
  'Mong Kok',
  'Tsim Sha Tsui',
  'Sha Tin',
  'Tsuen Wan',
  'Tseung Kwan O',
  'Tai Po',
];
const jobs = [
  'Creative strategist',
  'Architect',
  'Game designer',
  'Product designer',
  'Financial analyst',
  'Science teacher',
  'Physiotherapist',
  'Operations analyst',
  'Illustrator',
  'Bookseller',
  'Cartographer',
  'Product designer',
  'Architect',
  'Software engineer',
  'Event coordinator',
  'Research scientist',
  'Publishing editor',
  'Graphic designer',
  'Photographer',
  'Data analyst',
  'Teacher',
  'Translator',
  'Information designer',
  'Marine researcher',
  'Physiotherapist',
  'Editor',
  'Operations planner',
  'Software engineer',
  'Designer',
  'Librarian',
  'Writer',
  'Chef',
  'Ceramic artist',
  'Animation editor',
  'Engineer',
  'Exhibition curator',
  'Software developer',
  'Journalist',
  'Accountant',
  'Barista',
  'Researcher',
  'Film producer',
  'Researcher',
  'Sound designer',
  'Packaging designer',
  'Community coordinator',
  'Sound engineer',
  'Designer',
  'Translator',
  'Music teacher',
  'Urban planner',
  'Legal researcher',
  'Furniture maker',
  'Colour consultant',
  'Software developer',
  'Teacher',
  'Baker',
  'Librarian',
  'Nurse',
  'Travel editor',
  'Animator',
  'Product researcher',
  'Furniture maker',
  'Research scientist',
];
// Interests reflect each biography, with deterministic secondary hobbies.
const interestPatterns = [
  /trail|hik|long walk/i,
  /photograph|camera/i,
  /jazz/i,
  /museum|exhibition|galler/i,
  /coffee|café/i,
  /gaming|gamer|co-op|strategy game|arcade/i,
  /cook|kitchen|recipe|dumpling|soup|meal/i,
  /film|cinema|movie|comedy/i,
  /board.game|card.game|chess|puzzle/i,
  /read|book|novel|librar/i,
  /cycl|bike/i,
  /yoga/i,
  /danc|salsa/i,
  /travel|ferry/i,
  /design|architect|furniture|sewing|draw|sketch/i,
  /swim/i,
  /pottery|ceramic|bowls/i,
  /gig|music|record|drum|guitar/i,
  /bak|bread|cake|oven/i,
  /tennis|serve/i,
  /science|research|lab/i,
  /garden|herb|plant/i,
  /theatre/i,
  /climb|boulder/i,
  /language|translat/i,
  /basketball/i,
  /piano/i,
  /volunteer|community garden/i,
];
function personaInterests(bio: string, index: number) {
  const chosen = interestPatterns.flatMap((pattern, i) => (pattern.test(bio) ? [i + 1] : []));
  for (let step = 0; chosen.length < 5 + (index % 3); step++) {
    const id = 1 + ((index * 3 + step * 5) % 28);
    if (!chosen.includes(id)) chosen.push(id);
  }
  return chosen.slice(0, 9).sort((a, b) => a - b);
}
const weekends = ['Adventure', 'Creative', 'Cozy'];
const social = ['Balanced', 'Outgoing', 'Quiet'];
export const personas = names.map((name, i) => {
  const id = i + 1,
    feminine = id === 1 || (id >= 4 && id <= 34);
  const interests =
    i === 0 || i === 1 ? [1, 2, 3, 4, 5] : i === 2 ? [5, 6, 7, 8, 9] : personaInterests(bios[i], i);
  const gender = id % 11 === 0 ? 'nonbinary' : feminine ? 'woman' : 'man';
  return {
    id,
    name,
    age: i < 3 ? 27 + i : 21 + ((i * 7) % 15),
    gender,
    presentation: feminine ? 'feminine' : 'masculine',
    bio: bios[i],
    occupation: jobs[i],
    district: i < 3 ? 'Sheung Wan' : districts[i % 12],
    weekend: i < 2 ? 'Adventure' : i === 2 ? 'Cozy' : weekends[i % 3],
    social: i < 2 ? 'Balanced' : i === 2 ? 'Quiet' : social[(i * 7) % 3],
    image: `/profiles/${String(id).padStart(2, '0')}.webp`,
    interests,
    genders:
      id % 7 === 0
        ? ['woman']
        : id % 9 === 0
          ? ['man', 'nonbinary']
          : ['woman', 'man', 'nonbinary'],
    minAge: id % 8 === 0 ? 26 : 21,
    maxAge: 35,
  };
});
const eligible = (a: (typeof personas)[0], b: (typeof personas)[0]) =>
  a.genders.includes(b.gender) &&
  b.genders.includes(a.gender) &&
  a.age >= b.minAge &&
  a.age <= b.maxAge &&
  b.age >= a.minAge &&
  b.age <= a.maxAge;
const likes = new Set<string>(['2:1']);
const pairs: number[][] = [];
// Two existing Alice conversations; no Alice/Ben or Alice/Chris relationship.
for (const [a, b] of [
  [1, 35],
  [1, 37],
]) {
  pairs.push([a, b]);
  likes.add(`${a}:${b}`);
  likes.add(`${b}:${a}`);
}
for (let a = 4; a <= 64 && pairs.length < 20; a++)
  for (let b = a + 1; b <= 64 && pairs.length < 20; b++) {
    if (eligible(personas[a - 1], personas[b - 1]) && !pairs.some((p) => p.includes(a))) {
      pairs.push([a, b]);
      likes.add(`${a}:${b}`);
      likes.add(`${b}:${a}`);
      break;
    }
  }
for (let step = 1; likes.size < 220 && step < 64; step++)
  for (let a = 4; a <= 64 && likes.size < 220; a++) {
    const b = 4 + ((a - 4 + step) % 61);
    if (a !== b && !likes.has(`${b}:${a}`) && eligible(personas[a - 1], personas[b - 1]))
      likes.add(`${a}:${b}`);
  }
const saved = new Set<string>(['1:2', '1:3', '1:37']);
for (let step = 1; saved.size < 90; step++)
  for (let a = 2; a <= 64 && saved.size < 90; a++) {
    const b = 1 + ((a + step) % 64);
    if (a !== b) saved.add(`${a}:${b}`);
  }
const q = (v: unknown) =>
  typeof v === 'number'
    ? String(v)
    : `'${String(v).replaceAll('\\', '\\\\').replaceAll("'", "''")}'`;
const insert = (table: string, cols: string, rows: unknown[][]) =>
  `INSERT INTO ${table} (${cols}) VALUES\n${rows.map((r) => `(${r.map(q).join(',')})`).join(',\n')};\n`;
export function generateSeed() {
  let sql = '-- Deterministic synthetic data; no real people. Generated by seed-generator.ts.\n';
  sql += insert(
    'users',
    'id,name,created_at',
    personas.map((p) => [p.id, p.name, '2026-11-01 09:00:00']),
  );
  sql += insert(
    'profiles',
    'user_id,age,gender,presentation,bio,occupation,district,weekend,social,image,photos',
    personas.map((p) => [
      p.id,
      p.age,
      p.gender,
      p.presentation,
      p.bio,
      p.occupation,
      p.district,
      p.weekend,
      p.social,
      p.image,
      JSON.stringify(
        p.id <= 3
          ? [
              p.image,
              `/profiles/${String(p.id).padStart(2, '0')}-2.webp`,
              `/profiles/${String(p.id).padStart(2, '0')}-3.webp`,
            ]
          : [p.image],
      ),
    ]),
  );
  sql += insert(
    'preferences',
    'user_id,min_age,max_age,weekend,social',
    personas.map((p) => [p.id, p.minAge, p.maxAge, p.weekend, p.social]),
  );
  sql += insert(
    'preference_genders',
    'user_id,gender',
    personas.flatMap((p) => p.genders.map((g) => [p.id, g])),
  );
  sql += insert(
    'interests',
    'id,name',
    interestNames.map((n, i) => [i + 1, n]),
  );
  sql += insert(
    'user_interests',
    'user_id,interest_id',
    personas.flatMap((p) => p.interests.map((id) => [p.id, id])),
  );
  sql += insert(
    'likes',
    'from_user,to_user,created_at',
    [...likes].map((p) => [...p.split(':').map(Number), '2026-11-12 10:00:00']),
  );
  sql += insert(
    'matches',
    'id,user_a,user_b,created_at',
    pairs.map(([a, b], i) => [
      i + 1,
      a,
      b,
      `2026-11-${String(8 + (i % 5)).padStart(2, '0')} 10:00:00`,
    ]),
  );
  const chat = [
    'Your profile made me smile. What has been the best part of your week?',
    'A long walk and a very good lunch. Sometimes the small things win.',
    'That sounds lovely. I found a little café we might both enjoy.',
    'I would like that. Shall we compare free afternoons?',
  ];
  sql += insert(
    'messages',
    'match_id,user_a,user_b,sender_id,body,created_at',
    pairs.flatMap(([a, b], i) =>
      chat.map((body, j) => [
        i + 1,
        a,
        b,
        j % 2 ? b : a,
        body,
        `2026-11-13 10:${String(i * 2 + j).padStart(2, '0')}:00`,
      ]),
    ),
  );
  sql += insert(
    'saved_profiles',
    'user_id,saved_user_id,created_at',
    [...saved].map((p) => [...p.split(':').map(Number), '2026-11-12 12:00:00']),
  );
  return sql;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(new URL('./seed.sql', import.meta.url), generateSeed());
  console.log('Generated 64 profiles, 220 likes, 20 matches, 80 messages, 90 saves.');
}
