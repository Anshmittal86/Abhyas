export function logEvent(eventType, details) {
	console.log(`[Auth Event] ${eventType} - `, JSON.stringify(details));
}
