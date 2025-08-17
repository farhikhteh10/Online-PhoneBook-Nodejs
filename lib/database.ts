/**
 * NOTE: This file simulates a backend database and API for demonstration purposes.
 * In a real-world application, this logic would be replaced with actual API calls
 * to a server connected to a database like PostgreSQL.
 */

export interface Project {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface Position {
  id: number;
  name: string;
}

export interface Personnel {
  id: number;
  personnelCode: string;
  persianName: string;
  englishName: string;
  voipNumber: string;
  projectId: number;
  departmentId: number;
  positionId: number;
}

export interface User {
    id: number;
    username: string;
    passwordHash: string;
}

export interface AppSettings {
    [key: string]: string;
}

// --- In-Memory Database Simulation ---

let projects: Project[] = [];
let departments: Department[] = [];
let positions: Position[] = [];
let personnel: Personnel[] = [];
let users: User[] = [];
let appSettings: AppSettings = {};

let nextPersonnelId = 1;

// --- Data Initialization ---

const initializeData = () => {
    // Reset arrays to prevent duplication on hot-reloads in dev
    projects = [];
    departments = [];
    positions = [];
    personnel = [];
    users = [];
    appSettings = {};
    nextPersonnelId = 1;

    const initialPersonnelData = [
      { personnelCode: "8635071", persianName: "ابراهیم براتی کهریز", englishName: "ebrahim barati", voipNumber: "7601", project: "باغ فردوس", department: "تاسیسات باغ فردوس", position: "سرپرست" },
      { personnelCode: "8633574", persianName: "ابراهیم جمشیدی شرودانی", englishName: "Ebarahim Jamshidi", voipNumber: "7900", project: "باغ فردوس", department: "آشپزخانه باغ فردوس", position: "سرآشپز" },
      { personnelCode: "8634431", persianName: "محمدرضا جانی قربان", englishName: "ahmadreza jani ghorban", voipNumber: "7716", project: "باغ فردوس", department: "منابع انسانی و اداری باغ فردوس", position: "کارگر" },
      { personnelCode: "9963558", persianName: "اردشیر رشیدی", englishName: "ardeshir rashidi", voipNumber: "7802", project: "باغ فردوس", department: "خرید و پشتیبانی باغ فردوس", position: "راننده" },
      { personnelCode: "8554614", persianName: "امیرحسین بنایی پور", englishName: "amirhossain banaeipour", voipNumber: "7801", project: "باغ فردوس", department: "خرید و پشتیبانی باغ فردوس", position: "کارگر" },
      { personnelCode: "8595822", persianName: "حدیث نورالهی", englishName: "hadis norollahi", voipNumber: "7704", project: "باغ فردوس", department: "منابع انسانی و اداری باغ فردوس", position: "کارشناس منابع انسانی و اداری" },
      { personnelCode: "4000701", persianName: "حسین تقی پور", englishName: "hossain Taghipour", voipNumber: "7902", project: "باغ فردوس", department: "سالن بار باغ فردوس", position: "کارگر" },
      { personnelCode: "4000713", persianName: "داود بهرامی", englishName: "davood bahrami", voipNumber: "7906", project: "باغ فردوس", department: "سالن بار باغ فردوس", position: "سرگارسون" },
      { personnelCode: "8554182", persianName: "رضا خسروی", englishName: "Reza khsravi", voipNumber: "7901", project: "باغ فردوس", department: "سالن بار باغ فردوس", position: "سرپرست" },
      { personnelCode: "8554174", persianName: "رضا محبی نورالدین وند", englishName: "reza mohebi", voipNumber: "7708", project: "باغ فردوس", department: "منابع انسانی و اداری باغ فردوس", position: "کارگر" },
      { personnelCode: "4000703", persianName: "روح الله امینی", englishName: "rohollah amini", voipNumber: "7705", project: "باغ فردوس", department: "منابع انسانی و اداری باغ فردوس", position: "کارگر" },
      { personnelCode: "4000354", persianName: "سحر روشنک", englishName: "sahar roshanak", voipNumber: "7100", project: "باغ فردوس", department: "مجموعه باغ فردوس", position: "سرپرست پروژه" },
      { personnelCode: "8635089", persianName: "سعید اسماعیل زاده", englishName: "saei esmaeilzadeh", voipNumber: "7703", project: "باغ فردوس", department: "منابع انسانی و اداری باغ فردوس", position: "سرپرست" },
      { personnelCode: "8633613", persianName: "سعید توکلی سهلانی", englishName: "saeid tavakoli", voipNumber: "7910", project: "باغ فردوس", department: "آشپزخانه باغ فردوس", position: "آشپز درجه یک" },
      { personnelCode: "8554206", persianName: "سید مرتضی حسینی چمگردانی", englishName: "morteza hossiani", voipNumber: "7909", project: "باغ فردوس", department: "سالن بار باغ فردوس", position: "کارگر" },
      { personnelCode: "4000704", persianName: "شایان موسایی گله", englishName: "shayan mosaei", voipNumber: "7710", project: "باغ فردوس", department: "منابع انسانی و اداری باغ فردوس", position: "کارگر" },
      { personnelCode: "4000716", persianName: "صادق عزیزی", englishName: "sadegh azizi", voipNumber: "7302", project: "باغ فردوس", department: "مجموعه باغ فردوس", position: "کارشناس" },
      { personnelCode: "9615294", persianName: "عباس بخشیان خراجی", englishName: "abbas bakhshian", voipNumber: "7504", project: "باغ فردوس", department: "مالی باغ فردوس", position: "مسئول حسابدار" },
      { personnelCode: "8553982", persianName: "عباس صفری", englishName: "abbas safari", voipNumber: "7904", project: "باغ فردوس", department: "سالن بار باغ فردوس", position: "کارگر" },
      { personnelCode: "9990270", persianName: "عباس مرادی", englishName: "abbas moradi", voipNumber: "7602", project: "باغ فردوس", department: "فضای سبز باغ فردوس", position: "سرپرست" },
      { personnelCode: "8633427", persianName: "علی اقبالی گنجه", englishName: "ali eghbali", voipNumber: "7401", project: "باغ فردوس", department: "رستوران باغ فردوس", position: "انبار دار" },
      { personnelCode: "4000717", persianName: "علی شایسته رخ", englishName: "Ali shayestehrokh", voipNumber: "7701", project: "باغ فردوس", department: "منابع انسانی و اداری باغ فردوس", position: "کارگر" },
      { personnelCode: "8635144", persianName: "فاطمه مرادی", englishName: "fatemeh moradi", voipNumber: "7505", project: "باغ فردوس", department: "مالی باغ فردوس", position: "حسابدار" },
      { personnelCode: "8554214", persianName: "فراز دهقانی ناژوانی", englishName: "faraz dehghani", voipNumber: "7911", project: "باغ فردوس", department: "فست فود باغ فردوس", position: "کارگر" },
      { personnelCode: "9323083", persianName: "محمد پاکنهاد", englishName: "mohammad paknahad", voipNumber: "7402", project: "باغ فردوس", department: "انبار مجموعه باغ فردوس", position: "انبار دار" },
      { personnelCode: "8554166", persianName: "محمد دهقان نژاد", englishName: "mohammad dehghani nezhad", voipNumber: "7702", project: "باغ فردوس", department: "منابع انسانی و اداری باغ فردوس", position: "کارگر" },
      { personnelCode: "8554230", persianName: "محمد مالکی سونکی", englishName: "mohammad maleki", voipNumber: "7905", project: "باغ فردوس", department: "سالن بار باغ فردوس", position: "کارگر" },
      { personnelCode: "8554254", persianName: "محمدحسین مری", englishName: "Mohammad hossain mari", voipNumber: "7803", project: "باغ فردوس", department: "خرید و پشتیبانی باغ فردوس", position: "کارگر" },
      { personnelCode: "8554158", persianName: "محمدرضا سعیدی", englishName: "Mohammadreza saidi", voipNumber: "7903", project: "باغ فردوس", department: "سالن بار باغ فردوس", position: "کارگر" },
      { personnelCode: "8634481", persianName: "محمدرضا شریفی", englishName: "mohammadreza sharifi", voipNumber: "7712", project: "باغ فردوس", department: "منابع انسانی و اداری باغ فردوس", position: "کارگر" },
      { personnelCode: "8554222", persianName: "مرتضی نظری خواه", englishName: "morteza nazari", voipNumber: "7908", project: "باغ فردوس", department: "فست فود باغ فردوس", position: "کارگر" },
      { personnelCode: "8554246", persianName: "مصطفی الیاسی بختیاری", englishName: "mostafa elyasi", voipNumber: "7907", project: "باغ فردوس", department: "سالن بار باغ فردوس", position: "کارگر" },
      { personnelCode: "9927031", persianName: "مهدی شیخی زازرانی", englishName: "mehdi shaikhi", voipNumber: "7706", project: "باغ فردوس", department: "منابع انسانی و اداری باغ فردوس", position: "کارشناس HSE" },
      { personnelCode: "4000336", persianName: "احسان تذروی ورزنه", englishName: "Ehsan Tazarvi", voipNumber: "3502", project: "دفتر اصفهان", department: "واحد مالی اصفهان", position: "حسابدار" },
      { personnelCode: "2887", persianName: "اشکان غروری", englishName: "Ashkan Ghorouri", voipNumber: "3100", project: "دفتر اصفهان", department: "شعبه اصفهان", position: "مدیر مجتمع اصفهان" },
      { personnelCode: "4000353", persianName: "اعظم رضایی پیکانی", englishName: "azam rezaei", voipNumber: "3104", project: "دفتر اصفهان", department: "دفتر مدیر منطقه اصفهان", position: "کارگر" },
      { personnelCode: "4000309", persianName: "آنیتا نصراصفهانی", englishName: "Anita Nasr Esfahani", voipNumber: "3805", project: "دفتر اصفهان", department: "واحد بازرگانی", position: "کارمند" },
      { personnelCode: "4000322", persianName: "حسن یزدی", englishName: "Hassan Izadi", voipNumber: "3501", project: "دفتر اصفهان", department: "واحد مالی اصفهان", position: "حسابدار" },
      { personnelCode: "4000331", persianName: "حسین نظری ناغانی", englishName: "Hossein  Nazeri", voipNumber: "3705", project: "دفتر اصفهان", department: "مدیریت منابع انسانی", position: "کارشناس" },
      { personnelCode: "4000320", persianName: "رحمت سرلک", englishName: "Rahmatollah Sarlak", voipNumber: "3703", project: "دفتر اصفهان", department: "مدیریت منابع انسانی", position: "کارپرداز" },
      { personnelCode: "4000328", persianName: "رضا فرهمند گنجه", englishName: "Reza Farhamand Ganjeh", voipNumber: "3807", project: "دفتر اصفهان", department: "واحد بازرگانی", position: "راننده" },
      { personnelCode: "4000338", persianName: "رها حق شناس", englishName: "Raha Hagh Shenas", voipNumber: "3102", project: "دفتر اصفهان", department: "دفتر مدیر منطقه اصفهان", position: "مسئول دفتر مدیر مجتمع" },
      { personnelCode: "4000326", persianName: "زهرا بختیاری اصل", englishName: "Zahra Bakhtiari", voipNumber: "3804", project: "دفتر اصفهان", department: "واحد بازرگانی", position: "کارشناس" },
      { personnelCode: "4000313", persianName: "سید جلال الدین حسینی", englishName: "Seyed Jalal  Hoseini", voipNumber: "3801", project: "دفتر اصفهان", department: "واحد بازرگانی", position: "کارشناس ارشد" },
      { personnelCode: "4000315", persianName: "علی حمیدی نجف آبادی", englishName: "Ali Hamidi", voipNumber: "3800", project: "دفتر اصفهان", department: "مدیریت بازرگانی", position: "مدیر" },
      { personnelCode: "4000307", persianName: "لیلا میر باقر", englishName: "Leyla Mir bagher", voipNumber: "3803", project: "دفتر اصفهان", department: "واحد بازرگانی", position: "کارمند" },
      { personnelCode: "4000341", persianName: "محمد رحیمی کوهانی", englishName: "mohammad rahimi", voipNumber: "3806", project: "دفتر اصفهان", department: "واحد بازرگانی", position: "راننده" },
      { personnelCode: "4000324", persianName: "مهنوش غلامی لم جیری", englishName: "Mehnoosh Gholami", voipNumber: "4800", project: "دفتر اصفهان", department: "واحد فروش", position: "کارشناس" },
      { personnelCode: "4000359", persianName: "نغمه فروزنده", englishName: "naghmeh foroozandeh", voipNumber: "3108", project: "دفتر اصفهان", department: "دفتر مدیر منطقه اصفهان", position: "کارشناس" },
      { personnelCode: "8569678", persianName: "هادی علایی", englishName: "Hadi Alaei", voipNumber: "4301", project: "دفتر اصفهان", department: "واحد فناوری و اطلاعات اصفهان", position: "کارشناس" },
      { personnelCode: "4000327", persianName: "هدایت الله زمان پور", englishName: "Hedayat Zamanpour", voipNumber: "3101", project: "دفتر اصفهان", department: "شعبه اصفهان", position: "دستیار اجرایی مدیریت منطقه" },
      { personnelCode: "4000337", persianName: "محمدرضا همدانیان", englishName: "mohammadreza hamedanian", voipNumber: "3106", project: "دفتر اصفهان", department: "شعبه اصفهان", position: "مشاور" },
      { personnelCode: "4000351", persianName: "الهه شکری", englishName: "elaheh shokri", voipNumber: "5701", project: "دفتر تهران", department: "معاونت منابع انسانی", position: "سرپرست حقوق و دستمزد" },
      { personnelCode: "4000345", persianName: "علی نهضت", englishName: "ali nehzat", voipNumber: "5700", project: "دفتر تهران", department: "معاونت منابع انسانی", position: "معاون" },
      { personnelCode: "4000312", persianName: "محسن جوانشیر باز حور", englishName: "Mohsen Javanshir", voipNumber: "5800", project: "دفتر تهران", department: "معاونت تامین و پشتیبانی", position: "معاون" },
      { personnelCode: "4000348", persianName: "وحید یحیی پور گنجی", englishName: "vahid yahyapour", voipNumber: "5802", project: "دفتر تهران", department: "معاونت تامین و پشتیبانی", position: "کارشناس" },
      { personnelCode: "7857", persianName: "ابوذر اعتباری", englishName: "Abouzar Etebari", voipNumber: "1521", project: "دفتر مروارید", department: "واحد مالی کارخانه", position: "کارشناس حسابداری حقوق و دستمزد" },
      { personnelCode: "9159", persianName: "احمد زحمتکش", englishName: "Ahmad Zahmatkesh", voipNumber: "1801", project: "دفتر مروارید", department: "بازاریابی و فروش", position: "کارشناس فروش" },
      { personnelCode: "7003", persianName: "ایمان غروری", englishName: "Iman Ghorouri", voipNumber: "1100", project: "دفتر مروارید", department: "مدیرعامل", position: "مدیرعامل" },
      { personnelCode: "4000343", persianName: "آیلا صبوری شجاعی", englishName: "aila saboori", voipNumber: "1513", project: "دفتر مروارید", department: "واحد مالی گروه", position: "کارشناس" },
      { personnelCode: "4000360", persianName: "بهروز رحمانی", englishName: "Behrooz Rahmani", voipNumber: "1508", project: "دفتر مروارید", department: "واحد مالی گروه", position: "کارشناس" },
      { personnelCode: "7270", persianName: "پریسا عظیمی", englishName: "Parisa Azimi", voipNumber: "1111", project: "دفتر مروارید", department: "دفتر مدیر عامل", position: "مسئول" },
      { personnelCode: "7104", persianName: "جواد ارحامی", englishName: "Javad Arhami", voipNumber: "1113", project: "دفتر مروارید", department: "دفتر مدیریت مشهد", position: "انتظامات دفتر شهر" },
      { personnelCode: "7477", persianName: "جواد فروندی", englishName: "Javad Farvandi", voipNumber: "1820", project: "دفتر مروارید", department: "شعبه اصفهان", position: "کارشناس" },
      { personnelCode: "7741", persianName: "حمید نصرتی", englishName: "Hamid Nosrati", voipNumber: "1503", project: "دفتر مروارید", department: "واحد مالی گروه", position: "معاون" },
      { personnelCode: "7002", persianName: "رحیم غروری", englishName: "Rahim Ghorouri", voipNumber: "1101", project: "دفتر مروارید", department: "دفتر مدیریت مشهد", position: "رئیس هیات مدیره" },
      { personnelCode: "7881", persianName: "زهرا داوری پناه مطلق قوچانی", englishName: "Zahra Davari Panah", voipNumber: "1522", project: "دفتر مروارید", department: "واحد مالی کارخانه", position: "کارشناس حسابداری دریافت و پرداخت حقوق" },
      { personnelCode: "7986", persianName: "زینب فولادی", englishName: "Zeynab Fooladi", voipNumber: "1804", project: "دفتر مروارید", department: "بازاریابی و فروش", position: "کارشناس فروش" },
      { personnelCode: "7932", persianName: "سارا حاتمی", englishName: "Sara Hatami", voipNumber: "1201", project: "دفتر مروارید", department: "واحد روابط عمومی", position: "مسئول" },
      { personnelCode: "7964", persianName: "سپیده محمدزاده مقدم", englishName: "Sepideh Mohammadzadeh", voipNumber: "1303", project: "دفتر مروارید", department: "معاونت هوش تجاری", position: "کارشناس" },
      { personnelCode: "7587", persianName: "سعید علیزاده", englishName: "Saeid Alizadeh", voipNumber: "1803", project: "دفتر مروارید", department: "بازاریابی و فروش", position: "کارشناس مناقصات" },
      { personnelCode: "4000317", persianName: "سمیه رجایی", englishName: "Somayyeh Rajaee", voipNumber: "1507", project: "دفتر مروارید", department: "واحد مالی اصفهان", position: "کارمند" },
      { personnelCode: "4000334", persianName: "سید علی میری خیرآبادی", englishName: "Seyed Ali Miri", voipNumber: "1518", project: "دفتر مروارید", department: "واحد مالی گروه", position: "کارشناس" },
      { personnelCode: "4000311", persianName: "سید میلاد وفایی", englishName: "Milad Vafaei", voipNumber: "1502", project: "دفتر مروارید", department: "واحد مالی اصفهان", position: "مدیر" },
      { personnelCode: "7987", persianName: "سید رسول اثنا عشری نامقی", englishName: "Rasoul Esna Ashari Namiqi", voipNumber: "1505", project: "دفتر مروارید", department: "واحد حسابداری مدیریت", position: "مدیر حسابداری مدیریت" },
      { personnelCode: "9008", persianName: "صنم اسدی", englishName: "Sanam Asadi", voipNumber: "1703", project: "دفتر مروارید", department: "حقوقی (نصرتی)", position: "کارشناس حقوقی" },
      { personnelCode: "7794", persianName: "طناز حسنی", englishName: "Tannaz Hasani", voipNumber: "1501", project: "دفتر مروارید", department: "شعبه مرکزی (مشهد)", position: "مدیر مجتمع توس" },
      { personnelCode: "4000329", persianName: "عارف تیموری", englishName: "Aref Teymouri", voipNumber: "1520", project: "دفتر مروارید", department: "واحد مالی اصفهان", position: "سرپرست" },
      { personnelCode: "7742", persianName: "علی اکبر رشتی باف", englishName: "Ali Rashtibaf", voipNumber: "1509", project: "دفتر مروارید", department: "واحد مالی گروه", position: "کارشناس" },
      { personnelCode: "4000347", persianName: "علی حیدری", englishName: "ali heydari", voipNumber: "1523", project: "دفتر مروارید", department: "واحد مالی گروه", position: "کارشناس" },
      { personnelCode: "7284", persianName: "علیرضا ساجد", englishName: "Alireza Sajed", voipNumber: "1510", project: "دفتر مروارید", department: "واحد مالی کارخانه", position: "کارپرداز انبار دار واحد مالی" },
      { personnelCode: "7009", persianName: "علی عسگری دشت بیاض", englishName: "Ali Asgari", voipNumber: "1105", project: "دفتر مروارید", department: "دفتر مدیریت مشهد", position: "بازرس کیفیت" },
      { personnelCode: "4000352", persianName: "فاطمه محتشم کیا", englishName: "fatemeh Mohtasham Kia", voipNumber: "1112", project: "دفتر مروارید", department: "دفتر مدیر عامل", position: "کارمند" },
      { personnelCode: "9023", persianName: "فتانه داوطلب طوسی", englishName: "Fattaneh Davtalab Toosi", voipNumber: "1506", project: "دفتر مروارید", department: "مدیریت مالی کارخانه", position: "مدیر مالی" },
      { personnelCode: "7709", persianName: "مجتبی حمیدی", englishName: "Mojtaba Hamidi", voipNumber: "1302", project: "دفتر مروارید", department: "واحد فناوری و اطلاعات (مشهد)", position: "مدیر انفورماتیک" },
      { personnelCode: "4000340", persianName: "مریم عطاران", englishName: "maryam attaran", voipNumber: "1514", project: "دفتر مروارید", department: "واحد حسابداری مدیریت", position: "حسابدار" },
      { personnelCode: "4000350", persianName: "مریم قرجاق", englishName: "Maryam Gharjagh", voipNumber: "1515", project: "دفتر مروارید", department: "واحد مالی گروه", position: "کارشناس" },
      { personnelCode: "4000251", persianName: "مهدی امینی پور", englishName: "mehdi AminiPour", voipNumber: "1700", project: "دفتر مروارید", department: "معاونت بهره برداری", position: "معاون" },
      { personnelCode: "9000", persianName: "مهران سامانی", englishName: "Mehran Samani", voipNumber: "1511", project: "دفتر مروارید", department: "واحد مالی کارخانه", position: "حسابدار" },
      { personnelCode: "7785", persianName: "مهسان مجتبوی دلوی", englishName: "Mahsan Mojtabavi", voipNumber: "1300", project: "دفتر مروارید", department: "معاونت هوش تجاری", position: "مدیر" },
      { personnelCode: "7579", persianName: "وحید عطاییان", englishName: "Vahid Ataeian", voipNumber: "1802", project: "دفتر مروارید", department: "بازاریابی و فروش", position: "کارشناس وصول مطالبات" },
      { personnelCode: "4000349", persianName: "سما سادات علوی مقدم", englishName: "Sama Sadat Alavi Moghadam", voipNumber: "1202", project: "دفتر مروارید", department: "واحد روابط عمومی", position: "کارشناس" },
      { personnelCode: "9281", persianName: "ریحانه سعیدی", englishName: "Reyhaneh Saeidi", voipNumber: "1114", project: "دفتر مروارید", department: "دفتر مدیریت مشهد", position: "مسئول دفتر مدیر مجتمع" },
      { personnelCode: "9031", persianName: "ایرج فخارزاده", englishName: "Iraj Fakharzadeh", voipNumber: "1115", project: "دفتر مروارید", department: "دفتر مدیریت مشهد", position: "سرپرست پروژه" },
      { personnelCode: "7856", persianName: "مژگان کنعانی", englishName: "mozhghan kanani", voipNumber: "1701", project: "دفتر مروارید", department: "واحد تحلیل گزارشات", position: "سرپرست تیم پروژه بهبود" },
      { personnelCode: "1100", persianName: "سعید قهرمان", englishName: "Saeid Ghamarian", voipNumber: "1304", project: "دفتر مروارید", department: "معاونت هوش تجاری", position: "کارشناس" },
      { personnelCode: "4000342", persianName: "محمد کاظمی", englishName: "Mohammad Kazemi", voipNumber: "1504", project: "دفتر مروارید", department: "واحد گروه مالی (مشهد)", position: "معاون" },
      { personnelCode: "4000344", persianName: "مهدی محمد حسنی", englishName: "Mehdi Mohammad Hasani", voipNumber: "1500", project: "دفتر مروارید", department: "معاونت مالی", position: "معاون" },
      { personnelCode: "9232", persianName: "شیما شریفی", englishName: "Shima Sharifi", voipNumber: "1512", project: "دفتر مروارید", department: "واحد مالی کارخانه", position: "رئیس حسابداری" },
      { personnelCode: "9787415", persianName: "احسان دهقان ویچه", englishName: "Amir Dehghan Falavarjani", voipNumber: "3910", project: "فولاد سبا", department: "تولید سبا - شیفت A", position: "سر شیفت" },
      { personnelCode: "9757088", persianName: "احمد مختاری کرچگانی", englishName: "Ahmad Mokhtari Korchegani", voipNumber: "3420", project: "فولاد سبا", department: "انبار سبا", position: "کمک انبار دار" },
      { personnelCode: "8838865", persianName: "اکبر رحیمی عسکرانی", englishName: "Akbar Rahimi", voipNumber: "3911", project: "فولاد سبا", department: "تولید سبا - کورزار", position: "سر آشپز" },
      { personnelCode: "8838962", persianName: "اکبر کریمی عسکرانی", englishName: "Akbar Karimi Askarani", voipNumber: "3917", project: "فولاد سبا", department: "تولید سبا - شیفت D", position: "سر شیفت" },
      { personnelCode: "8732205", persianName: "خدایار طالبی اسکندری", englishName: "Khodayar Talebi", voipNumber: "3412", project: "فولاد سبا", department: "انبار سبا", position: "انبار دار" },
      { personnelCode: "8839099", persianName: "روح الله اکبر گوجلو", englishName: "Ruhollah Akbar Gojloo", voipNumber: "3825", project: "فولاد سبا", department: "توزیع سبا", position: "سرپرست" },
      { personnelCode: "8839081", persianName: "روح الله نصرالهی ده سرخی", englishName: "Rohollah Nasrollahi", voipNumber: "3813", project: "فولاد سبا", department: "توزیع سبا", position: "کارشناس" },
      { personnelCode: "8838815", persianName: "سید مجتبی رضوی مبارکه", englishName: "Mojtaba Razavi", voipNumber: "3707", project: "فولاد سبا", department: "مدیریت منابع انسانی", position: "کارشناس HSE" },
      { personnelCode: "8835370", persianName: "علیرضا حمامی ورنامخواستی", englishName: "Alireza Hamami Varnamkhasti", voipNumber: "3907", project: "فولاد سبا", department: "تولید سبا - شیفت A", position: "سر شیفت" },
      { personnelCode: "8519910", persianName: "فرید روستایی", englishName: "Farid Roostaei", voipNumber: "3103", project: "فولاد سبا", department: "فولاد سبا", position: "سرپرست پروژه" },
      { personnelCode: "8781377", persianName: "محمد گرامی هونجانی", englishName: "Mohammad Gerami", voipNumber: "3702", project: "فولاد سبا", department: "مدیریت منابع انسانی", position: "متصدی اداری" },
      { personnelCode: "8795813", persianName: "محمدرضا حبیب", englishName: "Mohammad Reza Habib", voipNumber: "3819", project: "فولاد سبا", department: "توزیع سبا", position: "متصدی اداری" },
      { personnelCode: "8835396", persianName: "نبی الله امیرحاجیلو", englishName: "NabiOllah Amirhajiloo", voipNumber: "3905", project: "فولاد سبا", department: "تولید سبا", position: "سر آشپز" },
      { personnelCode: "8739338", persianName: "احسان مزروعی سبدانی", englishName: "Ehsan Mazrouei Sabdani", voipNumber: "3107", project: "فولاد مبارکه طبخ 3", department: "سرپرست", position: "سرپرست" },
      { personnelCode: "8562718", persianName: "اسماعیل فداکار حسن آبادی", englishName: "Esmaeil Fadaei", voipNumber: "3903", project: "فولاد مبارکه", department: "واحد 3", position: "سر آشپز" },
      { personnelCode: "9779674", persianName: "امید شفیعی دستگردی", englishName: "Omid Shafiei Dastgerdi", voipNumber: "3411", project: "فولاد مبارکه", department: "واحد 2", position: "انبار دار" },
      { personnelCode: "8707006", persianName: "امیرحسین محمدی مبارکه", englishName: "Amir hossein Mohammadi", voipNumber: "3812", project: "فولاد مبارکه", department: "واحد 3", position: "مسئول" },
      { personnelCode: "8739011", persianName: "امیر دهقان فلاورجانی", englishName: "Amir Dehghan Falavarjani", voipNumber: "3909", project: "فولاد مبارکه", department: "۳ - کورزار", position: "سر شیفت آماده سازی" },
      { personnelCode: "9634303", persianName: "امیر رضایی", englishName: "Amir Rezaei", voipNumber: "3407", project: "فولاد مبارکه", department: "واحد 3", position: "سرپرست" },
      { personnelCode: "9753767", persianName: "امیر هادی زاده سیاه بومی", englishName: "Amir Hadizadeh Siyahbomi", voipNumber: "3423", project: "فولاد مبارکه", department: "واحد 3", position: "سر دار خانه" },
      { personnelCode: "9784946", persianName: "توفیق محمدی جو آبادی", englishName: "Tofiq Mohammadi Ju Abadi", voipNumber: "3820", project: "فولاد مبارکه", department: "سفارشات و صورت وضعیت", position: "کارشناس" },
      { personnelCode: "8738895", persianName: "حسین قره قانی", englishName: "Hossein Ghareghani", voipNumber: "3416", project: "فولاد مبارکه", department: "انبار طبخ یک", position: "کمک انبار دار" },
      { personnelCode: "8583342", persianName: "حسین مرادپور", englishName: "Hossein moradpour", voipNumber: "3900", project: "فولاد مبارکه", department: "فولاد مبارکه", position: "سر آشپز" },
      { personnelCode: "8840066", persianName: "حمیدرضا آزادی", englishName: "Alireza Azadi", voipNumber: "3401", project: "فولاد مبارکه", department: "واحد 2", position: "انبار دار" },
      { personnelCode: "8739231", persianName: "راضیه برومند قهویه", englishName: "Razieh Boroumand Ghohveh", voipNumber: "3706", project: "فولاد مبارکه", department: "مدیریت منابع انسانی", position: "کارشناس HSE" },
      { personnelCode: "9798848", persianName: "رضا اسماعیلیان ریزی", englishName: "Reza Esmaeilian Rizi", voipNumber: "3924", project: "فولاد مبارکه", department: "تولید طبخ یک", position: "سر شیفت" },
      { personnelCode: "9740502", persianName: "رضا بهرامی دیزیچه", englishName: "Reza Bahrami Dizicheh", voipNumber: "3402", project: "فولاد مبارکه", department: "انبار طبخ یک", position: "کمک انبار دار" },
      { personnelCode: "8739061", persianName: "رضا جمشیدی قهه", englishName: "Reza Jamshidi", voipNumber: "3405", project: "فولاد مبارکه", department: "واحد 2", position: "انبار دار" },
      { personnelCode: "9641782", persianName: "رضا نیکان فلاورجانی", englishName: "Reza Nikan", voipNumber: "3422", project: "فولاد مبارکه", department: "واحد 2", position: "کمک انبار دار" },
      { personnelCode: "9557844", persianName: "سجاد ساتکی", englishName: "Sajjad Satki", voipNumber: "3808", project: "فولاد مبارکه", department: "واحد 3", position: "متصدی اداری" },
      { personnelCode: "8739273", persianName: "سجاد محمدرضایی", englishName: "Sajjad Mohammadrezaei", voipNumber: "3419", project: "فولاد مبارکه", department: "واحد 2", position: "انبار دار" },
      { personnelCode: "8739265", persianName: "سجاد یوسفی", englishName: "Sajjad Yousefi", voipNumber: "3921", project: "فولاد مبارکه", department: "۲ - شیفت B", position: "سر شیفت" },
      { personnelCode: "8558014", persianName: "سعید جعفری", englishName: "Saeed Jafari", voipNumber: "3404", project: "فولاد مبارکه", department: "واحد 3", position: "انبار دار" },
      { personnelCode: "9746477", persianName: "سید امیرحسین حر", englishName: "seyed Amirhossein Har", voipNumber: "3818", project: "فولاد مبارکه", department: "واحد 2", position: "متصدی اداری" },
      { personnelCode: "8739207", persianName: "سید بهروز جزایری", englishName: "seyed Behrouz Jazayeri", voipNumber: "3904", project: "فولاد مبارکه", department: "فولاد مبارکه", position: "سر آشپز" },
      { personnelCode: "8739142", persianName: "سید داود موسوی ریزی", englishName: "seyed Davood Mousavi Rizi", voipNumber: "3919", project: "فولاد مبارکه", department: "۳ - کورزار", position: "آشپز یک" },
      { personnelCode: "8694910", persianName: "سید سالار داتلی بگی قمشلو", englishName: "seyed Salar Datli Begi", voipNumber: "3908", project: "فولاد مبارکه", department: "۲ - شیفت A", position: "سر شیفت آماده سازی" },
      { personnelCode: "8579782", persianName: "شروین رضایی", englishName: "Shervin Rezaei", voipNumber: "3408", project: "فولاد مبارکه", department: "انبار طبخ یک", position: "سرپرست" },
      { personnelCode: "8596766", persianName: "عاطفه بیرانوند", englishName: "Atefe biranvand", voipNumber: "3700", project: "فولاد مبارکه", department: "مدیریت منابع انسانی", position: "سرپرست اداری و منابع انسانی" },
      { personnelCode: "8482942", persianName: "عباسرضا کرمی", englishName: "abbas reza karami", voipNumber: "3912", project: "فولاد مبارکه", department: "۲ - کورشب", position: "کمک آشپز" },
      { personnelCode: "8739192", persianName: "عباس قربانی", englishName: "Abbas Ghorbani", voipNumber: "3915", project: "فولاد مبارکه", department: "۳ - شیفت C", position: "سر شیفت" },
      { personnelCode: "8634669", persianName: "علی شیر محمد لو", englishName: "Ali Shir Mohammadlou", voipNumber: "3802", project: "فولاد مبارکه", department: "سفارشات و صورت وضعیت", position: "کمک انبار دار" },
      { personnelCode: "9626350", persianName: "علی اصغر بهرامی کرکوندی", englishName: "Ali Asghar Bahrami", voipNumber: "3403", project: "فولاد مبارکه", department: "واحد 3", position: "سر دار خانه" },
      { personnelCode: "8738772", persianName: "علی اکبر همدانیان", englishName: "Ali Akbar Hamadaniyan", voipNumber: "3814", project: "فولاد مبارکه", department: "واحد 2", position: "متصدی اداری" },
      { personnelCode: "8738853", persianName: "علی جعفری راراری", englishName: "Ali Jafari Rara", voipNumber: "3906", project: "فولاد مبارکه", department: "۲ - شیفت C", position: "سر شیفت" },
      { personnelCode: "9736325", persianName: "علی سعیدی قهه", englishName: "Ali Saeedi", voipNumber: "3409", project: "فولاد مبارکه", department: "واحد 3", position: "انبار دار" },
      { personnelCode: "9795581", persianName: "علی قنبری مبارکه", englishName: "Ali Ghanbari", voipNumber: "3811", project: "فولاد مبارکه", department: "واحد 2", position: "مسئول" },
      { personnelCode: "8752190", persianName: "غلامحسین قائد امینی", englishName: "Gholamhossein Ghaed Amini", voipNumber: "3105", project: "فولاد مبارکه", department: "فولاد مبارکه", position: "راننده" },
      { personnelCode: "8697138", persianName: "فرزاد نوروزی", englishName: "Farzad Noroozi", voipNumber: "3421", project: "فولاد مبارکه", department: "انبار طبخ یک", position: "کمک انبار دار" },
      { personnelCode: "9171054", persianName: "مجید رهنمامبارکه", englishName: "Majid Rahnama", voipNumber: "3601", project: "فولاد مبارکه", department: "تعمیر و نگهداری", position: "کارمند - تعمیرکار" },
      { personnelCode: "8820977", persianName: "مجید قهرمانی", englishName: "Majid Sharifian Jerookani", voipNumber: "3417", project: "فولاد مبارکه", department: "واحد 3", position: "انبار دار" },
      { personnelCode: "8557750", persianName: "محمد حاتمی بلداجی", englishName: "Mohammad Hatami Boldaji", voipNumber: "3406", project: "فولاد مبارکه", department: "واحد 3", position: "انبار دار" },
      { personnelCode: "8739299", persianName: "محمدرضا عباسیان", englishName: "Mohammad Reza Abbasiyan", voipNumber: "3413", project: "فولاد مبارکه", department: "واحد 2", position: "کمک انبار دار" },
      { personnelCode: "9642071", persianName: "محمدعلی جعفری باغ ملکی", englishName: "Mohammad Ali Jafari Bagh Maleki", voipNumber: "3925", project: "فولاد مبارکه", department: "۳ - شیفت A", position: "سر شیفت" },
      { personnelCode: "8771005", persianName: "محمدحسین فردافشاری", englishName: "Mohammad Hossein Fard Afshari", voipNumber: "3415", project: "فولاد مبارکه", department: "واحد 2", position: "کمک انبار دار" },
      { personnelCode: "8554814", persianName: "محمدرضا سلمانیان", englishName: "Mohammad Reza Salmaniyan", voipNumber: "3809", project: "فولاد مبارکه", department: "واحد 2", position: "کمک انبار دار" },
      { personnelCode: "8592198", persianName: "مریم تقی زاده ایرانی", englishName: "Maryam Taghizadeh", voipNumber: "3704", project: "فولاد مبارکه", department: "مدیریت منابع انسانی", position: "متصدی اداری" },
      { personnelCode: "8734401", persianName: "مسیح مجرد", englishName: "Masih Mojarad", voipNumber: "3602", project: "فولاد مبارکه", department: "واحد تعمیر و نگهداری", position: "سرپرست" },
      { personnelCode: "8569502", persianName: "مصطفی شریعت", englishName: "Mostafa Shariat", voipNumber: "3410", project: "فولاد مبارکه", department: "انبار طبخ یک", position: "انبار دار" },
      { personnelCode: "8739168", persianName: "مهدی ابراهیمی لنجی", englishName: "mehdi Ebrahimi Lenji", voipNumber: "3922", project: "فولاد مبارکه", department: "۲ - شیفت D", position: "سر شیفت" },
      { personnelCode: "8739249", persianName: "مهدی زمانی", englishName: "mehdi Zamani", voipNumber: "3902", project: "فولاد مبارکه", department: "فولاد مبارکه", position: "سر آشپز" },
      { personnelCode: "8752108", persianName: "مهدی طلایی", englishName: "mehdi Talaei", voipNumber: "3821", project: "فولاد مبارکه", department: "سفارشات و صورت وضعیت", position: "متصدی سفارشات رستوران" },
      { personnelCode: "8633744", persianName: "مهدی عسگری فروشانی", englishName: "mehdi Asgari", voipNumber: "3414", project: "فولاد مبارکه", department: "انبار طبخ یک", position: "انبار دار" },
      { personnelCode: "8592310", persianName: "مهدی فخری فخرآبادی", englishName: "mehdi Fakhri", voipNumber: "3810", project: "فولاد مبارکه", department: "واحد 3", position: "متصدی اداری" },
      { personnelCode: "8739053", persianName: "مهدی کاظمی جروکانی", englishName: "mehdi Kazemi Jeroukani", voipNumber: "3916", project: "فولاد مبارکه", department: "ساختمان مرکزی فولاد", position: "سرگارسون" },
      { personnelCode: "8839112", persianName: "مهدی منصوری بیدکانی", englishName: "Mehdi Mansouri", voipNumber: "3918", project: "فولاد مبارکه", department: "۲ - شیفت D", position: "آشپز یک" },
      { personnelCode: "8596582", persianName: "وحید اصغری ورزنه", englishName: "Vahid Asghari Varzaneh", voipNumber: "3923", project: "فولاد مبارکه", department: "۲ - کورزار", position: "کمک آشپز" },
      { personnelCode: "8707022", persianName: "ولی الله قلعه امام قیسی", englishName: "Valiollah Ghaleh Imamgheysi", voipNumber: "3901", project: "فولاد مبارکه", department: "فولاد مبارکه", position: "سر آشپز" },
      { personnelCode: "8552030", persianName: "هادی کریمی باغملکی", englishName: "Hadi Karimi Baghmaleki", voipNumber: "3418", project: "فولاد مبارکه", department: "انبار طبخ یک", position: "انبار دار" },
      { personnelCode: "9627178", persianName: "یوسف پسندی", englishName: "Yousef Pasandi", voipNumber: "3110", project: "فولاد مبارکه", department: "فولاد مبارکه", position: "سرپرست پروژه" },
      { personnelCode: "919308", persianName: "علی عشقی", englishName: "ali eshghi", voipNumber: "3913", project: "فولاد مبارکه", department: "تولید طبخ یک", position: "سرپرست" },
      { personnelCode: "7706", persianName: "ابوالفضل سیدآبادی", englishName: "Abolfazl Seyed abadi", voipNumber: "2804", project: "کارخانه توس", department: "فروش کارخانه توس", position: "سوپروایزر فروش End User" },
      { personnelCode: "7178", persianName: "اسماعیل شاهسون", englishName: "Esmaeil Shahson", voipNumber: "2906", project: "کارخانه توس", department: "مدیریت سالن خروش و کباب", position: "سر آشپز سالن خروش و کباب" },
      { personnelCode: "7695", persianName: "الهام صفایی", englishName: "Elham Safaei", voipNumber: "2725", project: "کارخانه توس", department: "بهداشت", position: "مسئول ایمنی و بهداشت" },
      { personnelCode: "7775", persianName: "الیاس کریمی", englishName: "Elias Karimi", voipNumber: "2808", project: "کارخانه توس", department: "فروش قراردادی", position: "کارشناس فروش" },
      { personnelCode: "7924", persianName: "امید اسدی", englishName: "Omid Asadi", voipNumber: "2909", project: "کارخانه توس", department: "VIP - کلاسی", position: "سر آشپز" },
      { personnelCode: "7968", persianName: "امید منعمی زاده", englishName: "Omid MonemiZadeh", voipNumber: "2707", project: "کارخانه توس", department: "مهندسی", position: "کارشناس مهندس" },
      { personnelCode: "7768", persianName: "آتنا عامل بشارتی", englishName: "Atena Besharati", voipNumber: "2805", project: "کارخانه توس", department: "فروش قراردادی", position: "کارشناس فروش" },
      { personnelCode: "7740", persianName: "آرش شریفی", englishName: "Arash Sharifi", voipNumber: "2714", project: "کارخانه توس", department: "برنامه ریزی تولید - انبار", position: "کارشناس ثبت و صدور حواله انبار" },
      { personnelCode: "7005", persianName: "آرمین غروری", englishName: "Armin Ghorouri", voipNumber: "2100", project: "کارخانه توس", department: "کارخانه توس", position: "مدیر کارخانه" },
      { personnelCode: "7644", persianName: "آزاده نعیمی", englishName: "Azadeh Naeimi", voipNumber: "2607", project: "کارخانه توس", department: "تدارکات", position: "مدیر تدارکات و پشتیبانی" },
      { personnelCode: "9141", persianName: "بهاره چوپانیان", englishName: "Bahareh Choopanian toosi", voipNumber: "2605", project: "کارخانه توس", department: "تدارکات", position: "کارشناس پشتیبانی و تدارکات" },
      { personnelCode: "7377", persianName: "حسین احمدآبادی", englishName: "Hossein Ahmad Abadi", voipNumber: "2401", project: "کارخانه توس", department: "انبار میانی", position: "مسئول" },
      { personnelCode: "7034", persianName: "حسین آهن جان", englishName: "Hossein Ahan jan", voipNumber: "2901", project: "کارخانه توس", department: "مدیریت آماده سازی", position: "سر آشپز آماده سازی" },
      { personnelCode: "7715", persianName: "حسین عبدالهیان", englishName: "Hossein Abdollahian", voipNumber: "2716", project: "کارخانه توس", department: "برنامه ریزی تولید - انبار", position: "متصدی سر دارخانه" },
      { personnelCode: "7047", persianName: "حسین علیزاده", englishName: "Hossein Alizadeh", voipNumber: "2601", project: "کارخانه توس", department: "تاسیسات", position: "مسئول تنت عملیاتی" },
      { personnelCode: "7025", persianName: "حمید امیرآبادی زاده", englishName: "Hamid Amir abadi", voipNumber: "2728", project: "کارخانه توس", department: "انتظامات", position: "نگهبان انتظامات" },
      { personnelCode: "7397", persianName: "حمید حسین زاده", englishName: "Hamid Hosseinzadeh", voipNumber: "2729", project: "کارخانه توس", department: "انتظامات", position: "نگهبان انتظامات" },
      { personnelCode: "7016", persianName: "حمیدرضا همتی بهار", englishName: "Hamid Reza HemmatiBahar", voipNumber: "2703", project: "کارخانه توس", department: "اداری", position: "مسئول اداری و منابع انسانی" },
      { personnelCode: "9142", persianName: "حمیده امانی", englishName: "Hamideh Amani", voipNumber: "2718", project: "کارخانه توس", department: "کنترل کیفیت", position: "مسئول فنی و آزمایشگاه" },
      { personnelCode: "7873", persianName: "ساجده مولایی", englishName: "Sajedeh Molaei", voipNumber: "2721", project: "کارخانه توس", department: "کنترل کیفیت", position: "کارشناس کنترل کیفیت" },
      { personnelCode: "7888", persianName: "سامان صفایی", englishName: "Saman Safaei", voipNumber: "2720", project: "کارخانه توس", department: "کنترل کیفیت", position: "کارشناس کنترل کیفیت" },
      { personnelCode: "7140", persianName: "سعید باژوند", englishName: "Saeid Bazhvand", voipNumber: "2730", project: "کارخانه توس", department: "انتظامات", position: "مسئول انتظامات" },
      { personnelCode: "7774", persianName: "سعید سندگل", englishName: "Saeed Sandgol", voipNumber: "2803", project: "کارخانه توس", department: "فروش قراردادی", position: "کارشناس فروش" },
      { personnelCode: "7977", persianName: "سعیده بیاری", englishName: "Saeideh Biari", voipNumber: "2709", project: "کارخانه توس", department: "برنامه ریزی تولید", position: "کارشناس برنامه ریزی تولید" },
      { personnelCode: "7978", persianName: "سعیده صاعدی", englishName: "Saeideh Saedi", voipNumber: "2706", project: "کارخانه توس", department: "مهندسی", position: "کارشناس r&d" },
      { personnelCode: "7821", persianName: "سمیه رسولی", englishName: "Somayyeh Rasooli", voipNumber: "2606", project: "کارخانه توس", department: "تدارکات", position: "کارشناس حرفه ای پشتیبانی و تدارکات" },
      { personnelCode: "7249", persianName: "سید محمد ضیایی", englishName: "Hamid Ziaei", voipNumber: "2103", project: "کارخانه توس", department: "کارخانه توس", position: "دستیار مدیر کارخانه" },
      { personnelCode: "9027", persianName: "سیدعلی موسوی", englishName: "Ali Mousavi", voipNumber: "2717", project: "کارخانه توس", department: "برنامه ریزی تولید", position: "مدیر برنامه ریزی و انبار" },
      { personnelCode: "7864", persianName: "سیما ایمانی", englishName: "Sima imani", voipNumber: "2719", project: "کارخانه توس", department: "کنترل کیفیت", position: "مدیر کنترل کیفیت" },
      { personnelCode: "7867", persianName: "شبنم تیموری فرد", englishName: "Shabnam TeymouriFard", voipNumber: "2723", project: "کارخانه توس", department: "تضمین سیستم", position: "کارشناس تضمین سیستم ها" },
      { personnelCode: "7976", persianName: "عاطفه پناهی", englishName: "Atefeh Panahi", voipNumber: "2921", project: "کارخانه توس", department: "کارخانه توس", position: "کارشناس تولید" },
      { personnelCode: "7946", persianName: "عباس پور علی محمد", englishName: "Abbas Pour Ali Mohammad", voipNumber: "2710", project: "کارخانه توس", department: "برنامه ریزی تولید", position: "مسئول انبار" },
      { personnelCode: "7773", persianName: "علی امینی", englishName: "Ali Amini", voipNumber: "2801", project: "کارخانه توس", department: "فروش قراردادی", position: "نایب مدیر فروش" },
      { personnelCode: "9207", persianName: "علی قدرتی", englishName: "Ali Ghodraty", voipNumber: "2807", project: "کارخانه توس", department: "فروش قراردادی", position: "کارشناس فروش" },
      { personnelCode: "7889", persianName: "علی لسانی", englishName: "Ali Lesani", voipNumber: "2810", project: "کارخانه توس", department: "توزیع", position: "کارشناس ثبت و صدور حواله تبارتی" },
      { personnelCode: "8030", persianName: "عماد صادقی زاده", englishName: "Emad Sadeghizadeh", voipNumber: "2907", project: "کارخانه توس", department: "بسته بندی", position: "مسئول بسته بندی" },
      { personnelCode: "9026", persianName: "فاطمه بخشیشی", englishName: "Fatemeh Bakhsheshi", voipNumber: "2701", project: "کارخانه توس", department: "اداری", position: "کارشناس مسئول اداری و منابع انسانی" },
      { personnelCode: "7084", persianName: "قربانعلی راماشخوار", englishName: "Ghorbanali Ra Mashkhar", voipNumber: "2904", project: "کارخانه توس", department: "سالن برنج", position: "آشپز سالن برنج" },
      { personnelCode: "7882", persianName: "کیمیا نوذر", englishName: "Kimia Nouzar", voipNumber: "2724", project: "کارخانه توس", department: "تضمین سیستم", position: "سرپرست تضمین سیستم ها" },
      { personnelCode: "7052", persianName: "مجید آهن جان", englishName: "Majid Ahan jan", voipNumber: "2924", project: "کارخانه توس", department: "سالن برنج", position: "آشپز سالن برنج" },
      { personnelCode: "9228", persianName: "مجید شاهدردی زاده", englishName: "Majid Shahdordi zadeh", voipNumber: "2105", project: "کارخانه توس", department: "دفتر مدیریت مشهد", position: "راننده دفتر مدیرعامل" },
      { personnelCode: "7213", persianName: "محسن احسانی فر", englishName: "Mohsen EhsaniFar", voipNumber: "2727", project: "کارخانه توس", department: "انتظامات", position: "نگهبان انتظامات" },
      { personnelCode: "7228", persianName: "محسن دوزنده", englishName: "Mohsen Doozandeh", voipNumber: "2731", project: "کارخانه توس", department: "انتظامات", position: "نگهبان انتظامات" },
      { personnelCode: "7248", persianName: "محسن سمساری", englishName: "Mohsen Semsari", voipNumber: "2713", project: "کارخانه توس", department: "برنامه ریزی تولید", position: "سرپرست برنامه ریزی" },
      { personnelCode: "7340", persianName: "محمدامین اشرف زاده", englishName: "Mohammad Amin Ashrafzadeh", voipNumber: "2705", project: "کارخانه توس", department: "مهندسی", position: "مدیر مهندس" },
      { personnelCode: "7883", persianName: "محمد غلامنی", englishName: "Mohammad gholamni", voipNumber: "2726", project: "کارخانه توس", department: "بهداشت", position: "کارشناس HSE" },
      { personnelCode: "7984", persianName: "محمدجواد شرقی", englishName: "Mohammad Javad Sharghi", voipNumber: "2700", project: "کارخانه توس", department: "اداری و منابع انسانی", position: "مدیر اداری و منابع انسانی" },
      { personnelCode: "7748", persianName: "محمدسعید غلامعلی زاده آهنگر", englishName: "Mohammad Saeed Gholamali Zadeh Ahangar", voipNumber: "2602", project: "کارخانه توس", department: "تاسیسات", position: "تکنسین تاسیسات" },
      { personnelCode: "7902", persianName: "مرضیه نظام دوست", englishName: "Marzieh Nezam Doost", voipNumber: "2722", project: "کارخانه توس", department: "کنترل کیفیت", position: "سرپرست و کارشناس بهداشت محیط و مسئول خدمات" },
      { personnelCode: "9181", persianName: "ملیحه دوست محمدی", englishName: "Maliheh Doost Mohammadi", voipNumber: "2711", project: "کارخانه توس", department: "برنامه ریزی تولید", position: "کارمند برنامه ریزی" },
      { personnelCode: "9145", persianName: "مهدی بخشایشی", englishName: "mehdi Bakhshayeshi", voipNumber: "2910", project: "کارخانه توس", department: "مدیریت VIP", position: "سر آشپز vip" },
      { personnelCode: "7896", persianName: "مهسا رستگار", englishName: "Mahsa Rastgar", voipNumber: "2712", project: "کارخانه توس", department: "برنامه ریزی تولید", position: "کارشناس موجودی انبار و گذارش خرید" },
      { personnelCode: "9165", persianName: "مهلا درودی", englishName: "Mahla Daroudi", voipNumber: "2802", project: "کارخانه توس", department: "فروش کارخانه توس", position: "کارشناس فروش End-User" },
      { personnelCode: "7891", persianName: "ناهید علی دخت", englishName: "Nahid Alidokht", voipNumber: "2702", project: "کارخانه توس", department: "اداری", position: "کارشناس اداری و منابع انسانی" },
      { personnelCode: "7953", persianName: "نرگس اسماعیل زاده", englishName: "Narges Esmaeilzadeh", voipNumber: "2604", project: "کارخانه توس", department: "تدارکات", position: "سرپرست پشتیبانی و تدارکات" },
      { personnelCode: "8054", persianName: "نیما سبحانیان", englishName: "Nima Sobhanian", voipNumber: "2809", project: "کارخانه توس", department: "تبارتی", position: "مسئول تبارتی" },
      { personnelCode: "7567", persianName: "وحید قدمیاری", englishName: "Vahid Ghadamyari", voipNumber: "2603", project: "کارخانه توس", department: "تاسیسات", position: "رئیس نگهداری و تعمیرات" },
      { personnelCode: "7082", persianName: "وحید مختاری نژاد", englishName: "Vahid Mokhtari Nejad", voipNumber: "2908", project: "کارخانه توس", department: "آماده سازی", position: "نایب آشپز و آماده سازی" },
      { personnelCode: "7030", persianName: "هادی آهن جان", englishName: "Hadi Ahan Jaan", voipNumber: "2903", project: "کارخانه توس", department: "مدیریت سالن برنج", position: "سر آشپز سالن برنج" },
      { personnelCode: "7770", persianName: "یاسین فرهودی", englishName: "Yasin Farhoodi", voipNumber: "2806", project: "کارخانه توس", department: "فروش قراردادی", position: "کارشناس وصول مطالبات" },
      { personnelCode: "7388", persianName: "علی ضیایی", englishName: "ali ziaei", voipNumber: "2715", project: "کارخانه توس", department: "برنامه ریزی تولید - انبار", position: "نایب سرپرست انبار" },
      { personnelCode: "9280", persianName: "علیرضا سعیدی فر", englishName: "alireza saeidifar", voipNumber: "2923", project: "کارخانه توس", department: "کارخانه توس", position: "کارشناس تولید" },
      { personnelCode: "9241", persianName: "زینب اسماعیل زاده", englishName: "zeinab esmaeilzadeh", voipNumber: "2708", project: "کارخانه توس", department: "برنامه ریزی تولید", position: "کارشناس برنامه ریزی تولید" },
      { personnelCode: "9239", persianName: "شهاب جمشیدی فر", englishName: "shahab jamshidifar", voipNumber: "2704", project: "کارخانه توس", department: "واحد تحلیل گزارشات", position: "کارشناس ارشد گزارشات" },
      { personnelCode: "7038", persianName: "رضا سمیعی", englishName: "reza samiei", voipNumber: "2905", project: "کارخانه توس", department: "سالن خروش و کباب", position: "آشپز خروش و کباب" },
      { personnelCode: "4000355", persianName: "رضا خانی نژاد کلهرودی", englishName: "reza khaninezhad", voipNumber: "3109", project: "کاشان", department: "دفتر مدیر منطقه اصفهان", position: "راننده" },
      { personnelCode: "4000615", persianName: "رضا یاوری", englishName: "Reza Yavari", voipNumber: "3920", project: "کاشان", department: "واحد تولید کاشان", position: "سر آشپز" },
      { personnelCode: "4000308", persianName: "ریحانه خانی نژاد کلهرودی", englishName: "Reyhaneh Khani Nezhad", voipNumber: "3500", project: "کاشان", department: "واحد مالی اصفهان", position: "کارمند" },
    ];

    const getOrCreateId = (
        collection: (Project | Department | Position)[],
        name: string,
        idCounter: { value: number }
    ): number => {
        let item = collection.find((p) => p.name === name);
        if (!item) {
            item = { id: idCounter.value++, name };
            collection.push(item as Project & Department & Position);
        }
        return item.id;
    };

    const projectIdCounter = { value: 1 };
    const departmentIdCounter = { value: 1 };
    const positionIdCounter = { value: 1 };

    initialPersonnelData.forEach((p) => {
        const projectId = getOrCreateId(projects, p.project, projectIdCounter);
        const departmentId = getOrCreateId(departments, p.department, departmentIdCounter);
        const positionId = getOrCreateId(positions, p.position, positionIdCounter);

        personnel.push({
            id: nextPersonnelId++,
            personnelCode: p.personnelCode,
            persianName: p.persianName,
            englishName: p.englishName,
            voipNumber: p.voipNumber,
            projectId,
            departmentId,
            positionId,
        });
    });

    // Initialize default user and settings
    users.push({
        id: 1,
        username: 'admin',
        passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'
    });

    appSettings = {
        companyName: 'فراپخت',
        appTitle: 'دفترچه تلفن آنلاین پرسنل شرکت فراپخت',
        logoUrl: '/logo.png',
        faviconUrl: '/favicon.ico',
        themeColor: '#f97316',
        designerCredit: 'طراحی شده توسط هادی علایی',
    };
};

// --- Simulated API Functions ---

// A helper to simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const db = {
    personnel: {
        async getAll() {
            await delay(200);
            return personnel.map(p => {
                const project = projects.find(proj => proj.id === p.projectId);
                const department = departments.find(dept => dept.id === p.departmentId);
                const position = positions.find(pos => pos.id === p.positionId);
                return {
                    ...p,
                    project: project?.name || 'N/A',
                    department: department?.name || 'N/A',
                    position: position?.name || 'N/A',
                };
            });
        },
        async add(newPerson: Omit<Personnel, 'id'>) {
            await delay(150);
            const newId = nextPersonnelId++;
            const personWithId = { ...newPerson, id: newId };
            personnel.push(personWithId);
            return personWithId;
        },
        async update(personnelCode: string, updatedData: Partial<Omit<Personnel, 'id' | 'personnelCode'>>) {
            await delay(150);
            const index = personnel.findIndex(p => p.personnelCode === personnelCode);
            if (index !== -1) {
                personnel[index] = { ...personnel[index], ...updatedData };
                return personnel[index];
            }
            return null;
        },
        async delete(personnelCode: string) {
            await delay(150);
            const index = personnel.findIndex(p => p.personnelCode === personnelCode);
            if (index !== -1) {
                personnel.splice(index, 1);
                return true;
            }
            return false;
        },
        async findByCode(personnelCode: string) {
            await delay(50);
            return personnel.find(p => p.personnelCode === personnelCode) || null;
        },
        async findByVoip(voipNumber: string) {
            await delay(50);
            return personnel.find(p => p.voipNumber === voipNumber) || null;
        }
    },
    projects: {
        async getAll() {
            await delay(50);
            return [...projects];
        },
        async getOrCreate(name: string) {
            await delay(50);
            const projectIdCounter = { value: projects.length + 1 };
            let project = projects.find(p => p.name === name);
            if (!project) {
                project = { id: projectIdCounter.value++, name };
                projects.push(project);
            }
            return project;
        }
    },
    departments: {
        async getAll() {
            await delay(50);
            return [...departments];
        },
         async getOrCreate(name: string) {
            await delay(50);
            const departmentIdCounter = { value: departments.length + 1 };
            let department = departments.find(d => d.name === name);
            if (!department) {
                department = { id: departmentIdCounter.value++, name };
                departments.push(department);
            }
            return department;
        }
    },
    positions: {
        async getAll() {
            await delay(50);
            return [...positions];
        },
         async getOrCreate(name: string) {
            await delay(50);
            const positionIdCounter = { value: positions.length + 1 };
            let position = positions.find(p => p.name === name);
            if (!position) {
                position = { id: positionIdCounter.value++, name };
                positions.push(position);
            }
            return position;
        }
    },
    users: {
        async findByUsername(username: string) {
            await delay(100);
            return users.find(u => u.username === username) || null;
        },
        async updatePassword(username: string, newPasswordHash: string) {
            await delay(200);
            const user = users.find(u => u.username === username);
            if (user) {
                user.passwordHash = newPasswordHash;
                return true;
            }
            return false;
        }
    },
    appSettings: {
        async getAll() {
            await delay(50);
            return { ...appSettings };
        },
        async update(newSettings: Partial<AppSettings>) {
            await delay(100);
            // This logic ensures that no undefined values are assigned, fixing the type error.
            for (const key in newSettings) {
                if (Object.prototype.hasOwnProperty.call(newSettings, key)) {
                    const value = newSettings[key];
                    if (value !== undefined) {
                        appSettings[key] = value;
                    }
                }
            }
            return { ...appSettings };
        }
    }
};

// Initialize the data when the module is loaded
initializeData();
