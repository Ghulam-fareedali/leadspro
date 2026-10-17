import React from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  HeartPulse, 
  Utensils, 
  Building2, 
  ShoppingBag, 
  Laptop, 
  Dumbbell, 
  Briefcase 
} from 'lucide-react';

export const BUSINESS_CATEGORIES = [
  {
    id: 'Schools & Education',
    label: 'Schools & Education',
    shortLabel: 'Schools',
    icon: GraduationCap,
    timings: '8:00 AM – 2:00 PM',
    timingHint: 'Call Morning (8 AM - 2 PM)',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    activeClass: 'bg-amber-600 text-white border-amber-600',
    dotClass: 'bg-amber-500',
    description: 'Schools, Academies, Colleges, Institutes'
  },
  {
    id: 'Beauty & Salons',
    label: 'Beauty & Salons',
    shortLabel: 'Salons',
    icon: Sparkles,
    timings: '1:00 PM – 9:00 PM',
    timingHint: 'Call Afternoon/Evening (1 PM - 9 PM)',
    badgeClass: 'bg-pink-50 text-pink-800 border-pink-200',
    activeClass: 'bg-pink-600 text-white border-pink-600',
    dotClass: 'bg-pink-500',
    description: 'Beauty Parlors, Spas, Salons, Makeup Studios'
  },
  {
    id: 'Clinics & Healthcare',
    label: 'Clinics & Healthcare',
    shortLabel: 'Clinics',
    icon: HeartPulse,
    timings: '10:00 AM – 3:00 PM',
    timingHint: 'Call Morning OPD (10 AM - 3 PM)',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    activeClass: 'bg-emerald-600 text-white border-emerald-600',
    dotClass: 'bg-emerald-500',
    description: 'Hospitals, Clinics, Dental, Labs, Doctors'
  },
  {
    id: 'Restaurants & Food',
    label: 'Restaurants & Food',
    shortLabel: 'Restaurants',
    icon: Utensils,
    timings: '3:00 PM – 7:00 PM',
    timingHint: 'Call Pre-Dinner (3 PM - 7 PM)',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
    activeClass: 'bg-orange-600 text-white border-orange-600',
    dotClass: 'bg-orange-500',
    description: 'Restaurants, Cafes, Bakeries, Fast Food, Sweets'
  },
  {
    id: 'Real Estate & Property',
    label: 'Real Estate & Property',
    shortLabel: 'Real Estate',
    icon: Building2,
    timings: '11:00 AM – 6:00 PM',
    timingHint: 'Call Mid-Day (11 AM - 6 PM)',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    activeClass: 'bg-indigo-600 text-white border-indigo-600',
    dotClass: 'bg-indigo-500',
    description: 'Builders, Real Estate Consultants, Housing, Plots'
  },
  {
    id: 'Retail & Shopping',
    label: 'Retail & Shopping',
    shortLabel: 'Retail',
    icon: ShoppingBag,
    timings: '12:00 PM – 8:00 PM',
    timingHint: 'Call Afternoon (12 PM - 8 PM)',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    activeClass: 'bg-purple-600 text-white border-purple-600',
    dotClass: 'bg-purple-500',
    description: 'Boutiques, Stores, Supermarts, Garments, Footwear'
  },
  {
    id: 'IT & Digital Services',
    label: 'IT & Digital Services',
    shortLabel: 'IT & Tech',
    icon: Laptop,
    timings: '10:00 AM – 5:00 PM',
    timingHint: 'Call Office Hours (10 AM - 5 PM)',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    activeClass: 'bg-blue-600 text-white border-blue-600',
    dotClass: 'bg-blue-500',
    description: 'Software Houses, Digital Agencies, Tech Solutions'
  },
  {
    id: 'Gyms & Fitness',
    label: 'Gyms & Fitness',
    shortLabel: 'Fitness',
    icon: Dumbbell,
    timings: '11:00 AM – 5:00 PM',
    timingHint: 'Call Mid-Day (11 AM - 5 PM)',
    badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    activeClass: 'bg-cyan-600 text-white border-cyan-600',
    dotClass: 'bg-cyan-500',
    description: 'Gymnasiums, Fitness Centers, Yoga Studios'
  },
  {
    id: 'General Business',
    label: 'General Business',
    shortLabel: 'General',
    icon: Briefcase,
    timings: '9:00 AM – 6:00 PM',
    timingHint: 'Standard Hours (9 AM - 6 PM)',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    activeClass: 'bg-slate-700 text-white border-slate-700',
    dotClass: 'bg-slate-500',
    description: 'Corporate, Trading, General Services'
  }
];

/**
 * Intelligent categorization based on company / customer name keywords
 */
export function detectCategory(businessName = '') {
  const str = String(businessName || '').toLowerCase().trim();
  if (!str) return 'General Business';

  // Schools & Education
  if (/school|academy|college|university|campus|institute|grammar|education|tuition|montessori|kindergarten/i.test(str)) {
    return 'Schools & Education';
  }

  // Beauty & Salons
  if (/salon|spa|beauty|parlor|parlour|hair|makeup|skin|barber|cosmetics|massage|laser|facial/i.test(str)) {
    return 'Beauty & Salons';
  }

  // Clinics & Healthcare
  if (/clinic|hospital|doctor|dentist|dental|health|pharma|medical|care|diagnostic|lab|physio|surgeon/i.test(str) || /\bdr\b/i.test(str)) {
    return 'Clinics & Healthcare';
  }

  // Restaurants & Food
  if (/restaurant|cafe|coffee|pizza|burger|food|bakers|bakery|sweets|grill|bbq|dine|kitchen|shawarma|fast food|catering/i.test(str)) {
    return 'Restaurants & Food';
  }

  // Real Estate & Property
  if (/estate|builder|properties|property|realtor|housing|construction|developer|plots|realty/i.test(str)) {
    return 'Real Estate & Property';
  }

  // Retail & Shopping
  if (/store|shop|mart|boutique|cloth|garments|collection|fashion|jewel|optics|shoes|footwear|mall|tailor|supermarket/i.test(str)) {
    return 'Retail & Shopping';
  }

  // IT & Digital Services
  if (/tech|software|digital|solution|agency|marketing|web|telecom|media|network|systems/i.test(str)) {
    return 'IT & Digital Services';
  }

  // Gyms & Fitness
  if (/gym|fitness|workout|sports|trainer|crossfit|bodybuilding/i.test(str)) {
    return 'Gyms & Fitness';
  }

  return 'General Business';
}

export function getCategoryConfig(categoryName) {
  const found = BUSINESS_CATEGORIES.find(c => c.id === categoryName || c.label === categoryName);
  return found || BUSINESS_CATEGORIES[BUSINESS_CATEGORIES.length - 1]; // Default to General Business
}

/**
 * Visual Category Badge Component
 */
export const CategoryBadge = ({ category, showTimings = false, size = 'sm' }) => {
  const config = getCategoryConfig(category);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border font-semibold select-none ${config.badgeClass} ${
        size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      }`}
      title={`Business Category: ${config.label} (${config.timings})`}
    >
      <Icon className={size === 'xs' ? 'w-2.5 h-2.5 shrink-0' : 'w-3 h-3 shrink-0'} />
      <span>{config.shortLabel || config.label}</span>
      {showTimings && (
        <span className="text-[10px] opacity-75 font-normal ml-0.5 hidden sm:inline">
          • {config.timings}
        </span>
      )}
    </span>
  );
};
