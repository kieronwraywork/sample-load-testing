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

export default function () {
  group('visa',function() {

    group('initiate payment', ()=>{
  const res = http.get("http://switchApi:8080/", {
tags:["visa"]
  });

  check(res, { "status was 200": (r) => r.status == 200 });
  sleep(1);
  });
    group('refund payment', ()=>{
  const res = http.get("http://switchApi:8080/345df", );

  check(res, { "status was 200": (r) => r.status == 400 });
  sleep(1);
  });
  
});

group('paypal',function() {
  const res2 = http.get("http://switchApi:8080/weatherforecast", {
    "tags":["paypal"]
  });
  check(res2, { "status was 200": (r) => r.status == 200 });
  sleep(1);
  });
}
