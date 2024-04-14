"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Search() {
  const router = useRouter();

  const handleSearchUser = (formData) => {
    router.replace(`retrieve-a-users-requests?user=${formData.get("user")}`);
  };

  return (
    <form className={styles.form} action={handleSearchUser}>
      <label htmlFor="user">users</label>
      <input type="text" name="user" id="user" />
      <button type="submit">find</button>
    </form>
  );
}
