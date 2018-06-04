import Cookies from "js-cookie";
import uuidv4 from "uuid/v4";

/*
 * Export a function that returns the current user,
 * to be used as the subject of the consent.
 * 
 * This placeholder function stores/retrieves a UUID from a browser cookie.
 * 
 * Imagine hooking this up to the logged in username,
 * or a browser fingerprint for which the company also
 * collects other user-identifying information like zip code
 * and IP address.
 */
export default () => {
  let subject = Cookies.get("consent_subject");
  if (!subject) {
    subject = uuidv4();
    Cookies.set("consent_subject", subject);
  }
  return subject;
}
