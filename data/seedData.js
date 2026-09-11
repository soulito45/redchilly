export const restaurantData = {
  name: 'New Red Chilly - Since 2011',
  tagline: 'Authentic Indo-Chinese flavours, served fresh in Mira Road.',
  address: 'Shop No.7/8, Jangid Tower, Khau Gali, opp. Gokul Village, near J&K Bank, Shanti Park, Mira Road East, Mira Bhayandar, Maharashtra 401107',
  phone: '088288 26565',
  hours: 'Open 24 hours',
  rating: '4.2',
  reviewCount: 5,
  priceRange: '₹200–400 per person',
  mapUrl: 'https://maps.google.com/?q=New+Red+Chilly+Mira+Road',
  socialLinks: {
    call: 'tel:08828826565',
    directions: 'https://maps.google.com/?q=New+Red+Chilly+Mira+Road',
  },
  reviews: [
    {
      name: 'Aditi',
      text: 'Nice place for Chinese food. Really enjoyed the taste and service.',
      rating: 5,
    },
    {
      name: 'Rohan',
      text: 'The boys in the restaurant were very helpful and the food was full of flavour.',
      rating: 4,
    },
    {
      name: 'Neha',
      text: 'The food is great and the portions are satisfying for the price.',
      rating: 4,
    },
  ],
};

