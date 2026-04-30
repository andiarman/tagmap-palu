import type { TagMapping } from '../types';

export const osmTagDictionary: TagMapping[] = [
  // Toko & Retail
  { label: 'Toko Bangunan', labelEn: 'Hardware Store', key: 'shop', value: 'hardware', icon: '🔨' },
  { label: 'Supermarket', labelEn: 'Supermarket', key: 'shop', value: 'supermarket', icon: '🛒' },
  { label: 'Minimarket', labelEn: 'Convenience Store', key: 'shop', value: 'convenience', icon: '🏪' },
  { label: 'Toko Elektronik', labelEn: 'Electronics Store', key: 'shop', value: 'electronics', icon: '📱' },
  { label: 'Toko Pakaian', labelEn: 'Clothes Store', key: 'shop', value: 'clothes', icon: '👕' },
  { label: 'Toko Furniture', labelEn: 'Furniture Store', key: 'shop', value: 'furniture', icon: '🪑' },
  { label: 'Toko Sepeda', labelEn: 'Bicycle Shop', key: 'shop', value: 'bicycle', icon: '🚲' },
  { label: 'Toko Buku', labelEn: 'Bookshop', key: 'shop', value: 'books', icon: '📚' },
  { label: 'Toko Roti', labelEn: 'Bakery', key: 'shop', value: 'bakery', icon: '🍞' },
  { label: 'Apotek', labelEn: 'Pharmacy', key: 'amenity', value: 'pharmacy', icon: '💊' },
  { label: 'Bengkel', labelEn: 'Car Repair', key: 'shop', value: 'car_repair', icon: '🔧' },
  { label: 'Toko Handphone', labelEn: 'Mobile Phone Shop', key: 'shop', value: 'mobile_phone', icon: '📱' },

  // Makanan & Minuman
  { label: 'Restoran', labelEn: 'Restaurant', key: 'amenity', value: 'restaurant', icon: '🍽️' },
  { label: 'Kafe', labelEn: 'Cafe', key: 'amenity', value: 'cafe', icon: '☕' },
  { label: 'Warung Makan', labelEn: 'Food Stall', key: 'amenity', value: 'fast_food', icon: '🍜' },

  // Fasilitas Umum
  { label: 'Rumah Sakit', labelEn: 'Hospital', key: 'amenity', value: 'hospital', icon: '🏥' },
  { label: 'Klinik', labelEn: 'Clinic', key: 'amenity', value: 'clinic', icon: '🩺' },
  { label: 'Sekolah', labelEn: 'School', key: 'amenity', value: 'school', icon: '🏫' },
  { label: 'Universitas', labelEn: 'University', key: 'amenity', value: 'university', icon: '🎓' },
  { label: 'Perpustakaan', labelEn: 'Library', key: 'amenity', value: 'library', icon: '📖' },
  { label: 'Kantor Pos', labelEn: 'Post Office', key: 'amenity', value: 'post_office', icon: '📮' },
  { label: 'Kantor Polisi', labelEn: 'Police', key: 'amenity', value: 'police', icon: '👮' },
  { label: 'Pemadam Kebakaran', labelEn: 'Fire Station', key: 'amenity', value: 'fire_station', icon: '🚒' },
  { label: 'Bank', labelEn: 'Bank', key: 'amenity', value: 'bank', icon: '🏦' },
  { label: 'ATM', labelEn: 'ATM', key: 'amenity', value: 'atm', icon: '💳' },
  { label: 'Pom Bensin', labelEn: 'Fuel Station', key: 'amenity', value: 'fuel', icon: '⛽' },
  { label: 'SPBU', labelEn: 'Gas Station', key: 'amenity', value: 'fuel', icon: '⛽' },

  // Tempat Ibadah
  { label: 'Masjid', labelEn: 'Mosque', key: 'amenity', value: 'place_of_worship', icon: '🕌' },
  { label: 'Gereja', labelEn: 'Church', key: 'amenity', value: 'place_of_worship', icon: '⛪' },
  { label: 'Pura', labelEn: 'Hindu Temple', key: 'amenity', value: 'place_of_worship', icon: '🛕' },
  { label: 'Vihara', labelEn: 'Buddhist Temple', key: 'amenity', value: 'place_of_worship', icon: '🏛️' },

  // Transportasi
  { label: 'Halte Bus', labelEn: 'Bus Stop', key: 'highway', value: 'bus_stop', icon: '🚏' },
  { label: 'Stasiun', labelEn: 'Train Station', key: 'railway', value: 'station', icon: '🚉' },
  { label: 'Bandara', labelEn: 'Airport', key: 'aeroway', value: 'aerodrome', icon: '✈️' },
  { label: 'Pelabuhan', labelEn: 'Port', key: 'amenity', value: 'ferry_terminal', icon: '⚓' },
  { label: 'Parkir', labelEn: 'Parking', key: 'amenity', value: 'parking', icon: '🅿️' },

  // Rekreasi
  { label: 'Taman', labelEn: 'Park', key: 'leisure', value: 'park', icon: '🌳' },
  { label: 'Lapangan Olahraga', labelEn: 'Sports Field', key: 'leisure', value: 'pitch', icon: '⚽' },
  { label: 'Kolam Renang', labelEn: 'Swimming Pool', key: 'leisure', value: 'swimming_pool', icon: '🏊' },
  { label: 'Hotel', labelEn: 'Hotel', key: 'tourism', value: 'hotel', icon: '🏨' },
  { label: 'Penginapan', labelEn: 'Guest House', key: 'tourism', value: 'guest_house', icon: '🛏️' },

  // Pemerintahan
  { label: 'Kantor Pemerintah', labelEn: 'Government Office', key: 'office', value: 'government', icon: '🏛️' },
  { label: 'Kelurahan', labelEn: 'Village Office', key: 'office', value: 'government', icon: '🏢' },
  { label: 'Kecamatan', labelEn: 'District Office', key: 'office', value: 'government', icon: '🏢' },

  // Pendidikan
  { label: 'TK', labelEn: 'Kindergarten', key: 'amenity', value: 'kindergarten', icon: '💒' },
  { label: 'Pesantren', labelEn: 'Islamic School', key: 'amenity', value: 'school', icon: '📿' },

  // Industri & Bisnis
  { label: 'Pabrik', labelEn: 'Factory', key: 'building', value: 'industrial', icon: '🏭' },
  { label: 'Gudang', labelEn: 'Warehouse', key: 'building', value: 'warehouse', icon: '📦' },
  { label: 'Pasar', labelEn: 'Market', key: 'amenity', value: 'marketplace', icon: '🏬' },
];

export const LAYER_COLORS = [
  '#3B82F6', // Biru
  '#EF4444', // Merah
  '#10B981', // Hijau
  '#F59E0B', // Kuning
  '#8B5CF6', // Ungu
  '#EC4899', // Pink
  '#F97316', // Oranye
  '#06B6D4', // Cyan
];
