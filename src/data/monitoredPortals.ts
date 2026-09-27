export interface MonitoredPortal {
  company: string;
  provider: 'greenhouse' | 'lever' | 'ashby' | 'workday' | 'smartrecruiters' | 'custom';
  domain: string;
  careersUrl: string;
  description: string;
}

export const MONITORED_PORTALS: MonitoredPortal[] = [
  // AI & ML
  {
    company: "OpenAI",
    provider: "greenhouse",
    domain: "AI / ML",
    careersUrl: "https://openai.com/careers",
    description: "Frontier artificial intelligence research and deployment."
  },
  {
    company: "Anthropic",
    provider: "ashby",
    domain: "AI / ML",
    careersUrl: "https://www.anthropic.com/careers",
    description: "AI safety and research company building reliable, steerable AI systems."
  },
  {
    company: "Scale AI",
    provider: "greenhouse",
    domain: "AI / ML",
    careersUrl: "https://scale.com/careers",
    description: "Data infrastructure foundation for AI applications."
  },
  {
    company: "Cohere",
    provider: "lever",
    domain: "AI / ML",
    careersUrl: "https://cohere.com/careers",
    description: "Enterprise AI platform for natural language processing and LLMs."
  },
  {
    company: "Hugging Face",
    provider: "greenhouse",
    domain: "AI / ML",
    careersUrl: "https://huggingface.co/join-us",
    description: "The platform where the machine learning community collaborates."
  },

  // Dev Tools & Infrastructure
  {
    company: "Datadog",
    provider: "greenhouse",
    domain: "Dev Tools & Infra",
    careersUrl: "https://www.datadoghq.com/careers",
    description: "Observability and security platform for cloud applications."
  },
  {
    company: "Cloudflare",
    provider: "greenhouse",
    domain: "Dev Tools & Infra",
    careersUrl: "https://www.cloudflare.com/careers",
    description: "Global cloud services provider securing and accelerating web traffic."
  },
  {
    company: "Vercel",
    provider: "greenhouse",
    domain: "Dev Tools & Infra",
    careersUrl: "https://vercel.com/careers",
    description: "Frontend cloud platform for developing and deploying web apps."
  },
  {
    company: "Supabase",
    provider: "ashby",
    domain: "Dev Tools & Infra",
    careersUrl: "https://supabase.com/careers",
    description: "Open source Firebase alternative with Postgres database."
  },
  {
    company: "Snowflake",
    provider: "greenhouse",
    domain: "Dev Tools & Infra",
    careersUrl: "https://careers.snowflake.com",
    description: "Data Cloud enabling every organization to mobilize their data."
  },
  {
    company: "MongoDB",
    provider: "greenhouse",
    domain: "Dev Tools & Infra",
    careersUrl: "https://www.mongodb.com/careers",
    description: "Leading developer data platform based on document architecture."
  },
  {
    company: "GitLab",
    provider: "greenhouse",
    domain: "Dev Tools & Infra",
    careersUrl: "https://about.gitlab.com/jobs",
    description: "The complete DevSecOps platform delivered as a single application."
  },
  {
    company: "HashiCorp",
    provider: "greenhouse",
    domain: "Dev Tools & Infra",
    careersUrl: "https://www.hashicorp.com/careers",
    description: "Cloud infrastructure automation tooling (Terraform, Vault, Consul)."
  },

  // Fintech & Payments
  {
    company: "Stripe",
    provider: "greenhouse",
    domain: "Fintech & Payments",
    careersUrl: "https://stripe.com/jobs",
    description: "Financial infrastructure for the internet."
  },
  {
    company: "Ramp",
    provider: "ashby",
    domain: "Fintech & Payments",
    careersUrl: "https://ramp.com/careers",
    description: "Finance automation platform designed to save businesses time and money."
  },
  {
    company: "Brex",
    provider: "greenhouse",
    domain: "Fintech & Payments",
    careersUrl: "https://www.brex.com/careers",
    description: "Corporate cards and spend management software for modern businesses."
  },
  {
    company: "Robinhood",
    provider: "greenhouse",
    domain: "Fintech & Payments",
    careersUrl: "https://robinhood.com/careers",
    description: "Commission-free investing and financial services platform."
  },
  {
    company: "Coinbase",
    provider: "greenhouse",
    domain: "Fintech & Payments",
    careersUrl: "https://www.coinbase.com/careers",
    description: "Secure online platform for buying, selling, and managing cryptocurrency."
  },
  {
    company: "Plaid",
    provider: "lever",
    domain: "Fintech & Payments",
    careersUrl: "https://plaid.com/careers",
    description: "Data network powering the fintech tools that millions rely on."
  },
  {
    company: "PhonePe",
    provider: "greenhouse",
    domain: "Fintech & Payments",
    careersUrl: "https://www.phonepe.com/careers",
    description: "India's leading digital payments and financial services network."
  },

  // Enterprise SaaS & Productivity
  {
    company: "Atlassian",
    provider: "lever",
    domain: "Enterprise SaaS",
    careersUrl: "https://www.atlassian.com/company/careers",
    description: "Team collaboration software including Jira, Confluence, and Trello."
  },
  {
    company: "Figma",
    provider: "greenhouse",
    domain: "Enterprise SaaS",
    careersUrl: "https://www.figma.com/careers",
    description: "Collaborative design platform for building digital products."
  },
  {
    company: "Notion",
    provider: "ashby",
    domain: "Enterprise SaaS",
    careersUrl: "https://www.notion.so/careers",
    description: "Connected workspace for notes, tasks, wikis, and project databases."
  },
  {
    company: "Linear",
    provider: "ashby",
    domain: "Enterprise SaaS",
    careersUrl: "https://linear.app/careers",
    description: "Purpose-built tool for modern software development and issue tracking."
  },
  {
    company: "Canva",
    provider: "greenhouse",
    domain: "Enterprise SaaS",
    careersUrl: "https://www.canva.com/careers",
    description: "Visual communication platform empowering the world to design."
  },
  {
    company: "Slack",
    provider: "workday",
    domain: "Enterprise SaaS",
    careersUrl: "https://slack.com/careers",
    description: "Collaboration hub connecting people, applications, and data."
  },
  {
    company: "Retool",
    provider: "ashby",
    domain: "Enterprise SaaS",
    careersUrl: "https://retool.com/careers",
    description: "Fast way to build internal software and business tools."
  },

  // Big Tech & Consumer
  {
    company: "Airbnb",
    provider: "greenhouse",
    domain: "Big Tech & Consumer",
    careersUrl: "https://careers.airbnb.com",
    description: "Global community marketplace for unique travel accommodations."
  },
  {
    company: "Uber",
    provider: "greenhouse",
    domain: "Big Tech & Consumer",
    careersUrl: "https://www.uber.com/careers",
    description: "Mobility as a service, ride-hailing, and delivery network."
  },
  {
    company: "DoorDash",
    provider: "greenhouse",
    domain: "Big Tech & Consumer",
    careersUrl: "https://careers.doordash.com",
    description: "Technology platform connecting consumers with local businesses."
  },
  {
    company: "Spotify",
    provider: "lever",
    domain: "Big Tech & Consumer",
    careersUrl: "https://www.spotifyjobs.com",
    description: "World's most popular audio streaming subscription service."
  },
  {
    company: "Discord",
    provider: "greenhouse",
    domain: "Big Tech & Consumer",
    careersUrl: "https://discord.com/careers",
    description: "Voice, video, and text communication service used by over a hundred million people."
  },
  {
    company: "Pinterest",
    provider: "greenhouse",
    domain: "Big Tech & Consumer",
    careersUrl: "https://www.pinterestcareers.com",
    description: "Visual discovery engine for finding ideas like recipes, home and style inspiration."
  },
  {
    company: "Reddit",
    provider: "greenhouse",
    domain: "Big Tech & Consumer",
    careersUrl: "https://www.redditinc.com/careers",
    description: "Network of communities where people dive into their interests and passions."
  },
  {
    company: "Meesho",
    provider: "lever",
    domain: "Big Tech & Consumer",
    careersUrl: "https://www.meesho.io/jobs",
    description: "India's fastest-growing internet commerce marketplace."
  }
];
