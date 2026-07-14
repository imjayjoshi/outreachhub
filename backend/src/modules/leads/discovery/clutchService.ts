import * as cheerio from "cheerio";

export interface DirectoryResult {
  name: string;
  website: string;
}

export async function scrapeClutch(city: string): Promise<DirectoryResult[]> {
  const slug = city.toLowerCase().replace(/\s+/g, "-");

  try {
    const res = await fetch(`https://clutch.co/in/developers/${slug}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      console.warn(`[clutchService] ${res.status} for city=${city}`);
      return [];
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const companies: DirectoryResult[] = [];

    // Primary selector — inspect live page if this returns empty
    $(".provider-info").each((_, el) => {
      const name = $(el).find(".company_info a").first().text().trim();
      const websiteHref = $(el).find("a.website-link__item").attr("href");
      if (name && websiteHref) {
        const website = normalizeDomain(websiteHref);
        if (website) companies.push({ name, website });
      }
    });

    // Fallback selector for newer Clutch markup
    if (companies.length === 0) {
      $("[data-link_to='company_website']").each((_, el) => {
        const href = $(el).attr("href");
        const name = $(el).closest("li").find("h3").first().text().trim();
        if (href && name) {
          const website = normalizeDomain(href);
          if (website) companies.push({ name, website });
        }
      });
    }

    console.log(`[clutchService] ${city}: found ${companies.length} companies`);
    return companies;
  } catch (err) {
    console.warn(`[clutchService] Failed for ${city}:`, err);
    return [];
  }
}

function normalizeDomain(url: string): string | null {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}
