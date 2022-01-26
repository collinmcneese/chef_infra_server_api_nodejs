// Example handler that can be used with vRealize 8 as a nodeJS action to load local example functions
// This is a reference file only

// The contents of this file could be loaded as a custom Action within vRealize 8 Orchestrator using nodeJS and then configured with corresponding inputs.
// See `exports.handler` section near the bottom of this file

// -------------------------------
// Chef Infra Server API Functions
// -------------------------------

const https = require('https');
const crypto = require('crypto');
const url = require('url');

function sha1(string) {
  return crypto.createHash('sha1').update(string).digest('base64');
}

function chefInfraAPIHeaders(auth, config) {
  var bodyHash = sha1(config.body ? JSON.stringify(config.body) : '');
  var pathHash = sha1(url.parse(config.uri).pathname);
  var timestamp = new Date().toISOString().slice(0, -5) + 'Z';
  var user = auth.user;

  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Host: config.hostname,
    'X-Chef-Version': '17.99.99',
    'X-Ops-Content-Hash': bodyHash,
    'X-Ops-Sign': 'algorithm=sha1;version=1.0;',
    'X-Ops-Timestamp': timestamp,
    'X-Ops-UserId': user,
  };

  // Encrypted Canonical Header contents which are appended to regular Headers as 'X-OPS-AUTHORIZATION-' lines
  // https://docs.chef.io/server/api_chef_server/#canonical-header-format-10-using-sha-1
  var canonicalHeader = 'Method:' + config.method + '\n' +
    'Hashed Path:' + pathHash + '\n' +
    'X-Ops-Content-Hash:' + bodyHash + '\n' +
    'X-Ops-Timestamp:' + timestamp + '\n' +
    'X-Ops-UserId:' + user;

  var signedCanonicalReq = crypto.privateEncrypt(auth.key, Buffer.from(canonicalHeader, 'utf-8')).toString('base64');

  signedCanonicalReq.match(/.{1,60}/g).forEach(function(hash, line) {
    headers['X-OPS-AUTHORIZATION-' + (line + 1)] = hash;
  });

  return headers;
};

