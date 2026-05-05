export function normalizeText(input: string | null | undefined): string {
	if (!input) return "";
	return input
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, " ")
		.replace(/\s+/g, " ");
}

export function tokenizeQuery(input: string | null | undefined): string[] {
	const normalized = normalizeText(input);
	if (!normalized) return [];
	return normalized.split(" ").filter((token) => token.length > 1);
}

export function toNumber(
	value: string | null | undefined,
	fallback: number,
): number {
	if (!value) return fallback;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

export function startOfDayUtc(date: Date): Date {
	return new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
	);
}

export function endOfDayUtc(date: Date): Date {
	return new Date(
		Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
			23,
			59,
			59,
			999,
		),
	);
}

export function buildFiltersHash(input: Record<string, unknown>): string {
	const serialized = JSON.stringify(input, Object.keys(input).sort());
	let hash = 0;
	for (let i = 0; i < serialized.length; i += 1) {
		hash = (hash << 5) - hash + serialized.charCodeAt(i);
		hash |= 0;
	}
	return `${hash}`;
}
