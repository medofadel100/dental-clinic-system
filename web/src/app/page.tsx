import Image from "next/image";
import styles from "./page.module.css";
import { Calendar, Shield, Activity, Phone } from "lucide-react";

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Navigation (Glassmorphism) */}
      <nav className={`${styles.nav} glass`}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <Activity className={styles.logoIcon} />
            <span>عيادة لومينا</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#services">خدماتنا</a>
            <a href="#about">عن العيادة</a>
            <a href="/login" className={styles.loginBtn}>دخول المرضى</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`${styles.heroContent} animate-fade-in`}>
          <div className={styles.badge}>✨ أحدث تقنيات طب الأسنان</div>
          <h1 className={styles.title}>
            ابتسم بثقة،<br /> 
            <span className={styles.highlight}>وعيش براحتك.</span>
          </h1>
          <p className={styles.description}>
            بنقدملك رعاية أسنان متكاملة في عيادة ديجيتال بالكامل. 
            احجز كشفك، تابع خطة علاجك، وشوف أشعتك، كله من موبايلك بسهولة.
          </p>
          <div className={styles.ctaGroup}>
            <button className={styles.primaryBtn}>
              <Calendar className={styles.btnIcon} size={20} />
              احجز كشفك
            </button>
            <button className={styles.secondaryBtn}>
              <Phone className={styles.btnIcon} size={20} />
              تواصل معانا
            </button>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={`${styles.abstractShape} ${styles.shape1}`}></div>
          <div className={`${styles.abstractShape} ${styles.shape2}`}></div>
          <div className={styles.imageWrapper}>
            <Image 
              src="/clinic.png" 
              alt="عيادة لومينا لطب الأسنان" 
              width={500} 
              height={500} 
              className={styles.clinicImage}
              priority
            />
          </div>
          <div className={`${styles.glassCard} glass`}>
            <Shield className={styles.cardIcon} size={32} />
            <h3>ملف المريض الإلكتروني</h3>
            <p>تقدر توصل لأشعتك، خطة العلاج، ومواعيدك في أي وقت.</p>
            <div className={styles.fakeProgress}>
              <div className={styles.progressFill}></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
