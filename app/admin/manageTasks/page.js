"use client";
import { useEffect, useState } from "react";
import styles from "./admin.module.css";
import tStyles from "./tasks.module.css";
import { useData } from "../../context/DataContext";
import CreateTaskForm from "@/app/components/createTaskForm";
import { useGetAllTasks } from "@/app/libs/builder/admin/queries";
import { useDeleteTask } from "@/app/libs/builder/admin/mutations";
import { Loader, Skeleton } from "@mantine/core";

export default function Page() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("userDataFetched", "false");
    window.localStorage.setItem("leadersBoardFetched", "false");
    window.localStorage.setItem("userTasksFetched", "false");
  }

  const [formOpen, setFormOpen] = useState(false);

  return (
    <main className={styles.main}>
      <div className={styles.left}>
        <button onClick={() => setFormOpen(true)} className={styles.button}>
          + Add new task
        </button>
      </div>
      <div className={styles.right}>
        <h1>Tasks</h1>
        <Tasks />
      </div>

      {formOpen && <CreateTaskForm setFormOpen={setFormOpen} />}
    </main>
  );
}

const Tasks = (props) => {
  const { data, isLoading, status, error } = useGetAllTasks();
  const deleteTaskMutation = useDeleteTask();

  const handleDeleteTask = (id) => {
    deleteTaskMutation.mutate(id);
  };

  if (isLoading)
    return (
      <div
        className={tStyles.tasksCon}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Loader color='white' style={{ margin: "auto" }} />
      </div>
    );
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Skeleton visible={status !== "success"}>
      <div className={tStyles.tasksCon}>
        {data?.data?.data.map((taskItem) => (
          <Task
            key={taskItem.id}
            taskPoints={taskItem.reward}
            id={taskItem.id}
            setPopUp={props.setPopUp}
            taskDetails={taskItem.description}
            title={taskItem.title}
            action={taskItem.action}
            url={taskItem.url}
            onDelete={handleDeleteTask}
          />
        ))}
      </div>
    </Skeleton>
  );
};

const Task = (props) => {
  const { status, isLoading, error } = useGetAllTasks();

  return (
    <Skeleton visible={status !== "success"}>
      <div className={tStyles.task}>
        <div className={tStyles.taskTop}>
          <h3>{props.taskPoints} Pts</h3>
          <button onClick={() => props.onDelete(props.id)}>
            <img src='/icons/trash.svg' alt='delete' />
          </button>
        </div>
        <div className={tStyles.taskBottom}>
          <div className={tStyles.taskInfo}>
            {/* <h3>{props.title}</h3> */}
            <p className={tStyles.taskDescription}>{props.taskDetails}</p>
            {/* <div className={tStyles.taskMeta}>
            <span className={tStyles.taskAction}>Action: {props.action}</span>
            <a
              href={props.url}
              target='_blank'
              rel='noopener noreferrer'
              className={tStyles.taskUrl}
            >
              Task URL
            </a>
          </div> */}
          </div>
          <button onClick={() => (window.location.href = "/dashboard")}>
            Live
          </button>
        </div>
      </div>
    </Skeleton>
  );
};
