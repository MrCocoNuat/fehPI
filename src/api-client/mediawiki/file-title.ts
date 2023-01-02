
const transliteration = {
    "Á": "A", "À": "A", "Â": "A", "Ä": "A", "Ǎ": "A", "Ă": "A", "Ā": "A", "Ã": "A", "Å": "A", "Ą": "A",
    "á": "a", "à": "a", "â": "a", "ä": "a", "ǎ": "a", "ă": "a", "ā": "a", "ã": "a", "å": "a", "ą": "a", "ắ": "a", /*"ă":"a",*/ "ằ": "a", /*"ắ":"a",*/ "ẳ": "a", "ẵ": "a", "ặ": "a", /*"â":"a",*/ "ầ": "a", "ẩ": "a", "ẫ": "a", "ấ": "a", "ậ": "a",
    "Æ": "Ae", "Ǣ": "Ae", "Ǽ": "Ae",
    "æ": "ae", "ǣ": "ae", "ǽ": "ae",
    "Ć": "C", "Ċ": "C", "Ĉ": "C", "Č": "C", "Ç": "C",
    "ć": "c", "ċ": "c", "ĉ": "c", "č": "c", "ç": "c",
    "Ď": "D", "Đ": "D", "Ḍ": "D", "Ð": "D", "Ḑ": "D",
    "ď": "d", "đ": "d", "ḍ": "d", "ð": "d", "ḑ": "d",
    "É": "E", "È": "E", "Ė": "E", "Ê": "E", "Ë": "E", "Ě": "E", "Ĕ": "E", "Ē": "E", "Ẽ": "E", "Ę": "E", "Ẹ": "E", "Ɛ": "E", "Ǝ": "E", "Ə": "E", "Ề": "E", "Ể": "E", "Ễ": "E", "Ế": "E", "Ệ": "E",
    "é": "e", "è": "e", "ė": "e", "ê": "e", "ë": "e", "ě": "e", "ĕ": "e", "ē": "e", "ẽ": "e", "ę": "e", "ẹ": "e", "ɛ": "e", "ǝ": "e", "ə": "e", "ề": "e", "ể": "e", "ễ": "e", "ế": "e", "ệ": "e",
    "Ġ": "G", "Ĝ": "G", "Ğ": "G", "Ģ": "G",
    "ġ": "g", "ĝ": "g", "ğ": "g", "ģ": "g",
    "Ĥ": "H", "Ħ": "H", "Ḥ": "H",
    "ĥ": "h", "ħ": "h", "ḥ": "h", "ḩ": "h",
    "İ": "I", "Í": "I", "Ì": "I", "Î": "I", "Ï": "I", "Ǐ": "I", "Ĭ": "I", "Ī": "I", "Ĩ": "I", "Į": "I", "Ị": "I",
    "ı": "i", "í": "i", "ì": "i", "î": "i", "ï": "i", "ǐ": "i", "ĭ": "i", "ī": "i", "ĩ": "i", "į": "i", "ị": "i",
    "Ĵ": "J",
    "ĵ": "j",
    "Ķ": "K",
    "ķ": "k",
    "Ĺ": "L", "Ŀ": "L", "Ľ": "L", "Ļ": "L", "Ł": "L", "Ḷ": "L", "Ḹ": "L",
    "ĺ": "l", "ŀ": "l", "ľ": "l", "ļ": "l", "ł": "l", "ḷ": "l", "ḹ": "l",
    "Ṃ": "M",
    "ṃ": "m",
    "Ń": "N", "Ň": "N", "Ñ": "N", "Ņ": "N", "Ṇ": "N", "Ŋ": "N",
    "ń": "n", "ň": "n", "ñ": "n", "ņ": "n", "ṇ": "n", "ŋ": "n",
    "Ó": "O", "Ò": "O", "Ô": "O", "Ö": "O", "Ǒ": "O", "Ŏ": "O", "Ō": "O", "Õ": "O", "Ǫ": "O", "Ọ": "O", "Ő": "O", "Ø": "O", "Ɔ": "O",
    "ó": "o", "ò": "o", "ô": "o", "ö": "o", "ǒ": "o", "ŏ": "o", "ō": "o", "õ": "o", "ǫ": "o", "ọ": "o", "ő": "o", "ø": "o", "ɔ": "o", "ơ": "o", "ồ": "o",
    "Œ": "Oe",
    "œ": "oe",
    "Ŕ": "R", "Ř": "R", "Ŗ": "R", "Ṛ": "R", "Ṝ": "R",
    "ŕ": "r", "ř": "r", "ŗ": "r", "ṛ": "r", "ṝ": "r",
    "Ś": "S", "Ŝ": "S", "Š": "S", "Ş": "S", "Ș": "S", "Ṣ": "S",
    "ś": "s", "ŝ": "s", "š": "s", "ş": "s", "ș": "s", "ṣ": "s",
    "ß": "ss",
    "Ť": "T", "Ţ": "T", "Ț": "T", "Ṭ": "T",
    "ť": "t", "ţ": "t", "ț": "t", "ṭ": "t",
    "Þ": "Th",
    "þ": "th",
    "Ú": "U", "Ù": "U", "Û": "U", "Ü": "U", "Ǔ": "U", "Ŭ": "U", "Ū": "U", "Ũ": "U", "Ů": "U", "Ų": "U", "Ụ": "U", "Ű": "U", "Ǘ": "U", "Ǜ": "U", "Ǚ": "U", "Ǖ": "U",
    "ú": "u", "ù": "u", "û": "u", "ü": "u", "ǔ": "u", "ŭ": "u", "ū": "u", "ũ": "u", "ů": "u", "ų": "u", "ụ": "u", "ű": "u", "ǘ": "u", "ǜ": "u", "ǚ": "u", "ǖ": "u",
    "Ŵ": "W",
    "ŵ": "w",
    "Ý": "Y", "Ŷ": "Y", "Ÿ": "Y", "Ỹ": "Y", "Ȳ": "Y",
    "ý": "y", "ŷ": "y", "ÿ": "y", "ỹ": "y", "ȳ": "y",
    "Ź": "Z", "Ż": "Z", "Ž": "Z",
    "ź": "z", "ż": "z", "ž": "z",
}

export function asciify(unicodeStr: string) {

    // These particular instances of "-" are transformed into " "???
    // but others are not, like Follow-Up Rind or Anna: Wealth-Wisher
    if (unicodeStr.startsWith("Null Follow-Up") ||
        unicodeStr.startsWith("Null C-Disrupt")
    ) unicodeStr = unicodeStr.replaceAll("-", " ");

    // in particular, the + character has 2 uses:
    //   mythic remix Skills (and + inheritable weapons but they are unsupported) have a + at the end, need to be replaced with " Plus"
    //   Passive stat + have + in the middle and need to be replaced with "Plus " 
    unicodeStr = unicodeStr.replaceAll("+", (unicodeStr.endsWith("+")? " Plus" : "Plus "));

    // The FEH mediawiki stores all files with names exclusively in ASCII, so some manual transliterations are needed 
    Object.entries(transliteration).forEach(([before, after]) => unicodeStr = unicodeStr.replaceAll(before, after));

    // some additional special characters too
    unicodeStr = unicodeStr.replaceAll(":", "")
        .replaceAll("/", " ")
        .replaceAll("!", "")
        .replaceAll("(", "")
        .replaceAll(")", "")
        .replaceAll(`'`, ``)
        .replaceAll(`"`, ``)
    return unicodeStr;
}

export const TITLE_SEPARATOR = "|";