import "./App.css";
import React from "react";
import { useState, useEffect } from "react";
import {
  FaUserPlus,
  FaSignInAlt,
  FaPlus,
  FaTrashAlt,
  FaCheck,
  FaUndo,
} from "react-icons/fa";
const _SERVER_LINK = process.env.REACT_APP_SERVER_LINK;

/*
eduard.hovhannisyan.461@my.csun.edu
12345678
http://localhost:3000/get-all
http://localhost:3000/truncate-all

*/

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkIfLoggedIn = () => {
    let userID = sessionStorage.getItem("user_id");
    let access_token = sessionStorage.getItem("access_token");

    if (!userID || !access_token) {
      setIsLoggedIn(false);
    } else {
      setIsLoggedIn(true);
    }
  };

  useEffect(() => {
    checkIfLoggedIn();
  }, []);

  return (
    <div className="App">
      <Navbar isLoggedIn={isLoggedIn} />
      {isLoggedIn ? (
        <UserDashboard setIsLoggedIn={setIsLoggedIn} />
      ) : (
        <SignInSignUp setIsLoggedIn={setIsLoggedIn} />
      )}
    </div>
  );
}

export default App;

const Navbar = ({ isLoggedIn }) => {
  const first_name = sessionStorage.getItem("first_name");
  const last_name = sessionStorage.getItem("last_name");
  const date_registered = sessionStorage.getItem("date_registered");

  return (
    <div className="navbar_container">
      {isLoggedIn ? (
        <>
          <div className="navbar_container_logo">
            <img src="CSUN.png" alt="logo" />
            <h1>Welcome, {first_name + " " + last_name}</h1>
          </div>
          <h3>Member since {new Date(date_registered).toLocaleDateString()}</h3>
        </>
      ) : (
        <div className="navbar_container_logo">
          <img src="CSUN.png" alt="logo" />
          <h1>CSUN Task-Force</h1>
        </div>
      )}
    </div>
  );
};

