import styles from "./css/rightNav.module.css";

export default function RightNav() {
    return (
        <nav className={styles.nav}>
            <div>
                <div className={styles.center}>
                    <a target="#" href='https://x.com/dmarqtxyz'>Twitter</a>
                    <a target="#" href='https://discord.gg/apMZcf6gst'>Discord</a>
                    <a target="#" href='https://docs.dmarqt.xyz/'>Docs</a>
                </div>
                <div className={styles.right}>
                    <a href="/">
                        <img src="/icons/out.png" alt="profile" />
                        LOG OUT</a>
                </div>
            </div>
        </nav>
    );
}
