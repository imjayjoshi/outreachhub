import * as cheerio from "cheerio";

export interface SearchResult {
  name: string;
  website: string;
}

export async function searchCompanies(city: string): Promise<SearchResult[]> {
  console.log(
    `[searchService] Discovering real companies for ${city} via Wikipedia...`,
  );

  const results: SearchResult[] = [];
  const cityPath =
    city === "Hyderabad"
      ? "Hyderabad,_India"
      : city === "Bangalore"
        ? "Bengaluru"
        : city;

  try {
    const categoryUrl = `https://en.wikipedia.org/wiki/Category:Companies_based_in_${cityPath}`;
    const res = await fetch(categoryUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.warn(
        `[searchService] Wikipedia returned status ${res.status} for category ${city}`,
      );
      return [];
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const wikiPages: { name: string; wikiUrl: string }[] = [];

    $("#mw-pages .mw-category-group a").each((_, el) => {
      const name = $(el).text().trim();
      const href = $(el).attr("href");
      // Skip Talk/User pages or category pages
      if (
        href &&
        href.startsWith("/wiki/") &&
        !href.includes(":") &&
        !name.toLowerCase().includes("list of")
      ) {
        wikiPages.push({ name, wikiUrl: href });
      }
    });

    console.log(
      `[searchService] Found ${wikiPages.length} company Wiki pages for ${city}`,
    );

    // Fetch official website for each company (up to 40 max to avoid overloading)
    const limit = wikiPages.slice(0, 40);

    for (const page of limit) {
      try {
        const website = await extractWebsiteFromWiki(page.wikiUrl);
        if (website) {
          const domain = normalizeDomain(website);
          if (domain) {
            results.push({ name: page.name, website: domain });
            console.log(
              `[searchService] Discovered: ${page.name} -> ${domain}`,
            );
          }
        }
        await sleep(200); // polite delay
      } catch (err) {
        console.warn(
          `[searchService] Failed to extract website for ${page.name}:`,
          err,
        );
      }
    }
  } catch (err) {
    console.error(`[searchService] Failed category fetch for ${city}:`, err);
  }

  return results;
}

async function extractWebsiteFromWiki(
  wikiPath: string,
): Promise<string | null> {
  const url = `https://en.wikipedia.org${wikiPath}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) return null;
  const html = await res.text();
  const $ = cheerio.load(html);
  let website: string | null = null;

  // 1. Check infobox rows for website
  $(".infobox tr").each((_, tr) => {
    const label = $(tr).find(".infobox-label").text().trim().toLowerCase();
    if (label.includes("website") || label.includes("official website")) {
      const href = $(tr).find(".infobox-data a").first().attr("href");
      if (href) website = href;
    }
  });

  // 2. Check standard official website class in external links
  if (!website) {
    $("a.official-website").each((_, a) => {
      const href = $(a).attr("href");
      if (href) website = href;
    });
  }

  // 3. Fallback: Check infobox-data class directly
  if (!website) {
    const textLink = $(".infobox-data a").first().attr("href");
    if (textLink && textLink.startsWith("http")) {
      website = textLink;
    }
  }

  return website;
}

function normalizeDomain(url: string): string | null {
  try {
    const cleanUrl = url.startsWith("//")
      ? `https:${url}`
      : url.startsWith("http")
        ? url
        : `https://${url}`;
    const u = new URL(cleanUrl);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
