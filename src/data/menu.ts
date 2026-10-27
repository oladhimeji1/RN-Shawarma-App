import { ImageSourcePropType } from 'react-native';

export type CategoryId = 'all' | 'chicken' | 'beef' | 'mixed' | 'veggie';
export type SizeId = 'wrap' | 'large' | 'plate';

export type Product = {
  id: string;
  name: string;
  blurb: string;
  description: string;
  category: Exclude<CategoryId, 'all'>;
  price: number; // base price of the standard wrap, before discount
  discount?: number; // percent
  rating: number;
  reviews: number;
  prepMin: number;
  kcal: number;
  emoji: string;
  tint: string;
  /** Drop real photos in /assets and set e.g. image: require('../../assets/food/chicken-classic.png') */
  image?: ImageSourcePropType;
};

export const SIZES: { id: SizeId; label: string; hint: string; delta: number }[] = [
  { id: 'wrap', label: 'Wrap', hint: 'Standard', delta: 0 },
  { id: 'large', label: 'Large', hint: '+40% meat', delta: 2 },
  { id: 'plate', label: 'Plate', hint: 'Rice & fries', delta: 4.5 },
];

export const EXTRAS: { id: string; label: string; price: number }[] = [
  { id: 'toum', label: 'Extra garlic toum', price: 0.5 },
  { id: 'meat', label: 'Extra meat', price: 2 },
  { id: 'cheese', label: 'Melted cheese', price: 1 },
  { id: 'fries', label: 'Fries inside', price: 1 },
  { id: 'hot', label: 'Hot sauce', price: 0 },
];

export const CATEGORIES: { id: CategoryId; label: string; emoji?: string }[] = [
  { id: 'chicken', label: 'Chicken', emoji: '🍗' },
  { id: 'beef', label: 'Beef', emoji: '🥩' },
  { id: 'all', label: 'All' },
  { id: 'mixed', label: 'Mixed', emoji: '🌯' },
  { id: 'veggie', label: 'Veggie', emoji: '🥙' },
];

const EMOJI = { chicken: '🍗', beef: '🥩', mixed: '🌯', veggie: '🥙' } as const;

const mk = (
  p: Omit<Product, 'emoji' | 'reviews' | 'prepMin' | 'kcal'> & Partial<Pick<Product, 'reviews' | 'prepMin' | 'kcal'>>,
): Product => ({
  reviews: 120,
  prepMin: 12,
  kcal: 620,
  emoji: EMOJI[p.category],
  ...p,
});

export const MENU: Product[] = [
  mk({ id: 'chicken-classic', name: 'Classic Chicken', blurb: 'Garlic toum & pickles', category: 'chicken', price: 7.5, discount: 25, rating: 4.8, reviews: 412, tint: '#FBD9B8',
    description: 'Chicken marinated overnight, carved off the spit and wrapped in warm saj bread with garlic toum, pickles and a handful of fries.' }),
  mk({ id: 'chicken-peri', name: 'Peri Peri Chicken', blurb: 'Smoky heat & slaw', category: 'chicken', price: 8.9, discount: 10, rating: 4.6, kcal: 680, tint: '#F9C9B2',
    description: 'Spiced chicken shawarma with peri peri sauce, crunchy cabbage slaw and cooling yoghurt. Brings real heat.' }),
  mk({ id: 'chicken-crunch', name: 'Garlic Crunch', blurb: 'Toum & fried onions', category: 'chicken', price: 8.2, rating: 4.7, reviews: 203, tint: '#FCE0B0',
    description: 'Chicken shawarma, a thick layer of toum and crispy fried onions for crunch in every bite.' }),
  mk({ id: 'beef-doner', name: 'Beef Doner', blurb: 'Tahini & sumac onions', category: 'beef', price: 9.5, discount: 15, rating: 4.7, reviews: 288, kcal: 720, tint: '#EDC3A6',
    description: 'Slow-roasted beef sliced thin, wrapped with tahini, parsley and sumac onions. Rich, savoury, a little tangy.' }),
  mk({ id: 'beef-royale', name: 'Spicy Beef Royale', blurb: 'Harissa & jalapeño', category: 'beef', price: 10.4, discount: 10, rating: 4.5, kcal: 760, tint: '#F2B79E',
    description: 'Beef shawarma with house harissa, pickled jalapeños, tomato and a drizzle of tahini.' }),
  mk({ id: 'mixed-royal', name: 'Mixed Royal', blurb: 'Chicken, beef & garlic', category: 'mixed', price: 10.9, discount: 20, rating: 4.9, reviews: 530, kcal: 790, prepMin: 14, tint: '#F7CDA4',
    description: 'Can’t pick? Chicken and beef shawarma together with toum, tahini, pickles and tomato.' }),
  mk({ id: 'mixed-jumbo', name: 'Jumbo Mix', blurb: 'Double meat, extra sauce', category: 'mixed', price: 13.2, rating: 4.8, reviews: 176, kcal: 980, prepMin: 15, tint: '#F3BE98',
    description: 'A double portion of mixed meat with both sauces. Built for a very hungry evening.' }),
  mk({ id: 'veg-falafel', name: 'Crispy Falafel', blurb: 'Hummus & pickled turnip', category: 'veggie', price: 6.4, discount: 15, rating: 4.6, kcal: 540, prepMin: 10, tint: '#DDE6B5',
    description: 'Fresh-fried falafel, creamy hummus, pickled turnip, tomato and mint wrapped in saj bread.' }),
  mk({ id: 'veg-halloumi', name: 'Halloumi Garden', blurb: 'Grilled cheese & mint', category: 'veggie', price: 7.8, rating: 4.6, reviews: 94, kcal: 590, prepMin: 10, tint: '#E8E4B0',
    description: 'Grilled halloumi, cucumber, tomato, mint and a lemony tahini dressing.' }),
  mk({ id: 'veg-cauli', name: 'Roasted Cauliflower', blurb: 'Tahini & pomegranate', category: 'veggie', price: 7.2, discount: 10, rating: 4.4, kcal: 510, prepMin: 11, tint: '#EBD9B5',
    description: 'Charred cauliflower, tahini, pomegranate seeds and toasted almonds in warm flatbread.' }),
];

export const getProduct = (id: string) => MENU.find((p) => p.id === id);
