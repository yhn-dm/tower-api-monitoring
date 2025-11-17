import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding providers & endpoints...");

  const providers = [
    {
      slug: "binance",
      name: "Binance",
      logoUrl: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png",
      endpoints: [
        { url: "https://api.binance.com/api/v3/ping", description: "Ping" },
        { url: "https://api.binance.com/api/v3/time", description: "Server time" }
      ]
    },
    {
      slug: "cloudflare",
      name: "Cloudflare",
      logoUrl: "https://www.cloudflare.com/img/cf-twitter-card.png",
      endpoints: [
        { url: "https://cloudflare.com", description: "Home" },
        { url: "https://1.1.1.1", description: "DNS Resolver" }
      ]
    },
    {
      slug: "google",
      name: "Google",
      logoUrl: "https://google.com/favicon.ico",
      endpoints: [
        { url: "https://google.com", description: "Homepage" },
        { url: "https://www.googleapis.com/discovery/v1/apis", description: "APIs list" }
      ]
    },
    {
      slug: "github",
      name: "GitHub",
      logoUrl: "https://github.githubassets.com/favicons/favicon.png",
      endpoints: [
        { url: "https://api.github.com", description: "API root" },
        { url: "https://api.github.com/meta", description: "Metadata" }
      ]
    },
    {
      slug: "openai",
      name: "OpenAI",
      logoUrl: "https://openai.com/favicon.ico",
      endpoints: [
        { url: "https://api.openai.com/v1/models", description: "List models" },
        { url: "https://status.openai.com/api/v2/status.json", description: "Status API" }
      ]
    },
    {
  slug: "aws",
  name: "Amazon Web Services",
  logoUrl: "https://a0.awsstatic.com/libra-css/images/site/touch-icon-ipad-144-smile.png",
  endpoints: [
    { url: "https://aws.amazon.com", description: "Homepage" },
    { url: "https://status.aws.amazon.com/", description: "Status Page" }
  ]
},
{
  slug: "azure",
  name: "Microsoft Azure",
  logoUrl: "https://azurecomcdn.azureedge.net/cvt-6b86c09f70f9137bac9c0ed912055e294d9af89b6f2b03a367c2c4c95d85f1c9/images/icon/favicon.ico",
  endpoints: [
    { url: "https://azure.microsoft.com", description: "Homepage" },
    { url: "https://management.azure.com/", description: "Management API" }
  ]
},
{
  slug: "digitalocean",
  name: "DigitalOcean",
  logoUrl: "https://www.digitalocean.com/favicon.ico",
  endpoints: [
    { url: "https://cloud.digitalocean.com", description: "Cloud Dashboard" },
    { url: "https://status.digitalocean.com", description: "Status API" }
  ]
},
{
  slug: "vercel",
  name: "Vercel",
  logoUrl: "https://vercel.com/favicon.ico",
  endpoints: [
    { url: "https://vercel.com", description: "Homepage" },
    { url: "https://api.vercel.com/v1/edge-functions", description: "Edge Functions API" }
  ]
},
{
  slug: "supabase",
  name: "Supabase",
  logoUrl: "https://supabase.com/favicon/favicon.ico",
  endpoints: [
    { url: "https://supabase.com", description: "Homepage" },
    { url: "https://api.supabase.com", description: "API Root" }
  ]
},
{
  slug: "netlify",
  name: "Netlify",
  logoUrl: "https://www.netlify.com/v3/static/favicon/favicon-32x32.png",
  endpoints: [
    { url: "https://app.netlify.com", description: "Dashboard" },
    { url: "https://api.netlify.com/api/v1", description: "API" }
  ]
},
{
  slug: "stripe",
  name: "Stripe",
  logoUrl: "https://stripe.com/favicon.ico",
  endpoints: [
    { url: "https://api.stripe.com/v1/charges", description: "Charges API" },
    { url: "https://status.stripe.com", description: "Status API" }
  ]
},
{
  slug: "paypal",
  name: "PayPal",
  logoUrl: "https://www.paypalobjects.com/webstatic/icon/favicon.ico",
  endpoints: [
    { url: "https://api-m.paypal.com", description: "REST API" },
    { url: "https://www.paypal.com", description: "Homepage" }
  ]
},
{
  slug: "coinbase",
  name: "Coinbase",
  logoUrl: "https://www.coinbase.com/favicon.ico",
  endpoints: [
    { url: "https://api.coinbase.com/v2/prices", description: "Prices API" },
    { url: "https://status.coinbase.com", description: "Status API" }
  ]
},
{
  slug: "kraken",
  name: "Kraken",
  logoUrl: "https://www.kraken.com/favicon.ico",
  endpoints: [
    { url: "https://api.kraken.com/0/public/SystemStatus", description: "System Status" },
    { url: "https://api.kraken.com", description: "API Root" }
  ]
},
{
  slug: "twitter",
  name: "Twitter API",
  logoUrl: "https://abs.twimg.com/favicons/twitter.ico",
  endpoints: [
    { url: "https://api.twitter.com/2/tweets", description: "Tweets API" },
    { url: "https://twitter.com", description: "Homepage" }
  ]
},
{
  slug: "meta",
  name: "Meta (Facebook)",
  logoUrl: "https://www.facebook.com/images/fb_icon_325x325.png",
  endpoints: [
    { url: "https://graph.facebook.com", description: "Graph API" },
    { url: "https://facebook.com", description: "Homepage" }
  ]
},
{
  slug: "instagram",
  name: "Instagram",
  logoUrl: "https://www.instagram.com/static/images/ico/favicon.ico/36b3ee2d91ed.ico",
  endpoints: [
    { url: "https://www.instagram.com", description: "Homepage" },
    { url: "https://graph.instagram.com", description: "Graph API" }
  ]
},
{
  slug: "tiktok",
  name: "TikTok",
  logoUrl: "https://www.tiktok.com/favicon.ico",
  endpoints: [
    { url: "https://www.tiktok.com", description: "Homepage" },
    { url: "https://api.tiktok.com/aweme/v1", description: "API Root" }
  ]
},
{
  slug: "slack",
  name: "Slack",
  logoUrl: "https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png",
  endpoints: [
    { url: "https://slack.com/api/api.test", description: "API Test" },
    { url: "https://status.slack.com", description: "Status API" }
  ]
},
{
  slug: "notion",
  name: "Notion",
  logoUrl: "https://www.notion.so/images/favicon.ico",
  endpoints: [
    { url: "https://api.notion.com/v1/users", description: "Users API" },
    { url: "https://www.notion.so", description: "Homepage" }
  ]
},
{
  slug: "discord",
  name: "Discord",
  logoUrl: "https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico",
  endpoints: [
    { url: "https://discord.com/api/v10/gateway", description: "Gateway API" },
    { url: "https://status.discord.com", description: "Status API" }
  ]
},
{
  slug: "steam",
  name: "Steam",
  logoUrl: "https://store.steampowered.com/favicon.ico",
  endpoints: [
    { url: "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/", description: "News API" },
    { url: "https://store.steampowered.com", description: "Store" }
  ]
},
{
  slug: "epicgames",
  name: "Epic Games",
  logoUrl: "https://www.epicgames.com/favicon.ico",
  endpoints: [
    { url: "https://www.epicgames.com", description: "Homepage" },
    { url: "https://status.epicgames.com/api/v2/status.json", description: "Status API" }
  ]
},
{
  slug: "riotgames",
  name: "Riot Games",
  logoUrl: "https://www.riotgames.com/darkroom/1440/riotsitelogo.png",
  endpoints: [
    { url: "https://euw1.api.riotgames.com/lol/platform/v3/champion-rotations", description: "LoL Rotations" },
    { url: "https://status.riotgames.com", description: "Status Page" }
  ]
},
{
  slug: "spotify",
  name: "Spotify",
  logoUrl: "https://www.scdn.co/i/_global/favicon.png",
  endpoints: [
    { url: "https://api.spotify.com/v1/search?q=test&type=track", description: "Search API" },
    { url: "https://open.spotify.com", description: "Homepage" }
  ]
},
{
  slug: "youtube",
  name: "YouTube",
  logoUrl: "https://www.youtube.com/s/desktop/14a45e26/img/favicon_32x32.png",
  endpoints: [
    { url: "https://www.googleapis.com/youtube/v3/videos?id=Ks-_Mh1QhMc&part=snippet", description: "YouTube API" },
    { url: "https://youtube.com", description: "Homepage" }
  ]
},
{
  slug: "cloudflareworkers",
  name: "Cloudflare Workers",
  logoUrl: "https://workers.cloudflare.com/favicon.ico",
  endpoints: [
    { url: "https://workers.cloudflare.com", description: "Homepage" },
    { url: "https://api.cloudflare.com/client/v4", description: "API Root" }
  ]
},
{
  slug: "heroku",
  name: "Heroku",
  logoUrl: "https://www.herokucdn.com/favicon.ico",
  endpoints: [
    { url: "https://dashboard.heroku.com", description: "Dashboard" },
    { url: "https://api.heroku.com/apps", description: "Apps API" }
  ]
},
{
  slug: "gitlab",
  name: "GitLab",
  logoUrl: "https://about.gitlab.com/images/press/logo/png/gitlab-icon-rgb.png",
  endpoints: [
    { url: "https://gitlab.com/api/v4/projects", description: "Projects API" },
    { url: "https://gitlab.com", description: "Homepage" }
  ]
},
{
  slug: "polygon",
  name: "Polygon RPC",
  logoUrl: "https://polygon.technology/favicon.ico",
  endpoints: [
    { url: "https://polygon-rpc.com", description: "RPC Root" },
    { url: "https://status.polygon.technology", description: "Status Page" }
  ]
},
{
  slug: "arbitrum",
  name: "Arbitrum",
  logoUrl: "https://arbitrum.io/wp-content/uploads/2021/08/cropped-arbitrum_logo-192x192.png",
  endpoints: [
    { url: "https://arb1.arbitrum.io/rpc", description: "RPC" },
    { url: "https://status.arbitrum.io", description: "Status API" }
  ]
},
{
  slug: "solana",
  name: "Solana",
  logoUrl: "https://solana.com/favicon.ico",
  endpoints: [
    { url: "https://api.mainnet-beta.solana.com", description: "RPC" },
    { url: "https://explorer.solana.com", description: "Explorer" }
  ]
},
{
  slug: "coingecko",
  name: "CoinGecko",
  logoUrl: "https://www.coingecko.com/favicon.ico",
  endpoints: [
    { url: "https://api.coingecko.com/api/v3/ping", description: "Ping" },
    { url: "https://api.coingecko.com/api/v3/status_updates", description: "Status Updates" }
  ]
}

  ];

  for (const p of providers) {
    // Vérifier si le provider existe
    let provider = await prisma.provider.findUnique({
      where: { slug: p.slug }
    });

    if (!provider) {
      provider = await prisma.provider.create({
        data: {
          slug: p.slug,
          name: p.name,
          logoUrl: p.logoUrl
        }
      });
      console.log(`✔ Created provider: ${provider.name}`);
    } else {
      console.log(`↻ Provider already exists: ${provider.name}`);
    }

    // Endpoints : upsert un par un
    for (const ep of p.endpoints) {
      const exists = await prisma.endpoint.findFirst({
        where: { url: ep.url }
      });

      if (!exists) {
        await prisma.endpoint.create({
          data: {
            providerId: provider.id,
            url: ep.url,
            description: ep.description,
            method: "GET",
            region: "global"
          }
        });
        console.log(`   ✔ Added endpoint: ${ep.url}`);
      } else {
        console.log(`   ↻ Endpoint exists: ${ep.url}`);
      }
    }
  }

  console.log("🌱 DONE");
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
