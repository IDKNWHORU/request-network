import Link from "next/link";
import Search from "./search";
import styles from "./page.module.css";
import RequestContent from "./content";

export default function RetrieveAUsersRequestsPage({ searchParams }) {
  return (
    <main className={styles.main}>
      <aside>
        <h3>
          <Link href="/">Create a request</Link>
        </h3>
      </aside>
      <h3>Retrieve a user's requests</h3>
      <Search />
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Tiemstamp</th>
            <th>Request Id</th>
            <th>Payer</th>
            <th>Currency</th>
            <th>Expected Amount</th>
            <th>Reason</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(searchParams).length === 0 ||
          Object.values(searchParams)[0].length === 0 ? null : (
            <RequestContent key={searchParams.user} user={searchParams.user} />
          )}
        </tbody>
      </table>
    </main>
  );
}
