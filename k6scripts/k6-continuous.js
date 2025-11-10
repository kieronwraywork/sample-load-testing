import http from "k6/http";
import { group, check, sleep, fail } from "k6";
import { Trend } from "k6/metrics";

const errorTrends = {
  visa_errors: new Trend('visa_errors_trend', false),
  visa_money: new Trend('visa_money_trend', false),
  mastercard_errors: new Trend('mastercard_errors_trend', false),
  amex_errors: new Trend('amex_errors_trend', false),
  discover_errors: new Trend('discover_errors_trend', false),
  paypal_errors: new Trend('paypal_errors_trend', false)

};
const TestDuration = '20s';
const Infinite_tests = false;
const TestExecutor = Infinite_tests ? 'externally-controlled' : 'constant-vus';
// see https://sii.pl/blog/en/performance-under-control-with-k6-additional-configurations-types-of-scenario-models-and-executors/

export const options = {
  scenarios: {
    visa_init: {
      exec: 'visa_init',
      executor: TestExecutor,
      duration: TestDuration,
      vus: 2,
    },
    visa_capture: {
      exec: 'visa_capture',
      executor: TestExecutor,
      duration: TestDuration,
      vus: 1,
    },
    visa_refund: {
      exec: 'visa_refund',
      executor: TestExecutor,
      duration: TestDuration,
      vus: 1,
    },
    visa_error: {
      exec: 'visa_error',
      executor: TestExecutor,
      duration: '1s',
      vus: 1,
    },
    paypal_error: {
      exec: 'paypal_error_zz',
      executor: TestExecutor,
      duration: TestDuration,
      vus: 1,
    },
  }

};

/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @param obj1
 * @param obj2
 * @returns obj3 a new object based on obj1 and obj2
 */
function merge_options(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}

function sendDummyTransaction(errors, transactionMethod, payload, expectedResponseCode, additionaltags) {

  let defaulttags = { name: transactionMethod };
  let tags = merge_options(defaulttags, additionaltags);
  let params = {
    headers: { 'Content-Type': 'application/json' },
    tags: tags
  }
  const res = http.post(`http://switchApi:8080/${transactionMethod}`, JSON.stringify(payload), params);


  const status = check(res, { "status was correct": (r) => r.status == expectedResponseCode });
  assert(res, status, errors, transactionMethod)

}
function assert(response, check, errors, name) {
  // https://sii.pl/blog/en/performance-under-control-with-k6-docker-and-integration-with-influxdb-and-grafana/
  // capture errors
  if (!check) {
    const responseBody = JSON.stringify(response.body).slice(0, 5000)
    const requestBody = JSON.stringify(response.request.body).slice(0, 5000)

    errors.add(true, {
      name: name,
      error_code: response.error_code,
      request_headers: JSON.stringify(response.request.headers),
      request_cookies: JSON.stringify(response.request.cookies),
      request_method: response.request.method,
      request_body: requestBody,
      response_body: responseBody,
      response_headers: JSON.stringify(response.headers),
      response_status: response.status,

      response_cookies: JSON.stringify(response.cookies)

    })
    fail("Assertion failed")
  }
}
function initiatePayment(errors, cardtype, amount, responseCode, expectedResponseCode = responseCode) {

  var payload = {
    cardtype: cardtype,
    amount: amount,
    responsecode: responseCode
  }
  sendDummyTransaction(errors, "initiate", payload, expectedResponseCode, { cardType: cardtype , amount: amount , name: "initiatePayment"});
}
function errorTransaction(errors, cardtype) {


  var payload = {
    cardtype: cardtype,
    responsecode: 500
  }
  sendDummyTransaction(errors, "error", payload, 500, payload.responsecode, { cardType: cardtype  });
}
function refundPayment(errors, cardtype, amount, transactionId, responseCode, expectedResponseCode = responseCode) {

  var payload = {
    cardtype: cardtype,
    amount: amount,
    transactionId: transactionId,
    responsecode: responseCode
  }
  sendDummyTransaction(errors, "refund", payload, expectedResponseCode, { cardType: cardtype , amount: amount });
}
function capture(errors, cardtype, amount, transactionId, responseCode, expectedResponseCode = responseCode) {

  var payload = {
    cardtype: cardtype,
    amount: amount,
    transactionId: transactionId,
    responsecode: responseCode
  }
  sendDummyTransaction(errors, "capture", payload, expectedResponseCode, { cardType: cardtype , amount: amount });
}

export function visa_init() {

  const cardType = "visa";
  let errors = errorTrends.visa_errors;
  const amount = Math.random(1, 300);
  initiatePayment(errors, cardType, amount, 200);
  errorTrends.visa_money.add(amount, { cardType: cardType });

}
export function visa_capture() {


  const cardType = "visa";
  let errors = errorTrends.visa_errors;
  const amount = Math.random(1, 300);
  capture(errors, cardType, amount, "tx1", 200);
  errorTrends.visa_money.add(amount, { cardType: cardType });
}

export function visa_refund() {

  const cardType = "visa";
  let errors = errorTrends.visa_errors;
  const amount = Math.random(1, 500);
  refundPayment(errors, cardType, amount, "tx1", 200);

  errorTrends.visa_money.add(amount * -1, { cardType: cardType });

}
export function visa_error() {

  const cardType = "visa";
  let errors = errorTrends.visa_errors;
  errorTransaction(errors, cardType);

}

export function paypal_error_zz() {

  const cardType = "paypal";
  let errors = errorTrends.paypal_errors;
  errorTransaction(errors, cardType);

}
