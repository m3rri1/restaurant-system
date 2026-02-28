require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected!');

  await MenuItem.deleteMany(); // clear old data

  await MenuItem.insertMany([
    // Starters
    { name: 'Paneer Tikka', category: 'Starters', price: 220, description: 'Grilled paneer with spices' },
    { name: 'Veg Spring Rolls', category: 'Starters', price: 150, description: 'Crispy fried rolls' },
    { name: 'Chicken Wings', category: 'Starters', price: 280, description: 'Spicy grilled wings' },

    // Main Course
    { name: 'Butter Chicken', category: 'Main Course', price: 320, description: 'Creamy tomato gravy' },
    { name: 'Paneer Butter Masala', category: 'Main Course', price: 280, description: 'Rich paneer curry' },
    { name: 'Dal Makhani', category: 'Main Course', price: 220, description: 'Slow cooked black dal' },
    { name: 'Veg Biryani', category: 'Main Course', price: 250, description: 'Fragrant basmati rice' },
    { name: 'Chicken Biryani', category: 'Main Course', price: 320, description: 'Spiced chicken rice' },

    // Breads
    { name: 'Butter Naan', category: 'Breads', price: 50, description: 'Soft buttered naan' },
    { name: 'Garlic Naan', category: 'Breads', price: 60, description: 'Garlic flavored naan' },
    { name: 'Tandoori Roti', category: 'Breads', price: 40, description: 'Whole wheat roti' },

    // Drinks
    { name: 'Mango Lassi', category: 'Drinks', price: 120, description: 'Sweet mango yogurt drink' },
    { name: 'Masala Chai', category: 'Drinks', price: 60, description: 'Spiced Indian tea' },
    { name: 'Cold Coffee', category: 'Drinks', price: 150, description: 'Chilled coffee blend' },
    { name: 'Fresh Lime Soda', category: 'Drinks', price: 80, description: 'Refreshing lime drink' },

    // Desserts
    { name: 'Gulab Jamun', category: 'Desserts', price: 100, description: 'Soft milk solids in syrup' },
    { name: 'Ice Cream', category: 'Desserts', price: 120, description: '3 scoops of your choice' },
  ]);

  console.log('Menu seeded successfully!');
  process.exit();
});