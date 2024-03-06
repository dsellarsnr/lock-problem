# Usage

```
npm install
./stress.sh
```

This will start 4 parallel process that attempt to write a uuid to file inside of a lock from proper-lock file. 
Results on my mac are slower than expected - up to 7 seconds to acquire a lock.


```
2024-03-06T19:27:15.514Z  started
2024-03-06T19:27:15.514Z 4 waiting for lock
2024-03-06T19:27:15.515Z  started
2024-03-06T19:27:15.515Z  started
2024-03-06T19:27:15.515Z 1 waiting for lock
2024-03-06T19:27:15.515Z 2 waiting for lock
2024-03-06T19:27:15.515Z  started
2024-03-06T19:27:15.516Z 3 waiting for lock
2024-03-06T19:27:15.517Z 4 lock acquired - wait time: 3ms
2024-03-06T19:27:15.517Z 4 lock released - lock held for 0ms
2024-03-06T19:27:15.517Z 4 clientUuid: fa711a27-aeea-434d-ac66-76e8a4db38ca total time: 3ms
2024-03-06T19:27:16.518Z 1 lock acquired - wait time: 1003ms
2024-03-06T19:27:16.520Z 1 lock released - lock held for 2ms
2024-03-06T19:27:16.520Z 1 clientUuid: fa711a27-aeea-434d-ac66-76e8a4db38ca total time: 1005ms
2024-03-06T19:27:18.521Z 3 lock acquired - wait time: 3005ms
2024-03-06T19:27:18.523Z 3 lock released - lock held for 2ms
2024-03-06T19:27:18.523Z 3 clientUuid: fa711a27-aeea-434d-ac66-76e8a4db38ca total time: 3007ms
2024-03-06T19:27:22.523Z 2 lock acquired - wait time: 7008ms
2024-03-06T19:27:22.525Z 2 lock released - lock held for 2ms
2024-03-06T19:27:22.525Z 2 clientUuid: fa711a27-aeea-434d-ac66-76e8a4db38ca total time: 7010ms
```
