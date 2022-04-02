import React from "react";
import { FaTimes } from "react-icons/fa";
import { useAppContext } from "../../context";

import style from "./new_talk_modal.module.css";

const talks_url = "http://localhost:5555/talks/";

function getUsername() {
  return localStorage.getItem("userName") || "Anon";
}

function NewTalkModal({ show }) {
  const [title, setTitle] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const { setShowNewTalkModal, userid } = useAppContext();
  const refForm = React.useRef();

  const closeModal = () => {
    setShowNewTalkModal(false);
    setTitle("");
    setSummary("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title && summary) {
      try {
        let response = await fetch(`${talks_url}${title}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userid,
            presenter: getUsername(),
            summary: summary,
          }),
        });
        if (response.status >= 400) {
          if (response.status === 403) {
            window.location = "/join"
          }
          throw new Error("fetch error");
        }
        closeModal();
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div className={show ? style.show : style.overlay}>
      <div className={style.modal}>
        <button className={style.close} onClick={closeModal}>
          <FaTimes />
        </button>
        <h2>new talk</h2>
        <form className={style.form} ref={refForm} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />
          <textarea
            placeholder="Summary"
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value);
            }}
          ></textarea>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default NewTalkModal;
