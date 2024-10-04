"use client";
import PopUp from "../components/popUp";
import styles from "./dash.module.css";
import tStyles from "./tasks.module.css";
import { CopyButton, ActionIcon, Tooltip, Loader } from "@mantine/core";
import {
  useGetLeaderboard,
  useGetProfileInformation,
  useGetRank,
  useGetUserTasks,
} from "../libs/builder/user/queries";
import { Skeleton } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useGenerateCode } from "../libs/builder/user/mutations";

export default function Page() {
  return (
    <main className={styles.main}>
      <div className={styles.top}>
        <h1>
          Welcome
          <span> BACK</span>
        </h1>
        <div className={styles.dataCon}>
          <ProfileCon />
          <Referal />
        </div>
      </div>
      <LeadersBoard />
      <div className={tStyles.bottom}>
        <h2>Quests</h2>
        <Tasks />
      </div>
    </main>
  );
}

const Tasks = () => {
  const { data, status } = useGetUserTasks();
  const tasks = data?.data?.data || [];

  const allTasksCompleted =
    tasks.length > 0 &&
    tasks.every(
      (task) => task.completed === true && task.status === "completed"
    );

  return (
    <>
      {tasks.length === 0 || allTasksCompleted ? (
        <EmptyQuest />
      ) : (
        <Skeleton visible={status !== "success"}>
          <div className={tStyles.tasksCon}>
            {data?.data?.data?.map((taskItem) => (
              <Task task={taskItem} key={taskItem.id} />
            ))}
          </div>
        </Skeleton>
      )}
    </>
  );
};

