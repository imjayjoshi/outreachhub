import * as cheerio from "cheerio";

export interface DirectoryResult {
  name: string;
  website: string;
}

export async function scrapeGoodFirms(
  city: string,
): Promise<DirectoryResult[]> {
  const slug = city.toLowerCase().replace(/\s+/g, "-");

  try {
    const res = await fetch(
      `https://www.goodfirms.co/directory/city/top-software-development-companies/${slug}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(12000),
      },
    );

    if (!res.ok) {
      console.warn(`[goodfirmsService] ${res.status} for city=${city}`);
      return [];
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const companies: DirectoryResult[] = [];

    // GoodFirms company card selector
    $(".company-info-wrap").each((_, el) => {
      const name = $(el).find(".company-name a").first().text().trim();
      const websiteHref = $(el).find("a.website").attr("href");
      if (name && websiteHref) {
        const website = normalizeDomain(websiteHref);
        if (website) companies.push({ name, website });
      }
    });

    // Fallback selector
    if (companies.length === 0) {
      $(".cl-detail-item").each((_, el) => {
        const name = $(el).find("h3").first().text().trim();
        const websiteHref = $(el).find("a[href*='http']").first().attr("href");
        if (name && websiteHref) {
          const website = normalizeDomain(websiteHref);
          if (website && !website.includes("goodfirms.co")) {
            companies.push({ name, website });
          }
        }
      });
    }

    console.log(
      `[goodfirmsService] ${city}: found ${companies.length} companies`,
    );
    return companies;
  } catch (err) {
    console.warn(`[goodfirmsService] Failed for ${city}:`, err);
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
