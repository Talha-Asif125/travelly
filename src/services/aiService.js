import axios from '../api/axios';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const systemPrompt = `You are a helpful travel advisor for Pakistan. Your role is to:
1. Provide accurate and helpful information about travel in Pakistan
2. Answer questions about hotels, tours, transportation, and local attractions
3. Give practical advice about weather, best times to visit, and cultural considerations
4. Help with booking processes and travel planning
5. Be friendly and professional in your responses
6. Always prioritize safety and local customs in your advice

Important guidelines:
- Focus on Pakistan-specific information
- Be concise but informative
- Include practical tips when relevant
- Mention our services when appropriate
- Always maintain a helpful and positive tone`;

// Dynamic AI responses with multiple variations
const travelResponses = {
  hunza: [
    "🏔️ Hunza Valley is absolutely magical! Known as the 'Shangri-La' of Pakistan, it offers stunning views of Rakaposhi and Ultar peaks. The best time to visit is April-October when apricot blossoms paint the valley pink! Don't miss Baltit & Altit forts - they're over 1000 years old! 🏰",
    "🌸 Welcome to Hunza - the crown jewel of northern Pakistan! Famous for its longevity legends, fresh apricots, and turquoise waters of Attabad Lake. Spring (April-May) brings cherry blossoms, while autumn offers golden landscapes. Perfect for photography and peace! 📸",
    "⛰️ Hunza Valley will steal your heart! Home to some of the world's friendliest people and breathtaking mountain scenery. Visit Eagle's Nest for sunrise views, explore ancient Silk Route history, and taste the sweetest apricots on Earth! 🧡",
    "🗻 Dreaming of Hunza? You're in for a treat! This paradise valley offers 300+ sunny days yearly, crystal-clear mountain air, and views that'll make you forget all your worries. Trek to Passu Cones or relax by Hunza River - pure bliss! ✨"
  ],
  skardu: [
    "🌄 Skardu is your gateway to the mighty K2! This high-altitude desert offers surreal beauty - from emerald Satpara Lake to the golden Deosai Plains (world's 2nd highest plateau). Adventure seekers' paradise! 🏔️",
    "🏕️ Skardu beckons with its rugged beauty! Visit Shangrila Resort (Heaven on Earth), trek to Concordia base camp, and witness the dance of clouds around 8000m peaks. July-September offers the best weather for exploration! ⛺",
    "🌙 Mystical Skardu awaits! Famous for its Buddhist heritage at Manthal Rock, the massive Kharpocho Fort, and Lower Kachura Lake's mirror-like reflections. Stargazing here is absolutely phenomenal! 🌟",
    "🏔️ Skardu - where legends are born! Trek the same paths as mountaineering heroes, camp under Milky Way galaxies, and experience the raw power of nature. Deosai blooms with wildflowers in summer! 🌺"
  ],
  lahore: [
    "🕌 Lahore - the beating heart of Pakistan! Lose yourself in the narrow streets of old city, marvel at Mughal architecture in Badshahi Mosque, and feast on legendary food culture. Every corner tells a story! 📚",
    "🎭 Cultural capital Lahore welcomes you! From the grandeur of Lahore Fort to the serenity of Shalimar Gardens, experience centuries of history. Don't miss the vibrant bazaars and mouth-watering street food! 🥘",
    "🌹 Lahore - city of gardens and kings! Walk through Data Darbar's spiritual ambiance, explore the artistic treasures in Lahore Museum, and experience the colorful festivals. The city never sleeps! 🎪",
    "🏛️ Historic Lahore calls! Marvel at the intricate tile work of Wazir Khan Mosque, stroll through Kim's Gun (Zamzama), and enjoy traditional Lahori hospitality. Perfect blend of old and new! 🎨"
  ],
  karachi: [
    "🌊 Karachi - Pakistan's economic powerhouse by the Arabian Sea! Enjoy fresh seafood at Clifton Beach, explore the National Museum, and experience the city's vibrant nightlife. The city that never stops! 🌃",
    "🏙️ Welcome to Karachi - where business meets the beach! Visit Frere Hall's colonial architecture, shop at Zainab Market, and catch stunning sunsets at Manora Island. Diversity at its finest! 🌅",
    "🕌 Karachi's energy is infectious! Pay respects at Quaid-e-Azam's Mausoleum, explore the artistic walls of Saddar, and taste the city's famous BBQ. Every neighborhood has its own character! 🍖",
    "🐋 Coastal Karachi awaits! Take a boat ride to see dolphins, visit the bustling fish harbor, and experience the melting pot of cultures. From street art to shopping malls - it's all here! 🎨"
  ],
  islamabad: [
    "🏛️ Islamabad - the planned paradise! Marvel at the architectural beauty of Faisal Mosque, enjoy panoramic views from Daman-e-Koh, and explore the modern Pakistan Monument. Green, clean, and serene! 🌳",
    "🌲 Capital beauty Islamabad! Hike the Margalla Hills trails, picnic at Rose & Jasmine Garden, and visit the vibrant Centaurus Mall. Perfect blend of nature and urban planning! 🥾",
    "🕌 Peaceful Islamabad beckons! Experience the spiritual tranquility of Faisal Mosque at sunset, shop at F-6/F-7 markets, and enjoy the cool mountain breeze. A breath of fresh air! 🌬️",
    "🦅 Islamabad - where eagles soar! Spot wildlife in Margalla Hills National Park, visit Lok Virsa Museum for cultural heritage, and enjoy the city's excellent restaurants. Modern Pakistan at its best! 🍽️"
  ],
  naran: [
    "🌲 Naran Kaghan - nature's masterpiece! Crystal-clear Saiful Muluk Lake reflects fairy tale mountains, while pine forests whisper ancient secrets. Perfect for soul-searching! 🧚‍♀️",
    "🎣 Naran's pristine beauty calls! Try trout fishing in rushing streams, camp under star-studded skies, and breathe the purest mountain air. Summer brings colorful wildflower meadows! 🌼",
    "❄️ Snowy paradise Naran! Even in summer, you might see snow-capped peaks and glaciers. The journey through Kaghan Valley is as beautiful as the destination itself! 🚗",
    "🏔️ Naran - where legends come alive! Visit the mythical Saiful Muluk (Lake of the Prince), spot Himalayan wildlife, and experience local Gujjar culture. Magic at 10,500 feet! ✨"
  ],
  swat: [
    "🌸 Swat - the Switzerland of Pakistan! Emerald valleys, gushing waterfalls, and fruit orchards create a paradise on Earth. Rich Buddhist heritage adds mystical charm! 🏯",
    "🌊 Beautiful Swat Valley! White-water rafting in Swat River, skiing in Malam Jabba, and exploring ancient Buddhist stupas. Adventure and culture combined! ⛷️",
    "🦋 Swat's natural symphony! Cherry blossoms in spring, lush greenery in summer, and golden autumn leaves. Each season paints a different masterpiece! 🎨",
    "🏔️ Mystical Swat awaits! From the spiritual aura of Buner to the adventure trails of Kalam, experience diverse landscapes and warm Pakhtun hospitality! 🤝"
  ]
};

