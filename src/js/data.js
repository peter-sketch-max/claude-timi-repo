// Static game data: industries, cities, funding, traits, names, upgrades, missions, achievements.
var CS = globalThis.CS = globalThis.CS || {};

// rv = starting weekly sales the economy is balanced around.
// comp = starting staff: workers, sellers, accountants, managers.
CS.TIERS = {
  small: { label: 'Small', stars: 1, rv: 4000, cash: 30000, comp: { front: 3, sales: 0, acct: 0, mgr: 0 },
    blurb: 'Easy to start. Great for your first company!' },
  medium: { label: 'Medium', stars: 2, rv: 40000, cash: 220000, comp: { front: 6, sales: 1, acct: 0, mgr: 1 },
    blurb: 'More money, more people, more drama.' },
  large: { label: 'Large', stars: 3, rv: 500000, cash: 3000000, comp: { front: 10, sales: 1, acct: 1, mgr: 2 },
    startDebt: 0.4, startOwnership: 0.7,
    blurb: 'Hard mode! You start with a big loan and other owners.' }
};

// t = average sale, s = supply cost share of sales, l = wage share.
// unit = what one "customer" means in this industry.
CS.INDUSTRIES = [
  { id: 'cafe', tags: 'food', name: 'Café', emoji: '☕', tier: 'small', t: 7, s: 0.30, l: 0.33, front: 'Barista', unit: 'coffees sold' },
  { id: 'restaurant', tags: 'food', name: 'Restaurant', emoji: '🍝', tier: 'small', t: 28, s: 0.32, l: 0.32, front: 'Chef', unit: 'meals served' },
  { id: 'bakery', tags: 'food sweet', name: 'Bakery', emoji: '🥐', tier: 'small', t: 9, s: 0.30, l: 0.30, front: 'Baker', unit: 'treats sold' },
  { id: 'foodtruck', tags: 'food', name: 'Food Truck', emoji: '🌮', tier: 'small', t: 12, s: 0.33, l: 0.28, front: 'Cook', unit: 'tacos sold' },
  { id: 'carwash', tags: '', name: 'Car Wash', emoji: '🚿', tier: 'small', t: 18, s: 0.12, l: 0.40, front: 'Washer', unit: 'cars washed' },
  { id: 'clothing', tags: 'fashion', name: 'Clothing Store', emoji: '👕', tier: 'small', t: 45, s: 0.45, l: 0.22, front: 'Sales Clerk', unit: 'outfits sold' },
  { id: 'convenience', tags: 'food', name: 'Mini Market', emoji: '🏪', tier: 'small', t: 14, s: 0.55, l: 0.18, front: 'Cashier', unit: 'baskets sold' },
  { id: 'gamestudio', tags: 'tech media', name: 'Game Studio', emoji: '🎮', tier: 'small', t: 20, s: 0.10, l: 0.55, front: 'Developer', unit: 'games sold' },
  { id: 'phonerepair', tags: 'tech', name: 'Phone Repair', emoji: '📱', tier: 'small', t: 60, s: 0.30, l: 0.35, front: 'Technician', unit: 'phones fixed' },
  { id: 'cleaning', tags: '', name: 'Cleaning Company', emoji: '🧽', tier: 'small', t: 120, s: 0.12, l: 0.50, front: 'Cleaner', unit: 'houses cleaned' },
  { id: 'lemonade', tags: 'food sweet', name: 'Lemonade Stand', emoji: '🍋', tier: 'small', t: 3, s: 0.30, l: 0.30, front: 'Squeezer', unit: 'lemonades sold' },
  { id: 'candy', tags: 'food sweet', name: 'Candy Shop', emoji: '🍬', tier: 'small', t: 6, s: 0.35, l: 0.28, front: 'Candy Maker', unit: 'candy bags' },
  { id: 'icecream', tags: 'food sweet', name: 'Ice Cream Truck', emoji: '🍦', tier: 'small', t: 5, s: 0.32, l: 0.30, front: 'Scooper', unit: 'ice creams' },
  { id: 'pizza', tags: 'food', name: 'Pizza Place', emoji: '🍕', tier: 'small', t: 15, s: 0.33, l: 0.30, front: 'Pizza Chef', unit: 'pizzas' },
  { id: 'donut', tags: 'food sweet', name: 'Donut Shop', emoji: '🍩', tier: 'small', t: 4, s: 0.30, l: 0.30, front: 'Donut Maker', unit: 'donuts' },
  { id: 'bubbletea', tags: 'food sweet', name: 'Bubble Tea', emoji: '🧋', tier: 'small', t: 6, s: 0.30, l: 0.32, front: 'Tea Maker', unit: 'bubble teas' },
  { id: 'petshop', tags: 'animals', name: 'Pet Shop', emoji: '🐶', tier: 'small', t: 25, s: 0.45, l: 0.25, front: 'Pet Helper', unit: 'pet treats' },
  { id: 'barber', tags: 'fashion', name: 'Barber Shop', emoji: '💈', tier: 'small', t: 22, s: 0.08, l: 0.50, front: 'Barber', unit: 'haircuts' },
  { id: 'flowers', tags: '', name: 'Flower Shop', emoji: '💐', tier: 'small', t: 30, s: 0.40, l: 0.28, front: 'Florist', unit: 'bouquets' },
  { id: 'youtube', tags: 'media tech', vip: true, name: 'YouTube Channel', emoji: '🎥', tier: 'small', t: 4, s: 0.10, l: 0.50, front: 'Video Editor', unit: 'thousand views' },

  { id: 'supermarket', tags: 'food', name: 'Supermarket', emoji: '🛒', tier: 'medium', t: 38, s: 0.58, l: 0.15, front: 'Clerk', unit: 'shopping carts' },
  { id: 'hotel', tags: 'food', name: 'Hotel', emoji: '🏨', tier: 'medium', t: 140, s: 0.20, l: 0.35, front: 'Housekeeper', unit: 'room nights' },
  { id: 'gym', tags: 'sport', name: 'Gym', emoji: '🏋️', tier: 'medium', t: 45, s: 0.10, l: 0.35, front: 'Trainer', unit: 'gym visits' },
  { id: 'construction', tags: '', name: 'Construction', emoji: '🏗️', tier: 'medium', t: 25000, s: 0.45, l: 0.30, front: 'Builder', unit: 'buildings' },
  { id: 'furniture', tags: '', name: 'Furniture Maker', emoji: '🛋️', tier: 'medium', t: 600, s: 0.45, l: 0.25, front: 'Carpenter', unit: 'sofas sold' },
  { id: 'electronics', tags: 'tech', name: 'Electronics', emoji: '🔌', tier: 'medium', t: 350, s: 0.55, l: 0.18, front: 'Technician', unit: 'gadgets sold' },
  { id: 'delivery', tags: '', name: 'Delivery Company', emoji: '📦', tier: 'medium', t: 15, s: 0.25, l: 0.45, front: 'Driver', unit: 'packages' },
  { id: 'marketing', tags: 'media', name: 'Marketing Agency', emoji: '📣', tier: 'medium', t: 4000, s: 0.10, l: 0.55, front: 'Creative', unit: 'ad campaigns' },
  { id: 'software', tags: 'tech', name: 'App Company', emoji: '💻', tier: 'medium', t: 900, s: 0.08, l: 0.58, front: 'Developer', unit: 'app licenses' },
  { id: 'toys', tags: 'fun', name: 'Toy Company', emoji: '🧸', tier: 'medium', t: 30, s: 0.45, l: 0.25, front: 'Toymaker', unit: 'toys sold' },
  { id: 'banana', tags: 'food farm', name: 'Banana Farm', emoji: '🍌', tier: 'medium', t: 20, s: 0.30, l: 0.38, front: 'Farmer', unit: 'banana boxes' },
  { id: 'chocolate', tags: 'food sweet', name: 'Chocolate Factory', emoji: '🍫', tier: 'medium', t: 4, s: 0.40, l: 0.25, front: 'Chocolatier', unit: 'chocolate bars' },
  { id: 'football', tags: 'sport', name: 'Football Academy', emoji: '⚽', tier: 'medium', t: 150, s: 0.15, l: 0.45, front: 'Coach', unit: 'players trained' },
  { id: 'burger', tags: 'food', name: 'Burger Chain', emoji: '🍔', tier: 'medium', t: 11, s: 0.35, l: 0.30, front: 'Burger Cook', unit: 'burgers' },
  { id: 'fashion', tags: 'fashion', name: 'Fashion Brand', emoji: '👗', tier: 'medium', t: 80, s: 0.45, l: 0.22, front: 'Designer', unit: 'outfits sold' },
  { id: 'sneakers', tags: 'fashion sport', name: 'Sneaker Brand', emoji: '👟', tier: 'medium', t: 120, s: 0.45, l: 0.20, front: 'Shoe Maker', unit: 'sneakers sold' },
  { id: 'bakerychain', tags: 'food sweet', name: 'Cake Factory', emoji: '🎂', tier: 'medium', t: 25, s: 0.38, l: 0.26, front: 'Cake Artist', unit: 'cakes sold' },
  { id: 'esports', tags: 'tech media sport', vip: true, name: 'Esports Team', emoji: '🕹️', tier: 'medium', t: 3000, s: 0.10, l: 0.55, front: 'Pro Gamer', unit: 'sponsor deals' },
  { id: 'music', tags: 'media', vip: true, name: 'Music Label', emoji: '🎵', tier: 'medium', t: 4, s: 0.15, l: 0.45, front: 'Music Producer', unit: 'thousand streams' },
  { id: 'zoo', tags: 'animals fun', vip: true, name: 'Zoo', emoji: '🦁', tier: 'medium', t: 25, s: 0.25, l: 0.40, front: 'Zookeeper', unit: 'visitors' },

  { id: 'cars', tags: '', name: 'Car Maker', emoji: '🚗', tier: 'large', t: 32000, s: 0.55, l: 0.18, front: 'Engineer', unit: 'cars sold' },
  { id: 'airline', tags: '', name: 'Airline', emoji: '✈️', tier: 'large', t: 320, s: 0.40, l: 0.30, front: 'Pilot', unit: 'passengers' },
  { id: 'bank', tags: '', name: 'Bank', emoji: '🏦', tier: 'large', t: 1500, s: 0.15, l: 0.45, front: 'Banker', unit: 'new accounts' },
  { id: 'tech', tags: 'tech', name: 'Tech Giant', emoji: '🤖', tier: 'large', t: 1200, s: 0.20, l: 0.45, front: 'Engineer', unit: 'devices sold' },
  { id: 'pharma', tags: '', name: 'Medicine Maker', emoji: '💊', tier: 'large', t: 250, s: 0.30, l: 0.30, front: 'Scientist', unit: 'medicine packs' },
  { id: 'energy', tags: 'oil', name: 'Energy Company', emoji: '⚡', tier: 'large', t: 2000, s: 0.50, l: 0.20, front: 'Engineer', unit: 'power deals' },
  { id: 'realestate', tags: '', name: 'Real Estate', emoji: '🏢', tier: 'large', t: 50000, s: 0.40, l: 0.15, front: 'Agent', unit: 'homes sold' },
  { id: 'entertainment', tags: 'media fun', name: 'Movie Studio', emoji: '🎬', tier: 'large', t: 18, s: 0.35, l: 0.35, front: 'Producer', unit: 'movie tickets' },
  { id: 'oil', tags: 'oil', name: 'Oil Company', emoji: '🛢️', tier: 'large', t: 80, s: 0.50, l: 0.15, front: 'Oil Worker', unit: 'barrels sold' },
  { id: 'soda', tags: 'food sweet', name: 'Soda Company', emoji: '🥤', tier: 'large', t: 2, s: 0.40, l: 0.20, front: 'Flavor Mixer', unit: 'soda cans' },
  { id: 'footballclub', tags: 'sport fun', name: 'Football Club', emoji: '🏟️', tier: 'large', t: 60, s: 0.15, l: 0.50, front: 'Player', unit: 'tickets sold' },
  { id: 'shipping', tags: '', name: 'Shipping Company', emoji: '🚢', tier: 'large', t: 3000, s: 0.45, l: 0.20, front: 'Captain', unit: 'containers shipped' },
  { id: 'goldmine', tags: 'oil', name: 'Gold Mine', emoji: '⛏️', tier: 'large', t: 40000, s: 0.40, l: 0.25, front: 'Miner', unit: 'gold bars' },
  { id: 'themepark', tags: 'fun', vip: true, name: 'Theme Park', emoji: '🎢', tier: 'large', t: 60, s: 0.20, l: 0.35, front: 'Ride Operator', unit: 'visitors' },
  { id: 'space', tags: 'tech', vip: true, name: 'Space Company', emoji: '🚀', tier: 'large', t: 2000000, s: 0.50, l: 0.20, front: 'Rocket Scientist', unit: 'rocket launches' },
  { id: 'socialapp', tags: 'tech media', vip: true, name: 'Social Media App', emoji: '📲', tier: 'large', t: 30, s: 0.15, l: 0.45, front: 'Programmer', unit: 'thousand users' }
];
CS.IND = {};
CS.INDUSTRIES.forEach(function (i) { CS.IND[i.id] = i; });
CS.hasTag = function (indId, tag) { return (' ' + (CS.IND[indId].tags || '') + ' ').indexOf(' ' + tag + ' ') >= 0; };

