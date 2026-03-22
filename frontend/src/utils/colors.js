// Muted, matted color palette — darker pigments of the original bright colors
// Each category gets a signature color for gradients and accents

const MUTED_COLORS = {
  'social-media':          { base: '#3D6B8E', light: '#3D6B8E22', gradient: 'from-[#3D6B8E]/30' },
  'seo-sem':               { base: '#C4942A', light: '#C4942A22', gradient: 'from-[#C4942A]/30' },
  'influencer-marketing':  { base: '#B4687A', light: '#B4687A22', gradient: 'from-[#B4687A]/30' },
  'integrated-marketing':  { base: '#2D8B7A', light: '#2D8B7A22', gradient: 'from-[#2D8B7A]/30' },
  'consumer-behavior':     { base: '#7B5E8D', light: '#7B5E8D22', gradient: 'from-[#7B5E8D]/30' },
  'branding':              { base: '#C2544D', light: '#C2544D22', gradient: 'from-[#C2544D]/30' },
  'marketing-tools':       { base: '#BF6B3A', light: '#BF6B3A22', gradient: 'from-[#BF6B3A]/30' },
  'digital-marketing':     { base: '#5C8A6E', light: '#5C8A6E22', gradient: 'from-[#5C8A6E]/30' },
  'marketing-and-ai':      { base: '#4A6FA5', light: '#4A6FA522', gradient: 'from-[#4A6FA5]/30' },
  'keywords':              { base: '#A67C52', light: '#A67C5222', gradient: 'from-[#A67C52]/30' },
  'careers':               { base: '#6B8E5C', light: '#6B8E5C22', gradient: 'from-[#6B8E5C]/30' },
  'growth-hacking':        { base: '#C2544D', light: '#C2544D22', gradient: 'from-[#C2544D]/30' },
};

// Fallback color cycle for dynamic/user-added categories
const COLOR_CYCLE = [
  { base: '#3D6B8E', light: '#3D6B8E22' },
  { base: '#C4942A', light: '#C4942A22' },
  { base: '#B4687A', light: '#B4687A22' },
  { base: '#2D8B7A', light: '#2D8B7A22' },
  { base: '#7B5E8D', light: '#7B5E8D22' },
  { base: '#C2544D', light: '#C2544D22' },
  { base: '#BF6B3A', light: '#BF6B3A22' },
  { base: '#5C8A6E', light: '#5C8A6E22' },
  { base: '#4A6FA5', light: '#4A6FA522' },
  { base: '#A67C52', light: '#A67C5222' },
];

export function getCategoryColor(slug) {
  if (MUTED_COLORS[slug]) return MUTED_COLORS[slug];
  // Deterministic fallback based on slug hash
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  return COLOR_CYCLE[Math.abs(hash) % COLOR_CYCLE.length];
}

// Hero title colors — muted, sophisticated
export const TITLE_COLORS = ['#C2544D', '#BF6B3A', '#C4942A', '#5C8A6E', '#2D8B7A', '#3D6B8E', '#4A6FA5', '#7B5E8D', '#B4687A', '#C2544D', '#A67C52', '#6B8E5C', '#BF6B3A'];
