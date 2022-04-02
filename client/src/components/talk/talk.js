import React from "react";
import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { useAppContext } from "../../context";

import style from "./talk.module.css";

const talks_url = "http://localhost:5555/talks/";

function Talk({ talk: { userid:id, title, presenter } }) {
  const { userid } = useAppContext();

  const removeTalk = async () => {
    try {
      let response = await fetch(talks_url + title, { method: "DELETE" });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <article className={style.talk}>
      <div className={style.peek}>
        <h2>{title}</h2>
        <h3>
          presented by <span>{presenter}</span>
        </h3>
        <Link to={`/talk/${title}`}>join the descussion</Link>
      </div>
      {userid === id && (
        <button onClick={removeTalk}>
          <FaTrash />
        </button>
      )}
    </article>
  );
}

export default Talk;