// Multipliers against a neutral baseline city.
CS.CITIES = {
  newyork: { name: 'New York', flag: '🇺🇸', demand: 1.3, ticket: 1.2, wage: 1.4, rent: 1.8, note: 'Tons of customers, super expensive' },
  london: { name: 'London', flag: '🇬🇧', demand: 1.25, ticket: 1.2, wage: 1.35, rent: 1.7, note: 'Rich customers, high costs' },
  tokyo: { name: 'Tokyo', flag: '🇯🇵', demand: 1.25, ticket: 1.15, wage: 1.3, rent: 1.6, note: 'Busy and loyal customers' },
  toronto: { name: 'Toronto', flag: '🇨🇦', demand: 1.05, ticket: 1.08, wage: 1.15, rent: 1.2, note: 'Nice and balanced' },
  berlin: { name: 'Berlin', flag: '🇩🇪', demand: 1.0, ticket: 1.0, wage: 1.1, rent: 1.0, note: 'Normal in every way' },
  saopaulo: { name: 'São Paulo', flag: '🇧🇷', demand: 1.1, ticket: 0.8, wage: 0.75, rent: 0.8, note: 'Busy, but people want low prices' },
  mumbai: { name: 'Mumbai', flag: '🇮🇳', demand: 1.2, ticket: 0.65, wage: 0.5, rent: 0.6, note: 'Lots of people, cheap costs' },
  smalltown: { name: 'Small Town', flag: '🏡', demand: 0.75, ticket: 0.85, wage: 0.75, rent: 0.45, note: 'Quiet, but rent is tiny' }
};

