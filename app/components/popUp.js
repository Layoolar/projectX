import { Loader, Skeleton } from "@mantine/core";
import { useVerifyTask } from "../libs/builder/user/mutations";
import { useGetUserSingleTask } from "../libs/builder/user/queries";
import { modals } from "@mantine/modals";
import styles from "./css/popUp.module.css";
import { useEffect, useState } from "react";

export default function PopUp({ task_id }) {
    const { data, status } = useGetUserSingleTask(task_id);

    const { mutate, isPending } = useVerifyTask();

    const [timeLeft, setTimeLeft] = useState(0);
    const [linkClicked, setLinkClicked] = useState(() => {
        return localStorage.getItem(`task_${task_id}_link_clicked`) === "true";
    });

    useEffect(() => {
        // Reset local storage when the component mounts
        localStorage.removeItem(`task_${task_id}_link_clicked`);
        setLinkClicked(false);
    }, [task_id]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const handleActionClick = () => {
        window.open(data?.data?.data?.url, "_blank");
        setTimeLeft(10);
        setLinkClicked(true);
        localStorage.setItem(`task_${task_id}_link_clicked`, "true");
    };

    return (
        <Skeleton visible={status !== "success"}>
            <div className={styles.popUpCon}>
                <div className={styles.popUp}>
                    <div className={styles.tittle}>
                        <h1>{data?.data?.data?.title}</h1>
                        <button onMouseDown={() => modals.close("TASK_MODAL")}>
                            <img src='/icons/cross.png' alt='close' />
                        </button>
                    </div>
                    <div className={styles.bottom}>
                        <h2>{data?.data?.data?.reward} Pts</h2>
                        <h4>{data?.data?.data?.description}</h4>

                        <div className="hoverBtn3 hoverBtn4">
                            <button
                                disabled={isPending || status !== "success"}
                                className={`${styles.retweetBtn} retweetBtn`}
                                onClick={handleActionClick}
                            >
                                {data?.data?.data?.action}
                            </button>
                        </div>

                        <div className="verfyBtnCon">
                            <button
                                disabled={
                                    isPending ||
                                    status !== "success" ||
                                    timeLeft > 0 ||
                                    !linkClicked
                                }
                                className={` ${styles.verfyBtn} ${timeLeft > 0 ? "" : styles.enable} verfyBtn`}
                                onClick={() => {
                                    mutate(task_id);
                                    modals.close("TASK_MODAL");
                                }}
                            >
                                {timeLeft > 0 ? `Verify (${timeLeft}s)` : "Verify"}{" "}
                                {isPending && <Loader color='white' />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Skeleton >
    );
}
