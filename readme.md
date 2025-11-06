# Sample Load Testing

This example application hosts the following services:

| _Service_  | Port                  | _Notes_                                                   |
| ---------- | --------------------- | --------------------------------------------------------- |
| Grafana    | http://localhost:3111 | Dashboards and charts (admin:admin)                       |
| pg_grafana |                       | Postgres to hold grafana configuration                    |
| Prometheus | http://localhost:9090 | Prometheus sink for the sample aplicaiton metrics         |
| switchApi  | http://localhost:9000 | Simple .netcore webapi to react to the load test (only needed if you dont have a real api to fire the tests against)          |
| influxdb   |                       | Database to hold k6 results                               |
| k6         |                       | K6 load test host, running the tests from k6scripts/\*.js |

On startup the grafana main_dashboard will be created pointing to prometheus with a sample request duration per route from the switchApi

# Datasources imported into grafana

- InfluxDb
- Prometheus

# Dashboards created by default

| Dashboard          | Notes                                                                        |
| ------------------ | ---------------------------------------------------------------------------- |
| local perf testing | contains the default grafs (starts with avg response time for all endpoints) |

# Useful folders

| Folder               | notes                                                     | external refs                                                 |
| -------------------- | --------------------------------------------------------- | ------------------------------------------------------------- |
| grafana/provisioning | grafana startup, add more dashboards and datasources here | https://community.grafana.com/t/data-source-on-startup/8618/2 |
| k6scripts            | add more k6 test scripts here                             | https://grafana.com/docs/k6/latest/get-started/running-k6/    |

# Pre-requisites
1. Rancher Desktop installed and running
2. VSCode
3. Optional, npm to help debug your JS test scripts

# Getting started
1. Ensure rancher-desktop is running
2. on command line `docker compose up` this will start the switch api, grafana, databases and k6 and run the tests
3. once things are up and running, navigate to grafana url `http://localhost:3111` with uid+pwd admin (SKIP resetting the password) and open the dashboard

See the faq below

# FAQ

## TIP Speed up test cycle for debugging tests / trends / etc
To speed up the cycle time for debugging your tests, only start up the components you need, for example:
`docker compose up k6 switchApi` will start k6 (so your tests will run) and only the api, you wont have to wait for grafana/etc to start up

## How do i add more tests

1. Add more tests by editing `k6scripts/*.js` files
2. Ensure the correct JS file will be run, by editing the line in the `docker-compose.yaml` file to call the correct script (in the example below, replace "/k6-tests/k6-continuous.js" with your test script)
`command: [ "run", "/k6-tests/k6-continuous.js", "--out", "experimental-prometheus-rw" ]`

## How do i clean up old data
run `docker compose down -v` this will delete all the persisted data in the volumes/etc

# Useful links
https://medium.com/@nayani.shashi8/working-with-external-files-and-environment-variables-in-k6-1a10e571aee3

# how do i configure prometheus
https://dev.to/leading-edje/open-source-load-testing-with-k6-docker-prometheus-and-grafana-5ej6
