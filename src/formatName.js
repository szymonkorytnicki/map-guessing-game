export function formatName(str) {
  return startLowercase(str.replaceAll(/ /g, ""));
}

function startLowercase(str) {
  return str[0].toLowerCase() + str.slice(1);
}
