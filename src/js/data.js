// Static game data: industries, cities, funding, traits, names, achievements.
var CS = globalThis.CS = globalThis.CS || {};

// rv = starting weekly revenue the economy is balanced around.
// comp = starting staff: frontline, sales, accountants, managers.
CS.TIERS = {
  small: { label: 'Small business', rv: 4000, cash: 30000, comp: { front: 3, sales: 0, acct: 0, mgr: 0 },
    blurb: 'Cheap to run and forgiving. Growth is slow.' },
  medium: { label: 'Medium business', rv: 40000, cash: 220000, comp: { front: 6, sales: 1, acct: 0, mgr: 1 },
    blurb: 'Bigger swings. Staff drama starts early.' },
  large: { label: 'Large industry', rv: 500000, cash: 3000000, comp: { front: 10, sales: 1, acct: 1, mgr: 2 },
    startDebt: 0.4, startOwnership: 0.7,
    blurb: 'Hard mode. You start with debt and shareholders.' }
};

// t = average ticket, s = supply cost share of revenue, l = labor share.
// unit = what one "customer" means in this industry.
CS.INDUSTRIES = [
  { id: 'cafe', name: 'Café', emoji: '☕', tier: 'small', t: 7, s: 0.30, l: 0.33, front: 'Barista', unit: 'cups sold' },
  { id: 'restaurant', name: 'Restaurant', emoji: '🍝', tier: 'small', t: 28, s: 0.32, l: 0.32, front: 'Chef', unit: 'diners' },
  { id: 'bakery', name: 'Bakery', emoji: '🥐', tier: 'small', t: 9, s: 0.30, l: 0.30, front: 'Baker', unit: 'orders' },
  { id: 'foodtruck', name: 'Food Truck', emoji: '🌮', tier: 'small', t: 12, s: 0.33, l: 0.28, front: 'Cook', unit: 'meals' },
  { id: 'carwash', name: 'Car Wash', emoji: '🚿', tier: 'small', t: 18, s: 0.12, l: 0.40, front: 'Washer', unit: 'cars washed' },
  { id: 'clothing', name: 'Clothing Store', emoji: '👕', tier: 'small', t: 45, s: 0.45, l: 0.22, front: 'Sales Clerk', unit: 'shoppers' },
  { id: 'convenience', name: 'Convenience Store', emoji: '🏪', tier: 'small', t: 14, s: 0.55, l: 0.18, front: 'Cashier', unit: 'baskets' },
  { id: 'gamestudio', name: 'Game Studio', emoji: '🎮', tier: 'small', t: 20, s: 0.10, l: 0.55, front: 'Developer', unit: 'copies sold' },
  { id: 'phonerepair', name: 'Phone Repair Shop', emoji: '📱', tier: 'small', t: 60, s: 0.30, l: 0.35, front: 'Technician', unit: 'repairs' },
  { id: 'cleaning', name: 'Cleaning Company', emoji: '🧽', tier: 'small', t: 120, s: 0.12, l: 0.50, front: 'Cleaner', unit: 'jobs' },

  { id: 'supermarket', name: 'Supermarket', emoji: '🛒', tier: 'medium', t: 38, s: 0.58, l: 0.15, front: 'Clerk', unit: 'baskets' },
  { id: 'hotel', name: 'Hotel', emoji: '🏨', tier: 'medium', t: 140, s: 0.20, l: 0.35, front: 'Housekeeper', unit: 'room nights' },
  { id: 'gym', name: 'Gym', emoji: '🏋️', tier: 'medium', t: 45, s: 0.10, l: 0.35, front: 'Trainer', unit: 'memberships' },
  { id: 'construction', name: 'Construction Company', emoji: '🏗️', tier: 'medium', t: 25000, s: 0.45, l: 0.30, front: 'Builder', unit: 'contracts' },
  { id: 'furniture', name: 'Furniture Company', emoji: '🛋️', tier: 'medium', t: 600, s: 0.45, l: 0.25, front: 'Carpenter', unit: 'pieces sold' },
  { id: 'electronics', name: 'Electronics Company', emoji: '🔌', tier: 'medium', t: 350, s: 0.55, l: 0.18, front: 'Technician', unit: 'units sold' },
  { id: 'delivery', name: 'Delivery Company', emoji: '📦', tier: 'medium', t: 15, s: 0.25, l: 0.45, front: 'Driver', unit: 'deliveries' },
  { id: 'marketing', name: 'Marketing Agency', emoji: '📣', tier: 'medium', t: 4000, s: 0.10, l: 0.55, front: 'Strategist', unit: 'campaigns' },
  { id: 'software', name: 'Software Company', emoji: '💻', tier: 'medium', t: 900, s: 0.08, l: 0.58, front: 'Developer', unit: 'licenses' },
  { id: 'toys', name: 'Toy Company', emoji: '🧸', tier: 'medium', t: 30, s: 0.45, l: 0.25, front: 'Toymaker', unit: 'toys sold' },

  { id: 'cars', name: 'Car Manufacturer', emoji: '🚙', tier: 'large', t: 32000, s: 0.55, l: 0.18, front: 'Engineer', unit: 'cars sold' },
  { id: 'airline', name: 'Airline', emoji: '✈️', tier: 'large', t: 320, s: 0.40, l: 0.30, front: 'Pilot', unit: 'passengers' },
  { id: 'bank', name: 'Bank', emoji: '🏦', tier: 'large', t: 1500, s: 0.15, l: 0.45, front: 'Banker', unit: 'accounts' },
  { id: 'tech', name: 'Technology Corporation', emoji: '🖥️', tier: 'large', t: 1200, s: 0.20, l: 0.45, front: 'Engineer', unit: 'contracts' },
  { id: 'pharma', name: 'Pharmaceutical Company', emoji: '💊', tier: 'large', t: 250, s: 0.30, l: 0.30, front: 'Scientist', unit: 'prescriptions' },
  { id: 'energy', name: 'Energy Company', emoji: '⚡', tier: 'large', t: 2000, s: 0.50, l: 0.20, front: 'Engineer', unit: 'supply contracts' },
  { id: 'realestate', name: 'Real Estate Corporation', emoji: '🏢', tier: 'large', t: 50000, s: 0.40, l: 0.15, front: 'Agent', unit: 'deals closed' },
  { id: 'entertainment', name: 'Entertainment Corporation', emoji: '🎬', tier: 'large', t: 18, s: 0.35, l: 0.35, front: 'Producer', unit: 'tickets sold' }
];
CS.IND = {};
CS.INDUSTRIES.forEach(function (i) { CS.IND[i.id] = i; });