// Helper functions for dynamic responses
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
};

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

const seasonalAdvice = {
  spring: ["🌸 Spring is perfect for northern areas with blooming flowers!", "🌱 Great time for trekking with mild weather!"],
  summer: ["☀️ Summer is ideal for high-altitude destinations!", "🏔️ Perfect weather for mountain adventures!"],
  autumn: ["🍂 Autumn offers stunning golden landscapes!", "📸 Best time for photography with clear skies!"],
  winter: ["❄️ Winter is great for southern Pakistan!", "☀️ Enjoy warm sunshine in coastal areas!"]
};

const randomTips = [
  "💡 Pro tip: Book accommodation in advance during peak season!",
  "📱 Download offline maps before heading to remote areas!",
  "🎒 Pack layers - mountain weather can change quickly!",
  "💰 Bargaining is common in local markets - it's part of the culture!",
  "📋 Keep photocopies of important documents while traveling!",
  "🚰 Carry water bottles and stay hydrated at high altitudes!",
  "🤝 Learn basic Urdu phrases - locals appreciate the effort!",
  "📸 Golden hour photography is spectacular in northern areas!"
];

const getLocationResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  for (const [location, responses] of Object.entries(travelResponses)) {
    if (lowerMessage.includes(location)) {
      let response = getRandomElement(responses);
      
      // Add contextual information
      const season = getCurrentSeason();
      const timeOfDay = getTimeOfDay();
      
      // Add seasonal advice (30% chance)
      if (Math.random() < 0.3) {
        response += ` ${getRandomElement(seasonalAdvice[season])}`;
      }
      
      // Add random travel tip (20% chance)
      if (Math.random() < 0.2) {
        response += ` ${getRandomElement(randomTips)}`;
      }
      
      // Add time-based greeting (40% chance)
      if (Math.random() < 0.4) {
        const greetings = {
          morning: "🌅 Good morning! ",
          afternoon: "☀️ Good afternoon! ",
          evening: "🌆 Good evening! ",
          night: "🌙 Planning a future trip? "
        };
        response = greetings[timeOfDay] + response;
      }
      
      return response;
    }
  }
  return null;
};