CS.FUNDING = {
  savings: { name: 'My savings', emoji: '🐷', cash: 1, own: 1, loan: 0, note: 'Own 100% of your company.' },
  angel: { name: 'Rich friend', emoji: '🤝', cash: 2, own: 0.8, loan: 0, note: '2x the money. They own 20%.' },
  bank: { name: 'Bank loan', emoji: '🏦', cash: 1, own: 1, loan: 1, note: '2x the money. Pay it back weekly.' },
  vc: { name: 'Big investors', emoji: '💼', cash: 4, own: 0.55, loan: 0, note: '4x the money. You only own 55%.' }
};

// Role salary multipliers relative to a frontline worker.
CS.ROLES = {
  front: { mult: 1, label: null, emoji: null, job: 'Serves customers' },
  sales: { mult: 1, label: 'Salesperson', emoji: '🗣️', job: 'Brings in more customers' },
  acct: { mult: 1.1, label: 'Accountant', emoji: '🧮', job: 'Lowers your supply costs' },
  mgr: { mult: 1.6, label: 'Manager', emoji: '👔', job: 'Keeps up to 8 people happy' }
};
CS.LEVELS = ['', 'Senior ', 'Lead '];

CS.TRAITS = {
  hardworking: { label: 'Hardworking', emoji: '💪', good: true, desc: 'Works 15% faster' },
  lazy: { label: 'Lazy', emoji: '🦥', good: false, desc: 'Works 15% slower' },
  ambitious: { label: 'Ambitious', emoji: '🚀', good: true, desc: 'Learns fast, wants promotions' },
  creative: { label: 'Creative', emoji: '🎨', good: true, desc: 'Has lots of ideas' },
  loyal: { label: 'Loyal', emoji: '🐶', good: true, desc: 'Almost never quits' },
  greedy: { label: 'Greedy', emoji: '🤑', good: false, desc: 'Always wants money' },
  friendly: { label: 'Friendly', emoji: '🤗', good: true, desc: 'Makes everyone happier' },
  aggressive: { label: 'Hothead', emoji: '😤', good: false, desc: 'Starts fights' },
  reliable: { label: 'Reliable', emoji: '⏰', good: true, desc: 'Always shows up' },
  unreliable: { label: 'Flaky', emoji: '💤', good: false, desc: 'Often late or missing' },
  funny: { label: 'Funny', emoji: '😂', good: true, desc: 'Makes people laugh' },
  serious: { label: 'Serious', emoji: '🧐', good: true, desc: 'Focused on work' }
};
CS.TRAIT_CLASH = { hardworking: 'lazy', lazy: 'hardworking', reliable: 'unreliable', unreliable: 'reliable', funny: 'serious', serious: 'funny', loyal: 'greedy', greedy: 'loyal', friendly: 'aggressive', aggressive: 'friendly' };

