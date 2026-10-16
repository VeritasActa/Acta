/**
 * Describe witness coverage without treating an old post as current service health.
 * These are operator-reported publication records, not an independent check of
 * the external post or a verification of the anchor signature.
 */
export function witnessStatus(latestAnchor, latestWitness, now = Date.now()) {
    const timestamp = value => {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return NaN;
        const parsed = Date.parse(value);
        const day = Date.parse(`${value.slice(0, 10)}T00:00:00Z`);
        // Date.parse normalizes dates such as 31 February; do not publish
        // a healthy status for malformed report timestamps.
        return Number.isFinite(parsed) && Number.isFinite(day)
            && new Date(day).toISOString().slice(0, 10) === value.slice(0, 10) ? parsed : NaN;
    };
    const headTime = timestamp(latestAnchor?.timestamp);
    const witnessedAnchorTime = timestamp(latestWitness?.anchor_timestamp);
    const reportedTime = timestamp(latestWitness?.witnessed_at);
    const hasHeadTime = Number.isFinite(headTime);
    const hasWitnessTime = Number.isFinite(witnessedAnchorTime);
    const hours = milliseconds => Math.round(milliseconds / 3600000 * 10) / 10;

    let status = 'not_reported';
    let latestAnchorReported = null;
    let note = 'No external witness publication has been reported.';
    if (latestWitness) {
        status = 'unknown';
        note = 'A witness publication was reported, but coverage of the latest anchor cannot be determined.';
        if (hasHeadTime && hasWitnessTime && Number.isFinite(reportedTime)
            && headTime <= now && reportedTime <= now && witnessedAnchorTime <= reportedTime
            && witnessedAnchorTime <= headTime) {
            latestAnchorReported = witnessedAnchorTime === headTime;
            status = latestAnchorReported ? 'current' : 'behind';
            note = latestAnchorReported
                ? 'The latest anchor has a reported external publication. The external post has not been checked by this endpoint.'
                : 'An earlier anchor has a reported external publication; the latest anchor is awaiting a witness report. Historical publications remain available.';
        }
    }

    return {
        // Preserve the legacy healthy value only when the latest anchor is
        // covered by a report. Freshness is explicit for newer consumers.
        status: status === 'current' ? 'active' : status,
        freshness: status,
        assessment: 'operator-reported',
        coverage_basis: 'anchor_timestamp',
        latest_anchor_reported: latestAnchorReported,
        latest_anchor_timestamp: latestAnchor?.timestamp || null,
        age_hours: Number.isFinite(reportedTime) && reportedTime <= now ? hours(now - reportedTime) : null,
        anchor_lag_hours: hasHeadTime && hasWitnessTime && witnessedAnchorTime <= headTime
            ? hours(headTime - witnessedAnchorTime) : null,
        note,
    };
}
