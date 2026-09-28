/* =========================================================
   Urban Scenery Ventures — product data
   Temporary mock data. To connect a backend later, replace the
   contents of USV.products / USV.categories / etc. with fetch()
   calls that return the same shapes. Nothing else needs to change.
   ========================================================= */

window.USV = (function () {
  "use strict";

  var config = {
    storeName: "Urban Scenery Ventures",
    tagline: "Real tech. Honest prices.",
    currency: "USD",
    symbol: "$",
    locale: "en-US",
    decimals: 2,
    freeShippingOver: 500,
    shippingFlat: 24,
    taxRate: 0.075,
    defaultImage: "images/cat-smartphones.svg"
  };

  var categories = [
    {
      id: "smartphones",
      name: "Smartphones",
      blurb: "Flagships, mid-rangers and budget handhelds",
      image: "images/cat-smartphones.svg",
      icon: "phone"
    },
    {
      id: "laptops",
      name: "Laptops",
      blurb: "Ultrabooks, creator machines and study laptops",
      image: "images/cat-laptops.svg",
      icon: "laptop"
    },
    {
      id: "headphones",
      name: "Headphones",
      blurb: "Over-ear, earbuds and studio monitors",
      image: "images/cat-headphones.svg",
      icon: "audio"
    },
    {
      id: "smartwatches",
      name: "Smart Watches",
      blurb: "Fitness trackers and connected watches",
      image: "images/cat-smartwatches.svg",
      icon: "watch"
    },
    {
      id: "gaming",
      name: "Gaming",
      blurb: "Consoles, handhelds, controllers and chairs",
      image: "images/cat-gaming.svg",
      icon: "gaming"
    },
    {
      id: "accessories",
      name: "Accessories",
      blurb: "Chargers, power banks, cables and cases",
      image: "images/cat-accessories.svg",
      icon: "power"
    },
    {
      id: "home-electronics",
      name: "Home Electronics",
      blurb: "Speakers, smart lighting and smart home kit",
      image: "images/cat-home-electronics.svg",
      icon: "home"
    }
  ];

  var products = [
    {
      id: 1,
      sku: "USV-PH-1001",
      name: "Nexus X1 Pro 5G Smartphone",
      brand: "Nexus",
      category: "smartphones",
      price: 949,
      oldPrice: 1149,
      rating: 4.8,
      reviews: 1284,
      stock: 24,
      badge: "best-seller",
      image: "images/cat-smartphones.svg",
      gallery: ["images/cat-smartphones.svg", "images/hero.svg", "images/promo-deals.svg"],
      short: "6.7\" LTPO display, triple camera and two-day battery.",
      description:
        "The X1 Pro is our most requested flagship of the season. A 6.7-inch LTPO panel runs at a variable 1-120Hz so scrolling stays smooth without draining the battery, and the triple rear camera holds up in low light far better than last year's sensor. The titanium frame keeps the weight down while the vapour chamber keeps sustained performance stable during long sessions.",
      specs: [
        ["Display", "6.7\" LTPO AMOLED, 1-120Hz"],
        ["Processor", "Octa-core 3.2GHz, 4nm"],
        ["Memory", "12GB RAM / 256GB storage"],
        ["Camera", "50MP + 48MP + 12MP, OIS"],
        ["Battery", "5,000mAh, 65W wired / 25W wireless"],
        ["Network", "5G, Wi-Fi 6E, Bluetooth 5.3"],
        ["Warranty", "24 months manufacturer"]
      ]
    },
    {
      id: 2,
      sku: "USV-PH-1002",
      name: "Nexus Air 5G Smartphone",
      brand: "Nexus",
      category: "smartphones",
      price: 429,
      oldPrice: 529,
      rating: 4.5,
      reviews: 968,
      stock: 61,
      badge: "sale",
      image: "images/cat-smartphones.svg",
      gallery: ["images/cat-smartphones.svg", "images/promo-deals.svg"],
      short: "Mid-range 5G that punches above its price bracket.",
      description:
        "Everything that matters, nothing you will not use. The Air keeps the same 5G modem as the X1 Pro at roughly half the price, with a 6.4-inch OLED and a clean Android build that stays smooth for the full warranty period. This is the model we recommend to anyone upgrading from a three-year-old handset.",
      specs: [
        ["Display", "6.4\" OLED, 90Hz"],
        ["Processor", "Octa-core 2.6GHz, 6nm"],
        ["Memory", "8GB RAM / 128GB storage"],
        ["Camera", "50MP + 8MP ultrawide"],
        ["Battery", "4,800mAh, 45W charging"],
        ["Network", "5G, Wi-Fi 6, Bluetooth 5.3"],
        ["Warranty", "18 months manufacturer"]
      ]
    },
    {
      id: 3,
      sku: "USV-PH-1003",
      name: "Glide Mini 4G Handset",
      brand: "Glide",
      category: "smartphones",
      price: 179,
      rating: 4.2,
      reviews: 402,
      stock: 88,
      badge: null,
      image: "images/cat-smartphones.svg",
      gallery: ["images/cat-smartphones.svg"],
      short: "A dependable backup phone with a two-day battery.",
      description:
        "A small, honest handset for anyone who wants a second number, a work line or a phone that simply lasts two days on a charge. The 5.5-inch display is bright enough for daylight, and the software is stripped back to the essentials so there is nothing to slow it down.",
      specs: [
        ["Display", "5.5\" IPS, 720p"],
        ["Processor", "Quad-core 1.8GHz"],
        ["Memory", "3GB RAM / 32GB storage"],
        ["Camera", "8MP rear, 5MP front"],
        ["Battery", "4,000mAh"],
        ["Network", "4G LTE, dual SIM"],
        ["Warranty", "12 months manufacturer"]
      ]
    },
    {
      id: 4,
      sku: "USV-LP-2001",
      name: "Vertex Pro 14 Creator Laptop",
      brand: "Vertex",
      category: "laptops",
      price: 1499,
      oldPrice: 1899,
      rating: 4.9,
      reviews: 742,
      stock: 17,
      badge: "best-seller",
      image: "images/cat-laptops.svg",
      gallery: ["images/cat-laptops.svg", "images/hero.svg", "images/promo-warranty.svg"],
      short: "14\" colour-accurate display with dedicated graphics.",
      description:
        "Built for people who edit for a living. The 14-inch display is factory calibrated to 100% DCI-P3 and covers a full sRGB range without oversaturation, and the dedicated GPU holds 60fps on 4K timelines. The chassis is machined from a single aluminium block, which is why it weighs just over 1.4kg and still feels rigid when you type on it unsupported.",
      specs: [
        ["Display", "14\" 3K 120Hz, 100% DCI-P3"],
        ["Processor", "8-core 3.4GHz, 5nm"],
        ["Graphics", "Dedicated 8GB GPU"],
        ["Memory", "32GB RAM / 1TB SSD"],
        ["Battery", "Up to 16 hours mixed use"],
        ["Ports", "2x USB-C, 1x HDMI 2.1, SD, 3.5mm"],
        ["Warranty", "24 months manufacturer"]
      ]
    },
    {
      id: 5,
      sku: "USV-LP-2002",
      name: "Vertex Air 13 Ultrabook",
      brand: "Vertex",
      category: "laptops",
      price: 869,
      oldPrice: 999,
      rating: 4.6,
      reviews: 1188,
      stock: 32,
      badge: "sale",
      image: "images/cat-laptops.svg",
      gallery: ["images/cat-laptops.svg", "images/hero.svg"],
      short: "Fanless, 1.1kg, and genuinely all-day battery life.",
      description:
        "The Air 13 is the laptop we recommend when battery life matters most. There is no fan at all, which means silence, and the efficiency of the chip inside buys a full working day of real use. Two USB-C ports charge from either side, which sounds minor until the first time one of them stops working.",
      specs: [
        ["Display", "13.3\" 2.5K, 60Hz"],
        ["Processor", "8-core 3.0GHz, 6nm"],
        ["Graphics", "Integrated"],
        ["Memory", "16GB RAM / 512GB SSD"],
        ["Battery", "Up to 18 hours mixed use"],
        ["Ports", "2x USB-C, 1x USB-A, 3.5mm"],
        ["Warranty", "24 months manufacturer"]
      ]
    },
    {
      id: 6,
      sku: "USV-LP-2003",
      name: "Forge 15 Studio Laptop",
      brand: "Forge",
      category: "laptops",
      price: 1799,
      rating: 4.7,
      reviews: 264,
      stock: 9,
      badge: "new",
      image: "images/cat-laptops.svg",
      gallery: ["images/cat-laptops.svg", "images/promo-deals.svg"],
      short: "Workstation-class cooling for 3D and machine learning.",
      description:
        "A 15-inch workstation with a vapour chamber twice the size of the Pro 14's and a colour shift of less than one Delta E unit between the panel's corners. If you are rendering, training models or colour grading, the stability here is worth the extra kilogram.",
      specs: [
        ["Display", "15.6\" 4K OLED, 100% DCI-P3"],
        ["Processor", "12-core 3.6GHz, 5nm"],
        ["Graphics", "Dedicated 12GB GPU"],
        ["Memory", "64GB RAM / 2TB SSD"],
        ["Battery", "Up to 9 hours mixed use"],
        ["Ports", "2x USB-C, 2x USB-A, HDMI, SD"],
        ["Warranty", "36 months manufacturer"]
      ]
    },
    {
      id: 7,
      sku: "USV-LP-2004",
      name: "Atlas 14 Study Laptop",
      brand: "Atlas",
      category: "laptops",
      price: 549,
      rating: 4.4,
      reviews: 1533,
      stock: 44,
      badge: null,
      image: "images/cat-laptops.svg",
      gallery: ["images/cat-laptops.svg"],
      short: "The value pick for students and office work.",
      description:
        "A 14-inch notebook that covers coursework, spreadsheets and video calls without drama. The 16GB of memory matters more here than any spec-sheet headline, because it is what keeps twenty browser tabs from turning into a slideshow.",
      specs: [
        ["Display", "14\" FHD, 60Hz"],
        ["Processor", "6-core 2.4GHz"],
        ["Graphics", "Integrated"],
        ["Memory", "16GB RAM / 512GB SSD"],
        ["Battery", "Up to 11 hours mixed use"],
        ["Ports", "1x USB-C, 2x USB-A, HDMI"],
        ["Warranty", "12 months manufacturer"]
      ]
    },
    {
      id: 8,
      sku: "USV-HP-3001",
      name: "SonoQ Studio Pro Headphones",
      brand: "SonoQ",
      category: "headphones",
      price: 289,
      oldPrice: 379,
      rating: 4.8,
      reviews: 906,
      stock: 26,
      badge: "sale",
      image: "images/cat-headphones.svg",
      gallery: ["images/cat-headphones.svg", "images/promo-warranty.svg"],
      short: "Closed-back monitoring headphones with a flat response.",
      description:
        "These are proper monitoring headphones, not lifestyle headphones with a flat EQ badge. The 45mm drivers stay within +/-1.5dB of the target curve from 20Hz to 10kHz, and the replaceable pads mean you can keep using them for years instead of a season.",
      specs: [
        ["Driver", "45mm closed-back dynamic"],
        ["Frequency", "20Hz - 22kHz"],
        ["Impedance", "32 ohms"],
        ["Connectivity", "Wired 3.5mm + USB-C, Bluetooth 5.2"],
        ["Battery", "38 hours (wireless)"],
        ["Weight", "286g"],
        ["Warranty", "24 months manufacturer"]
      ]
    },
    {
      id: 9,
      sku: "USV-HP-3002",
      name: "Orbit Air Wireless Earbuds",
      brand: "Orbit",
      category: "headphones",
      price: 89,
      oldPrice: 119,
      rating: 4.5,
      reviews: 3127,
      stock: 74,
      badge: "best-seller",
      image: "images/cat-headphones.svg",
      gallery: ["images/cat-headphones.svg", "images/promo-deals.svg"],
      short: "Seven hours per charge, plus a pocketable case.",
      description:
        "The Air are our default recommendation for most people. Charging case and buds together give you close to 30 hours, the fit stays secure while running, and the case is small enough to forget it is in a pocket. There is no active noise cancellation at this price, and it is the one thing you give up.",
      specs: [
        ["Driver", "11mm dynamic"],
        ["Battery", "7h buds, 30h with case"],
        ["Charging", "USB-C, wireless charging case"],
        ["Connectivity", "Bluetooth 5.3"],
        ["Water rating", "IPX5"],
        ["Weight", "4.2g per bud"],
        ["Warranty", "18 months manufacturer"]
      ]
    },
    {
      id: 10,
      sku: "USV-HP-3003",
      name: "SonoQ Air Travel Headphones",
      brand: "SonoQ",
      category: "headphones",
      price: 159,
      rating: 4.3,
      reviews: 742,
      stock: 38,
      badge: null,
      image: "images/cat-headphones.svg",
      gallery: ["images/cat-headphones.svg"],
      short: "Active noise cancelling that folds flat into a bag.",
      description:
        "Noise cancelling is the reason most people buy a second pair of headphones, and this is the pair we use on flights. The cancelling handles the low rumble of an engine well rather than claiming to silence everything, and the whole thing folds into a hard case that fits in a carry-on pocket.",
      specs: [
        ["Driver", "40mm closed-back dynamic"],
        ["Noise cancelling", "Hybrid ANC, 3 levels"],
        ["Battery", "30 hours with ANC on"],
        ["Connectivity", "Bluetooth 5.3, 3.5mm, USB-C audio"],
        ["Weight", "248g"],
        ["Features", "Folds flat, carries case included"],
        ["Warranty", "18 months manufacturer"]
      ]
    },
    {
      id: 11,
      sku: "USV-SW-4001",
      name: "Pulse S9 Smartwatch",
      brand: "Pulse",
      category: "smartwatches",
      price: 219,
      oldPrice: 279,
      rating: 4.6,
      reviews: 1188,
      stock: 52,
      badge: "sale",
      image: "images/cat-smartwatches.svg",
      gallery: ["images/cat-smartwatches.svg", "images/hero.svg"],
      short: "Two-week battery with always-on display and GPS.",
      description:
        "Most smartwatches ask you to charge them every two days. The S9 lasts about a fortnight with the always-on display on, and it has real dual-band GPS, so the workout tracking holds up outdoors rather than wandering two kilometres off-route.",
      specs: [
        ["Display", "1.43\" AMOLED, always-on"],
        ["Battery", "Up to 14 days typical"],
        ["Sensors", "Heart rate, SpO2, ECG, skin temp"],
        ["GPS", "Dual-band, multi-system"],
        ["Water rating", "5ATM"],
        ["Connectivity", "Bluetooth 5.2, Wi-Fi"],
        ["Warranty", "18 months manufacturer"]
      ]
    },
    {
      id: 12,
      sku: "USV-SW-4002",
      name: "Pulse Fit Band 3",
      brand: "Pulse",
      category: "smartwatches",
      price: 59,
      rating: 4.1,
      reviews: 2264,
      stock: 96,
      badge: null,
      image: "images/cat-smartwatches.svg",
      gallery: ["images/cat-smartwatches.svg"],
      short: "A ten-day fitness tracker for under sixty.",
      description:
        "If you want steps, sleep and heart rate without a subscription or a smartwatch-sized case, this does the job and then some. The band is lighter than you expect and the screen stays readable in direct sun.",
      specs: [
        ["Display", "1.1\" AMOLED"],
        ["Battery", "Up to 10 days"],
        ["Sensors", "Heart rate, SpO2, accelerometer"],
        ["Water rating", "5ATM"],
        ["Connectivity", "Bluetooth 5.2"],
        ["Weight", "21g"],
        ["Warranty", "12 months manufacturer"]
      ]
    },
    {
      id: 13,
      sku: "USV-GM-5001",
      name: "Vectr Handheld Gaming Console",
      brand: "Vectr",
      category: "gaming",
      price: 429,
      rating: 4.7,
      reviews: 634,
      stock: 21,
      badge: "new",
      image: "images/cat-gaming.svg",
      gallery: ["images/cat-gaming.svg", "images/promo-deals.svg"],
      short: "A 7-inch handheld with a hall-effect stick module.",
      description:
        "The stick module is the reason to buy this over a cheaper handheld: hall-effect sensors mean the stick will not drift, which is the fault that ends most budget devices within a year. The 7-inch 120Hz screen is the largest we have seen at this weight.",
      specs: [
        ["Display", "7\" IPS, 120Hz"],
        ["Processor", "8-core 2.8GHz"],
        ["Memory", "16GB RAM / 512GB storage"],
        ["Battery", "8,000mAh, 3.5 hours"],
        ["Controls", "Hall-effect sticks, HD haptics"],
        ["Weight", "598g"],
        ["Warranty", "12 months manufacturer"]
      ]
    },
    {
      id: 14,
      sku: "USV-GM-5002",
      name: "Vectr Elite Wireless Controller",
      brand: "Vectr",
      category: "gaming",
      price: 79,
      oldPrice: 99,
      rating: 4.6,
      reviews: 1580,
      stock: 67,
      badge: "sale",
      image: "images/cat-gaming.svg",
      gallery: ["images/cat-gaming.svg"],
      short: "Zero-drift sticks and 30-hour battery.",
      description:
        "A controller that fixes the two things that usually bother people: stick drift and weak triggers. The triggers have adjustable travel, the sticks are hall-effect, and the battery genuinely lasts a month of evening sessions.",
      specs: [
        ["Compatibility", "PC, console, mobile, cloud gaming"],
        ["Sticks", "Hall-effect, no drift"],
        ["Triggers", "Adjustable travel, 2 modes"],
        ["Battery", "30 hours per charge"],
        ["Connectivity", "2.4GHz, Bluetooth, USB-C"],
        ["Weight", "295g"],
        ["Warranty", "12 months manufacturer"]
      ]
    },
    {
      id: 15,
      sku: "USV-GM-5003",
      name: "Vectr Core 120Hz Gaming Monitor",
      brand: "Vectr",
      category: "gaming",
      price: 289,
      rating: 4.7,
      reviews: 421,
      stock: 14,
      badge: null,
      image: "images/cat-gaming.svg",
      gallery: ["images/cat-gaming.svg", "images/promo-deals.svg"],
      short: "27\" fast IPS with 1ms response for competitive play.",
      description:
        "A 27-inch 1080p panel running at 120Hz with 1ms response. It is not the highest resolution on the market and it does not pretend to be, which is exactly why the motion stays clean in competitive shooters where a slower 4K panel often feels less responsive.",
      specs: [
        ["Display", "27\" Fast IPS, 1920x1080"],
        ["Refresh", "120Hz, 1ms GtG"],
        ["Sync", "FreeSync, G-Sync compatible"],
        ["Brightness", "300 nits"],
        ["Ports", "2x HDMI, DisplayPort, 3.5mm"],
        ["Stand", "Height, tilt and pivot adjustable"],
        ["Warranty", "36 months manufacturer"]
      ]
    },
    {
      id: 16,
      sku: "USV-AC-6001",
      name: "Volt 100W GaN Charger",
      brand: "Volt",
      category: "accessories",
      price: 49,
      oldPrice: 69,
      rating: 4.8,
      reviews: 3411,
      stock: 130,
      badge: "best-seller",
      image: "images/cat-accessories.svg",
      gallery: ["images/cat-accessories.svg", "images/promo-warranty.svg"],
      short: "Four ports, laptop-class output, palm-sized.",
      description:
        "One charger for a laptop, a phone, a tablet and a pair of earbuds, in a body smaller than the wall plug it replaces. Four ports deliver up to 100W total with intelligent power sharing, and it runs cool enough to keep in a bag rather than leaving it at home.",
      specs: [
        ["Output", "Up to 100W total"],
        ["Ports", "2x USB-C, 2x USB-A"],
        ["Technology", "GaN III"],
        ["Input", "100-240V, universal"],
        ["Size", "62 x 42 x 28mm"],
        ["Protection", "Over-current, over-heat, surge"],
        ["Warranty", "24 months manufacturer"]
      ]
    },
    {
      id: 17,
      sku: "USV-AC-6002",
      name: "Volt 20K Power Bank",
      brand: "Volt",
      category: "accessories",
      price: 39,
      rating: 4.5,
      reviews: 1987,
      stock: 112,
      badge: null,
      image: "images/cat-accessories.svg",
      gallery: ["images/cat-accessories.svg"],
      short: "Enough capacity for four full phone charges.",
      description:
        "20,000mAh, which is the practical sweet spot: enough for a weekend away and still allowed through most airline carry-on rules. The display shows the exact remaining percentage rather than four vague dots.",
      specs: [
        ["Capacity", "20,000mAh"],
        ["Output", "USB-C 30W, USB-A 18W"],
        ["Input", "USB-C 30W"],
        ["Display", "Digital percentage readout"],
        ["Ports", "2x USB-C, 1x USB-A"],
        ["Weight", "430g"],
        ["Warranty", "18 months manufacturer"]
      ]
    },
    {
      id: 18,
      sku: "USV-AC-6003",
      name: "Shield Armour Laptop Sleeve 14\"",
      brand: "Shield",
      category: "accessories",
      price: 29,
      rating: 4.3,
      reviews: 864,
      stock: 88,
      badge: null,
      image: "images/cat-accessories.svg",
      gallery: ["images/cat-accessories.svg"],
      short: "Water-resistant, with a soft inner lining.",
      description:
        "Water-resistant outer shell, water-absorbing lining and a closed zip so nothing falls out when you set it down open. Fits most 13 and 14-inch laptops with room for a charger in the second pocket.",
      specs: [
        ["Fits", "13-14 inch laptops"],
        ["Material", "Water-resistant polyester, soft lining"],
        ["Closure", "YKK zip with pull tab"],
        ["Pockets", "Main plus accessory pocket"],
        ["Weight", "210g"],
        ["Care", "Machine washable"],
        ["Warranty", "12 months"]
      ]
    },
    {
      id: 19,
      sku: "USV-HE-7001",
      name: "EchoHome 360 Smart Speaker",
      brand: "EchoHome",
      category: "home-electronics",
      price: 139,
      oldPrice: 179,
      rating: 4.5,
      reviews: 1129,
      stock: 33,
      badge: "sale",
      image: "images/cat-home-electronics.svg",
      gallery: ["images/cat-home-electronics.svg", "images/hero.svg"],
      short: "Room-filling sound with voice control built in.",
      description:
        "A single speaker that fills a mid-sized room, with a far-field microphone array that hears you over the music. Works with the usual streaming services out of the box and pairs into a stereo pair if you buy a second one later.",
      specs: [
        ["Drivers", "1x 89mm woofer, 2x 20mm tweeters"],
        ["Power", "40W RMS"],
        ["Voice", "Far-field mic array, wake word"],
        ["Connectivity", "Wi-Fi 6, Bluetooth 5.3, AUX"],
        ["Streaming", "Built-in music and podcast apps"],
        ["Size", "175mm tall"],
        ["Warranty", "24 months manufacturer"]
      ]
    },
    {
      id: 20,
      sku: "USV-HE-7002",
      name: "EchoHome Smart Bulb 4-Pack",
      brand: "EchoHome",
      category: "home-electronics",
      price: 45,
      rating: 4.2,
      reviews: 2036,
      stock: 145,
      badge: "best-seller",
      image: "images/cat-home-electronics.svg",
      gallery: ["images/cat-home-electronics.svg"],
      short: "Sixteen million colours and no hub required.",
      description:
        "Four E27 bulbs that connect straight to your Wi-Fi, with no separate hub to power or configure. Schedule them, group them by room, and set a wake-up routine that takes fifteen minutes longer each morning.",
      specs: [
        ["Fitting", "E27 / B22"],
        ["Brightness", "806 lumens per bulb"],
        ["Colours", "16 million RGB + tunable white"],
        ["Control", "App, voice, physical dimmer"],
        ["Connectivity", "Wi-Fi 2.4GHz"],
        ["Energy", "9W LED"],
        ["Warranty", "24 months manufacturer"]
      ]
    },
    {
      id: 21,
      sku: "USV-HE-7003",
      name: "EchoHome Video Doorbell",
      brand: "EchoHome",
      category: "home-electronics",
      price: 119,
      rating: 4.4,
      reviews: 588,
      stock: 27,
      badge: "new",
      image: "images/cat-home-electronics.svg",
      gallery: ["images/cat-home-electronics.svg", "images/promo-warranty.svg"],
      short: "1080p night vision with two-way talk.",
      description:
        "Answers the door from your phone, records locally to a microSD card so footage stays yours, and switches to infrared night vision automatically. The chime plugs into a normal wall socket, so no wiring is needed.",
      specs: [
        ["Video", "1080p, 150° field of view"],
        ["Night vision", "Infrared, 9m range"],
        ["Audio", "Two-way talk, noise-cancelling mic"],
        ["Storage", "MicroSD up to 128GB, optional cloud"],
        ["Power", "Internal battery, 5 months"],
        ["Connectivity", "Wi-Fi 2.4GHz, app control"],
        ["Warranty", "18 months manufacturer"]
      ]
    },
    {
      id: 22,
      sku: "USV-HE-7004",
      name: "EchoHome Mesh Wi-Fi 6 Kit",
      brand: "EchoHome",
      category: "home-electronics",
      price: 199,
      oldPrice: 249,
      rating: 4.6,
      reviews: 704,
      stock: 19,
      badge: "sale",
      image: "images/cat-home-electronics.svg",
      gallery: ["images/cat-home-electronics.svg", "images/promo-deals.svg"],
      short: "Two nodes that cover a whole two-storey home.",
      description:
        "Dead zones in a house are almost always a router-placement problem. Two mesh nodes placed a third of the way between your router and the far end of the house fix it for less than a single high-end router costs, and the app walks you through it in about ten minutes.",
      specs: [
        ["Standard", "Wi-Fi 6 (AX1800)"],
        ["Coverage", "Up to 370m² across two nodes"],
        ["Ports", "2x Gigabit Ethernet per node"],
        ["Mesh", "Seamless roaming, WPA3"],
        ["Management", "App, guest network, parental controls"],
        ["In the box", "2 nodes, 1 Ethernet cable"],
        ["Warranty", "24 months manufacturer"]
      ]
    }
  ];

  var testimonials = [
    {
      name: "Amara Okello",
      location: "Kampala",
      rating: 5,
      date: "August 2026",
      title: "Genuinely the least hassle purchase I have made",
      body:
        "I have been burned by two online shops before this one. The laptop arrived sealed, the serial number checked out with the manufacturer, and when the charger was one day late the support team sorted it without me chasing. That is the whole reason I came back for the tablet.",
      product: "Vertex Pro 14 Creator Laptop"
    },
    {
      name: "Brian Ssekandi",
      location: "Entebbe",
      rating: 5,
      date: "July 2026",
      title: "The price history on the site actually saved me money",
      body:
        "I watched the price graph for two weeks before buying and it dipped right after I ordered. The automatic refund landed four days later without me asking. I have never had that from a store anywhere.",
      product: "Nexus X1 Pro 5G Smartphone"
    },
    {
      name: "Nadia Wanjiku",
      location: "Nairobi",
      rating: 4,
      date: "July 2026",
      title: "Fast delivery, packaging could be stronger",
      body:
        "Product is exactly as described and it arrived the next day. Only complaint is that the outer box was a little dented, though the inner packaging kept everything safe and there was no damage to the actual item.",
      product: "SonoQ Studio Pro Headphones"
    },
    {
      name: "Timothy Musisi",
      location: "Jinja",
      rating: 5,
      date: "June 2026",
      title: "Warranty claim was painless",
      body:
        "A port on my watch stopped charging after five months. I opened a claim on a Sunday, uploaded the invoice and a short video, and got a replacement couriered out on Tuesday. No argument about the receipt.",
      product: "Pulse S9 Smartwatch"
    },
    {
      name: "Grace Atuhaire",
      location: "Mbarara",
      rating: 5,
      date: "May 2026",
      title: "The comparison tool steered me away from a bad upgrade",
      body:
        "I was about to buy a much more expensive phone because of the marketing. The spec table made it obvious the cheaper one covered everything I actually use. Appreciated being talked out of spending more.",
      product: "Nexus Air 5G Smartphone"
    },
    {
      name: "Daniel Kizito",
      location: "Mbale",
      rating: 4,
      date: "May 2026",
      title: "Solid retailer, average support response times",
      body:
        "Everything about the purchase was easy, including the swap when I wanted a different colour. Support replies took about four hours on a weekday, which is fine unless you are in a hurry. Products and pricing are competitive.",
      product: "Vectr Elite Wireless Controller"
    }
  ];

  var articles = [
    {
      id: 1,
      title: "How to pick a laptop you will not regret in two years",
      category: "Buying guides",
      date: "12 September 2026",
      readTime: "7 min read",
      image: "images/article-buying-guide.svg",
      excerpt:
        "Most people overpay on the chip and underpay on the memory. Here is the order of importance that actually decides how a laptop feels after 24 months of daily use.",
      body:
        "Start with memory, not the processor. A faster chip with 8GB of RAM will feel slower every single day than a slightly slower chip with 16GB, because the system spends its time swapping to disk instead of computing. Next, buy the screen you actually want to look at for years. Third, ignore the fan noise figure and read reviews instead. Only after those three should the processor specification matter at all."
    },
    {
      id: 2,
      title: "Nine habits that double your phone battery life",
      category: "Tips & tricks",
      date: "5 September 2026",
      readTime: "5 min read",
      image: "images/article-battery-care.svg",
      excerpt:
        "Battery wear is mostly about heat and charge habits, not age. Small changes add up to a phone that comfortably lasts a day at the two-year mark.",
      body:
        "Heat is the single biggest factor and it is almost always self-inflicted. Charging while gaming, leaving the phone under a pillow, or using it in direct sun all cook the cell faster than the chemistry of fast charging does. Second, keep your charge between 20 and 80 percent for daily use if your phone supports it. Third, if you are replacing a device at the two-year mark, a battery replacement costs a fraction of a new handset and restores most of the endurance you lost."
    },
    {
      id: 3,
      title: "Setting up a new laptop in twenty minutes flat",
      category: "Tips & tricks",
      date: "29 August 2026",
      readTime: "6 min read",
      image: "images/article-setup-tips.svg",
      excerpt:
        "Skip the manufacturer bloat, move your files across properly, and set up a clean backup before you need one. A short checklist that makes transfer painless.",
      body:
        "The first thing to do is delete what you will never open. Manufacturer apps for printing, games and trials are the biggest cause of slow startups and background disk churn on a fresh machine. Then transfer with a cable rather than a cloud service if you have more than a few gigabytes, because cloud sync silently eats your bandwidth and misses hidden folders. Finally, set up automatic backups before you copy anything across, not after you lose something."
    },
    {
      id: 4,
      title: "Building a gaming setup on a sensible budget",
      category: "Gaming",
      date: "21 August 2026",
      readTime: "8 min read",
      image: "images/article-gaming-setup.svg",
      excerpt:
        "Where to spend and where to save in a first serious gaming build. Put your money into the screen and the controller, not the parts nobody notices.",
      body:
        "The display is the one component you look at for hours at a time, so it deserves the largest share of the budget. A 120Hz panel at 1080p will make a modest machine feel dramatically faster than a 60Hz panel running the same settings, and you do not need 4K to get the benefit. Second priority is input: a controller with hall-effect sticks will outlast several generations of console cycles. Everything else, including the case lighting, is where you save."
    }
  ];

  var icons = {
    phone:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 5.5h3"/><path d="M10.8 18.4h2.4"/></svg>',
    laptop:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4.5" width="16" height="11" rx="1.8"/><path d="M2 18.5h20"/><path d="M9.5 15.2h5"/></svg>',
    audio:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="2.5" y="14" width="4" height="7" rx="2"/><rect x="17.5" y="14" width="4" height="7" rx="2"/></svg>',
    watch:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6.5" y="6.5" width="11" height="11" rx="3"/><path d="M9.5 6.5 10 2.5h4l.5 4M9.5 17.5 10 21.5h4l.5-4"/><path d="M12 10v2.6l1.8 1"/></svg>',
    gaming:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 7.5h9a5 5 0 0 1 4.9 4l.5 3a3 3 0 0 1-5.4 2.4l-1-1.4H8.5l-1 1.4A3 3 0 0 1 2.1 14.5l.5-3a5 5 0 0 1 4.9-4Z"/><path d="M6.5 11.4v2.4M5.3 12.6h2.4"/><circle cx="16.2" cy="11.8" r=".9" fill="currentColor" stroke="none"/><circle cx="18" cy="13.6" r=".9" fill="currentColor" stroke="none"/></svg>',
    power:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6.5" width="18" height="11" rx="2.5"/><path d="M12 9.5v5"/><path d="M7.5 20.5h9"/></svg>',
    home:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M9.8 20v-5.5h4.4V20"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.1 6L12 16.8 6.7 19.6l1.1-6L3.4 9.4l6-.8L12 3Z"/></svg>',
    heart:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z"/></svg>',
    check:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    cart:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2.2l2.3 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="10" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/></svg>',
    user:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8.5" r="3.5"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>',
    search:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    truck:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></svg>',
    shield:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4.5 6v5.5c0 4.4 3.1 8.2 7.5 9.5 4.4-1.3 7.5-5.1 7.5-9.5V6L12 3Z"/><path d="m9 12 2 2 4-4"/></svg>',
    headset:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2.5" y="13.5" width="4" height="7" rx="2"/><rect x="17.5" y="13.5" width="4" height="7" rx="2"/><path d="M19.5 20.5c-1 1.2-3 1.5-5 1.5"/></svg>',
    wallet:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><circle cx="17" cy="14.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
    box:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5 12 4l9 4.5v7L12 20l-9-4.5v-7Z"/><path d="M3 8.5 12 13l9-4.5M12 13v7"/></svg>',
    quote:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.5 5C6.5 6.5 5 9 5 12v7h7v-7H8c0-2 .8-3.4 2.5-4.4L9.5 5Zm9 0C15.5 6.5 14 9 14 12v7h7v-7H17c0-2 .8-3.4 2.5-4.4L18.5 5Z"/></svg>',
    clock:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    close:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    arrow:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13m-5-6 6 6-6 6"/></svg>'
  };

  /* ---------- helpers ---------- */

  function money(value) {
    var n = Number(value) || 0;
    return (
      config.symbol +
      n.toLocaleString(config.locale, {
        minimumFractionDigits: config.decimals,
        maximumFractionDigits: config.decimals
      })
    );
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function starsHtml(rating) {
    var full = Math.floor(rating);
    var half = rating - full >= 0.5;
    var out = '<span class="stars" role="img" aria-label="' + rating + ' out of 5">';
    for (var i = 1; i <= 5; i += 1) {
      if (i <= full) out += icons.star;
      else if (i === full + 1 && half) {
        out +=
          '<span class="star star--half">' +
          '<span class="star__base">' + icons.star + "</span>" +
          '<span class="star__fill">' + icons.star + "</span>" +
          "</span>";
      } else out += '<span class="star star--empty">' + icons.star + "</span>";
    }
    return out + "</span>";
  }

  function discount(product) {
    if (!product.oldPrice || product.oldPrice <= product.price) return 0;
    return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
  }

  function badgeLabel(badge) {
    var map = {
      "best-seller": "Best seller",
      sale: "Sale",
      new: "New arrival",
      limited: "Limited stock"
    };
    return map[badge] || "";
  }

  function getById(id) {
    var wanted = String(id);
    return (
      products.filter(function (p) {
        return String(p.id) === wanted;
      })[0] || null
    );
  }

  function getCategory(id) {
    return (
      categories.filter(function (c) {
        return c.id === id;
      })[0] || null
    );
  }

  function categoryName(id) {
    var cat = getCategory(id);
    return cat ? cat.name : id;
  }

  function search(query) {
    var q = String(query || "").trim().toLowerCase();
    if (!q) return products.slice();
    var terms = q.split(/\s+/);
    return products.filter(function (p) {
      var haystack = [p.name, p.brand, p.short, p.description, categoryName(p.category), p.sku]
        .join(" ")
        .toLowerCase();
      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    });
  }

  function filterByCategory(list, categoryId) {
    if (!categoryId || categoryId === "all") return list.slice();
    return list.filter(function (p) {
      return p.category === categoryId;
    });
  }

  function filterByPrice(list, min, max) {
    var lo = min === "" || min == null ? NaN : Number(min);
    var hi = max === "" || max == null ? NaN : Number(max);
    return list.filter(function (p) {
      if (!isNaN(lo) && p.price < lo) return false;
      if (!isNaN(hi) && p.price > hi) return false;
      return true;
    });
  }

  function inStockOnly(list) {
    return list.filter(function (p) {
      return p.stock > 0;
    });
  }

  function sort(list, mode) {
    var out = list.slice();
    if (mode === "price-asc") {
      out.sort(function (a, b) {
        return a.price - b.price;
      });
    } else if (mode === "price-desc") {
      out.sort(function (a, b) {
        return b.price - a.price;
      });
    } else if (mode === "rating") {
      out.sort(function (a, b) {
        return b.rating - a.rating || b.reviews - a.reviews;
      });
    } else if (mode === "name") {
      out.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    } else {
      out.sort(function (a, b) {
        return b.id - a.id;
      });
    }
    return out;
  }

  function related(product, limit) {
    var pool = products.filter(function (p) {
      return p.id !== product.id;
    });
    var sameCat = pool.filter(function (p) {
      return p.category === product.category;
    });
    var rest = pool.filter(function (p) {
      return p.category !== product.category;
    });
    return sameCat.concat(rest).slice(0, limit || 4);
  }

  function featured(limit) {
    return sort(
      products.filter(function (p) {
        return p.badge === "best-seller" || p.badge === "sale";
      }),
      "rating"
    ).slice(0, limit || 4);
  }

  function newArrivals(limit) {
    return products
      .slice()
      .sort(function (a, b) {
        return b.id - a.id;
      })
      .slice(0, limit || 4);
  }

  function priceBounds() {
    var prices = products.map(function (p) {
      return p.price;
    });
    return { min: Math.min.apply(null, prices), max: Math.max.apply(null, prices) };
  }

  var brands = products
    .map(function (p) {
      return p.brand;
    })
    .filter(function (brand, index, all) {
      return all.indexOf(brand) === index;
    })
    .sort();

  /* ---------- shared card markup ---------- */

  function productCard(product, options) {
    var opts = options || {};
    var off = discount(product);
    var label = badgeLabel(product.badge);

    var flagHtml = "";
    if (opts.showBadge !== false && label) {
      flagHtml =
        '<span class="card__flag card__flag--' + escapeHtml(product.badge) + '">' + escapeHtml(label) + "</span>";
    }
    if (off > 0) {
      flagHtml += '<span class="card__flag card__flag--off">-' + off + "%</span>";
    }

    return (
      '<article class="card reveal" data-product-id="' + product.id + '">' +
      '<a class="card__media" href="product.html?id=' + product.id + '" aria-label="View ' + escapeHtml(product.name) + '">' +
      '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '" loading="lazy" width="400" height="300" />' +
      '<span class="card__flags">' + flagHtml + "</span>" +
      "</a>" +
      '<button class="card__wish" type="button" data-wish="' + product.id + '" aria-label="Save ' + escapeHtml(product.name) + ' to wishlist" aria-pressed="false">' +
      icons.heart +
      "</button>" +
      '<div class="card__body">' +
      '<span class="card__cat">' + escapeHtml(categoryName(product.category)) + "</span>" +
      '<h3 class="card__name"><a href="product.html?id=' + product.id + '">' + escapeHtml(product.name) + "</a></h3>" +
      '<div class="card__rating">' + starsHtml(product.rating) + "<span>" + product.rating.toFixed(1) + " (" + product.reviews.toLocaleString(config.locale) + ")</span></div>" +
      '<div class="card__price">' +
      '<strong>' + money(product.price) + "</strong>" +
      (product.oldPrice ? '<s>' + money(product.oldPrice) + "</s>" : "") +
      (product.stock < 15 ? '<span class="card__low">Only ' + product.stock + " left</span>" : "") +
      "</div>" +
      '<div class="card__actions">' +
      '<button class="btn btn--primary btn--sm" type="button" data-add="' + product.id + '">Add to cart</button>' +
      '<a class="btn btn--ghost btn--sm" href="product.html?id=' + product.id + '">Details</a>' +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function productGrid(list, options) {
    return list.map(function (p) {
      return productCard(p, options);
    }).join("");
  }

  return {
    config: config,
    categories: categories,
    brands: brands,
    products: products,
    testimonials: testimonials,
    articles: articles,
    icons: icons,
    money: money,
    escapeHtml: escapeHtml,
    starsHtml: starsHtml,
    discount: discount,
    badgeLabel: badgeLabel,
    getById: getById,
    getCategory: getCategory,
    categoryName: categoryName,
    search: search,
    filterByCategory: filterByCategory,
    filterByPrice: filterByPrice,
    inStockOnly: inStockOnly,
    sort: sort,
    related: related,
    featured: featured,
    newArrivals: newArrivals,
    priceBounds: priceBounds,
    productCard: productCard,
    productGrid: productGrid
  };
})();
