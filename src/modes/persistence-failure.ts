import { sanitizeText } from "@oh-my-pi/pi-utils";
import { replaceTabs, shortenPath, TRUNCATE_LENGTHS, truncateToWidth } from "@oh-my-pi/pi-tui-zh/render/render-utils";
import type { SessionPersistenceNotice } from "../session/session-manager";

/**
 * First-failure notice. The store keeps the unlanded entries in memory and
 * retries the whole transcript on the next write, so this reports a retryable
 * condition and claims nothing about durability — the write may still land.
 * `sanitizeText` leaves tabs and newlines intact, so both are normalized here
 * to keep the result on one line.
 */
export function formatPersistenceFailure(message: string): string {
	const detail = truncateToWidth(replaceTabs(sanitizeText(message)).replace(/[\r\n]+/g, " "), TRUNCATE_LENGTHS.LINE);
	return `会话持久化失败：${detail}。写入会自动重试；未保存的条目会留在内存中，直到存储重新接受它们。`;
}

/**
 * Teardown-time durability claim, emitted only while the store failure is
 * still latched at dispose: the retry never landed, so the transcript is not
 * durable and the in-memory entries are gone with the process.
 */
export function formatPersistenceDurabilityFailure(message: string): string {
	const detail = truncateToWidth(replaceTabs(sanitizeText(message)).replace(/[\r\n]+/g, " "), TRUNCATE_LENGTHS.LINE);
	return `关闭时会话持久化仍在失败：${detail}。会话记录无法可靠保存；未保存的条目将丢失。`;
}

/**
 * A {@link SessionPersistenceNotice}: saving continues, so this claims no
 * failure. Not truncated, because the notice names the session files the user
 * may need to find.
 */
export function formatPersistenceNotice(notice: SessionPersistenceNotice): string {
	const from = shortenPath(notice.from);
	const to = shortenPath(notice.to);
	let message: string;
	switch (notice.reason) {
		case "open-elsewhere":
			message = `Session ${from} is open for writing in another omp process, so this session now saves to ${to} instead of mixing its entries into that file.`;
			break;
		case "replaced":
			message = `Session ${from} changed on disk and no longer reads as this session; it is left untouched and this session now saves to ${to}.`;
			break;
		case "contested":
			message = `Another program kept writing to session ${from}; it is left to that writer and this session now saves to ${to}.`;
			break;
	}
	return replaceTabs(sanitizeText(message)).replace(/[\r\n]+/g, " ");
}