const SignInSignUp = ({ setIsLoggedIn }) => {
  const defaultLogin = {
    email: "",
    password: "",
  };

  const defaultsignUp = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  };

  const [login, setLogin] = useState(defaultLogin);
  const [signUp, setSignUp] = useState(defaultsignUp);
  const [signUpMessage, setSignUpMessage] = useState("");
  const [logInMessage, setLogInMessage] = useState("");

  const customOnChangeLogin = (key, e) => {
    setLogInMessage("");
    setLogin({
      ...login,
      [key]: e.target.value,
    });
  };

  const customOnChangeSignUp = (key, e) => {
    setSignUpMessage("");
    setSignUp({
      ...signUp,
      [key]: e.target.value,
    });
  };

  const clearLogin = () => {
    setLogInMessage("");
    setLogin(defaultLogin);
  };

  const clearSignUp = () => {
    setSignUpMessage("");
    setSignUp(defaultsignUp);
  };

  const regEx = /^[a-z]+\.[a-z]+\.[0-9]+@my\.csun\.edu$/g;

  const sign_up_func = () => {
    if (
      !signUp.first_name ||
      !signUp.last_name ||
      !signUp.email ||
      !signUp.password
    ) {
      setSignUpMessage("Please fill out the form properly");
      return;
    }
    let fixedFName = signUp.first_name.trim();
    fixedFName = fixedFName.charAt(0).toUpperCase() + fixedFName.slice(1);
    let fixedLName = signUp.last_name.trim();
    fixedLName = fixedLName.charAt(0).toUpperCase() + fixedLName.slice(1);
    let fixedEmail = signUp.email.trim().toLocaleLowerCase();
    let isCsunEmail = regEx.test(fixedEmail);
    let password = signUp.password;

    if (!isCsunEmail) {
      setSignUpMessage("Email must be by CSUN");
      return;
    }

    if (password.length < 8) {
      setSignUpMessage("Password must no less then 8");
      return;
    }

    fetch(`${_SERVER_LINK}/user-register`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fname: fixedFName,
        lname: fixedLName,
        email: fixedEmail,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((text) => {
        setSignUpMessage(text);
        setTimeout(() => clearSignUp(), 1000);
      });
  };

  const log_in_func = () => {
    let email = login.email.toLocaleLowerCase().trim();
    let password = login.password;

    if (!email || !password) {
      setLogInMessage("Please fill in blanks");
      return;
    }

    fetch(`${_SERVER_LINK}/user-login`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.user_id && data.access_token) {
          sessionStorage.setItem("user_id", data.user_id);
          sessionStorage.setItem("access_token", data.access_token);
          sessionStorage.setItem("first_name", data.first_name);
          sessionStorage.setItem("last_name", data.last_name);
          sessionStorage.setItem("date_registered", data.date_registered);
          setIsLoggedIn(true);
        } else {
          setLogInMessage(data);
        }
      });
  };

  return (
    <div className="sign_in_sign_up_container">
      <div className="sign_in_sign_up_container_column">
        <h1>Sign Up</h1>
        <input
          type="text"
          placeholder="First Name"
          onChange={(e) => customOnChangeSignUp("first_name", e)}
          value={signUp.first_name}
        />
        <input
          type="text"
          placeholder="Last Name"
          onChange={(e) => customOnChangeSignUp("last_name", e)}
          value={signUp.last_name}
        />
        <input
          type="text"
          placeholder="CSUN Email"
          onChange={(e) => customOnChangeSignUp("email", e)}
          value={signUp.email}
        />
        <input
          type="password"
          placeholder="Password (Min 8)"
          onChange={(e) => customOnChangeSignUp("password", e)}
          value={signUp.password}
        />
        <button onClick={sign_up_func} className="container_with_text_icon">
          Sign Up
          <FaUserPlus />
        </button>
        <button onClick={clearSignUp}>Clear</button>
        {signUpMessage && <p>{signUpMessage}</p>}
      </div>
      <div className="sign_in_sign_up_container_column">
        <h1>Login</h1>
        <input
          type="text"
          placeholder="CSUN Email"
          onChange={(e) => customOnChangeLogin("email", e)}
          value={login.email}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => customOnChangeLogin("password", e)}
          value={login.password}
        />
        <button onClick={log_in_func} className="container_with_text_icon">
          Sign In <FaSignInAlt />
        </button>
        <button onClick={clearLogin}>Clear</button>
        {logInMessage && <p>{logInMessage}</p>}
      </div>
    </div>
  );
};

