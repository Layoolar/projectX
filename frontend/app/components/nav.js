import Link from "next/link";
import styles from "./css/nav.module.css";
import { useLogout } from "../libs/builder/user/mutations";
import { getCookie } from "cookies-next";
import { COOKIES } from "../libs/builder/constants";
import { useState, useEffect } from "react";

export default function Nav() {
  const { mutate: logOut, isLoading } = useLogout();
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(getCookie(COOKIES.auth_Token));
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    logOut(undefined, {
      onSuccess: () => {
        if (window.location !== undefined) {
          window.location.href = "/";
        }
      },
    });
  };

  return (
    <nav className={styles.nav}>
      <div>
        <Link href="/" className={styles.left}>
          <p>Project X</p>
        </Link>
        <div className={styles.center}>
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
        {token ? (
          <div
            className={styles.right}
            onClick={handleLogout}
            style={{ pointerEvents: isLoading ? "none" : "auto" }}
          >
            <a href="">
              <img src="/icons/out.png" alt="profile" />
              {isLoading ? "Logging out..." : "LOG OUT"}
            </a>
          </div>
        ) : (
          <div className={styles.placeHolder}></div>
        )}
      </div>
    </nav>
  );
}