CS.FIRST = ['Ava', 'Liam', 'Maya', 'Noah', 'Zara', 'Leo', 'Priya', 'Mateo', 'Chloe', 'Omar', 'Yuki', 'Ethan', 'Amara', 'Lucas', 'Sofia', 'Kai', 'Nia', 'Diego', 'Hana', 'Felix', 'Aisha', 'Jonah', 'Ines', 'Ravi', 'Grace', 'Tariq', 'Elena', 'Marcus', 'Lena', 'Kofi', 'Mei', 'Oscar', 'Leila', 'Sam', 'Freya', 'Dev', 'Rosa', 'Ivan', 'Tess', 'Malik', 'Nora', 'Theo', 'Imani', 'Hugo', 'Keiko', 'Bruno', 'Ruby', 'Arjun', 'Lola', 'Emeka', 'Jade', 'Max', 'Luna', 'Finn', 'Isla', 'Zion', 'Mila', 'Axel', 'Nala', 'Ezra'];
CS.LAST = ['Smith', 'Okafor', 'Tanaka', 'Garcia', 'Müller', 'Patel', 'Kim', 'Rossi', 'Silva', 'Nguyen', 'Cohen', 'Brown', 'Haddad', 'Ivanova', 'Mensah', 'Dubois', 'Khan', 'Lopez', 'Andersen', 'Park', 'Walker', 'Costa', 'Sato', 'Novak', 'Ahmed', 'Reyes', 'Fischer', 'Owusu', 'Moreau', 'Chen'];

