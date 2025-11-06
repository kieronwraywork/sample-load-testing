import http from "k6/http";
import { group, check, sleep, fail } from "k6";
import { Trend } from "k6/metrics";

const errorTrends = {
  visa_errors: new Trend('visa_errors'),
  mastercard_errors: new Trend('mastercard_errors'),
  amex_errors: new Trend('amex_errors'),
  discover_errors: new Trend('discover_errors'),

};
const TestDuration='1s';
const Infinite_tests=false;
const TestExecutor=Infinite_tests ? 'externally-controlled' : 'constant-vus';
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
      duration: TestDuration,
      vus: 1,
    },
    paypal_error: {
      exec: 'paypal_errorzz',
      executor: TestExecutor,
      duration: TestDuration,
      vus: 1,
    },
  }

};


function sendDummyTransaction(errors, transactionMethod, payload, expectedResponseCode) {


  const res = http.post(`http://switchApi:8080/${transactionMethod}`,JSON.stringify( payload));

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
  sendDummyTransaction(errors, "initiate", payload, expectedResponseCode);
}
function errorTransaction(errors, cardType) {


  var payload = {
    cardtype: cardType,
    responsecode: 500
  }
  sendDummyTransaction(errors, "error", payload, 200, 415);
}
function refundPayment(errors, cardtype, amount, transactionId, responseCode, expectedResponseCode = responseCode) {

  var payload = {
    cardtype: cardtype,
    amount: amount,
    transactionId: transactionId,
    responsecode: responseCode
  }
  sendDummyTransaction(errors, "refund", payload, expectedResponseCode);
}
function capture(errors, cardtype, amount, transactionId, responseCode, expectedResponseCode = responseCode) {

  var payload = {
    cardtype: cardtype,
    amount: amount,
    transactionId: transactionId,
    responsecode: responseCode
  }
  sendDummyTransaction(errors, "capture", payload, expectedResponseCode);
}

export function visa_init() {

  const cardType = "visa";
  let errors = errorTrends.visa_errors;
  initiatePayment(errors, cardType, Math.random(1, 300), 200);

}
export function visa_capture() {


  const cardType = "visa";
  let errors = errorTrends.visa_errors;
  capture(errors, cardType, Math.random(1, 300), "tx1", 200);

}

export function visa_refund() {

  const cardType = "visa";
  let errors = errorTrends.visa_errors;
  refundPayment(errors, cardType, Math.random(1, 500), "tx1", 200);


}
export function visa_error() {

  const cardType = "visa";
  let errors = errorTrends.visa_errors;
  errorTransaction(errors, cardType);

}

export function paypal_error_zz() {

  const cardType = "paypal";
  let errors = errorTrends.visa_errors;
  errorTransaction(errors, cardType);

}
