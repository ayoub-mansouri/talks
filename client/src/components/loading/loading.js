import style from "./loading.module.css";

function Loading() {
  return (
    <div className={style.loading}>
      <div className={style["lds-ellipsis"]}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

export default Loading;
