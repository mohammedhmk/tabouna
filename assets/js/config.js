// ============================================================
//  إعدادات مطعم طابونة
//
//  BUSINESS و SNAP_PIXEL_ID و LINKS: تُطبَّق تلقائياً بكل الصفحة —
//  عدّل الجوال أو الخريطة هنا فقط وبيتحدّث كل زر اتصال/خريطة بالموقع.
//
//  MENU و REVIEWS: بيانات مرجعية للتوثيق فقط (لسرعة الصفحة وأرشفتها،
//  البطاقات مكتوبة مباشرة في index.html). لتغيير صنف أو مراجعة، عدّلها
//  في القسمين المطابقين (menu__grid و reviews__track) داخل index.html.
// ============================================================

/**
 * بيكسل سناب شات (Snap Pixel)
 * اذهب إلى: Snapchat Ads Manager → Events Manager → انسخ الـ Pixel ID
 * الشكل: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
 * اتركه فارغاً "" لتعطيل التتبّع بالكامل بدون أي خطأ في الصفحة.
 */
export const SNAP_PIXEL_ID = "0c39a4d9-134a-49a5-87f2-c7866a60a30b";

/** بيانات المطعم — تُستخدم في كل الصفحة (الاتصال، الخريطة، الفوتر، بيانات SEO) */
export const BUSINESS = {
  name: "طابونة",
  nameEn: "TABOUNA",
  tagline: "طعم يدهش حواسك",

  phoneDisplay: "0539344004",
  phoneIntl: "+966539344004", // يُستخدم في tel: و JSON-LD
  whatsapp: "966539344004", // بدون + أو أصفار، للاستخدام في wa.me
  whatsappMessage: "السلام عليكم، أبغى أطلب من طابونة 🍕",

  address: {
    line: "طريق الأمير سلمان بن محمد بن سعود، حي الصحافة",
    city: "الرياض",
    postalCode: "13221",
    country: "SA",
    full: "طريق الأمير سلمان بن محمد بن سعود، حي الصحافة، الرياض 13221",
  },

  geo: { lat: 24.804553, lng: 46.641033 },
  mapsShareUrl: "https://maps.app.goo.gl/osp3WfB9sjcUwEm1A",

  hours: {
    opens: "12:00",
    closes: "02:00",
    display: "يومياً من ١٢ الظهر لين ٢ الفجر",
  },

  // القيمة 5.0 مبنية على 3 مراجعات حقيقية زوّدنا بها صاحب المطعم (كلها 5/5).
  // لا تضف "عدد مراجعات" رقمي إلا إذا صار عندك الرقم الحقيقي من لوحة Google Business.
  rating: { value: 5.0 },

  social: {
    instagram: "https://instagram.com/Tabouna.ksa",
    instagramHandle: "@Tabouna.ksa",
    hungerstation:
      "https://hungerstation.com/sa-ar/restaurants/regions/الرياض/المعكال/طابونة-132259",
    whatsapp: "https://wa.me/966539344004",
  },
};

// إطار عرض الخريطة المُضمّنة حول موقع المطعم (بدون مفتاح API)
const MAP_SPAN_LAT = 0.006;
const MAP_SPAN_LNG = 0.008;

/** روابط الإجراءات الجاهزة (مبنية من BUSINESS، لا تحتاج تعديل عادةً) */
export const LINKS = {
  tel: `tel:${BUSINESS.phoneIntl}`,
  whatsapp: `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(BUSINESS.whatsappMessage)}`,
  directions: `https://www.google.com/maps/dir/?api=1&destination=${BUSINESS.geo.lat},${BUSINESS.geo.lng}`,
  // خريطة حقيقية مُضمّنة (OpenStreetMap، مجانية وبدون مفتاح API — خرائط قوقل
  // توقفت عن دعم التضمين المجاني). تظهر مباشرة بالصفحة، وفوقها طبقة شفافة
  // تفتح خرائط قوقل عند الضغط (احترافية + تحويل مباشر بنفس الوقت).
  mapEmbed: `https://www.openstreetmap.org/export/embed.html?bbox=${
    BUSINESS.geo.lng - MAP_SPAN_LNG
  },${BUSINESS.geo.lat - MAP_SPAN_LAT},${BUSINESS.geo.lng + MAP_SPAN_LNG},${
    BUSINESS.geo.lat + MAP_SPAN_LAT
  }&layer=mapnik&marker=${BUSINESS.geo.lat},${BUSINESS.geo.lng}`,
};

/** أصناف المنيو المعروضة (بدون أسعار بطلب صاحب المطعم) */
export const MENU = [
  {
    id: "pizza-pepperoni",
    name: "بيتزا بيبروني",
    desc: "شرائح بيبروني مقرمشة فوق طبقة جبن سخية وعجينة مخبوزة طازج.",
    img: "pizza-pepperoni",
  },
  {
    id: "pizza-classic",
    name: "بيتزا طابونة الكلاسيكية",
    desc: "صوص طماطم بيتي، مزيج أجبان ذايب، وحواف مقرمشة من الطابون.",
    img: "pizza-classic",
  },
  {
    id: "pizza-4cheese",
    name: "بيتزا 4 أجبان",
    desc: "موزاريلا وشيدر وأجبان مختارة تمتد بكل قضمة — لعشاق الجبن الحقيقيين.",
    img: "pizza-4cheese",
  },
  {
    id: "fatayer-cheddar",
    name: "فطيرة الشيدر",
    desc: "عجينة رقيقة مقرمشة محشوة شيدر ذايب، تُخبز لحظة ما تطلب.",
    img: "fatayer-cheddar",
  },
  {
    id: "fatayer-tomato",
    name: "فطيرة جبن وطماطم",
    desc: "موزاريلا طرية وطماطم طازجة فوق عجينة مخبوزة على الطابون مباشرة.",
    img: "fatayer-tomato",
  },
];

/** آراء زباين حقيقية من قوقل (كما وصلت من صاحب المطعم) */
export const REVIEWS = [
  {
    name: "Manar Mousa",
    badge: "مرشد محلي · 29 مراجعة",
    timeAgo: "قبل أسبوعين",
    rating: 5,
    text: "لذيذ وفريش. العكاوي جداً لذيذة والسبانخ الخاصة فيهم مميزة جداً. الخدمة سريعة ووصل الطلب ساخن.",
    ratings: [
      { label: "الطعام", value: "5/5" },
      { label: "الخدمة", value: "5/5" },
    ],
  },
  {
    name: "sara ali",
    badge: "مرشد محلي · 14 مراجعة · 14 صورة",
    timeAgo: "قبل شهر",
    rating: 5,
    text: "قسماً بالله من أفضل أفضل المخبوزات اللي جربتها من جربتها ما عاد اعتدااااهم نهائياً شي فوق الخيال، تبارك الرحمن. فوق طلبته يمكن فوق ١٠ مرات وكل مرة بنفس الجودة.",
    ratings: [],
  },
  {
    name: "Muneera",
    badge: "9 مراجعات · صورتان",
    timeAgo: "قبل شهر",
    rating: 5,
    text: "الأكل يمممي صرنا زبايناً من زبايناهم ومو أول مرة نطلب منهم 🤍",
    ratings: [
      { label: "الطعام", value: "5/5" },
      { label: "الخدمة", value: "5/5" },
      { label: "الأجواء", value: "5/5" },
    ],
  },
];
