import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

type ScrapeResult = {
  name: string | null;
  image_url: string | null;
  price: number | null;
  currency: string | null;
};

function parsePrice(value: string | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.,]/g, "").replace(",", ".");
  const price = Number.parseFloat(cleaned);
  return Number.isFinite(price) ? price : null;
}

function extractFromJsonLd($: cheerio.CheerioAPI): {
  price: number | null;
  currency: string | null;
} {
  let price: number | null = null;
  let currency: string | null = null;

  $('script[type="application/ld+json"]').each((_, el) => {
    if (price !== null) return;
    try {
      const json = JSON.parse($(el).contents().text());
      const candidates = Array.isArray(json) ? json : [json];

      for (const candidate of candidates) {
        const node = candidate["@graph"]
          ? candidate["@graph"].find((n: { "@type"?: string }) => n["@type"] === "Product")
          : candidate;

        if (!node || node["@type"] !== "Product") continue;

        const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers;
        if (offers?.price) {
          price = parsePrice(String(offers.price));
          currency = offers.priceCurrency ?? null;
        }
      }
    } catch {
      // Malformed JSON-LD is common in the wild; skip it.
    }
  });

  return { price, currency };
}

async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; wishlist-app/1.0; +https://github.com)",
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Fetch failed with status ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const meta = (property: string) =>
    $(`meta[property="${property}"]`).attr("content") ??
    $(`meta[name="${property}"]`).attr("content");

  const name = meta("og:title") ?? ($("title").text().trim() || null);
  const image_url = meta("og:image") ?? null;

  const metaPrice =
    parsePrice(meta("og:price:amount")) ?? parsePrice(meta("product:price:amount")) ?? null;
  const metaCurrency = meta("og:price:currency") ?? meta("product:price:currency") ?? null;

  const jsonLd = metaPrice === null ? extractFromJsonLd($) : { price: null, currency: null };

  return {
    name,
    image_url,
    price: metaPrice ?? jsonLd.price,
    currency: metaCurrency ?? jsonLd.currency,
  };
}

export async function POST(request: Request) {
  const { url } = await request.json();

  if (typeof url !== "string" || !/^https?:\/\//.test(url)) {
    return NextResponse.json({ error: "A valid http(s) URL is required." }, { status: 400 });
  }

  try {
    const result = await scrapeUrl(url);
    return NextResponse.json(result);
  } catch {
    // Scraping is best-effort: on any failure, return empty fields so the
    // client can still show an editable, manually-fillable form.
    return NextResponse.json({
      name: null,
      image_url: null,
      price: null,
      currency: null,
      warning: "Couldn't fetch details from that link. Fill in the fields manually.",
    });
  }
}
