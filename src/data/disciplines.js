export const DISCIPLINE_CATEGORIES = [
  {
    id: 'yoga',
    label: 'Yoga & Mind-Body Movement',
    emoji: '🧘',
    items: [
      'Hatha Yoga', 'Vinyasa Yoga', 'Ashtanga Yoga', 'Yin Yoga',
      'Restorative Yoga', 'Hot Yoga / Bikram', 'Prenatal Yoga',
      'Chair Yoga', 'Acro Yoga', 'Yoga Flow / Power Yoga', 'Somatic Movement',
    ],
  },
  {
    id: 'pilates',
    label: 'Pilates & Similar',
    emoji: '🤸',
    items: [
      'Mat Pilates', 'Reformer Pilates', 'Barre',
      'Clinical / Physical Therapy Pilates', 'Hot Matt Pilates', 'Lagree',
    ],
  },
  {
    id: 'martial',
    label: 'Martial Arts & Combat Sports',
    emoji: '🥋',
    items: [
      'Brazilian Jiu-Jitsu (BJJ)', 'Boxing', 'Muay Thai', 'Kickboxing',
      'Taekwondo', 'Karate', 'Judo', 'Wrestling', 'Krav Maga',
      'Mixed Martial Arts (MMA)',
    ],
  },
  {
    id: 'cardio',
    label: 'Cardio & Functional Training',
    emoji: '🚴',
    items: [
      'Spinning / Indoor Cycling', 'HIIT', 'Bootcamp',
      'Dance Cardio (e.g., Zumba, Jungle Body)',
      // ── Added per client revision ──
      'Personal Trainer', 'Aerobics',
    ],
  },
  {
    id: 'sports',
    label: 'Sports & Outdoor',
    emoji: '⛹️',
    items: [
      'Swimming', 'Horse Riding', 'Tennis', 'Climbing / Bouldering',
      'Snow Sports', 'Soccer', 'Surfing', 'Sailing', 'Archery', 'Fencing',
      'Paddle Boarding', 'Rowing', 'Gymnastics', 'AFL', 'Basketball',
      'Rugby', 'Cricket', 'Coach (Other)',
    ],
  },
  {
    id: 'mindbody',
    label: 'Mind Body / Wellness Relaxation',
    emoji: '🧠',
    items: [
      'Breathwork / Pranayama', 'Meditation', 'Reiki Healer / Light Workers',
      'Sound Bath / Sound Healing', 'Tai Chi', 'Qigong',
    ],
  },
  {
    id: 'holistic',
    label: 'Holistic & Wellness Therapies',
    emoji: '🌿',
    items: [
      'Acupuncture', 'Somatic Therapy', 'Traditional Chinese Medicine',
      'Naturopath', 'Nutritionist',
    ],
  },
  {
    id: 'recovery',
    label: 'Recovery & Regeneration',
    emoji: '💆',
    items: [
      'Massage', 'Bowen Therapy', 'Physio Therapy',
      'Myofascial Release', 'Cupping',
    ],
  },
  {
    id: 'dance',
    label: 'Dance & Expressive Movement',
    emoji: '💃',
    items: [
      'Ballet Fitness', 'Contemporary Dance', 'Hip-Hop Dance',
      'Latin Dance (Salsa, Bachata)', 'Ballroom Dance',
      'Pole Fitness and Exotic Dance', 'Dance + Strength Fusion',
      'Dance Movement Therapy', 'Aerial Fitness / Silks',
    ],
  },
  {
    id: 'operations',
    label: 'Studio Operations',
    emoji: '📋',
    items: [
      'Administration Staff', 'Other',
    ],
  },
];

export const ALL_DISCIPLINES = DISCIPLINE_CATEGORIES.flatMap((c) => c.items);