const fs = require('fs');
const files = ['src/app/page.tsx', 'src/components/layout/Footer.tsx'];

const replacements = [
  ['Explore Your Options<br />Find Your Perfect Match', 'Explore Spaces For<br />Any Occasion'],
  ['Downtown Residences', 'Creative Studio Space'],
  ['2 Beds</span>', 'Up to 50 guests</span>'],
  ['2 Baths</span>', '1200 sq ft</span>'],
  ['$250,500', '$85/hr'],
  ['Family-Friendly Villas', 'Modern Minimalist Loft'],
  ['4 Beds</span>', 'Up to 30 guests</span>'],
  ['3 Baths</span>', '850 sq ft</span>'],
  ['$540,000', '$120/hr'],
  ['Oceanfront Condominiums', 'Secluded Garden Villa'],
  ['3 Beds</span>', 'Up to 100 guests</span>'],
  ['$600,000', '$250/hr'],
  ['Suburban Realty', 'Industrial Event Hall'],
  ['$200,000', '$150/hr'],
  ['Insights & Innovations<br />Uncover the Latest', 'Host Stories & Tips<br />Learn from the Best'],
  ['The Art of Kitchen Arrangement', 'Tips for Hosting a Successful Workshop'],
  ['Your Couch: Own Now Make Deflect?', 'Creating the Perfect Atmosphere for Gatherings'],
  ['First-Time Guide: Everything You Need to Grow', 'First-Time Host Guide: Earn With Your Space'],
  ['Guide to Real Estate First-Time Buyer Home', 'How to Price Your Unique Venue'],
  ['Does Dream House Estate provide after-sales services?', 'Does Isshō provide event planning services?'],
  ['Does Dream House Estate offer financing options?', 'Can I book a space for multiple days?'],
  ['How long will it take to sell my house?', 'When do I get charged for a booking?'],
  ['How can I schedule a tour of a property?', 'Can I tour a space before booking?'],
  ['Hear from Your Neighbors,<br />Why They Chose Us', 'Hear from Our Community,<br />Why They Chose Isshō'],
  ['"Real estate gets cool. Dream House drives in an amazing offer, exceeding expectations. We grateful for their expertise."', '"Booking a venue has never been easier. Isshō provided an amazing platform, exceeding expectations. We are grateful for their expertise."'],
  ['Buying a house gets cool. Dream House drives in an amazing offer...', 'Finding event space gets cool. Isshō drives in an amazing offer...'],
  ['Find Your Dream Home Faster', 'Find Your Perfect Space Faster'],
  ['contact@homefinder.io', 'hello@issho.com'],
  ['homefinder.io', 'issho.com'],
  ['>DreamHouse<', '>Isshō<']
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let txt = fs.readFileSync(file, 'utf8');
    for (let [find, replace] of replacements) {
        txt = txt.replaceAll(find, replace);
    }
    fs.writeFileSync(file, txt);
}
console.log('Replacements complete');
