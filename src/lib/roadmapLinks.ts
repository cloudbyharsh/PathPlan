/** Maps skill names to roadmap.sh slugs for deep-linking */
const SLUG_MAP: Record<string, string> = {
  // Technical
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  react: "react",
  "node.js": "nodejs",
  nodejs: "nodejs",
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  git: "git-github",
  linux: "linux",
  sql: "sql",
  graphql: "graphql",
  "rest api": "api-design",
  "system design": "system-design",
  devops: "devops",
  "ci/cd": "devops",
  // Data & Analytics
  "data analysis": "data-analyst",
  "a/b testing": "data-analyst",
  tableau: "data-analyst",
  "google analytics": "data-analyst",
  "machine learning": "mlops",
  "data science": "data-analyst",
  // Product
  "product management": "product-manager",
  roadmapping: "product-manager",
  "product strategy": "product-manager",
  // Design
  figma: "ux-design",
  ux: "ux-design",
  "ux design": "ux-design",
  "ui design": "ux-design",
  // Other
  "software architecture": "software-architect",
  android: "android",
  ios: "ios",
  flutter: "flutter",
  "react native": "react-native",
  postgresql: "postgresql",
  mongodb: "mongodb",
  redis: "redis",
  "computer science": "computer-science",
  blockchain: "blockchain",
  cybersecurity: "cyber-security",
  qa: "qa",
  "quality assurance": "qa",
};

export function getRoadmapUrl(skill: string): string | null {
  const slug = SLUG_MAP[skill.toLowerCase().trim()];
  return slug ? `https://roadmap.sh/${slug}` : null;
}

export function getRoadmapSlug(skill: string): string | null {
  return SLUG_MAP[skill.toLowerCase().trim()] ?? null;
}
