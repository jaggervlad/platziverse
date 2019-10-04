# platziver-db

# Usage

```js
const setupDatabase = require('platziver-db')

setupDatabase(config).then( db => {
    const { Agent, Metric } = db

}).catch(err => console.log(err))