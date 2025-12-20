export function normalizeModelInput(input: string): string {
    if (!input) return "";

    // 1. Convert to Uppercase
    let normalized = input.toUpperCase();

    // 2. Remove noise: spaces, dots, underscores
    // Note: We keep dashes '-' as they are often significant, but we remove other separators.
    normalized = normalized.replace(/[\s._]/g, "");

    // 3. Suffix Stripping (Common Patterns)

    // Mitsubishi: -U1, -U2, -A (e.g., MUZ-FS12-U1 -> MUZ-FS12)
    // We strictly match these at the end of the string
    normalized = normalized.replace(/-[UA][12]?$/, "");

    // Lennox: -P
    normalized = normalized.replace(/-P$/, "");

    // Carrier: -3
    normalized = normalized.replace(/-3$/, "");

    return normalized;
}
