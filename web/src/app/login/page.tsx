import styles from "./login.module.css";
import { Activity } from "lucide-react";
import { login } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Activity className={styles.logoIcon} size={32} />
          </div>
          <h1>مرحباً بك في لومينا</h1>
          <p>سجل دخولك عشان تقدر توصل لبيانات العيادة</p>
        </div>

        <form className={styles.form} action={login}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">البريد الإلكتروني</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">كلمة المرور</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className={styles.input}
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            تسجيل الدخول
          </button>

          {searchParams?.message && (
            <div className={styles.errorMessage}>{searchParams.message}</div>
          )}
        </form>
      </div>
    </div>
  );
}
