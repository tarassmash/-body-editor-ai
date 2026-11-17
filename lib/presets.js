// All prompts are built server-side from a fixed whitelist.
// Users never send free-form prompts, so the app cannot be used to request
// nudity, sexualised edits or edits of other people's identity.

const SAFETY_SUFFIX =
  ' Keep the same person, same face and identity, same pose, same background and same lighting.' +
  ' The person stays fully clothed in appropriate, non-revealing clothing.' +
  ' Photorealistic, natural, tasteful, non-sexual, family-friendly result.';

const LEVELS = {
  1: 'very subtle',
  2: 'subtle',
  3: 'moderate',
  4: 'noticeable',
  5: 'strong but still realistic',
};

export const TOOLS = {
  slim: {
    label: 'Slim & tone',
    build: (lvl) => `Make the person's body ${LEVELS[lvl]}ly slimmer and more toned, with a healthy, athletic, realistic look. Keep clothing the same.`,
  },
  muscles: {
    label: 'Muscles',
    options: {
      arms: 'arms and shoulders',
      chest: 'chest and shoulders',
      full: 'whole upper body',
      legs: 'legs',
    },
    build: (lvl, opt) => `Give the person ${LEVELS[lvl]} more muscular, fit ${opt} as from regular gym training. Keep clothing the same, do not remove or reduce clothing.`,
  },
  abs: {
    label: 'Fit waist',
    build: (lvl) => `Make the person's waist and midsection ${LEVELS[lvl]}ly slimmer and fitter, natural healthy look. Keep clothing on and unchanged.`,
  },
  outfit: {
    label: 'Outfit',
    options: {
      business: 'a tailored business suit',
      casual: 'casual jeans and a plain t-shirt',
      smart: 'smart-casual chinos and a shirt',
      evening: 'an elegant long evening outfit with covered shoulders',
      sport: 'a full athletic tracksuit',
      winter: 'a warm winter coat, scarf and trousers',
      streetwear: 'a modern streetwear hoodie and joggers',
      traditional: 'a traditional embroidered vyshyvanka shirt',
    },
    build: (_lvl, opt) => `Change the person's clothing to ${opt}. Clothing must fully cover the torso.`,
  },
  height: {
    label: 'Height & proportions',
    build: (lvl) => `Make the person look ${LEVELS[lvl]}ly taller with longer, well-balanced legs and natural body proportions.`,
  },
  posture: {
    label: 'Posture',
    build: (lvl) => `Improve the person's posture ${LEVELS[lvl]}ly: straighter back, open shoulders, confident stance.`,
  },
  skin: {
    label: 'Skin retouch',
    build: (lvl) => `Apply ${LEVELS[lvl]} natural skin retouching: even skin tone, reduce blemishes, keep real skin texture. Do not change skin color or ethnicity.`,
  },
  tattoo: {
    label: 'Tattoo try-on',
    options: {
      forearm_floral: 'a fine-line floral tattoo on the visible forearm',
      forearm_geo: 'a minimalist geometric tattoo on the visible forearm',
      hand_small: 'a small minimalist symbol tattoo on the hand',
      arm_sleeve: 'a black-and-grey ornamental sleeve tattoo on the visible arm',
    },
    build: (_lvl, opt) => `Add ${opt}. Place it only on skin that is already visible; do not change clothing.`,
  },
  remove_tattoo: {
    label: 'Remove tattoos',
    build: () => 'Remove all visible tattoos from the skin, natural skin texture.',
  },
};

export function buildPrompt(tool, level, option) {
  const t = TOOLS[tool];
  if (!t) return null;
  const lvl = Math.min(5, Math.max(1, parseInt(level, 10) || 3));
  let opt;
  if (t.options) {
    opt = t.options[option];
    if (!opt) return null;
  }
  return t.build(lvl, opt) + SAFETY_SUFFIX;
}

export function publicCatalog() {
  return Object.fromEntries(
    Object.entries(TOOLS).map(([id, t]) => [
      id,
      { label: t.label, options: t.options ? Object.keys(t.options) : null, hasLevel: !t.options && id !== 'remove_tattoo' },
    ]),
  );
}
