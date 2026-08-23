export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    // Navbar
    brand: 'Restaurant',
    menu: 'القائمة',
    aiAdvisor: 'المساعد الذكي',
    myOrders: 'طلباتي',
    adminDashboard: 'لوحة التحكم',
    cart: 'السلة',
    signIn: 'تسجيل الدخول',
    signOut: 'تسجيل الخروج',
    adminTag: 'أدمن',

    // Hero
    heroTitle: 'تجربة طعام ذكية وفريدة من نوعها',
    heroSubtitle: 'استمتع بأشهى الأطباق المحضرة بعناية، ودع الذكاء الاصطناعي يقترح عليك الوجبة المثالية حسب ميزانيتك وتفضيلاتك.',
    aiSearchPlaceholder: 'إسأل الـ AI مثلاً: "وجبة لشخصين رخيصة بدون دجاج"...',
    askAI: 'اسأل AI',
    suggestedQueries: 'اقتراحات سريعة:',
    chip1: '🍔 وجبة رخيصة أقل من 500 ليرة',
    chip2: '🥗 بيتزا نباتية بدون لحم',
    chip3: '🍗 وجبة مشويات لشخصين',
    chip4: '🍨 حلويات ومشروبات باردة',

    // Categories & Menu
    allCategories: 'جميع الأطباق',
    searchDishes: 'ابحث عن طبق...',
    available: 'متاح',
    unavailable: 'غير متاح',
    addToCart: 'إضافة للسلة',
    dishDetails: 'التفاصيل',

    // Cart
    cartTitle: 'سلة المشتريات',
    emptyCart: 'سلتك فارغة حالياً',
    emptyCartSub: 'تصفح قائمة الطعام وأضف أشهى الأطباق إلى سلتك.',
    checkout: 'إتمام الطلب الآن',
    totalPrice: 'الإجمالي:',
    quantity: 'الكمية',
    subtotal: 'المجموع',
    orderSuccess: 'تم إنشاء طلبك بنجاح!',

    // Orders
    ordersTitle: 'متابعة الطلبات المباشرة',
    ordersSub: 'تابع حالة طلبك لحظة بلحظة من المطبخ وحتى التسليم.',
    orderId: 'رقم الطلب',
    orderStatus: 'الحالة',
    orderTotal: 'المبلغ الإجمالي',
    orderDate: 'التاريخ',
    noOrders: 'لا توجد لديك طلبات حقيقية حالياً',

    // Admin Dashboard
    adminTitle: 'لوحة تحكم إدارة المطعم',
    adminSub: 'إدارة أطباق القائمة، تغيير حالات الطلبات المباشرة، واستشارات الذكاء الاصطناعي المالية',
    totalRevenue: 'إجمالي الإيرادات',
    totalOrders: 'إجمالي الطلبات',
    pendingOrders: 'الطلبات المعلقة',
    menuProducts: 'أطباق القائمة',
    ordersMgmt: 'إدارة الطلبات',
    productsMgmt: 'إدارة المنتجات',
    aiAdminAssistant: 'المساعد الذكي للأعمال (Gemini LLM)',
    addNewDish: 'إضافة طبق جديد',
    dishName: 'اسم الطبق',
    price: 'السعر (₺)',
    category: 'التصنيف',
    actions: 'الإجراءات',
    edit: 'تعديل',
    delete: 'حذف',
    saveDish: 'حفظ الطبق',

    // Admin AI
    aiExecutiveTitle: 'مساعد الأعمال الاستراتيجي من Google Gemini',
    aiExecutiveSub: 'طرح أسئلة استراتيجية باللغة الطبيعية. يقوم Gemini بتقييم بيانات PostgreSQL وإعادة التحليل والتوصيات.',
    askGeminiPlaceholder: 'أسأل مثلاً: "ما المنتج الذي تنصحني أركز عليه؟ ولماذا؟"...',
    askGeminiBtn: 'أسأل Gemini',

    // Auth
    welcomeBack: 'مرحباً بك مجدداً',
    createAccount: 'إنشاء حساب جديد',
    emailLabel: 'البريد الإلكتروني',
    passwordLabel: 'كلمة المرور',
    nameLabel: 'الاسم الكامل',
    quickDemoCustomer: 'دخول سريع بحساب تجريبي (Customer)',
    noAccount: 'ليس لديك حساب؟ سجل الآن',
    alreadyAccount: 'لديك حساب بالفعل؟ سجل دخولك',
  },
  en: {
    // Navbar
    brand: 'Restaurant',
    menu: 'Menu',
    aiAdvisor: 'AI Advisor',
    myOrders: 'My Orders',
    adminDashboard: 'Admin Dashboard',
    cart: 'Cart',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    adminTag: 'Admin',

    // Hero
    heroTitle: 'Next-Gen Smart Dining Experience',
    heroSubtitle: 'Savor masterfully crafted dishes and let our AI assist you with personalized meal recommendations based on your budget and tastes.',
    aiSearchPlaceholder: 'Ask AI e.g. "Cheap meal for two without chicken"...',
    askAI: 'Ask AI',
    suggestedQueries: 'Quick Suggestions:',
    chip1: '🍔 Cheap meal under 500₺',
    chip2: '🥗 Vegetarian pizza without meat',
    chip3: '🍗 Grilled feast for two',
    chip4: '🍨 Desserts & refreshing drinks',

    // Categories & Menu
    allCategories: 'All Dishes',
    searchDishes: 'Search dishes...',
    available: 'Available',
    unavailable: 'Unavailable',
    addToCart: 'Add to Cart',
    dishDetails: 'Details',

    // Cart
    cartTitle: 'Shopping Cart',
    emptyCart: 'Your cart is currently empty',
    emptyCartSub: 'Explore our gourmet menu and add delicious dishes to your order.',
    checkout: 'Checkout Order Now',
    totalPrice: 'Total Price:',
    quantity: 'Quantity',
    subtotal: 'Subtotal',
    orderSuccess: 'Your order was placed successfully!',

    // Orders
    ordersTitle: 'Live Orders Tracker',
    ordersSub: 'Track your order progress step by step from kitchen preparation to delivery.',
    orderId: 'Order ID',
    orderStatus: 'Status',
    orderTotal: 'Total Amount',
    orderDate: 'Date',
    noOrders: 'You have no active orders yet',

    // Admin Dashboard
    adminTitle: 'Restaurant Admin Control Dashboard',
    adminSub: 'Manage menu products, live order status workflows, and executive AI business intelligence',
    totalRevenue: 'Total Revenue',
    totalOrders: 'Total Orders',
    pendingOrders: 'Pending Orders',
    menuProducts: 'Menu Products',
    ordersMgmt: 'Orders Management',
    productsMgmt: 'Products Management',
    aiAdminAssistant: 'AI Business Assistant (Gemini LLM)',
    addNewDish: 'Add New Dish',
    dishName: 'Dish Name',
    price: 'Price (₺)',
    category: 'Category',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    saveDish: 'Save Dish',

    // Admin AI
    aiExecutiveTitle: 'Google Gemini Executive Business Intelligence',
    aiExecutiveSub: 'Ask strategic questions in natural language. Gemini invokes backend database tools to query PostgreSQL and analyze performance.',
    askGeminiPlaceholder: 'Ask e.g. "Which product should I focus on and why?"...',
    askGeminiBtn: 'Ask Gemini',

    // Auth
    welcomeBack: 'Welcome Back',
    createAccount: 'Create New Account',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    nameLabel: 'Full Name',
    quickDemoCustomer: 'Quick Demo Login (Customer)',
    noAccount: "Don't have an account? Register",
    alreadyAccount: 'Already have an account? Sign In',
  },
};
