// Runs the SQL terminal's AlaSQL off the main thread, so a runaway cross join
// can be killed (worker.terminate()) instead of freezing the tab.
import alasql from "alasql";
import { registerTables } from "./sql-tables";

registerTables(alasql);

self.onmessage = (e: MessageEvent<{ id: number; sql: string }>) => {
	const { id, sql } = e.data;
	try {
		self.postMessage({ id, rows: alasql(sql) });
	} catch (err) {
		self.postMessage({ id, error: err instanceof Error ? err.message : String(err) });
	}
};
