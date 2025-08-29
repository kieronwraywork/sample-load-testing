import http from "k6/http";
import {  group, check, sleep } from "k6";

export const options = {
  scenarios: {
    visa_init: {
      exec: 'visa_init',
      executor: 'externally-controlled',
      duration: '0s', // infintie
      vus: 1,
    },
    visa_capture: {
      exec: 'visa_capture',
      executor: 'externally-controlled',
      duration: '0s', // infintie
      vus: 1,
    },
    visa_refund: {
      exec: 'visa_refund',
      executor: 'externally-controlled',
      duration: '0s', // infintie
      vus: 1,
    },
    visa_error: {
      exec: 'visa_error',
      executor: 'externally-controlled',
      duration: '0s', // infintie
      vus: 1,
    },
  }

};


function sendDummyTransaction(transactionMethod, payload, expectedResponseCode) {


  const res = http.post(`http://switchApi:8080/${transactionMethod}`, payload);

  check(res, { "status was correct": (r) => r.status == expectedResponseCode },);

}
function initiatePayment(cardtype, amount, responseCode, expectedResponseCode = responseCode) {

  var payload = {
    cardtype: cardtype,
    amount: amount,
    responsecode: responseCode
  }
  sendDummyTransaction("initiate", payload, expectedResponseCode);
}
function errorTransaction(cardType) {
  var payload = {
    cardtype: cardType,
    responsecode: 500
  }
  sendDummyTransaction("error", payload,200);
}
function refundPayment(cardtype, amount, transactionId, responseCode, expectedResponseCode = responseCode) {
  var payload = {
    cardtype: cardtype,
    amount: amount,
    transactionId: transactionId,
    responsecode: responseCode
  }
  sendDummyTransaction("refund", payload, expectedResponseCode);
}
function capture (cardtype, amount, transactionId, responseCode, expectedResponseCode = responseCode) {
var payload = {
    cardtype: cardtype,
    amount: amount,
    transactionId: transactionId,
    responsecode: responseCode
  }
  sendDummyTransaction("capture", payload, expectedResponseCode);
}

export function visa_init () {
    const cardType="visa";
    initiatePayment(cardType, Math.random(1,300), 200);
  
}
export function visa_capture() {
const cardType="visa";
    
    capture(cardType,Math.random(1,300),"tx1", 200);

}

export function visa_refund() {
    const cardType="visa";
  
    refundPayment(cardType, Math.random(1,500), "tx1", 200);

  
}
export function visa_error() {
    const cardType="visa";
    
      errorTransaction(cardType);
    
}
