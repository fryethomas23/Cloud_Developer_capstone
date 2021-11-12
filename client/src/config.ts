// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '62du3a8hrh'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'fsnd-thomas.us.auth0.com',            // Auth0 domain
  clientId: 'QqFRYW73NaATC2niA1BrjFIaeJz0W6pr',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
