import axios from "axios";
import _lowerCase from "lodash/lowercase";
import _lowerFirst from "lodash/lowerfirst";
import _capitalize from "lodash/capitalize";
import moment from "moment";
import env from "./environment.json";
import getCurrentUser from "./get_current_user";
import template from "./consent_panel.ejs";
import "./css-toggle-switch.scss";
import "./consent_panel.scss";

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

async function updateConsentStatus(consentId, accepted) {
  const url = `${env.consentServer}/consent/v1/consents/${consentId}`;
  const updates = {
    status: accepted ? "accepted" : "denied",
  };
  return await axios.patch(url, updates, {auth: {username: env.consentAccount, password: env.consentPassword}});
}

function formatUpdatedDateTime(updatedDate) {
  return moment(updatedDate).format("[Last updated at] DD/MM/YYYY [at] h:mm A[.]");
}

async function showConsentPanel() {
  let consents = await getConsents();
  if (consents.length > 0) {
    consents = consents.map((consent) => {
      const title = _capitalize(_lowerCase(consent.definition.id));
      const description = `We use ${_lowerFirst(consent.dataText)} in order ${_lowerFirst(consent.purposeText)}.`;
      const updatedAtDescription = formatUpdatedDateTime(consent.updatedDate);
      return { ...consent, title, description, updatedAtDescription };
    });
    const html = template({ consents: consents });
    $("#consent-panel-container").html(html);
  }
  else {
    $("#consent-panel-container").html("<p>No preferences have been saved yet.</p>");
  }
}

async function onCheckboxChange(evt) {
  const $input = $(evt.target);
  const $consent = $input.parents("[data-consent-id]");
  const checked = $input.is(":checked");
  const consentId = $consent.attr("data-consent-id");
  const updatedConsent = await updateConsentStatus(consentId, checked);
  const updatedAtDescription = formatUpdatedDateTime(updatedConsent.updatedDate);
  $consent.find(".consent-panel__item_updated").text(updatedAtDescription);
}

let needsEvents = true;

function addEventListeners() {
  if (needsEvents) {
    needsEvents = false;
    $("#consent-panel-container").on("change", "input[type=checkbox]", onCheckboxChange);
  }
}

function maybeShowConsentPanel() {
  let retry = true;
  if (typeof($) === "undefined") {
    if (retry) {
      retry = false;
      document.addEventListener("DOMContentLoaded", function() {
        maybeShowConsentPanel();
      });
    }
    return;
  }
  if ($("#consent-panel-container").length > 0) {
    showConsentPanel();
    addEventListeners();
  }
}

export default maybeShowConsentPanel;