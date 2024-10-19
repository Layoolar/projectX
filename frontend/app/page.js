"use client";
import styles from "./page.module.css";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useValidateLoginAttempt,
  useGetAuthUrl,
  useReferralCode,
} from "./libs/builder/user/mutations";
import { useEffect, useState } from "react";
import { handleSuccess, handleError } from "./libs/utils";
import { Loader } from "@mantine/core";
import Cookies from "js-cookie";
import WebApp from "@twa-dev/sdk";

export default function Home() {
  const search = useSearchParams();
  const { mutate: getAuthUrl, isPending: mutatingAuthUrl } = useGetAuthUrl();
  const router = useRouter();
  const { mutate: confirmLoginAttempt, isPending } = useValidateLoginAttempt();
  const { mutate: generateCode } = useReferralCode();
  const [referralCode, setReferralCode] = useState("");
  const [joinClicked, setJoinClicked] = useState(false);

  console.log({
    referralCode,
  });

  useEffect(() => {
    const code = search.get("code");
    const state = search.get("state");

    if (code && state) {
      confirmLoginAttempt(
        { code, state, referralCode },
        {
          onSuccess: ({ data }) => {
            const user = data?.data?.user;
            if (user) {
              // Store user permission
              localStorage.setItem("userPermission", user.permission);

              handleSuccess(data);

              // Use Next.js router for navigation
              if (user.permission === "superAdmin") {
                router.replace("/admin/manageTasks");
              } else {
                console.log("user ", data?.data?.isNewUser);
                if (!data?.data?.isNewUser) {
                  router.replace("/dashboard");
                } else {
                  setJoinClicked(true);
                }
              }
            }
          },
          onError: (error) => {
            handleError(error);
            Cookies.remove("authTokenized");
          },
        },
      );
    }
  }, [search, router, confirmLoginAttempt]);

  return (
    <main className={styles.main}>
      <div className={styles.heroContainer}>
        <h1>
          Let's get started <span>unlocking </span> your rewards
        </h1>
        <button onClick={() => WebApp.showAlert("You just clicked")}>
          Click
        </button>
        <div>
          Participate and engage with the Project X community and turn your
          activity into valuable benefits!
        </div>

        <div className="hoverBtn">
          <button
            className={styles.button}
            onMouseDown={() => {
              console.log("Button clicked, calling getAuthUrl");
              getAuthUrl();
            }}
          >
            Connect
            <img src="/icons/x.png" alt="x" />
            {isPending || mutatingAuthUrl ? <Loader color="white" /> : null}
          </button>
        </div>
      </div>

      {joinClicked && (
        <JoinNow
          referralCode={referralCode}
          setReferralCode={setReferralCode}
        />
      )}
    </main>
  );
}

const JoinNow = ({ referralCode, setReferralCode }) => {
  const router = useRouter(); // Initialize the router

  const handleReferralCodeChange = (e) => {
    setReferralCode(e.target.value);
  };

  const {
    mutate: applyReferralCode,
    isLoading,
    isError,
    error,
  } = useReferralCode();

  const handleReferalcode = () => {
    applyReferralCode(
      { referralCode },
      {
        onSuccess: () => {
          router.replace("/dashboard"); // Navigate to the dashboard on success
        },
      },
    );
  };

  return (
    <div className={styles.JoinCon}>
      <div className={styles.Join}>
        <h1>Join Now</h1>
        <p>Enter Referral code and Connect your X</p>
        <label>Referral Code</label>
        <input
          type="text"
          placeholder="- - - - - - - -"
          onChange={handleReferralCodeChange}
          value={referralCode}
        />
        <div className="hoverBtn">
          <button
            className={styles.button}
            onMouseDown={handleReferalcode}
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
        {isError && <p style={{ color: "red" }}>Error: {error.message}</p>}
      </div>
    </div>
  );
};