CS.RIVAL_A = ['MegaMart', 'TopDog', 'Golden', 'Metro', 'Nova', 'Turbo', 'Urban', 'Prime', 'Crown', 'Rapid', 'Shiny', 'Iron'];
CS.RIVAL_B = ['& Co.', 'Group', 'Bros', 'Inc.', 'Works', 'Squad', 'Corp', 'Express', 'House', 'Labs'];

// Name ideas for the "random name" button.
CS.NAME_A = ['Happy', 'Rocket', 'Golden', 'Super', 'Tiny', 'Cosmic', 'Lucky', 'Sunny', 'Mega', 'Pixel', 'Turbo', 'Cozy', 'Bubble', 'Ninja', 'Royal', 'Neon', 'Crispy', 'Wild'];
CS.NAME_B = ['Bean', 'Bros', 'Corner', 'Planet', 'Factory', 'Spot', 'Hub', 'Palace', 'Garage', 'Studio', 'Squad', 'Kingdom', 'Lab', 'Nest', 'World', 'Club'];

CS.LOGOS = ['☕', '🍕', '🚀', '🦊', '🐝', '🌵', '🍩', '💎', '🔥', '🌊', '🍀', '⭐', '🦁', '🐙', '🎯', '👾', '🦄', '🐸', '🍉', '⚡', '🍫', '🍌', '⚽', '🍬', '🛢️', '🎮', '🦖', '🧁'];
CS.COLORS = ['#FF5FA2', '#7C4DFF', '#2EA8FF', '#20C997', '#FFB020', '#FF7A3D', '#FF4D5E', '#2B2250'];

CS.ECON = {
  normal: { name: 'Normal economy', emoji: '🌤️', demand: 1, supply: 0, tone: 'neutral', tip: 'Business as usual.' },
  boom: { name: 'Economy boom!', emoji: '🚀', demand: 1.15, supply: 0, tone: 'good', tip: 'People are spending more money.' },
  recession: { name: 'Recession', emoji: '🌧️', demand: 0.8, supply: 0, tone: 'bad', tip: 'People are spending less money.' },
  inflation: { name: 'Prices rising', emoji: '🎈', demand: 0.95, supply: 0.04, tone: 'warn', tip: 'Everything costs more.' }
};

// Company rank by company value.
CS.RANKS = [
  { min: 0, name: 'Tiny Startup', emoji: '🐣' },
  { min: 5e5, name: 'Local Shop', emoji: '🏠' },
  { min: 1.5e6, name: 'Local Favorite', emoji: '🏪' },
  { min: 5e6, name: 'City Star', emoji: '🌆' },
  { min: 5e7, name: 'Big Business', emoji: '🏙️' },
  { min: 5e8, name: 'National Brand', emoji: '🚀' },
  { min: 5e9, name: 'Global Giant', emoji: '🌍' },
  { min: 1e11, name: 'Mega Empire', emoji: '👑' },
  { min: 1e12, name: 'Galactic Corp', emoji: '🪐' }
];

