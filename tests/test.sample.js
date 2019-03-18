"use strict";

var expect = require("chai").expect;
var runInLocalSandbox = require("auth0-rules-local-testharness");
var nock = require("nock");
var clone = require("clone");

var defaultUser = {
  email: "first.last@auth0.com",
  email_verified: true,
  name: "Test defaultUser",
  given_name: "Test",
  family_name: "defaultUser",
  created_at: "2019-03-09T09:00.000Z",
  last_login: "2019-03-09T10:00:27.000Z",
  logins_count: 4,
  app_metadata: {}
};

var defaultContext = {
  clientID: "test-client-id",
  clientName: "Test client",
  connection: "Test Connection",
  connectionStrategy: "auth0",
  protocol: "oidc-basic-profile",
  stats: { loginsCount: 1 },
  idToken: {}
};

var configuration = {
  requestBinUrl: "http://requestbin.fullcontact.com/auth0-rule-test"
};

describe("auth0-requestbin", function() {
  var body = {
    user: {
      email: defaultUser.email,
      email_verified: defaultUser.email_verified
    },
    context: {
      clientID: defaultContext.clientID,
      connection: defaultContext.connection,
      stats: defaultContext.stats
    }
  };
  var script = require("fs").readFileSync("./example rules/requestbin.js");

  it("should post to request bin successfully", function(done) {
    var user = clone(defaultUser);
    var context = clone(defaultContext);

    nock(configuration.requestBinUrl)
      .post("", body)
      .reply(200);

    var callback = function(err, response, context) {
      expect(response).to.be.equal(user);
      done(err);
    };

    runInLocalSandbox(script, [user, context, callback], configuration);
  });

  it("should fail to post to request bin", function(done) {
    var user = clone(defaultUser);
    var context = clone(defaultContext);

    nock(configuration.requestBinUrl)
      .post("", body)
      .reply(500);

    var callback = function(err, response, context) {
      expect(err).to.be.null;
      done();
    };

    runInLocalSandbox(script, [user, context, callback], configuration);
  });
});

describe("add-dept-to-token", function() {
  var script = require("fs").readFileSync(
    "./example rules/add-dept-to-token.js"
  );

  it("should add dept claim", function(done) {
    var user = clone(defaultUser);
    var context = clone(defaultContext);

    user.app_metadata = {
      department: "IT"
    };

    var callback = function(err, response, context) {
      expect(context.idToken["https://namespace.com/dept"]).to.equal(
        "IT",
        "Department claim should be set to IT"
      );
      done();
    };

    runInLocalSandbox(script, [user, context, callback], {
      configuration
    });
  });

  it("should not add dept claim", function(done) {
    var user = clone(defaultUser);
    var context = clone(defaultContext);

    var callback = function(err, response, context) {
      expect(context.idToken["https://namespace.com/dept"]).to.be.an(
        "undefined"
      );
      done();
    };

    runInLocalSandbox(script, [user, context, callback], configuration);
  });
});
