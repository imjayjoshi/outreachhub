import * as cheerio from "cheerio";
import pLimit from "p-limit";

const PAGES_TO_CHECK = [
  "",
  "contact",
  "contact-us",
  "contact_us",
  "career",
  "careers",
  "jobs",
  "about",
  "about-us",
  "join-us",
  "work-with-us",
];

const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

// Preferred prefixes checked in priority order — first match wins
const PRIORITY_PREFIXES = [
  "careers",
  "jobs",
  "hr",
  "talent",
  "recruitment",
  "hiring",
  "info",
  "contact",
  "hello",
  "admin",
];

// Domains to skip in extracted emails (tracking pixels, CDNs, etc.)
const EMAIL_DOMAIN_BLACKLIST = [
  "sentry.io",
  "cloudflare.com",
  "example.com",
  "test.com",
  "yourdomain.com",
  "email.com",
  "domain.com",
  "wix.com",
  "wordpress.com",
  "squarespace.com",
];

export async function findEmailOnWebsite(
  website: string,
): Promise<string | null> {
  const foundEmails = new Set<string>();

  for (const page of PAGES_TO_CHECK) {
    try {
      const url = `https://${website}${page ? `/${page}` : ""}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(8000),
        redirect: "follow",
      });

      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);

      // Collect from visible text
      const bodyText = $("body").text();

      // Collect from mailto: links (highest signal)
      const mailtoEmails = $('a[href^="mailto:"]')
        .map(
          (_, el) => $(el).attr("href")?.replace("mailto:", "").split("?")[0],
        )
        .get()
        .filter(Boolean) as string[];

      const combined = bodyText + " " + mailtoEmails.join(" ");
      const matches = combined.match(EMAIL_REGEX) ?? [];

      for (const m of matches) {
        const email = m.toLowerCase();
        const domain = email.split("@")[1];
        if (domain && !EMAIL_DOMAIN_BLACKLIST.some((b) => domain.includes(b))) {
          // Only accept emails belonging to this website's domain or subdomains
          const websiteBase = website.split(".").slice(-2).join(".");
          if (domain.includes(websiteBase)) {
            foundEmails.add(email);
          }
        }
      }

      if (foundEmails.size > 0) break; // stop at first page with results
    } catch {
      continue; // page failed — try next
    }
  }

  if (foundEmails.size === 0) return null;

  // Return highest-priority prefix match
  for (const prefix of PRIORITY_PREFIXES) {
    const match = Array.from(foundEmails).find((e) =>
      e.startsWith(`${prefix}@`),
    );
    if (match) return match;
  }

  return Array.from(foundEmails)[0];
}

export async function crawlEmailsForCompanies(
  websites: string[],
): Promise<{ website: string; email: string | null }[]> {
  const limit = pLimit(5); // max 5 concurrent site visits
  return Promise.all(
    websites.map((site) =>
      limit(async () => ({
        website: site,
        email: await findEmailOnWebsite(site),
      })),
    ),
  );
}
