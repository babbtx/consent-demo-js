# Consent Demo

This is a small demo of using the PingDirectory consent API from Javascript.
The demo integrates with a Shopify store, prompting the shopper for whether
the store can track his or her browsing behavior.

## Using the API

The consent API is used in three places in this project.

### Capturing and querying the consent record

Before we can track the user's page visits we need to make sure we have
the user's permission. We use the consent API to
check whether the browsing user has given consent by checking
a _consent record_.

In [consent-demo.js](consent-demo.js) we use the API to get a consent record
specific for the browsing user and check that record's state.

If the consent record doesn't exist, then we need to prompt the user
to give or deny consent.

### Building a consent prompt

Developers don't want to be making frequent updates to language or maintaining
language in sync across multiple applications like web and mobile.
Therefore the consent API provides _consent definitions_ including 
_consent localizations_ to centralize the terms that are 
presented to the user when asking for consent.

In [consent_prompt.js](consent_prompt.js) we use the API to get the consent
prompt language and present a modal to the user.

### Building a privacy dashboard

People like to change their minds. Maintaining trust with your users means
giving them the option to review and update their privacy settings.

In [consent_panel.js](consent_panel.js) we use the API to retrieve all consent
records for the user and display them in the page alongside toggle switches.
If the user toggles the privacy settings, we use the API to update the record
at the server.

## Demo

### Why Shopify?

I wanted a good looking website with a somewhat realistic consent use case.
From a previously life I knew that Shopify made it pretty easy to test with
a demo environment full of pretty demo product inventory.

### Demoware

I cut a couple of corners in building this demo.

1. I'm authenticating with the consent API using a service account rather than
as the user. Under most circumstances, you want to prompt identified users for
consent rather than casual browsers of your site, at which time you will have
an authenticated user for which you can get an OAuth token. With an authenticated
user, the consent API will use an identity mapper to link the consent records
to real users in the directory. I didn't try to figure out how Shopify
exposes the logged in shopper, if at all.

1. Linking directly from the theme in Shopify is not the way someone would
do something like this for real. You'd probably offer a service like this
as an app in the Shopify app store. That would be able to drop into any store
regardless of theme.

1. I'm not actually saving the page visits anywhere.

## Config, Build, Play

### On your own

1. Follow the product documentation for configuring the PingDirectory consent service and PingFederate.
1. Customize `environment.json` and `consent-demo.dsconfig`.
1. Import `consent-demo.dsconfig`.
1. Build the project with `npm run build`.
1. Link the stylesheet `dist/consent-demo.css` from your demo Shopify store theme.
1. Link the built Javascript `dist/consent-demo.js` from your demo Shopify store theme.

### With my demo store

Feel free to demo with my Shopify store!

1. Go to [my demo store](https://babb-consent.ping-eng.com) and access the store with the password `demo`.
1. Open up the browser's developer tools and click the network tab.
1. Browse the catalog and view any product page.
1. In the developer tools you can see API requests for consent definitions and consent records.
1. Login as a user and go to the user profile page.
1. Toggle the consent record state and go back to browse more products.
