const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true }, // e.g. "pizza-palace" → URL: /r/pizza-palace
  name: { type: String, required: true },               // "Pizza Palace"
  tagline: { type: String },                            // "Best pizza in town"
  logo: { type: String },                               // URL or base64
  primaryColor: { type: String, default: '#ff6b35' },   // brand color
  secondaryColor: { type: String, default: '#f7931e' },
  currency: { type: String, default: '₹' },
  openTime: { type: String, default: '10:00 AM' },
  closeTime: { type: String, default: '11:00 PM' },
  adminEmail: { type: String },
  adminPassword: { type: String },                      // hashed later
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
```

---

## How the URL Structure Changes

Right now your URL is:
```
/customer/index.html?table=1
```

After this upgrade it becomes:
```
/r/pizza-palace?table=1
/r/spice-garden?table=3
/r/burger-barn?table=7