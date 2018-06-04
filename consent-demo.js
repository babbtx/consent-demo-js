import "babel-polyfill";
import axios from "axios";
import env from "./environment.json";
import getCurrentUser from "./get_current_user";
import trackPageView from "./track";
import ConsentPrompt from "./consent_prompt";

const consentSubject = getCurrentUser();

/* 
 * For reference, a consent record looks like this:
 * 
 * {
 *     "actor": "username",
 *     "subject": "username",
 *     "audience": "consent-demo",
 *     "definition": {
 *         "currentVersion": "1.0",
 *         "id": "track_browsing_history",
 *         "locale": "en-US",
 *         "version": "1.0"
 *     },
 *     "id": "f0c0ac1d-a493-426d-9211-224255145d28",
 *     "dataText": "...",
 *     "purposeText": "...",
 *     "status": "accepted",
 *     "data": {},
 *     "consentContext": {},
 *     "createdDate": "2018-03-26T18:43:28.616Z",
 *     "updatedDate": "2018-03-26T18:43:28.616Z"
 * }
 */

/*
 * Returns the status of the user's consent to tracking their browsing history.
 * 
 * Consent record lookup API returns all matches by subject and definition,
 * in an array like so:
 * 
 * {
 *   "_embedded": {
 *       "consents": [ { ... }, { ... } ],
 *   }
 *   count: 2,
 *   size: 2
 * }
 * 
 * This function checks whether a record exists and if so returns the status.
 * If there's no record then we return undefined.
 */
async function getConsentStatus() {
  const url = `${env.consentServer}/consent/v1/consents?subject=${consentSubject}&definition=track_browsing_history`;
  const response = await axios.get(url, {auth: {username: env.consentAccount, password: env.consentPassword}});
  if (response.data.count > 0) {
    return response.data._embedded.consents[0].status;
  }
  else {
    return undefined;
  }
}

/*
 * Constructs and saves a consent record with the user's response to a consent prompt.
 */
async function saveConsent(prompt) {
  const url = `${env.consentServer}/consent/v1/consents`;
  const record = {
    definition: {
      id: "track_browsing_history",
      locale: "en-US",
      version: prompt.version,
    },
    subject: consentSubject,
    actor: consentSubject,
    audience: "consent-demo",
    dataText: prompt.dataText,
    purposeText: prompt.purposeText,
    status: prompt.accepted ? "accepted" : "denied",
  };
  return await axios.post(url, record, {auth: {username: env.consentAccount, password: env.consentPassword}});
}

/*
 * Tracks the page view for this user if the user has consented to allowing it.
 *
 * Two important conditions to keep in mind:
 * 1) Don't track the page view unless the user has given consent. Duh.
 * 2) Don't prompt the user if he or she has been prompted before. That's annoying.
 * 
 * We could relax (2) under certain circumstances not demoed here.
 * If the user has previously denied or revoked a consent, but the definition
 * has seen been updated, then we could prompt again. In this case,
 * we'd be comparing the version in the record with the current version of the
 * definition.
 */
 async function maybeTrackBrowsingHistory() {
  const status = await getConsentStatus();
  let accepted;
  if (status) {
    // user has been prompted before.
    accepted = status === "accepted";
  }
  else {
    // no consent record. build a prompt and wait for the user to respond.
    const prompt = new ConsentPrompt("track_browsing_history");
    await prompt.prompt();
    // then save the new record.
    saveConsent(prompt);
    accepted = prompt.accepted;
  }
  // if accepted then we can track the view.
  if (accepted) {
    trackPageView();
  }
}

if (window.location.pathname.startsWith("/products/")) {
  maybeTrackBrowsingHistory();
}