// Topic-based responses with variations
const topicResponses = {
  hotel: [
    "🏨 We offer fantastic hotel booking services! From cozy guesthouses in Hunza to luxury resorts in Karachi. Our platform has 500+ verified accommodations across Pakistan!",
    "🛏️ Looking for the perfect stay? We've got you covered! Budget-friendly hostels, boutique hotels, or 5-star luxury - all with genuine reviews and best price guarantees!",
    "🏠 Accommodation sorted! Our hotel partners range from heritage havelis in Lahore to mountain lodges in Skardu. Free cancellation available on most bookings!",
    "🌟 Hotel hunting made easy! We work with local and international chains to offer the best rates. Plus, our customer service team is available 24/7 for support!"
  ],
  tour: [
    "🎒 Our tour packages are crafted by local experts! Experience the real Pakistan with guided treks, cultural immersions, and hidden gems most tourists never see!",
    "🗺️ Adventure awaits with our curated tours! From 3-day northern circuits to 2-week cultural odysseys. All packages include transport, accommodation, and local guides!",
    "🏔️ Join our signature tours! K2 base camp expeditions, Silk Route heritage trails, and food discovery tours. Small groups, authentic experiences, lifetime memories!",
    "⭐ Pakistan like never before! Our tour packages combine must-see destinations with off-the-beaten-path experiences. Custom itineraries available too!"
  ],
  transport: [
    "🚗 Reliable transport solutions! Rent anything from economy cars to luxury SUVs. All vehicles come with GPS, emergency support, and optional driver services!",
    "🚌 Travel in comfort with our vehicle rentals! Perfect for mountain roads and city exploration. Well-maintained fleet with comprehensive insurance coverage!",
    "🛣️ Hit the road with confidence! Our transport partners offer everything from motorcycles for solo adventures to buses for group tours. Book hourly or daily!",
    "🚙 Adventure-ready vehicles! 4WD options for rough terrains, comfortable sedans for city tours, and spacious vans for families. All with 24/7 roadside assistance!"
  ],
  food: [
    "🍽️ Pakistani cuisine will blow your mind! Each province has distinct flavors - from spicy Sindhi curry to mild Balochi sajji. Our restaurant partners serve authentic local dishes!",
    "🌶️ Foodie paradise awaits! Try Lahori karahi, Peshawar chapli kebab, and Karachi biryani. We can book tables at the best local eateries and food tours!",
    "🥘 Culinary journey through Pakistan! From street food adventures in old cities to fine dining experiences. Vegetarian, halal, and special dietary options available!",
    "🍖 Taste the real Pakistan! Our food experiences include cooking classes with local families, spice market tours, and dinner invitations with traditional families!"
  ],
  weather: [
    "🌤️ Pakistan's climate is wonderfully diverse! Northern mountains are cool year-round, while plains have distinct seasons. Planning timing is key for the perfect trip!",
    "🌡️ Weather-wise travel planning! Monsoons (July-Aug) bring greenery, winter (Dec-Feb) offers snow in mountains, spring (Mar-May) has blooming valleys!",
    "☀️ Climate varies dramatically by region! Coastal areas stay warm, northern areas get snow, and deserts have extreme temperatures. Let me help you plan accordingly!",
    "🌈 Four seasons, countless experiences! Each weather pattern offers unique beauty - monsoon waterfalls, winter festivals, spring blossoms, summer adventures!"
  ],
  budget: [
          "💰 Pakistan offers incredible value! Budget travelers can explore for Rs. 5,600-8,400/day, while luxury seekers can indulge for Rs. 28,000-56,000/day. Great bang for your buck!",
      "💵 Affordable adventures await! Local transport is cheap, street food costs under Rs. 560, and accommodation ranges from Rs. 1,400 hostels to Rs. 42,000 luxury suites!",
    "🏦 Smart spending in Pakistan! Bargaining is common, group tours reduce costs, and local experiences are often free. ATMs are widely available in cities!",
    "💸 Budget-friendly destinations! Pakistan offers premium experiences at fraction of Western costs. Your money goes far while supporting local communities!"
  ],
  visa: [
    "📋 Visa process simplified! Most countries get e-visa or visa-on-arrival. Processing takes 3-7 days online. Tourist visas typically valid for 30-90 days!",
    "🛂 Entry requirements vary by nationality! Some countries get free visas, others need advance applications. Check latest requirements - policies keep improving!",
    "📄 Documentation made easy! Usually need passport (6+ months validity), photos, and itinerary. Some regions require NOCs - we can help arrange everything!",
    "✈️ Welcome to Pakistan! Visa policies are becoming more tourist-friendly. Multiple entry options available for frequent visitors. Let us guide you through the process!"
  ]
};

const getGeneralResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  const season = getCurrentSeason();
  const timeOfDay = getTimeOfDay();
  
  let response = "";
  let responseFound = false;
  
  // Check for topic matches
  for (const [topic, responses] of Object.entries(topicResponses)) {
    if (lowerMessage.includes(topic) || 
        (topic === 'hotel' && (lowerMessage.includes('accommodation') || lowerMessage.includes('stay'))) ||
        (topic === 'tour' && lowerMessage.includes('package')) ||
        (topic === 'transport' && (lowerMessage.includes('vehicle') || lowerMessage.includes('car'))) ||
        (topic === 'food' && lowerMessage.includes('restaurant')) ||
        (topic === 'weather' && lowerMessage.includes('climate')) ||
        (topic === 'budget' && (lowerMessage.includes('cost') || lowerMessage.includes('price'))) ||
        (topic === 'visa' && lowerMessage.includes('document'))) {
      
      response = getRandomElement(responses);
      responseFound = true;
      break;
    }
  }
  
  // Default responses with variations
  if (!responseFound) {
    const defaultResponses = [
      "🇵🇰 I'm your AI travel companion for Pakistan! Ask me about destinations, hotels, tours, transport, food, or anything travel-related. How can I help make your trip amazing?",
      "✈️ Welcome to your Pakistan travel assistant! I know all about the beautiful destinations, local culture, best places to stay, and hidden gems. What would you like to explore?",
      "🗺️ Pakistan travel expert at your service! From mountain adventures to cultural heritage, food tours to budget planning - I'm here to make your journey unforgettable!",
      "🎯 Ready to discover Pakistan? I can help with destination advice, booking tips, local customs, weather info, and creating the perfect itinerary. What interests you most?"
    ];
    response = getRandomElement(defaultResponses);
  }
  
  // Add contextual elements
  if (Math.random() < 0.25) {
    response += ` ${getRandomElement(seasonalAdvice[season])}`;
  }
  
  if (Math.random() < 0.15) {
    response += ` ${getRandomElement(randomTips)}`;
  }
  
  return response;
};

export const getAIResponse = async (userMessage) => {
  try {
    // Simulate API delay for realistic experience
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Check for location-specific queries first
    const locationResponse = getLocationResponse(userMessage);
    if (locationResponse) {
      return locationResponse;
    }
    
    // Fallback to general responses
    return getGeneralResponse(userMessage);
    
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
}; 