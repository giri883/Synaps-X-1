import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function inspectSchema() {
  const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/`;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  console.log('Fetching OpenAPI schema from:', url);
  const res = await fetch(url, {
    headers: {
      apikey: key!,
      Authorization: `Bearer ${key!}`,
    },
  });

  if (!res.ok) {
    console.error('Failed to fetch schema:', res.status, res.statusText);
    return;
  }

  const spec = await res.json();
  console.log('API Title:', spec.info?.title);
  const definitions = Object.keys(spec.definitions || {});
  console.log('All Tables/Definitions in Supabase:', definitions);

  for (const defName of definitions) {
    const def = spec.definitions[defName];
    console.log(`\n--- TABLE: ${defName} ---`);
    console.log('Properties:', Object.keys(def.properties || {}));
    console.log('Required:', def.required);
  }
}

inspectSchema();