const UserDashboard = ({ setIsLoggedIn }) => {
  const log_out_func = () => {
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("access_token");
    setIsLoggedIn(false);
  };

  const defaultTaskInfoToAdd = {
    title: "",
    description: ``,
    date: "",
    category: "",
  };

  const [categoryToAdd, setCategoryToAdd] = useState("");
  const [categories, setCategories] = useState([]);
  const [taskInfoToAdd, setTaskInfoToAdd] = useState(defaultTaskInfoToAdd);
  const [tasks, setTasks] = useState([]);

  const customOnChangeForAddTask = (key, e) => {
    setTaskInfoToAdd({
      ...taskInfoToAdd,
      [key]: e.target.value,
    });
  };

  useEffect(() => {
    getUserCategories();
    getUserTasks();
  }, []);

  const getUserCategories = () => {
    let user_id = sessionStorage.getItem("user_id");
    let access_token = sessionStorage.getItem("access_token");

    if (!user_id || !access_token) return;

    fetch(`${_SERVER_LINK}/get-user-categories`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id,
        access_token,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setCategories(data.categories);
      });
  };

  const getUserTasks = () => {
    let user_id = sessionStorage.getItem("user_id");
    let access_token = sessionStorage.getItem("access_token");

    if (!user_id || !access_token) return;

    fetch(`${_SERVER_LINK}/get-user-tasks`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id,
        access_token,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTasks(data.tasks);
      });
  };

  const addCategory = () => {
    let user_id = sessionStorage.getItem("user_id");
    let access_token = sessionStorage.getItem("access_token");
    if (!user_id || !access_token) return;

    if (!categoryToAdd) return;

    let fixedCategoryToAdd = categoryToAdd.trim();
    fixedCategoryToAdd =
      fixedCategoryToAdd.charAt(0).toUpperCase() + fixedCategoryToAdd.slice(1);

    fetch(`${_SERVER_LINK}/add-user-category`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id,
        access_token,
        category: fixedCategoryToAdd,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.msg) {
          console.log(data.msg);
          setCategoryToAdd("");
        } else {
          setCategories([...categories, data.addedCategory]);
          setCategoryToAdd("");
        }
      });
  };

  const addTask = () => {
    let user_id = sessionStorage.getItem("user_id");
    let access_token = sessionStorage.getItem("access_token");
    if (!user_id || !access_token) return;

    let fixedTitle = taskInfoToAdd.title.trim();
    let description = taskInfoToAdd.description;
    let date = taskInfoToAdd.date;
    let category = taskInfoToAdd.category;

    if (!fixedTitle || !category) return;

    fetch(`${_SERVER_LINK}/add-user-task`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id,
        access_token,
        title: fixedTitle,
        description,
        date,
        category,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTasks([...tasks, data.addedTask]);
        setTaskInfoToAdd(defaultTaskInfoToAdd);
      });
  };

  const [selectedTab, setSelectedTab] = useState("");

  const customeFilter = () => {
    let sortedTasks = tasks.sort((a, b) => a.id - b.id);
    return sortedTasks.filter(
      (task) => task.category === selectedTab && task.completed !== true
    );
  };

  const customeFilterForCompleted = () => {
    let sortedTasks = tasks.sort((a, b) => a.id - b.id);
    return sortedTasks.filter(
      (task) => task.category === selectedTab && task.completed !== false
    );
  };

  const completeTask = (id) => {
    let user_id = sessionStorage.getItem("user_id");
    let access_token = sessionStorage.getItem("access_token");
    if (!user_id || !access_token) return;

    fetch(`${_SERVER_LINK}/complete-user-task`, {
      method: "put",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id,
        access_token,
        id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        getUserTasks();
      });
  };

  const unCompleteTask = (id) => {
    let user_id = sessionStorage.getItem("user_id");
    let access_token = sessionStorage.getItem("access_token");
    if (!user_id || !access_token) return;

    fetch(`${_SERVER_LINK}/uncomplete-user-task`, {
      method: "put",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id,
        access_token,
        id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        getUserTasks();
      });
  };

  const deleteTask = (id) => {
    let user_id = sessionStorage.getItem("user_id");
    let access_token = sessionStorage.getItem("access_token");
    if (!user_id || !access_token) return;

    fetch(`${_SERVER_LINK}/delete-user-task`, {
      method: "delete",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id,
        access_token,
        id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        getUserTasks();
      });
  };

  const checkNumberOfTasksInCategory = (category) => {
    return tasks.filter((task) => task.category === category).length;
  };

  const deleteCategory = (id) => {
    let user_id = sessionStorage.getItem("user_id");
    let access_token = sessionStorage.getItem("access_token");
    if (!user_id || !access_token) return;

    fetch(`${_SERVER_LINK}/delete-user-category`, {
      method: "delete",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id,
        access_token,
        id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        getUserTasks();
        getUserCategories();
      });
  };

  return (
    <div className="user_dashboard_container">
      <div className="user_dashboard_navbar">
        <h2>Dashboard</h2>
        <button onClick={log_out_func}>Log Out</button>
      </div>
      <div className="user_dashboard_tools">
        <div className="user_dashboard_add_category">
          <h2>Add Category</h2>
          <input
            type="text"
            placeholder="Category to add..."
            value={categoryToAdd}
            onChange={(e) => setCategoryToAdd(e.target.value)}
          />
          <button onClick={addCategory} className="container_with_text_icon">
            Add Category <FaPlus />
          </button>
        </div>
        <div className="user_dashboard_add_task">
          <h2>Add Task</h2>
          <input
            type="text"
            placeholder="Title... (required)"
            value={taskInfoToAdd.title}
            onChange={(e) => customOnChangeForAddTask("title", e)}
          />
          <textarea
            id="description"
            name="description"
            rows="5"
            cols="20"
            placeholder="Desctiption..."
            value={taskInfoToAdd.description}
            onChange={(e) => customOnChangeForAddTask("description", e)}
          ></textarea>
          <input
            type="date"
            value={taskInfoToAdd.date}
            onChange={(e) => customOnChangeForAddTask("date", e)}
          />
          <select
            name="categoryToAdd"
            id="categoryToAdd"
            value={taskInfoToAdd.category}
            onChange={(e) => customOnChangeForAddTask("category", e)}
          >
            <option value="">Select Category *</option>

            {categories.map((category) => {
              return (
                <option value={category.category} key={category.id}>
                  {category.category}
                </option>
              );
            })}
          </select>
          <button onClick={addTask} className="container_with_text_icon">
            Add Task <FaPlus />
          </button>
        </div>
      </div>
      {!categories.length ? null : (
        <div className="user_dashboard_tasks_container">
          <div className="user_dashboard_tasks_categories">
            {categories.map((category) => (
              <button
                key={category.id}
                value={category.category}
                onClick={(e) => setSelectedTab(e.target.value)}
                className={
                  selectedTab === category.category
                    ? "task_category_selected"
                    : "task_category_general_button"
                }
              >
                {category.category}
                {checkNumberOfTasksInCategory(category.category) === 0 ? (
                  <span
                    id={category.id}
                    onClick={(e) => {
                      deleteCategory(e.currentTarget.id);
                    }}
                    className="logo_span"
                  >
                    <FaTrashAlt value={category.id} />
                  </span>
                ) : null}
              </button>
            ))}

            {/*  */}
          </div>
          {!customeFilter().length ? null : (
            <div className="user_dashboard_tasks_view">
              {customeFilter().map((task) => (
                <div key={task.id} className="user_dashboard_tasks_view_task">
                  <div className="user_dashboard_tasks_view_task_left">
                    <h3>{task.title}</h3>
                    <p className="multiline">{task.description}</p>
                    {task.date && (
                      <p>{new Date(task.date).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="user_dashboard_tasks_view_task_right">
                    <button
                      value={task.id}
                      onClick={(e) => {
                        completeTask(e.currentTarget.value);
                      }}
                      className="container_with_text_icon"
                    >
                      <FaCheck />
                    </button>
                    <button
                      value={task.id}
                      onClick={(e) => {
                        deleteTask(e.currentTarget.value);
                      }}
                      className="container_with_text_icon"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!customeFilterForCompleted().length ? null : (
            <div className="user_dashboard_tasks_view">
              {customeFilterForCompleted().map((task) => (
                <div
                  key={task.id}
                  className="user_dashboard_tasks_view_task_completed_container"
                >
                  <div className="user_dashboard_tasks_view_task_completed">
                    <h3>{task.title}</h3>
                    <p className="multiline">{task.description}</p>
                    {task.date && (
                      <p>{new Date(task.date).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="user_dashboard_tasks_view_task_completed_buttons">
                    <button
                      value={task.id}
                      onClick={(e) => unCompleteTask(e.currentTarget.value)}
                      className="container_with_text_icon"
                    >
                      <FaUndo />
                    </button>
                    <button
                      value={task.id}
                      onClick={(e) => deleteTask(e.currentTarget.value)}
                      className="container_with_text_icon"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
