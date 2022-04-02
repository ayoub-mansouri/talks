import style from "./notfound_page.module.css";
import notfoundImage from "./notfound.svg";
import Navbar from "../../components/navbar/navbar";

function NotFountPage() {
  return (
    <>
      <Navbar />
      <div className={style.notfound}>
        <img src={notfoundImage} alt="" />
      </div>
    </>
  );
}

export default NotFountPage;
