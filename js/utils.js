/**
 * Here we define the helpers for cookies
 */

function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + (days*24*60*60*1000));
  const expires = "expires="+ d.toUTCString();
  const secure = location.protocol === "https" ? ";Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax${secure}`;
}

function getCookie(name) {
  const cname = name + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for (let c of ca) {
    c = c.trim();
    if (c.indexOf(cname) == 0) {
      return c.substring(cname.length, c.length);
    }
  }
  return "";
}

function deleteCookie(name) {
   const secure = location.protocol === "https:" ? ";Secure" : "";
   document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;SameSite=Lax${secure}`;
}