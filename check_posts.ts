
import { supabase } from "./src/integrations/my-supabase/client";

async function check() {
  const { data, error } = await supabase
    .from('posts')
    .select('category, status')
    .limit(100);
  
  if (error) {
    console.error("Error fetching posts:", error);
    process.exit(1);
  }
  
  const categories = [...new Set(data?.map(p => p.category))];
  const publishedCount = data?.filter(p => p.status === 'published').length;
  
  console.log("Categories found:", categories);
  console.log("Published posts total:", publishedCount);
  console.log("Samples:", JSON.stringify(data?.slice(0, 5), null, 2));
}

check();