// Upgrades you can buy. cost = multiple of your tier's weekly sales, per level.
CS.UPGRADES = [
  { id: 'equip', name: 'Faster Machines', emoji: '⚙️', cost: [1.5, 4, 10], lvl: [1, 3, 6], desc: '+8% work speed per level' },
  { id: 'decor', name: 'Cool Decor', emoji: '🎨', cost: [1, 3, 8], lvl: [1, 3, 6], desc: 'Customers +4 happiness per level' },
  { id: 'breakroom', name: 'Fun Break Room', emoji: '🛋️', cost: [1, 3, 8], lvl: [1, 3, 6], desc: 'Team mood +5 per level' },
  { id: 'neon', name: 'Neon Sign', emoji: '💡', cost: [0.8, 2.5, 7], lvl: [1, 4, 7], desc: 'More people notice you every week' },
  { id: 'register', name: 'Smart Register', emoji: '🧾', cost: [1.2, 3.5, 9], lvl: [2, 4, 7], desc: 'Supply costs -1.5% per level' },
  { id: 'training', name: 'Training Room', emoji: '📚', cost: [1.2, 3.5, 9], lvl: [2, 4, 7], desc: 'Staff learn 40% faster per level' },
  { id: 'cameras', name: 'Security Cameras', emoji: '📹', cost: [1], lvl: [2], desc: 'Stops thieves and break-ins' },
  { id: 'space', name: 'Bigger Building', emoji: '🏗️', cost: [4, 12, 30], lvl: [3, 6, 9], desc: '+12% customers per level, but rent +15%' }
];
CS.UP = {};
CS.UPGRADES.forEach(function (u) { CS.UP[u.id] = u; });

// Ads. frac = cost as a share of weekly sales. lvl = CEO level needed.
CS.ADS = [
  { id: 'flyers', name: 'Flyers', emoji: '📄', frac: 0.25, fans: 6, lvl: 1 },
  { id: 'online', name: 'Online Ads', emoji: '💻', frac: 0.9, fans: 20, lvl: 2 },
  { id: 'billboard', name: 'Billboard', emoji: '🪧', frac: 2.2, fans: 45, lvl: 4 },
  { id: 'tv', name: 'TV Commercial', emoji: '📺', frac: 5, fans: 95, lvl: 6 },
  { id: 'celebrity', name: 'Celebrity Ad', emoji: '🌟', frac: 12, fans: 190, lvl: 9 }
];

// Social media posts. views = base views, risk = chance it backfires, viral = chance of going viral.
CS.POSTS = [
  { id: 'meme', name: 'Funny meme', emoji: '😂', views: 1.2, viral: 0.12, risk: 0.12, fans: 1.1 },
  { id: 'behind', name: 'Behind the scenes', emoji: '🎥', views: 0.8, viral: 0.04, risk: 0.02, fans: 1 },
  { id: 'dance', name: 'Dance trend', emoji: '💃', views: 1.4, viral: 0.15, risk: 0.15, fans: 1.2 },
  { id: 'photo', name: 'Product photo', emoji: '📸', views: 0.7, viral: 0.03, risk: 0.01, fans: 0.9 },
  { id: 'giveaway', name: 'Giveaway', emoji: '🎁', views: 1.5, viral: 0.08, risk: 0.03, fans: 1.6, cost: 0.2 },
  { id: 'hottake', name: 'Spicy opinion', emoji: '🌶️', views: 2, viral: 0.2, risk: 0.35, fans: 1.3 },
  { id: 'pet', name: 'Cute pet video', emoji: '🐶', views: 1.1, viral: 0.1, risk: 0.02, fans: 1.1 },
  { id: 'q_and_a', name: 'Ask me anything', emoji: '🙋', views: 0.9, viral: 0.05, risk: 0.08, fans: 1 }
];

CS.RARITY = {
  common: { label: 'Common', w: 1 },
  rare: { label: 'Rare', w: 0.5 },
  epic: { label: 'Epic', w: 0.22 },
  legendary: { label: 'Legendary', w: 0.07 }
};

