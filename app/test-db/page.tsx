import { createClient } from "../../lib/supabase/server";

export default async function TestDbPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Supabase Test</h1>

      <pre className="mt-4 whitespace-pre-wrap">
        {JSON.stringify({ data, error }, null, 2)}
      </pre>
    </main>
  );
}