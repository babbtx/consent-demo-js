import axios from "axios";
import env from "./environment.json";
import MicroModal from "micromodal";
import template from "./consent_prompt.ejs";
import "./consent_prompt.scss";

class ConsentPrompt {
  constructor(definition) {
    this.definition = definition;
    this.accepted = false;
  }

  /*
   * Loads the English localization of a consent definition so that we can build a prompt.
   */
  async buildPrompt() {
    const url = `${env.consentServer}/consent/v1/definitions/${this.definition}/localizations/en-US`;
    const response = await axios.get(url, {auth: {username: env.consentAccount, password: env.consentPassword}});
    // remember for later as this is needed to save the consent record
    this.version = response.data.version;
    this.dataText = response.data.dataText;
    this.purposeText = response.data.purposeText;
    // also render the modal html to the page (hidden)
    const html = template({ what: this.dataText, why: this.purposeText });
    if ($("#consent-prompt-modal").length === 0) {
      $("body").append(html);
    }
    else {
      $("#consent-prompt-modal").replaceWith(html);
    }
    // on click of the accept button, store the fact that it was accepted in the DOM
    $("#consent-prompt-modal .consent-prompt-modal__button[data-response=accepted]").on("click", () => {
      $("#consent-prompt-modal").data("accepted", true);
    });
  }

  /*
   * Wraps the modal show with a Promise that gets resolved when the modal is dismissed.
   */
  showPromptWithPromise() {
    return new Promise((resolve, reject) => {
      MicroModal.show("consent-prompt-modal", {
        onClose: resolve,
        disableFocus: true
      });
    });
  }

  async prompt() {
    await this.buildPrompt();
    await this.showPromptWithPromise();
    // retrieve whether it was accepted from the DOM
    this.accepted = $("#consent-prompt-modal").data("accepted");
  }
}

export default ConsentPrompt;