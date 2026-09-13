import {
  CODING_WORD_SOURCE,
  RANDOM_WORD_SOURCE,
} from "../constants/Constants";

const PARAM_KEYS = {
  seed: "s",
  language: "l",
  difficulty: "d",
  timer: "t",
  number: "n",
  symbol: "sym",
  wordSource: "ws",
};

export const createChallengeUrl = ({ seed, language, difficulty, timer, numberAddOn, symbolAddOn, wordSource }) => {
  const params = new URLSearchParams();
  params.set(PARAM_KEYS.seed, seed);
  params.set(PARAM_KEYS.language, language === "CHINESE_MODE" ? "cn" : "en");
  params.set(PARAM_KEYS.difficulty, difficulty === "hard" ? "h" : "n");
  params.set(PARAM_KEYS.timer, String(timer));
  if (numberAddOn) params.set(PARAM_KEYS.number, "1");
  if (symbolAddOn) params.set(PARAM_KEYS.symbol, "1");
  if (wordSource === CODING_WORD_SOURCE) {
    params.set(PARAM_KEYS.wordSource, "c");
  }
  // Challenge URLs no longer embed the active custom word list. Allowing
  // arbitrary user-supplied vocabulary to ride on a link means anyone could
  // seed offensive / spammy / off-topic word sets into other people's tests
  // simply by sharing a URL — we have no way to moderate it. Built-in word
  // sources are deterministic and known-safe, so only the seed + standard
  // mode params travel.
  return {
    url: `${window.location.origin}${window.location.pathname}#/?${params.toString()}`,
    seed,
  };
};

export const parseChallengeParams = () => {
  const hashQueryIndex = window.location.hash.indexOf("?");
  const hashParams = hashQueryIndex === -1
    ? new URLSearchParams()
    : new URLSearchParams(window.location.hash.slice(hashQueryIndex + 1));
  const legacyParams = new URLSearchParams(window.location.search);
  const params = hashParams.has(PARAM_KEYS.seed) ? hashParams : legacyParams;
  const seed = params.get(PARAM_KEYS.seed);
  if (!seed) return null;

  const langParam = params.get(PARAM_KEYS.language);
  const diffParam = params.get(PARAM_KEYS.difficulty);
  const wordSource = params.get(PARAM_KEYS.wordSource) === "c"
    ? CODING_WORD_SOURCE
    : RANDOM_WORD_SOURCE;

  // Note: the historical `wl` (word list) param is intentionally ignored
  // here. Old links generated before this change will simply fall back to
  // the built-in random words for the chosen language — they still work,
  // they just don't carry custom vocabulary anymore.
  return {
    seed,
    language: wordSource === CODING_WORD_SOURCE || langParam !== "cn"
      ? "ENGLISH_MODE"
      : "CHINESE_MODE",
    difficulty: diffParam === "h" ? "hard" : "normal",
    timer: parseInt(params.get(PARAM_KEYS.timer) || "60", 10),
    numberAddOn: params.get(PARAM_KEYS.number) === "1",
    symbolAddOn: params.get(PARAM_KEYS.symbol) === "1",
    wordSource,
  };
};

export const clearChallengeParams = () => {
  window.history.replaceState({}, "", `${window.location.pathname}#/`);
};
