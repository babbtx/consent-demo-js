import axios from "axios";
import _lowerCase from "lodash/lowercase";
import _lowerFirst from "lodash/lowerfirst";
import _capitalize from "lodash/capitalize";
import env from "./environment.json";
import getCurrentUser from "./get_current_user";
import template from "./consent_panel.ejs";

const consentSubject = getCurrentUser();

async function getConsents() {
  const url = `${env.consentServer}/consent/v1/consents?subject=${consentSubject}`;
  const response = await axios.get(url, {auth: {username: env.consentAccount, password: env.consentPassword}});
  if (response.data.count > 0) {
    return response.data._embedded.consents;
  }
  else {
    return [];
  }
}

async function showConsentPanel() {
  let consents = await getConsents();
  if (consents.length > 0) {
    consents = consents.map((consent) => {
      const description = `We use ${_lowerFirst(consent.dataText)} in order ${_lowerFirst(consent.purposeText)}.`;
      const title = _capitalize(_lowerCase(consent.definition.id));
      return { ...consent, description, title };
    });
    const html = template({ consents: consents });
    $("#consent-panel-container").html(html);
  }
}

function maybeShowConsentPanel() {
  if ($("#consent-panel-container").length > 0) {
    showConsentPanel();
  }
}

export default maybeShowConsentPanel;