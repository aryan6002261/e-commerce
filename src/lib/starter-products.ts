export interface StarterProduct {
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string;
  badge: string | null;
  rating: number;
  reviewCount: number;
  stock: number;
  featured: boolean;
}

export const starterProducts: readonly StarterProduct[] = [
  {
    slug: "everyday-stoneware-vase",
    name: "Everyday Stoneware Vase",
    category: "Objects",
    description:
      "A quietly sculptural, hand-finished stoneware vase made for gathered branches and slow mornings. Each piece has its own subtle variation in glaze and shape.",
    price: 4800,
    compareAtPrice: null,
    imageUrl:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1100&q=88",
    badge: "Bestseller",
    rating: 49,
    reviewCount: 128,
    stock: 32,
    featured: true,
  },
  {
    slug: "soft-form-linen-cushion",
    name: "Soft Form Linen Cushion",
    category: "Textiles",
    description:
      "Washed European linen in a soft, lived-in finish. A generous feather-and-fiber insert gives this everyday favorite its just-right, sink-in softness.",
    price: 6200,
    compareAtPrice: null,
    imageUrl:
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1100&q=88",
    badge: "Natural linen",
    rating: 48,
    reviewCount: 86,
    stock: 24,
    featured: true,
  },
  {
    slug: "sunday-oak-serving-board",
    name: "Sunday Oak Serving Board",
    category: "Kitchen",
    description:
      "Cut from responsibly sourced solid oak and finished with food-safe oil. Made to move from the kitchen counter to the center of the table.",
    price: 5400,
    compareAtPrice: 6800,
    imageUrl:
      "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=1100&q=88",
    badge: "A little less",
    rating: 50,
    reviewCount: 53,
    stock: 18,
    featured: true,
  },
  {
    slug: "slow-evening-table-lamp",
    name: "Slow Evening Table Lamp",
    category: "Lighting",
    description:
      "A linen shade and warm, tactile base bring a softer kind of light to bedside tables, reading corners, and all the places you like to linger.",
    price: 14800,
    compareAtPrice: null,
    imageUrl:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1100&q=88",
    badge: "New arrival",
    rating: 49,
    reviewCount: 42,
    stock: 12,
    featured: true,
  },
  {
    slug: "still-life-glass-carafe",
    name: "Still Life Glass Carafe",
    category: "Kitchen",
    description:
      "Hand-blown borosilicate glass with an easy pour and a satisfying weight. A considered detail for the bedside or the next shared meal.",
    price: 3800,
    compareAtPrice: null,
    imageUrl:
      "https://images.unsplash.com/photo-1513558161293-cdaf765edfd7?auto=format&fit=crop&w=1100&q=88",
    badge: null,
    rating: 47,
    reviewCount: 37,
    stock: 30,
    featured: false,
  },
  {
    slug: "weekend-wool-throw",
    name: "Weekend Wool Throw",
    category: "Textiles",
    description:
      "A breathable blend of recycled wool and cotton, woven with a subtle texture and finished with softly frayed edges. The one that always stays on the sofa.",
    price: 11200,
    compareAtPrice: null,
    imageUrl:
      "https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?auto=format&fit=crop&w=1100&q=88",
    badge: "Loved for a reason",
    rating: 50,
    reviewCount: 94,
    stock: 21,
    featured: true,
  },
  {
    slug: "little-moments-candle",
    name: "Little Moments Candle",
    category: "Fragrance",
    description:
      "Plant-based wax poured by hand into a reusable ceramic vessel. Notes of cedar, bergamot, and the last bit of sunlight in a room.",
    price: 3200,
    compareAtPrice: null,
    imageUrl:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1100&q=88",
    badge: null,
    rating: 48,
    reviewCount: 61,
    stock: 44,
    featured: false,
  },
  {
    slug: "quiet-hours-ceramic-mug",
    name: "Quiet Hours Ceramic Mug",
    category: "Kitchen",
    description:
      "An easy-to-hold shape with a hand-painted rim. Wheel-thrown by a small ceramics studio and finished in a milky, food-safe glaze.",
    price: 2800,
    compareAtPrice: null,
    imageUrl:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1100&q=88",
    badge: null,
    rating: 49,
    reviewCount: 112,
    stock: 50,
    featured: false,
  },
  {
    slug: "daylight-travertine-tray",
    name: "Daylight Travertine Tray",
    category: "Objects",
    description:
      "A solid piece of naturally porous travertine, shaped into a landing place for keys, jewelry, and the things you reach for each day.",
    price: 7600,
    compareAtPrice: null,
    imageUrl:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1100&q=88",
    badge: "Small batch",
    rating: 49,
    reviewCount: 29,
    stock: 16,
    featured: false,
  },
  {
    slug: "gather-round-dining-chair",
    name: "Gather Round Dining Chair",
    category: "Furniture",
    description:
      "A considered silhouette in solid ash, shaped for long dinners and even longer conversations. Comfortable enough to stay a little longer.",
    price: 29800,
    compareAtPrice: null,
    imageUrl:
      "https://images.unsplash.com/photo-1598300053653-45eae2d19a2e?auto=format&fit=crop&w=1100&q=88",
    badge: "Made to order",
    rating: 48,
    reviewCount: 18,
    stock: 8,
    featured: false,
  },
  {
    slug: "open-air-wildflower-print",
    name: "Open Air Wildflower Print",
    category: "Objects",
    description:
      "A limited-edition botanical study printed on sustainably made, softly textured paper. Thoughtful on its own, lovely layered with other things.",
    price: 6800,
    compareAtPrice: null,
    imageUrl:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1100&q=88",
    badge: "Artist edition",
    rating: 50,
    reviewCount: 24,
    stock: 14,
    featured: false,
  },
  {
    slug: "earth-tone-incense-set",
    name: "Earth Tone Incense Set",
    category: "Fragrance",
    description:
      "A set of slow-burning incense made with botanical ingredients and a low-profile ceramic holder. Grounding, gentle, and never overpowering.",
    price: 3600,
    compareAtPrice: null,
    imageUrl:
      "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=1100&q=88",
    badge: null,
    rating: 47,
    reviewCount: 31,
    stock: 26,
    featured: false,
  },
] as const;
