import http from "k6/http";
import { group, check, sleep } from "k6";

export const options = {
  scenarios: {
    
    default: {
      executor: 'externally-controlled',
      duration: '0s', // infintie
      vus: 1,

      // stages: [
      //   { duration: "30s", target: 20 },
      //   { duration: "1m30s", target: 10 },
      //   { duration: "20s", target: 0 },
      // ],
    }
  },


};


function sendDummyTransaction(transactionMethod, payload, expectedResponseCode) {


  const res = http.post(`http://switchApi:8080/${transactionMethod}`, payload);

  check(res, { "status was correct": (r) => r.status == expectedResponseCode });

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
export default function () {
  group('visa', function () {

    const cardType="visa";
    initiatePayment(cardType, Math.random(1,300), 200);
    
    capture(cardType,Math.random(1,300),"tx1", 200);

    refundPayment(cardType, Math.random(1,500), "tx1", 200);

    if(Math.random(1,10)>0) {
      errorTransaction(cardType);
    }
  });

group('paypal', function () {

    const cardType="paypal";
    initiatePayment(cardType, Math.random(1,30), 200);
    
    capture(cardType,Math.random(1,30),"tx1", 200);

    refundPayment(cardType, Math.random(1,5), "tx1", 200);
    if(Math.random(1,10)>=9) {
      errorTransaction(cardType);
    }
  });

  group('pisp', function () {

    const cardType="pisp";
    initiatePayment(cardType, Math.random(1,30), 200);
    
    capture(cardType,Math.random(1,30),"tx1", 200);

    refundPayment(cardType, Math.random(1,5), "tx1", 200);
    if(Math.random(1,10)>=3) {
      errorTransaction(cardType);
    }

  });

}
