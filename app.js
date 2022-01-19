// app.js

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

// Client Functions
// https://docs.chef.io/server/api_chef_server/#clients
exports.ClientGet = function(client, chef_api_server, chef_api_org, chef_api_client_name, chef_api_client_key) {
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

  let data = '';
  var req = https.request(httpsRequestOptions, (res) => {
    res.on('data', chunk => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(JSON.parse(data));
      return JSON.parse(data);
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.end();
};

exports.ClientCreate = function(name, chef_api_server, chef_api_org, chef_api_client_name, chef_api_client_key) {
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

  let data = '';
  var req = https.request(httpsRequestOptions, (res) => {
    res.on('data', chunk => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(JSON.parse(data));
      return JSON.parse(data);
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.write(JSON.stringify(bodyData));

  req.end();
};

exports.ClientDelete = function(name, chef_api_server, chef_api_org, chef_api_client_name, chef_api_client_key) {
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

  let data = '';
  var req = https.request(httpsRequestOptions, (res) => {
    res.on('data', chunk => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(JSON.parse(data));
      return JSON.parse(data);
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.end();
};

// Node functions
// https://docs.chef.io/server/api_chef_server/#nodes
exports.NodeGet = function(name, chef_api_server, chef_api_org, chef_api_client_name, chef_api_client_key) {
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

  let data = '';
  var req = https.request(httpsRequestOptions, (res) => {
    res.on('data', chunk => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(JSON.parse(data));
      return JSON.parse(data);
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.end();
};

exports.NodeCreate = function(name, runlist, chef_api_server, chef_api_org, chef_api_client_name, chef_api_client_key) {
  var chef_api_server_url = url.parse('https://' + chef_api_server + '/organizations/' + chef_api_org + '/clients');
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

  let data = '';
  var req = https.request(httpsRequestOptions, (res) => {
    res.on('data', chunk => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(JSON.parse(data));
      return JSON.parse(data);
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.write(JSON.stringify(bodyData));

  req.end();
};

exports.NodeDelete = function(name, chef_api_server, chef_api_org, chef_api_client_name, chef_api_client_key) {
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

  let data = '';
  var req = https.request(httpsRequestOptions, (res) => {
    res.on('data', chunk => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(JSON.parse(data));
      return JSON.parse(data);
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.end();
};