// Event categories: color and label for the event card.
CS.CATS = {
  team: { label: 'Team', emoji: '👥', color: '#2EA8FF' },
  business: { label: 'Business', emoji: '🏪', color: '#FF7A3D' },
  customers: { label: 'Customers', emoji: '🛍️', color: '#20C997' },
  social: { label: 'Social Media', emoji: '📱', color: '#FF5FA2' },
  boss: { label: 'Boss Stuff', emoji: '👔', color: '#7C4DFF' },
  funny: { label: 'Funny', emoji: '😂', color: '#FFB020' },
  trouble: { label: 'Big Trouble', emoji: '🚨', color: '#FF4D5E' },
  lucky: { label: 'Lucky', emoji: '🍀', color: '#12B886' },
  rivals: { label: 'Rivals', emoji: '🥊', color: '#E8590C' },
  world: { label: 'World News', emoji: '🌍', color: '#4263EB' },
  weird: { label: 'Legendary', emoji: '✨', color: '#9C36B5' }
};

// Missions. Each gives a goal and a reward. check(g, m) returns [current, target].
CS.MISSIONS = [
  { id: 'hire', text: 'Hire {n} new {person|people}', emoji: '🧑‍💼', n: [1, 2, 3], stat: 'hires' },
  { id: 'decide', text: 'Make {n} decisions', emoji: '🤔', n: [3, 5, 8], stat: 'decisions' },
  { id: 'post', text: 'Post on social media {n} {time|times}', emoji: '📱', n: [1, 2, 3], stat: 'posts' },
  { id: 'upgrade', text: 'Buy {n} {upgrade|upgrades}', emoji: '🛠️', n: [1, 2], stat: 'upgrades' },
  { id: 'weeks', text: 'Play {n} weeks', emoji: '📅', n: [4, 6, 10], stat: 'weeksPlayed' },
  { id: 'profit', text: 'Make a profit {n} weeks in a row', emoji: '🔥', n: [3, 5, 8], special: 'streak' },
  { id: 'rep', text: 'Reach {n} reputation', emoji: '⭐', n: [55, 65, 75, 85], special: 'rep' },
  { id: 'fans', text: 'Get {n} followers', emoji: '📣', special: 'fans' },
  { id: 'games', text: 'Play {n} {mini-game|mini-games}', emoji: '🎮', n: [1, 2, 3], stat: 'minigames' },
  { id: 'ads', text: 'Run {n} {ad|ads}', emoji: '📢', n: [1, 2, 3], stat: 'ads' },
  { id: 'cash', text: 'Have {n} in the bank', emoji: '💰', special: 'cash' }
];

