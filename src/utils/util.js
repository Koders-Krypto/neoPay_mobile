export function Truncate(fullStr = "", strLen = 8, middleStr = "...") {
    if (fullStr.length <= strLen) return fullStr.toString();
    const midLen = middleStr.length;
    const charsToShow = strLen - midLen;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);
    return (
        fullStr.toString().substring(0, frontChars) +
        middleStr +
        fullStr.toString().substring(fullStr.length - backChars)
    );
}

export function shortenHex(hexString, length) {
    if (hexString.startsWith("0x")) {
        hexString = hexString.slice(2);
    }

    if (hexString.length <= length) {
        return `0x${hexString}`;
    }

    const prefix = hexString.substring(0, length / 2);
    const suffix = hexString.substring(hexString.length - length / 2);
    return `0x${prefix}...${suffix}`;
}

export function truncateNumber(number, decimalPlaces) {
    const multiplier = 10 ** decimalPlaces;
    return Math.trunc(number * multiplier) / multiplier;
}