const Task = ({ task }) => {
  const openModal = () =>
    modals.open({
      modalId: "TASK_MODAL",
      withCloseButton: false,
      overlayProps: {
        blur: "8px",
        bg: "rgba(0,0,0,0.15)",
      },
      styles: {
        content: {
          filter: "drop-shadow(0px 0px 15px rgba(0, 0, 0, 0.2))",
          minWidth: 700,
          marginTop: "auto",
          marginBottom: "auto",
          borderRadius: 24,
          backdropFilter: blur(8),
        },
      },
      children: <PopUp task_id={task.id} />,
    });
  const isCommentTask = task?.action === "comment";
  const isCommentTaskCompleted = task?.status === "completed";
  const isCommentTaskPending = task?.status === "queued";

  const getButtonText = () => {
    if (isCommentTaskCompleted) return "Completed";
    if (isCommentTaskPending) return "Pending";
    return "Complete";
  };

  return (
    <>
      {" "}
      {task?.status === "uncompleted" && (
        <div className={`${tStyles.task} ${styles.task}`}>
          <div className={tStyles.taskTop}>
            <h3>{task?.reward} Pts</h3>
            <button>New Task</button>
          </div>
          <div className={tStyles.taskBottom}>
            <h3>{task?.description}</h3>
            <div className="hoverBtn marginInline0">
              {isCommentTask ? (
                <button
                  onMouseDown={openModal}
                  disabled={isCommentTaskPending || isCommentTaskCompleted}
                >
                  {getButtonText()}
                </button>
              ) : (
                <button onMouseDown={openModal} disabled={!!task?.completed}>
                  {task?.completed ? "Completed" : "Complete"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}{" "}
    </>
  );
};

const EmptyQuest = () => {
  return (
    <div className={styles.emptyQuest}>
      <h2>
        Awesome work! You've finished all the tasks. Check back soon for more!
      </h2>
    </div>
  );
};

const LeadersBoard = () => {
  const { data, status, isError } = useGetLeaderboard();
  const { data: profile, status: profile_status } = useGetProfileInformation();
  //console.log("this is the data", data?.data?.data?.slice(0, 10))
  //{data?.data?.data?.slice(0, 10).map((leader, index) => (
  return (
    <div className={styles.leadersBoard}>
      <div className={styles.header}>
        {/* <img src="/icons/thunder.png" alt="profile" /> */}
        <h1>Leaderboard # top 10</h1>
      </div>
      <div>
        <p>You earned 50 gift today out of 43245 users</p>
      </div>
      <div className={styles.tittle}>
        <p> Place </p>
        <p> Username </p>
        <p> Points </p>
        <p> Price </p>
      </div>
      {/* <h4>You</h4> */}
      <Skeleton visible={profile_status !== "success"}>
        <LeaderBoardData
          user={profile?.data?.data?.twitter?.username}
          rank={userRank()}
          playerHandle={profile?.data?.data?.twitter?.username}
          points={profile?.data?.data?.totalTokens}
        />
      </Skeleton>
      {/* <h4>Top 10</h4> */}
      {/* <Skeleton visible={status !== "success"}>
        <div className={styles.leadersDataCon}>
          {data?.data?.data?.slice(0, 10).map((leader, index) => (
            <LeaderBoardData
              key={leader?.id + index}
              rank={leader.rank}
              playerHandle={leader?.twitter?.username}
              points={leader?.totalTokens ?? 0}
            />
          ))}
        </div>
      </Skeleton> */}
    </div>
  );
};

const LeaderBoardData = (props) => {
  const rank =
    typeof props.rank === "number" || typeof props.rank === "string"
      ? String(props.rank).padStart(2, "0")
      : "00";

  const points = parseInt(props.points, 10) || 0; // Converts points to integer, defaults to 0 if invalid

  return (
    <div
      className={`${styles.leadersData} ${
        props.user !== undefined && styles.boldUser
      }`}
    >
      <h3>{rank}</h3>
      <h3>@{props.playerHandle}</h3>
      <h3>{points}</h3> {/* Renders integer points */}
    </div>
  );
};

const ProfileCon = () => {
  const { data, status } = useGetProfileInformation();
  return (
    <div className={styles.profileCon}>
      <img
        src={
          data?.data?.data?.twitter?.profile_image_url ?? "/temp/tempUser.png"
        }
        alt="profile"
      />
      <div>
        <div>
          <img className={styles.xIcon} src="/icons/x.png" alt="profile" />
          <Skeleton visible={status !== "success"}>
            <div>
              <span className={styles.userName}>
                <span className={styles.userName}>
                  {data?.data?.data?.twitter?.username?.length > 16
                    ? `${data.data.data.twitter.username.slice(0, 14)}..`
                    : data?.data?.data?.twitter?.username}
                </span>
              </span>
            </div>
          </Skeleton>
        </div>
        <div>
          <img src="/icons/trophy.png" alt="profile" />
          <Skeleton visible={status !== "success"}>
            <p>
              <span>{data?.data?.data?.rewardTokens?.unclaimed}</span> points
            </p>
          </Skeleton>
        </div>

        <div>
          <img src="/icons/rank.png" alt="profile" />
          <Skeleton visible={status !== "success"}>
            <p>
              <span>{userRank()}</span> rank
            </p>
          </Skeleton>
        </div>
      </div>
    </div>
  );
};

const Referal = () => {
  const { data, status } = useGetProfileInformation();

  return (
    <div className={styles.referal}>
      <h2>
        <img src="/icons/friend.png" alt="profile" />
        referrals
      </h2>
      <h4>Invite Friends, Get Rewards</h4>
      <p>Invite your friends to join and receive 8% of their points.</p>
      <section>
        <Skeleton visible={status !== "success"} className={styles.referralBox}>
          <h3 className={styles.referralCode}>
            Referral Code: <span>{data?.data?.data?.referralCode}</span>
          </h3>
          <CopyButton value={data?.data?.data?.referralCode} timeout={2000}>
            {({ copied, copy }) => (
              <Tooltip
                label={copied ? "Copied" : "Copy"}
                withArrow
                position="right"
              >
                <ActionIcon
                  color={copied ? "teal" : "gray"}
                  variant="subtle"
                  onClick={copy}
                >
                  <img
                    className={styles.copyIcon}
                    src="/icons/copy.svg"
                    alt="profile"
                  />
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Skeleton>
        <div className="">
          <h3>
            Invite Number:
            {data?.data?.data?.referredUsers}
          </h3>
        </div>
      </section>
    </div>
  );
};

const userRank = () => {
  const { data: UserRank, status: rankStatus } = useGetRank();

  return UserRank?.data?.data?.rank ?? 0;
};

const fakeData = [
  {
    id: "2181775022",
    permission: "user",
    rewardTokens: {
      claimed: 0,
      unclaimed: 176397.5200000004,
      referralPoints: 174397.5200000004,
    },
    twitter: {
      id: "2181775022",
      username: "VjRusmayana404",
      profile_image_url:
        "https://pbs.twimg.com/profile_images/1547528104645922817/yRa4ri7w.jpg",
    },
    createdAt: 1725555956259,
    updatedAt: 1725555956259,
    referredBy: "1615041590338408448",
    referredUsers: 1181,
    referralCode: "J9B7AS6R87",
    totalTokens: 176397.5200000004,
    rank: 1,
  },
  {
    id: "1000843782315655168",
    permission: "user",
    rewardTokens: {
      claimed: 0,
      unclaimed: 56548.39999999992,
      referralPoints: 54548.39999999992,
    },
    twitter: {
      id: "1000843782315655168",
      username: "TeamAirdrops",
      profile_image_url:
        "https://pbs.twimg.com/profile_images/1000844893000945664/IW2Na27r.jpg",
    },
    createdAt: 1725628568955,
    updatedAt: 1725628568955,
    referredBy: "1178626454206242816",
    referredUsers: 323,
    referralCode: "N9WXKAG7E7",
    totalTokens: 56548.39999999992,
    rank: 2,
  },
  {
    id: "1555212000",
    permission: "user",
    rewardTokens: {
      claimed: 0,
      unclaimed: 32760,
      referralPoints: 30160,
    },
    twitter: {
      id: "1555212000",
      username: "agayialapusing",
      profile_image_url:
        "https://pbs.twimg.com/profile_images/1828823546706964480/K6qYT59L.jpg",
    },
    createdAt: 1725931345987,
    updatedAt: 1725931345987,
    referredBy: "1000843782315655168",
    referredUsers: 145,
    referralCode: "A2PT6QB561",
    totalTokens: 32760,
    rank: 3,
  },
  {
    id: "1683816645880586240",
    permission: "user",
    rewardTokens: {
      claimed: 0,
      unclaimed: 29007.999999999825,
      referralPoints: 26407.999999999825,
    },
    twitter: {
      id: "1683816645880586240",
      username: "ChaobingD32282",
      profile_image_url:
        "https://pbs.twimg.com/profile_images/1683816878828044289/z5t2NPyh.png",
    },
    createdAt: 1726024328917,
    updatedAt: 1726024328917,
    referredBy: "1000843782315655168",
    referredUsers: 101,
    referralCode: "ZW3ULFHTF1",
    totalTokens: 29007.999999999825,
    rank: 4,
  },
  {
    id: "1675472818576961536",
    permission: "user",
    rewardTokens: {
      claimed: 0,
      unclaimed: 28191.439999999988,
      referralPoints: 28191.439999999988,
    },
    twitter: {
      id: "1675472818576961536",
      username: "0xFree20",
      profile_image_url:
        "https://pbs.twimg.com/profile_images/1772987992623497216/1BC4BU76.jpg",
    },
    createdAt: 1725546586297,
    updatedAt: 1725546586297,
    referredBy: "1391197908410662912",
    referredUsers: 229,
    referralCode: "YDUQ2KRF2A",
    totalTokens: 28191.439999999988,
    rank: 5,
  },
  {
    id: "1597982020453298176",
    permission: "user",
    rewardTokens: {
      claimed: 0,
      unclaimed: 28073.479999999967,
      referralPoints: 24774.479999999967,
    },
    twitter: {
      id: "1597982020453298176",
      username: "arifsnt1",
      profile_image_url:
        "https://pbs.twimg.com/profile_images/1618929177549479938/ZfVaQSRJ.jpg",
    },
    createdAt: 1725553680660,
    updatedAt: 1725553680660,
    referredBy: null,
    referredUsers: 114,
    referralCode: "LZTQPMGA18",
    totalTokens: 28073.479999999967,
    rank: 6,
  },
  {
    id: "1748248939432964097",
    permission: "user",
    rewardTokens: {
      claimed: 0,
      unclaimed: 25872,
      referralPoints: 23872,
    },
    twitter: {
      id: "1748248939432964097",
      username: "ESakayanagi",
      profile_image_url:
        "https://pbs.twimg.com/profile_images/1748249887823826944/rCABtxcq.jpg",
    },
    createdAt: 1725713834961,
    updatedAt: 1725713834961,
    referredBy: "870027769219960832",
    referredUsers: 124,
    referralCode: "95RGTZ9217",
    totalTokens: 25872,
    rank: 7,
  },
  {
    id: "870027769219960832",
    permission: "user",
    rewardTokens: {
      claimed: 0,
      unclaimed: 23127.359999999986,
      referralPoints: 20527.359999999986,
    },
    twitter: {
      id: "870027769219960832",
      username: "6yt39m9nvsb9",
      profile_image_url:
        "https://pbs.twimg.com/profile_images/870028123630325760/CGAdclPu.jpg",
    },
    createdAt: 1725552927455,
    updatedAt: 1725552927455,
    referredBy: "1436022370804768787",
    referredUsers: 153,
    referralCode: "ERCU44HXA3",
    totalTokens: 23127.359999999986,
    rank: 8,
  },
  {
    id: "1725327311447228416",
    permission: "user",
    rewardTokens: {
      claimed: 0,
      unclaimed: 21320,
      referralPoints: 18720,
    },
    twitter: {
      id: "1725327311447228416",
      username: "1069913798Liu",
      profile_image_url:
        "https://pbs.twimg.com/profile_images/1725327525650317312/Q1SCBpOA.jpg",
    },
    createdAt: 1725991216493,
    updatedAt: 1725991216493,
    referredBy: "1000843782315655168",
    referredUsers: 90,
    referralCode: "NVAEP6DT30",
    totalTokens: 21320,
    rank: 9,
  },
  {
    id: "1454885518991233024",
    permission: "user",
    rewardTokens: {
      claimed: 0,
      unclaimed: 18000,
      referralPoints: 16000,
    },
    twitter: {
      id: "1454885518991233024",
      username: "phamquocanhhhh",
      profile_image_url:
        "https://pbs.twimg.com/profile_images/1466064769664761861/O6VhDay9.jpg",
    },
    createdAt: 1725592307484,
    updatedAt: 1725592307484,
    referredBy: "894434596078575617",
    referredUsers: 100,
    referralCode: "TJ356UCF1E",
    totalTokens: 18000,
    rank: 10,
  },
];