// Multipliers against a neutral baseline city.
CS.CITIES = {
  newyork: { name: 'New York', flag: '🇺🇸', demand: 1.3, ticket: 1.2, wage: 1.4, rent: 1.8, note: 'Huge market, brutal rent' },
  london: { name: 'London', flag: '🇬🇧', demand: 1.25, ticket: 1.2, wage: 1.35, rent: 1.7, note: 'Rich customers, high costs' },
  tokyo: { name: 'Tokyo', flag: '🇯🇵', demand: 1.25, ticket: 1.15, wage: 1.3, rent: 1.6, note: 'Demanding, loyal customers' },
  toronto: { name: 'Toronto', flag: '🇨🇦', demand: 1.05, ticket: 1.08, wage: 1.15, rent: 1.2, note: 'Balanced and steady' },
  berlin: { name: 'Berlin', flag: '🇩🇪', demand: 1.0, ticket: 1.0, wage: 1.1, rent: 1.0, note: 'Average everything' },
  saopaulo: { name: 'São Paulo', flag: '🇧🇷', demand: 1.1, ticket: 0.8, wage: 0.75, rent: 0.8, note: 'Busy, price-sensitive' },
  mumbai: { name: 'Mumbai', flag: '🇮🇳', demand: 1.2, ticket: 0.65, wage: 0.5, rent: 0.6, note: 'Cheap staff, low prices' },
  smalltown: { name: 'Small Town', flag: '🏡', demand: 0.75, ticket: 0.85, wage: 0.75, rent: 0.45, note: 'Few customers, tiny rent' }
};

CS.FUNDING = {
  savings: { name: 'Personal savings', cash: 1, own: 1, loan: 0, note: 'You keep 100% of the company.' },
  angel: { name: 'Angel investor', cash: 2, own: 0.8, loan: 0, note: 'Twice the cash for 20% of the company.' },
  bank: { name: 'Bank loan', cash: 1, own: 1, loan: 1, note: 'Double the cash, repaid over two years.' },
  vc: { name: 'Venture capital', cash: 4, own: 0.55, loan: 0, note: 'Four times the cash. You keep 55%.' }
};

// Role salary multipliers relative to a frontline worker.
CS.ROLES = {
  front: { mult: 1, label: null },
  sales: { mult: 1, label: 'Salesperson' },
  acct: { mult: 1.1, label: 'Accountant' },
  mgr: { mult: 1.6, label: 'Manager' }
};
CS.LEVELS = ['', 'Senior ', 'Lead '];

CS.TRAITS = {
  hardworking: { label: 'Hardworking', good: true, desc: 'Produces 15% more.' },
  lazy: { label: 'Lazy', good: false, desc: 'Produces 15% less.' },
  ambitious: { label: 'Ambitious', good: true, desc: 'Learns fast, wants promotions.' },
  creative: { label: 'Creative', good: true, desc: 'Comes up with ideas.' },
  loyal: { label: 'Loyal', good: true, desc: 'Rarely leaves.' },
  greedy: { label: 'Greedy', good: false, desc: 'Wants money. Might take some.' },
  friendly: { label: 'Friendly', good: true, desc: 'Makes friends, lifts the team.' },
  aggressive: { label: 'Aggressive', good: false, desc: 'Starts fights.' },
  reliable: { label: 'Reliable', good: true, desc: 'Always shows up.' },
  unreliable: { label: 'Unreliable', good: false, desc: 'Late, often absent.' },
  funny: { label: 'Funny', good: true, desc: 'Good for morale. Starts pranks.' },
  serious: { label: 'Serious', good: true, desc: 'Focused, a bit cold.' }
};
CS.TRAIT_CLASH = { hardworking: 'lazy', lazy: 'hardworking', reliable: 'unreliable', unreliable: 'reliable', funny: 'serious', serious: 'funny', loyal: 'greedy', greedy: 'loyal', friendly: 'aggressive', aggressive: 'friendly' };

