import axios from "axios";
import * as DATA from "./sampledata.js";

const BASE_URL = "http://16.171.0.70:3000";

const get_url = BASE_URL + "/api/auth/twitter"; // get
const login_call_back = BASE_URL + "/api/auth/twitter/callback"; // post

const tasks = BASE_URL + "/api/tasks"; // get
const verify = BASE_URL + "/api/verify"; // post

const leaderboard = BASE_URL + "/api/user/leaderboard"; // get
const profile = BASE_URL + "/api/user/profile"; //get
const user_history = BASE_URL + "/api/user/history"; //get

const create_task = BASE_URL + "/api/admin/task/create"; //post
const admin_tasks = BASE_URL + "/api/admin/tasks"; //get
const update_tasks = BASE_URL + "/api/admin/task/update"; // put // require id
const delete_tasks = BASE_URL + "/api/admin/task"; // delete // require id

export const GET_LOGIN_ROUTE = async () => {
    try {
        const response = await axios.get(get_url);
        console.log("RESPONSE - login URL:", response.data);
        return response.data;
    } catch (error) {
        console.log("RESPONSE - error login URL:", error);
        return error;
    }
};

export const LOGIN_CALLBACK = async () => {
    try {
        const response = await axios.post(login_call_back);
        console.log("RESPONSE - login callback:", response.data);
        return response.data;
    } catch (error) {
        console.log("RESPONSE - error login callback:", error);
        return error;
    }
};

export const GET_TASK = async () => {
    return DATA.tasks;
    try {
        const response = await axios.get(tasks);
        console.log("RESPONSE - get tasks:", response.data);
        return response.data;
    } catch (error) {
        console.log("RESPONSE - get tasks:", error);
        return error;
    }
};

export const VERIFY_TASK = async () => {
    return DATA.verifyTask;
    try {
        const response = await axios.post(verify);
        console.log("RESPONSE - verify tasks:", response.data);
        return response.data;
    } catch (error) {
        console.log("RESPONSE - verify tasks:", error);
        return error;
    }
};

export const GET_LEADERBOARD = async () => {
    return DATA.leaderboard;
    try {
        const response = await axios.get(leaderboard);
        console.log("RESPONSE - get leaderboard:", response.data);
        return response.data;
    } catch (error) {
        console.log("RESPONSE - get leaderboard:", error);
        return error;
    }
};

export const GET_PROFILE = async () => {
    return DATA.profile;
    try {
        const response = await axios.get(profile);
        console.log("RESPONSE - get profile:", response.data);
        return response.data;
    } catch (error) {
        console.log("RESPONSE - get profile:", error);
        return error;
    }
};

export const GET_USER_HISTORY = async () => {
    return DATA.userHistory;
    try {
        const response = await axios.get(user_history);
        console.log("RESPONSE - get user history:", response.data);
        return response.data;
    } catch (error) {
        console.log("RESPONSE - get user history:", error);
        return error;
    }
};

export const CREATE_TASK = async () => {
    return DATA.createTask;
    try {
        const response = await axios.post(create_task);
        console.log("RESPONSE - create task:", response.data);
        return response.data;
    } catch (error) {
        console.log("RESPONSE - create task:", error);
        return error;
    }
};

export const GET_ADMIN_TASKS = async () => {
    return DATA.adminTasks;
    try {
        const response = await axios.get(admin_tasks);
        console.log("RESPONSE - admin task:", response.data);
        return response.data;
    } catch (error) {
        console.log("RESPONSE - admin task:", error);
        return error;
    }
};

export const UPDATE_TASKS = async () => {
    return DATA.updateTask;
    try {
        const response = await axios.put(update_tasks);
        console.log("RESPONSE - update task:", response.data);
        return response.data;
    } catch (error) {
        console.log("RESPONSE - update task:", error);
        return error;
    }
};

export const DELETE_TASKS = async () => {
    return DATA.deleteTasks;
    try {
        const response = await axios.delete(delete_tasks);
        console.log("RESPONSE - delete task:", response.data);
        return response.data;
    } catch (error) {
        console.log("RESPONSE - delete task:", error);
        return error;
    }
};
