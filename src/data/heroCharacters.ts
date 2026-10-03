import { PathCode } from '../types';

export type HeroGender = 'male' | 'female';

export interface HeroGenderConfig {
  gender: HeroGender;
  label: string;
  characterName: string;
  title: string;
  description: string;
  avatarUrl: string;
  illustrationUrl: string;
  spritesheetUrl: string;
  combatSpritesheetUrl: string;
}

export interface HeroRoleConfig {
  pathCode: PathCode;
  roleName: string;
  themeColor: string;
  male: HeroGenderConfig;
  female: HeroGenderConfig;
}

export const HERO_ROLES: Record<PathCode, HeroRoleConfig> = {
  professional: {
    pathCode: 'professional',
    roleName: 'Ksatria Strategis (Knight)',
    themeColor: '#38bdf8',
    male: {
      gender: 'male',
      label: 'Laki-laki',
      characterName: 'Valen the Steadfast',
      title: 'Ksatria Strategis (L)',
      description: 'Rambut pirang, zirah perak, perisai, pedang, dan jubah biru safir. Berwibawa dan penuh kepemimpinan.',
      avatarUrl: '/assets/heroes/avatars/knight_male.webp',
      illustrationUrl: '/assets/heroes/illustrations/knight_male.webp',
      spritesheetUrl: '/assets/heroes/sprites/hero_knight_male_spritesheet.png',
      combatSpritesheetUrl: '/assets/heroes/sprites/hero_knight_male_combat.png'
    },
    female: {
      gender: 'female',
      label: 'Perempuan',
      characterName: 'Aria the Vanguard',
      title: 'Ksatria Strategis (P)',
      description: 'Kuncir kuda cokelat, zirah perak, perisai, pedang, dan jubah biru safir. Berintegritas tinggi dan analitis.',
      avatarUrl: '/assets/heroes/avatars/knight_female.webp',
      illustrationUrl: '/assets/heroes/illustrations/knight_female.webp',
      spritesheetUrl: '/assets/heroes/sprites/hero_knight_female_spritesheet.png',
      combatSpritesheetUrl: '/assets/heroes/sprites/hero_knight_female_combat.png'
    }
  },
  social_impact: {
    pathCode: 'social_impact',
    roleName: 'Mistikus Dampak (Mage)',
    themeColor: '#34d399',
    male: {
      gender: 'male',
      label: 'Laki-laki',
      characterName: 'Rowan the Scholar',
      title: 'Mistikus Dampak (L)',
      description: 'Rambut dark teal rapi cendekiawan, mantel panjang zamrud bersulam emas dengan tongkat kristal runik.',
      avatarUrl: '/assets/heroes/avatars/mage_male.webp',
      illustrationUrl: '/assets/heroes/illustrations/mage_male.webp',
      spritesheetUrl: '/assets/heroes/sprites/hero_mage_male_spritesheet.png',
      combatSpritesheetUrl: '/assets/heroes/sprites/hero_mage_male_combat.png'
    },
    female: {
      gender: 'female',
      label: 'Perempuan',
      characterName: 'Sylvia the Guardian',
      title: 'Mistikus Dampak (P)',
      description: 'Rambut cokelat bergelombang, jubah hijau zamrud dan putih gading, dengan tongkat kristal biru.',
      avatarUrl: '/assets/heroes/avatars/mage_female.webp',
      illustrationUrl: '/assets/heroes/illustrations/mage_female.webp',
      spritesheetUrl: '/assets/heroes/sprites/hero_mage_female_spritesheet.png',
      combatSpritesheetUrl: '/assets/heroes/sprites/hero_mage_female_combat.png'
    }
  },
  business: {
    pathCode: 'business',
    roleName: 'Assassin Lincah (Assassin)',
    themeColor: '#fbbf24',
    male: {
      gender: 'male',
      label: 'Laki-laki',
      characterName: 'Ren the Venturer',
      title: 'Assassin Lincah (L)',
      description: 'Rambut cokelat pendek, zirah kulit arang, selempang merah tua, dan belati ganda. Cerdik dan tangkas.',
      avatarUrl: '/assets/heroes/avatars/assassin_male.webp',
      illustrationUrl: '/assets/heroes/illustrations/rogue_male.webp',
      spritesheetUrl: '/assets/heroes/sprites/hero_assassin_male_spritesheet.png',
      combatSpritesheetUrl: '/assets/heroes/sprites/hero_assassin_male_combat.png'
    },
    female: {
      gender: 'female',
      label: 'Perempuan',
      characterName: 'Lyra the Swift',
      title: 'Assassin Lincah (P)',
      description: 'Rambut cokelat terikat, zirah kulit arang, selempang merah tua, dan belati ganda. Gesit menangkap peluang.',
      avatarUrl: '/assets/heroes/avatars/assassin_female.webp',
      illustrationUrl: '/assets/heroes/illustrations/rogue_female.webp',
      spritesheetUrl: '/assets/heroes/sprites/hero_assassin_female_spritesheet.png',
      combatSpritesheetUrl: '/assets/heroes/sprites/hero_assassin_female_combat.png'
    }
  }
};

const GENDER_STORAGE_KEY = 'ecc_hero_gender';

export function getSavedHeroGender(): HeroGender {
  if (typeof window === 'undefined') return 'male';
  const saved = localStorage.getItem(GENDER_STORAGE_KEY);
  return saved === 'female' ? 'female' : 'male';
}

export function saveHeroGender(gender: HeroGender): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(GENDER_STORAGE_KEY, gender);
    window.dispatchEvent(new CustomEvent('heroGenderChanged', { detail: { gender } }));
  }
}

export function getHeroConfig(pathCode: PathCode, gender: HeroGender = 'male'): HeroGenderConfig {
  const role = HERO_ROLES[pathCode] || HERO_ROLES.professional;
  return role[gender];
}

export function getHeroAvatar(pathCode: PathCode, gender: HeroGender = 'male'): string {
  return getHeroConfig(pathCode, gender).avatarUrl;
}

export function getHeroSprite(pathCode: PathCode, gender: HeroGender = 'male'): string {
  return getHeroConfig(pathCode, gender).spritesheetUrl;
}

export function getHeroCombatSprite(pathCode: PathCode, gender: HeroGender = 'male'): string {
  return getHeroConfig(pathCode, gender).combatSpritesheetUrl;
}
