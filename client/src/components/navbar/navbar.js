import React from "react";
import { Link } from "react-router-dom";
import { FaUserSecret } from "react-icons/fa";
import { useAppContext } from "../../context";

import style from "./navbar.module.css";

function Navbar() {
  const { userName, setUserName } = useAppContext();

  React.useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Anon");
  }, []);

  React.useEffect(() => {
    localStorage.setItem("userName", userName);
  }, [userName]);

  const leave = () => {
    document.cookie = "";
    window.location = "/join";
  };

  return (
    <nav className={style.navbar}>
      <div className={style.username}>
        <FaUserSecret />
        <input
          placeholder="Enter a username"
          value={userName}
          type="text"
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>
      <Link to="/" className={style.btn}>talks</Link>
      <Link to="#" onClick={leave} className={style.leave_btn}>
        leave
      </Link>
    </nav>
  );
}

export default Navbar;
