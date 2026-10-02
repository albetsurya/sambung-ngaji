export interface CityLocation {
  id: string;
  name: string;
  province: string;
  lat: number;
  lng: number;
}

export const INDONESIAN_CITIES: CityLocation[] = [
  { id: "jakarta", name: "Jakarta Pusat", province: "DKI Jakarta", lat: -6.1754, lng: 106.8272 },
  { id: "surabaya", name: "Surabaya", province: "Jawa Timur", lat: -7.2575, lng: 112.7521 },
  { id: "bandung", name: "Bandung", province: "Jawa Barat", lat: -6.9175, lng: 107.6191 },
  { id: "medan", name: "Medan", province: "Sumatera Utara", lat: 3.5952, lng: 98.6722 },
  { id: "semarang", name: "Semarang", province: "Jawa Tengah", lat: -6.9667, lng: 110.4167 },
  { id: "makassar", name: "Makassar", province: "Sulawesi Selatan", lat: -5.1477, lng: 119.4327 },
  { id: "palembang", name: "Palembang", province: "Sumatera Selatan", lat: -2.9761, lng: 104.7754 },
  { id: "tangerang", name: "Tangerang", province: "Banten", lat: -6.1783, lng: 106.6319 },
  { id: "depok", name: "Depok", province: "Jawa Barat", lat: -6.4025, lng: 106.7942 },
  { id: "bekasi", name: "Bekasi", province: "Jawa Barat", lat: -6.2383, lng: 106.9756 },
  { id: "bogor", name: "Bogor", province: "Jawa Barat", lat: -6.5944, lng: 106.7892 },
  { id: "malang", name: "Malang", province: "Jawa Timur", lat: -7.9797, lng: 112.6304 },
  { id: "yogyakarta", name: "Yogyakarta", province: "DI Yogyakarta", lat: -7.7956, lng: 110.3695 },
  { id: "solo", name: "Surakarta (Solo)", province: "Jawa Tengah", lat: -7.5695, lng: 110.8243 },
  { id: "bandar_lampung", name: "Bandar Lampung", province: "Lampung", lat: -5.3971, lng: 105.2668 },
  { id: "pekanbaru", name: "Pekanbaru", province: "Riau", lat: 0.5071, lng: 101.4478 },
  { id: "batam", name: "Batam", province: "Kepulauan Riau", lat: 1.1472, lng: 104.0263 },
  { id: "padang", name: "Padang", province: "Sumatera Barat", lat: -0.9471, lng: 100.4172 },
  { id: "denpasar", name: "Denpasar", province: "Bali", lat: -8.6705, lng: 115.2126 },
  { id: "mataram", name: "Mataram", province: "Nusa Tenggara Barat", lat: -8.5833, lng: 116.1167 },
  { id: "kupang", name: "Kupang", province: "Nusa Tenggara Timur", lat: -10.1772, lng: 123.5822 },
  { id: "pontianak", name: "Pontianak", province: "Kalimantan Barat", lat: -0.0263, lng: 109.3425 },
  { id: "banjarmasin", name: "Banjarmasin", province: "Kalimantan Selatan", lat: -3.3167, lng: 114.5900 },
  { id: "samarinda", name: "Samarinda", province: "Kalimantan Timur", lat: -0.5022, lng: 117.1536 },
  { id: "balikpapan", name: "Balikpapan", province: "Kalimantan Timur", lat: -1.2378, lng: 116.8529 },
  { id: "manado", name: "Manado", province: "Sulawesi Utara", lat: 1.4748, lng: 124.8421 },
  { id: "palangkaraya", name: "Palangkaraya", province: "Kalimantan Tengah", lat: -2.2186, lng: 113.9122 },
  { id: "jambi", name: "Jambi", province: "Jambi", lat: -1.6108, lng: 103.6131 },
  { id: "bengkulu", name: "Bengkulu", province: "Bengkulu", lat: -3.7928, lng: 102.2605 },
  { id: "serang", name: "Serang", province: "Banten", lat: -6.1149, lng: 106.1502 },
  { id: "cilegon", name: "Cilegon", province: "Banten", lat: -5.9931, lng: 106.0036 },
  { id: "cimahi", name: "Cimahi", province: "Jawa Barat", lat: -6.8822, lng: 107.5414 },
  { id: "tasikmalaya", name: "Tasikmalaya", province: "Jawa Barat", lat: -7.3270, lng: 108.2210 },
  { id: "cirebon", name: "Cirebon", province: "Jawa Barat", lat: -6.7258, lng: 108.5600 },
  { id: "sukabumi", name: "Sukabumi", province: "Jawa Barat", lat: -6.9252, lng: 106.9270 },
  { id: "cianjur", name: "Cianjur", province: "Jawa Barat", lat: -6.8189, lng: 107.1421 },
  { id: "garut", name: "Garut", province: "Jawa Barat", lat: -7.2132, lng: 107.9045 },
  { id: "sumedang", name: "Sumedang", province: "Jawa Barat", lat: -6.8600, lng: 107.9208 },
  { id: "majalengka", name: "Majalengka", province: "Jawa Barat", lat: -6.8272, lng: 108.2307 },
  { id: "indramayu", name: "Indramayu", province: "Jawa Barat", lat: -6.3225, lng: 108.3328 },
  { id: "subang", name: "Subang", province: "Jawa Barat", lat: -6.5664, lng: 107.7607 },
  { id: "purwakarta", name: "Purwakarta", province: "Jawa Barat", lat: -6.5500, lng: 107.4419 },
  { id: "karawang", name: "Karawang", province: "Jawa Barat", lat: -6.3031, lng: 107.3097 },
  { id: "bekasi_timur", name: "Bekasi Timur", province: "Jawa Barat", lat: -6.2722, lng: 107.0036 },
  { id: "magelang", name: "Magelang", province: "Jawa Tengah", lat: -7.4679, lng: 110.2195 },
  { id: "purwokerto", name: "Purwokerto", province: "Jawa Tengah", lat: -7.4252, lng: 109.2472 },
  { id: "kebumen", name: "Kebumen", province: "Jawa Tengah", lat: -7.6647, lng: 109.6610 },
  { id: "tegal", name: "Tegal", province: "Jawa Tengah", lat: -6.8694, lng: 109.1400 },
  { id: "pekalongan", name: "Pekalongan", province: "Jawa Tengah", lat: -6.8886, lng: 109.6753 },
  { id: "kudus", name: "Kudus", province: "Jawa Tengah", lat: -6.8125, lng: 110.8442 },
  { id: "demak", name: "Demak", province: "Jawa Tengah", lat: -6.8894, lng: 110.6497 },
  { id: "salatiga", name: "Salatiga", province: "Jawa Tengah", lat: -7.3289, lng: 110.5064 },
  { id: "klaten", name: "Klaten", province: "Jawa Tengah", lat: -7.7158, lng: 110.6014 },
  { id: "boyolali", name: "Boyolali", province: "Jawa Tengah", lat: -7.5567, lng: 110.5992 },
  { id: "sragen", name: "Sragen", province: "Jawa Tengah", lat: -7.4125, lng: 111.0356 },
  { id: "wonogiri", name: "Wonogiri", province: "Jawa Tengah", lat: -7.8264, lng: 110.9253 },
  { id: "pati", name: "Pati", province: "Jawa Tengah", lat: -6.7519, lng: 111.0397 },
  { id: "rembang", name: "Rembang", province: "Jawa Tengah", lat: -6.7050, lng: 111.3428 },
  { id: "blora", name: "Blora", province: "Jawa Tengah", lat: -6.9583, lng: 111.4194 },
  { id: "grobogan", name: "Grobogan", province: "Jawa Tengah", lat: -7.1042, lng: 110.9972 },
  { id: "kedungjajang", name: "Lamongan", province: "Jawa Timur", lat: -6.9879, lng: 112.3729 },
  { id: "mojokerto", name: "Mojokerto", province: "Jawa Timur", lat: -7.4733, lng: 112.4372 },
  { id: "jombang", name: "Jombang", province: "Jawa Timur", lat: -7.5447, lng: 112.2367 },
  { id: "nganjuk", name: "Nganjuk", province: "Jawa Timur", lat: -7.6064, lng: 111.9019 },
  { id: "madiun", name: "Madiun", province: "Jawa Timur", lat: -7.6298, lng: 111.5239 },
  { id: "ponorogo", name: "Ponorogo", province: "Jawa Timur", lat: -7.8700, lng: 111.4567 },
  { id: "pacitan", name: "Pacitan", province: "Jawa Timur", lat: -8.1797, lng: 111.0903 },
  { id: "tuban", name: "Tuban", province: "Jawa Timur", lat: -6.8975, lng: 112.0625 },
  { id: "bojonegoro", name: "Bojonegoro", province: "Jawa Timur", lat: -7.1511, lng: 111.8819 },
  { id: "ngawi", name: "Ngawi", province: "Jawa Timur", lat: -7.4042, lng: 111.4419 },
  { id: "magetan", name: "Magetan", province: "Jawa Timur", lat: -7.6492, lng: 111.3481 },
  { id: "kedungkandang", name: "Malang Utara", province: "Jawa Timur", lat: -7.9667, lng: 112.6333 },
  { id: "pasuruan", name: "Pasuruan", province: "Jawa Timur", lat: -7.6456, lng: 112.9075 },
  { id: "probolinggo", name: "Probolinggo", province: "Jawa Timur", lat: -7.7500, lng: 113.2167 },
  { id: "situbondo", name: "Situbondo", province: "Jawa Timur", lat: -7.7067, lng: 114.0094 },
  { id: "bondowoso", name: "Bondowoso", province: "Jawa Timur", lat: -7.9133, lng: 113.8214 },
  { id: "jember", name: "Jember", province: "Jawa Timur", lat: -8.1725, lng: 113.7014 },
  { id: "banyuwangi", name: "Banyuwangi", province: "Jawa Timur", lat: -8.2194, lng: 114.3756 },
  { id: "lumajang", name: "Lumajang", province: "Jawa Timur", lat: -8.1325, lng: 113.2294 },
  { id: "ambarawa", name: "Ambarawa", province: "Jawa Tengah", lat: -7.2667, lng: 110.4000 },
];

export function searchCities(query: string): CityLocation[] {
  const q = query.toLowerCase().trim();
  if (!q) return INDONESIAN_CITIES.slice(0, 10);
  return INDONESIAN_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.province.toLowerCase().includes(q) ||
      c.id.includes(q),
  ).slice(0, 20);
}

export function getCityById(id: string): CityLocation | undefined {
  return INDONESIAN_CITIES.find((c) => c.id === id);
}

export function formatCityLabel(city: CityLocation): string {
  return `${city.name}, ${city.province}`;
}