import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type Logos = { light: string | null; dark: string | null };

async function toDataUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from("branding").download(path);
  if (!data) return null;
  return await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(data);
  });
}

export function useLogos() {
  return useQuery<Logos>({
    queryKey: ["logos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("logo_light_url, logo_dark_url")
        .eq("id", 1)
        .maybeSingle();
      const [light, dark] = await Promise.all([
        data?.logo_light_url ? toDataUrl(data.logo_light_url) : null,
        data?.logo_dark_url ? toDataUrl(data.logo_dark_url) : null,
      ]);
      return { light, dark };
    },
    staleTime: 5 * 60 * 1000,
  });
}