CS.FIRST = ['Ava', 'Liam', 'Maya', 'Noah', 'Zara', 'Leo', 'Priya', 'Mateo', 'Chloe', 'Omar', 'Yuki', 'Ethan', 'Amara', 'Lucas', 'Sofia', 'Kai', 'Nia', 'Diego', 'Hana', 'Felix', 'Aisha', 'Jonah', 'Ines', 'Ravi', 'Grace', 'Tariq', 'Elena', 'Marcus', 'Lena', 'Kofi', 'Mei', 'Oscar', 'Leila', 'Sam', 'Freya', 'Dev', 'Rosa', 'Ivan', 'Tess', 'Malik', 'Nora', 'Theo', 'Imani', 'Hugo', 'Keiko', 'Bruno', 'Ruby', 'Arjun', 'Lola', 'Emeka'];
CS.LAST = ['Smith', 'Okafor', 'Tanaka', 'Garcia', 'Müller', 'Patel', 'Kim', 'Rossi', 'Silva', 'Nguyen', 'Cohen', 'Brown', 'Haddad', 'Ivanova', 'Mensah', 'Dubois', 'Khan', 'Lopez', 'Andersen', 'Park', 'Walker', 'Costa', 'Sato', 'Novak', 'Ahmed', 'Reyes', 'Fischer', 'Owusu', 'Moreau', 'Chen'];

CS.RIVAL_A = ['Apex', 'Blue', 'Golden', 'Metro', 'Nova', 'Summit', 'Urban', 'Prime', 'Crown', 'Rapid', 'Bright', 'Iron'];
CS.RIVAL_B = ['& Co.', 'Group', 'Brothers', 'Collective', 'Works', 'Partners', 'Holdings', 'Express', 'House', 'Labs'];

CS.LOGOS = ['☕', '🍕', '🚀', '🦊', '🐝', '🌵', '⚙️', '💎', '🔥', '🌊', '🍀', '⭐', '🦁', '🐙', '🎯', '🏔️', '🧠', '🍩'];
CS.COLORS = ['#0F7B53', '#2F5F98', '#C98A12', '#B8434E', '#6A4C9C', '#1F8A8A', '#D1622B', '#3B3F46'];

CS.ECON = {
  normal: { name: 'Stable economy', demand: 1, supply: 0, tone: 'neutral' },
  boom: { name: 'Economic boom', demand: 1.15, supply: 0, tone: 'good' },
  recession: { name: 'Recession', demand: 0.8, supply: 0, tone: 'bad' },
  inflation: { name: 'High inflation', demand: 0.95, supply: 0.04, tone: 'warn' }
};

CS.ACHIEVEMENTS = [
  { id: 'open', name: 'Open for Business', desc: 'Finish your first week.' },
  { id: 'hire1', name: 'First Hire', desc: 'Hire someone from the hiring board.' },
  { id: 'team10', name: 'Growing Team', desc: 'Employ 10 people.' },
  { id: 'team25', name: 'Real Company', desc: 'Employ 25 people.' },
  { id: 'team50', name: 'Big Employer', desc: 'Employ 50 people.' },
  { id: 'cash100k', name: 'Six Figures', desc: 'Have $100,000 in the bank.' },
  { id: 'cash1m', name: 'Millionaire', desc: 'Have $1,000,000 in the bank.' },
  { id: 'cash10m', name: 'Eight Figures', desc: 'Have $10,000,000 in the bank.' },
  { id: 'cash1b', name: 'Billionaire', desc: 'Have $1,000,000,000 in the bank.' },
  { id: 'year1', name: 'First Anniversary', desc: 'Survive 52 weeks.' },
  { id: 'year5', name: 'Built to Last', desc: 'Survive 260 weeks.' },
  { id: 'rep90', name: 'Beloved Brand', desc: 'Reach 90 reputation.' },
  { id: 'events50', name: 'Crisis Manager', desc: 'Make 50 event decisions.' },
  { id: 'events250', name: 'Seen It All', desc: 'Make 250 event decisions.' },
  { id: 'chaos', name: 'Chaos Week', desc: 'Live through a week with 5 or more events.' },
  { id: 'recession', name: 'Recession Proof', desc: 'Survive a recession.' },
  { id: 'debtfree', name: 'Debt Free', desc: 'Pay off a loan.' },
  { id: 'viral', name: 'Gone Viral', desc: 'Have your company go viral.' },
  { id: 'lovebirds', name: 'Office Romance', desc: 'Two employees start dating.' },
  { id: 'toughboss', name: 'Tough Boss', desc: 'Fire 10 employees.' },
  { id: 'fullhouse', name: 'Full House', desc: 'Serve every customer for 10 weeks in a row.' },
  { id: 'bankrupt', name: 'Lesson Learned', desc: 'Go bankrupt. It happens.' }
];