// HTTPS Request Function used by exports
function httpsRequest(httpsRequestOptions, bodyData, callback) {
  let data = '';
  var req = https.request(httpsRequestOptions, (res) => {
    res.on('data', chunk => {
      data += chunk;
    });
    res.on('end', () => {
      // console.log(JSON.parse(data));
      callback(JSON.parse(data));
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.write(JSON.stringify(bodyData));

  req.end();
}

// Client Functions
// https://docs.chef.io/server/api_chef_server/#clients
function ClientGet(client, chef_api_server, chef_api_org, chef_api_client_name, chef_api_client_key, callback) {
  var chef_api_server_url = url.parse('https://' + chef_api_server + '/organizations/' + chef_api_org + '/clients/' + client);

  var httpsRequestOptions = {
    hostname: chef_api_server_url.host,
    port: chef_api_server_url.port,
    path: chef_api_server_url.path,
    method: 'GET',
    headers: chefInfraAPIHeaders({
      user: chef_api_client_name,
      key: chef_api_client_key,
    },
    {
      hostname: chef_api_server_url.host,
      body: '',
      method: 'GET',
      uri: chef_api_server_url.path,
    }),
  };

  httpsRequest(httpsRequestOptions, '', function(response){
    // console.log(response);
    callback(response);
  });

};

function ClientCreate(name, chef_api_server, chef_api_org, chef_api_client_name, chef_api_client_key, callback) {
  var chef_api_server_url = url.parse('https://' + chef_api_server + '/organizations/' + chef_api_org + '/clients');
  var bodyData = {
    name: name,
    clientname: name,
    create_key: true,
    validator: false,
  };

  var httpsRequestOptions = {
    hostname: chef_api_server_url.host,
    port: chef_api_server_url.port || 443,
    path: chef_api_server_url.path,
    method: 'POST',
    headers: chefInfraAPIHeaders({
      user: chef_api_client_name,
      key: chef_api_client_key,
    },
    {
      body: bodyData,
      hostname: chef_api_server_url.host,
      method: 'POST',
      uri: chef_api_server_url.path,
    }),
  };

  httpsRequest(httpsRequestOptions, bodyData, function(response){
    // console.log(response);
    callback(response);
  });
};

function ClientDelete(name, chef_api_server, chef_api_org, chef_api_client_name, chef_api_client_key, callback) {
  var chef_api_server_url = url.parse('https://' + chef_api_server + '/organizations/' + chef_api_org + '/clients/' + name);

  var httpsRequestOptions = {
    hostname: chef_api_server_url.host,
    port: chef_api_server_url.port,
    path: chef_api_server_url.path,
    method: 'DELETE',
    headers: chefInfraAPIHeaders({
      user: chef_api_client_name,
      key: chef_api_client_key,
    },
    {
      body: '',
      hostname: chef_api_server_url.host,
      method: 'DELETE',
      uri: chef_api_server_url.path,
    }),
  };

  httpsRequest(httpsRequestOptions, '', function(response){
    // console.log(response);
    callback(response);
  });
};

// Node functions
// https://docs.chef.io/server/api_chef_server/#nodes
function NodeGet(name, chef_api_server, chef_api_org, chef_api_client_name, chef_api_client_key, callback) {
  var chef_api_server_url = url.parse('https://' + chef_api_server + '/organizations/' + chef_api_org + '/nodes/' + name);

  var httpsRequestOptions = {
    hostname: chef_api_server_url.host,
    port: chef_api_server_url.port,
    path: chef_api_server_url.path,
    method: 'GET',
    headers: chefInfraAPIHeaders({
      user: chef_api_client_name,
      key: chef_api_client_key,
    },
    {
      hostname: chef_api_server_url.host,
      body: '',
      method: 'GET',
      uri: chef_api_server_url.path,
    }),
  };

  httpsRequest(httpsRequestOptions, '', function(response){
    // console.log(response);
    callback(response);
  });
};

function NodeCreate(name, runlist, chef_api_server, chef_api_org, chef_api_client_name, chef_api_client_key, callback) {
  var chef_api_server_url = url.parse('https://' + chef_api_server + '/organizations/' + chef_api_org + '/nodes');
  var bodyData = {
    name: name,
    json_class: 'Chef::Node',
  };

  // Assign Policy, if specified, otherwise use run-list
  if (runlist.policy_name) {
    bodyData.policy_name = runlist.policy_name;
    bodyData.policy_group = runlist.policy_group;
  } else {
    bodyData.run_list = runlist;
  }

  var httpsRequestOptions = {
    hostname: chef_api_server_url.host,
    port: chef_api_server_url.port || 443,
    path: chef_api_server_url.path,
    method: 'POST',
    headers: chefInfraAPIHeaders({
      user: chef_api_client_name,
      key: chef_api_client_key,
    },
    {
      body: bodyData,
      hostname: chef_api_server_url.host,
      method: 'POST',
      uri: chef_api_server_url.path,
    }),
  };

  httpsRequest(httpsRequestOptions, bodyData, function(response){
    // console.log(response);
    callback(response);
  });
};

function NodeDelete(name, chef_api_server, chef_api_org, chef_api_client_name, chef_api_client_key, callback) {
  var chef_api_server_url = url.parse('https://' + chef_api_server + '/organizations/' + chef_api_org + '/nodes/' + name);

  var httpsRequestOptions = {
    hostname: chef_api_server_url.host,
    port: chef_api_server_url.port,
    path: chef_api_server_url.path,
    method: 'DELETE',
    headers: chefInfraAPIHeaders({
      user: chef_api_client_name,
      key: chef_api_client_key,
    },
    {
      body: '',
      hostname: chef_api_server_url.host,
      method: 'DELETE',
      uri: chef_api_server_url.path,
    }),
  };

  httpsRequest(httpsRequestOptions, '', function(response){
    // console.log(response);
    callback(response);
  });
};

// -------------------------------
// End Chef Infra Server API Functions
// -------------------------------

// handler export for vRA to consume

// Assumes the following are fed as inputs to the action:
// action:        function from app to call
// target:        target object for the function (node, client, etc.)
// target_data:   additional data associated with the target (ex: run_list data for creating a node)
// chef_api_user: user or client name to connect to the Chef Infra Server API
// chef_api_key:  PEM key data for connection associated with chef_api_user
// chef_server:   FQDN of the Chef Infra Server
// chef_org:      target Chef Infra Server organization

exports.handler = (context, inputs, callback) => {
  const action = inputs.action;
  const target = inputs.target;
  const target_data = (inputs.target_data || '');
  const chef_api_user = inputs.chef_api_user;
  const chef_api_key = inputs.chef_api_key;
  const chef_server = inputs.chef_server;
  const chef_org = inputs.chef_org;

  switch (action) {
    case 'ClientCreate':
      callback(ClientCreate(target, chef_server, chef_org, chef_api_user, chef_api_key, function(response) { console.log(JSON.stringify(response)); }));
      break;
    case 'ClientGet':
      callback(ClientGet(target, chef_server, chef_org, chef_api_user, chef_api_key, function(response) { console.log(JSON.stringify(response)); }));
      break;
    case 'ClientDelete':
      callback(ClientDelete(target, chef_server, chef_org, chef_api_user, chef_api_key, function(response) { console.log(JSON.stringify(response)); }));
      break;
    case 'NodeCreate':
      callback(NodeCreate(target, target_data, chef_server, chef_org, chef_api_user, chef_api_key, function(response) { console.log(JSON.stringify(response)); }));
      break;
    case 'NodeGet':
      callback(NodeGet(target, chef_server, chef_org, chef_api_user, chef_api_key, function(response) { console.log(JSON.stringify(response)); }));
      break;
    case 'NodeDelete':
      callback(NodeDelete(target, chef_server, chef_org, chef_api_user, chef_api_key, function(response) { console.log(JSON.stringify(response)); }));
      break;
    default:
      console.log('No matching action' + action);
      break;
  };
};
