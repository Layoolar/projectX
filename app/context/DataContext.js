'use client';
import { createContext, useState, useContext } from 'react';
import {
  GET_TASK,
  VERIFY_TASK,
  GET_LEADERBOARD,
  GET_PROFILE,
  GET_USER_HISTORY,
  GET_ADMIN_TASKS,
} from '../api/data';

const DataContext = createContext();

const DataContextProvider = ({ children }) => {
  const [userName, setUserName] = useState('');
  const [points, setPoints] = useState(0);
  const [rank, setRank] = useState(0);

  const [leadersBoard, setLeadersBoard] = useState([]);
  const [userLeaderBoard, setUserLeaderBoard] = useState([]);

  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState({});

  const getSetUserData = async () => {
    if (localStorage.getItem('userDataFetched') === 'false') {
      localStorage.setItem('userDataFetched', 'true');
      const profile = await GET_PROFILE();
      if (profile.statusCode === 200) {
        setUserName(profile.data.twitter.username);
        setPoints(profile.data.rewardTokens.unclaimed);
      }
    }
  };

  const getSetLeadersBoard = async () => {
    if (localStorage.getItem('leadersBoardFetched') === 'false') {
      localStorage.setItem('leadersBoardFetched', 'true');
      const leaderboard = await GET_LEADERBOARD();
      if (leaderboard.statusCode === 200) {
        const leaderData = [];
        leaderboard.data.forEach((leader, index) => {
          leaderData.push({
            name: leader.twitter.username,
            points: leader.rewardTokens.unclaimed,
            rank: index + 1,
          });
        });
        setLeadersBoard(leaderData);
      }

      setUserLeaderBoard({
        name: userName,
        points: points,
        rank: rank,
      });
    }
  };

  const getSetUserTasks = async () => {
    if (localStorage.getItem('userTasksFetched') === 'false') {
      localStorage.setItem('userTasksFetched', 'true');
      const userTasks = await GET_TASK();
      setTasks(userTasks.data);
    }
  };

  return (
    <DataContext.Provider
      value={{
        getSetUserData,
        getSetLeadersBoard,
        getSetUserTasks,
        userName,
        setUserName,
        points,
        setPoints,
        rank,
        setRank,
        leadersBoard,
        setLeadersBoard,
        userLeaderBoard,
        setUserLeaderBoard,
        tasks,
        setTasks,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export { DataContext, DataContextProvider };
export const useData = () => useContext(DataContext);
