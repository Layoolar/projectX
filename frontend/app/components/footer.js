import styles from "./css/footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div>
        <div className={styles.top}>
          <div>
            <p>Project X</p>
          </div>
          <div className={styles.social}>
            <a target="#" href="https://x.com/dmarqtxyz">
              Twitter
            </a>
            <a target="#" href="https://discord.gg/apMZcf6gst">
              Discord
            </a>
            <a target="#" href="https://docs.dmarqt.xyz/">
              Docs
            </a>
          </div>
        </div>
        <h1 className={styles.bottom}>
          Copyright © 2024 . All Rights Reserved.
        </h1>
      </div>
    </footer>
  );
}
