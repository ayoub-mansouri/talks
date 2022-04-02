import React from "react";
import { useParams } from "react-router-dom";
import { BiSend } from "react-icons/bi";
import { useAppContext } from "../../context";
import { FaUserSecret } from "react-icons/fa";

import style from "./talk_page.module.css";
import Loading from "../../components/loading/loading";
import Navbar from "../../components/navbar/navbar";

const talks_url = "http://localhost:5555/talks/";

function TalkPage() {
  const [loading, setLoading] = React.useState(false);
  const { title } = useParams();
  const [talk, setTalk] = React.useState([]);
  const [comments, setComments] = React.useState([]);
  const [message, setMessage] = React.useState("");
  const { userName, userid } = useAppContext();
  const [found, setFound] = React.useState(false);

  const refFocus = React.useRef();

  const fetchTalk = async (isFirstLoad) => {
    try {
      let response = await fetch(talks_url + title, { credentials: "include" });
      if (response.status >= 400) {
        if (response.status === 403) {
          window.location = "/join";
        }
        if (response.status === 404) {
          window.location = "/notfound";
          setFound(false);
        }
        throw new Error("fetch error");
      }
      let data = await response.json();
      setTalk(data);
      setComments(data.comments);
      setFound(true);
      if (!isFirstLoad) refFocus.current.scrollIntoView();
    } catch (error) {
      console.log(error);
    }
  };
  React.useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;
    const pollTalks = async () => {
      setLoading(true);
      let etag = undefined;
      while (true) {
        let response = null;
        try {
          response = await fetch(talks_url, {
            signal,
            credentials: "include",
            headers: etag
              ? { "If-None-Match": `"${etag}"`, Prefer: "wait=100" }
              : {},
          });
          if (response.status >= 400) {
            if (response.status === 403) {
              window.location = "/join";
            }
            if (response.status === 404) {
              setFound(false);
              window.location = "/notfound";
            }
            throw new Error("fetch error");
          }
        } catch (error) {
          await new Promise((resolve) => setTimeout(() => resolve, 10000));
          continue;
        }
        if (response.status === 304) continue;
        fetchTalk(etag === undefined);
        etag = response.headers.get("etag");
        setLoading(false);
      }
    };
    pollTalks();
    return () => {
      abortController.abort();
    };
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (message) {
      try {
        let response = await fetch(`${talks_url}${title}/comments`, {
          credentials: "include",
          method: "POST",
          body: JSON.stringify({ userid, author: userName, message }),
        });
        if (response.status >= 400) {
          if (response.status === 403) {
            window.location = "/join";
          }
          throw new Error("fetch error");
        }
        setMessage("");
      } catch (error) {
        console.log(error);
      }
    }
  };

  if (loading) return <Loading />;

  if(!found) return <></>;

  return (
    <>
      <Navbar />
      <main className={style.talk}>
        <h2>summary</h2>
        <section className={style.talk_info}>
          <div className={style.summary}>
            <h2>{talk.title}</h2>
            <p>{talk.summary}</p>
          </div>
          <div className={style.presenter}>
            <FaUserSecret />
            <p>{talk.presenter}</p>
          </div>
        </section>
        <h2>chat</h2>
        <div className={style.chatbox}>
          <section className={style.comments}>
            {comments.length < 1 ? (
              <h3>no messages to show</h3>
            ) : (
              comments.map(({ userid: id, author, message }, index) => {
                return (
                  <div
                    key={index}
                    className={userid === id ? style.sent : style.received}
                  >
                    <strong>{author}</strong>
                    <p>{message}</p>
                  </div>
                );
              })
            )}
            <div className={style.focus} ref={refFocus}></div>
          </section>
          <section className={style.send}>
            <form className={style.send_form} onSubmit={sendMessage}>
              <input
                placeholder="Write a message..."
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="submit">
                <BiSend />
              </button>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}

export default TalkPage;
