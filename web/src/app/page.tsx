import Image from "next/image";
import styles from "./page.module.css";
import {
  Calendar,
  Shield,
  Activity,
  Phone,
  Star,
  Clock,
  MapPin,
  CheckCircle,
  Smile,
  Sparkles,
  HeartPulse,
  ArrowLeft,
} from "lucide-react";

export default function Home() {
  const CLINIC_PHONE = "201223840100";
  const WHATSAPP_LINK = `https://wa.me/${CLINIC_PHONE}?text=${encodeURIComponent("مرحباً، أريد الاستفسار أو حجز موعد في العيادة.")}`;

  return (
    <main className={styles.main}>
      {/* Navigation */}
      <nav className={`${styles.nav} glass`}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <div className={styles.logoIconWrapper}>
              <Activity className={styles.logoIcon} />
            </div>
            <span className={styles.logoText}>Lumina Digital</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#features">لماذا نحن؟</a>
            <a href="#services">خدماتنا</a>
            <a href="#contact">تواصل معنا</a>
            <a href="/login" className={styles.loginBtn}>
              دخول المرضى
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`${styles.heroContent} animate-fade-in`}>
          <div className={styles.badge}>
            <Sparkles size={16} className={styles.badgeIcon} />
            أحدث تقنيات طب الأسنان الرقمي
          </div>
          <h1 className={styles.title}>
            ابتسامتك المثالية تبدأ <br />
            من <span className={styles.highlight}>هنا.</span>
          </h1>
          <p className={styles.description}>
            نقدم لك رعاية أسنان متكاملة في بيئة رقمية بالكامل. تابع خطة علاجك،
            راجع أشعتك، واحجز كشوفاتك بضغطة زر.
          </p>
          <div className={styles.ctaGroup}>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.primaryBtn}
            >
              <Calendar className={styles.btnIcon} size={20} />
              احجز كشفك الآن
            </a>
            <a href="#contact" className={styles.secondaryBtn}>
              <Phone className={styles.btnIcon} size={20} />
              استشارة سريعة
            </a>
          </div>

          <div className={styles.trustIndicators}>
            <div className={styles.trustItem}>
              <div className={styles.avatars}>
                <div className={styles.avatar}></div>
                <div className={styles.avatar}></div>
                <div className={styles.avatar}></div>
              </div>
              <span>
                أكثر من <strong>5,000+</strong> مريض سعيد
              </span>
            </div>
            <div className={styles.stars}>
              <Star size={16} fill="var(--warning)" color="var(--warning)" />
              <Star size={16} fill="var(--warning)" color="var(--warning)" />
              <Star size={16} fill="var(--warning)" color="var(--warning)" />
              <Star size={16} fill="var(--warning)" color="var(--warning)" />
              <Star size={16} fill="var(--warning)" color="var(--warning)" />
              <span className={styles.ratingText}>5.0 تقييم ممتاز</span>
            </div>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={`${styles.abstractShape} ${styles.shape1}`}></div>
          <div className={`${styles.abstractShape} ${styles.shape2}`}></div>
          <div className={styles.imageWrapper}>
            <Image
              src="/clinic.png"
              alt="عيادة لومينا لطب الأسنان"
              width={600}
              height={600}
              className={styles.clinicImage}
              priority
            />
          </div>
          <div className={`${styles.glassFloatingCard} ${styles.card1} glass`}>
            <Shield className={styles.cardIcon} size={24} />
            <div>
              <h4>تعقيم 100%</h4>
              <p>أعلى معايير الأمان العالمية</p>
            </div>
          </div>
          <div className={`${styles.glassFloatingCard} ${styles.card2} glass`}>
            <Smile className={styles.cardIcon} size={24} />
            <div>
              <h4>بدون ألم</h4>
              <p>استخدام تقنيات حديثة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2>
            لماذا تختار{" "}
            <span className={styles.highlight}>لومينا ديجيتال؟</span>
          </h2>
          <p>
            لأننا نؤمن أن زيارة طبيب الأسنان يجب أن تكون مريحة، دقيقة، وخالية من
            المتاعب.
          </p>
        </div>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <Activity size={32} />
            </div>
            <h3>ملف طبي إلكتروني</h3>
            <p>
              تطبيق خاص للمرضى يتيح لك رؤية كل تفاصيل جلساتك، الأدوية، والأشعة
              من هاتفك في أي وقت.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <HeartPulse size={32} />
            </div>
            <h3>تكنولوجيا دقيقة</h3>
            <p>
              نعتمد على الأشعة الرقمية وتخطيط العلاج ثلاثي الأبعاد لضمان أفضل
              وأدق النتائج.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <Clock size={32} />
            </div>
            <h3>مواعيد مضبوطة</h3>
            <p>
              احجز موعدك عن طريق الواتساب الذكي الخاص بالعيادة، ولن تضطر
              للانتظار الطويل.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className={styles.services}>
        <div className={styles.sectionHeader}>
          <h2>
            خدماتنا <span className={styles.highlight}>الطبية</span>
          </h2>
          <p>رعاية متكاملة لصحة وجمال أسنانك تحت سقف واحد.</p>
        </div>
        <div className={styles.servicesList}>
          {[
            "زراعة الأسنان",
            "تقويم الأسنان",
            "تركيبات الزيركون",
            "تبييض الأسنان بالليزر",
            "علاج الجذور",
            "طب أسنان الأطفال",
          ].map((service, index) => (
            <div key={index} className={styles.serviceItem}>
              <CheckCircle size={24} className={styles.serviceCheck} />
              <span>{service}</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.outlineBtn}
          >
            استفسر عن خدماتنا <ArrowLeft size={18} />
          </a>
        </div>
      </section>

      {/* Footer / Contact Section */}
      <footer id="contact" className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerCol}>
            <div className={styles.logo}>
              <Activity className={styles.logoIcon} />
              <span>Lumina Digital</span>
            </div>
            <p className={styles.footerDesc}>
              العيادة الرقمية الأولى المتخصصة في تقديم أحدث علاجات طب الأسنان
              باستخدام الذكاء الاصطناعي.
            </p>
            <div className={styles.socialLinks}>
              <a href={WHATSAPP_LINK} className={styles.socialIcon}>
                <Phone size={20} />
              </a>
            </div>
          </div>

          <div className={styles.footerCol}>
            <h3>روابط هامة</h3>
            <a href="/login">دخول المرضى</a>
            <a href="#features">مميزات العيادة</a>
            <a href="#services">الخدمات</a>
          </div>

          <div className={styles.footerCol}>
            <h3>أوقات العمل</h3>
            <p>يومياً من 12:00 ظهراً إلى 10:00 مساءً</p>
            <p style={{ color: "var(--text-muted)" }}>الجمعة: إجازة أسبوعية</p>
          </div>

          <div className={styles.footerCol}>
            <h3>تواصل معنا</h3>
            <p style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <MapPin size={18} color="var(--primary)" />
              القاهرة، مصر
            </p>
            <p style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Phone size={18} color="var(--primary)" />
              {CLINIC_PHONE}
            </p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>
            © {new Date().getFullYear()} عيادة لومينا ديجيتال لطب الأسنان. جميع
            الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </main>
  );
}
