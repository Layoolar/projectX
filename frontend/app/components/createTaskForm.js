import { useState } from "react";
import { useCreateTask } from "../libs/builder/admin/mutations";
import styles from "./css/createTaskFrom.module.css";

export default function CreateTaskForm(props) {
  const { mutate: addCreateTask, isPending } = useCreateTask();
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    url: "",
    deadline: "",
    action: "retweet",
    reward: 0,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "reward") {
      newValue = Number(value);
    } else if (name === "deadline") {
      newValue = new Date(value).toISOString();
    }

    setTaskData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedData = {
      ...taskData,
      deadline: new Date(taskData.deadline).getTime(),
    };
    console.log("Submitting task data:", formattedData);
    addCreateTask(formattedData, {
      onSuccess: (data) => {
        console.log("Task created successfully", data);
        props.setFormOpen(false);
      },
      onError: (error) => {
        console.error("Error creating task", error);
        // Handle the error (e.g., show an error message to the user)
      },
    });
  };

  return (
    <main className={styles.main}>
      <div className={styles.popup}>
        <h1>New Task</h1>
        <hr />
        <button
          className={styles.closeButton}
          onClick={() => props.setFormOpen(false)}
        >
          <img src='/icons/cross.svg' alt='Close' />
        </button>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor='title'>Task Name</label>
          <input
            type='text'
            id='title'
            name='title'
            value={taskData.title}
            onChange={handleInputChange}
          />

          <label htmlFor='description'>Task Description</label>
          <textarea
            maxLength='100'
            id='description'
            name='description'
            value={taskData.description}
            onChange={handleInputChange}
          />

          <label htmlFor='action'>Task Type</label>
          <select
            id='action'
            name='action'
            value={taskData.action}
            onChange={handleInputChange}
          >
            <option value='like'>Like</option>
            <option value='retweet'>Retweet</option>
            <option value='comment'>Comment</option>
          </select>

          <label htmlFor='url'>Link</label>
          <input
            type='text'
            id='url'
            name='url'
            value={taskData.url}
            onChange={handleInputChange}
          />

          <label htmlFor='reward'>Points</label>
          <input
            type='number'
            id='reward'
            name='reward'
            value={taskData.reward}
            onChange={handleInputChange}
          />

          <label htmlFor='deadline'>Deadline</label>
          <input
            type='datetime-local'
            id='deadline'
            name='deadline'
            value={
              taskData.deadline
                ? new Date(taskData.deadline).toISOString().slice(0, 16)
                : ""
            }
            onChange={handleInputChange}
          />

          <button type='submit' disabled={isPending}>
            {isPending ? "Creating..." : "Create Task"}
          </button>
        </form>
      </div>
    </main>
  );
}
