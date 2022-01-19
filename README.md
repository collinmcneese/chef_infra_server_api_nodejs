# chef_infra_server_api_nodejs

Reference repository for interacting with a Chef Infra Server API using Node.js.  Other community packages exist which reference how to do this with Node.js but they make use of external packages for different parts of the operation.  The purpose of this repository is to use only native Node.js 12+ functions to communicate with a Chef Infra Server API, allowing for easily portable code which can be used as a plugin for other operations.

## app.js

Reference file with minimal set of functions exported to use for API calls.

Example using `app.js`:

```js
const app = require('./app');

// Client Functions
app.ClientCreate('object_name', 'infraserver.fqdn', 'organization_name', 'chef_api_client_name', 'chef_api_client_key');
app.ClientGet('object_name', 'infraserver.fqdn', 'organization_name', 'chef_api_client_name', 'chef_api_client_key');
app.ClientDelete('object_name', 'infraserver.fqdn', 'organization_name', 'chef_api_client_name', 'chef_api_client_key');

// Node Functions
app.NodeCreate('object_name', {policy_name: 'some_policy', policy_group: 'some_group'}, 'infraserver.fqdn', 'organization_name', 'chef_api_client_name', 'chef_api_client_key');
app.NodeGet('object_name', 'infraserver.fqdn', 'organization_name', 'chef_api_client_name', 'chef_api_client_key');
app.NodeDelete('object_name', 'infraserver.fqdn', 'organization_name', 'chef_api_client_name', 'chef_api_client_key');
```
