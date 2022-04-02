import React from "react";
import { useAppContext } from "../../context";
import { FaUserSecret } from "react-icons/fa";

import style from "./join_page.module.css";

const join_url = "http://localhost:5555/join";

function JoinPage() {
  const { userName, setUserName } = useAppContext();

  React.useEffect(() => {
    setUserName(localStorage.getItem("userName") || "");
  }, []);

  React.useEffect(() => {
    localStorage.setItem("userName", userName);
  }, [userName]);

  const join = async (e) => {
    e.preventDefault();
    if(!userName) return;
    await fetch(join_url, { credentials: "include" });
    window.location = "/";
  };
  return (
    <section className={style.form_container}>
      <h1>join</h1>
      <form className={style.form}>
        <div className={style.username}>
          <FaUserSecret />
          <input
            placeholder="Enter a username"
            value={userName}
            type="text"
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <button type="submit" onClick={join}>
          join
        </button>
      </form>
    </section>
  );
}

export default JoinPage;
