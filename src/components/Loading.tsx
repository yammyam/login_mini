import styles from "./Loading.module.css";
import { LoadingProps } from "@/types";

export default function Loading({
  text = "불러오는 중",
  fullScreen = true,
}: LoadingProps) {
  return (
    <div className={`${styles.loadingWrap} ${fullScreen ? styles.full : ""}`}>
      <p className={styles.loadingText}>{text}</p>
      <div className={styles.loader}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
    </div>
  );
}
