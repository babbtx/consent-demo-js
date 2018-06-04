import axios from "axios";
import env from "./environment.json";
import MicroModal from "micromodal";

const html =
`<div id="consent-prompt-modal" class="consent-prompt-modal" aria-hidden="true">
  <div class="consent-prompt-modal__overlay" tabindex="-1" data-micromodal-close>
    <div class="consent-prompt-modal__container" role="dialog" aria-modal="true" aria-labelledby="consent-prompt-modal-title" >
      <header class="consent-prompt-modal__header">
        <h2 id="consent-prompt-modal-title" class="consent-prompt-modal__title">
          May we &hellip;
        </h2>
        <button class="consent-prompt-modal__close" aria-label="Close modal" data-micromodal-close></button>
      </header>
      <main class="consent-prompt-modal__body">
        We need your permission to track and keep data related to you.
        <div>
          <div class="consent-prompt-modal__body_title">
            What do we need ?
          </div>
          <div id="consent-prompt-modal-body-what">What</div>
        </div>
        <div>
          <div class="consent-prompt-modal__body_title">
            Why do we need it ?
          </div>
          <div id="consent-prompt-modal-body-why">Why</div>
        </div>
      </main>
      <footer class="consent-prompt-modal__footer">
        <button class="consent-prompt-modal__button" data-response="accepted" data-micromodal-close>Yes</button>
        <button class="consent-prompt-modal__button" data-micromodal-close>No</button>
      </footer>
    </div>
  </div>
</div>`;

class ConsentPrompt {
  constructor(definition) {
    this.definition = definition;
    this.accepted = false;
    ConsentPrompt.init();
  }

  static init() {
    ConsentPrompt.acceptedClicked = false;
    if ($("#consent-prompt-modal").length === 0) {
      $("body").append(html);
      $("#consent-prompt-modal .consent-prompt-modal__button[data-response=accepted]").on("click", () => {
        ConsentPrompt.acceptedClicked = true;
      });
    }
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
    // also put the text into the modal
    $("#consent-prompt-modal-body-what").text(this.dataText);
    $("#consent-prompt-modal-body-why").text(this.purposeText);
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
    ConsentPrompt.acceptedClicked = false;
    await this.showPromptWithPromise();
    this.accepted = ConsentPrompt.acceptedClicked;
  }
}

export default ConsentPrompt;