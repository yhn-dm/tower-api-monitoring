/**
 * Seed script: creates initial providers and endpoints for development/demo.
 */
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

  const extraProvidersBase = [
    {
      slug: "gcp",
      name: "Google Cloud Platform",
      logoUrl: "https://cloud.google.com/favicon.ico",
      homeUrl: "https://cloud.google.com",
      apiUrl: "https://status.cloud.google.com",
    },
    {
      slug: "oraclecloud",
      name: "Oracle Cloud",
      logoUrl: "https://www.oracle.com/favicon.ico",
      homeUrl: "https://cloud.oracle.com",
      apiUrl: "https://www.oracle.com/cloud/status/",
    },
    {
      slug: "ibmcloud",
      name: "IBM Cloud",
      logoUrl: "https://www.ibm.com/favicon.ico",
      homeUrl: "https://cloud.ibm.com",
      apiUrl: "https://status.cloud.ibm.com",
    },
    {
      slug: "ovhcloud",
      name: "OVHcloud",
      logoUrl: "https://www.ovhcloud.com/favicon.ico",
      homeUrl: "https://www.ovhcloud.com",
      apiUrl: "https://status.ovhcloud.com",
    },
    {
      slug: "scaleway",
      name: "Scaleway",
      logoUrl: "https://www.scaleway.com/favicon.ico",
      homeUrl: "https://www.scaleway.com",
      apiUrl: "https://status.scaleway.com",
    },
    {
      slug: "linode",
      name: "Linode",
      logoUrl: "https://www.linode.com/favicon.ico",
      homeUrl: "https://www.linode.com",
      apiUrl: "https://status.linode.com",
    },
    {
      slug: "vultr",
      name: "Vultr",
      logoUrl: "https://www.vultr.com/favicon.ico",
      homeUrl: "https://www.vultr.com",
      apiUrl: "https://status.vultr.com",
    },
    {
      slug: "hetzner",
      name: "Hetzner",
      logoUrl: "https://www.hetzner.com/favicon.ico",
      homeUrl: "https://www.hetzner.com",
      apiUrl: "https://status.hetzner.com",
    },
    {
      slug: "flyio",
      name: "Fly.io",
      logoUrl: "https://fly.io/favicon.ico",
      homeUrl: "https://fly.io",
      apiUrl: "https://status.fly.io",
    },
    {
      slug: "render",
      name: "Render",
      logoUrl: "https://render.com/favicon.ico",
      homeUrl: "https://render.com",
      apiUrl: "https://status.render.com",
    },
    {
      slug: "fastly",
      name: "Fastly",
      logoUrl: "https://www.fastly.com/favicon.ico",
      homeUrl: "https://www.fastly.com",
      apiUrl: "https://status.fastly.com",
    },
    {
      slug: "akamai",
      name: "Akamai",
      logoUrl: "https://www.akamai.com/favicon.ico",
      homeUrl: "https://www.akamai.com",
      apiUrl: "https://www.akamai.com/global-services/support/system-status",
    },
    {
      slug: "datadog",
      name: "Datadog",
      logoUrl: "https://www.datadoghq.com/favicon.ico",
      homeUrl: "https://www.datadoghq.com",
      apiUrl: "https://api.datadoghq.com/api/v1/validate",
    },
    {
      slug: "newrelic",
      name: "New Relic",
      logoUrl: "https://newrelic.com/favicon.ico",
      homeUrl: "https://newrelic.com",
      apiUrl: "https://status.newrelic.com",
    },
    {
      slug: "sentry",
      name: "Sentry",
      logoUrl: "https://sentry.io/_static/6b76c/favicon.ico",
      homeUrl: "https://sentry.io",
      apiUrl: "https://status.sentry.io",
    },
    {
      slug: "rollbar",
      name: "Rollbar",
      logoUrl: "https://rollbar.com/favicon.ico",
      homeUrl: "https://rollbar.com",
      apiUrl: "https://status.rollbar.com",
    },
    {
      slug: "honeycomb",
      name: "Honeycomb",
      logoUrl: "https://www.honeycomb.io/favicon.ico",
      homeUrl: "https://www.honeycomb.io",
      apiUrl: "https://status.honeycomb.io",
    },
    {
      slug: "uptimerobot",
      name: "UptimeRobot",
      logoUrl: "https://uptimerobot.com/favicon.ico",
      homeUrl: "https://uptimerobot.com",
      apiUrl: "https://api.uptimerobot.com/v2/getAccountDetails",
    },
    {
      slug: "pingdom",
      name: "Pingdom",
      logoUrl: "https://www.pingdom.com/favicon.ico",
      homeUrl: "https://www.pingdom.com",
      apiUrl: "https://status.pingdom.com",
    },
    {
      slug: "sendgrid",
      name: "SendGrid",
      logoUrl: "https://sendgrid.com/favicon.ico",
      homeUrl: "https://sendgrid.com",
      apiUrl: "https://status.sendgrid.com",
    },
    {
      slug: "mailgun",
      name: "Mailgun",
      logoUrl: "https://www.mailgun.com/favicon.ico",
      homeUrl: "https://www.mailgun.com",
      apiUrl: "https://status.mailgun.com",
    },
    {
      slug: "postmark",
      name: "Postmark",
      logoUrl: "https://postmarkapp.com/favicon.ico",
      homeUrl: "https://postmarkapp.com",
      apiUrl: "https://status.postmarkapp.com",
    },
    {
      slug: "mailchimp",
      name: "Mailchimp",
      logoUrl: "https://mailchimp.com/favicon.ico",
      homeUrl: "https://mailchimp.com",
      apiUrl: "https://mailchimp.com/api",
    },
    {
      slug: "sparkpost",
      name: "SparkPost",
      logoUrl: "https://www.sparkpost.com/favicon.ico",
      homeUrl: "https://www.sparkpost.com",
      apiUrl: "https://status.sparkpost.com",
    },
    {
      slug: "twilio",
      name: "Twilio",
      logoUrl: "https://www.twilio.com/favicon.ico",
      homeUrl: "https://www.twilio.com",
      apiUrl: "https://status.twilio.com",
    },
    {
      slug: "vonage",
      name: "Vonage",
      logoUrl: "https://www.vonage.com/favicon.ico",
      homeUrl: "https://www.vonage.com",
      apiUrl: "https://status.nexmo.com",
    },
    {
      slug: "messagebird",
      name: "MessageBird",
      logoUrl: "https://www.messagebird.com/favicon.ico",
      homeUrl: "https://www.messagebird.com",
      apiUrl: "https://status.messagebird.com",
    },
    {
      slug: "pusher",
      name: "Pusher",
      logoUrl: "https://pusher.com/favicon.ico",
      homeUrl: "https://pusher.com",
      apiUrl: "https://status.pusher.com",
    },
    {
      slug: "ably",
      name: "Ably",
      logoUrl: "https://ably.com/favicon.ico",
      homeUrl: "https://ably.com",
      apiUrl: "https://status.ably.com",
    },
    {
      slug: "algolia",
      name: "Algolia",
      logoUrl: "https://www.algolia.com/static_assets/images/favicon.6c3bda7f.ico",
      homeUrl: "https://www.algolia.com",
      apiUrl: "https://status.algolia.com",
    },
    {
      slug: "auth0",
      name: "Auth0",
      logoUrl: "https://auth0.com/favicon.ico",
      homeUrl: "https://auth0.com",
      apiUrl: "https://status.auth0.com",
    },
    {
      slug: "okta",
      name: "Okta",
      logoUrl: "https://www.okta.com/favicon.ico",
      homeUrl: "https://www.okta.com",
      apiUrl: "https://trust.okta.com",
    },
    {
      slug: "firebase",
      name: "Firebase",
      logoUrl: "https://firebase.google.com/favicon.ico",
      homeUrl: "https://firebase.google.com",
      apiUrl: "https://status.firebase.google.com",
    },
    {
      slug: "planetscale",
      name: "PlanetScale",
      logoUrl: "https://planetscale.com/favicon.ico",
      homeUrl: "https://planetscale.com",
      apiUrl: "https://status.planetscale.com",
    },
    {
      slug: "neon",
      name: "Neon",
      logoUrl: "https://neon.tech/favicon.ico",
      homeUrl: "https://neon.tech",
      apiUrl: "https://status.neon.tech",
    },
    {
      slug: "cockroachdb",
      name: "CockroachDB Cloud",
      logoUrl: "https://www.cockroachlabs.com/favicon.ico",
      homeUrl: "https://www.cockroachlabs.com",
      apiUrl: "https://status.cockroachlabs.com",
    },
    {
      slug: "mongodbatlas",
      name: "MongoDB Atlas",
      logoUrl: "https://www.mongodb.com/assets/images/global/favicon.ico",
      homeUrl: "https://www.mongodb.com/cloud/atlas",
      apiUrl: "https://status.cloud.mongodb.com",
    },
    {
      slug: "upstash",
      name: "Upstash",
      logoUrl: "https://upstash.com/favicon.ico",
      homeUrl: "https://upstash.com",
      apiUrl: "https://status.upstash.com",
    },
    {
      slug: "backblaze",
      name: "Backblaze B2",
      logoUrl: "https://www.backblaze.com/favicon.ico",
      homeUrl: "https://www.backblaze.com",
      apiUrl: "https://status.backblaze.com",
    },
    {
      slug: "wasabi",
      name: "Wasabi",
      logoUrl: "https://wasabi.com/favicon.ico",
      homeUrl: "https://wasabi.com",
      apiUrl: "https://status.wasabi.com",
    },
    {
      slug: "cloudinary",
      name: "Cloudinary",
      logoUrl: "https://cloudinary.com/favicon.ico",
      homeUrl: "https://cloudinary.com",
      apiUrl: "https://status.cloudinary.com",
    },
    {
      slug: "dockerhub",
      name: "Docker Hub",
      logoUrl: "https://hub.docker.com/favicon.ico",
      homeUrl: "https://hub.docker.com",
      apiUrl: "https://www.dockerstatus.com",
    },
    {
      slug: "npmjs",
      name: "npm Registry",
      logoUrl: "https://www.npmjs.com/favicon.ico",
      homeUrl: "https://www.npmjs.com",
      apiUrl: "https://status.npmjs.org",
    },
    {
      slug: "pypi",
      name: "PyPI",
      logoUrl: "https://pypi.org/static/images/favicon.6a76275d.ico",
      homeUrl: "https://pypi.org",
      apiUrl: "https://status.python.org",
    },
    {
      slug: "circleci",
      name: "CircleCI",
      logoUrl: "https://circleci.com/favicon.ico",
      homeUrl: "https://circleci.com",
      apiUrl: "https://status.circleci.com",
    },
    {
      slug: "jira",
      name: "Jira Cloud",
      logoUrl: "https://www.atlassian.com/favicon.ico",
      homeUrl: "https://www.atlassian.com/software/jira",
      apiUrl: "https://jira.atlassian.com",
    },
    {
      slug: "trello",
      name: "Trello",
      logoUrl: "https://trello.com/favicon.ico",
      homeUrl: "https://trello.com",
      apiUrl: "https://trello.status.atlassian.com",
    },
    {
      slug: "asana",
      name: "Asana",
      logoUrl: "https://asana.com/favicon.ico",
      homeUrl: "https://asana.com",
      apiUrl: "https://status.asana.com",
    },
    {
      slug: "linear",
      name: "Linear",
      logoUrl: "https://linear.app/favicon.ico",
      homeUrl: "https://linear.app",
      apiUrl: "https://status.linear.app",
    },
  ];

  for (const b of extraProvidersBase) {
    providers.push({
      slug: b.slug,
      name: b.name,
      logoUrl: b.logoUrl,
      endpoints: [
        { url: b.homeUrl, description: "Homepage" },
        { url: b.apiUrl, description: "API / Status" },
      ],
    });
  }

  for (const p of providers) {
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