export const menuItems = [
  { id: 'veg-manchow-soup', name: 'Veg Manchow Soup', category: 'Soups', price: 180, tags: ['veg', 'soup', 'spicy'], veg: true, description: 'Hearty vegetable soup with classic Indo-Chinese flavours and crunchy noodles.' },
  { id: 'veg-royal-soup', name: 'Veg Royal Soup', category: 'Soups', price: 180, tags: ['veg', 'soup', 'premium'], veg: true, description: 'A luxurious vegetable broth with refined flavors and aromatic spice.' },
  { id: ' mushroom-hotn-sour', name: 'Mushroom Hot N Sour Soup', category: 'Soups', price: 270, tags: ['veg', 'mushroom', 'hot'], veg: true, description: 'Bold heat and tangy sourness with tender mushrooms and fresh vegetables.' },
  { id: 'chicken-manchow-soup', name: 'Chicken Manchow Soup', category: 'Soups', price: 240, tags: ['non-veg', 'chicken', 'soup'], veg: false, description: 'Classic chicken soup with shredded chicken, vegetables, and crispy noodles.' },
  { id: 'chicken-clear-soup', name: 'Chicken Clear Soup', category: 'Soups', price: 290, tags: ['non-veg', 'chicken', 'light'], veg: false, description: 'A soothing, light broth packed with chicken chunks and vegetables.' },

  { id: 'veg-crispy', name: 'Veg Crispy', category: 'Starters', price: 400, tags: ['veg', 'crispy', 'starter'], veg: true, description: 'Crispy fried vegetables tossed with garlic, sauces, and authentic spice.' },
  { id: 'veg-chilli-dry', name: 'Veg Chilli Dry', category: 'Starters', price: 220, tags: ['veg', 'chilli', 'dry'], veg: true, description: 'Spicy vegetables tossed in classic chilli sauce with a punch of flavor.' },
  { id: 'veg-manchurian-dry', name: 'Veg Manchurian Dry', category: 'Starters', price: 200, tags: ['veg', 'manchurian', 'dry'], veg: true, description: 'Classic veg balls coated in rich Manchurian sauce.' },
  { id: 'paneer-chilli-dry', name: 'Paneer Chilli Dry', category: 'Starters', price: 270, tags: ['veg', 'paneer', 'chilli'], veg: true, description: 'Soft paneer cubes tossed with onions, capsicum, and green chillies.' },
  { id: 'paneer-kung-pao-dry', name: 'Paneer Kung Pao Dry', category: 'Starters', price: 490, tags: ['veg', 'paneer', 'kung pao'], veg: true, description: 'Paneer with roasted peanuts and our signature Kung Pao sauce.' },
  { id: 'chicken-chilli-dry', name: 'Chicken Chilli Dry', category: 'Starters', price: 240, tags: ['non-veg', 'chicken', 'chilli'], veg: false, description: 'Crispy, tangy chicken with a fiery chilli kick.' },
  { id: 'chicken-manchurian-dry', name: 'Chicken Manchurian Dry', category: 'Starters', price: 240, tags: ['non-veg', 'chicken', 'manchurian'], veg: false, description: 'Juicy chicken pieces tossed in rich Manchurian sauce.' },
  { id: 'chicken-lollipop-oil-fry', name: 'Chicken Lollipop Oil Fry', category: 'Starters', price: 290, tags: ['non-veg', 'chicken', 'lollipop'], veg: false, description: 'Crunchy chicken lollipop coated in a spicy aromatic sauce.' },
  { id: 'chicken-lollipop-chilli-dry', name: 'Chicken Lollipop Chilli Dry', category: 'Starters', price: 350, tags: ['non-veg', 'chicken', 'lollipop', 'chilli'], veg: false, description: 'Spicy and juicy chicken lollipop with sweet and spicy coating.' },
  { id: 'prawns-chilli-dry', name: 'Prawns Chilli Dry', category: 'Starters', price: 380, tags: ['non-veg', 'prawns', 'seafood'], veg: false, description: 'Succulent prawns tossed in a perfectly balanced chilli sauce.' },

  { id: 'veg-fried-rice', name: 'Veg Fried Rice', category: 'Fried Rice', price: 220, tags: ['veg', 'rice', 'classic'], veg: true, description: 'A wholesome vegetarian rice dish loaded with vegetables and subtle spice.' },
  { id: 'veg-schezwan-fried-rice', name: 'Veg Schezwan Fried Rice', category: 'Fried Rice', price: 240, tags: ['veg', 'rice', 'schezwan'], veg: true, description: 'Spicy rice with vegetables and Schezwan sauce for a bold kick.' },
  { id: 'chicken-fried-rice', name: 'Chicken Fried Rice', category: 'Fried Rice', price: 240, tags: ['non-veg', 'rice', 'chicken'], veg: false, description: 'Savory rice with chicken, vegetables, and aromatic sauces.' },
  { id: 'chicken-schezwan-fried-rice', name: 'Chicken Schezwan Fried Rice', category: 'Fried Rice', price: 260, tags: ['non-veg', 'rice', 'schezwan'], veg: false, description: 'Firey chicken rice tossed in rich Schezwan sauce.' },
  { id: 'prawns-fried-rice', name: 'Prawns Fried Rice', category: 'Fried Rice', price: 290, tags: ['non-veg', 'rice', 'seafood'], veg: false, description: 'Fragrant rice stir-fried with juicy prawns and vegetables.' },
  { id: 'paneer-fried-rice', name: 'Paneer Fried Rice', category: 'Fried Rice', price: 270, tags: ['veg', 'paneer', 'rice'], veg: true, description: 'Rich and flavorful rice with a generous helping of paneer.' },
  { id: 'veg-mixed-fried-rice', name: 'Veg Mixed Fried Rice', category: 'Special Combos', price: 490, tags: ['veg', 'mixed', 'combo'], veg: true, description: 'A wholesome mix of paneer, mushrooms, and baby corn in fragrant rice.' },
  { id: 'non-veg-mixed-fried-rice', name: 'Non Veg Mixed Fried Rice', category: 'Special Combos', price: 540, tags: ['non-veg', 'mixed', 'combo'], veg: false, description: 'Loaded with egg, chicken, and prawns, cooked to perfection.' },

  { id: 'veg-hakka-noodles', name: 'Veg Hakka Noodles', category: 'Noodles', price: 220, tags: ['veg', 'noodles', 'classic'], veg: true, description: 'Perfectly cooked noodles with mixed vegetables and smoky wok flavor.' },
  { id: 'veg-schezwan-noodles', name: 'Veg Schezwan Noodles', category: 'Noodles', price: 240, tags: ['veg', 'noodles', 'schezwan'], veg: true, description: 'Hakka noodles tossed in spicy Schezwan sauce with vegetable goodness.' },
  { id: 'chicken-hakka-noodles', name: 'Chicken Hakka Noodles', category: 'Noodles', price: 240, tags: ['non-veg', 'noodles', 'chicken'], veg: false, description: 'A delicious blend of chicken, vegetables, and noodles in rich sauce.' },
  { id: 'chicken-schezwan-noodles', name: 'Chicken Schezwan Noodles', category: 'Noodles', price: 260, tags: ['non-veg', 'noodles', 'schezwan'], veg: false, description: 'Spicy chicken noodles with fiery Schezwan flavours and aromatic garlic.' },
  { id: 'prawns-hakka-noodles', name: 'Prawns Hakka Noodles', category: 'Noodles', price: 290, tags: ['non-veg', 'noodles', 'prawns'], veg: false, description: 'Succulent prawns and noodles stir-fried with fresh vegetables.' },
  { id: 'paneer-hakka-noodles', name: 'Paneer Hakka Noodles', category: 'Noodles', price: 270, tags: ['veg', 'paneer', 'noodles'], veg: true, description: 'Soft paneer cubes and vegetables tossed with perfectly cooked noodles.' },
  { id: 'veg-mixed-noodles', name: 'Veg Mixed Noodles', category: 'Special Combos', price: 490, tags: ['veg', 'mixed', 'noodles'], veg: true, description: 'Hakka noodles tossed with paneer, mushrooms, and baby corn in house sauces.' },
  { id: 'non-veg-mixed-noodles', name: 'Non Veg Mixed Noodles', category: 'Special Combos', price: 540, tags: ['non-veg', 'mixed', 'noodles'], veg: false, description: 'A hearty plate of noodles with egg, chicken, and prawns.' },
];