CS.ACHIEVEMENTS = [
  { id: 'open', emoji: '🎀', name: 'Open for Business', desc: 'Finish your first week' },
  { id: 'hire1', emoji: '🤝', name: 'First Hire', desc: 'Hire someone' },
  { id: 'team10', emoji: '👥', name: 'Squad Goals', desc: 'Have 10 employees' },
  { id: 'team25', emoji: '🏢', name: 'Real Company', desc: 'Have 25 employees' },
  { id: 'team50', emoji: '🏟️', name: 'Big Boss', desc: 'Have 50 employees' },
  { id: 'cash100k', emoji: '💵', name: 'Six Figures', desc: 'Have $100,000' },
  { id: 'cash1m', emoji: '💰', name: 'Millionaire', desc: 'Have $1,000,000' },
  { id: 'cash10m', emoji: '🤑', name: 'Money Machine', desc: 'Have $10,000,000' },
  { id: 'cash1b', emoji: '🏦', name: 'Billionaire', desc: 'Have $1,000,000,000' },
  { id: 'year1', emoji: '🎂', name: 'Happy Birthday', desc: 'Survive 52 weeks' },
  { id: 'year5', emoji: '🏛️', name: 'Legend', desc: 'Survive 260 weeks' },
  { id: 'rep90', emoji: '⭐', name: 'Superstar Brand', desc: 'Reach 90 reputation' },
  { id: 'events50', emoji: '🧠', name: 'Big Brain Boss', desc: 'Make 50 decisions' },
  { id: 'events250', emoji: '🦉', name: 'Seen It All', desc: 'Make 250 decisions' },
  { id: 'chaos', emoji: '🌪️', name: 'Chaos Week', desc: 'Have 5+ things happen in one week' },
  { id: 'recession', emoji: '☂️', name: 'Storm Survivor', desc: 'Survive a recession' },
  { id: 'debtfree', emoji: '🕊️', name: 'Debt Free', desc: 'Pay off a loan' },
  { id: 'viral', emoji: '🔥', name: 'Gone Viral', desc: 'Go viral on social media' },
  { id: 'lovebirds', emoji: '💘', name: 'Office Romance', desc: 'Two workers start dating' },
  { id: 'toughboss', emoji: '🚪', name: 'Tough Boss', desc: 'Fire 10 people' },
  { id: 'fullhouse', emoji: '🙌', name: 'Nobody Waits', desc: 'Serve every customer 10 weeks in a row' },
  { id: 'streak10', emoji: '🔥', name: 'On Fire', desc: 'Make a profit 10 weeks in a row' },
  { id: 'level5', emoji: '🎖️', name: 'Pro CEO', desc: 'Reach CEO level 5' },
  { id: 'level10', emoji: '🏅', name: 'Master CEO', desc: 'Reach CEO level 10' },
  { id: 'upgrade1', emoji: '🛠️', name: 'Glow Up', desc: 'Buy your first upgrade' },
  { id: 'maxup', emoji: '💎', name: 'Fully Loaded', desc: 'Max out any upgrade' },
  { id: 'missions10', emoji: '🎯', name: 'Mission Master', desc: 'Complete 10 missions' },
  { id: 'vswin', emoji: '🥊', name: 'Rival Crusher', desc: 'Win a rival battle' },
  { id: 'jackpot', emoji: '🎰', name: 'Jackpot', desc: 'Win the top prize on the lucky wheel' },
  { id: 'quiz5', emoji: '🤓', name: 'Business Genius', desc: 'Answer 5 quiz questions right' },
  { id: 'legendary', emoji: '✨', name: 'Legendary!', desc: 'See a legendary event' },
  { id: 'book50', emoji: '📖', name: 'Collector', desc: 'Discover 50 events' },
  { id: 'book100', emoji: '📚', name: 'Event Hunter', desc: 'Discover 100 events' },
  { id: 'rank4', emoji: '🌆', name: 'City Star', desc: 'Reach the City Star rank' },
  { id: 'rank7', emoji: '🌍', name: 'Global Giant', desc: 'Reach the Global Giant rank' },
  { id: 'daily', emoji: '📅', name: 'Daily Player', desc: 'Finish a Daily Challenge' },
  { id: 'cupgold', emoji: '🥇', name: 'Champion', desc: 'Win the Business Cup' },
  { id: 'powers10', emoji: '⚡', name: 'Power Boss', desc: 'Use Boss Powers 10 times' },
  { id: 'golden5', emoji: '🤑', name: 'Golden Touch', desc: 'Catch 5 golden customers' },
  { id: 'pet', emoji: '🐾', name: 'Pet Lover', desc: 'Get an office pet' },
  { id: 'bankrupt', emoji: '📉', name: 'Lesson Learned', desc: 'Go bankrupt. It happens!' }
];

// Your face as the boss.
CS.AVATARS = ['😎', '🤓', '🥳', '🤠', '🧐', '😺', '🦊', '🐼', '🐸', '🦁', '👸', '🤴', '🧙', '🦸', '🥷', '🤖', '👽', '🐵'];

// Rival company looks.
CS.RIVAL_LOOKS = [['😈', '#FF4D5E'], ['🦈', '#2EA8FF'], ['🐍', '#20C997'], ['🦂', '#FF8A3D'], ['🐺', '#7C4DFF'], ['🦅', '#FFB020'], ['🐗', '#C9306F'], ['🤖', '#625A8C']];

// Boss Powers: special moves with a cooldown in weeks.
CS.POWERS = [
  { id: 'sale', emoji: '⚡', name: 'Flash Sale', desc: '+40% customers next week', cd: 6 },
  { id: 'party', emoji: '🎉', name: 'Team Party', desc: 'Team mood +15', cd: 5, cost: 0.15 },
  { id: 'stunt', emoji: '🤪', name: 'Crazy Stunt', desc: 'Big chance to go viral!', cd: 6 },
  { id: 'overtime', emoji: '🔥', name: 'Overtime', desc: 'Work 30% faster next week', cd: 4 }
];

// What VIP unlocks.
CS.VIP_PERKS = [
  ['🏢', 'VIP companies', 'Space Company, Theme Park, Zoo, Esports Team and more'],
  ['🎁', 'Double daily gifts', 'Every daily gift is worth 2x'],
  ['⚡', 'Faster Boss Powers', 'Every power recharges 1 week sooner'],
  ['🎯', '4 missions at once', 'One extra mission slot with bigger rewards'],
  ['💤', 'Bigger offline earnings', 'Your shop earns 2x while you are away'],
  ['👑', 'VIP look', 'Golden name badge and VIP logos']
];
CS.VIP_LOGOS = ['👑', '💰', '🏆', '🪐', '🐉', '🌈'];
